/* ============================================================
   OK CUISINE — Module Audit & Controle Cuisine
   Synthese DDPP / Controle sanitaire
   Ajout uniquement — ne modifie aucun module existant
   ============================================================ */

const Audit = {
    dateDebut: null,
    dateFin: null,

    init() {
        // Periode par defaut : 7 derniers jours
        const today = new Date();
        this.dateFin = Storage.today();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        this.dateDebut = weekAgo.toISOString().split('T')[0];
    },

    render() {
        if (!this.dateDebut) this.init();

        const page = document.getElementById('page-audit');
        const config = Storage.getConfig();
        const dates = this._getDateRange(this.dateDebut, this.dateFin);

        // Collecte des donnees sur la periode
        const tempData = this._collectTemperatures(dates, config);
        const netData = this._collectNettoyage(dates, config);
        const recData = this._collectReceptions(dates);
        const dlcAlerts = Storage.checkDLCAlerts();
        const alertes = Storage.getAlertes().filter(a => !a.resolved);
        const netAlerts = this._checkNettoyageAlerts(dates, config);

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🔍 Audit & Controle Cuisine</h2>
                <div class="section-actions">
                    <button class="btn btn-success btn-kitchen" onclick="Audit.exportDDPP()">
                        📄 Export PDF DDPP
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-title">📅 Periode d'audit</div>
                <div style="display:flex;gap:1rem;align-items:center;margin-top:0.75rem;flex-wrap:wrap;">
                    <div class="form-group" style="margin:0;">
                        <label>Du</label>
                        <input type="date" class="form-control" value="${this.dateDebut}"
                               onchange="Audit.dateDebut=this.value; Audit.render();">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Au</label>
                        <input type="date" class="form-control" value="${this.dateFin}"
                               onchange="Audit.dateFin=this.value; Audit.render();">
                    </div>
                    <button class="btn btn-primary" onclick="Audit._setPeriod(7)">7 jours</button>
                    <button class="btn btn-primary" onclick="Audit._setPeriod(30)">30 jours</button>
                    <button class="btn btn-primary" onclick="Audit._setPeriod(90)">3 mois</button>
                </div>
            </div>

            <!-- ALERTES ACTIVES -->
            ${this._renderAlertSection(alertes, dlcAlerts, netAlerts)}

            <!-- STATISTIQUES -->
            <div class="stats-grid">
                <div class="stat-card ${tempData.coverage >= 80 ? 'success' : tempData.coverage >= 50 ? 'warning' : 'danger'}">
                    <div class="stat-label">Temperatures</div>
                    <div class="stat-value">${tempData.coverage}%</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${tempData.totalRecords} releves / ${dates.length} jours</div>
                </div>
                <div class="stat-card ${netData.coverage >= 80 ? 'success' : netData.coverage >= 50 ? 'warning' : 'danger'}">
                    <div class="stat-label">Nettoyage</div>
                    <div class="stat-value">${netData.coverage}%</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${netData.daysWithCleaning}/${dates.length} jours</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Receptions</div>
                    <div class="stat-value">${recData.total}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${recData.conformes} conformes</div>
                </div>
                <div class="stat-card ${alertes.length === 0 ? 'success' : 'danger'}">
                    <div class="stat-label">Alertes actives</div>
                    <div class="stat-value">${alertes.length}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${dlcAlerts.length} DLC</div>
                </div>
            </div>

            <!-- SUIVI TEMPERATURES -->
            ${this._renderTemperatureSection(tempData, dates, config)}

            <!-- PLAN DE NETTOYAGE -->
            ${this._renderNettoyageSection(netData, dates)}

            <!-- TRACABILITE DES PRODUITS -->
            ${this._renderTracabiliteSection(recData)}

            <!-- MENUS SERVIS -->
            ${this._renderMenusSection(dates)}
        `;
    },

    // ========== ALERTES ==========
    _renderAlertSection(alertes, dlcAlerts, netAlerts) {
        const allAlerts = [];

        // Alertes actives
        alertes.forEach(a => {
            allAlerts.push({
                icon: a.niveau === 'critique' ? '🔴' : '🟡',
                titre: a.titre,
                desc: a.description || '',
                type: a.type
            });
        });

        // DLC
        dlcAlerts.forEach(a => {
            allAlerts.push({
                icon: a.niveau === 'critique' ? '🔴' : '🟡',
                titre: `DLC ${a.item}`,
                desc: a.message,
                type: 'dlc'
            });
        });

        // Nettoyage non fait
        netAlerts.forEach(a => {
            allAlerts.push({
                icon: '🟡',
                titre: a.titre,
                desc: a.desc,
                type: 'nettoyage'
            });
        });

        if (allAlerts.length === 0) {
            return `
                <div class="card" style="border-left:4px solid var(--success);">
                    <div style="display:flex;align-items:center;gap:1rem;">
                        <span style="font-size:2rem;">✅</span>
                        <div>
                            <div style="font-weight:600;font-size:1.1rem;">Aucune alerte active</div>
                            <div style="color:var(--text-muted);font-size:0.9rem;">Tous les controles sont a jour.</div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card" style="border-left:4px solid var(--danger);">
                <div class="card-title" style="color:var(--danger);">⚠️ Alertes actives (${allAlerts.length})</div>
                <div style="margin-top:0.75rem;">
                    ${allAlerts.slice(0, 10).map(a => `
                        <div class="alert-item ${a.icon === '🔴' ? 'critical' : 'warning'}" style="margin-bottom:0.5rem;">
                            <div class="alert-icon">${a.icon}</div>
                            <div class="alert-content">
                                <div class="alert-title">${UI.escapeHTML(a.titre)}</div>
                                <div class="alert-desc">${UI.escapeHTML(a.desc)}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${allAlerts.length > 10 ? `<p style="color:var(--text-muted);text-align:center;">... et ${allAlerts.length - 10} autre(s)</p>` : ''}
                </div>
            </div>
        `;
    },

    // ========== TEMPERATURES ==========
    _collectTemperatures(dates, config) {
        let totalRecords = 0;
        let totalZones = config.zones_temperature.length;
        let daysWithRecords = 0;
        const dailyData = [];
        let horsNorme = 0;

        dates.forEach(date => {
            const records = Storage.getTemperatures(date);
            if (records.length > 0) daysWithRecords++;
            totalRecords += records.length;

            const zonesRecorded = new Set(records.map(r => r.zone_id));

            records.forEach(r => {
                const zone = config.zones_temperature.find(z => z.id === r.zone_id);
                if (zone) {
                    const status = UI.temperatureStatus(r.valeur, zone.min, zone.max);
                    if (status.status === 'danger' || status.status === 'warning') {
                        horsNorme++;
                    }
                }
            });

            dailyData.push({
                date,
                count: records.length,
                zonesRecorded: zonesRecorded.size,
                totalZones: totalZones,
                records
            });
        });

        const coverage = dates.length > 0 ? Math.round((daysWithRecords / dates.length) * 100) : 0;

        return { totalRecords, daysWithRecords, coverage, dailyData, horsNorme, totalZones };
    },

    _renderTemperatureSection(tempData, dates, config) {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">🌡️ Suivi des temperatures</div>
                    <span class="badge ${tempData.horsNorme === 0 ? 'badge-success' : 'badge-danger'}">
                        ${tempData.horsNorme === 0 ? 'Toutes conformes' : tempData.horsNorme + ' hors norme'}
                    </span>
                </div>
                <div class="table-container" style="max-height:400px;overflow-y:auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Releves</th>
                                <th>Zones couvertes</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tempData.dailyData.map(d => {
                                const pct = d.totalZones > 0 ? Math.round((d.zonesRecorded / d.totalZones) * 100) : 0;
                                let statusClass = 'status-ok';
                                let statusText = 'Complet';
                                if (d.count === 0) { statusClass = 'status-danger'; statusText = 'Aucun releve'; }
                                else if (pct < 80) { statusClass = 'status-warning'; statusText = 'Partiel'; }
                                return `
                                    <tr>
                                        <td>${Storage.formatDate(d.date)}</td>
                                        <td>${d.count}</td>
                                        <td>${d.zonesRecorded}/${d.totalZones} (${pct}%)</td>
                                        <td class="${statusClass}">${statusText}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ========== NETTOYAGE ==========
    _collectNettoyage(dates, config) {
        let daysWithCleaning = 0;
        let totalZones = config.zones_nettoyage.length;
        const dailyData = [];

        dates.forEach(date => {
            const records = Storage.getNettoyages(date);
            const allZonesCleaned = new Set();
            records.forEach(r => {
                (r.zones || []).forEach(z => allZonesCleaned.add(z));
            });

            if (records.length > 0) daysWithCleaning++;

            dailyData.push({
                date,
                zonesCleaned: allZonesCleaned.size,
                totalZones,
                records
            });
        });

        const coverage = dates.length > 0 ? Math.round((daysWithCleaning / dates.length) * 100) : 0;

        return { daysWithCleaning, coverage, dailyData, totalZones };
    },

    _checkNettoyageAlerts(dates, config) {
        const alerts = [];
        const today = Storage.today();
        const todayRecords = Storage.getNettoyages(today);

        if (todayRecords.length === 0) {
            const now = new Date();
            // Alerte si apres 10h du matin et aucun nettoyage
            if (now.getHours() >= 10) {
                alerts.push({
                    titre: 'Nettoyage non valide aujourd\'hui',
                    desc: 'Aucun nettoyage enregistre pour aujourd\'hui. Validez le plan de nettoyage.'
                });
            }
        } else {
            // Verifier si toutes les zones ont ete nettoyees
            const allZonesCleaned = new Set();
            todayRecords.forEach(r => {
                (r.zones || []).forEach(z => allZonesCleaned.add(z));
            });
            const zonesConfig = config.zones_nettoyage || [];
            const missingZones = zonesConfig.filter(z => !allZonesCleaned.has(z.nom));
            if (missingZones.length > 0 && missingZones.length > zonesConfig.length / 2) {
                alerts.push({
                    titre: 'Nettoyage partiel',
                    desc: `${missingZones.length} zone(s) non nettoyee(s) aujourd\'hui.`
                });
            }
        }

        return alerts;
    },

    _renderNettoyageSection(netData, dates) {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">🧹 Plan de nettoyage</div>
                    <span class="badge ${netData.coverage >= 80 ? 'badge-success' : netData.coverage >= 50 ? 'badge-warning' : 'badge-danger'}">
                        ${netData.coverage}% de couverture
                    </span>
                </div>
                <div class="table-container" style="max-height:400px;overflow-y:auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Zones nettoyees</th>
                                <th>Couverture</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${netData.dailyData.map(d => {
                                const pct = d.totalZones > 0 ? Math.round((d.zonesCleaned / d.totalZones) * 100) : 0;
                                let statusClass = 'status-ok';
                                let statusText = 'Valide';
                                if (d.records.length === 0) { statusClass = 'status-danger'; statusText = 'Non fait'; }
                                else if (pct < 50) { statusClass = 'status-warning'; statusText = 'Partiel'; }
                                return `
                                    <tr>
                                        <td>${Storage.formatDate(d.date)}</td>
                                        <td>${d.zonesCleaned}/${d.totalZones}</td>
                                        <td>${pct}%</td>
                                        <td class="${statusClass}">${statusText}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ========== TRACABILITE ==========
    _collectReceptions(dates) {
        let total = 0;
        let conformes = 0;
        const allRecords = [];

        dates.forEach(date => {
            const records = Storage.getReceptions(date);
            records.forEach(r => {
                total++;
                if (r.conforme) conformes++;
                allRecords.push(r);
            });
        });

        return { total, conformes, nonConformes: total - conformes, records: allRecords };
    },

    _renderTracabiliteSection(recData) {
        const etiquettes = Storage.getEtiquettes();
        const config = Storage.getConfig();
        const fournisseurs = config.fournisseurs_agrees || [];

        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">🔍 Tracabilite des produits</div>
                    <span class="badge badge-info">${recData.total} reception(s)</span>
                </div>

                ${recData.records.length > 0 ? `
                    <div class="table-container" style="max-height:300px;overflow-y:auto;margin-top:0.75rem;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Fournisseur</th>
                                    <th>Produit</th>
                                    <th>Lot</th>
                                    <th>DLC</th>
                                    <th>Temp.</th>
                                    <th>Conformite</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recData.records.slice(0, 20).map(r => `
                                    <tr>
                                        <td>${Storage.formatDateTime(r.timestamp)}</td>
                                        <td>${UI.escapeHTML(r.fournisseur || '-')}</td>
                                        <td>${UI.escapeHTML(r.produit || '-')}</td>
                                        <td>${UI.escapeHTML(r.lot || '-')}</td>
                                        <td>${r.dlc || '-'}</td>
                                        <td>${r.temperature !== null && r.temperature !== undefined ? r.temperature + '\u00B0C' : '-'}</td>
                                        <td>${r.conforme ? '<span class="badge badge-success">OK</span>' : '<span class="badge badge-danger">NON CONFORME</span>'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p style="color:var(--text-muted);margin-top:0.75rem;">Aucune reception sur la periode.</p>'}

                ${fournisseurs.length > 0 ? `
                    <div style="margin-top:1rem;">
                        <strong>Fournisseurs agrees :</strong>
                        <div class="chip-list" style="margin-top:0.5rem;">
                            ${fournisseurs.map(f => `<span class="chip">${UI.escapeHTML(f.nom)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // ========== MENUS ==========
    _renderMenusSection(dates) {
        let allMenus = [];
        dates.forEach(date => {
            const menus = Storage.getMenus(date);
            menus.forEach(m => {
                allMenus.push({ date, ...m });
            });
        });

        if (allMenus.length === 0) {
            return `
                <div class="card">
                    <div class="card-title">🍽️ Menus servis</div>
                    <p style="color:var(--text-muted);margin-top:0.75rem;">Aucun menu enregistre sur la periode. Allez dans le module Menus pour en generer.</p>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">🍽️ Menus servis</div>
                    <span class="badge badge-info">${allMenus.length} menu(s)</span>
                </div>
                ${allMenus.slice(0, 5).map(m => `
                    <div style="margin-top:0.75rem;padding:0.75rem;background:var(--bg-input);border-radius:var(--radius-sm);border:1px solid var(--border);">
                        <div style="font-weight:600;margin-bottom:0.5rem;">${Storage.formatDate(m.date)} — ${m.theme_nom} (${m.collectivite_nom})</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">
                            ${m.jours.map(j => `${j.jour}: ${j.plat}`).join(' | ')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ========== HELPERS ==========
    _getDateRange(start, end) {
        const dates = [];
        const current = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    },

    _setPeriod(days) {
        const today = new Date();
        this.dateFin = Storage.today();
        const start = new Date(today);
        start.setDate(start.getDate() - (days - 1));
        this.dateDebut = start.toISOString().split('T')[0];
        this.render();
    },

    exportDDPP() {
        PDF.export('ddpp');
    }
};
