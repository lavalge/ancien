/* ============================================================
   OK CUISINE — Base Complète Fournisseurs France (96 depts)
   ~800+ fournisseurs réalistes avec génération intelligente
   Structure: Tous les 96 depts + générateur auto de fournisseurs
   ============================================================ */

const FournisseursDatabaseComplet = {
    DEPARTEMENTS: {
        // 96 départements français métropolitains et outre-mer
        '01': { nom: 'Ain', region: 'Auvergne-Rhône-Alpes' },
        '02': { nom: 'Aisne', region: 'Hauts-de-France' },
        '03': { nom: 'Allier', region: 'Auvergne-Rhône-Alpes' },
        '04': { nom: 'Alpes-de-Haute-Provence', region: 'PACA' },
        '05': { nom: 'Hautes-Alpes', region: 'PACA' },
        '06': { nom: 'Alpes-Maritimes', region: 'PACA' },
        '07': { nom: 'Ardèche', region: 'Auvergne-Rhône-Alpes' },
        '08': { nom: 'Ardennes', region: 'Grand Est' },
        '09': { nom: 'Ariège', region: 'Occitanie' },
        '10': { nom: 'Aube', region: 'Grand Est' },
        '11': { nom: 'Aude', region: 'Occitanie' },
        '12': { nom: 'Aveyron', region: 'Occitanie' },
        '13': { nom: 'Bouches-du-Rhône', region: 'PACA' },
        '14': { nom: 'Calvados', region: 'Normandie' },
        '15': { nom: 'Cantal', region: 'Auvergne-Rhône-Alpes' },
        '16': { nom: 'Charente', region: 'Nouvelle-Aquitaine' },
        '17': { nom: 'Charente-Maritime', region: 'Nouvelle-Aquitaine' },
        '18': { nom: 'Cher', region: 'Centre-Val de Loire' },
        '19': { nom: 'Corrèze', region: 'Nouvelle-Aquitaine' },
        '21': { nom: 'Côte-d\'Or', region: 'Bourgogne-Franche-Comté' },
        '22': { nom: 'Côtes-d\'Armor', region: 'Bretagne' },
        '23': { nom: 'Creuse', region: 'Nouvelle-Aquitaine' },
        '24': { nom: 'Dordogne', region: 'Nouvelle-Aquitaine' },
        '25': { nom: 'Doubs', region: 'Bourgogne-Franche-Comté' },
        '26': { nom: 'Drôme', region: 'Auvergne-Rhône-Alpes' },
        '27': { nom: 'Eure', region: 'Normandie' },
        '28': { nom: 'Eure-et-Loir', region: 'Centre-Val de Loire' },
        '29': { nom: 'Finistère', region: 'Bretagne' },
        '2A': { nom: 'Corse-du-Sud', region: 'Corse' },
        '2B': { nom: 'Haute-Corse', region: 'Corse' },
        '30': { nom: 'Gard', region: 'Occitanie' },
        '31': { nom: 'Haute-Garonne', region: 'Occitanie' },
        '32': { nom: 'Gers', region: 'Occitanie' },
        '33': { nom: 'Gironde', region: 'Nouvelle-Aquitaine' },
        '34': { nom: 'Hérault', region: 'Occitanie' },
        '35': { nom: 'Ille-et-Vilaine', region: 'Bretagne' },
        '36': { nom: 'Indre', region: 'Centre-Val de Loire' },
        '37': { nom: 'Indre-et-Loire', region: 'Centre-Val de Loire' },
        '38': { nom: 'Isère', region: 'Auvergne-Rhône-Alpes' },
        '39': { nom: 'Jura', region: 'Bourgogne-Franche-Comté' },
        '40': { nom: 'Landes', region: 'Nouvelle-Aquitaine' },
        '41': { nom: 'Loir-et-Cher', region: 'Centre-Val de Loire' },
        '42': { nom: 'Loire', region: 'Auvergne-Rhône-Alpes' },
        '43': { nom: 'Haute-Loire', region: 'Auvergne-Rhône-Alpes' },
        '44': { nom: 'Loire-Atlantique', region: 'Pays de la Loire' },
        '45': { nom: 'Loiret', region: 'Centre-Val de Loire' },
        '46': { nom: 'Lot', region: 'Occitanie' },
        '47': { nom: 'Lot-et-Garonne', region: 'Nouvelle-Aquitaine' },
        '48': { nom: 'Lozère', region: 'Occitanie' },
        '49': { nom: 'Maine-et-Loire', region: 'Pays de la Loire' },
        '50': { nom: 'Manche', region: 'Normandie' },
        '51': { nom: 'Marne', region: 'Grand Est' },
        '52': { nom: 'Haute-Marne', region: 'Grand Est' },
        '53': { nom: 'Mayenne', region: 'Pays de la Loire' },
        '54': { nom: 'Meurthe-et-Moselle', region: 'Grand Est' },
        '55': { nom: 'Meuse', region: 'Grand Est' },
        '56': { nom: 'Morbihan', region: 'Bretagne' },
        '57': { nom: 'Moselle', region: 'Grand Est' },
        '58': { nom: 'Nièvre', region: 'Bourgogne-Franche-Comté' },
        '59': { nom: 'Nord', region: 'Hauts-de-France' },
        '60': { nom: 'Oise', region: 'Hauts-de-France' },
        '61': { nom: 'Orne', region: 'Normandie' },
        '62': { nom: 'Pas-de-Calais', region: 'Hauts-de-France' },
        '63': { nom: 'Puy-de-Dôme', region: 'Auvergne-Rhône-Alpes' },
        '64': { nom: 'Pyrénées-Atlantiques', region: 'Nouvelle-Aquitaine' },
        '65': { nom: 'Hautes-Pyrénées', region: 'Occitanie' },
        '66': { nom: 'Pyrénées-Orientales', region: 'Occitanie' },
        '67': { nom: 'Bas-Rhin', region: 'Grand Est' },
        '68': { nom: 'Haut-Rhin', region: 'Grand Est' },
        '69': { nom: 'Rhône', region: 'Auvergne-Rhône-Alpes' },
        '70': { nom: 'Haute-Saône', region: 'Bourgogne-Franche-Comté' },
        '71': { nom: 'Saône-et-Loire', region: 'Bourgogne-Franche-Comté' },
        '72': { nom: 'Sarthe', region: 'Pays de la Loire' },
        '73': { nom: 'Savoie', region: 'Auvergne-Rhône-Alpes' },
        '74': { nom: 'Haute-Savoie', region: 'Auvergne-Rhône-Alpes' },
        '75': { nom: 'Paris', region: 'Île-de-France' },
        '76': { nom: 'Seine-Maritime', region: 'Normandie' },
        '77': { nom: 'Seine-et-Marne', region: 'Île-de-France' },
        '78': { nom: 'Yvelines', region: 'Île-de-France' },
        '79': { nom: 'Deux-Sèvres', region: 'Nouvelle-Aquitaine' },
        '80': { nom: 'Somme', region: 'Hauts-de-France' },
        '81': { nom: 'Tarn', region: 'Occitanie' },
        '82': { nom: 'Tarn-et-Garonne', region: 'Occitanie' },
        '83': { nom: 'Var', region: 'PACA' },
        '84': { nom: 'Vaucluse', region: 'PACA' },
        '85': { nom: 'Vendée', region: 'Pays de la Loire' },
        '86': { nom: 'Vienne', region: 'Nouvelle-Aquitaine' },
        '87': { nom: 'Haute-Vienne', region: 'Nouvelle-Aquitaine' },
        '88': { nom: 'Vosges', region: 'Grand Est' },
        '89': { nom: 'Yonne', region: 'Bourgogne-Franche-Comté' },
        '90': { nom: 'Belfort', region: 'Bourgogne-Franche-Comté' },
        '91': { nom: 'Essonne', region: 'Île-de-France' },
        '92': { nom: 'Hauts-de-Seine', region: 'Île-de-France' },
        '93': { nom: 'Seine-Saint-Denis', region: 'Île-de-France' },
        '94': { nom: 'Val-de-Marne', region: 'Île-de-France' },
        '95': { nom: 'Val-d\'Oise', region: 'Île-de-France' },
        '971': { nom: 'Guadeloupe', region: 'Guadeloupe' },
        '972': { nom: 'Martinique', region: 'Martinique' },
        '973': { nom: 'Guyane', region: 'Guyane' },
        '974': { nom: 'Réunion', region: 'Réunion' },
        '976': { nom: 'Mayotte', region: 'Mayotte' }
    },

    FOURNISSEURS: {},

    FOURNISSEURS_REELS_13: [
        {
            nom: 'FL Provider',
            categorie: 'Fruits & Légumes',
            type: 'Grossiste',
            email: null,
            telephone: '+33 6 46 54 92 42',
            adresse: null,
            specialites: ['Fruits', 'Légumes', 'Produits frais'],
            certifications: [],
            catalogue: 'https://www.flprovider.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'EUROPE PRIMEURS DISTRIBUTION',
            categorie: 'Fruits & Légumes',
            type: 'Grossiste',
            email: null,
            telephone: '+33 4 91 92 69 07',
            adresse: null,
            specialites: ['Fruits', 'Légumes', 'Collectivités'],
            certifications: [],
            catalogue: 'https://www.europe-primeurs-distribution.com/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'UNIPRIM',
            categorie: 'Fruits & Légumes',
            type: 'Grossiste',
            email: null,
            telephone: '+33 4 91 98 00 25',
            adresse: null,
            specialites: ['Fruits', 'Légumes', 'Gros'],
            certifications: [],
            catalogue: 'https://www.uniprim.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'PRIM 13',
            categorie: 'Fruits & Légumes',
            type: 'Grossiste',
            email: null,
            telephone: '+33 7 77 06 72 66',
            adresse: null,
            specialites: ['Fruits', 'Gros volumes'],
            certifications: [],
            catalogue: 'https://www.prim-13.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Primarest & Avenir Provence Restauration',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: '04 26 93 99 47',
            adresse: null,
            specialites: ['Restauration collective', 'Produits frais', 'Produits secs'],
            certifications: [],
            catalogue: 'https://www.primarest.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Sysco France (Marseille)',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: null,
            adresse: null,
            specialites: ['Frais', 'Surgelés', 'Épicerie', 'Viande', 'Poisson'],
            certifications: [],
            catalogue: 'https://sysco.fr/grossiste-alimentaire-marseille/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Générale Distribution',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: '+33 4 91 37 14 44',
            adresse: null,
            specialites: ['Alimentaire', 'Produits variés'],
            certifications: [],
            catalogue: 'https://generaledistri.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Jeanningros',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: '+33 4 91 98 02 28',
            adresse: null,
            specialites: ['Produits frais', 'Marché national'],
            certifications: [],
            catalogue: 'https://www.jeanningros.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Midi Sec Distribution',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: '+33 4 91 67 45 62',
            adresse: null,
            specialites: ['Épicerie', 'Produits secs'],
            certifications: [],
            catalogue: 'http://www.midi-sec.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Miamland',
            categorie: 'Grossiste généraliste',
            type: 'Grossiste',
            email: null,
            telephone: '09 70 79 24 81',
            adresse: null,
            specialites: ['Épicerie', 'Boissons', 'Produits secs'],
            certifications: [],
            catalogue: 'https://www.miamland.com/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'GEPHI',
            categorie: 'Viandes',
            type: 'Grossiste',
            email: null,
            telephone: '04 91 06 64 44',
            adresse: null,
            specialites: ['Viande', 'Volaille', 'Oeufs', 'Produits frais'],
            certifications: [],
            catalogue: 'https://www.gephi.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Provence Boissons Distribution',
            categorie: 'Boissons',
            type: 'Distributeur',
            email: null,
            telephone: '+33 4 91 78 72 91',
            adresse: null,
            specialites: ['Vins', 'Boissons', 'Professionnels'],
            certifications: [],
            catalogue: null,
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'Rossi Boissons',
            categorie: 'Boissons',
            type: 'Distributeur',
            email: null,
            telephone: '+33 4 91 73 25 81',
            adresse: null,
            specialites: ['Boissons', 'Hygiène alimentaire'],
            certifications: [],
            catalogue: 'https://rossiboissons.fr/',
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'France Boissons Marseille',
            categorie: 'Boissons',
            type: 'Distributeur',
            email: null,
            telephone: '+33 4 42 22 97 87',
            adresse: null,
            specialites: ['Boissons', 'Restauration professionnelle'],
            certifications: [],
            catalogue: null,
            delai: null,
            rayon: 'PACA'
        },
        {
            nom: 'C10',
            categorie: 'Boissons',
            type: 'Réseau de distribution',
            email: null,
            telephone: null,
            adresse: null,
            specialites: ['Boissons', 'Réseau national'],
            certifications: [],
            catalogue: 'https://c10.fr/',
            delai: null,
            rayon: 'France'
        }
    ],

    init() {
        // Générer les fournisseurs pour chaque département
        Object.entries(this.DEPARTEMENTS).forEach(([code, dept]) => {
            if (code === '13') {
                this.FOURNISSEURS[code] = {
                    code: code,
                    nom: dept.nom,
                    region: dept.region,
                    fournisseurs: this.FOURNISSEURS_REELS_13
                };
                return;
            }

            const fournisseurCount = this._getCountForDept(code);
            this.FOURNISSEURS[code] = {
                code: code,
                nom: dept.nom,
                region: dept.region,
                fournisseurs: this._generateFournisseurs(code, dept.nom, dept.region, fournisseurCount)
            };
        });
    },

    _getCountForDept(code) {
        // Adapter le nombre de fournisseurs par département
        if (code === '75') return 50;  // Paris: max
        if (['92', '69', '13', '31', '59'].includes(code)) return 35;  // Grandes villes
        if (['91', '77', '78', '93', '94', '33', '34', '56', '35', '76'].includes(code)) return 25;  // Villes moyennes
        if (parseInt(code) > 970) return 8;  // DOM-TOM
        return 18;  // Autres départements
    },

    _generateFournisseurs(code, deptNom, region, count) {
        const categories = ['Fruits & Légumes', 'Viandes', 'Poissons & Crustacés', 'Produits Laitiers', 'Surgelés & Conserves', 'Boissons', 'Condiments & Épices', 'Matériel de Cuisine', 'Nettoyage & Hygiène', 'Emballage & Conditionnement'];
        const typeNames = ['Distribution', 'Grossiste', 'Producteur', 'Professionnel', 'Fournisseur', 'Distributeur'];
        const fournisseurs = [];

        for (let i = 0; i < count; i++) {
            const categorie = categories[i % categories.length];
            const type = typeNames[Math.floor(Math.random() * typeNames.length)];
            const nom = `${categorie.split(' ')[0]} ${deptNom} #${i + 1}`;
            const certifs = i % 3 === 0 ? ['Bio', 'HACCP'] : i % 2 === 0 ? ['AOP'] : [];

            fournisseurs.push({
                nom: nom,
                categorie: categorie,
                type: type,
                email: `contact${i + 1}@fournisseur${code}.fr`,
                telephone: this._generatePhone(code),
                adresse: `${i + 1} Rue du Commerce, ${code} ${deptNom}`,
                specialites: [categorie.split(' ')[0], 'Qualité', 'Service'],
                certifications: certifs,
                catalogue: null,
                delai: i % 2 === 0 ? '24h' : '48h',
                rayon: region
            });
        }

        return fournisseurs;
    },

    _generatePhone(code) {
        const firstDigit = code.substring(0, 2);
        const n1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        const n2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        const n3 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        return `0${firstDigit} ${n1} ${n2} ${n3}`;
    },

    // ============ MÉTHODES D'ACCÈS ============

    getDepartementsList() {
        return Object.entries(this.DEPARTEMENTS).map(([code, dept]) => ({
            code: code,
            nom: dept.nom,
            region: dept.region
        })).sort((a, b) => a.code.localeCompare(b.code));
    },

    getFournisseursByDept(code) {
        return this.FOURNISSEURS[code] || null;
    },

    getFournisseursByCategory(code, categories) {
        const deptData = this.FOURNISSEURS[code];
        if (!deptData) return [];
        if (!Array.isArray(categories)) categories = [categories];
        return deptData.fournisseurs.filter(f => categories.includes(f.categorie));
    },

    searchFournisseur(query) {
        const term = query.toLowerCase();
        const results = [];
        Object.entries(this.FOURNISSEURS).forEach(([code, deptData]) => {
            const matches = deptData.fournisseurs.filter(f =>
                f.nom.toLowerCase().includes(term) ||
                f.specialites.some(s => s.toLowerCase().includes(term))
            );
            results.push(...matches.map(m => ({ ...m, dept: code, deptNom: deptData.nom })));
        });
        return results;
    },

    getStats() {
        let totalDepts = 0, totalFournisseurs = 0;
        Object.values(this.FOURNISSEURS).forEach(deptData => {
            totalDepts++;
            totalFournisseurs += deptData.fournisseurs.length;
        });
        return {
            totalDepts: totalDepts,
            totalFournisseurs: totalFournisseurs,
            avgPerDept: Math.round(totalFournisseurs / totalDepts)
        };
    },

    getCategoriesList() {
        const cats = new Set();
        Object.values(this.FOURNISSEURS).forEach(deptData => {
            deptData.fournisseurs.forEach(f => cats.add(f.categorie));
        });
        return Array.from(cats).sort();
    },

    getRegionsList() {
        const regions = new Set();
        Object.values(this.DEPARTEMENTS).forEach(dept => regions.add(dept.region));
        return Array.from(regions).sort();
    }
};

// Initialiser au chargement
if (typeof document !== 'undefined' || typeof module !== 'undefined') {
    FournisseursDatabaseComplet.init();
}
