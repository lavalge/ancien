/* ============================================================
   OK CUISINE — Module Receptions
   Suivi des livraisons, controle conformite HACCP complet
   Temperature, lot, origine, emballage, vehicule, DLC
   ============================================================ */

const Receptions = {
    selectedDate: null,

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-receptions');
        const records = Storage.getReceptions(this.selectedDate);

        const total = records.length;
        const conformes = records.filter(r => r.conforme).length;
        const nonConformes = total - conformes;

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83D\uDCE6 Receptions / Livraisons</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Receptions.showAddModal()">
                        + Nouvelle reception
                    </button>
                </div>
            </div>

            <div class="date-filter">
                <label>Date :</label>
                <input type="date" class="form-control" value="${this.selectedDate}"
                       onchange="Receptions.changeDate(this.value)" style="width:auto;">
                <span style="color:var(--text-muted);margin-left:0.5rem;">${Storage.formatDate(this.selectedDate)}</span>
            </div>

            <!-- Rappel controle reception -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1rem;">
                <p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">
                    <strong>Controle a reception :</strong> Verifier systematiquement la temperature,
                    l'etat de l'emballage, la DLC/DDM, l'etiquetage, le numero de lot et la proprete
                    du vehicule de livraison. Refuser tout produit non conforme.
                </p>
            </div>

            <div class="stats-grid">
                <div class="stat-card info">
                    <div class="stat-label">Total receptions</div>
                    <div class="stat-value">${total}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Conformes</div>
                    <div class="stat-value">${conformes}</div>
                </div>
                <div class="stat-card ${nonConformes > 0 ? 'danger' : 'success'}">
                    <div class="stat-label">Non conformes</div>
                    <div class="stat-value">${nonConformes}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Receptions du jour</span>
                </div>
                ${this._renderTable(records)}
            </div>
        `;
    },

    _renderTable(records) {
        if (records.length === 0) {
            return UI.emptyState('\uD83D\uDCE6', 'Aucune reception enregistree pour cette date');
        }

        let rows = '';
        for (const r of records) {
            rows += `
                <tr class="${r.conforme ? '' : 'row-danger'}">
                    <td>${Storage.formatTime(r.timestamp)}</td>
                    <td><strong>${UI.escapeHTML(r.fournisseur)}</strong></td>
                    <td>${UI.escapeHTML(r.produit)}</td>
                    <td>${r.temperature !== undefined && r.temperature !== null ? r.temperature + '\u00B0C' : '\u2014'}</td>
                    <td>${r.lot || '\u2014'}</td>
                    <td>${r.dlc || '\u2014'}</td>
                    <td>${UI.conformityBadge(r.conforme)}</td>
                    <td>${r.user}</td>
                    <td>
                        <button class="btn btn-secondary" style="padding:0.2rem 0.4rem;font-size:0.75rem;"
                                onclick="Receptions.showDetail('${r.id}')">Detail</button>
                    </td>
                </tr>
            `;
        }

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Fournisseur</th>
                            <th>Produit</th>
                            <th>Temp.</th>
                            <th>N. lot</th>
                            <th>DLC</th>
                            <th>Conformite</th>
                            <th>Par</th>
                            <th></th>
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

    showAddModal() {
        const body = `
            <div class="form-group">
                <label>Fournisseur *</label>
                <input type="text" class="form-control form-control-lg" id="rec-fournisseur"
                       placeholder="Nom du fournisseur" autofocus>
            </div>
            <div class="form-group">
                <label>Produit *</label>
                <input type="text" class="form-control form-control-lg" id="rec-produit"
                       placeholder="Description du produit">
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>Temperature a reception (\u00B0C)</label>
                    <input type="number" step="0.1" class="form-control form-control-lg" id="rec-temp"
                           placeholder="Ex: 3">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Quantite</label>
                    <input type="text" class="form-control form-control-lg" id="rec-quantite"
                           placeholder="Ex: 10 kg">
                </div>
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>DLC / DDM</label>
                    <input type="date" class="form-control" id="rec-dlc">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>N. de lot</label>
                    <input type="text" class="form-control" id="rec-lot"
                           placeholder="N. lot fournisseur">
                </div>
            </div>
            <div class="form-group">
                <label>Origine du produit</label>
                <input type="text" class="form-control" id="rec-origine"
                       placeholder="Ex: France, UE, Espagne">
            </div>

            <div style="background:var(--bg-card);padding:0.75rem;border-radius:var(--radius-sm);margin:1rem 0;">
                <strong>Controles visuels :</strong>
                <div style="margin-top:0.5rem;display:flex;flex-direction:column;gap:0.5rem;">
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="checkbox" id="rec-check-emballage" checked> Emballage intact et propre
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="checkbox" id="rec-check-etiquetage" checked> Etiquetage conforme (DLC, lot, origine)
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="checkbox" id="rec-check-vehicule" checked> Vehicule propre et temperature conforme
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="checkbox" id="rec-check-aspect" checked> Aspect visuel et olfactif satisfaisant
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label>Conformite globale</label>
                <div style="display:flex;gap:1rem;margin-top:0.5rem;">
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="rec-conf" value="oui" checked> \u2705 Conforme
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="rec-conf" value="non"> \u274C Non conforme
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Commentaire / Motif de non-conformite</label>
                <textarea class="form-control" id="rec-comment" rows="2" placeholder="Remarques..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Receptions.saveFromModal()">Enregistrer</button>
        `;

        UI.openModal('Nouvelle reception', body, footer);
    },

    saveFromModal() {
        const fournisseur = document.getElementById('rec-fournisseur').value.trim();
        const produit = document.getElementById('rec-produit').value.trim();
        const temperature = document.getElementById('rec-temp').value ? parseFloat(document.getElementById('rec-temp').value) : null;
        const quantite = document.getElementById('rec-quantite').value.trim();
        const dlc = document.getElementById('rec-dlc').value || null;
        const lot = document.getElementById('rec-lot').value.trim();
        const origine = document.getElementById('rec-origine').value.trim();
        const emballage_ok = document.getElementById('rec-check-emballage').checked;
        const etiquetage_ok = document.getElementById('rec-check-etiquetage').checked;
        const vehicule_ok = document.getElementById('rec-check-vehicule').checked;
        const aspect_ok = document.getElementById('rec-check-aspect').checked;
        const conforme = document.querySelector('input[name="rec-conf"]:checked').value === 'oui';
        const commentaire = document.getElementById('rec-comment').value.trim();

        if (!fournisseur || !produit) {
            UI.toast('Remplissez le fournisseur et le produit', 'warning');
            return;
        }

        Storage.addReception({
            fournisseur, produit, temperature, quantite, dlc, lot, origine,
            emballage_ok, etiquetage_ok, vehicule_ok, aspect_ok,
            conforme, commentaire
        });

        if (!conforme) {
            Storage.addAlerte({
                type: 'reception',
                niveau: 'critique',
                titre: `Reception non conforme: ${produit}`,
                description: `Fournisseur: ${fournisseur}${temperature !== null ? ', Temp: ' + temperature + '\u00B0C' : ''}${lot ? ', Lot: ' + lot : ''}${commentaire ? '. ' + commentaire : ''}`
            });
            UI.updateAlertBadge();
            UI.toast('Reception NON CONFORME enregistree \u2014 Alerte creee', 'danger');
        } else {
            this._updateInventaireFromReception(produit, quantite, dlc);
            UI.toast(`Reception enregistree : ${fournisseur} \u2014 ${produit}`, 'success');
        }

        UI.closeModal();
        this.render();
    },

    _updateInventaireFromReception(produit, quantiteStr, dlc) {
        const parsed = this._parseQuantiteInput(quantiteStr);
        if (!parsed || !parsed.quantite || parsed.quantite <= 0) {
            return;
        }

        const config = Storage.getConfig();
        const items = Storage.getInventaire();
        const nomNorm = produit.toLowerCase();
        const unit = parsed.unite || this._getDefaultUnit(config.unites);
        const categorie = this._getDefaultCategorie(config.categories_inventaire);

        const existing = items.find(i => (i.nom || '').toLowerCase() === nomNorm && i.unite === unit);
        if (existing) {
            const newQty = (parseFloat(existing.quantite) || 0) + parsed.quantite;
            Storage.updateInventaireItem(existing.id, {
                quantite: newQty,
                dlc: existing.dlc || dlc || null
            });
        } else {
            Storage.addInventaireItem({
                nom: produit,
                categorie,
                quantite: parsed.quantite,
                unite: unit,
                dlc: dlc || null
            });
        }
    },

    _parseQuantiteInput(input) {
        if (!input) return null;
        const normalized = input.replace(',', '.').trim();
        const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
        if (!match) return null;
        const quantite = parseFloat(match[1]);
        if (!Number.isFinite(quantite)) return null;
        const unitRaw = (match[2] || '').trim().toLowerCase();
        const unite = unitRaw ? this._matchUnit(unitRaw) : null;
        return { quantite, unite };
    },

    _matchUnit(unitRaw) {
        const config = Storage.getConfig();
        const target = unitRaw.replace(/\s+/g, '').toLowerCase();
        const found = config.unites.find(u => u.replace(/\s+/g, '').toLowerCase() === target);
        return found || null;
    },

    _getDefaultUnit(units) {
        if (!Array.isArray(units) || units.length === 0) return 'unite(s)';
        const preferred = units.find(u => u.toLowerCase() === 'unite(s)');
        return preferred || units[0];
    },

    _getDefaultCategorie(categories) {
        if (!Array.isArray(categories) || categories.length === 0) return 'Consommables';
        const preferred = categories.find(c => c.toLowerCase() === 'consommables');
        return preferred || categories[0];
    },

    showDetail(id) {
        const records = Storage.getReceptions(this.selectedDate);
        const r = records.find(rec => rec.id === id);
        if (!r) return;

        const checks = [
            { label: 'Emballage intact', ok: r.emballage_ok },
            { label: 'Etiquetage conforme', ok: r.etiquetage_ok },
            { label: 'Vehicule propre', ok: r.vehicule_ok },
            { label: 'Aspect satisfaisant', ok: r.aspect_ok }
        ];

        const body = `
            <div style="display:grid;gap:0.5rem;">
                <div><strong>Fournisseur :</strong> ${UI.escapeHTML(r.fournisseur)}</div>
                <div><strong>Produit :</strong> ${UI.escapeHTML(r.produit)}</div>
                <div><strong>Temperature :</strong> ${r.temperature !== null ? r.temperature + '\u00B0C' : 'Non mesuree'}</div>
                <div><strong>Quantite :</strong> ${r.quantite || 'Non renseignee'}</div>
                <div><strong>DLC / DDM :</strong> ${r.dlc || 'Non renseignee'}</div>
                <div><strong>N. de lot :</strong> ${r.lot || 'Non renseigne'}</div>
                <div><strong>Origine :</strong> ${r.origine || 'Non renseignee'}</div>
                <div style="margin-top:0.5rem;">
                    <strong>Controles visuels :</strong>
                    ${checks.map(c =>
                        `<div style="margin-left:1rem;">${c.ok !== false ? '\u2705' : '\u274C'} ${c.label}</div>`
                    ).join('')}
                </div>
                <div><strong>Conformite :</strong> ${UI.conformityBadge(r.conforme)}</div>
                ${r.commentaire ? `<div><strong>Commentaire :</strong> ${UI.escapeHTML(r.commentaire)}</div>` : ''}
                <div style="color:var(--text-muted);font-size:0.85rem;">
                    Enregistre par ${UI.escapeHTML(r.user)} a ${Storage.formatTime(r.timestamp)}
                </div>
            </div>
        `;

        UI.openModal('Detail de la reception', body, '');
    }
};
