/* ============================================================
   OK CUISINE — Module Allergenes
   Gestion des 14 allergenes obligatoires (Reg. INCO 1169/2011)
   Matrice allergenes par plat, affichage reglementaire
   ============================================================ */

const Allergenes = {
    // Les 14 allergenes a declaration obligatoire
    LISTE_ALLERGENES: [
        { id: 'gluten', nom: 'Gluten', detail: 'Ble, seigle, orge, avoine, epeautre, kamut', icone: '\uD83C\uDF3E' },
        { id: 'crustaces', nom: 'Crustaces', detail: 'Crabes, homard, crevettes, ecrevisses', icone: '\uD83E\uDD80' },
        { id: 'oeufs', nom: 'Oeufs', detail: 'Oeufs et produits a base d\'oeufs', icone: '\uD83E\uDD5A' },
        { id: 'poissons', nom: 'Poissons', detail: 'Poissons et produits a base de poissons', icone: '\uD83D\uDC1F' },
        { id: 'arachides', nom: 'Arachides', detail: 'Cacahuetes et produits a base d\'arachides', icone: '\uD83E\uDD5C' },
        { id: 'soja', nom: 'Soja', detail: 'Soja et produits a base de soja', icone: '\uD83C\uDF31' },
        { id: 'lait', nom: 'Lait', detail: 'Lait et produits a base de lait (y compris lactose)', icone: '\uD83E\uDD5B' },
        { id: 'fruits_coque', nom: 'Fruits a coque', detail: 'Amandes, noisettes, noix, cajou, pecan, noix du Bresil, pistaches, macadamia', icone: '\uD83C\uDF30' },
        { id: 'celeri', nom: 'Celeri', detail: 'Celeri et produits a base de celeri', icone: '\uD83E\uDDC5' },
        { id: 'moutarde', nom: 'Moutarde', detail: 'Moutarde et produits a base de moutarde', icone: '\uD83C\uDF36\uFE0F' },
        { id: 'sesame', nom: 'Graines de sesame', detail: 'Graines de sesame et produits a base de sesame', icone: '\u2B50' },
        { id: 'sulfites', nom: 'Sulfites', detail: 'Anhydride sulfureux et sulfites (> 10 mg/kg ou 10 mg/L en SO2)', icone: '\uD83E\uDDEA' },
        { id: 'lupin', nom: 'Lupin', detail: 'Lupin et produits a base de lupin', icone: '\uD83C\uDF3B' },
        { id: 'mollusques', nom: 'Mollusques', detail: 'Moules, huitres, calmars, escargots', icone: '\uD83D\uDC1A' }
    ],

    // Aide-memoire : produits contenant chaque allergene
    PRODUITS_PAR_ALLERGENE: {
        gluten: [
            'Pain et produits de boulangerie',
            'Pates (sauf mention "sans gluten")',
            'Farine de ble, seigle, orge, epeautre',
            'Biscuits, gateaux, viennoiseries',
            'Chapelure, panure',
            'Sauce soja (sauf tamari)',
            'Biere (sauf sans gluten)',
            'Couscous, semoule',
            'Pizzas, quiches, tartes',
            'Certains produits industriels (lire etiquettes)'
        ],
        crustaces: [
            'Crevettes, gambas',
            'Crabes, tourteaux',
            'Homard, langouste',
            'Ecrevisses',
            'Langoustines',
            'Bouillon de crustaces',
            'Bisque, soupe de crustaces',
            'Certaines sauces asiatiques',
            'Surimi (peut en contenir)'
        ],
        oeufs: [
            'Oeufs frais',
            'Mayonnaise',
            'Patisseries, gateaux',
            'Pates fraiches',
            'Quiches, omelettes',
            'Meringues, mousses',
            'Certaines sauces (hollandaise, bearnaise)',
            'Glaces, cremes dessert',
            'Panure, tempura'
        ],
        poissons: [
            'Tous les poissons frais',
            'Poissons surgeles',
            'Conserves de poisson (thon, sardines, etc.)',
            'Fumet et bouillon de poisson',
            'Anchois',
            'Sauce nuoc-mam',
            'Surimi (contient du poisson)',
            'Tarama',
            'Certains produits traiteur'
        ],
        arachides: [
            'Cacahuetes',
            'Beurre de cacahuete',
            'Huile d\'arachide',
            'Certains biscuits et confiseries',
            'Satay (sauce asiatique)',
            'Certaines patisseries',
            'Produits africains/asiatiques',
            'Nougat (peut en contenir)',
            'Aperitifs (melanges de fruits secs)'
        ],
        soja: [
            'Sauce soja',
            'Tofu, tempeh',
            'Lait de soja, yaourts au soja',
            'Edamame (feves de soja)',
            'Huile de soja',
            'Miso (pate de soja fermentee)',
            'Certains produits vegetariens',
            'Lecithine de soja (additif E322)',
            'Certains produits industriels'
        ],
        lait: [
            'Lait (entier, demi-ecreme, ecreme)',
            'Beurre, creme fraiche',
            'Fromages (tous types)',
            'Yaourts, fromage blanc',
            'Sauce bechamel',
            'Creme glacee',
            'Chocolat au lait',
            'Gratins, quiches',
            'Viennoiseries, patisseries',
            'Lactoserum, caséine (additifs)'
        ],
        fruits_coque: [
            'Amandes, noisettes, noix',
            'Noix de cajou, pistaches',
            'Noix de pecan, noix du Bresil',
            'Noix de macadamia',
            'Pate a tartiner (type Nutella)',
            'Nougat, praline',
            'Patisseries, biscuits',
            'Huiles de fruits a coque',
            'Pesto (contient des pignons)',
            'Muesli, granola'
        ],
        celeri: [
            'Celeri branche, celeri-rave',
            'Bouillons cubes industriels',
            'Soupes deshydratees',
            'Sauces et condiments prepares',
            'Mirepoix, garnitures aromatiques',
            'Certains melanges d\'epices',
            'Sel de celeri',
            'Jus de legumes'
        ],
        moutarde: [
            'Moutarde (forte, douce, a l\'ancienne)',
            'Sauce vinaigrette preparee',
            'Mayonnaise (certaines)',
            'Pickles, cornichons aromatises',
            'Certaines charcuteries',
            'Sauces prepares (barbecue, etc.)',
            'Graines de moutarde',
            'Certains plats prepares'
        ],
        sesame: [
            'Graines de sesame',
            'Huile de sesame',
            'Tahini (puree de sesame)',
            'Pain au sesame, burger buns',
            'Houmous (certains)',
            'Halva',
            'Certains produits asiatiques/orientaux',
            'Gomasio (condiment japonais)'
        ],
        sulfites: [
            'Vins, champagnes',
            'Fruits secs (abricots, raisins)',
            'Vinaigres',
            'Moutarde',
            'Cidre, biere',
            'Jus de fruits industriels',
            'Pommes de terre transformees',
            'Crevettes (conservation)',
            'Preparations a base de viande hachee'
        ],
        lupin: [
            'Farine de lupin',
            'Certains pains et viennoiseries',
            'Produits sans gluten (remplacement)',
            'Certaines pates',
            'Steaks vegetaux',
            'Graines de lupin (aperitif)',
            'Produits vegetariens/vegan'
        ],
        mollusques: [
            'Moules, huitres',
            'Calmars, seiches, poulpes',
            'Escargots',
            'Bulots, bigorneaux',
            'Palourdes, coques',
            'Saint-Jacques',
            'Encre de seiche',
            'Bouillon de mollusques',
            'Certaines sauces fruits de mer'
        ]
    },

    render() {
        const page = document.getElementById('page-allergenes');
        const plats = Storage.getAllergenePlats();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\u26A0\uFE0F Gestion des Allergenes</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Allergenes.showAddPlatModal()">
                        + Ajouter un plat
                    </button>
                    <button class="btn btn-secondary" onclick="Allergenes.showMatriceModal()">
                        \uD83D\uDCCB Matrice allergenes
                    </button>
                    <button class="btn btn-secondary" onclick="PDF.export('allergenes')">
                        \uD83D\uDCC4 Exporter PDF
                    </button>
                </div>
            </div>

            <!-- Rappel reglementaire -->
            <div class="card" style="border-left:4px solid var(--warning);">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Reglement INCO (UE) 1169/2011</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligation :</strong> L'information sur les allergenes doit etre communiquee par ecrit,
                    visible et lisible par le consommateur. Les 14 allergenes a declaration obligatoire doivent etre
                    identifies pour chaque plat propose.
                </p>
            </div>

            <!-- Les 14 allergenes -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Les 14 allergenes a declaration obligatoire</span>
                    <span style="font-size:0.85rem;color:var(--text-muted);font-weight:normal;">Cliquez sur un allergene pour voir les produits concernes</span>
                </div>
                <div class="allergene-grid">
                    ${this.LISTE_ALLERGENES.map(a => `
                        <div class="allergene-chip" onclick="Allergenes.showProduitsAllergene('${a.id}')" style="cursor:pointer;" title="Cliquer pour voir les produits contenant ${a.nom}">
                            <span class="allergene-icone">${a.icone}</span>
                            <div>
                                <div class="allergene-nom">${a.nom}</div>
                                <div class="allergene-detail">${a.detail}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Liste des plats avec allergenes -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDF7D\uFE0F Plats et allergenes associes</span>
                    <span class="badge badge-info">${plats.length} plat(s)</span>
                </div>
                ${plats.length === 0
                    ? UI.emptyState('\uD83C\uDF7D\uFE0F', 'Aucun plat enregistre. Ajoutez vos plats pour renseigner les allergenes.')
                    : this._renderPlats(plats)
                }
            </div>
        `;
    },

    _renderPlats(plats) {
        let html = '<div class="plats-list">';
        for (const plat of plats) {
            const allergenes = plat.allergenes || [];
            const allergeneNames = allergenes.map(id => {
                const a = this.LISTE_ALLERGENES.find(x => x.id === id);
                return a ? `<span class="allergene-tag">${a.icone} ${a.nom}</span>` : '';
            }).join(' ');

            html += `
                <div class="plat-card">
                    <div class="plat-header">
                        <div class="plat-nom">${UI.escapeHTML(plat.nom)}</div>
                        <div class="plat-actions">
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;"
                                    onclick="Allergenes.editPlat('${plat.id}')">Modifier</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;"
                                    onclick="Allergenes.deletePlat('${plat.id}')">Supprimer</button>
                        </div>
                    </div>
                    ${plat.categorie ? `<div class="plat-categorie">${UI.escapeHTML(plat.categorie)}</div>` : ''}
                    <div class="plat-allergenes">
                        ${allergenes.length > 0
                            ? allergeneNames
                            : '<span style="color:var(--success);">Aucun allergene declare</span>'
                        }
                    </div>
                    ${plat.ingredients ? `<div class="plat-ingredients"><strong>Ingredients :</strong> ${UI.escapeHTML(plat.ingredients)}</div>` : ''}
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    showAddPlatModal() {
        const body = `
            <div class="form-group">
                <label>Nom du plat</label>
                <input type="text" class="form-control form-control-lg" id="allerg-plat-nom"
                       placeholder="Ex: Gratin dauphinois" autofocus>
            </div>
            <div class="form-group">
                <label>Categorie</label>
                <select class="form-control" id="allerg-plat-cat">
                    <option value="Entree">Entree</option>
                    <option value="Plat principal">Plat principal</option>
                    <option value="Accompagnement">Accompagnement</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Sauce">Sauce / Condiment</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ingredients (optionnel)</label>
                <textarea class="form-control" id="allerg-plat-ingredients" rows="2"
                          placeholder="Liste des ingredients..."></textarea>
            </div>
            <div class="form-group">
                <label>Allergenes presents</label>
                <div class="allergene-checkbox-grid">
                    ${this.LISTE_ALLERGENES.map(a => `
                        <label class="allergene-checkbox-item">
                            <input type="checkbox" class="allerg-cb" value="${a.id}">
                            <span>${a.icone} ${a.nom}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Allergenes.savePlat()">Enregistrer</button>
        `;

        UI.openModal('Ajouter un plat', body, footer);
    },

    savePlat() {
        const nom = document.getElementById('allerg-plat-nom').value.trim();
        const categorie = document.getElementById('allerg-plat-cat').value;
        const ingredients = document.getElementById('allerg-plat-ingredients').value.trim();
        const allergenes = Array.from(document.querySelectorAll('.allerg-cb:checked')).map(cb => cb.value);

        if (!nom) {
            UI.toast('Entrez un nom de plat', 'warning');
            return;
        }

        Storage.addAllergenePlat({ nom, categorie, ingredients, allergenes });
        UI.toast(`Plat ajoute : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    editPlat(id) {
        const plats = Storage.getAllergenePlats();
        const plat = plats.find(p => p.id === id);
        if (!plat) return;

        const body = `
            <div class="form-group">
                <label>Nom du plat</label>
                <input type="text" class="form-control form-control-lg" id="allerg-edit-nom"
                       value="${UI.escapeHTML(plat.nom)}">
            </div>
            <div class="form-group">
                <label>Categorie</label>
                <select class="form-control" id="allerg-edit-cat">
                    ${['Entree', 'Plat principal', 'Accompagnement', 'Dessert', 'Sauce', 'Autre'].map(c =>
                        `<option value="${c}" ${plat.categorie === c ? 'selected' : ''}>${c}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Ingredients</label>
                <textarea class="form-control" id="allerg-edit-ingredients" rows="2">${plat.ingredients || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Allergenes presents</label>
                <div class="allergene-checkbox-grid">
                    ${this.LISTE_ALLERGENES.map(a => `
                        <label class="allergene-checkbox-item">
                            <input type="checkbox" class="allerg-edit-cb" value="${a.id}"
                                   ${(plat.allergenes || []).includes(a.id) ? 'checked' : ''}>
                            <span>${a.icone} ${a.nom}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Allergenes.saveEditPlat('${id}')">Enregistrer</button>
        `;

        UI.openModal('Modifier le plat', body, footer);
    },

    saveEditPlat(id) {
        const nom = document.getElementById('allerg-edit-nom').value.trim();
        const categorie = document.getElementById('allerg-edit-cat').value;
        const ingredients = document.getElementById('allerg-edit-ingredients').value.trim();
        const allergenes = Array.from(document.querySelectorAll('.allerg-edit-cb:checked')).map(cb => cb.value);

        if (!nom) {
            UI.toast('Entrez un nom de plat', 'warning');
            return;
        }

        Storage.updateAllergenePlat(id, { nom, categorie, ingredients, allergenes });
        UI.toast(`Plat modifie : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    async deletePlat(id) {
        const confirmed = await UI.confirm('Supprimer ce plat ?', 'Cette action est irreversible.');
        if (confirmed) {
            Storage.removeAllergenePlat(id);
            UI.toast('Plat supprime', 'info');
            this.render();
        }
    },

    showMatriceModal() {
        const plats = Storage.getAllergenePlats();
        if (plats.length === 0) {
            UI.toast('Ajoutez des plats avant de voir la matrice', 'warning');
            return;
        }

        let headerCells = this.LISTE_ALLERGENES.map(a =>
            `<th class="matrice-header" title="${a.nom}">${a.icone}</th>`
        ).join('');

        let rows = plats.map(plat => {
            let cells = this.LISTE_ALLERGENES.map(a => {
                const present = (plat.allergenes || []).includes(a.id);
                return `<td class="matrice-cell ${present ? 'present' : ''}">${present ? '\u2B55' : ''}</td>`;
            }).join('');
            return `<tr><td class="matrice-plat">${UI.escapeHTML(plat.nom)}</td>${cells}</tr>`;
        }).join('');

        const body = `
            <p style="color:var(--text-secondary);margin-bottom:1rem;font-size:0.9rem;">
                Matrice des allergenes par plat — Conforme au Reglement INCO (UE) 1169/2011
            </p>
            <div class="table-container" style="max-height:60vh;overflow:auto;">
                <table class="table matrice-table">
                    <thead>
                        <tr>
                            <th>Plat</th>
                            ${headerCells}
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted);">
                \u2B55 = Allergene present dans le plat
            </div>
        `;

        UI.openModal('Matrice des allergenes', body, '');
    },

    showProduitsAllergene(allergeneId) {
        const allergene = this.LISTE_ALLERGENES.find(a => a.id === allergeneId);
        if (!allergene) return;

        const produits = this.PRODUITS_PAR_ALLERGENE[allergeneId] || [];

        const body = `
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">${allergene.icone}</div>
                <div style="color:var(--text-secondary);font-size:0.95rem;">${allergene.detail}</div>
            </div>
            <div style="background:var(--bg-input);padding:1rem;border-radius:var(--radius);margin-bottom:1rem;">
                <strong style="color:var(--warning);">⚠️ Aide-memoire pour le cuisinier</strong>
                <p style="font-size:0.85rem;color:var(--text-secondary);margin:0.5rem 0 0 0;">
                    Liste non exhaustive des produits contenant generalement cet allergene. 
                    Toujours verifier les etiquettes des produits industriels.
                </p>
            </div>
            <div style="background:var(--bg-secondary);padding:1.5rem;border-radius:var(--radius);">
                <h4 style="margin:0 0 1rem 0;color:var(--accent);font-size:1.1rem;">📋 Produits concernes :</h4>
                <ul style="list-style:none;padding:0;margin:0;">
                    ${produits.map(p => `
                        <li style="padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.95rem;">
                            <span style="color:var(--success);margin-right:0.5rem;">✓</span>
                            ${p}
                        </li>
                    `).join('')}
                </ul>
                <div style="margin-top:1.5rem;padding-top:1rem;border-top:2px solid var(--border);text-align:center;color:var(--text-muted);font-size:0.85rem;">
                    Total : <strong style="color:var(--accent);">${produits.length} types de produits</strong>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-primary" onclick="UI.closeModal()">Fermer</button>
        `;

        UI.openModal(`${allergene.icone} ${allergene.nom}`, body, footer);
    }
};
