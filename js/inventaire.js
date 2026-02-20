/* ============================================================
   OK CUISINE — Module Inventaire
   Gestion des stocks, ajout, modification, suppression
   ============================================================ */

const Inventaire = {
    filterCategory: 'all',
    searchTerm: '',

    render() {
        const page = document.getElementById('page-inventaire');
        const config = Storage.getConfig();
        let items = Storage.getInventaire();

        // Filtres
        if (this.filterCategory !== 'all') {
            items = items.filter(i => i.categorie === this.filterCategory);
        }
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            items = items.filter(i => i.nom.toLowerCase().includes(term));
        }

        // Grouper par catégorie
        const grouped = {};
        items.forEach(item => {
            const cat = item.categorie || 'Non classé';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });

        const totalItems = Storage.getInventaire().length;
        const categories = config.categories_inventaire;

        let catOptions = `<option value="all">Toutes les catégories</option>`;
        catOptions += categories.map(c => `<option value="${c}" ${this.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">📋 Inventaire</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Inventaire.showAddModal()">
                        + Ajouter un produit
                    </button>
                    <button class="btn btn-secondary" onclick="PDF.export('inventaire')">
                        📄 Exporter PDF
                    </button>
                </div>
            </div>

            <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
                <select class="form-control" style="width:auto;min-width:200px;"
                        onchange="Inventaire.filterCategory=this.value; Inventaire.render();">
                    ${catOptions}
                </select>
                <input type="text" class="form-control" style="width:auto;min-width:200px;"
                       placeholder="Rechercher..." value="${UI.escapeHTML(this.searchTerm)}"
                       oninput="Inventaire.searchTerm=this.value; Inventaire.render();">
            </div>

            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Produits en stock</div>
                    <div class="stat-value">${totalItems}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Catégories</div>
                    <div class="stat-value">${Object.keys(grouped).length}</div>
                </div>
            </div>

            ${Object.keys(grouped).length === 0
                ? UI.emptyState('📋', 'Inventaire vide. Ajoutez des produits.')
                : this._renderGroups(grouped)
            }
        `;
    },

    _renderGroups(grouped) {
        let html = '';
        for (const [cat, items] of Object.entries(grouped)) {
            html += `
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">${cat}</span>
                        <span class="badge badge-info">${items.length} produit(s)</span>
                    </div>
                    ${items.map(item => `
                        <div class="inv-item">
                            <div class="inv-item-name">${UI.escapeHTML(item.nom)}</div>
                            <div class="inv-item-qty">${item.quantite}</div>
                            <div class="inv-item-unit">${item.unite}</div>
                            <div class="inv-item-actions">
                                <button onclick="Inventaire.adjustQty('${item.id}', -1)" title="Moins">−</button>
                                <button onclick="Inventaire.adjustQty('${item.id}', 1)" title="Plus">+</button>
                                <button onclick="Inventaire.editItem('${item.id}')" title="Modifier">✏️</button>
                                <button onclick="Inventaire.deleteItem('${item.id}')" title="Supprimer" style="color:var(--danger);">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        return html;
    },

    adjustQty(id, delta) {
        const items = Storage.getInventaire();
        const item = items.find(i => i.id === id);
        if (!item) return;

        const newQty = Math.max(0, (parseFloat(item.quantite) || 0) + delta);
        Storage.updateInventaireItem(id, { quantite: newQty });
        this.render();
    },

    showAddModal() {
        const config = Storage.getConfig();
        let catOptions = config.categories_inventaire.map(c =>
            `<option value="${c}">${c}</option>`
        ).join('');

        let unitOptions = config.unites.map(u =>
            `<option value="${u}">${u}</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Nom du produit</label>
                <input type="text" class="form-control form-control-lg" id="inv-nom"
                       placeholder="Ex: Carottes" autofocus>
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <select class="form-control" id="inv-cat">
                    ${catOptions}
                </select>
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>Quantité</label>
                    <input type="number" step="0.1" class="form-control form-control-lg" id="inv-qty"
                           placeholder="Ex: 10" min="0">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Unité</label>
                    <select class="form-control form-control-lg" id="inv-unit">
                        ${unitOptions}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>DLC (optionnel)</label>
                <input type="date" class="form-control" id="inv-dlc">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Inventaire.saveFromModal()">Ajouter</button>
        `;

        UI.openModal('Ajouter un produit', body, footer);
    },

    saveFromModal() {
        const nom = document.getElementById('inv-nom').value.trim();
        const categorie = document.getElementById('inv-cat').value;
        const quantite = parseFloat(document.getElementById('inv-qty').value) || 0;
        const unite = document.getElementById('inv-unit').value;
        const dlc = document.getElementById('inv-dlc').value || null;

        if (!nom) {
            UI.toast('Entrez un nom de produit', 'warning');
            return;
        }

        Storage.addInventaireItem({ nom, categorie, quantite, unite, dlc });
        UI.toast(`Ajouté à l'inventaire : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    editItem(id) {
        const items = Storage.getInventaire();
        const item = items.find(i => i.id === id);
        if (!item) return;

        const config = Storage.getConfig();
        let catOptions = config.categories_inventaire.map(c =>
            `<option value="${c}" ${item.categorie === c ? 'selected' : ''}>${c}</option>`
        ).join('');

        let unitOptions = config.unites.map(u =>
            `<option value="${u}" ${item.unite === u ? 'selected' : ''}>${u}</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Nom du produit</label>
                <input type="text" class="form-control form-control-lg" id="inv-edit-nom"
                       value="${UI.escapeHTML(item.nom)}">
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <select class="form-control" id="inv-edit-cat">
                    ${catOptions}
                </select>
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>Quantité</label>
                    <input type="number" step="0.1" class="form-control form-control-lg" id="inv-edit-qty"
                           value="${item.quantite}" min="0">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Unité</label>
                    <select class="form-control form-control-lg" id="inv-edit-unit">
                        ${unitOptions}
                    </select>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Inventaire.saveEdit('${id}')">Enregistrer</button>
        `;

        UI.openModal('Modifier le produit', body, footer);
    },

    saveEdit(id) {
        const nom = document.getElementById('inv-edit-nom').value.trim();
        const categorie = document.getElementById('inv-edit-cat').value;
        const quantite = parseFloat(document.getElementById('inv-edit-qty').value) || 0;
        const unite = document.getElementById('inv-edit-unit').value;

        if (!nom) {
            UI.toast('Entrez un nom de produit', 'warning');
            return;
        }

        Storage.updateInventaireItem(id, { nom, categorie, quantite, unite });
        UI.toast(`Produit modifié : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    async deleteItem(id) {
        const confirmed = await UI.confirm('Supprimer ce produit ?', 'Cette action est irréversible.');
        if (confirmed) {
            Storage.removeInventaireItem(id);
            UI.toast('Produit supprimé', 'info');
            this.render();
        }
    }
};
