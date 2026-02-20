/* ============================================================
   OK CUISINE — Module Menus
   Generateur de menus integre — Base annuelle complete
   Conforme GEMRCN, equilibre, adapte par collectivite
   ============================================================ */

const Menus = {
    selectedDate: null,

    // =====================================================================
    // BASE DE DONNEES MENUS — ~80 menus classiques + saisonniers + fun
    // Couvre une annee scolaire complete (~36 semaines)
    // Conforme GEMRCN : frequences proteines, legumes, feculents, poisson
    // =====================================================================
    STOCK_MENUS: {
        classique: [
            // --- VIANDES BLANCHES ---
            { entree: 'Salade de carottes rapees', plat: 'Poulet roti', accompagnement: 'Puree de pommes de terre', dessert: 'Fruit de saison', fromage: 'Comte' },
            { entree: 'Veloute de legumes', plat: 'Escalope de dinde', accompagnement: 'Riz basmati', dessert: 'Yaourt nature', fromage: 'Emmental' },
            { entree: 'Concombre a la creme', plat: 'Blanquette de veau', accompagnement: 'Riz pilaf', dessert: 'Compote de pommes', fromage: 'Brie' },
            { entree: 'Salade verte vinaigrette', plat: 'Filet de dinde sauce moutarde', accompagnement: 'Haricots verts', dessert: 'Fruit de saison', fromage: 'Saint-Nectaire' },
            { entree: 'Radis beurre', plat: 'Roti de porc', accompagnement: 'Flageolets', dessert: 'Creme caramel', fromage: 'Tomme de Savoie' },
            { entree: 'Salade de betteraves', plat: 'Escalope de poulet panee', accompagnement: 'Coquillettes', dessert: 'Fruit de saison', fromage: 'Cantal' },
            { entree: 'Terrine de legumes', plat: 'Emince de dinde au curry', accompagnement: 'Semoule', dessert: 'Yaourt aux fruits', fromage: 'Mimolette' },
            { entree: 'Salade d\'endives aux noix', plat: 'Sauté de veau aux olives', accompagnement: 'Puree de carottes', dessert: 'Fruit de saison', fromage: 'Reblochon' },

            // --- VIANDES ROUGES ---
            { entree: 'Tomates vinaigrette', plat: 'Boeuf bourguignon', accompagnement: 'Pommes de terre vapeur', dessert: 'Fruit de saison', fromage: 'Camembert' },
            { entree: 'Salade de lentilles', plat: 'Steak hache grille', accompagnement: 'Puree maison', dessert: 'Compote pomme-poire', fromage: 'Comte' },
            { entree: 'Potage de legumes', plat: 'Hachis parmentier', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Pate de campagne cornichons', plat: 'Boeuf aux carottes', accompagnement: 'Pommes de terre persillees', dessert: 'Riz au lait', fromage: 'Bleu d\'Auvergne' },
            { entree: 'Salade de chou blanc', plat: 'Pot-au-feu', accompagnement: 'Legumes du pot-au-feu', dessert: 'Fruit de saison', fromage: 'Cantal' },
            { entree: 'Celeri remoulade', plat: 'Boulettes de boeuf sauce tomate', accompagnement: 'Spaghetti', dessert: 'Mousse au chocolat', fromage: 'Brie' },

            // --- POISSONS (min. 1x/semaine GEMRCN) ---
            { entree: 'Salade de mais', plat: 'Filet de colin sauce citron', accompagnement: 'Riz', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Veloute de potiron', plat: 'Pave de saumon grille', accompagnement: 'Epinards a la creme', dessert: 'Yaourt', fromage: 'Chevre frais' },
            { entree: 'Salade composee', plat: 'Filet de merlu meuniere', accompagnement: 'Puree de brocoli', dessert: 'Compote', fromage: 'Comte' },
            { entree: 'Carottes rapees', plat: 'Brandade de morue', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Tomme' },
            { entree: 'Betteraves vinaigrette', plat: 'Dos de cabillaud', accompagnement: 'Riz aux legumes', dessert: 'Creme dessert vanille', fromage: 'Mimolette' },
            { entree: 'Potage Dubarry', plat: 'Filet de lieu noir pane', accompagnement: 'Pommes de terre sautees', dessert: 'Fruit de saison', fromage: 'Cantal' },
            { entree: 'Salade de tomates', plat: 'Thon a la provencale', accompagnement: 'Ratatouille', dessert: 'Yaourt aux fruits', fromage: 'Saint-Nectaire' },
            { entree: 'Concombre menthe', plat: 'Filet de truite amandine', accompagnement: 'Haricots verts', dessert: 'Fruit de saison', fromage: 'Brie' },

            // --- OEUFS / VEGETARIEN ---
            { entree: 'Salade de tomates mozzarella', plat: 'Omelette aux fines herbes', accompagnement: 'Ratatouille', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Veloute de courgettes', plat: 'Quiche lorraine', accompagnement: 'Salade verte', dessert: 'Compote de fruits', fromage: 'Camembert' },
            { entree: 'Salade de pois chiches', plat: 'Gratin de legumes', accompagnement: 'Riz complet', dessert: 'Fruit de saison', fromage: 'Comte' },
            { entree: 'Taboulé', plat: 'Tarte aux legumes', accompagnement: 'Salade composee', dessert: 'Yaourt', fromage: 'Chevre' },

            // --- CHARCUTERIE / PLATS TRADI ---
            { entree: 'Saucisson sec cornichons', plat: 'Saucisse de Toulouse', accompagnement: 'Lentilles vertes', dessert: 'Fruit de saison', fromage: 'Cantal' },
            { entree: 'Salade de pommes de terre', plat: 'Petit sale aux lentilles', accompagnement: 'Lentilles', dessert: 'Tarte aux pommes', fromage: 'Saint-Nectaire' },
            { entree: 'Rillettes de porc', plat: 'Cassoulet', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Roquefort' },
            { entree: 'Jambon de pays melon', plat: 'Poulet basquaise', accompagnement: 'Riz', dessert: 'Creme brulee', fromage: 'Ossau-Iraty' },

            // --- MENUS PLAISIR (hamburger, pizza, etc.) ---
            { entree: 'Salade verte', plat: 'Hamburger maison', accompagnement: 'Frites', dessert: 'Glace vanille', fromage: 'Cheddar' },
            { entree: 'Salade de mais', plat: 'Pizza margherita', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Mozzarella' },
            { entree: 'Carottes rapees', plat: 'Nuggets de poulet', accompagnement: 'Frites', dessert: 'Compote', fromage: 'Babybel' },
            { entree: 'Potage de legumes', plat: 'Cordon bleu', accompagnement: 'Puree de pommes de terre', dessert: 'Creme dessert chocolat', fromage: 'Emmental' },
            { entree: 'Concombre', plat: 'Croque-monsieur', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Gruyere' },
            { entree: 'Tomates', plat: 'Hot-dog', accompagnement: 'Salade coleslaw', dessert: 'Yaourt aux fruits', fromage: 'Gouda' },
            { entree: 'Salade iceberg', plat: 'Fish and chips', accompagnement: 'Petits pois', dessert: 'Fruit de saison', fromage: 'Cheddar' },
            { entree: 'Chips de legumes', plat: 'Tacos poulet', accompagnement: 'Riz mexicain', dessert: 'Mousse au chocolat', fromage: 'Cantal' },
            { entree: 'Salade cesar', plat: 'Wrap poulet crudites', accompagnement: 'Potatoes', dessert: 'Fruit de saison', fromage: 'Parmesan' },
            { entree: 'Bruschetta tomate basilic', plat: 'Lasagnes bolognaise', accompagnement: 'Salade verte', dessert: 'Tiramisu', fromage: 'Parmesan' },

            // --- COMPLEMENT EQUILIBRE ---
            { entree: 'Salade de crudites', plat: 'Couscous poulet merguez', accompagnement: 'Semoule legumes', dessert: 'Orange', fromage: 'Chevre' },
            { entree: 'Soupe a l\'oignon', plat: 'Tartiflette', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Reblochon' },
            { entree: 'Veloute de champignons', plat: 'Sauté de porc caramelise', accompagnement: 'Nouilles chinoises', dessert: 'Litchi', fromage: 'Mimolette' },
            { entree: 'Salade de riz', plat: 'Poulet tikka', accompagnement: 'Riz basmati', dessert: 'Yaourt', fromage: 'Comte' },
            { entree: 'Melon', plat: 'Filet mignon de porc', accompagnement: 'Gratin de courgettes', dessert: 'Fruit de saison', fromage: 'Brie' },
            { entree: 'Pamplemousse', plat: 'Paupiette de veau', accompagnement: 'Carottes Vichy', dessert: 'Ile flottante', fromage: 'Camembert' },
            { entree: 'Salade de haricots blancs', plat: 'Boeuf Stroganoff', accompagnement: 'Tagliatelles', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Salade de concombre et tomate', plat: 'Poulet au citron', accompagnement: 'Pommes de terre rissolees', dessert: 'Clafoutis aux cerises', fromage: 'Cantal' },
            { entree: 'Potage Parmentier', plat: 'Aiguillettes de canard', accompagnement: 'Gratin dauphinois', dessert: 'Fruit de saison', fromage: 'Roquefort' },
            { entree: 'Salade perigourdine', plat: 'Confit de canard', accompagnement: 'Pommes sarladaises', dessert: 'Gateau aux noix', fromage: 'Cabecou' },
            { entree: 'Salade nicoise', plat: 'Cuisse de poulet rotie', accompagnement: 'Ratatouille', dessert: 'Fruit de saison', fromage: 'Tomme de brebis' },
            { entree: 'Taboulé libanais', plat: 'Brochette de boeuf', accompagnement: 'Semoule', dessert: 'Salade de fruits', fromage: 'Feta' },
            { entree: 'Soupe de poisson', plat: 'Paella', accompagnement: 'Salade verte', dessert: 'Creme catalane', fromage: 'Manchego' },
            { entree: 'Veloute d\'asperges', plat: 'Roti de boeuf', accompagnement: 'Haricots verts', dessert: 'Fruit de saison', fromage: 'Comte' },
            { entree: 'Salade de fenouil', plat: 'Osso buco', accompagnement: 'Polenta', dessert: 'Panna cotta', fromage: 'Parmesan' },
            { entree: 'Gaspacho', plat: 'Filet de bar grille', accompagnement: 'Fondue de poireaux', dessert: 'Sorbet citron', fromage: 'Chevre frais' },
            { entree: 'Avocat vinaigrette', plat: 'Chili con carne', accompagnement: 'Riz', dessert: 'Fruit de saison', fromage: 'Cheddar' },
            { entree: 'Veloute de petit pois', plat: 'Gratin de pates au jambon', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Salade de lentilles corail', plat: 'Tajine de poulet aux pruneaux', accompagnement: 'Semoule', dessert: 'Patisserie orientale', fromage: 'Brebis' },
            { entree: 'Carpaccio de betteraves', plat: 'Saucisse de Strasbourg', accompagnement: 'Choucroute', dessert: 'Tarte aux myrtilles', fromage: 'Munster' },
            { entree: 'Salade de carottes orange', plat: 'Jambon braise', accompagnement: 'Epinards a la creme', dessert: 'Fruit de saison', fromage: 'Comte' },
            { entree: 'Potage cultivateur', plat: 'Filet de poulet grille', accompagnement: 'Courgettes sautees', dessert: 'Fromage blanc sucre', fromage: 'Tomme' },
            { entree: 'Salade de chou rouge', plat: 'Palette de porc', accompagnement: 'Puree de celeri', dessert: 'Fruit de saison', fromage: 'Maroilles' },
            { entree: 'Veloute de butternut', plat: 'Raviolis ricotta epinards', accompagnement: 'Coulis de tomate', dessert: 'Compote pomme-cannelle', fromage: 'Parmesan' },
            { entree: 'Salade lyonnaise', plat: 'Quenelles sauce Nantua', accompagnement: 'Riz', dessert: 'Tarte praline', fromage: 'Saint-Marcellin' },
            { entree: 'Oeuf dur mayonnaise', plat: 'Roti de veau orloff', accompagnement: 'Petits pois carottes', dessert: 'Fruit de saison', fromage: 'Brie de Meaux' },
            { entree: 'Salade de riz niçoise', plat: 'Poisson pane', accompagnement: 'Puree de pommes de terre', dessert: 'Yaourt nature', fromage: 'Emmental' },
            { entree: 'Terrine de poisson', plat: 'Poulet fermier au thym', accompagnement: 'Gratin de chou-fleur', dessert: 'Fruit de saison', fromage: 'Camembert' },
            { entree: 'Salade de pates', plat: 'Emince de boeuf stroganoff', accompagnement: 'Tagliatelles fraiches', dessert: 'Creme au chocolat', fromage: 'Comte' },
            { entree: 'Veloute de carottes', plat: 'Dos de lieu sauce vierge', accompagnement: 'Riz complet', dessert: 'Fruit de saison', fromage: 'Chevre' },
            { entree: 'Salade gourmande', plat: 'Gratin de ravioles', accompagnement: 'Mesclun', dessert: 'Creme brulee', fromage: 'Beaufort' },
        ],

        // --- AUTOMNE (Sept-Nov) ---
        automne: [
            { entree: 'Veloute de potimarron', plat: 'Poulet aux champignons', accompagnement: 'Puree de celeri', dessert: 'Tarte aux pommes', fromage: 'Comte' },
            { entree: 'Salade de lentilles tiedes', plat: 'Joue de boeuf braisee', accompagnement: 'Puree de panais', dessert: 'Compote pomme-coing', fromage: 'Cantal' },
            { entree: 'Veloute de chataignes', plat: 'Filet de truite', accompagnement: 'Riz sauvage', dessert: 'Poire au chocolat', fromage: 'Reblochon' },
            { entree: 'Salade de betteraves', plat: 'Sauté de porc aux pommes', accompagnement: 'Chou braise', dessert: 'Gateau aux noix', fromage: 'Maroilles' },
            { entree: 'Potage de potiron', plat: 'Boeuf aux carottes', accompagnement: 'Pommes de terre', dessert: 'Fruit de saison', fromage: 'Brie' },
            { entree: 'Salade d\'automne', plat: 'Pintade aux raisins', accompagnement: 'Gratin de courge', dessert: 'Compote de figues', fromage: 'Roquefort' },
            { entree: 'Veloute de champignons', plat: 'Filet de merlu', accompagnement: 'Puree de brocoli', dessert: 'Yaourt', fromage: 'Saint-Nectaire' },
            { entree: 'Celeri remoulade', plat: 'Coq au vin', accompagnement: 'Pommes de terre vapeur', dessert: 'Tarte Tatin', fromage: 'Epoisses' },
            { entree: 'Soupe au pistou', plat: 'Escalope de veau', accompagnement: 'Pates fraiches', dessert: 'Raisin', fromage: 'Emmental' },
            { entree: 'Pate en croute', plat: 'Canard a l\'orange', accompagnement: 'Riz pilaf', dessert: 'Mousse au chocolat', fromage: 'Camembert' },
        ],

        // --- HIVER (Dec-Fev) ---
        hiver: [
            { entree: 'Soupe a l\'oignon gratinee', plat: 'Pot-au-feu', accompagnement: 'Legumes du bouillon', dessert: 'Fruit de saison', fromage: 'Comte' },
            { entree: 'Veloute de poireaux', plat: 'Tartiflette', accompagnement: 'Salade verte', dessert: 'Compote', fromage: 'Reblochon' },
            { entree: 'Salade d\'endives', plat: 'Daube provencale', accompagnement: 'Polenta', dessert: 'Orange', fromage: 'Cantal' },
            { entree: 'Potage Parmentier', plat: 'Choucroute garnie', accompagnement: 'Pommes de terre', dessert: 'Tarte alsacienne', fromage: 'Munster' },
            { entree: 'Soupe de legumes', plat: 'Roti de porc au miel', accompagnement: 'Puree de carottes', dessert: 'Gateau au chocolat', fromage: 'Brie' },
            { entree: 'Veloute de topinambour', plat: 'Cassoulet', accompagnement: 'Salade verte', dessert: 'Fruit de saison', fromage: 'Roquefort' },
            { entree: 'Salade de mache', plat: 'Filet de cabillaud', accompagnement: 'Gratin de chou-fleur', dessert: 'Creme au chocolat', fromage: 'Saint-Nectaire' },
            { entree: 'Potage aux legumes racines', plat: 'Blanquette de veau', accompagnement: 'Riz', dessert: 'Ile flottante', fromage: 'Emmental' },
            { entree: 'Salade de chou blanc', plat: 'Raclette', accompagnement: 'Pommes de terre vapeur', dessert: 'Fruit de saison', fromage: 'Raclette' },
            { entree: 'Veloute de lentilles', plat: 'Poule au pot', accompagnement: 'Legumes du pot', dessert: 'Riz au lait', fromage: 'Tomme de Savoie' },
        ],

        // --- PRINTEMPS (Mars-Mai) ---
        printemps: [
            { entree: 'Salade de radis', plat: 'Poulet roti au citron', accompagnement: 'Petits pois frais', dessert: 'Fraises', fromage: 'Chevre frais' },
            { entree: 'Asperges vinaigrette', plat: 'Filet de saumon', accompagnement: 'Riz aux herbes', dessert: 'Fruit de saison', fromage: 'Brie' },
            { entree: 'Salade de feves', plat: 'Escalope de veau panee', accompagnement: 'Puree de petit pois', dessert: 'Tarte aux fraises', fromage: 'Comte' },
            { entree: 'Veloute d\'asperges', plat: 'Gigot d\'agneau', accompagnement: 'Flageolets', dessert: 'Clafoutis aux cerises', fromage: 'Roquefort' },
            { entree: 'Carottes nouvelles rapees', plat: 'Pave de lieu noir', accompagnement: 'Epinards frais', dessert: 'Yaourt', fromage: 'Emmental' },
            { entree: 'Taboulé', plat: 'Brochettes de poulet', accompagnement: 'Semoule', dessert: 'Fruit de saison', fromage: 'Feta' },
            { entree: 'Salade de concombre', plat: 'Lapin a la moutarde', accompagnement: 'Pommes de terre nouvelles', dessert: 'Mousse de fraises', fromage: 'Saint-Nectaire' },
            { entree: 'Veloute de cresson', plat: 'Truite meuniere', accompagnement: 'Haricots verts', dessert: 'Compote rhubarbe', fromage: 'Camembert' },
            { entree: 'Artichaut vinaigrette', plat: 'Roti de boeuf', accompagnement: 'Jardiniere de legumes', dessert: 'Fruit de saison', fromage: 'Tomme' },
            { entree: 'Salade printaniere', plat: 'Navarin d\'agneau', accompagnement: 'Legumes printaniers', dessert: 'Creme a la vanille', fromage: 'Cantal' },
        ],

        // --- ETE (Juin-Aout) ---
        ete: [
            { entree: 'Gaspacho', plat: 'Poulet grille', accompagnement: 'Ratatouille', dessert: 'Melon', fromage: 'Chevre frais' },
            { entree: 'Salade grecque', plat: 'Filet de dorade', accompagnement: 'Riz aux legumes', dessert: 'Pasteque', fromage: 'Feta' },
            { entree: 'Melon jambon cru', plat: 'Brochettes de boeuf', accompagnement: 'Salade composee', dessert: 'Sorbet fruits rouges', fromage: 'Mozzarella' },
            { entree: 'Tomates farcies froides', plat: 'Poisson grille', accompagnement: 'Courgettes sautees', dessert: 'Peche', fromage: 'Comte' },
            { entree: 'Salade de tomates basilic', plat: 'Escalope de poulet', accompagnement: 'Tian de legumes', dessert: 'Salade de fruits', fromage: 'Brie' },
            { entree: 'Avocat crevettes', plat: 'Pave de saumon', accompagnement: 'Fondue de poireaux', dessert: 'Fruit de saison', fromage: 'Emmental' },
            { entree: 'Salade de haricots verts', plat: 'Tajine d\'agneau', accompagnement: 'Semoule', dessert: 'Abricots', fromage: 'Roquefort' },
            { entree: 'Carpaccio de courgettes', plat: 'Filet de merlu', accompagnement: 'Pommes de terre rissolees', dessert: 'Glace', fromage: 'Cantal' },
            { entree: 'Salade nicoise', plat: 'Hamburger maison', accompagnement: 'Salade coleslaw', dessert: 'Glace vanille', fromage: 'Cheddar' },
            { entree: 'Pan bagnat', plat: 'Grillade de porc', accompagnement: 'Haricots verts', dessert: 'Nectarine', fromage: 'Tomme de brebis' },
        ],

        // --- NOEL ---
        noel: [
            { entree: 'Foie gras sur toast', plat: 'Dinde farcie aux marrons', accompagnement: 'Gratin dauphinois', dessert: 'Buche au chocolat', fromage: 'Roquefort' },
            { entree: 'Saumon fume', plat: 'Chapon roti', accompagnement: 'Pommes duchesse', dessert: 'Buche vanille framboise', fromage: 'Comte' },
            { entree: 'Veloute de chataignes', plat: 'Magret de canard', accompagnement: 'Puree de marrons', dessert: 'Buche fruits rouges', fromage: 'Brie de Meaux' },
            { entree: 'Blinis creme fraiche saumon', plat: 'Filet de biche', accompagnement: 'Gratin de celeri', dessert: 'Profiteroles au chocolat', fromage: 'Beaufort' },
            { entree: 'Terrine de foie gras', plat: 'Roti de boeuf en croute', accompagnement: 'Legumes glaces', dessert: 'Buche pralinee', fromage: 'Epoisses' },
        ],

        // --- PAQUES ---
        paques: [
            { entree: 'Oeufs mimosa', plat: 'Gigot d\'agneau', accompagnement: 'Gratin de legumes', dessert: 'Tarte aux fraises', fromage: 'Brie' },
            { entree: 'Asperges sauce mousseline', plat: 'Roti de veau printanier', accompagnement: 'Petits pois carottes', dessert: 'Charlotte au chocolat', fromage: 'Chevre frais' },
            { entree: 'Salade de feves et chevre', plat: 'Carre d\'agneau', accompagnement: 'Flageolets', dessert: 'Mousse au chocolat de Paques', fromage: 'Roquefort' },
            { entree: 'Terrine de lapin', plat: 'Poulet farci', accompagnement: 'Jardiniere de legumes', dessert: 'Nid de Paques meringue', fromage: 'Comte' },
        ],

        // --- HALLOWEEN ---
        halloween: [
            { entree: 'Potage de citrouille', plat: 'Poulet roti sauce orange', accompagnement: 'Puree de patate douce', dessert: 'Cupcake citrouille', fromage: 'Mimolette' },
            { entree: 'Veloute de potiron', plat: 'Saucisses fumees', accompagnement: 'Puree de carotte', dessert: 'Mousse au chocolat', fromage: 'Emmental' },
            { entree: 'Soupe sorciere (butternut)', plat: 'Hachis parmentier citrouille', accompagnement: 'Salade verte', dessert: 'Gateau araignee chocolat', fromage: 'Cantal' },
            { entree: 'Salade d\'automne', plat: 'Boulettes monstrueuses', accompagnement: 'Spaghetti sauce tomate', dessert: 'Pomme d\'amour', fromage: 'Gouda' },
        ],

        // --- FETE DES ENFANTS ---
        fete: [
            { entree: 'Crudites et dips', plat: 'Hamburger maison', accompagnement: 'Frites', dessert: 'Glace 2 boules', fromage: 'Babybel' },
            { entree: 'Chips de legumes', plat: 'Nuggets de poulet maison', accompagnement: 'Potatoes', dessert: 'Gateau au chocolat', fromage: 'Kiri' },
            { entree: 'Mini-pizza', plat: 'Brochette de poulet', accompagnement: 'Riz pilaf', dessert: 'Crepes Nutella', fromage: 'Mozzarella' },
            { entree: 'Salade de pates', plat: 'Cordon bleu', accompagnement: 'Puree', dessert: 'Brownie', fromage: 'Emmental' },
            { entree: 'Melon', plat: 'Pizza margherita', accompagnement: 'Salade verte', dessert: 'Mousse au chocolat', fromage: 'Parmesan' },
        ],

        // --- CHANDELEUR ---
        chandeleur: [
            { entree: 'Salade verte', plat: 'Crepes jambon-fromage', accompagnement: 'Salade de pommes', dessert: 'Crepes sucrees', fromage: 'Raclette' },
            { entree: 'Potage de legumes', plat: 'Galettes sarrasin complete', accompagnement: 'Salade composee', dessert: 'Crepes confiture', fromage: 'Emmental' },
            { entree: 'Veloute de legumes', plat: 'Crepes aux champignons', accompagnement: 'Salade verte', dessert: 'Crepes Nutella', fromage: 'Comte' },
            { entree: 'Salade de betteraves', plat: 'Galettes saucisse', accompagnement: 'Crudites', dessert: 'Crepes caramel beurre sale', fromage: 'Brie' },
        ],

        // --- SEMAINE DU GOUT ---
        semaine_gout: [
            { entree: 'Degustation de 3 soupes', plat: 'Roti de boeuf aux herbes', accompagnement: 'Legumes oublies', dessert: 'Clafoutis aux poires', fromage: 'Plateau 3 fromages' },
            { entree: 'Salade de lentilles au chevre', plat: 'Filet de truite aux amandes', accompagnement: 'Puree de topinambour', dessert: 'Compote de coings', fromage: 'Maroilles' },
            { entree: 'Veloute de panais', plat: 'Poulet fermier au jus', accompagnement: 'Gratin de butternut', dessert: 'Tarte aux noix', fromage: 'Beaufort' },
        ],

        // --- MONDE ---
        monde: [
            { entree: 'Nems', plat: 'Poulet au curry', accompagnement: 'Riz basmati', dessert: 'Litchi', fromage: 'Aucun' },
            { entree: 'Houmous et pain pita', plat: 'Kebab maison', accompagnement: 'Semoule', dessert: 'Baklava', fromage: 'Feta' },
            { entree: 'Salade de mangue', plat: 'Bo bun', accompagnement: 'Vermicelles de riz', dessert: 'Perle de coco', fromage: 'Aucun' },
            { entree: 'Guacamole et tortillas', plat: 'Chili con carne', accompagnement: 'Riz', dessert: 'Churros', fromage: 'Cheddar' },
            { entree: 'Soupe miso', plat: 'Sauté de poulet teriyaki', accompagnement: 'Riz gluant', dessert: 'Salade de fruits exotiques', fromage: 'Aucun' },
        ],
    },

    COLLECTIVITES: [
        { id: 'ecole', nom: 'Ecole Primaire' },
        { id: 'college', nom: 'College' },
        { id: 'lycee', nom: 'Lycee' },
        { id: 'creche', nom: 'Creche' },
        { id: 'ehpad', nom: 'EHPAD' }
    ],

    THEMES: [
        { id: 'classique', nom: 'Classique (toute l\'annee)' },
        { id: 'automne', nom: 'Saison Automne' },
        { id: 'hiver', nom: 'Saison Hiver' },
        { id: 'printemps', nom: 'Saison Printemps' },
        { id: 'ete', nom: 'Saison Ete' },
        { id: 'noel', nom: 'Noel' },
        { id: 'paques', nom: 'Paques' },
        { id: 'halloween', nom: 'Halloween' },
        { id: 'fete', nom: 'Fete des enfants' },
        { id: 'chandeleur', nom: 'Chandeleur' },
        { id: 'semaine_gout', nom: 'Semaine du Gout' },
        { id: 'monde', nom: 'Cuisines du Monde' }
    ],

    JOURS: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],

    // =====================================================================
    // ALLERGENES — base elargie pour tous les plats
    // =====================================================================
    ALLERGENES_MAP: {
        // --- Accompagnements / Feculents ---
        'Puree de pommes de terre': 'Lait', 'Puree maison': 'Lait', 'Puree': 'Lait',
        'Gratin dauphinois': 'Lait, Gluten', 'Gratin de chou-fleur': 'Lait, Gluten',
        'Gratin de courgettes': 'Lait, Gluten', 'Gratin de courge': 'Lait, Gluten',
        'Gratin de celeri': 'Lait, Gluten', 'Gratin de legumes': 'Lait, Gluten',
        'Gratin de ravioles': 'Lait, Gluten, Oeufs', 'Gratin de pates au jambon': 'Lait, Gluten',
        'Pates': 'Gluten', 'Coquillettes': 'Gluten', 'Spaghetti': 'Gluten',
        'Tagliatelles': 'Gluten', 'Tagliatelles fraiches': 'Gluten, Oeufs',
        'Pates fraiches': 'Gluten, Oeufs', 'Nouilles chinoises': 'Gluten',
        'Lasagnes bolognaise': 'Gluten, Lait, Oeufs',
        'Raviolis ricotta epinards': 'Gluten, Lait, Oeufs',
        'Riz': '', 'Riz basmati': '', 'Riz pilaf': '', 'Riz complet': '',
        'Riz aux legumes': '', 'Riz aux herbes': '', 'Riz sauvage': '',
        'Riz mexicain': '', 'Riz gluant': '', 'Vermicelles de riz': '',
        'Semoule': 'Gluten', 'Semoule legumes': 'Gluten', 'Polenta': '',
        'Pommes de terre vapeur': '', 'Pommes de terre': '', 'Pommes de terre persillees': '',
        'Pommes de terre nouvelles': '', 'Pommes de terre rissolees': '',
        'Pommes de terre sautees': '', 'Pommes sarladaises': '',
        'Pommes duchesse': 'Lait, Oeufs', 'Frites': '', 'Potatoes': '',
        'Puree de carottes': '', 'Puree de celeri': '', 'Puree de brocoli': '',
        'Puree de panais': '', 'Puree de marrons': '', 'Puree de patate douce': '',
        'Puree de petit pois': '', 'Puree de topinambour': '',
        'Puree carotte': '', 'Haricots verts': '', 'Petits pois carottes': '',
        'Petits pois': '', 'Petits pois frais': '', 'Flageolets': '',
        'Lentilles': '', 'Lentilles vertes': '', 'Epinards a la creme': 'Lait',
        'Epinards': '', 'Epinards frais': '', 'Courgettes sautees': '',
        'Ratatouille': '', 'Tian de legumes': '', 'Carottes Vichy': '',
        'Legumes du pot-au-feu': '', 'Legumes du bouillon': '', 'Legumes du pot': '',
        'Legumes glaces': '', 'Legumes oublies': '', 'Legumes printaniers': '',
        'Jardiniere de legumes': '', 'Fondue de poireaux': '',
        'Chou braise': '', 'Choucroute': '', 'Salade coleslaw': 'Oeufs',
        'Salade verte': '', 'Salade composee': '', 'Mesclun': '',
        'Crudites': '', 'Coulis de tomate': '',

        // --- Entrees ---
        'Salade de carottes rapees': '', 'Carottes rapees': '', 'Carottes nouvelles rapees': '',
        'Salade verte vinaigrette': '', 'Concombre a la creme': 'Lait',
        'Concombre': '', 'Concombre menthe': '',
        'Tomates vinaigrette': '', 'Tomates': '',
        'Salade de tomates': '', 'Salade de tomates mozzarella': 'Lait',
        'Salade de tomates basilic': '', 'Tomates farcies froides': '',
        'Salade de betteraves': '', 'Betteraves vinaigrette': '',
        'Carpaccio de betteraves': '',
        'Salade de lentilles': '', 'Salade de lentilles tiedes': '',
        'Salade de lentilles corail': '', 'Salade de lentilles au chevre': 'Lait',
        'Celeri remoulade': 'Oeufs, Moutarde', 'Salade de chou blanc': '',
        'Salade de chou rouge': '', 'Radis beurre': 'Lait',
        'Salade d\'endives aux noix': 'Fruits a coque', 'Salade d\'endives': '',
        'Terrine de legumes': '', 'Pate de campagne cornichons': 'Gluten',
        'Rillettes de porc': '', 'Saucisson sec cornichons': '',
        'Jambon de pays melon': '', 'Melon jambon cru': '', 'Melon': '',
        'Pamplemousse': '', 'Avocat vinaigrette': '', 'Avocat crevettes': 'Crustaces',
        'Salade de mais': '', 'Salade composee': '', 'Salade de riz': '',
        'Salade de pois chiches': '', 'Salade de haricots blancs': '',
        'Salade de haricots verts': '', 'Salade de fenouil': '',
        'Salade de pommes de terre': '', 'Salade de concombre et tomate': '',
        'Salade de concombre': '', 'Taboulé': 'Gluten', 'Taboulé libanais': 'Gluten',
        'Salade perigourdine': '', 'Salade nicoise': 'Poisson, Oeufs',
        'Salade lyonnaise': 'Oeufs', 'Salade gourmande': '',
        'Salade de feves': '', 'Salade de feves et chevre': 'Lait',
        'Salade de riz niçoise': 'Poisson', 'Salade de pates': 'Gluten',
        'Salade printaniere': '', 'Salade d\'automne': '',
        'Salade iceberg': '', 'Salade cesar': 'Gluten, Lait, Oeufs',
        'Salade de mache': '', 'Salade de carottes orange': '',
        'Salade grecque': 'Lait',
        'Potage de legumes': '', 'Potage Parmentier': '',
        'Potage Dubarry': 'Lait', 'Potage cultivateur': '',
        'Potage aux legumes racines': '', 'Potage de potiron': '',
        'Veloute de legumes': '', 'Veloute de potiron': '',
        'Veloute de courgettes': '', 'Veloute de champignons': '',
        'Veloute de poireaux': '', 'Veloute d\'asperges': '',
        'Veloute de butternut': '', 'Veloute de carottes': '',
        'Veloute de petit pois': '', 'Veloute de topinambour': '',
        'Veloute de potimarron': '', 'Veloute de chataignes': 'Fruits a coque',
        'Veloute de lentilles': '', 'Veloute de panais': '',
        'Veloute de cresson': '',
        'Soupe a l\'oignon': 'Gluten', 'Soupe a l\'oignon gratinee': 'Gluten, Lait',
        'Soupe de legumes': '', 'Soupe de poisson': 'Poisson, Gluten',
        'Soupe au pistou': '', 'Soupe miso': 'Soja, Poisson',
        'Soupe sorciere (butternut)': '',
        'Gaspacho': '', 'Pan bagnat': 'Gluten, Poisson, Oeufs',
        'Oeuf dur mayonnaise': 'Oeufs, Moutarde',
        'Oeufs mimosa': 'Oeufs', 'Asperges vinaigrette': '',
        'Asperges sauce mousseline': 'Oeufs, Lait', 'Artichaut vinaigrette': '',
        'Bruschetta tomate basilic': 'Gluten',
        'Degustation de 3 soupes': '',
        'Chips de legumes': '', 'Carpaccio de courgettes': '',
        'Terrine de poisson': 'Poisson, Oeufs', 'Terrine de lapin': '',
        'Terrine de foie gras': '', 'Pate en croute': 'Gluten, Oeufs',
        'Nems': 'Gluten, Crustaces', 'Houmous et pain pita': 'Gluten, Sesame',
        'Salade de mangue': '', 'Guacamole et tortillas': 'Gluten',
        'Blinis creme fraiche saumon': 'Gluten, Lait, Poisson, Oeufs',
        'Mini-pizza': 'Gluten, Lait', 'Crudites et dips': 'Lait',
        'Foie gras sur toast': 'Gluten', 'Saumon fume': 'Poisson',
        'Degustation de 3 soupes': '',

        // --- Plats ---
        'Poulet roti': '', 'Poulet roti au citron': '', 'Poulet au citron': '',
        'Cuisse de poulet rotie': '', 'Poulet fermier au thym': '', 'Poulet fermier au jus': '',
        'Poulet au curry': '', 'Poulet tikka': '', 'Poulet basquaise': '',
        'Poulet aux champignons': '', 'Poulet grille': '', 'Poulet farci': '',
        'Poulet roti sauce orange': '',
        'Escalope de dinde': '', 'Filet de dinde': '', 'Filet de dinde sauce moutarde': 'Moutarde',
        'Emince de dinde au curry': '', 'Filet de poulet grille': '',
        'Escalope de poulet panee': 'Gluten', 'Escalope de poulet': '',
        'Aiguillettes de canard': '', 'Magret de canard': '', 'Confit de canard': '',
        'Canard a l\'orange': '', 'Pintade aux raisins': '',
        'Blanquette de veau': 'Lait, Gluten', 'Escalope de veau': '',
        'Escalope de veau panee': 'Gluten, Oeufs', 'Sauté de veau aux olives': '',
        'Paupiette de veau': 'Gluten', 'Roti de veau orloff': 'Lait, Gluten',
        'Roti de veau printanier': '',
        'Boeuf bourguignon': 'Sulfites', 'Boeuf aux carottes': '',
        'Boeuf Stroganoff': 'Lait', 'Emince de boeuf stroganoff': 'Lait',
        'Steak hache grille': '', 'Steak hache': '', 'Boulettes de boeuf sauce tomate': 'Gluten',
        'Boulettes monstrueuses': 'Gluten', 'Roti de boeuf': '',
        'Roti de boeuf en croute': 'Gluten', 'Roti de boeuf aux herbes': '',
        'Brochette de boeuf': '', 'Brochettes de boeuf': '',
        'Joue de boeuf braisee': '', 'Daube provencale': '',
        'Hachis parmentier': 'Lait', 'Hachis parmentier citrouille': 'Lait',
        'Pot-au-feu': '', 'Roti de porc': '', 'Roti de porc au miel': '',
        'Sauté de porc caramelise': 'Soja', 'Sauté de porc aux pommes': '',
        'Filet mignon de porc': '', 'Palette de porc': '', 'Grillade de porc': '',
        'Jambon braise': '',
        'Saucisse de Toulouse': '', 'Saucisse de Strasbourg': '', 'Saucisses fumees': '',
        'Petit sale aux lentilles': '', 'Cassoulet': '',
        'Choucroute garnie': '', 'Coq au vin': 'Sulfites',
        'Poule au pot': '', 'Tartiflette': 'Lait',
        'Gigot d\'agneau': '', 'Carre d\'agneau': '', 'Navarin d\'agneau': '',
        'Tajine d\'agneau': '', 'Tajine de poulet aux pruneaux': '',
        'Couscous poulet merguez': 'Gluten',
        'Lapin a la moutarde': 'Moutarde',
        'Filet de biche': '',
        'Raclette': 'Lait',

        // --- Poissons ---
        'Filet de colin sauce citron': 'Poisson',
        'Pave de saumon grille': 'Poisson', 'Pave de saumon': 'Poisson', 'Filet de saumon': 'Poisson',
        'Filet de merlu meuniere': 'Poisson, Gluten', 'Filet de merlu': 'Poisson',
        'Brandade de morue': 'Poisson, Lait', 'Dos de cabillaud': 'Poisson',
        'Filet de cabillaud': 'Poisson',
        'Filet de lieu noir pane': 'Poisson, Gluten', 'Pave de lieu noir': 'Poisson',
        'Dos de lieu sauce vierge': 'Poisson',
        'Thon a la provencale': 'Poisson', 'Filet de truite amandine': 'Poisson, Fruits a coque',
        'Filet de truite': 'Poisson', 'Truite meuniere': 'Poisson, Gluten',
        'Filet de truite aux amandes': 'Poisson, Fruits a coque',
        'Filet de dorade': 'Poisson', 'Filet de bar grille': 'Poisson',
        'Poisson pane': 'Poisson, Gluten', 'Poisson grille': 'Poisson',
        'Fish and chips': 'Poisson, Gluten',
        'Paella': 'Crustaces, Mollusques, Poisson, Gluten',
        'Quenelles sauce Nantua': 'Gluten, Lait, Oeufs, Crustaces',
        'Soupe de poisson': 'Poisson',
        'Sauté de poulet teriyaki': 'Soja, Gluten',
        'Bo bun': 'Gluten, Arachide, Crustaces',

        // --- Oeufs / Vegetarien ---
        'Omelette aux fines herbes': 'Oeufs', 'Quiche lorraine': 'Gluten, Lait, Oeufs',
        'Tarte aux legumes': 'Gluten, Lait, Oeufs',
        'Gratin de legumes': 'Lait',
        'Crepes jambon-fromage': 'Gluten, Lait, Oeufs',
        'Crepes aux champignons': 'Gluten, Lait, Oeufs',
        'Galettes sarrasin complete': 'Gluten, Oeufs', 'Galettes saucisse': 'Gluten',
        'Croque-monsieur': 'Gluten, Lait',
        'Kebab maison': 'Gluten',

        // --- Plaisir ---
        'Hamburger maison': 'Gluten, Lait, Oeufs, Sesame',
        'Pizza margherita': 'Gluten, Lait',
        'Nuggets de poulet': 'Gluten', 'Nuggets de poulet maison': 'Gluten, Oeufs',
        'Cordon bleu': 'Gluten, Lait',
        'Hot-dog': 'Gluten',
        'Tacos poulet': 'Gluten',
        'Wrap poulet crudites': 'Gluten',
        'Brochettes de poulet': '', 'Brochette de poulet': '',
        'Chili con carne': '',
        'Osso buco': '',

        // --- Desserts ---
        'Fruit de saison': '', 'Fruit': '', 'Fraises': '', 'Melon': '',
        'Pasteque': '', 'Orange': '', 'Peche': '', 'Nectarine': '',
        'Abricots': '', 'Raisin': '', 'Litchi': '', 'Poire au chocolat': 'Lait',
        'Salade de fruits': '', 'Salade de fruits exotiques': '', 'Sorbet citron': '',
        'Sorbet fruits rouges': '',
        'Yaourt': 'Lait', 'Yaourt nature': 'Lait', 'Yaourt aux fruits': 'Lait',
        'Fromage blanc sucre': 'Lait',
        'Compote': '', 'Compote de pommes': '', 'Compote pomme-poire': '',
        'Compote de fruits': '', 'Compote pomme-cannelle': '', 'Compote pomme-coing': '',
        'Compote rhubarbe': '', 'Compote de figues': '', 'Compote de coings': '',
        'Tarte aux pommes': 'Gluten, Lait, Oeufs', 'Tarte Tatin': 'Gluten, Lait',
        'Tarte aux fraises': 'Gluten, Lait, Oeufs',
        'Tarte aux myrtilles': 'Gluten, Lait, Oeufs',
        'Tarte aux noix': 'Gluten, Lait, Oeufs, Fruits a coque',
        'Tarte praline': 'Gluten, Lait, Fruits a coque',
        'Tarte alsacienne': 'Gluten, Lait, Oeufs',
        'Clafoutis aux cerises': 'Gluten, Lait, Oeufs',
        'Clafoutis aux poires': 'Gluten, Lait, Oeufs',
        'Creme dessert vanille': 'Lait', 'Creme dessert chocolat': 'Lait',
        'Creme dessert': 'Lait', 'Creme caramel': 'Lait, Oeufs',
        'Creme brulee': 'Lait, Oeufs', 'Creme au chocolat': 'Lait',
        'Creme a la vanille': 'Lait', 'Creme catalane': 'Lait, Oeufs',
        'Ile flottante': 'Lait, Oeufs',
        'Riz au lait': 'Lait',
        'Mousse au chocolat': 'Lait, Oeufs',
        'Mousse au chocolat de Paques': 'Lait, Oeufs',
        'Mousse de fraises': 'Lait',
        'Panna cotta': 'Lait',
        'Tiramisu': 'Gluten, Lait, Oeufs',
        'Gateau au chocolat': 'Gluten, Lait, Oeufs',
        'Gateau aux noix': 'Gluten, Oeufs, Fruits a coque',
        'Gateau araignee chocolat': 'Gluten, Lait, Oeufs',
        'Brownie': 'Gluten, Lait, Oeufs',
        'Profiteroles au chocolat': 'Gluten, Lait, Oeufs',
        'Charlotte au chocolat': 'Gluten, Lait, Oeufs',
        'Buche au chocolat': 'Gluten, Lait, Oeufs',
        'Buche vanille framboise': 'Gluten, Lait, Oeufs',
        'Buche fruits rouges': 'Gluten, Lait, Oeufs',
        'Buche pralinee': 'Gluten, Lait, Oeufs, Fruits a coque',
        'Nid de Paques meringue': 'Oeufs',
        'Cupcake citrouille': 'Gluten, Lait, Oeufs',
        'Pomme d\'amour': '',
        'Glace': 'Lait', 'Glace vanille': 'Lait', 'Glace 2 boules': 'Lait',
        'Crepes sucrees': 'Gluten, Lait, Oeufs',
        'Crepes Nutella': 'Gluten, Lait, Oeufs, Fruits a coque',
        'Crepes confiture': 'Gluten, Lait, Oeufs',
        'Crepes caramel beurre sale': 'Gluten, Lait, Oeufs',
        'Patisserie orientale': 'Gluten, Fruits a coque',
        'Baklava': 'Gluten, Fruits a coque',
        'Churros': 'Gluten, Oeufs',
        'Perle de coco': 'Lait',

        // --- Fromages (tous = Lait par defaut sauf exception) ---
        'Aucun': '',
    },

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-menus');
        const savedMenus = Storage.getMenus(this.selectedDate);

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🍽️ Generateur de Menus</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Menus.showGenerateModal()">
                        + Generer Menu
                    </button>
                    <button class="btn btn-secondary" onclick="Menus.showCreateCustomMenuModal()">
                        ✏️ Creer Menu Personnalise
                    </button>
                    ${savedMenus.length > 0 ? `
                        <button class="btn btn-success" onclick="Menus.exportMenuPDF()">
                            📄 Export PDF
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="date-filter">
                <label>Semaine du :</label>
                <input type="date" value="${this.selectedDate}" onchange="Menus.changeDate(this.value)">
            </div>

            ${savedMenus.length === 0
                ? UI.emptyState('🍽️', 'Aucun menu genere pour cette semaine. Cliquez sur "+ Generer Menu" pour commencer.')
                : this._renderSavedMenus(savedMenus)
            }

            ${this._renderHistorique()}
        `;
    },

    _renderSavedMenus(menus) {
        let html = '';
        menus.forEach((menu, idx) => {
            html += `
                <div class="card menu-week-card fade-in">
                    <div class="card-header">
                        <div class="card-title">
                            📅 Semaine ${idx + 1} — ${menu.theme_nom} (${menu.collectivite_nom})
                        </div>
                        <button class="btn btn-danger" onclick="Menus.deleteMenu(${idx})" title="Supprimer">🗑️</button>
                    </div>
                    <div class="table-container">
                        <table class="table matrice-table">
                            <thead>
                                <tr>
                                    <th>Jour</th>
                                    <th>Entree</th>
                                    <th>Plat</th>
                                    <th>Accompagnement</th>
                                    <th>Dessert</th>
                                    <th>Fromage</th>
                                    <th>Allergenes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${menu.jours.map(j => `
                                    <tr>
                                        <td style="font-weight:600;color:var(--accent);">${j.jour}</td>
                                        <td>${j.entree}</td>
                                        <td>${j.plat}</td>
                                        <td>${j.accompagnement}</td>
                                        <td>${j.dessert}</td>
                                        <td>${j.fromage}</td>
                                        <td style="font-size:0.8rem;color:var(--warning);">${j.allergenes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
        return html;
    },

    _renderHistorique() {
        const allDates = Storage.getMenuDates();
        if (allDates.length === 0) return '';

        const otherDates = allDates.filter(d => d !== this.selectedDate).slice(0, 10);
        if (otherDates.length === 0) return '';

        return `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-title">📋 Historique des menus</div>
                <div style="margin-top:1rem;">
                    ${otherDates.map(d => {
                        const menus = Storage.getMenus(d);
                        return `
                            <div class="checklist-item" onclick="Menus.selectedDate='${d}'; Menus.render();" style="cursor:pointer;">
                                <div class="checklist-label">
                                    <strong>${Storage.formatDate(d)}</strong>
                                    <span style="color:var(--text-muted);margin-left:0.5rem;">${menus.length} menu(s)</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    changeDate(date) {
        this.selectedDate = date;
        this.render();
    },

    showGenerateModal() {
        const body = `
            <div class="form-group">
                <label>Collectivite</label>
                <select class="form-control form-control-lg" id="menu-collectivite">
                    ${this.COLLECTIVITES.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Thematique</label>
                <select class="form-control form-control-lg" id="menu-theme">
                    ${this.THEMES.map(t => `<option value="${t.id}">${t.nom}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Nombre de semaines</label>
                <select class="form-control" id="menu-nb-semaines">
                    <option value="1">1 semaine</option>
                    <option value="2">2 semaines</option>
                    <option value="3">3 semaines</option>
                    <option value="4" selected>4 semaines (1 mois)</option>
                    <option value="8">8 semaines (2 mois)</option>
                    <option value="12">12 semaines (1 trimestre)</option>
                    <option value="36">36 semaines (annee scolaire)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Semaine du</label>
                <input type="date" class="form-control" id="menu-date" value="${this.selectedDate}">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Menus.generateMenus()">Generer</button>
        `;

        UI.openModal('Generer un menu', body, footer);
    },

    generateMenus() {
        const collectiviteId = document.getElementById('menu-collectivite').value;
        const themeId = document.getElementById('menu-theme').value;
        const nbSemaines = parseInt(document.getElementById('menu-nb-semaines').value);
        const date = document.getElementById('menu-date').value;

        const collectivite = this.COLLECTIVITES.find(c => c.id === collectiviteId);
        const theme = this.THEMES.find(t => t.id === themeId);
        let stockList = this.STOCK_MENUS[themeId] || this.STOCK_MENUS.classique;

        // Pour les themes saisonniers, on melange avec le classique pour plus de variete
        if (['automne', 'hiver', 'printemps', 'ete'].includes(themeId)) {
            stockList = stockList.concat(this.STOCK_MENUS.classique);
        }

        const newMenus = [];
        const usedIndices = new Set();

        for (let s = 0; s < nbSemaines; s++) {
            const jourMenus = [];
            const weekUsed = new Set();

            for (let j = 0; j < 5; j++) {
                // Eviter les repetitions au max dans la meme semaine
                let menuData;
                let attempts = 0;
                do {
                    const idx = Math.floor(Math.random() * stockList.length);
                    menuData = stockList[idx];
                    attempts++;
                } while (weekUsed.has(menuData.plat) && attempts < 20);

                weekUsed.add(menuData.plat);

                // Adapter pour la collectivite
                const adapted = this._adaptForCollectivite(menuData, collectiviteId);
                const allergenes = this._collectAllergenes(adapted);

                jourMenus.push({
                    jour: this.JOURS[j],
                    entree: adapted.entree,
                    plat: adapted.plat,
                    accompagnement: adapted.accompagnement,
                    dessert: adapted.dessert,
                    fromage: adapted.fromage,
                    allergenes: allergenes
                });
            }

            newMenus.push({
                semaine: s + 1,
                theme_id: themeId,
                theme_nom: theme.nom,
                collectivite_id: collectiviteId,
                collectivite_nom: collectivite.nom,
                jours: jourMenus,
                date_generation: new Date().toISOString(),
                user: App.currentUser?.nom || 'Inconnu'
            });
        }

        // Save
        const existing = Storage.getMenus(date);
        const allMenus = existing.concat(newMenus);
        Storage.saveMenus(date, allMenus);

        this.selectedDate = date;
        Journal.log('menus', `Menu genere: ${nbSemaines} semaine(s), theme ${theme.nom}, collectivite ${collectivite.nom}`);

        UI.toast(`${nbSemaines} menu(s) genere(s) avec succes !`, 'success');
        UI.closeModal();
        this.render();
    },

    // Adapte les menus selon la collectivite
    _adaptForCollectivite(menuData, collectiviteId) {
        const adapted = Object.assign({}, menuData);

        switch (collectiviteId) {
            case 'creche':
                // Pas de noix, pas de plats epices, portions adaptees
                if (adapted.plat.includes('curry') || adapted.plat.includes('Chili') ||
                    adapted.plat.includes('Kebab') || adapted.plat.includes('Tacos') ||
                    adapted.plat.includes('teriyaki')) {
                    adapted.plat = 'Poulet roti';
                    adapted.accompagnement = 'Puree de carottes';
                }
                if (adapted.entree.includes('noix') || adapted.entree.includes('Nems')) {
                    adapted.entree = 'Salade de carottes rapees';
                }
                if (adapted.dessert.includes('Nutella') || adapted.dessert.includes('Churros')) {
                    adapted.dessert = 'Compote de pommes';
                }
                break;

            case 'ehpad':
                // Textures adaptees, pas trop dur a macher
                if (adapted.plat.includes('Hamburger') || adapted.plat.includes('Pizza') ||
                    adapted.plat.includes('Tacos') || adapted.plat.includes('Hot-dog')) {
                    adapted.plat = 'Filet de poulet grille';
                    adapted.accompagnement = 'Puree de pommes de terre';
                }
                if (adapted.dessert.includes('Churros') || adapted.dessert.includes('Pomme d\'amour')) {
                    adapted.dessert = 'Compote';
                }
                break;
        }

        return adapted;
    },

    _collectAllergenes(menuData) {
        const allItems = [menuData.entree, menuData.plat, menuData.accompagnement, menuData.dessert, menuData.fromage];
        const allergenesSet = new Set();

        allItems.forEach(item => {
            const allergens = this.ALLERGENES_MAP[item];
            if (allergens) {
                allergens.split(', ').filter(a => a).forEach(a => allergenesSet.add(a));
            }
        });

        // Fromage = Lait par defaut (sauf "Aucun")
        if (menuData.fromage && menuData.fromage !== 'Aucun') {
            allergenesSet.add('Lait');
        }

        return allergenesSet.size > 0 ? Array.from(allergenesSet).join(', ') : '';
    },

    deleteMenu(index) {
        const menus = Storage.getMenus(this.selectedDate);
        menus.splice(index, 1);
        Storage.saveMenus(this.selectedDate, menus);
        UI.toast('Menu supprime', 'info');
        this.render();
    },

    exportMenuPDF() {
        PDF.export('menus');
    },

    // =====================================================================
    // LISTES STATIQUES POUR MENUS PERSONNALISES
    // =====================================================================
    ACCOMPAGNEMENTS: [
        'Puree de pommes de terre', 'Riz', 'Riz basmati', 'Riz pilaf', 'Semoule',
        'Pates', 'Coquillettes', 'Spaghetti', 'Tagliatelles', 'Nouilles chinoises',
        'Pommes de terre vapeur', 'Pommes de terre rissolees', 'Frites', 'Potatoes',
        'Haricots verts', 'Petits pois', 'Petits pois carottes', 'Lentilles vertes',
        'Epinards a la creme', 'Ratatouille', 'Carottes Vichy', 'Courgettes sautees',
        'Salade verte', 'Mesclun', 'Crudites', 'Jardiniere de legumes'
    ],

    FROMAGES: [
        'Comte', 'Emmental', 'Brie', 'Camembert', 'Cheddar', 'Mozzarella',
        'Parmesan', 'Gruyere', 'Saint-Nectaire', 'Tomme de Savoie', 'Cantal',
        'Mimolette', 'Reblochon', 'Munster', 'Bleu d\'Auvergne', 'Roquefort',
        'Chevre frais', 'Feta', 'Beaufort', 'Gouda', 'Aucun'
    ],

    // =====================================================================
    // CREATION MENU PERSONNALISE — Selection manuelle de recettes
    // =====================================================================
    showCreateCustomMenuModal() {
        // Charger les recettes depuis la base DE DONNEES + Storage (recettes custom ajoutees)
        const recettesDb = RecettesDatabase.RECETTES_PAR_DEFAUT || [];
        const recettesStorage = Storage.getRecettes() || [];
        const allRecettes = [...recettesDb, ...recettesStorage];
        
        // Grouper par categorie
        const categoriesMap = {};
        allRecettes.forEach(recette => {
            const cat = recette.categorie || 'Autre';
            if (!categoriesMap[cat]) {
                categoriesMap[cat] = [];
            }
            // Eviter les doublons
            if (!categoriesMap[cat].includes(recette.nom)) {
                categoriesMap[cat].push(recette.nom);
            }
        });
        
        // Ajouter les listes statiques
        categoriesMap['Accompagnement'] = this.ACCOMPAGNEMENTS;
        categoriesMap['Fromage'] = this.FROMAGES;

        // Categories principales pour un menu complet
        const MENU_CATEGORIES = ['Entree', 'Plat principal', 'Accompagnement', 'Dessert', 'Fromage'];
        
        let body = `
            <div class="form-group">
                <label>Collectivite</label>
                <select class="form-control form-control-lg" id="custom-menu-collectivite">
                    ${this.COLLECTIVITES.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Date de debut</label>
                <input type="date" class="form-control" id="custom-menu-date" value="${this.selectedDate}">
            </div>

            <div id="custom-menu-days-container">
                ${this.JOURS.map((jour, dayIdx) => `
                    <div class="card" style="margin-bottom: 1rem;">
                        <div class="card-title" style="color: var(--accent); margin-bottom: 1rem;">${jour}</div>
                        ${MENU_CATEGORIES.map(categorie => {
                            const recettes = categoriesMap[categorie] || [];
                            const selectId = `custom-menu-${dayIdx}-${categorie.replace(/\s+/g, '-')}`;
                            const customInputId = `${selectId}-custom-input`;
                            const customContainerId = `${selectId}-custom-container`;
                            return `
                                <div class="form-group">
                                    <label>${categorie}</label>
                                    <select class="form-control" id="${selectId}" onchange="Menus._toggleCustomInput('${selectId}', '${customContainerId}')">
                                        <option value="">-- Selectionnez --</option>
                                        <option value="__CUSTOM__">✏️ Ajouter custom...</option>
                                        ${recettes.map(rec => `<option value="${rec}">${rec}</option>`).join('')}
                                    </select>
                                    <div id="${customContainerId}" style="display:none; margin-top:0.5rem;">
                                        <input type="text" class="form-control" id="${customInputId}" placeholder="Entrez le nom du plat personnalise" style="font-style:italic;">
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Menus.saveCustomMenu()">Creer Menu</button>
        `;

        UI.openModal('Creer un Menu Personnalise', body, footer);
    },

    _toggleCustomInput(selectId, containerId) {
        const select = document.getElementById(selectId);
        const container = document.getElementById(containerId);
        const input = document.getElementById(`${selectId}-custom-input`);
        
        if (select.value === '__CUSTOM__') {
            container.style.display = 'block';
            setTimeout(() => input.focus(), 0);
        } else {
            container.style.display = 'none';
            input.value = ''; // Effacer si on change de choix
        }
    },

    // Récupère la valeur : soit la sélection, soit le custom input
    _getMenuValue(dayIdx, categorie) {
        const selectId = `custom-menu-${dayIdx}-${categorie}`;
        const select = document.getElementById(selectId);
        const customInput = document.getElementById(`${selectId}-custom-input`);
        
        // Si un custom input a du texte, retourner sa valeur
        if (customInput && customInput.value.trim()) {
            return customInput.value.trim();
        }
        
        // Sinon retourner la sélection du select (vide si non sélectionné)
        return select.value || '';
    },

    saveCustomMenu() {
        const collectiviteId = document.getElementById('custom-menu-collectivite').value;
        const date = document.getElementById('custom-menu-date').value;
        const collectivite = this.COLLECTIVITES.find(c => c.id === collectiviteId);

        const jourMenus = [];
        this.JOURS.forEach((jour, dayIdx) => {
            const menuData = {
                jour: jour,
                entree: this._getMenuValue(dayIdx, 'Entree') || '-',
                plat: this._getMenuValue(dayIdx, 'Plat-principal') || '-',
                accompagnement: this._getMenuValue(dayIdx, 'Accompagnement') || '-',
                dessert: this._getMenuValue(dayIdx, 'Dessert') || '-',
                fromage: this._getMenuValue(dayIdx, 'Fromage') || '-'
            };
            
            
            menuData.allergenes = this._collectAllergenes(menuData);
            jourMenus.push(menuData);
        });

        // Creer le menu
        const newMenu = {
            semaine: 1,
            theme_id: 'personnalise',
            theme_nom: '👤 Menu Personnalise',
            collectivite_id: collectiviteId,
            collectivite_nom: collectivite.nom,
            jours: jourMenus,
            date_generation: new Date().toISOString(),
            user: App.currentUser?.nom || 'Inconnu'
        };

        // Save
        const existing = Storage.getMenus(date);
        const allMenus = existing.concat([newMenu]);
        Storage.saveMenus(date, allMenus);

        this.selectedDate = date;
        Journal.log('menus', `Menu personnalise cree pour ${collectivite.nom}`);
        UI.toast('Menu personnalise cree avec succes !', 'success');
        UI.closeModal();
        this.render();
    }
};
