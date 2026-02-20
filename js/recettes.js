/* ============================================================
   OK CUISINE — Module Recettes / Fiches Techniques
   Gestion des fiches techniques de recettes, calcul de quantites
   pour X couverts, comparaison avec l'inventaire en stock,
   detection des allergenes par recette
   ============================================================ */

const Recettes = {
    filterCategorie: 'all',

    CATEGORIES: [
        'Entree',
        'Plat principal',
        'Accompagnement',
        'Dessert',
        'Sauce',
        'Autre'
    ],

    init() {
        // Initialisation des recettes au démarrage
    },

    render() {
        const page = document.getElementById('page-recettes');
        let recettes = Storage.getRecettes();

        // Filtre par categorie
        if (this.filterCategorie !== 'all') {
            recettes = recettes.filter(r => r.categorie === this.filterCategorie);
        }

        const totalRecettes = Storage.getRecettes().length;

        let catOptions = `<option value="all">Toutes les categories</option>`;
        catOptions += this.CATEGORIES.map(c =>
            `<option value="${c}" ${this.filterCategorie === c ? 'selected' : ''}>${c}</option>`
        ).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83D\uDCD6 Fiches Techniques</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Recettes.showAddModal()">
                        + Nouvelle fiche
                    </button>
                    <button class="btn btn-secondary" onclick="PDF.export('recettes')">
                        \uD83D\uDCC4 Exporter PDF
                    </button>
                </div>
            </div>

            <!-- Rappel reglementaire -->
            <div class="card" style="border-left:4px solid var(--info);">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Fiches techniques — Bonne pratique HACCP</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Recommandation :</strong> Chaque preparation doit disposer d'une fiche technique
                    detaillant les ingredients, quantites, allergenes et modes operatoires.
                    Cela garantit la reproductibilite, facilite le calcul des couts matieres
                    et assure la conformite aux obligations d'information sur les allergenes
                    (Reg. INCO 1169/2011).
                </p>
            </div>

            <!-- Filtre par categorie -->
            <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
                <select class="form-control" style="width:auto;min-width:200px;"
                        onchange="Recettes.filterCategorie=this.value; Recettes.render();">
                    ${catOptions}
                </select>
            </div>

            <!-- Stats -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Fiches techniques</div>
                    <div class="stat-value">${totalRecettes}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Affichees</div>
                    <div class="stat-value">${recettes.length}</div>
                </div>
            </div>

            <!-- Liste des recettes -->
            ${recettes.length === 0
                ? UI.emptyState('\uD83D\uDCD6', 'Aucune fiche technique. Cliquez sur "+ Nouvelle fiche" pour commencer.')
                : this._renderRecettes(recettes)
            }
        `;
    },

    _renderRecettes(recettes) {
        let html = '';
        for (const recette of recettes) {
            const nbIngredients = (recette.ingredients || []).length;
            const allergeneIcons = (recette.allergenes || []).map(id => {
                const a = Allergenes.LISTE_ALLERGENES.find(x => x.id === id);
                return a ? `<span title="${a.nom}">${a.icone}</span>` : '';
            }).join(' ');

            html += `
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">${UI.escapeHTML(recette.nom)}</span>
                        <span class="badge badge-info">${UI.escapeHTML(recette.categorie)}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-bottom:0.75rem;">
                        <div style="color:var(--text-secondary);font-size:0.9rem;">
                            <strong>Base :</strong> ${recette.couverts_base} couverts
                        </div>
                        <div style="color:var(--text-secondary);font-size:0.9rem;">
                            <strong>Ingredients :</strong> ${nbIngredients}
                        </div>
                        ${allergeneIcons
                            ? `<div style="font-size:1.1rem;" title="Allergenes presents">${allergeneIcons}</div>`
                            : `<div style="color:var(--success);font-size:0.85rem;">Aucun allergene</div>`
                        }
                    </div>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        <button class="btn btn-primary" style="padding:0.3rem 0.8rem;font-size:0.85rem;"
                                onclick="Recettes.showCalculModal('${recette.id}')">
                            \uD83E\uDDEE Calculer pour X couverts
                        </button>
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.85rem;"
                                onclick="Recettes.editRecette('${recette.id}')">Modifier</button>
                        <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.85rem;"
                                onclick="Recettes.deleteRecette('${recette.id}')">Supprimer</button>
                    </div>
                </div>
            `;
        }
        return html;
    },

    // ==================== AJOUTER UNE FICHE TECHNIQUE ====================

    _ingredientCounter: 0,

    showAddModal() {
        this._ingredientCounter = 0;
        const config = Storage.getConfig();

        const catOptions = this.CATEGORIES.map(c =>
            `<option value="${c}">${c}</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Nom de la recette</label>
                <input type="text" class="form-control form-control-lg" id="rec-nom"
                       placeholder="Ex: Blanquette de veau" autofocus>
            </div>
            <div class="form-group">
                <label>Categorie</label>
                <select class="form-control" id="rec-categorie">
                    ${catOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre de couverts (base)</label>
                <input type="number" class="form-control" id="rec-couverts" value="100" min="1">
            </div>

            <!-- Ingredients -->
            <div class="form-group">
                <label>Ingredients</label>
                <div id="rec-ingredients-list"></div>
                <button type="button" class="btn btn-secondary" style="margin-top:0.5rem;"
                        onclick="Recettes._addIngredientRow('rec-ingredients-list')">
                    + Ajouter un ingredient
                </button>
            </div>

            <!-- Allergenes -->
            <div class="form-group">
                <label>Allergenes presents</label>
                <div class="allergene-checkbox-grid">
                    ${Allergenes.LISTE_ALLERGENES.map(a => `
                        <label class="allergene-checkbox-item">
                            <input type="checkbox" class="rec-allerg-cb" value="${a.id}">
                            <span>${a.icone} ${a.nom}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Recettes.saveRecette()">Enregistrer</button>
        `;

        UI.openModal('Nouvelle fiche technique', body, footer);

        // Ajouter une premiere ligne d'ingredient par defaut
        setTimeout(() => this._addIngredientRow('rec-ingredients-list'), 50);
    },

    _addIngredientRow(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const config = Storage.getConfig();
        const categories = config.categories_inventaire || [];
        const unites = config.unites || ['kg', 'g', 'L', 'cL', 'unite(s)'];

        const idx = this._ingredientCounter++;
        const row = document.createElement('div');
        row.className = 'rec-ingredient-row';
        row.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap;';
        row.id = `rec-ing-row-${idx}`;

        const catOpts = categories.map(c => `<option value="${c}">${c}</option>`).join('');
        const unitOpts = unites.map(u => `<option value="${u}">${u}</option>`).join('');

        row.innerHTML = `
            <input type="text" class="form-control rec-ing-nom" placeholder="Nom" style="flex:2;min-width:120px;">
            <input type="number" step="0.01" class="form-control rec-ing-qty" placeholder="Qte" min="0" style="flex:1;min-width:70px;">
            <select class="form-control rec-ing-unite" style="flex:1;min-width:80px;">
                ${unitOpts}
            </select>
            <select class="form-control rec-ing-cat" style="flex:1.5;min-width:120px;">
                <option value="">-- Cat. inventaire --</option>
                ${catOpts}
            </select>
            <button type="button" class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.8rem;"
                    onclick="document.getElementById('rec-ing-row-${idx}').remove();">\u2715</button>
        `;
        container.appendChild(row);
    },

    _collectIngredients() {
        const rows = document.querySelectorAll('.rec-ingredient-row');
        const ingredients = [];
        rows.forEach(row => {
            const nom = row.querySelector('.rec-ing-nom').value.trim();
            const quantite = parseFloat(row.querySelector('.rec-ing-qty').value) || 0;
            const unite = row.querySelector('.rec-ing-unite').value;
            const categorie_inventaire = row.querySelector('.rec-ing-cat').value;
            if (nom) {
                ingredients.push({ nom, quantite, unite, categorie_inventaire });
            }
        });
        return ingredients;
    },

    saveRecette() {
        const nom = document.getElementById('rec-nom').value.trim();
        const categorie = document.getElementById('rec-categorie').value;
        const couverts_base = parseInt(document.getElementById('rec-couverts').value) || 100;
        const ingredients = this._collectIngredients();
        const allergenes = Array.from(document.querySelectorAll('.rec-allerg-cb:checked')).map(cb => cb.value);

        if (!nom) {
            UI.toast('Entrez un nom de recette', 'warning');
            return;
        }

        if (ingredients.length === 0) {
            UI.toast('Ajoutez au moins un ingredient', 'warning');
            return;
        }

        Storage.addRecette({ nom, categorie, couverts_base, ingredients, allergenes });
        Journal.log('recettes', `Fiche technique ajoutee : ${nom} (${ingredients.length} ingredient(s))`);
        UI.toast(`Fiche technique ajoutee : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    // ==================== MODIFIER UNE FICHE ====================

    editRecette(id) {
        const recettes = Storage.getRecettes();
        const recette = recettes.find(r => r.id === id);
        if (!recette) return;

        this._ingredientCounter = 0;
        const config = Storage.getConfig();

        const catOptions = this.CATEGORIES.map(c =>
            `<option value="${c}" ${recette.categorie === c ? 'selected' : ''}>${c}</option>`
        ).join('');

        const body = `
            <div class="form-group">
                <label>Nom de la recette</label>
                <input type="text" class="form-control form-control-lg" id="rec-edit-nom"
                       value="${UI.escapeHTML(recette.nom)}">
            </div>
            <div class="form-group">
                <label>Categorie</label>
                <select class="form-control" id="rec-edit-categorie">
                    ${catOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre de couverts (base)</label>
                <input type="number" class="form-control" id="rec-edit-couverts"
                       value="${recette.couverts_base}" min="1">
            </div>

            <!-- Ingredients -->
            <div class="form-group">
                <label>Ingredients</label>
                <div id="rec-edit-ingredients-list"></div>
                <button type="button" class="btn btn-secondary" style="margin-top:0.5rem;"
                        onclick="Recettes._addIngredientRow('rec-edit-ingredients-list')">
                    + Ajouter un ingredient
                </button>
            </div>

            <!-- Allergenes -->
            <div class="form-group">
                <label>Allergenes presents</label>
                <div class="allergene-checkbox-grid">
                    ${Allergenes.LISTE_ALLERGENES.map(a => `
                        <label class="allergene-checkbox-item">
                            <input type="checkbox" class="rec-edit-allerg-cb" value="${a.id}"
                                   ${(recette.allergenes || []).includes(a.id) ? 'checked' : ''}>
                            <span>${a.icone} ${a.nom}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Recettes.saveEditRecette('${id}')">Enregistrer</button>
        `;

        UI.openModal('Modifier la fiche technique', body, footer);

        // Peupler les ingredients existants
        setTimeout(() => {
            const ingredients = recette.ingredients || [];
            const container = document.getElementById('rec-edit-ingredients-list');
            if (!container) return;

            for (const ing of ingredients) {
                this._addIngredientRow('rec-edit-ingredients-list');
                const rows = container.querySelectorAll('.rec-ingredient-row');
                const lastRow = rows[rows.length - 1];
                if (lastRow) {
                    lastRow.querySelector('.rec-ing-nom').value = ing.nom;
                    lastRow.querySelector('.rec-ing-qty').value = ing.quantite;
                    lastRow.querySelector('.rec-ing-unite').value = ing.unite || 'kg';
                    lastRow.querySelector('.rec-ing-cat').value = ing.categorie_inventaire || '';
                }
            }
        }, 50);
    },

    saveEditRecette(id) {
        const nom = document.getElementById('rec-edit-nom').value.trim();
        const categorie = document.getElementById('rec-edit-categorie').value;
        const couverts_base = parseInt(document.getElementById('rec-edit-couverts').value) || 100;
        const ingredients = this._collectIngredients();
        const allergenes = Array.from(document.querySelectorAll('.rec-edit-allerg-cb:checked')).map(cb => cb.value);

        if (!nom) {
            UI.toast('Entrez un nom de recette', 'warning');
            return;
        }

        if (ingredients.length === 0) {
            UI.toast('Ajoutez au moins un ingredient', 'warning');
            return;
        }

        Storage.updateRecette(id, { nom, categorie, couverts_base, ingredients, allergenes });
        Journal.log('recettes', `Fiche technique modifiee : ${nom}`);
        UI.toast(`Fiche technique modifiee : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    // ==================== SUPPRIMER UNE FICHE ====================

    async deleteRecette(id) {
        const confirmed = await UI.confirm('Supprimer cette fiche technique ?', 'Cette action est irreversible.');
        if (confirmed) {
            const recettes = Storage.getRecettes();
            const recette = recettes.find(r => r.id === id);
            Storage.removeRecette(id);
            Journal.log('recettes', `Fiche technique supprimee : ${recette ? recette.nom : id}`);
            UI.toast('Fiche technique supprimee', 'info');
            this.render();
        }
    },

    // ==================== CALCUL POUR X COUVERTS ====================

    showCalculModal(id) {
        const recettes = Storage.getRecettes();
        const recette = recettes.find(r => r.id === id);
        if (!recette) return;

        const body = `
            <div class="form-group">
                <label>Recette : <strong>${UI.escapeHTML(recette.nom)}</strong></label>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin:0.25rem 0;">
                    Base : ${recette.couverts_base} couverts — ${(recette.ingredients || []).length} ingredient(s)
                </p>
            </div>
            <div class="form-group">
                <label>Nombre de couverts souhaites</label>
                <input type="number" class="form-control form-control-lg" id="rec-calc-couverts"
                       value="${recette.couverts_base}" min="1" autofocus
                       oninput="Recettes._updateCalcul('${id}')">
            </div>
            <div id="rec-calc-result">
                ${this._renderCalculResult(recette, recette.couverts_base)}
            </div>
        `;

        UI.openModal('Calcul des quantites', body, '');
    },

    _updateCalcul(id) {
        const recettes = Storage.getRecettes();
        const recette = recettes.find(r => r.id === id);
        if (!recette) return;

        const couverts = parseInt(document.getElementById('rec-calc-couverts').value) || 1;
        const container = document.getElementById('rec-calc-result');
        if (container) {
            container.innerHTML = this._renderCalculResult(recette, couverts);
        }
    },

    _renderCalculResult(recette, couvertsDemandes) {
        const base = recette.couverts_base || 100;
        const ratio = couvertsDemandes / base;
        const inventaire = Storage.getInventaire();
        const ingredients = recette.ingredients || [];

        let rows = '';
        for (const ing of ingredients) {
            const qteCalculee = Math.round((ing.quantite * ratio) * 100) / 100;
            const unite = ing.unite || '';

            // Comparer avec l'inventaire
            const stockItem = inventaire.find(item =>
                item.nom.toLowerCase() === ing.nom.toLowerCase() &&
                item.unite === ing.unite
            );
            const enStock = stockItem ? parseFloat(stockItem.quantite) || 0 : 0;
            const manquant = qteCalculee - enStock;

            let stockInfo = '';
            if (stockItem) {
                if (manquant > 0) {
                    stockInfo = `<span style="color:var(--danger);font-weight:600;">Manquant : ${Math.round(manquant * 100) / 100}${unite}</span>`;
                } else {
                    stockInfo = `<span style="color:var(--success);">OK (${enStock}${unite} en stock)</span>`;
                }
            } else {
                stockInfo = `<span style="color:var(--warning);">Non trouve en inventaire</span>`;
            }

            rows += `
                <tr>
                    <td><strong>${UI.escapeHTML(ing.nom)}</strong></td>
                    <td style="text-align:right;">${qteCalculee}</td>
                    <td>${UI.escapeHTML(unite)}</td>
                    <td>${stockInfo}</td>
                </tr>
            `;
        }

        // Allergenes detectes
        const allergenes = (recette.allergenes || []).map(id => {
            const a = Allergenes.LISTE_ALLERGENES.find(x => x.id === id);
            return a ? `<span class="allergene-tag">${a.icone} ${a.nom}</span>` : '';
        }).join(' ');

        return `
            <div style="margin-top:1rem;">
                <div style="background:var(--bg-card);padding:0.5rem 0.75rem;border-radius:var(--radius-sm);margin-bottom:1rem;font-size:0.9rem;">
                    Ratio : <strong>${couvertsDemandes}</strong> couverts / ${base} (base) = <strong>\u00D7${Math.round(ratio * 1000) / 1000}</strong>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th style="text-align:right;">Quantite</th>
                                <th>Unite</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>

                ${allergenes ? `
                    <div style="margin-top:1rem;padding:0.75rem;border-left:3px solid var(--warning);background:var(--bg-card);border-radius:var(--radius-sm);">
                        <strong>\u26A0\uFE0F Allergenes detectes :</strong><br>
                        <div style="margin-top:0.5rem;">${allergenes}</div>
                    </div>
                ` : `
                    <div style="margin-top:1rem;color:var(--success);font-size:0.9rem;">
                        Aucun allergene declare pour cette recette.
                    </div>
                `}
            </div>
        `;
    },

    // ==================== RECHERCHE PAR PRODUIT ====================

    getRecettesForProduit(produitNom) {
        const recettes = Storage.getRecettes();
        const nomLower = produitNom.toLowerCase();
        return recettes.filter(r =>
            (r.ingredients || []).some(ing => ing.nom.toLowerCase() === nomLower)
        );
    }
};
