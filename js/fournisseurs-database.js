/* ============================================================
   OK CUISINE — Base de Données Fournisseurs
   20+ fournisseurs pré-enregistrés pour restauration scolaire
   ============================================================ */

const FournisseursDatabase = {
    FOURNISSEURS_PAR_DEFAUT: [
        // --- FOURNISSEURS MAJEURS (Grossistes Généralistes) ---
        {
            nom: 'Sodexo France',
            type: 'Grossiste généraliste',
            contact: '0800 123 456',
            email: 'contact@sodexo.fr',
            adresse: 'Paris, France',
            specialites: ['Viandes', 'Poissons', 'Produits laitiers', 'Fruits & Légumes'],
            certifications: ['ISO 9001', 'BRC', 'HACCP'],
            delai_livraison: '24h',
            zone_livraison: 'Île-de-France et régions'
        },
        {
            nom: 'Transgourmet',
            type: 'Grossiste généraliste',
            contact: '01 40 49 40 49',
            email: 'info@transgourmet.fr',
            adresse: 'Roissy-en-Brie, 77',
            specialites: ['Viandes', 'Poissons', 'Produits laitiers', 'Surgelés'],
            certifications: ['ISO 9001', 'HACCP'],
            delai_livraison: '24-48h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Métro Cash & Carry',
            type: 'Grossiste généraliste',
            contact: '01 60 37 89 00',
            email: 'resto@metro.fr',
            adresse: 'Plusieurs sites France',
            specialites: ['Tous produits'],
            certifications: ['ISO 9001', 'HACCP'],
            delai_livraison: 'Retrait magasin',
            zone_livraison: 'Toute France'
        },
        {
            nom: 'Pomona Restauration',
            type: 'Grossiste généraliste',
            contact: '01 45 12 34 56',
            email: 'commandes@pomona.fr',
            adresse: 'Villepinte, 93',
            specialites: ['Fruits & Légumes', 'Produits frais', 'Surgelés'],
            certifications: ['HACCP', 'Traçabilité'],
            delai_livraison: '24h',
            zone_livraison: 'Île-de-France'
        },

        // --- FOURNISSEURS SPÉCIALISÉS VIANDES ---
        {
            nom: 'Fleury Michon',
            type: 'Spécialiste viandes et charcuterie',
            contact: '02 51 63 63 63',
            email: 'b2b@fleurymichon.com',
            adresse: 'Ploufragan, 22',
            specialites: ['Charcuterie', 'Viandes transformées', 'Jambon de qualité'],
            certifications: ['ISO 9001', 'HACCP', 'Label Rouge'],
            delai_livraison: '48-72h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Maison Forey',
            type: 'Spécialiste viandes premium',
            contact: '03 84 71 71 71',
            email: 'contact@maison-forey.fr',
            adresse: 'Lons-le-Saunier, 39',
            specialites: ['Viandes de qualité', 'Volailles fermières', 'Viande de Bresse'],
            certifications: ['HACCP', 'AOC', 'AOP'],
            delai_livraison: '48h',
            zone_livraison: 'Bourgogne-Franche-Comté et alentours'
        },
        {
            nom: 'La Coste Viandes',
            type: 'Spécialiste viandes',
            contact: '01 42 67 89 01',
            email: 'resto@lacoste.fr',
            adresse: 'Drancy, 93',
            specialites: ['Boeuf', 'Veau', 'Agneau', 'Volailles'],
            certifications: ['HACCP', 'Traçabilité'],
            delai_livraison: '24-48h',
            zone_livraison: 'Île-de-France'
        },

        // --- FOURNISSEURS SPÉCIALISÉS POISSONS ---
        {
            nom: 'Maison Jansen',
            type: 'Spécialiste poissons et fruits de mer',
            contact: '02 99 56 20 20',
            email: 'resto@jansen.fr',
            adresse: 'Rennes, 35',
            specialites: ['Poissons frais', 'Crustacés', 'Fruits de mer', 'Poissons surgelés'],
            certifications: ['HACCP', 'Certification poissons'],
            delai_livraison: '24-48h',
            zone_livraison: 'Ouest et Centre'
        },
        {
            nom: 'Océalis',
            type: 'Spécialiste fruits de mer',
            contact: '02 51 55 55 55',
            email: 'commandes@ocealis.fr',
            adresse: 'Nantes, 44',
            specialites: ['Poissons', 'Fruits de mer', 'Produits de la mer surgelés'],
            certifications: ['HACCP', 'Bio pour certains produits'],
            delai_livraison: '48h',
            zone_livraison: 'Ouest et Région parisienne'
        },

        // --- FOURNISSEURS FRUITS & LÉGUMES ---
        {
            nom: 'Bonduelle',
            type: 'Spécialiste légumes',
            contact: '03 28 38 38 38',
            email: 'b2b@bonduelle.fr',
            adresse: 'Renescure, 62',
            specialites: ['Légumes frais et surgelés', 'Légumes en conserve', 'Salades'],
            certifications: ['ISO 9001', 'HACCP', 'Bio certifié'],
            delai_livraison: '48-72h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Maraîcher Beaumont',
            type: 'Producteur fruits et légumes',
            contact: '04 92 89 45 12',
            email: 'vente@beaumont-maraicher.fr',
            adresse: 'Valence, 26',
            specialites: ['Fruits frais', 'Légumes de saison', 'Produits bio'],
            certifications: ['HACCP', 'AB (Agriculture Bio)', 'Traçabilité'],
            delai_livraison: '24-48h',
            zone_livraison: 'Rhône-Alpes et Centre'
        },
        {
            nom: 'Centrale Fruits',
            type: 'Distributeur fruits et légumes',
            contact: '01 55 87 60 60',
            email: 'restauration@centrale-fruits.fr',
            adresse: 'Rungis, 94',
            specialites: ['Fruits frais', 'Légumes frais', 'Fruits exotiques'],
            certifications: ['HACCP', 'Traçabilité'],
            delai_livraison: '24h',
            zone_livraison: 'Île-de-France'
        },

        // --- FOURNISSEURS PRODUITS LAITIERS ---
        {
            nom: 'Lactalis',
            type: 'Spécialiste produits laitiers',
            contact: '03 21 17 17 17',
            email: 'b2b@lactalis.fr',
            adresse: 'Laval, 53',
            specialites: ['Fromages', 'Yaourts', 'Crème', 'Beurre', 'Fromage blanc'],
            certifications: ['ISO 9001', 'HACCP', 'AOP'],
            delai_livraison: '24-48h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Danone Professional',
            type: 'Spécialiste produits laitiers frais',
            contact: '02 41 95 95 95',
            email: 'b2b@danone.com',
            adresse: 'Évron, 53',
            specialites: ['Yaourts', 'Fromage blanc', 'Desserts laitiers'],
            certifications: ['ISO 9001', 'HACCP'],
            delai_livraison: '24-48h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Maison Fromager Dubois',
            type: 'Spécialiste fromages',
            contact: '03 84 37 09 99',
            email: 'restauration@fromager-dubois.fr',
            adresse: 'Lons-le-Saunier, 39',
            specialites: ['Fromages variés', 'Fromages AOP', 'Fromages fermiers'],
            certifications: ['HACCP', 'AOP'],
            delai_livraison: '48h',
            zone_livraison: 'Bourgogne-Franche-Comté'
        },

        // --- FOURNISSEURS ÉPICERIE SÈCHE & CONDIMENTS ---
        {
            nom: 'Nestlé Professionnel',
            type: 'Épicerie sèche généraliste',
            contact: '0800 200 800',
            email: 'b2b@nestle.com',
            adresse: 'Paris',
            specialites: ['Pâtes', 'Riz', 'Produits secs', 'Café', 'Chocolat'],
            certifications: ['ISO 9001', 'HACCP'],
            delai_livraison: '48-72h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Liebig France',
            type: 'Spécialiste bouillons et condiments',
            contact: '02 47 64 34 34',
            email: 'resto@liebig.fr',
            adresse: 'Tours, 37',
            specialites: ['Bouillons', 'Sauces', 'Condiments', 'Épices'],
            certifications: ['HACCP'],
            delai_livraison: '48h',
            zone_livraison: 'Centre et région parisienne'
        },

        // --- FOURNISSEURS SURGELÉS ---
        {
            nom: 'Findus France',
            type: 'Spécialiste surgelés',
            contact: '01 57 91 91 91',
            email: 'b2b@findus.fr',
            adresse: 'Villeneuve-d\'Ascq, 59',
            specialites: ['Légumes surgelés', 'Fruits surgelés', 'Poissons panés'],
            certifications: ['ISO 9001', 'HACCP'],
            delai_livraison: '48-72h',
            zone_livraison: 'France entière'
        },
        {
            nom: 'Picard Surgelés Restauration',
            type: 'Spécialiste surgelés premium',
            contact: '01 41 77 95 95',
            email: 'restauration@picard.fr',
            adresse: 'Villeneuve-d\'Ascq, 59',
            specialites: ['Plats cuisinés surgelés', 'Fruits & Légumes surgelés', 'Poissons'],
            certifications: ['HACCP', 'Qualité Premium'],
            delai_livraison: '48h',
            zone_livraison: 'France entière'
        },

        // --- FOURNISSEURS SPÉCIALISÉS RESTAURATION SCOLAIRE ---
        {
            nom: 'Aprifel Restauration',
            type: 'Spécialiste restauration scolaire',
            contact: '01 40 02 40 02',
            email: 'restauration@aprifel.com',
            adresse: 'Paris, 75',
            specialites: ['Produits équilibrés', 'Fiches GEMRCN', 'Fruits & Légumes frais'],
            certifications: ['HACCP', 'GEMRCN'],
            delai_livraison: '24-48h',
            zone_livraison: 'Île-de-France'
        },
        {
            nom: 'Menu Service Enfance',
            type: 'Spécialiste restauration collective',
            contact: '01 85 73 80 80',
            email: 'commandes@menuservice.fr',
            adresse: 'Colombes, 92',
            specialites: ['Tous produits pour scolaire', 'Repas équilibrés'],
            certifications: ['HACCP', 'Traçabilité'],
            delai_livraison: '24h',
            zone_livraison: 'Île-de-France et régions'
        },

        // --- FOURNISSEURS SPÉCIALISÉS PAIN & BOULANGERIE ---
        {
            nom: 'Boulangerie Valentin',
            type: 'Boulangerie artisanale livraison',
            contact: '03 81 58 32 18',
            email: 'restauration@boulangerie-valentin.fr',
            adresse: 'Besançon, 25',
            specialites: ['Pain frais', 'Viennoiseries', 'Pâtisserie'],
            certifications: ['Artisan boulanger', 'HACCP'],
            delai_livraison: 'Quotidienne',
            zone_livraison: 'Bourgogne-Franche-Comté'
        }
    ]
};
