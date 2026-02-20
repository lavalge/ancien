/* ============================================================
   OK CUISINE — Module Gaspillage Alimentaire
   Suivi et analyse du gaspillage alimentaire conforme a la
   loi AGEC (loi n°2020-105) — diagnostic, pesees, statistiques,
   objectif de reduction de 50% (reference ADEME 120 g/couvert)
   ============================================================ */

const Gaspillage = {
    selectedDate: null,
    REFERENCE_NATIONALE: 120, // g/couvert — moyenne ADEME restauration collective

    init() {
        this.selectedDate = Storage.today();
    },

    // ==================== RENDER ====================

    render() {
        const page = document.getElementById('page-gaspillage');
        const today = Storage.today();
        const records = Storage.getGaspillage(this.selectedDate);

        // Stats pour les cartes
        const statsJour = this._calcStats(records);
        const statsSemaine = this.getStats('week');
        const statsMois = this.getStats('month');

        // Donnees graphique 7 derniers jours
        const chartData = this._getChartData();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\u267B\uFE0F Suivi Anti-Gaspillage</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Gaspillage.showAddModal()">
                        + Enregistrer pesee
                    </button>
                    <button class="btn btn-secondary" onclick="PDF.export('gaspillage')">
                        \uD83D\uDCC4 Exporter PDF rapport
                    </button>
                </div>
            </div>

            <!-- Rappel reglementaire -->
            <div class="card" style="border-left:4px solid var(--primary);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">\u2696\uFE0F Obligation reglementaire</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Loi AGEC</strong> (loi n\u00B02020-105) \u2014 Objectif : reduction de <strong>50%</strong> du gaspillage
                    alimentaire d'ici 2025 (par rapport a 2015). Obligation de diagnostic et plan d'action
                    pour la restauration collective. Reference nationale ADEME : <strong>${this.REFERENCE_NATIONALE} g/couvert</strong>.
                </p>
            </div>

            <!-- Filtre date -->
            <div class="date-filter">
                <label>Date :</label>
                <input type="date" class="form-control" value="${this.selectedDate}"
                       onchange="Gaspillage.changeDate(this.value)" style="width:auto;">
                <span style="color:var(--text-muted);margin-left:0.5rem;">${Storage.formatDate(this.selectedDate)}</span>
            </div>

            <!-- Statistiques -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card ${this._getColorClass(statsJour.moyenne_g_couvert)}">
                    <div class="stat-label">Aujourd'hui</div>
                    <div class="stat-value">${statsJour.moyenne_g_couvert !== null ? statsJour.moyenne_g_couvert + ' g/couv.' : '\u2014'}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">
                        ${statsJour.nb_mesures} pesee(s) \u2014 ${statsJour.total_kilos.toFixed(1)} kg
                    </div>
                </div>
                <div class="stat-card ${this._getColorClass(statsSemaine.moyenne_g_couvert)}">
                    <div class="stat-label">Moyenne semaine</div>
                    <div class="stat-value">${statsSemaine.moyenne_g_couvert !== null ? statsSemaine.moyenne_g_couvert + ' g/couv.' : '\u2014'}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">
                        ${statsSemaine.nb_mesures} pesee(s) \u2014 ${statsSemaine.total_kilos.toFixed(1)} kg
                    </div>
                </div>
                <div class="stat-card ${this._getColorClass(statsMois.moyenne_g_couvert)}">
                    <div class="stat-label">Moyenne mois</div>
                    <div class="stat-value">${statsMois.moyenne_g_couvert !== null ? statsMois.moyenne_g_couvert + ' g/couv.' : '\u2014'}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">
                        ${statsMois.nb_mesures} pesee(s) \u2014 ${statsMois.total_kilos.toFixed(1)} kg
                    </div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Ref. nationale (ADEME)</div>
                    <div class="stat-value">${this.REFERENCE_NATIONALE} g/couv.</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">
                        Objectif : &lt; ${this.REFERENCE_NATIONALE / 2} g/couv. (loi AGEC)
                    </div>
                </div>
            </div>

            <!-- Graphique 7 derniers jours -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCA Gaspillage des 7 derniers jours (g/couvert)</span>
                </div>
                ${this._renderChart(chartData)}
            </div>

            <!-- Historique du jour -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Pesees du jour</span>
                    <span class="badge badge-info">${records.length}</span>
                </div>
                ${this._renderTable(records)}
            </div>
        `;
    },

    // ==================== COULEUR SELON SEUIL ====================

    _getColorClass(gParCouvert) {
        if (gParCouvert === null) return 'info';
        if (gParCouvert < 80) return 'success';
        if (gParCouvert <= 120) return 'warning';
        return 'danger';
    },

    _getColorVar(gParCouvert) {
        if (gParCouvert === null) return 'var(--text-muted)';
        if (gParCouvert < 80) return 'var(--success)';
        if (gParCouvert <= 120) return 'var(--warning)';
        return 'var(--danger)';
    },

    // ==================== GRAPHIQUE CSS ====================

    _getChartData() {
        const data = [];
        const today = new Date(Storage.today() + 'T00:00:00');

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const records = Storage.getGaspillage(dateStr);
            const stats = this._calcStats(records);

            data.push({
                date: dateStr,
                label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                moyenne: stats.moyenne_g_couvert,
                total_kilos: stats.total_kilos,
                nb_mesures: stats.nb_mesures
            });
        }

        return data;
    },

    _renderChart(chartData) {
        // Trouver la valeur max pour le scale
        const valeurs = chartData.map(d => d.moyenne).filter(v => v !== null);
        if (valeurs.length === 0) {
            return UI.emptyState('\uD83D\uDCCA', 'Aucune donnee sur les 7 derniers jours');
        }

        const maxVal = Math.max(...valeurs, this.REFERENCE_NATIONALE);
        const chartHeight = 180;

        let barsHTML = '';
        for (const day of chartData) {
            const pct = day.moyenne !== null ? Math.round((day.moyenne / maxVal) * 100) : 0;
            const barHeight = day.moyenne !== null ? Math.max(pct, 3) : 0;
            const color = this._getColorVar(day.moyenne);
            const valLabel = day.moyenne !== null ? day.moyenne + ' g' : '--';

            barsHTML += `
                <div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;">
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.25rem;white-space:nowrap;">${valLabel}</div>
                    <div style="width:100%;height:${chartHeight}px;display:flex;align-items:flex-end;justify-content:center;">
                        <div style="width:60%;max-width:40px;height:${barHeight}%;background:${color};border-radius:4px 4px 0 0;min-height:${day.moyenne !== null ? '4px' : '0'};transition:height 0.3s ease;"></div>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:0.35rem;text-align:center;white-space:nowrap;">${day.label}</div>
                </div>
            `;
        }

        // Ligne de reference ADEME
        const refPct = Math.round((this.REFERENCE_NATIONALE / maxVal) * 100);

        return `
            <div style="position:relative;padding:0.5rem 0.5rem 0;">
                <!-- Ligne de reference ADEME -->
                <div style="position:absolute;left:0;right:0;bottom:calc(${refPct}% * ${chartHeight / 100}px + 40px);border-top:2px dashed var(--text-muted);opacity:0.5;z-index:1;">
                    <span style="position:absolute;right:0;top:-16px;font-size:0.65rem;color:var(--text-muted);background:var(--bg-card);padding:0 0.25rem;">${this.REFERENCE_NATIONALE} g (ref.)</span>
                </div>
                <div style="display:flex;gap:0.25rem;align-items:flex-end;">
                    ${barsHTML}
                </div>
            </div>
        `;
    },

    // ==================== TABLE ====================

    _renderTable(records) {
        if (records.length === 0) {
            return UI.emptyState('\u267B\uFE0F', 'Aucune pesee enregistree pour cette date');
        }

        let rows = '';
        for (const r of records) {
            const gpc = r.grammes_par_couvert;
            const colorClass = gpc < 80 ? 'status-ok' : gpc <= 120 ? 'status-warning' : 'status-danger';

            rows += `
                <tr>
                    <td>${Storage.formatTime(r.timestamp)}</td>
                    <td>${Storage.formatDate(r.date)}</td>
                    <td><strong>${r.kilos} kg</strong></td>
                    <td>${r.couverts}</td>
                    <td class="${colorClass}"><strong>${gpc} g/couv.</strong></td>
                    <td>${r.notes ? UI.escapeHTML(r.notes) : '\u2014'}</td>
                    <td>${UI.escapeHTML(r.user)}</td>
                </tr>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Date</th>
                            <th>Kilos</th>
                            <th>Couverts</th>
                            <th>g/couvert</th>
                            <th>Notes</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // ==================== NAVIGATION ====================

    changeDate(date) {
        this.selectedDate = date;
        this.render();
    },

    // ==================== MODAL AJOUT ====================

    showAddModal() {
        const today = Storage.today();

        const body = `
            <div class="form-group">
                <label>Date de la pesee</label>
                <input type="date" class="form-control form-control-lg" id="gasp-date" value="${today}">
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>Poids des dechets (kg)</label>
                    <input type="number" step="0.1" min="0" class="form-control form-control-lg" id="gasp-kilos"
                           placeholder="Ex: 12.5" autofocus
                           oninput="Gaspillage._updatePreview()">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Nombre de couverts</label>
                    <input type="number" min="1" class="form-control form-control-lg" id="gasp-couverts"
                           placeholder="Ex: 150"
                           oninput="Gaspillage._updatePreview()">
                </div>
            </div>
            <div id="gasp-preview" style="text-align:center;padding:1rem;background:var(--bg-input);border-radius:var(--radius-sm);margin-bottom:1rem;">
                <div style="font-size:0.85rem;color:var(--text-muted);">Grammes par couvert</div>
                <div style="font-size:2rem;font-weight:700;color:var(--text-muted);">\u2014</div>
            </div>
            <div class="form-group">
                <label>Notes (optionnel)</label>
                <textarea class="form-control" id="gasp-notes" rows="2"
                          placeholder="Ex: Service du midi, reste entrees..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Gaspillage.saveFromModal()">Enregistrer</button>
        `;

        UI.openModal('Enregistrer une pesee de dechets', body, footer);
    },

    _updatePreview() {
        const kilos = parseFloat(document.getElementById('gasp-kilos').value);
        const couverts = parseInt(document.getElementById('gasp-couverts').value, 10);
        const preview = document.getElementById('gasp-preview');

        if (!isNaN(kilos) && !isNaN(couverts) && couverts > 0 && kilos >= 0) {
            const gpc = Math.round((kilos * 1000) / couverts);
            const color = this._getColorVar(gpc);
            const label = gpc < 80 ? 'Excellent' : gpc <= 120 ? 'Acceptable' : 'Trop eleve';
            preview.innerHTML = `
                <div style="font-size:0.85rem;color:var(--text-muted);">Grammes par couvert</div>
                <div style="font-size:2rem;font-weight:700;color:${color};">${gpc} g</div>
                <div style="font-size:0.8rem;color:${color};">${label} (ref. ${this.REFERENCE_NATIONALE} g)</div>
            `;
        } else {
            preview.innerHTML = `
                <div style="font-size:0.85rem;color:var(--text-muted);">Grammes par couvert</div>
                <div style="font-size:2rem;font-weight:700;color:var(--text-muted);">\u2014</div>
            `;
        }
    },

    saveFromModal() {
        const date = document.getElementById('gasp-date').value;
        const kilos = parseFloat(document.getElementById('gasp-kilos').value);
        const couverts = parseInt(document.getElementById('gasp-couverts').value, 10);
        const notes = document.getElementById('gasp-notes').value.trim();

        if (!date) {
            UI.toast('Selectionnez une date', 'warning');
            return;
        }

        if (isNaN(kilos) || kilos < 0) {
            UI.toast('Entrez un poids valide (en kg)', 'warning');
            return;
        }

        if (isNaN(couverts) || couverts <= 0) {
            UI.toast('Entrez un nombre de couverts valide', 'warning');
            return;
        }

        const grammes_par_couvert = Math.round((kilos * 1000) / couverts);

        const record = {
            date,
            kilos,
            couverts,
            grammes_par_couvert,
            notes: notes || null
        };

        Storage.addGaspillage(record);

        // Alerte si gaspillage eleve
        if (grammes_par_couvert > this.REFERENCE_NATIONALE) {
            Storage.addAlerte({
                type: 'gaspillage',
                niveau: 'attention',
                titre: `Gaspillage eleve : ${grammes_par_couvert} g/couvert`,
                description: `${kilos} kg pour ${couverts} couverts (ref. ${this.REFERENCE_NATIONALE} g/couvert). ${notes || ''}`
            });
            UI.updateAlertBadge();
            UI.toast(`Attention : gaspillage eleve (${grammes_par_couvert} g/couvert)`, 'warning');
        } else {
            UI.toast(`Pesee enregistree : ${grammes_par_couvert} g/couvert`, 'success');
        }

        UI.closeModal();
        this.render();
    },

    // ==================== STATISTIQUES ====================

    _calcStats(records) {
        if (!records || records.length === 0) {
            return {
                total_kilos: 0,
                total_couverts: 0,
                moyenne_g_couvert: null,
                nb_mesures: 0
            };
        }

        let total_kilos = 0;
        let total_couverts = 0;

        for (const r of records) {
            total_kilos += r.kilos;
            total_couverts += r.couverts;
        }

        const moyenne_g_couvert = total_couverts > 0
            ? Math.round((total_kilos * 1000) / total_couverts)
            : null;

        return {
            total_kilos,
            total_couverts,
            moyenne_g_couvert,
            nb_mesures: records.length
        };
    },

    getStats(period) {
        const today = new Date(Storage.today() + 'T00:00:00');
        let startDate;

        switch (period) {
            case 'week': {
                startDate = new Date(today);
                const day = startDate.getDay();
                const diff = day === 0 ? 6 : day - 1; // Lundi = debut de semaine
                startDate.setDate(startDate.getDate() - diff);
                break;
            }
            case 'month': {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            }
            case 'year': {
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            }
            default: {
                startDate = new Date(today);
                break;
            }
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = Storage.today();
        const records = Storage.getGaspillageRange(startStr, endStr);

        const stats = this._calcStats(records);

        // Calculer l'evolution par rapport a la periode precedente
        const periodDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const prevEnd = new Date(startDate);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - periodDays + 1);

        const prevStartStr = prevStart.toISOString().split('T')[0];
        const prevEndStr = prevEnd.toISOString().split('T')[0];
        const prevRecords = Storage.getGaspillageRange(prevStartStr, prevEndStr);
        const prevStats = this._calcStats(prevRecords);

        let evolution_percent = null;
        if (prevStats.moyenne_g_couvert !== null && stats.moyenne_g_couvert !== null && prevStats.moyenne_g_couvert > 0) {
            evolution_percent = Math.round(((stats.moyenne_g_couvert - prevStats.moyenne_g_couvert) / prevStats.moyenne_g_couvert) * 100);
        }

        return {
            total_kilos: stats.total_kilos,
            total_couverts: stats.total_couverts,
            moyenne_g_couvert: stats.moyenne_g_couvert,
            nb_mesures: stats.nb_mesures,
            evolution_percent
        };
    },

    // ==================== EXPORT PDF ====================

    getPDFData() {
        const statsSemaine = this.getStats('week');
        const statsMois = this.getStats('month');
        const statsAnnee = this.getStats('year');
        const chartData = this._getChartData();

        // Recuperer toutes les pesees du mois en cours
        const today = new Date(Storage.today() + 'T00:00:00');
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endMonth = Storage.today();
        const recordsMois = Storage.getGaspillageRange(startMonth, endMonth);

        return {
            reference_nationale: this.REFERENCE_NATIONALE,
            stats: {
                semaine: statsSemaine,
                mois: statsMois,
                annee: statsAnnee
            },
            chart_7_jours: chartData,
            records_mois: recordsMois.map(r => ({
                date: r.date,
                kilos: r.kilos,
                couverts: r.couverts,
                grammes_par_couvert: r.grammes_par_couvert,
                notes: r.notes || '',
                user: r.user
            }))
        };
    }
};
