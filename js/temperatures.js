/* ============================================================
   OK CUISINE — Module Temperatures
   Releve stockage, CCP cuisson, refroidissement rapide,
   remise en temperature, alertes automatiques
   ============================================================ */

const Temperatures = {
    selectedDate: null,
    activeTab: 'stockage',

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-temperatures');
        const config = Storage.getConfig();
        const records = Storage.getTemperatures(this.selectedDate);
        const ccpRecords = Storage.getCCPRecords(this.selectedDate);

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83C\uDF21\uFE0F Releves de Temperatures</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Temperatures.showAddModal()">
                        + Releve stockage
                    </button>
                    <button class="btn btn-secondary" onclick="Temperatures.showCCPModal()">
                        \uD83D\uDD25 CCP Cuisson / Refroid.
                    </button>
                </div>
            </div>

            <div class="date-filter">
                <label>Date :</label>
                <input type="date" class="form-control" value="${this.selectedDate}"
                       onchange="Temperatures.changeDate(this.value)" style="width:auto;">
                <span style="color:var(--text-muted);margin-left:0.5rem;">${Storage.formatDate(this.selectedDate)}</span>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.activeTab === 'stockage' ? 'active' : ''}"
                        onclick="Temperatures.switchTab('stockage')">
                    \u2744\uFE0F Stockage (${records.length})
                </button>
                <button class="tab-btn ${this.activeTab === 'ccp' ? 'active' : ''}"
                        onclick="Temperatures.switchTab('ccp')">
                    \uD83D\uDD25 CCP Cuisson/Refroid. (${ccpRecords.length})
                </button>
            </div>

            ${this.activeTab === 'stockage' ? this._renderStockageTab(config, records) : this._renderCCPTab(ccpRecords)}
        `;
    },

    switchTab(tab) {
        this.activeTab = tab;
        this.render();
    },

    // ==================== ONGLET STOCKAGE (existant) ====================

    _renderStockageTab(config, records) {
        return `
            ${this._renderZoneCards(config.zones_temperature, records)}

            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Historique du jour</span>
                </div>
                ${this._renderTable(records, config.zones_temperature)}
            </div>
        `;
    },

    _renderZoneCards(zones, records) {
        let html = '<div class="stats-grid">';
        for (const zone of zones) {
            const lastRecord = [...records].reverse().find(r => r.zone_id === zone.id);
            const val = lastRecord ? lastRecord.valeur : '\u2014';
            const status = lastRecord ? UI.temperatureStatus(lastRecord.valeur, zone.min, zone.max) : { class: '', label: 'Pas de releve' };
            const statusClass = status.class === 'status-ok' ? 'success' : status.class === 'status-warning' ? 'warning' : status.class === 'status-danger' ? 'danger' : 'info';

            html += `
                <div class="stat-card ${statusClass} clickable" onclick="Temperatures.showAddModal('${zone.id}')">
                    <div class="stat-label">${zone.nom}</div>
                    <div class="stat-value">${val}${lastRecord ? '\u00B0C' : ''}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">
                        Limites: ${zone.min}\u00B0C a ${zone.max}\u00B0C
                    </div>
                    <div style="margin-top:0.25rem;">
                        ${lastRecord ? UI.conformityBadge(status.class === 'status-ok') : '<span class="badge badge-info">En attente</span>'}
                    </div>
                    ${lastRecord ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${Storage.formatTime(lastRecord.timestamp)} \u2014 ${lastRecord.user}</div>` : ''}
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    _renderTable(records, zones) {
        if (records.length === 0) {
            return UI.emptyState('\uD83C\uDF21\uFE0F', 'Aucun releve pour cette date');
        }

        let rows = '';
        for (const r of records) {
            const zone = zones.find(z => z.id === r.zone_id);
            const limits = zone ? `${zone.min}\u00B0C \u2014 ${zone.max}\u00B0C` : '\u2014';
            const status = zone ? UI.temperatureStatus(r.valeur, zone.min, zone.max) : { label: '?', class: '' };

            rows += `
                <tr>
                    <td>${Storage.formatTime(r.timestamp)}</td>
                    <td>${r.zone_nom}</td>
                    <td><strong>${r.valeur}\u00B0C</strong></td>
                    <td>${limits}</td>
                    <td class="${status.class}">${status.label}</td>
                    <td>${r.user}</td>
                </tr>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Zone</th>
                            <th>Temp.</th>
                            <th>Limites</th>
                            <th>Statut</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // ==================== ONGLET CCP (NOUVEAU) ====================

    _renderCCPTab(ccpRecords) {
        return `
            <div class="card" style="border-left:4px solid var(--primary);">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDFAF Points Critiques de Controle (CCP)</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin:0 0 1rem;">
                    Enregistrez les controles de temperature aux etapes critiques : cuisson,
                    refroidissement rapide et remise en temperature.
                </p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="Temperatures.showCCPModal('cuisson')">
                        \uD83D\uDD25 Cuisson
                    </button>
                    <button class="btn btn-primary" onclick="Temperatures.showCCPModal('refroidissement')">
                        \u2744\uFE0F Refroidissement rapide
                    </button>
                    <button class="btn btn-primary" onclick="Temperatures.showCCPModal('remise_temp')">
                        \uD83D\uDD04 Remise en temperature
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Enregistrements CCP du jour</span>
                    <span class="badge badge-info">${ccpRecords.length}</span>
                </div>
                ${ccpRecords.length === 0
                    ? UI.emptyState('\uD83D\uDD25', 'Aucun enregistrement CCP pour cette date')
                    : this._renderCCPTable(ccpRecords)
                }
            </div>

            <!-- Rappel des regles -->
            <div class="card" style="border-left:4px solid var(--warning);">
                <div class="card-header">
                    <span class="card-title">\u26A0\uFE0F Rappel des limites critiques</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>CCP</th><th>Limite critique</th></tr></thead>
                        <tbody>
                            <tr><td>\uD83D\uDD25 Cuisson generale</td><td><strong>\u2265 63\u00B0C</strong> a coeur</td></tr>
                            <tr><td>\uD83D\uDD25 Viande hachee</td><td><strong>\u2265 70\u00B0C</strong> a coeur</td></tr>
                            <tr><td>\uD83D\uDD25 Volaille</td><td><strong>\u2265 74\u00B0C</strong> a coeur</td></tr>
                            <tr><td>\u2744\uFE0F Refroidissement rapide</td><td>De 63\u00B0C a <strong>&lt; 10\u00B0C en &lt; 2h</strong></td></tr>
                            <tr><td>\uD83D\uDD04 Remise en temperature</td><td>De &lt;10\u00B0C a <strong>&gt; 63\u00B0C en &lt; 1h</strong></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    _renderCCPTable(records) {
        const typeLabels = {
            cuisson: '\uD83D\uDD25 Cuisson',
            refroidissement: '\u2744\uFE0F Refroidissement',
            remise_temp: '\uD83D\uDD04 Remise en temp.'
        };

        let rows = records.map(r => {
            const conforme = r.conforme;
            return `
                <tr class="${conforme ? '' : 'row-danger'}">
                    <td>${Storage.formatTime(r.timestamp)}</td>
                    <td>${typeLabels[r.type_ccp] || r.type_ccp}</td>
                    <td><strong>${UI.escapeHTML(r.produit)}</strong></td>
                    <td>${r.temp_mesuree !== undefined ? r.temp_mesuree + '\u00B0C' : '-'}</td>
                    <td>${r.temp_limite ? r.temp_limite + '\u00B0C' : '-'}</td>
                    <td>${r.duree || '-'}</td>
                    <td>${conforme
                        ? '<span class="badge badge-success">Conforme</span>'
                        : '<span class="badge badge-danger">Non conforme</span>'}</td>
                    <td>${UI.escapeHTML(r.action_corrective || '-')}</td>
                    <td>${r.user}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Type CCP</th>
                            <th>Produit</th>
                            <th>Temp. mesuree</th>
                            <th>Limite</th>
                            <th>Duree</th>
                            <th>Conformite</th>
                            <th>Action corrective</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // ==================== MODALS ====================

    changeDate(date) {
        this.selectedDate = date;
        this.render();
    },

    showAddModal(zoneId) {
        const config = Storage.getConfig();
        let options = config.zones_temperature.map(z =>
            `<option value="${z.id}" data-nom="${z.nom}" data-min="${z.min}" data-max="${z.max}" ${zoneId !== undefined && String(z.id) === String(zoneId) ? 'selected' : ''}>${z.nom} (${z.min}\u00B0C a ${z.max}\u00B0C)</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Zone</label>
                <select class="form-control form-control-lg" id="temp-zone">
                    ${options}
                </select>
            </div>
            <div class="form-group">
                <label>Temperature (\u00B0C)</label>
                <input type="number" step="0.1" class="form-control form-control-lg" id="temp-value"
                       placeholder="Ex: 3" autofocus>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Temperatures.saveFromModal()">Enregistrer</button>
        `;

        UI.openModal('Nouveau releve de temperature', body, footer);
    },

    saveFromModal() {
        const select = document.getElementById('temp-zone');
        const option = select.options[select.selectedIndex];
        const valeur = parseFloat(document.getElementById('temp-value').value);

        if (isNaN(valeur)) {
            UI.toast('Entrez une temperature valide', 'warning');
            return;
        }

        const zone_id = select.value;
        const zone_nom = option.dataset.nom;
        const min = parseFloat(option.dataset.min);
        const max = parseFloat(option.dataset.max);

        Storage.addTemperature({ zone_id, zone_nom, valeur });

        const status = UI.temperatureStatus(valeur, min, max);
        if (status.status !== 'ok') {
            Storage.addAlerte({
                type: 'temperature',
                niveau: status.status === 'danger' ? 'critique' : 'attention',
                titre: `Temperature ${status.label}: ${zone_nom}`,
                description: `${valeur}\u00B0C (limites: ${min}\u00B0C a ${max}\u00B0C)`
            });
            UI.updateAlertBadge();
            UI.toast(`Alerte: ${zone_nom} a ${valeur}\u00B0C (hors limites)`, 'danger');
        } else {
            UI.toast(`Temperature enregistree: ${zone_nom} = ${valeur}\u00B0C`, 'success');
        }

        UI.closeModal();
        this.render();
    },

    // ==================== CCP MODAL ====================

    showCCPModal(type) {
        type = type || 'cuisson';

        const labels = {
            cuisson: { title: 'CCP Cuisson', tempLabel: 'Temperature a coeur (\u00B0C)', limitInfo: 'Limites: \u2265 63\u00B0C (general), \u2265 70\u00B0C (hache), \u2265 74\u00B0C (volaille)' },
            refroidissement: { title: 'CCP Refroidissement rapide', tempLabel: 'Temperature finale (\u00B0C)', limitInfo: 'Objectif: de 63\u00B0C a < 10\u00B0C en moins de 2 heures' },
            remise_temp: { title: 'CCP Remise en temperature', tempLabel: 'Temperature atteinte (\u00B0C)', limitInfo: 'Objectif: de < 10\u00B0C a > 63\u00B0C en moins de 1 heure' }
        };

        const info = labels[type];

        const body = `
            <div class="form-group">
                <label>Type de CCP</label>
                <select class="form-control form-control-lg" id="ccp-type" onchange="Temperatures._updateCCPInfo()">
                    <option value="cuisson" ${type === 'cuisson' ? 'selected' : ''}>Cuisson</option>
                    <option value="refroidissement" ${type === 'refroidissement' ? 'selected' : ''}>Refroidissement rapide</option>
                    <option value="remise_temp" ${type === 'remise_temp' ? 'selected' : ''}>Remise en temperature</option>
                </select>
            </div>
            <div class="form-group">
                <label>Produit / Plat</label>
                <input type="text" class="form-control form-control-lg" id="ccp-produit"
                       placeholder="Ex: Poulet roti" autofocus>
            </div>
            <div class="form-group">
                <label id="ccp-temp-label">${info.tempLabel}</label>
                <input type="number" step="0.1" class="form-control form-control-lg" id="ccp-temp"
                       placeholder="Ex: 74">
                <small id="ccp-limit-info" style="color:var(--text-muted);">${info.limitInfo}</small>
            </div>
            <div class="form-group">
                <label>Limite critique (\u00B0C)</label>
                <select class="form-control" id="ccp-limite">
                    <option value="63">\u2265 63\u00B0C (cuisson generale / maintien chaud)</option>
                    <option value="70">\u2265 70\u00B0C (viande hachee, porc)</option>
                    <option value="74">\u2265 74\u00B0C (volaille)</option>
                    <option value="10">&lt; 10\u00B0C (refroidissement rapide)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Duree (optionnel)</label>
                <input type="text" class="form-control" id="ccp-duree"
                       placeholder="Ex: 1h30, 45 min">
            </div>
            <div class="form-group">
                <label>Conformite</label>
                <div style="display:flex;gap:1rem;margin-top:0.5rem;">
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="ccp-conf" value="oui" checked> \u2705 Conforme
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="ccp-conf" value="non"> \u274C Non conforme
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Action corrective (si non conforme)</label>
                <textarea class="form-control" id="ccp-action" rows="2"
                          placeholder="Ex: Cuisson prolongee, produit detruit..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Temperatures.saveCCP()">Enregistrer</button>
        `;

        UI.openModal(info.title, body, footer);
    },

    _updateCCPInfo() {
        const type = document.getElementById('ccp-type').value;
        const labels = {
            cuisson: { tempLabel: 'Temperature a coeur (\u00B0C)', limitInfo: 'Limites: \u2265 63\u00B0C (general), \u2265 70\u00B0C (hache), \u2265 74\u00B0C (volaille)' },
            refroidissement: { tempLabel: 'Temperature finale (\u00B0C)', limitInfo: 'Objectif: de 63\u00B0C a < 10\u00B0C en moins de 2 heures' },
            remise_temp: { tempLabel: 'Temperature atteinte (\u00B0C)', limitInfo: 'Objectif: de < 10\u00B0C a > 63\u00B0C en moins de 1 heure' }
        };
        const info = labels[type] || labels.cuisson;
        document.getElementById('ccp-temp-label').textContent = info.tempLabel;
        document.getElementById('ccp-limit-info').textContent = info.limitInfo;
    },

    saveCCP() {
        const type_ccp = document.getElementById('ccp-type').value;
        const produit = document.getElementById('ccp-produit').value.trim();
        const temp_mesuree = parseFloat(document.getElementById('ccp-temp').value);
        const temp_limite = parseFloat(document.getElementById('ccp-limite').value);
        const duree = document.getElementById('ccp-duree').value.trim();
        const conforme = document.querySelector('input[name="ccp-conf"]:checked').value === 'oui';
        const action_corrective = document.getElementById('ccp-action').value.trim();

        if (!produit) {
            UI.toast('Entrez le nom du produit', 'warning');
            return;
        }

        Storage.addCCPRecord({
            type_ccp, produit, temp_mesuree: isNaN(temp_mesuree) ? null : temp_mesuree,
            temp_limite, duree, conforme, action_corrective
        });

        const typeLabels = { cuisson: 'Cuisson', refroidissement: 'Refroidissement', remise_temp: 'Remise en temp.' };

        if (!conforme) {
            Storage.addAlerte({
                type: 'ccp',
                niveau: 'critique',
                titre: `CCP non conforme: ${typeLabels[type_ccp]} — ${produit}`,
                description: `Temp: ${isNaN(temp_mesuree) ? 'N/A' : temp_mesuree + '\u00B0C'} (limite: ${temp_limite}\u00B0C)${action_corrective ? '. Action: ' + action_corrective : ''}`
            });
            UI.updateAlertBadge();
            UI.toast(`ALERTE CCP: ${typeLabels[type_ccp]} non conforme — ${produit}`, 'danger');
        } else {
            UI.toast(`CCP ${typeLabels[type_ccp]} enregistre: ${produit}`, 'success');
        }

        UI.closeModal();
        this.render();
    }
};
