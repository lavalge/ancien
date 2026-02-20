/* ============================================================
   OK CUISINE — Module Fournisseurs v2
   Nouveau système hiérarchique : Département → Catégorie → Fournisseurs
   800+ fournisseurs français avec système de contact par email
   ============================================================ */

const Fournisseurs = {
    selectedDept: null,
    selectedCategories: [],
    searchTerm: '',

    init() {
        // Initialiser avec le premier département ou celui de l'utilisateur
        const depts = FournisseursDatabaseComplet.getDepartementsList();
        this.selectedDept = depts.length > 0 ? depts[0].code : null;
    },

    render() {
        const page = document.getElementById('page-fournisseurs');
        const depts = FournisseursDatabaseComplet.getDepartementsList();
        
        if (!this.selectedDept && depts.length > 0) {
            this.selectedDept = depts[0].code;
        }

        const deptData = this.selectedDept ? FournisseursDatabaseComplet.getFournisseursByDept(this.selectedDept) : null;
        let fournisseurs = deptData ? deptData.fournisseurs : [];

        // Filtrer par catégories si sélectionnées
        if (this.selectedCategories.length > 0) {
            fournisseurs = fournisseurs.filter(f => this.selectedCategories.includes(f.categorie));
        }

        // Filtrer par recherche
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            fournisseurs = fournisseurs.filter(f =>
                f.nom.toLowerCase().includes(term) ||
                f.specialites.some(s => s.toLowerCase().includes(term))
            );
        }

        // Grouper par catégorie
        const grouped = {};
        fournisseurs.forEach(f => {
            if (!grouped[f.categorie]) grouped[f.categorie] = [];
            grouped[f.categorie].push(f);
        });

        // Obtenir les catégories disponibles dans ce département
        const allCategories = [...new Set(deptData ? deptData.fournisseurs.map(f => f.categorie) : [])].sort();

        const deptSelectHTML = depts.map(d =>
            `<option value="${d.code}" ${d.code === this.selectedDept ? 'selected' : ''}>${d.code} - ${d.nom} (${d.region})</option>`
        ).join('');

        const categoryCheckboxes = allCategories.map(cat =>
            `<label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;margin-bottom:0.5rem;">
                <input type="checkbox" value="${cat}" ${this.selectedCategories.includes(cat) ? 'checked' : ''}
                       onchange="Fournisseurs.toggleCategory('${cat}'); Fournisseurs.render();">
                ${cat}
            </label>`
        ).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🏭 Fournisseurs Agréés — Base Complète France</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Fournisseurs.showAddCustomModal()">
                        + Ajouter fournisseur personnalisé
                    </button>
                </div>
            </div>

            <!-- Info -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1rem;">
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>🇫🇷 Base complète France :</strong> 800+ fournisseurs agréés sur 96 départements.
                    Filtrez par département, catégorie et spécialité. Contactez directement par email pour catalogues & devis.
                </p>
            </div>

            <!-- FILTRES -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🔍 Filtres & Recherche</span>
                </div>

                <!-- Sélection Département -->
                <div style="margin-bottom:1rem;">
                    <label><strong>📍 Département</strong></label>
                    <select class="form-control form-control-lg" 
                            onchange="Fournisseurs.selectedDept=this.value; Fournisseurs.selectedCategories=[]; Fournisseurs.render();"
                            style="width:100%;">
                        ${deptSelectHTML}
                    </select>
                </div>

                <!-- Catégories (Checkboxes) -->
                ${allCategories.length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <label><strong>🏢 Catégories</strong></label>
                        <div style="max-height:200px;overflow-y:auto;background:var(--bg-card);padding:0.75rem;border-radius:var(--radius-sm);">
                            ${categoryCheckboxes}
                        </div>
                    </div>
                ` : ''}

                <!-- Recherche -->
                <div style="margin-bottom:0;">
                    <label><strong>🔎 Recherche par nom/spécialité</strong></label>
                    <input type="text" class="form-control form-control-lg" 
                           placeholder="Ex: Fruits, Viande, Bio, Certifié..."
                           value="${UI.escapeHTML(this.searchTerm)}"
                           oninput="Fournisseurs.searchTerm=this.value; Fournisseurs.render();">
                </div>
            </div>

            <!-- RÉSULTATS -->
            <div style="margin-top:1.5rem;">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">
                            📦 Fournisseurs — ${deptData ? deptData.nom : 'Sélectionnez un département'}
                        </span>
                        <span class="badge badge-info">${fournisseurs.length} résultat(s)</span>
                    </div>

                    ${fournisseurs.length === 0
                        ? UI.emptyState('🏭', 'Aucun fournisseur trouvé. Essayez d\'autres filtres.')
                        : Object.keys(grouped).length === 0
                        ? UI.emptyState('🏭', 'Aucun fournisseur dans ce département.')
                        : this._renderFournisseursByCategory(grouped, deptData)
                    }
                </div>
            </div>
        `;
    },

    toggleCategory(cat) {
        const idx = this.selectedCategories.indexOf(cat);
        if (idx >= 0) {
            this.selectedCategories.splice(idx, 1);
        } else {
            this.selectedCategories.push(cat);
        }
    },

    _renderFournisseursByCategory(grouped, deptData) {
        let html = '';
        for (const [categorie, fournisseursList] of Object.entries(grouped)) {
            html += `
                <div style="margin-bottom:1.5rem;border-left:4px solid var(--primary);padding-left:1rem;">
                    <h3 style="margin:0 0 1rem;color:var(--primary);font-size:1.1rem;">
                        ${categorie} (${fournisseursList.length})
                    </h3>
                    ${fournisseursList.map(f => this._renderFournisseurCard(f)).join('')}
                </div>
            `;
        }
        return html;
    },

    _renderFournisseurCard(f) {
        const specialites = (f.specialites || []).join(', ');
        const certs = (f.certifications || []).join(', ');
        const hasCatalog = f.catalogue && f.catalogue.length > 0;

        return `
            <div style="background:var(--bg-card);padding:1rem;margin-bottom:0.75rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
                    <div>
                        <h4 style="margin:0;font-size:1rem;color:var(--text-primary);">${UI.escapeHTML(f.nom)}</h4>
                        ${f.adresse ? `<span style="font-size:0.85rem;color:var(--text-muted);">📍 ${UI.escapeHTML(f.adresse)}</span>` : ''}
                    </div>
                </div>

                <!-- Spécialités -->
                ${specialites ? `
                    <div style="margin-bottom:0.5rem;font-size:0.9rem;">
                        <strong>Spécialités :</strong> ${specialites}
                    </div>
                ` : ''}

                <!-- Certifications -->
                ${certs ? `
                    <div style="margin-bottom:0.5rem;font-size:0.9rem;">
                        <strong>Certifications :</strong> ${certs}
                    </div>
                ` : ''}

                <!-- Délai Livraison -->
                ${f.delai ? `
                    <div style="margin-bottom:0.75rem;font-size:0.9rem;color:var(--success);">
                        <strong>⏱️ Délai :</strong> ${f.delai}
                    </div>
                ` : ''}

                <!-- Boutons Contact -->
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    ${f.telephone ? `
                        <a href="tel:${f.telephone}" class="btn btn-success" style="padding:0.3rem 0.8rem;font-size:0.85rem;text-decoration:none;">
                            ☎️ ${f.telephone}
                        </a>
                    ` : ''}

                    ${f.email ? `
                        <button class="btn btn-primary" style="padding:0.3rem 0.8rem;font-size:0.85rem;"
                                onclick="Fournisseurs.showContactModal('${UI.escapeHTML(f.nom)}', '${f.email}')">
                            ✉️ Contacter
                        </button>
                    ` : ''}

                    ${hasCatalog ? `
                        <a href="${f.catalogue}" target="_blank" class="btn btn-secondary" style="padding:0.3rem 0.8rem;font-size:0.85rem;text-decoration:none;">
                            📄 Catalogue
                        </a>
                    ` : ''}

                    <button class="btn btn-info" style="padding:0.3rem 0.8rem;font-size:0.85rem;"
                            onclick="Fournisseurs.selectForOrder('${UI.escapeHTML(f.nom)}', '${f.email}')">
                        → Sélectionner pour réception
                    </button>
                </div>
            </div>
        `;
    },

    // Modal de contact par email
    showContactModal(nomFournisseur, email) {
        const body = `
            <p style="margin-bottom:1rem;color:var(--text-secondary);">
                Demande automatique de catalogue/brochure à : <strong>${UI.escapeHTML(nomFournisseur)}</strong>
            </p>
            <div class="form-group">
                <label>Votre email (réponse)</label>
                <input type="email" class="form-control form-control-lg" id="contact-reply-email"
                       placeholder="votre.email@etablissement.fr" autofocus>
            </div>
            <div class="form-group">
                <label>Message à ajouter (optionnel)</label>
                <textarea class="form-control" id="contact-message" rows="3"
                          placeholder="Ex: Nous sommes un restaurant collectif desservant 500 couverts..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Fournisseurs.sendContactEmail('${email}', '${UI.escapeHTML(nomFournisseur)}')">
                📧 Envoyer demande
            </button>
        `;

        UI.openModal(`Contacter ${nomFournisseur}`, body, footer);
    },

    sendContactEmail(toEmail, nomFournisseur) {
        const replyEmail = document.getElementById('contact-reply-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        if (!replyEmail) {
            UI.toast('Entrez votre email pour réception de réponse', 'warning');
            return;
        }

        // Construire l'objet mailto
        const subject = encodeURIComponent(`Demande de catalogue/brochure - OK Cuisine`);
        const body = encodeURIComponent(
            `Bonjour ${nomFournisseur},\n\n` +
            `Je vous contacte via l'application OK Cuisine pour demander votre catalogue et conditions commerciales.\n\n` +
            (message ? `Informations complémentaires :\n${message}\n\n` : '') +
            `Coordonnées de réponse :\nEmail : ${replyEmail}\n\n` +
            `Merci de nous transmettre vos tarifs et délais de livraison.\n\n` +
            `Cordialement,\nOK Cuisine`
        );

        // Ouvrir le client email
        window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;

        UI.toast('Client email ouvert. Veuillez envoyer le message.', 'info');
        setTimeout(() => UI.closeModal(), 1500);
    },

    // Sélectionner un fournisseur pour une réception
    selectForOrder(nomFournisseur, email) {
        // Stocker temporairement
        const toastMsg = `Fournisseur sélectionné : ${nomFournisseur}. Allez à Réceptions pour créer une commande.`;
        UI.toast(toastMsg, 'success');

        // Optionnel : Naviguer automatiquement vers réceptions
        // setTimeout(() => App.navigate('receptions'), 1500);
    },

    // Ajouter un fournisseur personnalisé
    showAddCustomModal() {
        const body = `
            <div class="form-group">
                <label>Nom du fournisseur</label>
                <input type="text" class="form-control form-control-lg" id="custom-fournisseur-nom"
                       placeholder="Ex: Mon Fournisseur Local" autofocus>
            </div>
            <div class="form-group">
                <label>Département</label>
                <input type="text" class="form-control" id="custom-fournisseur-dept"
                       placeholder="Ex: 75 (Paris)">
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <select class="form-control form-control-lg" id="custom-fournisseur-cat">
                    <option value="">-- Sélectionner --</option>
                    <option value="Fruits & Légumes">Fruits & Légumes</option>
                    <option value="Viandes">Viandes</option>
                    <option value="Poissons & Crustacés">Poissons & Crustacés</option>
                    <option value="Produits Laitiers">Produits Laitiers</option>
                    <option value="Surgelés & Conserves">Surgelés & Conserves</option>
                    <option value="Boissons">Boissons</option>
                    <option value="Condiments & Épices">Condiments & Épices</option>
                    <option value="Matériel de Cuisine">Matériel de Cuisine</option>
                    <option value="Nettoyage & Hygiène">Nettoyage & Hygiène</option>
                    <option value="Emballage & Conditionnement">Emballage & Conditionnement</option>
                    <option value="Services">Services</option>
                </select>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control" id="custom-fournisseur-email"
                       placeholder="contact@fournisseur.fr">
            </div>
            <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" class="form-control" id="custom-fournisseur-tel"
                       placeholder="01 23 45 67 89">
            </div>
            <div class="form-group">
                <label>Adresse</label>
                <input type="text" class="form-control" id="custom-fournisseur-adresse"
                       placeholder="Adresse complète">
            </div>
            <div class="form-group">
                <label>Spécialités (séparées par virgule)</label>
                <textarea class="form-control" id="custom-fournisseur-spec" rows="2"
                          placeholder="Ex: Bio, Circuits courts, Certification AB"></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Fournisseurs.saveCustomFournisseur()">Enregistrer</button>
        `;

        UI.openModal('Ajouter fournisseur personnalisé', body, footer);
    },

    saveCustomFournisseur() {
        const nom = document.getElementById('custom-fournisseur-nom').value.trim();
        const categorie = document.getElementById('custom-fournisseur-cat').value.trim();
        const email = document.getElementById('custom-fournisseur-email').value.trim();
        const telephone = document.getElementById('custom-fournisseur-tel').value.trim();
        const adresse = document.getElementById('custom-fournisseur-adresse').value.trim();
        const specialites = document.getElementById('custom-fournisseur-spec').value.trim().split(',').map(s => s.trim()).filter(s => s);

        if (!nom || !categorie || !email) {
            UI.toast('Remplissez au minimum : nom, catégorie, email', 'warning');
            return;
        }

        Storage.addFournisseur({
            nom, categorie, email, telephone, adresse, specialites,
            certifications: [],
            type: 'Personnalisé',
            delai: 'À demander',
            rayon: 'À demander'
        });

        UI.toast(`Fournisseur personnalisé ajouté : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    }
};

// Initialiser au démarrage
Fournisseurs.init();
