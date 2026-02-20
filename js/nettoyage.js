/* ============================================================
   OK CUISINE — Module Nettoyage
   Suivi des nettoyages par zone, produit, planning
   ============================================================ */

const Nettoyage = {
    selectedDate: null,

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-nettoyage');
        const config = Storage.getConfig();
        const records = Storage.getNettoyages(this.selectedDate);

        // Calcul des zones nettoyées aujourd'hui
        const cleanedZones = new Set();
        records.forEach(r => r.zones.forEach(z => cleanedZones.add(z)));

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🧹 Suivi Nettoyage</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Nettoyage.showAddModal()">
                        + Enregistrer un nettoyage
                    </button>
                </div>
            </div>

            <div class="date-filter">
                <label>Date :</label>
                <input type="date" class="form-control" value="${this.selectedDate}"
                       onchange="Nettoyage.changeDate(this.value)" style="width:auto;">
                <span style="color:var(--text-muted);margin-left:0.5rem;">${Storage.formatDate(this.selectedDate)}</span>
            </div>

            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card ${cleanedZones.size === config.zones_nettoyage.length ? 'success' : 'warning'}">
                    <div class="stat-label">Zones nettoyées</div>
                    <div class="stat-value">${cleanedZones.size} / ${config.zones_nettoyage.length}</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Nettoyages enregistrés</div>
                    <div class="stat-value">${records.length}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Checklist des zones</span>
                </div>
                <div class="checklist">
                    ${config.zones_nettoyage.map(zone => {
                        const isDone = cleanedZones.has(zone.nom);
                        const record = records.find(r => r.zones.includes(zone.nom));
                        return `
                            <div class="checklist-item ${isDone ? 'checked' : ''}"
                                 onclick="${isDone ? '' : `Nettoyage.quickClean('${zone.nom}')`}">
                                <div class="checklist-check">${isDone ? '✓' : ''}</div>
                                <div class="checklist-label">${zone.nom}</div>
                                ${isDone && record ? `<div class="checklist-time">${record.produit} — ${Storage.formatTime(record.timestamp)} — ${record.user}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="card" style="margin-top:1rem;">
                <div class="card-header">
                    <span class="card-title">📋 Détail des nettoyages</span>
                </div>
                ${this._renderTable(records)}
            </div>
        `;
    },

    _renderTable(records) {
        if (records.length === 0) {
            return UI.emptyState('🧹', 'Aucun nettoyage enregistré pour cette date');
        }

        let rows = '';
        for (const r of records) {
            rows += `
                <tr>
                    <td>${Storage.formatTime(r.timestamp)}</td>
                    <td>${r.zones.join(', ')}</td>
                    <td>${r.produit}</td>
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
                            <th>Zones</th>
                            <th>Produit</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    changeDate(date) {
        this.selectedDate = date;
        this.render();
    },

    quickClean(zoneName) {
        const config = Storage.getConfig();
        let produitOptions = config.produits_nettoyage.map(p =>
            `<option value="${p}">${p}</option>`
        ).join('');

        const body = `
            <p style="margin-bottom:1rem;color:var(--text-secondary);">
                Zone : <strong>${zoneName}</strong>
            </p>
            <div class="form-group">
                <label>Produit utilisé</label>
                <select class="form-control form-control-lg" id="clean-product">
                    ${produitOptions}
                </select>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Nettoyage.saveQuickClean('${zoneName}')">Valider</button>
        `;

        UI.openModal(`Nettoyage — ${zoneName}`, body, footer);
    },

    saveQuickClean(zoneName) {
        const produit = document.getElementById('clean-product').value;
        Storage.addNettoyage({ zones: [zoneName], produit });
        UI.toast(`Nettoyage enregistré : ${zoneName}`, 'success');
        UI.closeModal();
        this.render();
    },

    showAddModal() {
        const config = Storage.getConfig();

        let zonesHTML = config.zones_nettoyage.map(z =>
            `<label style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem;cursor:pointer;">
                <input type="checkbox" class="clean-zone-cb" value="${z.nom}"> ${z.nom}
            </label>`
        ).join('');

        let produitOptions = config.produits_nettoyage.map(p =>
            `<option value="${p}">${p}</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Zones nettoyées</label>
                <div style="max-height:250px;overflow-y:auto;background:var(--bg-input);border-radius:var(--radius-sm);padding:0.5rem;">
                    ${zonesHTML}
                </div>
            </div>
            <div class="form-group">
                <label>Produit utilisé</label>
                <select class="form-control form-control-lg" id="clean-product-multi">
                    ${produitOptions}
                </select>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Nettoyage.saveFromModal()">Enregistrer</button>
        `;

        UI.openModal('Enregistrer un nettoyage', body, footer);
    },

    saveFromModal() {
        const checkboxes = document.querySelectorAll('.clean-zone-cb:checked');
        const zones = Array.from(checkboxes).map(cb => cb.value);
        const produit = document.getElementById('clean-product-multi').value;

        if (zones.length === 0) {
            UI.toast('Sélectionnez au moins une zone', 'warning');
            return;
        }

        Storage.addNettoyage({ zones, produit });
        UI.toast(`Nettoyage enregistré : ${zones.join(', ')}`, 'success');
        UI.closeModal();
        this.render();
    }
};
