/* ============================================================
   OK CUISINE — Storage Layer
   Gestion de la persistance des donnees avec localStorage
   ============================================================ */

const Storage = {
    PREFIX: 'okc_',
    DASHBOARD_LAYOUT_KEY: 'dashboard_layout',

    // --- Fonction de hash sécurisé pour PIN ---
    hashPin(pin) {
        // Génère un hash avec salt constant - irréversible
        const salt = 'okc_2025_v1';
        const combined = salt + pin;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & 0xFFFFFFFF; // 32-bit integer
        }
        return 'h' + Math.abs(hash).toString(16).toLowerCase();
    },

    // --- Utilitaires ---
    _key(name) {
        return this.PREFIX + name;
    },

    save(name, data) {
        try {
            localStorage.setItem(this._key(name), JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            return false;
        }
    },

    load(name, defaultValue = null) {
        try {
            const raw = localStorage.getItem(this._key(name));
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    },

    remove(name) {
        localStorage.removeItem(this._key(name));
    },

    getDashboardLayout(defaultLayout = []) {
        return this.load(this.DASHBOARD_LAYOUT_KEY, defaultLayout);
    },

    saveDashboardLayout(layout) {
        return this.save(this.DASHBOARD_LAYOUT_KEY, layout);
    },

    addDays(dateString, days) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // --- Donnees par defaut ---
    getDefaultConfig() {
        return {
            etablissement: 'Ma Cuisine',
            zones_temperature: [
                { id: 'frigo_legumes', nom: 'Frigo legumes', min: 0, max: 4 },
                { id: 'frigo_viandes', nom: 'Frigo viandes', min: 0, max: 3 },
                { id: 'frigo_produits_laitiers', nom: 'Frigo produits laitiers', min: 0, max: 4 },
                { id: 'frigo_poissons', nom: 'Frigo poissons', min: 0, max: 2 },
                { id: 'chambre_froide_positive', nom: 'Chambre froide positive', min: 0, max: 3 },
                { id: 'chambre_froide_negative', nom: 'Chambre froide negative', min: -25, max: -18 },
                { id: 'congelateur', nom: 'Congelateur', min: -25, max: -18 },
                { id: 'bain_marie', nom: 'Bain-marie / Maintien chaud', min: 63, max: 90 },
                { id: 'vitrine_froide', nom: 'Vitrine froide', min: 0, max: 4 }
            ],
            zones_nettoyage: [
                { id: 'plan_travail', nom: 'Plan de travail' },
                { id: 'planches_decoupe', nom: 'Planches a decouper' },
                { id: 'lavabo', nom: 'Lavabo' },
                { id: 'plonge', nom: 'Plonge' },
                { id: 'surface_table', nom: 'Surface / Tables' },
                { id: 'sol', nom: 'Sol' },
                { id: 'four', nom: 'Four' },
                { id: 'friteuse', nom: 'Friteuse' },
                { id: 'hotte', nom: 'Hotte' },
                { id: 'trancheuse', nom: 'Trancheuse' },
                { id: 'chambre_froide', nom: 'Chambre froide' },
                { id: 'refrigerateurs', nom: 'Refrigerateurs' },
                { id: 'poignees_interrupteurs', nom: 'Poignees / Interrupteurs' },
                { id: 'vestiaire', nom: 'Vestiaire' },
                { id: 'sanitaires', nom: 'Sanitaires' },
                { id: 'poubelles', nom: 'Poubelles / Zone dechets' },
                { id: 'materiel', nom: 'Materiel / Ustensiles' }
            ],
            produits_nettoyage: [
                'Degraissant', 'Desinfectant', 'Detergent', 'Eau de javel',
                'Produit sol', 'Nettoyant four', 'Degraissant hotte',
                'Produit vaisselle', 'Produit vitre', 'Desinfectant alimentaire',
                'Detergent-desinfectant', 'Detartrant'
            ],
            categories_inventaire: [
                'Legumes', 'Fruits', 'Viandes', 'Poissons', 'Produits laitiers',
                'Epicerie seche', 'Surgeles', 'Boissons', 'Condiments', 'Pain',
                'Conserves', 'Produits d\'entretien', 'Consommables'
            ],
            unites: ['kg', 'g', 'L', 'cL', 'unite(s)', 'lot(s)', 'carton(s)', 'barquette(s)', 'sachet(s)'],
            fournisseurs_agrees: [],
            users: [
                { id: 'admin', nom: 'Administrateur', pin: '2607', role: 'admin', initiales: 'AD' }
            ]
        };
    },

    // --- Acces aux donnees ---
    getConfig() {
        return this.load('config', this.getDefaultConfig());
    },

    saveConfig(config) {
        return this.save('config', config);
    },

    getUsers() {
        const config = this.getConfig();
        return config.users || [];
    },

    // Temperatures
    getTemperatures(date) {
        const key = 'temp_' + (date || this.today());
        return this.load(key, []);
    },

    addTemperature(entry) {
        const key = 'temp_' + this.today();
        const list = this.load(key, []);
        entry.id = this.uid();
        entry.timestamp = new Date().toISOString();
        entry.date = this.today();
        entry.user = App.currentUser?.nom || 'Inconnu';
        list.push(entry);
        this.save(key, list);
        Journal.log('temperature', `Temperature ${entry.zone_nom}: ${entry.valeur}\u00B0C`, entry);
        return entry;
    },

    // CCP Records (cuisson, refroidissement, remise en temperature)
    getCCPRecords(date) {
        const key = 'ccp_' + (date || this.today());
        return this.load(key, []);
    },

    addCCPRecord(entry) {
        const key = 'ccp_' + this.today();
        const list = this.load(key, []);
        entry.id = this.uid();
        entry.timestamp = new Date().toISOString();
        entry.date = this.today();
        entry.user = App.currentUser?.nom || 'Inconnu';
        list.push(entry);
        this.save(key, list);
        const typeLabels = { cuisson: 'Cuisson', refroidissement: 'Refroidissement', remise_temp: 'Remise en temp.' };
        Journal.log('ccp', `CCP ${typeLabels[entry.type_ccp] || entry.type_ccp}: ${entry.produit}${entry.temp_mesuree != null ? ' (' + entry.temp_mesuree + '\u00B0C)' : ''}`, entry);
        return entry;
    },

    // Nettoyage
    getNettoyages(date) {
        const key = 'net_' + (date || this.today());
        return this.load(key, []);
    },

    addNettoyage(entry) {
        const key = 'net_' + this.today();
        const list = this.load(key, []);
        entry.id = this.uid();
        entry.timestamp = new Date().toISOString();
        entry.date = this.today();
        entry.user = App.currentUser?.nom || 'Inconnu';
        list.push(entry);
        this.save(key, list);
        Journal.log('nettoyage', `Nettoyage: ${entry.zones.join(', ')}`, entry);
        return entry;
    },

    // Receptions
    getReceptions(date) {
        const key = 'rec_' + (date || this.today());
        return this.load(key, []);
    },

    addReception(entry) {
        const key = 'rec_' + this.today();
        const list = this.load(key, []);
        entry.id = this.uid();
        entry.timestamp = new Date().toISOString();
        entry.date = this.today();
        entry.user = App.currentUser?.nom || 'Inconnu';
        list.push(entry);
        this.save(key, list);
        Journal.log('reception', `Reception: ${entry.fournisseur} \u2014 ${entry.produit}${entry.lot ? ' (Lot: ' + entry.lot + ')' : ''}`, entry);
        return entry;
    },

    // Inventaire
    getInventaire() {
        return this.load('inventaire', []);
    },

    saveInventaire(items) {
        return this.save('inventaire', items);
    },

    addInventaireItem(item) {
        const list = this.getInventaire();
        item.id = this.uid();
        item.date_ajout = new Date().toISOString();
        list.push(item);
        this.saveInventaire(list);
        Journal.log('inventaire', `Inventaire: ajout ${item.nom} (${item.quantite} ${item.unite})`, item);
        return item;
    },

    updateInventaireItem(id, updates) {
        const list = this.getInventaire();
        const idx = list.findIndex(i => i.id === id);
        if (idx >= 0) {
            Object.assign(list[idx], updates);
            list[idx].date_modif = new Date().toISOString();
            this.saveInventaire(list);
            Journal.log('inventaire', `Inventaire: modif ${list[idx].nom} (${list[idx].quantite} ${list[idx].unite})`, list[idx]);
        }
        return list[idx];
    },

    removeInventaireItem(id) {
        let list = this.getInventaire();
        const item = list.find(i => i.id === id);
        list = list.filter(i => i.id !== id);
        this.saveInventaire(list);
        if (item) Journal.log('inventaire', `Inventaire: supprime ${item.nom}`, item);
    },

    // Alertes
    getAlertes() {
        return this.load('alertes', []);
    },

    addAlerte(alerte) {
        const list = this.getAlertes();
        alerte.id = this.uid();
        alerte.timestamp = new Date().toISOString();
        alerte.resolved = false;
        alerte.user = App.currentUser?.nom || 'Systeme';
        list.unshift(alerte);
        this.save('alertes', list);
        Journal.log('alerte', `Alerte: ${alerte.titre}`, alerte);
        return alerte;
    },

    resolveAlerte(id, comment) {
        const list = this.getAlertes();
        const alerte = list.find(a => a.id === id);
        if (alerte) {
            alerte.resolved = true;
            alerte.resolved_at = new Date().toISOString();
            alerte.resolved_by = App.currentUser?.nom || 'Inconnu';
            alerte.resolved_comment = comment || '';
            this.save('alertes', list);
            Journal.log('alerte', `Alerte resolue: ${alerte.titre}`, alerte);
        }
        return alerte;
    },

    // Journal
    getJournal(date) {
        const key = 'journal_' + (date || this.today());
        return this.load(key, []);
    },

    addJournalEntry(entry) {
        const key = 'journal_' + this.today();
        const list = this.load(key, []);
        entry.id = this.uid();
        entry.timestamp = new Date().toISOString();
        entry.user = App.currentUser?.nom || 'Systeme';
        list.push(entry);
        this.save(key, list);
    },

    // Allergenes — Plats
    getAllergenePlats() {
        return this.load('allergene_plats', []);
    },

    addAllergenePlat(plat) {
        const list = this.getAllergenePlats();
        plat.id = this.uid();
        plat.date_ajout = new Date().toISOString();
        list.push(plat);
        this.save('allergene_plats', list);
        Journal.log('allergenes', `Plat ajoute: ${plat.nom} (${(plat.allergenes || []).length} allergene(s))`, plat);
        return plat;
    },

    updateAllergenePlat(id, updates) {
        const list = this.getAllergenePlats();
        const idx = list.findIndex(p => p.id === id);
        if (idx >= 0) {
            Object.assign(list[idx], updates);
            this.save('allergene_plats', list);
            Journal.log('allergenes', `Plat modifie: ${list[idx].nom}`, list[idx]);
        }
        return list[idx];
    },

    removeAllergenePlat(id) {
        let list = this.getAllergenePlats();
        const plat = list.find(p => p.id === id);
        list = list.filter(p => p.id !== id);
        this.save('allergene_plats', list);
        if (plat) Journal.log('allergenes', `Plat supprime: ${plat.nom}`, plat);
    },

    // Etiquettes de deconditionement
    getEtiquettes() {
        return this.load('etiquettes', []);
    },

    addEtiquette(etiq) {
        const list = this.getEtiquettes();
        etiq.id = this.uid();
        etiq.timestamp = new Date().toISOString();
        etiq.user = App.currentUser?.nom || 'Inconnu';
        list.push(etiq);
        this.save('etiquettes', list);
        Journal.log('tracabilite', `Etiquette: ${etiq.produit} (DLC: ${etiq.dlc_secondaire})`, etiq);
        return etiq;
    },

    removeEtiquette(id) {
        let list = this.getEtiquettes();
        const etiq = list.find(e => e.id === id);
        list = list.filter(e => e.id !== id);
        this.save('etiquettes', list);
        if (etiq) Journal.log('tracabilite', `Etiquette supprimee: ${etiq.produit}`, etiq);
    },

    // Plats temoins
    getPlatsTemoins() {
        return this.load('plats_temoins', []);
    },

    addPlatTemoin(temoin) {
        const list = this.getPlatsTemoins();
        temoin.id = this.uid();
        temoin.timestamp = new Date().toISOString();
        temoin.user = App.currentUser?.nom || 'Inconnu';
        list.push(temoin);
        this.save('plats_temoins', list);
        Journal.log('tracabilite', `Plat temoin: ${temoin.plat} (service: ${temoin.date_service})`, temoin);
        return temoin;
    },

    // Controles huiles de friture
    getControlesHuiles() {
        return this.load('controles_huiles', []);
    },

    addControleHuile(controle) {
        const list = this.getControlesHuiles();
        controle.id = this.uid();
        controle.timestamp = new Date().toISOString();
        controle.user = App.currentUser?.nom || 'Inconnu';
        list.push(controle);
        this.save('controles_huiles', list);
        Journal.log('huile', `Controle huile: ${controle.friteuse} (${controle.taux_polaire}%)`, controle);
        return controle;
    },

    // DLC monitoring — check for approaching/exceeded DLC in inventory
    checkDLCAlerts() {
        const items = this.getInventaire();
        const etiquettes = this.getEtiquettes();
        const today = new Date(this.today());
        const alerts = [];

        // Check inventory DLC
        for (const item of items) {
            if (!item.dlc) continue;
            const dlcDate = new Date(item.dlc);
            const diffDays = Math.ceil((dlcDate - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                alerts.push({
                    type: 'dlc_depassee',
                    niveau: 'critique',
                    item: item.nom,
                    message: `DLC DEPASSEE depuis ${Math.abs(diffDays)} jour(s) — A DETRUIRE`,
                    dlc: item.dlc
                });
            } else if (diffDays <= 1) {
                alerts.push({
                    type: 'dlc_imminente',
                    niveau: 'critique',
                    item: item.nom,
                    message: `DLC demain ou aujourd'hui — A utiliser en priorite`,
                    dlc: item.dlc
                });
            } else if (diffDays <= 3) {
                alerts.push({
                    type: 'dlc_proche',
                    niveau: 'attention',
                    item: item.nom,
                    message: `DLC dans ${diffDays} jours — Planifier l'utilisation`,
                    dlc: item.dlc
                });
            }
        }

        // Check depackaging labels DLC
        for (const etiq of etiquettes) {
            if (!etiq.dlc_secondaire) continue;
            const dlcDate = new Date(etiq.dlc_secondaire);
            const diffDays = Math.ceil((dlcDate - today) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                alerts.push({
                    type: 'dlc_depassee',
                    niveau: 'critique',
                    item: etiq.produit + ' (deconditionne)',
                    message: `DLC secondaire DEPASSEE — A DETRUIRE IMMEDIATEMENT`,
                    dlc: etiq.dlc_secondaire
                });
            } else if (diffDays === 0) {
                alerts.push({
                    type: 'dlc_imminente',
                    niveau: 'critique',
                    item: etiq.produit + ' (deconditionne)',
                    message: `DLC secondaire aujourd'hui — A utiliser ou detruire`,
                    dlc: etiq.dlc_secondaire
                });
            }
        }

        return alerts;
    },

    // --- Helpers ---
    today() {
        return new Date().toISOString().split('T')[0];
    },

    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    },

    formatTime(isoString) {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatDateTime(isoString) {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
               d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    // --- Fournisseurs ---
    getFournisseurs() {
        return this.load('fournisseurs', []);
    },

    addFournisseur(fournisseur) {
        const list = this.getFournisseurs();
        fournisseur.id = this.uid();
        fournisseur.date_creation = new Date().toISOString();
        list.push(fournisseur);
        this.save('fournisseurs', list);
        Journal.log('fournisseurs', `Fournisseur ajoute: ${fournisseur.nom}`, fournisseur);
        return fournisseur;
    },

    updateFournisseur(id, updates) {
        const list = this.getFournisseurs();
        const idx = list.findIndex(f => f.id === id);
        if (idx >= 0) {
            Object.assign(list[idx], updates);
            list[idx].date_modif = new Date().toISOString();
            this.save('fournisseurs', list);
            Journal.log('fournisseurs', `Fournisseur modifie: ${list[idx].nom}`, list[idx]);
        }
        return list[idx];
    },

    removeFournisseur(id) {
        let list = this.getFournisseurs();
        const fournisseur = list.find(f => f.id === id);
        list = list.filter(f => f.id !== id);
        this.save('fournisseurs', list);
        if (fournisseur) Journal.log('fournisseurs', `Fournisseur supprime: ${fournisseur.nom}`, fournisseur);
    },

    // Initialiser les fournisseurs par defaut si aucun n'existe
    initFournisseursDefault() {
        if (this.getFournisseurs().length === 0 && typeof FournisseursDatabase !== 'undefined') {
            const fournisseurs = FournisseursDatabase.FOURNISSEURS_PAR_DEFAUT.map(f => ({
                ...f,
                id: this.uid(),
                date_creation: new Date().toISOString()
            }));
            fournisseurs.forEach(f => {
                const list = this.getFournisseurs();
                list.push(f);
                this.save('fournisseurs', list);
            });
        }
    },

    // --- Recettes ---
    getRecettes() {
        return this.load('recettes', []);
    },

    addRecette(recette) {
        const list = this.getRecettes();
        recette.id = this.uid();
        recette.date_creation = new Date().toISOString();
        list.push(recette);
        this.save('recettes', list);
        Journal.log('recettes', `Fiche technique ajoutee: ${recette.nom}`, recette);
        return recette;
    },

    updateRecette(id, updates) {
        const list = this.getRecettes();
        const idx = list.findIndex(r => r.id === id);
        if (idx >= 0) {
            Object.assign(list[idx], updates);
            list[idx].date_modif = new Date().toISOString();
            this.save('recettes', list);
            Journal.log('recettes', `Fiche technique modifiee: ${list[idx].nom}`, list[idx]);
        }
        return list[idx];
    },

    removeRecette(id) {
        let list = this.getRecettes();
        const recette = list.find(r => r.id === id);
        list = list.filter(r => r.id !== id);
        this.save('recettes', list);
        if (recette) Journal.log('recettes', `Fiche technique supprimee: ${recette.nom}`, recette);
    },

    // Initialiser les recettes par defaut si aucune n'existe
    initRecettesDefault() {
        if (this.getRecettes().length === 0 && typeof RecettesDatabase !== 'undefined') {
            const recettes = RecettesDatabase.RECETTES_PAR_DEFAUT.map(r => ({
                ...r,
                id: this.uid(),
                date_creation: new Date().toISOString()
            }));
            recettes.forEach(r => {
                const list = this.getRecettes();
                list.push(r);
                this.save('recettes', list);
            });
        }
    },

    // --- Menus ---
    getMenus(date) {
        const key = 'menus_' + (date || this.today());
        return this.load(key, []);
    },

    saveMenus(date, menus) {
        const key = 'menus_' + (date || this.today());
        return this.save(key, menus);
    },

    getMenuDates() {
        const dates = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.PREFIX + 'menus_')) {
                const date = key.replace(this.PREFIX + 'menus_', '');
                dates.push(date);
            }
        }
        return dates.sort().reverse();
    },

    // ========== NOUVEAUX MODULES CONFORMITÉ ==========

    // --- FORMATIONS PERSONNEL ---
    getFormations() {
        return this.load('formations', []);
    },

    saveFormation(formation) {
        const list = this.getFormations();
        const existing = list.findIndex(f => f.id === formation.id);
        if (existing >= 0) {
            list[existing] = formation;
        } else {
            list.push(formation);
        }
        this.save('formations', list);
        return formation;
    },

    removeFormation(formationId) {
        const list = this.getFormations();
        this.save('formations', list.filter(f => f.id !== formationId));
    },

    // --- TIAC (INCIDENTS ALIMENTAIRES) ---
    getTIAC() {
        return this.load('tiac', []);
    },

    saveTIAC(incident) {
        const list = this.getTIAC();
        const existing = list.findIndex(i => i.id === incident.id);
        if (existing >= 0) {
            list[existing] = incident;
        } else {
            list.push(incident);
        }
        this.save('tiac', list);
        return incident;
    },

    removeTIAC(incidentId) {
        const list = this.getTIAC();
        this.save('tiac', list.filter(i => i.id !== incidentId));
    },

    // --- RGPD (DONNÉES PERSONNELLES) ---
    getRGPDConsentements() {
        return this.load('rgpd_consentements', []);
    },

    saveRGPDConsentement(consentement) {
        const list = this.getRGPDConsentements();
        const existing = list.findIndex(c => c.id === consentement.id);
        if (existing >= 0) {
            list[existing] = consentement;
        } else {
            list.push(consentement);
        }
        this.save('rgpd_consentements', list);
    },

    removeRGPDConsentement(consentementId) {
        const list = this.getRGPDConsentements();
        this.save('rgpd_consentements', list.filter(c => c.id !== consentementId));
    },

    getRGPDRegistre() {
        return this.load('rgpd_registre', []);
    },

    getRGPDTraitements() {
        return this.getRGPDRegistre().filter(r => r.type === 'traitement');
    },

    saveRGPDTraitement(traitement) {
        const list = this.getRGPDRegistre();
        const existing = list.findIndex(t => t.id === traitement.id);
        if (existing >= 0) {
            list[existing] = traitement;
        } else {
            list.push(traitement);
        }
        this.save('rgpd_registre', list);
    },

    removeRGPDTraitement(traitementId) {
        const list = this.getRGPDRegistre();
        this.save('rgpd_registre', list.filter(t => t.id !== traitementId));
    },

    getRGPDDPO() {
        return this.load('rgpd_dpo', null);
    },

    saveRGPDDPO(dpo) {
        this.save('rgpd_dpo', dpo);
    },

    getRGPDArchivedUsers() {
        return this.load('rgpd_archived_users', []);
    },

    archiveDeletedUser(userData) {
        const archived = this.getRGPDArchivedUsers();
        archived.push({
            ...userData,
            archived_date: this.today(),
            deletion_deadline: this._addYears(this.today(), 5)
        });
        this.save('rgpd_archived_users', archived);
    },

    // --- RAPPELS PRODUITS ---
    getRappelsProduits() {
        return this.load('rappels_produits', []);
    },

    saveRappelProduit(rappel) {
        const list = this.getRappelsProduits();
        const existing = list.findIndex(r => r.id === rappel.id);
        if (existing >= 0) {
            list[existing] = rappel;
        } else {
            list.push(rappel);
        }
        this.save('rappels_produits', list);
    },

    removeRappelProduit(rappelId) {
        const list = this.getRappelsProduits();
        this.save('rappels_produits', list.filter(r => r.id !== rappelId));
    },

    // --- PAI (ALLERGIES ENFANTS) ---
    getPAIEnfants() {
        return this.load('pai_enfants', []);
    },

    savePAIEnfant(enfant) {
        const list = this.getPAIEnfants();
        const existing = list.findIndex(e => e.id === enfant.id);
        if (existing >= 0) {
            list[existing] = enfant;
        } else {
            list.push(enfant);
        }
        this.save('pai_enfants', list);
    },

    removePAIEnfant(enfantId) {
        const list = this.getPAIEnfants();
        this.save('pai_enfants', list.filter(e => e.id !== enfantId));
    },

    getPAIAlertes() {
        return this.load('pai_alertes', []);
    },

    savePAIAlerte(alerte) {
        const list = this.getPAIAlertes();
        list.push(alerte);
        this.save('pai_alertes', list);
    },

    // --- AGEC AVANCÉ (DONS & GASPILLAGE) ---
    getAGECDons() {
        return this.load('agec_dons', []);
    },

    saveAGECDon(don) {
        const list = this.getAGECDons();
        const existing = list.findIndex(d => d.id === don.id);
        if (existing >= 0) {
            list[existing] = don;
        } else {
            list.push(don);
        }
        this.save('agec_dons', list);
    },

    removeAGECDon(donId) {
        const list = this.getAGECDons();
        this.save('agec_dons', list.filter(d => d.id !== donId));
    },

    getAGECAssociations() {
        return this.load('agec_associations', []);
    },

    saveAGECAssociation(association) {
        const list = this.getAGECAssociations();
        const existing = list.findIndex(a => a.id === association.id);
        if (existing >= 0) {
            list[existing] = association;
        } else {
            list.push(association);
        }
        this.save('agec_associations', list);
    },

    removeAGECAssociation(associationId) {
        const list = this.getAGECAssociations();
        this.save('agec_associations', list.filter(a => a.id !== associationId));
    },

    getAGECPlanAction() {
        return this.load('agec_plan_action', null);
    },

    saveAGECPlanAction(plan) {
        this.save('agec_plan_action', plan);
    },

    // --- MAINTENANCE ÉQUIPEMENTS ---
    getMaintenances() {
        return this.load('maintenances', []);
    },

    saveMaintenance(maintenance) {
        const list = this.getMaintenances();
        const existing = list.findIndex(m => m.id === maintenance.id);
        if (existing >= 0) {
            list[existing] = maintenance;
        } else {
            list.push(maintenance);
        }
        this.save('maintenances', list);
    },

    removeMaintenance(maintenanceId) {
        const list = this.getMaintenances();
        this.save('maintenances', list.filter(m => m.id !== maintenanceId));
    },

    // --- ANALYSE DES RISQUES HACCP ---
    getAnalyseRisques() {
        return this.load('analyse_risques', []);
    },

    saveAnalyseRisques(analyse) {
        const list = this.getAnalyseRisques();
        const existing = list.findIndex(a => a.id === analyse.id);
        if (existing >= 0) {
            list[existing] = analyse;
        } else {
            list.push(analyse);
        }
        this.save('analyse_risques', list);
    },

    removeAnalyseRisques(analyseId) {
        const list = this.getAnalyseRisques();
        this.save('analyse_risques', list.filter(a => a.id !== analyseId));
    },

    // --- VALIDATION NETTOYAGE ---
    getValidationNettoyages() {
        return this.load('validation_nettoyages', []);
    },

    saveValidationNettoyage(validation) {
        const list = this.getValidationNettoyages();
        const existing = list.findIndex(v => v.id === validation.id);
        if (existing >= 0) {
            list[existing] = validation;
        } else {
            list.push(validation);
        }
        this.save('validation_nettoyages', list);
    },

    removeValidationNettoyage(validationId) {
        const list = this.getValidationNettoyages();
        this.save('validation_nettoyages', list.filter(v => v.id !== validationId));
    },

    // --- SÉPARATION CRU/CUIT ---
    getSeparationPlans() {
        return this.load('separation_plans', []);
    },

    saveSeparationPlan(plan) {
        const list = this.getSeparationPlans();
        const existing = list.findIndex(p => p.id === plan.id);
        if (existing >= 0) {
            list[existing] = plan;
        } else {
            list.push(plan);
        }
        this.save('separation_plans', list);
    },

    removeSeparationPlan(planId) {
        const list = this.getSeparationPlans();
        this.save('separation_plans', list.filter(p => p.id !== planId));
    },

    // --- DOUCHES/VESTIAIRES ---
    getDoushesVestiaires() {
        return this.load('douches_vestiaires', []);
    },

    saveDoushesVestiaires(check) {
        const list = this.getDoushesVestiaires();
        const existing = list.findIndex(c => c.id === check.id);
        if (existing >= 0) {
            list[existing] = check;
        } else {
            list.push(check);
        }
        this.save('douches_vestiaires', list);
    },

    removeDoushesVestiaires(checkId) {
        const list = this.getDoushesVestiaires();
        this.save('douches_vestiaires', list.filter(c => c.id !== checkId));
    },

    // --- ARCHIVAGE DLC ---
    getArchivesDLC() {
        return this.load('archives_dlc', []);
    },

    saveArchiveDLC(archive) {
        const list = this.getArchivesDLC();
        list.push(archive);
        this.save('archives_dlc', list);
    },

    // ========== FIN NOUVEAUX MODULES ==========

    // Export all data
    exportAll() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.PREFIX)) {
                data[key] = JSON.parse(localStorage.getItem(key));
            }
        }
        return data;
    },

    // Import data
    importAll(data) {
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
};
