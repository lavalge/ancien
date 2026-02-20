/* ============================================================
   OK CUISINE — Module Couverts / Prediction Frequentation
   Suivi quotidien du nombre de couverts servis, prevision
   de frequentation basee sur l'historique par jour de semaine
   ============================================================ */

const Couverts = {
    selectedDate: null,

    init() {
        this.selectedDate = Storage.today();
    },

    // ==================== RENDU PRINCIPAL ====================

    render() {
        const page = document.getElementById('page-couverts');
        const today = Storage.today();
        const prediction = this.getPrediction(today);
        const todayRecord = Storage.getCouverts(today);
        const role = App.currentUser?.role;
        const canEditPrevision = (role === 'admin' || role === 'gestionnaire');

        // Donnees pour les stats
        const statsData = this._computeStats();

        // Historique 14 derniers jours
        const historiqueData = this._getHistorique(14);

        // Donnees pour le graphique (7 derniers jours)
        const chartData = this._getHistorique(7);

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83C\uDF7D\uFE0F Suivi des Couverts</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Couverts.showAddModal()">
                        + Enregistrer couverts
                    </button>
                    ${canEditPrevision ? `
                        <button class="btn btn-secondary" onclick="Couverts.showPrevisionModal()">
                            \uD83D\uDCCA Modifier prevision
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Carte aujourd'hui -->
            <div class="card" style="border-left:4px solid var(--primary);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCC5 Aujourd'hui \u2014 ${Storage.formatDate(today)}</span>
                </div>
                <div style="padding:0.5rem 0;">
                    <div style="font-size:1.3rem;font-weight:600;color:var(--text-primary);margin-bottom:0.5rem;">
                        Prevision aujourd'hui : ~${prediction !== null ? prediction : '?'} couverts
                    </div>
                    ${prediction === null ? `
                        <p style="font-size:0.85rem;color:var(--text-muted);">
                            Pas assez de donnees pour une prevision (minimum 2 semaines d'historique)
                        </p>
                    ` : ''}
                    ${todayRecord ? `
                        <div style="margin-top:0.75rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                            <span class="badge badge-success" style="font-size:1rem;padding:0.4rem 0.8rem;">
                                Reel : ${todayRecord.couverts_reels} couverts (${todayRecord.service === 'soir' ? 'Soir' : 'Midi'})
                            </span>
                            ${prediction !== null && todayRecord.couverts_reels !== null ? `
                                <span class="badge ${Math.abs(todayRecord.couverts_reels - prediction) <= prediction * 0.1 ? 'badge-success' : 'badge-warning'}">
                                    Ecart : ${todayRecord.couverts_reels - prediction > 0 ? '+' : ''}${todayRecord.couverts_reels - prediction}
                                </span>
                            ` : ''}
                        </div>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">
                            Enregistre par ${UI.escapeHTML(todayRecord.user)} a ${Storage.formatTime(todayRecord.timestamp)}
                        </div>
                    ` : `
                        <p style="font-size:0.9rem;color:var(--warning);margin-top:0.5rem;">
                            \u23F3 Couverts reels non encore enregistres
                        </p>
                    `}
                </div>
            </div>

            <!-- Statistiques -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Moyenne cette semaine</div>
                    <div class="stat-value">${statsData.moyenneSemaine !== null ? statsData.moyenneSemaine : '\u2014'}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">couverts / jour</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Moyenne ce mois</div>
                    <div class="stat-value">${statsData.moyenneMois !== null ? statsData.moyenneMois : '\u2014'}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">couverts / jour</div>
                </div>
                ${prediction !== null && todayRecord ? `
                    <div class="stat-card ${Math.abs(todayRecord.couverts_reels - prediction) <= prediction * 0.15 ? 'success' : 'warning'}">
                        <div class="stat-label">Prevision vs Reel</div>
                        <div class="stat-value">${prediction} / ${todayRecord.couverts_reels}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">
                            ecart ${todayRecord.couverts_reels - prediction > 0 ? '+' : ''}${todayRecord.couverts_reels - prediction}
                        </div>
                    </div>
                ` : `
                    <div class="stat-card info">
                        <div class="stat-label">Prevision vs Reel</div>
                        <div class="stat-value">\u2014</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">pas de donnees</div>
                    </div>
                `}
            </div>

            <!-- Graphique barres 7 derniers jours -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCA Couverts \u2014 7 derniers jours</span>
                </div>
                ${this._renderBarChart(chartData)}
            </div>

            <!-- Historique 14 jours -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Historique \u2014 14 derniers jours</span>
                </div>
                ${this._renderHistoriqueTable(historiqueData)}
            </div>
        `;
    },

    // ==================== STATISTIQUES ====================

    _computeStats() {
        const today = new Date(Storage.today() + 'T00:00:00');

        // Debut de la semaine (lundi)
        const jourSemaine = today.getDay();
        const decalage = jourSemaine === 0 ? 6 : jourSemaine - 1;
        const debutSemaine = new Date(today);
        debutSemaine.setDate(today.getDate() - decalage);

        // Debut du mois
        const debutMois = new Date(today.getFullYear(), today.getMonth(), 1);

        const debutSemaineStr = this._formatDateISO(debutSemaine);
        const debutMoisStr = this._formatDateISO(debutMois);
        const todayStr = Storage.today();

        const recordsSemaine = Storage.getCouvertsRange(debutSemaineStr, todayStr);
        const recordsMois = Storage.getCouvertsRange(debutMoisStr, todayStr);

        const reelsSemaine = recordsSemaine.filter(r => r.couverts_reels !== null && r.couverts_reels !== undefined);
        const reelsMois = recordsMois.filter(r => r.couverts_reels !== null && r.couverts_reels !== undefined);

        let moyenneSemaine = null;
        if (reelsSemaine.length > 0) {
            const total = reelsSemaine.reduce((sum, r) => sum + r.couverts_reels, 0);
            moyenneSemaine = Math.round(total / reelsSemaine.length);
        }

        let moyenneMois = null;
        if (reelsMois.length > 0) {
            const total = reelsMois.reduce((sum, r) => sum + r.couverts_reels, 0);
            moyenneMois = Math.round(total / reelsMois.length);
        }

        return { moyenneSemaine, moyenneMois };
    },

    _getHistorique(nbJours) {
        const today = new Date(Storage.today() + 'T00:00:00');
        const debut = new Date(today);
        debut.setDate(today.getDate() - (nbJours - 1));

        const debutStr = this._formatDateISO(debut);
        const todayStr = Storage.today();
        const records = Storage.getCouvertsRange(debutStr, todayStr);

        // Construire un tableau jour par jour
        const jours = [];
        const joursNoms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        for (let i = 0; i < nbJours; i++) {
            const d = new Date(debut);
            d.setDate(debut.getDate() + i);
            const dateStr = this._formatDateISO(d);
            const record = records.find(r => r.date === dateStr) || null;
            const prediction = this.getPrediction(dateStr);

            jours.push({
                date: dateStr,
                jourNom: joursNoms[d.getDay()],
                jourSemaine: d.getDay(),
                couverts_prevus: record ? record.couverts_prevus : prediction,
                couverts_reels: record ? record.couverts_reels : null,
                record: record
            });
        }

        return jours;
    },

    // ==================== GRAPHIQUE BARRES ====================

    _renderBarChart(data) {
        const reels = data.map(d => d.couverts_reels).filter(v => v !== null && v !== undefined);
        if (reels.length === 0) {
            return UI.emptyState('\uD83D\uDCCA', 'Aucune donnee pour afficher le graphique');
        }

        const maxVal = Math.max(...reels, 1);

        let barsHTML = '';
        for (const jour of data) {
            const val = jour.couverts_reels;
            const hauteur = val !== null && val !== undefined ? Math.max(4, Math.round((val / maxVal) * 120)) : 0;
            const label = jour.jourNom.substring(0, 3);
            const dateLabel = jour.date.substring(5);

            barsHTML += `
                <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:40px;">
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem;">
                        ${val !== null && val !== undefined ? val : ''}
                    </div>
                    <div style="width:70%;max-width:40px;height:${hauteur}px;background:var(--primary);border-radius:4px 4px 0 0;transition:height 0.3s ease;${val === null || val === undefined ? 'background:var(--bg-card);border:1px dashed var(--text-muted);' : ''}"></div>
                    <div style="font-size:0.75rem;font-weight:600;margin-top:0.25rem;color:var(--text-primary);">${label}</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);">${dateLabel}</div>
                </div>
            `;
        }

        return `
            <div style="display:flex;align-items:flex-end;gap:0.25rem;padding:1rem 0.5rem;min-height:180px;">
                ${barsHTML}
            </div>
        `;
    },

    // ==================== TABLEAU HISTORIQUE ====================

    _renderHistoriqueTable(data) {
        if (data.length === 0) {
            return UI.emptyState('\uD83D\uDCCB', 'Aucun historique disponible');
        }

        let rows = '';
        for (const jour of data.slice().reverse()) {
            const prevus = jour.couverts_prevus !== null && jour.couverts_prevus !== undefined ? jour.couverts_prevus : '\u2014';
            const reels = jour.couverts_reels !== null && jour.couverts_reels !== undefined ? jour.couverts_reels : '\u2014';
            let diff = '\u2014';
            let diffClass = '';

            if (jour.couverts_prevus !== null && jour.couverts_prevus !== undefined &&
                jour.couverts_reels !== null && jour.couverts_reels !== undefined) {
                const ecart = jour.couverts_reels - jour.couverts_prevus;
                diff = (ecart > 0 ? '+' : '') + ecart;
                diffClass = Math.abs(ecart) <= jour.couverts_prevus * 0.1 ? 'status-ok' : 'status-warning';
            }

            const isToday = jour.date === Storage.today();

            rows += `
                <tr${isToday ? ' style="background:var(--bg-highlight, rgba(var(--primary-rgb, 59,130,246),0.08));"' : ''}>
                    <td>${jour.date.substring(5)}</td>
                    <td>${jour.jourNom}</td>
                    <td>${prevus}</td>
                    <td><strong>${reels}</strong></td>
                    <td class="${diffClass}">${diff}</td>
                </tr>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Jour</th>
                            <th>Prevus</th>
                            <th>Reels</th>
                            <th>Ecart</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // ==================== PREDICTION ====================

    getPrediction(date) {
        const d = new Date(date + 'T00:00:00');
        const jourCible = d.getDay();

        // Chercher les 8 dernieres semaines de donnees pour ce jour
        const records = [];
        for (let semaine = 1; semaine <= 8; semaine++) {
            const datePassee = new Date(d);
            datePassee.setDate(d.getDate() - (semaine * 7));
            const dateStr = this._formatDateISO(datePassee);
            const record = Storage.getCouverts(dateStr);
            if (record && record.couverts_reels !== null && record.couverts_reels !== undefined) {
                records.push(record.couverts_reels);
            }
        }

        // Il faut au moins 2 semaines de donnees
        if (records.length < 2) {
            return null;
        }

        const total = records.reduce((sum, val) => sum + val, 0);
        return Math.round(total / records.length);
    },

    getAverages() {
        const moyennes = {};
        const joursNoms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        // Analyser les 8 dernieres semaines
        const today = new Date(Storage.today() + 'T00:00:00');
        const debut = new Date(today);
        debut.setDate(today.getDate() - 56); // 8 semaines

        const debutStr = this._formatDateISO(debut);
        const todayStr = Storage.today();
        const records = Storage.getCouvertsRange(debutStr, todayStr);

        // Grouper par jour de la semaine
        const parJour = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

        for (const record of records) {
            if (record.couverts_reels === null || record.couverts_reels === undefined) continue;
            const d = new Date(record.date + 'T00:00:00');
            const jour = d.getDay();
            parJour[jour].push(record.couverts_reels);
        }

        for (let jour = 0; jour < 7; jour++) {
            const vals = parJour[jour];
            moyennes[joursNoms[jour]] = vals.length > 0
                ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
                : null;
        }

        return moyennes;
    },

    // ==================== MODAL ENREGISTREMENT ====================

    showAddModal() {
        const today = Storage.today();
        const prediction = this.getPrediction(today);
        const todayRecord = Storage.getCouverts(today);

        const body = `
            ${prediction !== null ? `
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;margin-bottom:1rem;">
                    <span style="color:var(--text-secondary);">Prevision pour aujourd'hui :</span>
                    <strong style="color:var(--primary);font-size:1.1rem;margin-left:0.5rem;">~${prediction} couverts</strong>
                </div>
            ` : ''}
            ${todayRecord ? `
                <div style="background:var(--bg-card);border:1px solid var(--warning);border-radius:var(--radius-sm);padding:0.75rem;margin-bottom:1rem;">
                    <span style="color:var(--warning);">\u26A0\uFE0F Un enregistrement existe deja pour aujourd'hui (${todayRecord.couverts_reels} couverts). Il sera mis a jour.</span>
                </div>
            ` : ''}
            <div class="form-group">
                <label>Service</label>
                <select class="form-control form-control-lg" id="couv-service">
                    <option value="midi"${todayRecord && todayRecord.service === 'midi' ? ' selected' : ''}>Midi</option>
                    <option value="soir"${todayRecord && todayRecord.service === 'soir' ? ' selected' : ''}>Soir</option>
                </select>
            </div>
            <div class="form-group">
                <label>Nombre de couverts</label>
                <input type="number" class="form-control form-control-lg" id="couv-nombre"
                       placeholder="Ex: 85" min="0" step="1"
                       value="${todayRecord ? todayRecord.couverts_reels : ''}" autofocus>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" class="form-control" id="couv-date" value="${today}">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Couverts.saveFromModal()">Enregistrer</button>
        `;

        UI.openModal('Enregistrer les couverts', body, footer);
    },

    saveFromModal() {
        const service = document.getElementById('couv-service').value;
        const nombre = parseInt(document.getElementById('couv-nombre').value, 10);
        const date = document.getElementById('couv-date').value;

        if (isNaN(nombre) || nombre < 0) {
            UI.toast('Entrez un nombre de couverts valide', 'warning');
            return;
        }

        if (!date) {
            UI.toast('Selectionnez une date', 'warning');
            return;
        }

        const existant = Storage.getCouverts(date);

        if (existant) {
            // Mise a jour
            Storage.updateCouverts(date, {
                couverts_reels: nombre,
                service: service,
                user: App.currentUser?.nom || 'Inconnu',
                timestamp: new Date().toISOString()
            });
            Journal.log('couverts', `Couverts mis a jour: ${nombre} couverts (${service}) le ${date}`, { date, nombre, service });
            UI.toast(`Couverts mis a jour : ${nombre} (${service})`, 'success');
        } else {
            // Nouveau
            const prediction = this.getPrediction(date);
            Storage.addCouverts({
                date: date,
                couverts_prevus: prediction,
                couverts_reels: nombre,
                service: service
            });
            Journal.log('couverts', `Couverts enregistres: ${nombre} couverts (${service}) le ${date}`, { date, nombre, service });
            UI.toast(`Couverts enregistres : ${nombre} (${service})`, 'success');
        }

        UI.closeModal();
        this.render();
    },

    // ==================== MODAL PREVISION (admin / gestionnaire) ====================

    showPrevisionModal() {
        const role = App.currentUser?.role;
        if (role !== 'admin' && role !== 'gestionnaire') {
            UI.toast('Acces reserve aux administrateurs et gestionnaires', 'warning');
            return;
        }

        const today = Storage.today();
        const todayRecord = Storage.getCouverts(today);
        const predictionAuto = this.getPrediction(today);

        const body = `
            <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;margin-bottom:1rem;">
                <span style="color:var(--text-secondary);">Prevision automatique :</span>
                <strong style="color:var(--primary);margin-left:0.5rem;">${predictionAuto !== null ? '~' + predictionAuto + ' couverts' : 'Pas assez de donnees'}</strong>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" class="form-control" id="prev-date" value="${today}"
                       onchange="Couverts._updatePrevisionInfo()">
            </div>
            <div class="form-group">
                <label>Prevision manuelle (nombre de couverts)</label>
                <input type="number" class="form-control form-control-lg" id="prev-nombre"
                       placeholder="Ex: 90" min="0" step="1"
                       value="${todayRecord && todayRecord.couverts_prevus !== null ? todayRecord.couverts_prevus : ''}" autofocus>
            </div>
            <p id="prev-info" style="font-size:0.85rem;color:var(--text-muted);">
                Cette valeur remplacera la prevision automatique pour la date selectionnee.
            </p>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Couverts.savePrevision()">Enregistrer</button>
        `;

        UI.openModal('Modifier la prevision', body, footer);
    },

    _updatePrevisionInfo() {
        const date = document.getElementById('prev-date').value;
        if (!date) return;
        const prediction = this.getPrediction(date);
        const info = document.getElementById('prev-info');
        if (info) {
            info.textContent = prediction !== null
                ? `Prevision automatique pour cette date : ~${prediction} couverts`
                : 'Pas assez de donnees pour une prevision automatique';
        }
    },

    savePrevision() {
        const date = document.getElementById('prev-date').value;
        const nombre = parseInt(document.getElementById('prev-nombre').value, 10);

        if (!date) {
            UI.toast('Selectionnez une date', 'warning');
            return;
        }

        if (isNaN(nombre) || nombre < 0) {
            UI.toast('Entrez un nombre de couverts valide', 'warning');
            return;
        }

        const existant = Storage.getCouverts(date);

        if (existant) {
            Storage.updateCouverts(date, {
                couverts_prevus: nombre
            });
        } else {
            Storage.addCouverts({
                date: date,
                couverts_prevus: nombre,
                couverts_reels: null,
                service: 'midi'
            });
        }

        Journal.log('couverts', `Prevision modifiee: ${nombre} couverts pour le ${date}`, { date, nombre });
        UI.toast(`Prevision enregistree : ${nombre} couverts pour le ${date}`, 'success');
        UI.closeModal();
        this.render();
    },

    // ==================== HELPERS ====================

    _formatDateISO(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
};
