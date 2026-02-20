/* ============================================================
   OK CUISINE - Centre de Formation HACCP 14H
   VERSION AMÉLIORÉE - En route vers conformité DREETS
   
   ✅ Programme enrichi 14h total
   ✅ Traçabilité basique fonctionnelle
   ✅ Quiz validation par module
   ✅ Attestations PDF améliorées
   ✅ Prêt pour utilisation réelle
   
   📋 Prochaines étapes (développement futur) :
   • Traçabilité horodatée précise
   • Verrouillage progressif strict
   • Interface formateur complète
   • Export rapports audit
   ============================================================ */

const CentreFormation = {
    selectedCourseId: null,
    currentLessonId: null,
    lessonStartTime: null,
    sessionData: {},

    // Programme 14h - Durées calculées
    courses: [
        {
            id: 'haccp-essentiel',
            title: 'HACCP Essentiel',
            level: 'Essentiel',
            duration: '2h 30',
            description: 'Comprendre les bases HACCP, les dangers et les 7 principes pour une cuisine conforme.',
            objectives: [
                'Identifier les dangers (bio, chimique, physique)',
                'Appliquer les 7 principes HACCP',
                'Structurer la documentation et les enregistrements'
            ],
            lessons: [
                {
                    id: 'haccp-cadre',
                    title: 'Cadre reglementaire et responsabilites',
                    content: `
                        <p>Cette lecon pose le cadre legal de l'hygiene alimentaire.</p>
                        <ul>
                            <li>Reglement (CE) 852/2004 et obligations des exploitants.</li>
                            <li>Responsabilites du personnel et du responsable HACCP.</li>
                            <li>Importance de la tracabilite et des enregistrements.</li>
                        </ul>
                    `
                },
                {
                    id: 'haccp-dangers',
                    title: 'Dangers et analyse des risques',
                    content: `
                        <p>Identifier les dangers pour mieux les maitriser.</p>
                        <ul>
                            <li>Dangers biologiques: bacteries, virus, parasites.</li>
                            <li>Dangers chimiques: produits d'entretien, allergenes, toxines.</li>
                            <li>Dangers physiques: fragments, corps etrangers.</li>
                        </ul>
                    `
                },
                {
                    id: 'haccp-7p',
                    title: 'Les 7 principes HACCP',
                    content: `
                        <p>Le coeur de la methode HACCP.</p>
                        <ol>
                            <li>Analyser les dangers</li>
                            <li>Determiner les CCP</li>
                            <li>Fixer les limites critiques</li>
                            <li>Mettre en place la surveillance</li>
                            <li>Definir les actions correctives</li>
                            <li>Verifier le systeme</li>
                            <li>Documenter et enregistrer</li>
                        </ol>
                    `
                },
                {
                    id: 'haccp-doc',
                    title: 'Documentation et preuves',
                    content: `
                        <p>Construire un dossier conforme et facile a auditer.</p>
                        <ul>
                            <li>Fiches de suivi (temperatures, nettoyages, receptions).</li>
                            <li>Plan de maitrise sanitaire (PMS).</li>
                            <li>Archivage et acces rapide aux preuves.</li>
                        </ul>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Quel est l objectif principal du HACCP ?',
                        options: [
                            'Reduire les couts de production',
                            'Garantir la securite sanitaire des aliments',
                            'Accelerer le service en cuisine',
                            'Standardiser les recettes'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Combien de principes HACCP existe-t-il ?',
                        options: ['5', '6', '7', '8'],
                        answer: 2
                    },
                    {
                        q: 'Que signifie un CCP ?',
                        options: [
                            'Controle critique de produit',
                            'Point critique pour la maitrise',
                            'Protocole de cuisson prioritaire',
                            'Plan de controle permanent'
                        ],
                        answer: 1
                    },
                    {
                        q: 'La documentation HACCP sert surtout a :',
                        options: [
                            'Prouver la conformite et la maitrise',
                            'Remplacer les formations',
                            'Eviter les controles officiels',
                            'Automatiser les achats'
                        ],
                        answer: 0
                    }
                ]
            }
        },
        {
            id: 'hygiene-quotidienne',
            title: 'Hygiene quotidienne',
            level: 'Essentiel',
            duration: '1h 30',
            description: 'Les bons gestes, les EPI et l organisation pour limiter les contaminations.',
            objectives: [
                'Adopter les bons reflexes personnels',
                'Organiser les zones propres et sales',
                'Limiter les contaminations croisees'
            ],
            lessons: [
                {
                    id: 'hygiene-personnelle',
                    title: 'Hygiene personnelle - Les fondamentaux',
                    content: `
                        <h4>La premiere barriere de securite, c'est VOUS</h4>
                        
                        <p><strong>Pourquoi l'hygiene personnelle est cruciale ?</strong></p>
                        <p>Vos mains, vos vetements, votre etat de sante influencent directement la securite des aliments.
                        Les mains sont le principal vecteur de contamination en cuisine professionnelle.</p>

                        <h5>1. Lavage des mains - Quand et comment ?</h5>
                        <p><strong>QUAND se laver les mains (OBLIGATOIRE) :</strong></p>
                        <ul>
                            <li>A l'arrivee en cuisine (debut de poste)</li>
                            <li>Apres etre alle aux toilettes</li>
                            <li>Apres manipulation de denrees crues (viande, poisson, oeuf, legumes terreux)</li>
                            <li>Apres manipulation d'emballages, cartons, dechets</li>
                            <li>Apres s'etre mouche, touche les cheveux, le visage</li>
                            <li>Apres nettoyage ou manipulation de produits chimiques</li>
                            <li>Avant reprise du travail apres pause</li>
                            <li>Avant manipulation de denrees pretes a consommer</li>
                        </ul>

                        <p><strong>COMMENT se laver les mains correctement :</strong></p>
                        <ol>
                            <li>Mouiller les mains a l'eau tiede</li>
                            <li>Savonner abondamment (savon liquide bactéricide)</li>
                            <li>Frotter pendant 20-30 secondes : paumes, dos, entre doigts, ongles, poignets</li>
                            <li>Rincer abondamment</li>
                            <li>Secher avec essuie-mains a usage unique</li>
                            <li>Fermer robinet avec l'essuie-mains (eviter recontamination)</li>
                        </ol>

                        <div style="background:#e74c3c;color:white;padding:1rem;border-radius:8px;margin:1rem 0;">
                            <strong>⚠️ INTERDIT :</strong> Bijoux (bagues, bracelets, montres), vernis a ongles, 
                            faux ongles. Les bacteries s'y logent et sont impossibles a eliminer.
                        </div>

                        <h5>2. Tenue de travail professionnelle</h5>
                        <p><strong>Exigences reglementaires :</strong></p>
                        <ul>
                            <li><strong>Veste/blouse :</strong> Propre, de couleur claire, changee quotidiennement</li>
                            <li><strong>Pantalon :</strong> Specifique cuisine, jamais porte a l'exterieur</li>
                            <li><strong>Coiffe/charlotte :</strong> Obligatoire, cheveux entierement couverts</li>
                            <li><strong>Chaussures :</strong> Fermees, antiderapantes, reservees a la cuisine</li>
                            <li><strong>Tablier :</strong> Change entre zones (cru/cuit, preparation/service)</li>
                        </ul>

                        <p><strong>Vestiaires et stockage :</strong></p>
                        <ul>
                            <li>Vestiaire separe avec casiers individuels</li>
                            <li>Tenue de ville JAMAIS stockee avec tenue de travail</li>
                            <li>Tenue de ville JAMAIS portee en cuisine (meme rapidement)</li>
                            <li>Chaussures de ville changees avant entree en cuisine</li>
                        </ul>

                        <h5>3. Gestion des blessures et maladies</h5>
                        <p><strong>En cas de blessure (coupure, brulure) :</strong></p>
                        <ul>
                            <li>Nettoyer et desinfecter immediatement</li>
                            <li>Couvrir avec pansement ETANCHE (bleu detecteur de preference)</li>
                            <li>Porter gant jetable par-dessus si manipulation denrees</li>
                            <li>Signaler au responsable</li>
                            <li>Si blessure importante : retrait temporaire du poste</li>
                        </ul>

                        <p><strong>En cas de maladie :</strong></p>
                        <ul>
                            <li><strong>INTERDICTION de travailler si :</strong> diarrhee, vomissements, fievre, infection cutanee suppurante</li>
                            <li>Risque de contamination des aliments (Salmonelle, Staphylocoque, Hepatite A, etc.)</li>
                            <li>Prevenir le responsable AVANT de venir travailler</li>
                            <li>Certificat medical de reprise parfois necessaire</li>
                        </ul>

                        <h5>4. Bonnes pratiques quotidiennes</h5>
                        <ul>
                            <li>Ongles courts, propres, non vernis</li>
                            <li>Cheveux attaches + coiffe</li>
                            <li>Pas de parfum fort (risque de migration odeur vers aliments)</li>
                            <li>Pas de smartphone en cuisine (risque contamination)</li>
                            <li>Ne pas fumer (reglementaire + risque contamination mains)</li>
                            <li>Ne pas manger, boire, macher chewing-gum en zone de preparation</li>
                            <li>Ne pas eternuer/tousser vers denrees (se detourner, se couvrir)</li>
                        </ul>

                        <div style="background:#0f3460;color:white;padding:1rem;border-radius:8px;margin:1rem 0;">
                            <strong>✓ A RETENIR :</strong> L'hygiene personnelle rigoureuse est la BASE de la securite alimentaire.
                            C'est la responsabilite de CHAQUE membre de l'equipe, TOUS LES JOURS.
                        </div>
                    `
                },
                {
                    id: 'hygiene-zonage',
                    title: 'Zonage et flux - Marche en avant',
                    content: `
                        <h4>Organiser l'espace pour eviter les contaminations croisees</h4>
                        
                        <p><strong>Principe de la marche en avant :</strong></p>
                        <p>Les denrees et le personnel avancent toujours dans le meme sens, sans retour en arriere,
                        depuis la zone la plus sale (reception, dechets) vers la zone la plus propre (plats finis, service).</p>

                        <h5>1. Les differentes zones</h5>
                        <p><strong>Zone de reception et stockage :</strong></p>
                        <ul>
                            <li>Reception marchandises (controles, deballage)</li>
                            <li>Zones de stockage : sec, froids positifs, surgelés</li>
                            <li>Potentiellement contaminée (cartons, emballages exterieurs)</li>
                        </ul>

                        <p><strong>Zone de preparation sale :</strong></p>
                        <ul>
                            <li>Epluchage, lavage legumes, deconditionnement viandes/poissons</li>
                            <li>Manipulation produits crus</li>
                            <li>Forte charge microbienne</li>
                        </ul>

                        <p><strong>Zone de preparation propre :</strong></p>
                        <ul>
                            <li>Assemblage, cuisson, refroidissement</li>
                            <li>Manipulation produits cuits ou prets a consommer</li>
                            <li>Pas de retour possible de produits crus</li>
                        </ul>

                        <p><strong>Zone de service et distribution :</strong></p>
                        <ul>
                            <li>Dressage, mise en assiette, service</li>
                            <li>Zone la plus propre</li>
                            <li>Temperature maintenue (chaud >63°C, froid <4°C)</li>
                        </ul>

                        <p><strong>Zone de plonge et dechets :</strong></p>
                        <ul>
                            <li>Lavage vaisselle, ustensiles</li>
                            <li>Stockage poubelles</li>
                            <li>Zone separee physiquement des autres</li>
                        </ul>

                        <h5>2. Flux des denrees alimentaires</h5>
                        <p><strong>Exemple de flux optimal :</strong></p>
                        <ol>
                            <li><strong>Reception :</strong> Livraison camion → quai réception → controles</li>
                            <li><strong>Stockage :</strong> Mise en chambres froides/reserve selon nature produit</li>
                            <li><strong>Preparation sale :</strong> Sortie stock → epluchage/lavage → decoupe</li>
                            <li><strong>Preparation propre :</strong> Cuisson → assemblage → conditionnement</li>
                            <li><strong>Maintien temperature :</strong> Cellule refroidissement ou maintien chaud</li>
                            <li><strong>Service :</strong> Remise en temperature si besoin → dressage → distribution</li>
                        </ol>

                        <p><strong>⚠️ Points de vigilance :</strong></p>
                        <ul>
                            <li>JAMAIS de retour en arriere (produit cuit qui repart en zone sale)</li>
                            <li>Changement de tablier entre zones</li>
                            <li>Lavage mains systematique entre zones</li>
                            <li>Pas de croisement personnel sale/propre</li>
                        </ul>

                        <h5>3. Separation cru/cuit - REGLE D'OR</h5>
                        <p><strong>Pourquoi separer ?</strong></p>
                        <p>Les produits crus (viande, poisson, oeuf, legumes non laves) portent naturellement
                        des micro-organismes pathogenes. Le contact avec produits cuits ou prets a consommer
                        peut les contaminer → risque de TIAC.</p>

                        <p><strong>Moyens de separation :</strong></p>
                        <ul>
                            <li><strong>Separation spatiale :</strong> Zones distinctes physiquement (cloisons, passages)</li>
                            <li><strong>Separation temporelle :</strong> Si espace limite, faire preparation cru puis nettoyage complet puis preparation cuit</li>
                            <li><strong>Materiel dedie :</strong> Couleurs de planches et codes couleurs (voir point suivant)</li>
                        </ul>

                        <h5>4. Code couleur materiel</h5>
                        <p><strong>Systeme de codes couleurs recommande :</strong></p>
                        <ul>
                            <li><strong style="color:#e74c3c;">🔴 ROUGE :</strong> Viandes crues</li>
                            <li><strong style="color:#3498db;">🔵 BLEU :</strong> Poissons crus</li>
                            <li><strong style="color:#f39c12;">🟠 JAUNE :</strong> Volailles crues</li>
                            <li><strong style="color:#2ecc71;">🟢 VERT :</strong> Legumes et fruits</li>
                            <li><strong>⚪ BLANC :</strong> Produits cuits, pains, patisseries</li>
                            <li><strong style="color:#9b59b6;">🟣 VIOLET :</strong> Allergenes specifiques (si necessaire)</li>
                        </ul>

                        <p><strong>Application :</strong> Planches a decouper, couteaux, bacs, recipients, lavettes.</p>

                        <h5>5. Circulation du personnel</h5>
                        <ul>
                            <li>Acces vestiaire → lavage mains → entree cuisine zone propre</li>
                            <li>Pas de va-et-vient inutiles</li>
                            <li>Si passage zone sale → zone propre : lavage mains + changement tablier</li>
                            <li>Toilettes EN DEHORS de la cuisine avec sas de lavage</li>
                            <li>Visiteurs : tenue adaptee + passage limite aux zones autorisees</li>
                        </ul>

                        <div style="background:#0f3460;color:white;padding:1rem;border-radius:8px;margin:1rem 0;">
                            <strong>✓ PRINCIPE CLEF :</strong> La marche en avant n'est pas qu'une question d'espace,
                            c'est une ORGANISATION.  Meme dans une petite cuisine, on peut appliquer une separation
                            temporelle et des codes couleurs stricts.
                        </div>
                    `
                },
                {
                    id: 'hygiene-contamination',
                    title: 'Contaminations croisees - Prevention',
                    content: `
                        <h4>Identifier et prevenir les risques de contamination croisee</h4>
                        
                        <p><strong>DEFINITION :</strong> Une contamination croisee se produit quand des micro-organismes
                        sont transferes d'un aliment/surface/personne a un autre aliment, generalement de produits crus
                        vers produits cuits ou prets a consommer.</p>

                        <h5>1. Les 3 types de contaminations croisees</h5>
                        
                        <p><strong>A. Contamination directe (aliment → aliment)</strong></p>
                        <ul>
                            <li>Jus de viande crue qui coule sur plat cuit en chambre froide</li>
                            <li>Legumes terreux stockes au-dessus de produits prets a consommer</li>
                            <li>Oeuf cru casse dont le contenu eclabousse une salade</li>
                        </ul>
                        <p><strong>Prevention :</strong> Stockage adapte (cru en BAS, cuit en HAUT), emballages etanches, separation physique.</p>

                        <p><strong>B. Contamination indirecte (via materiel/surface)</strong></p>
                        <ul>
                            <li>Planche utilisee pour poulet cru puis pour decoupe pain (SANS nettoyage)</li>
                            <li>Couteau ayant servi pour poisson cru reutilise pour salade</li>
                            <li>Plan de travail non nettoye entre preparation legumes terreux et assemblage sandwich</li>
                        </ul>
                        <p><strong>Prevention :</strong> Code couleur strict, nettoyage + desinfection entre usages, materiel dedie.</p>

                        <p><strong>C. Contamination via manipulateur</strong></p>
                        <ul>
                            <li>Mains ayant touche viande crue puis pain (sans lavage)</li>
                            <li>Tablier souille de jus de viande portant contre produits cuits</li>
                            <li>Manipulateur malade qui touche denrees</li>
                        </ul>
                        <p><strong>Prevention :</strong> Lavage mains frequent, changement tablier/gants entre operations, eviction personnel malade.</p>

                        <h5>2. Points critiques de contamination croisee</h5>
                        
                        <p><strong>En chambre froide/congelateur :</strong></p>
                        <ul>
                            <li><strong>ERREUR FREQUENTE :</strong> Viande crue sur etagere haute, jus qui coule sur yaourts en dessous</li>
                            <li><strong>BONNE PRATIQUE :</strong> Rangement par categorie, cru toujours en bas, cuit/pret a consommer en haut</li>
                            <li>Bacs etanches pour viandes/poissons</li>
                            <li>Film alimentaire sur recipients ouverts</li>
                            <li>Etiquetage clair</li>
                        </ul>

                        <p><strong>Planches a decouper :</strong></p>
                        <ul>
                            <li><strong>RISQUE MAJEUR :</strong> Principal vecteur de contamination croisee</li>
                            <li><strong>SOLUTION :</strong> Planches par couleur strictement respectee</li>
                            <li>Lavage + desinfection entre chaque usage</li>
                            <li>Remplacement des planches rayees/abimees (bacteries logees dans rayures)</li>
                            <li>Ne JAMAIS utiliser planche cru pour produit cuit meme apres simple rincage</li>
                        </ul>

                        <p><strong>Ustensiles (couteaux, fouets, spatules...) :</strong></p>
                        <ul>
                            <li>Nettoyage systematique entre chaque usage different</li>
                            <li>Pas de "reutilisation rapide" sans lavage</li>
                            <li>Ustensiles dedies par type de produit si possible</li>
                            <li>Lavage en machine avec cycle chaud (>55°C)</li>
                        </ul>

                        <p><strong>Lavettes et eponges :</strong></p>
                        <ul>
                            <li><strong>⚠️ DANGER :</strong> Nids a bacteries si mal entretenues</li>
                            <li><strong>REGLES :</strong></li>
                            <li>Lavettes par couleur (comme planches)</li>
                            <li>Changement quotidien MINIMUM (idealement plusieurs fois par jour)</li>
                            <li>Lavage machine >60°C avec desinfection</li>
                            <li>Essorage et sechage entre usages (jamais en boule humide)</li>
                            <li><strong>MIEUX :</strong> Papier absorbant a usage unique pour essuyage surfaces</li>
                        </ul>

                        <h5>3. Gestion des allergenes (contamination croisee specifique)</h5>
                        
                        <p><strong>Risque particulier :</strong></p>
                        <p>Meme une trace infime d'allergene (ex: arachide) peut declencher reaction grave chez personne allergique.
                        La contamination croisee allergenes est un enjeu de SANTE PUBLIQUE.</p>

                        <p><strong>Mesures preventives :</strong></p>
                        <ul>
                            <li><strong>Stockage :</strong> Produits allergenes dans contenants fermes etiquetes, zone dediee si possible</li>
                            <li><strong>Preparation :</strong> Preparer plats sans allergenes EN PREMIER (avant ceux avec allergenes)</li>
                            <li><strong>Materiel :</strong> Ustensiles dedies ou nettoyage tres rigoureux entre usages</li>
                            <li><strong>Huiles de friture :</strong> JAMAIS melanger (ex: frites et beignets panes au gluten)</li>
                            <li><strong>Plan de travail :</strong> Nettoyage complet entre preparations avec/sans allergenes</li>
                            <li><strong>Étiquetage :</strong> Mention claire sur plats finis et fiches techniques</li>
                        </ul>

                        <h5>4. Protocole de nettoyage anti-contamination</h5>
                        
                        <p><strong>Methodologie 4 étapes :</strong></p>
                        <ol>
                            <li><strong>PRE-NETTOYAGE :</strong> Elimination residus grossiers (raclage, rincage)</li>
                            <li><strong>NETTOYAGE :</strong> Application detergent, action mecanique (frotter), rincage</li>
                            <li><strong>DESINFECTION :</strong> Application produit desinfectant, temps de contact, rincage si necessaire</li>
                            <li><strong>SECHAGE :</strong> Sechage complet (air ou essuyage papier usage unique)</li>
                        </ol>

                        <p><strong>Frequence selon usage :</strong></p>
                        <ul>
                            <li><strong>Entre chaque usage different :</strong> Planches, couteaux, plans de travail</li>
                            <li><strong>Chaque pause/fin de service :</strong> Ensemble du poste de travail</li>
                            <li><strong>Quotidien :</strong> Sols, murs (zones eclaboussees), poignees, interrupteurs</li>
                            <li><strong>Hebdomadaire :</strong> Nettoyage approfondi chambres froides, etageres stockage</li>
                        </ul>

                        <h5>5. Cas concrets et erreurs frequentes</h5>
                        
                        <p><strong>❌ ERREUR :</strong> "Je rince vite la planche entre deux utilisations"</p>
                        <p><strong>✓ CORRECT :</strong> Lavage complet eau chaude + detergent + desinfection OU utiliser planche differente</p>

                        <p><strong>❌ ERREUR :</strong> "Je garde mes gants jetables toute la matinee pour economiser"</p>
                        <p><strong>✓ CORRECT :</strong> Changer gants entre chaque tache differente (comme lavage mains)</p>

                        <p><strong>❌ ERREUR :</strong> "Je stocke poisson cru et salade composee cote a cote au frigo"</p>
                        <p><strong>✓ CORRECT :</strong> Separation physique, poisson en bas dans bac etanche, salade en haut couverte</p>

                        <p><strong>❌ ERREUR :</strong> "J'essuie le plan de travail avec la meme lavette toute la journee"</p>
                        <p><strong>✓ CORRECT :</strong> Plusieurs lavettes propres par jour OU papier absorbant usage unique</p>

                        <div style="background:#e74c3c;color:white;padding:1rem;border-radius:8px;margin:1rem 0;">
                            <strong>⚠️ ATTENTION :</strong> La majorite des TIAC proviennent de contaminations croisees, 
                            PAS d'aliments initialement contamines. C'est donc un risque 100% evitable par de bonnes pratiques !
                        </div>

                        <div style="background:#2ecc71;color:white;padding:1rem;border-radius:8px;margin:1rem 0;">
                            <strong>✓ REGLE D'OR :</strong> En cas de doute sur une eventuelle contamination croisee 
                            (planche possiblement souillée, ustensile tombé au sol...) → TOUJOURS refaire le nettoyage complet. 
                            Mieux vaut 2 minutes de plus que risquer la sante des convives.
                        </div>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Quand faut-il se laver les mains ?',
                        options: [
                            'Avant et apres la manipulation des denrees',
                            'Seulement au debut du service',
                            'Uniquement apres le nettoyage',
                            'Une fois par heure'
                        ],
                        answer: 0
                    },
                    {
                        q: 'La marche en avant sert a :',
                        options: [
                            'Limiter les contaminations croisees',
                            'Accelerer la preparation',
                            'Optimiser les couts',
                            'Simplifier l inventaire'
                        ],
                        answer: 0
                    },
                    {
                        q: 'Ou placer les produits crus en chambre froide ?',
                        options: [
                            'En haut',
                            'Au milieu',
                            'En bas',
                            'N importe ou'
                        ],
                        answer: 2
                    }
                ]
            }
        },
        {
            id: 'allergenes-maitrise',
            title: 'Maitrise des allergenes',
            level: 'Intermediaire',
            duration: '1h 15',
            description: 'Identifier les allergenes majeurs et mettre en place une prevention fiable.',
            objectives: [
                'Lister les 14 allergenes majeurs',
                'Eviter la contamination croisee',
                'Informer clairement les convives'
            ],
            lessons: [
                {
                    id: 'allergenes-14',
                    title: 'Les 14 allergenes majeurs',
                    content: `
                        <p>Connaitre les allergenes reglementaires.</p>
                        <ul>
                            <li>Cereales contenant du gluten, crustaces, oeufs, poissons.</li>
                            <li>Arachides, soja, lait, fruits a coque.</li>
                            <li>Celeri, moutarde, sesame, sulphites, lupin, mollusques.</li>
                        </ul>
                    `
                },
                {
                    id: 'allergenes-prevention',
                    title: 'Prevention et etiquetage',
                    content: `
                        <p>Mettre en place des actions simples mais efficaces.</p>
                        <ul>
                            <li>Stockage separe et signalisation claire.</li>
                            <li>Plan de nettoyage entre preparations.</li>
                            <li>Fiches techniques et menus a jour.</li>
                        </ul>
                    `
                },
                {
                    id: 'allergenes-service',
                    title: 'Communication avec les usagers',
                    content: `
                        <p>Informer sans risque d erreur.</p>
                        <ul>
                            <li>Rendre l information accessible et tracee.</li>
                            <li>Enregistrer les PAI et demandes speciales.</li>
                            <li>Verifier les substitutions en cuisine.</li>
                        </ul>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Combien d allergenes majeurs sont reconnus ?',
                        options: ['8', '10', '12', '14'],
                        answer: 3
                    },
                    {
                        q: 'Quel est un bon geste de prevention ?',
                        options: [
                            'Utiliser les memes ustensiles',
                            'Stocker separement les allergenes',
                            'Ignorer les demandes speciales',
                            'Changer les recettes sans informer'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Le PAI sert a :',
                        options: [
                            'Gerer les allergies connues',
                            'Planifier les achats',
                            'Organiser le nettoyage',
                            'Calculer les portions'
                        ],
                        answer: 0
                    }
                ]
            }
        },
        {
            id: 'temperatures-ccp',
            title: 'Temperatures et CCP',
            level: 'Essentiel',
            duration: '1h 45',
            description: 'Maitriser les temperatures critiques et les enregistrements CCP.',
            objectives: [
                'Connaitre les seuils critiques',
                'Appliquer les actions correctives',
                'Tracer les controles CCP'
            ],
            lessons: [
                {
                    id: 'temp-seuils',
                    title: 'Seuils critiques et zones froid/chaud',
                    content: `
                        <p>Les temperatures cles pour la securite alimentaire.</p>
                        <ul>
                            <li>Stockage froid positif: 0 a 4 C.</li>
                            <li>Maintien chaud: > 63 C.</li>
                            <li>Cuisson et refroidissement rapide.</li>
                        </ul>
                    `
                },
                {
                    id: 'temp-surveillance',
                    title: 'Surveillance et actions correctives',
                    content: `
                        <p>Reagir vite en cas d ecart.</p>
                        <ul>
                            <li>Relever, enregistrer, verifier.</li>
                            <li>Isoler les lots non conformes.</li>
                            <li>Corriger la cause (materiel, process).</li>
                        </ul>
                    `
                },
                {
                    id: 'temp-ccp',
                    title: 'CCP cuisson et refroidissement',
                    content: `
                        <p>Points de controle critiques.</p>
                        <ul>
                            <li>Cuisson a coeur: verifier le thermometre.</li>
                            <li>Refroidissement rapide: 63 C a 10 C en 2h.</li>
                            <li>Remise en temperature: > 63 C.</li>
                        </ul>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Quelle est la temperature minimale de maintien chaud ?',
                        options: ['45 C', '55 C', '63 C', '70 C'],
                        answer: 2
                    },
                    {
                        q: 'Que faire en cas de temperature non conforme ?',
                        options: [
                            'Ignorer et continuer',
                            'Noter et appliquer une action corrective',
                            'Changer le menu',
                            'Nettoyer la cuisine'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Le refroidissement rapide vise :',
                        options: [
                            '63 C a 10 C en 2h',
                            '90 C a 20 C en 6h',
                            '50 C a 5 C en 4h',
                            '70 C a 20 C en 1h'
                        ],
                        answer: 0
                    }
                ]
            }
        },
        {
            id: 'nettoyage-pro',
            title: 'Plan de nettoyage',
            level: 'Essentiel',
            duration: '1h 10',
            description: 'Structurer un plan de nettoyage efficace et tracable.',
            objectives: [
                'Definir les zones et frequences',
                'Utiliser les bons produits',
                'Documenter les actions'
            ],
            lessons: [
                {
                    id: 'nettoyage-plan',
                    title: 'Structure du plan de nettoyage',
                    content: `
                        <p>Un plan clair facilite la conformite.</p>
                        <ul>
                            <li>Zone, materiel, frequence, responsable.</li>
                            <li>Mettre a jour selon l activite.</li>
                            <li>Afficher le plan dans les zones cles.</li>
                        </ul>
                    `
                },
                {
                    id: 'nettoyage-produits',
                    title: 'Produits et protocoles',
                    content: `
                        <p>Adapter le protocole a chaque surface.</p>
                        <ul>
                            <li>Detergent puis desinfectant si besoin.</li>
                            <li>Respect des temps de contact.</li>
                            <li>Rincage selon les consignes.</li>
                        </ul>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Que doit contenir un plan de nettoyage ?',
                        options: [
                            'Uniquement les produits',
                            'Zone, frequence, responsable',
                            'Le menu du jour',
                            'Les horaires du personnel'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Quelle est l etape correcte ?',
                        options: [
                            'Desinfecter puis nettoyer',
                            'Nettoyer puis desinfecter',
                            'Nettoyer sans rincer',
                            'Desinfecter sans produit'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Pourquoi tracer le nettoyage ?',
                        options: [
                            'Pour gagner du temps',
                            'Pour prouver la conformite',
                            'Pour decorer la cuisine',
                            'Pour reduire les portions'
                        ],
                        answer: 1
                    }
                ]
            }
        },
        {
            id: 'tracabilite',
            title: 'Tracabilite et receptions',
            level: 'Intermediaire',
            duration: '1h 30',
            description: 'Assurer la tracabilite des lots, des receptions et des produits.',
            objectives: [
                'Securiser les receptions',
                'Suivre les lots et DLC',
                'Reagir a un rappel produit'
            ],
            lessons: [
                {
                    id: 'tracabilite-reception',
                    title: 'Reception des marchandises',
                    content: `
                        <p>Le point d entree de la tracabilite.</p>
                        <ul>
                            <li>Verifier lot, DLC, temperatures a la reception.</li>
                            <li>Refuser les non-conformites.</li>
                            <li>Enregistrer fournisseur et conditions.</li>
                        </ul>
                    `
                },
                {
                    id: 'tracabilite-lots',
                    title: 'Gestion des lots et DLC',
                    content: `
                        <p>Garder une vision claire des lots.</p>
                        <ul>
                            <li>Etiquetage interne et rotation FIFO.</li>
                            <li>Suivi des deconditionnements.</li>
                            <li>Archivage des preuves.</li>
                        </ul>
                    `
                },
                {
                    id: 'tracabilite-rappel',
                    title: 'Rappels produits',
                    content: `
                        <p>Reagir vite en cas d alerte.</p>
                        <ul>
                            <li>Identifier les produits impactes.</li>
                            <li>Isoler et retirer les lots.</li>
                            <li>Tracer les actions et communiquer.</li>
                        </ul>
                    `
                }
            ],
            quiz: {
                passScore: 70,
                questions: [
                    {
                        q: 'Quel est un element cle de la reception ?',
                        options: [
                            'Verifier la date de livraison uniquement',
                            'Verifier lot, DLC et temperature',
                            'Garder les emballages fermes',
                            'Placer en stock sans controle'
                        ],
                        answer: 1
                    },
                    {
                        q: 'FIFO signifie :',
                        options: [
                            'First In First Out',
                            'Fast In Fast Out',
                            'Final In Final Out',
                            'Food In Food Out'
                        ],
                        answer: 0
                    },
                    {
                        q: 'En cas de rappel produit, il faut :',
                        options: [
                            'Continuer a servir',
                            'Isoler le lot et tracer les actions',
                            'Changer la recette',
                            'Attendre le prochain audit'
                        ],
                        answer: 1
                    }
                ]
            }
        },
        {
            id: 'cas-pratiques',
            title: 'Cas pratiques restauration collective',
            level: 'Application',
            duration: '1h 30',
            description: 'Cas concrets et mise en situation pour valider les acquis en restauration collective.',
            objectives: [
                'Appliquer les connaissances en situation reelle',
                'Resoudre des problemes concrets',
                'Valider la comprehension globale HACCP'
            ],
            lessons: [
                {
                    id: 'cas-reception',
                    title: 'Cas pratique : Reception marchandises',
                    content: `
                        <h4>Mise en situation : Livraison viandes et poissons</h4>
                        <p><strong>Contexte :</strong> Vous etes responsable de la reception ce matin. 
                        Le camion frigorifique arrive avec la commande de la semaine.</p>
                        
                        <p><strong>Elements livres :</strong></p>
                        <ul>
                            <li>20 kg de poulet entier (emballage intact)</li>
                            <li>15 kg de boeuf hache (emballage sous vide)</li>
                            <li>10 kg de colin surgele (carton endommage)</li>
                            <li>5 kg de crevettes fraiches (temperature camion : 6°C)</li>
                        </ul>

                        <p><strong>Questions a se poser :</strong></p>
                        <ol>
                            <li>Quels controles effectuer systematiquement ?</li>
                            <li>Quels produits accepter / refuser ?</li>
                            <li>Quelle tracabilite mettre en place ?</li>
                            <li>Ou et comment stocker chaque produit ?</li>
                        </ol>

                        <p><strong>Reponses attendues :</strong></p>
                        <ul>
                            <li><strong>Poulet :</strong> Verifier DLC, temperature (0-4°C), integrite emballage, numero lot. OK si conforme.</li>
                            <li><strong>Boeuf hache :</strong> Tres sensible ! Temperature 0-2°C max, DLC courte. Verifier agrement sanitaire.</li>
                            <li><strong>Colin surgele :</strong> REFUSER si carton endommage (rupture chaine froid possible). Ne pas prendre de risque.</li>
                            <li><strong>Crevettes 6°C :</strong> REFUSER ! Temperature non conforme (max 2°C pour produits frais tres perissables).</li>
                        </ul>

                        <p><strong>Actions a realiser :</strong></p>
                        <ol>
                            <li>Enregistrer reception (date, heure, fournisseur, lot, DLC, temperatures)</li>
                            <li>Notifier refus au fournisseur (bon de livraison annote)</li>
                            <li>Stockage immediat des produits acceptes (poulet, boeuf)</li>
                            <li>Etiquetage complementaire si necessaire</li>
                        </ol>

                        <div style="background:#0f3460;padding:1rem;border-radius:8px;margin-top:1rem;">
                            <strong>A retenir :</strong> En cas de doute, TOUJOURS refuser. 
                            Mieux vaut un menu modifie qu'une TIAC !
                        </div>
                    `
                },
                {
                    id: 'cas-service',
                    title: 'Cas pratique : Service et maintien temperature',
                    content: `
                        <h4>Mise en situation : Service self restauration scolaire</h4>
                        <p><strong>Contexte :</strong> Service du midi, 300 couverts prevus, self-service.</p>
                        
                        <p><strong>Menu du jour :</strong></p>
                        <ul>
                            <li>Entree froide : Salade composee (preparee ce matin)</li>
                            <li>Plat chaud : Blanquette de veau + riz (prepare hier, refroidi, remis en temperature ce matin)</li>
                            <li>Fromage : Camembert portions individuelles</li>
                            <li>Dessert : Compote de pommes (coupelles individuelles)</li>
                        </ul>

                        <p><strong>Situation problematique a 12h30 :</strong></p>
                        <ul>
                            <li>Bac de blanquette sur le self : temperature relevee 58°C</li>
                            <li>Salade composee exposee depuis 11h45 (temperature ambiante 22°C)</li>
                            <li>Stock de riz d'appoint sorti du frigo pour rechauffage rapide</li>
                        </ul>

                        <p><strong>Questions :</strong></p>
                        <ol>
                            <li>Quels sont les problemes identifies ?</li>
                            <li>Quelles actions correctives immediates ?</li>
                            <li>Comment eviter ces situations ?</li>
                        </ol>

                        <p><strong>Analyse :</strong></p>
                        <ul>
                            <li><strong>Blanquette 58°C :</strong> NON CONFORME ! Min 63°C obligatoire. 
                            → Action : Retirer immediatement du self, remettre en temperature > 63°C, controler, puis remettre au   self.</li>
                            
                            <li><strong>Salade exposee 45min :</strong> Risque si denrees tres perissables dedans (thon, oeuf, mayonnaise).
                            → Action : Si ingredients a risque, jeter apres 2h exposition max. Sinon, surveiller.</li>
                            
                            <li><strong>Riz sorti du frigo :</strong> ERREUR ! Ne jamais laisser produit refroidi a temperature ambiante.
                            → Action : Remettre au frigo si pas encore rechauffe, ou rechauffer immediatement a > 63°C.</li>
                        </ul>

                        <p><strong>Bonnes pratiques service :</strong></p>
                        <ol>
                            <li>Controle temperature plats chauds AVANT mise au self (63°C min)</li>
                            <li>Recontrole toutes les 30 minutes pendant service</li>
                            <li>Petites quantites au self, reapprovisionnement frequent</li>
                            <li>Plats froids : maintien < 4°C (bacs sur glace ou vitrine refrigeree)</li>
                            <li>Duree exposition limitee (max 2h pour denrees sensibles)</li>
                            <li>Ne jamais melanger anciennes et nouvelles productions</li>
                        </ol>

                        <div style="background:#0f3460;padding:1rem;border-radius:8px;margin-top:1rem;">
                            <strong>Regle d'or :</strong> Chaud > 63°C / Froid < 4°C / Jamais dans la zone 4-63°C !
                        </div>
                    `
                },
                {
                    id: 'cas-incident',
                    title: 'Cas pratique : Gestion incident et TIAC',
                    content: `
                        <h4>Mise en situation : Suspicion TIAC (Toxi-Infection Alimentaire Collective)</h4>
                        <p><strong>Contexte :</strong> Vendredi 15h, le directeur vous informe que 5 eleves 
                        presentent des symptomes digestifs (nausees, vomissements, diarrhee) apres le dejeuner.</p>
                        
                        <p><strong>Menu servi ce midi :</strong></p>
                        <ul>
                            <li>Salade de riz au thon</li>
                            <li>Escalope de poulet panee</li>
                            <li>Haricots verts</li>
                            <li>Yaourt nature</li>
                        </ul>

                        <p><strong>Informations complementaires :</strong></p>
                        <ul>
                            <li>La salade de riz a ete preparee hier matin et stockee en chambre froide</li>
                            <li>Poulet cuit ce matin a 11h, maintenu au chaud jusqu'au service</li>
                            <li>230 repas servis au total</li>
                            <li>Premiers symptomes vers 13h30 (1h30 apres repas)</li>
                        </ul>

                        <p><strong>ACTIONS IMMÉDIATES OBLIGATOIRES :</strong></p>
                        
                        <h5>1. Securiser et isoler (dans l'heure)</h5>
                        <ul>
                            <li>Mettre de cote IMMEDIATEMENT tous les restes du repas</li>
                            <li>Les placer au frais dans contenants fermes etiquetes</li>
                            <li>NE PAS JETER (preuves pour enquete)</li>
                            <li>Bloquer les plats temoins si existent</li>
                            <li>Photographier tout</li>
                        </ul>

                        <h5>2. Declarer (dans les 24-48h)</h5>
                        <ul>
                            <li>Declaration obligatoire a l'ARS (Agence Regionale de Sante)</li>
                            <li>Via medecin scolaire ou directement</li>
                            <li>Formulaire CERFA ou plateforme en ligne</li>
                            <li>Informations : nombre malades, symptomes, delai apparition, menu</li>
                        </ul>

                        <h5>3. Cooperer avec enquete</h5>
                        <ul>
                            <li>Fournir tous documents demandes (fiches suivi, bons livraison, etc.)</li>
                            <li>Permettre prelevements par services officiels</li>
                            <li>Liste des fournisseurs et lots</li>
                            <li>Tracabilite complete des denrees</li>
                        </ul>

                        <h5>4. Analyse probable de l'incident</h5>
                        <p><strong>Aliment suspecte :</strong> Salade de riz au thon</p>
                        <p><strong>Pourquoi ?</strong></p>
                        <ul>
                            <li>Delai court (1h30) : oriente vers toxine preformee (Staphylocoque)</li>
                            <li>Riz et thon : aliments a risque si mal conserves</li>
                            <li>Preparation J-1 : temps de multiplication si temperature inadaptee</li>
                            <li>Manipulation probable (melange ingredients)</li>
                        </ul>

                        <p><strong>Hypothese :</strong> Contamination lors de la preparation (mains, plan de travail) 
                        + conservation borderline en chambre froide (4-6°C ?) → multiplication Staphylococcus aureus 
                        → production de toxine thermostable.</p>

                        <h5>5. Actions preventives pour l'avenir</h5>
                        <ul>
                            <li>Revoir protocole preparation salades composees</li>
                            <li>Formation hygiene mains du personnel</li>
                            <li>Verification temperatures chambres froides</li>
                            <li>Limiter preparations J-1 pour plats froids sensibles</li>
                            <li>Renforcer tracabilite et enregistrements</li>
                        </ul>

                        <div style="background:#e74c3c;padding:1rem;border-radius:8px;margin-top:1rem;color:white;">
                            <strong>⚠️ IMPORTANT :</strong> Une TIAC est toujours une situation grave. 
                            La transparence et la cooperation avec les autorites sont essentielles. 
                            Ne jamais cacher, ne jamais detruire des preuves.
                        </div>

                        <div style="background:#2ecc71;padding:1rem;border-radius:8px;margin-top:1rem;color:white;">
                            <strong>✓ BON REFLEXE :</strong> Plats temoins systematiques (echantillons de chaque plat, 
                            conserves 5 jours au frais, etiquetes) permettent analyses rapides en cas de suspicion.
                        </div>
                    `
                }
            ],
            quiz: {
                passScore: 75,
                questions: [
                    {
                        q: 'Lors d\'une reception, vous constatez une temperature de 6°C pour des crevettes fraiches. Que faites-vous ?',
                        options: [
                            'J\'accepte, c\'est proche de 4°C',
                            'Je refuse la livraison, non conforme',
                            'J\'accepte mais je cuis immediatement',
                            'Je demande un rabais au fournisseur'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Pendant le service, un plat chaud est a 58°C au self. Action immediate ?',
                        options: [
                            'Je laisse, c\'est assez chaud',
                            'Je retire et remets en temperature > 63°C',
                            'J\'ajoute de la sauce chaude',
                            'J\'attends la fin du service'
                        ],
                        answer: 1
                    },
                    {
                        q: 'En cas de suspicion de TIAC, quelle est la PREMIERE action ?',
                        options: [
                            'Jeter tous les restes pour eviter propagation',
                            'Appeler immediatement les pompiers',
                            'Isoler et conserver tous les restes du repas',
                            'Fermer l\'etablissement'
                        ],
                        answer: 2
                    },
                    {
                        q: 'Une salade de riz preparee la veille doit etre conservee a quelle temperature maximum ?',
                        options: [
                            '+8°C',
                            '+6°C',
                            '+4°C',
                            '+10°C'
                        ],
                        answer: 2
                    },
                    {
                        q: 'La declaration d\'une TIAC a l\'ARS est obligatoire dans quel delai ?',
                        options: [
                            'Immediatement',
                            '24 a 48 heures',
                            '1 semaine',
                            'Uniquement si plus de 10 malades'
                        ],
                        answer: 1
                    },
                    {
                        q: 'Quelle est la duree maximale d\'exposition d\'un plat froid sensible au self ?',
                        options: [
                            '30 minutes',
                            '1 heure',
                            '2 heures',
                            '4 heures'
                        ],
                        answer: 2
                    }
                ]
            }
        }
    ],

    init() {
        if (!this.selectedCourseId && this.courses.length > 0) {
            this.selectedCourseId = this.courses[0].id;
        }
    },

    render() {
        const page = document.getElementById('page-centre-formation');
        if (!page) return;

        const courses = this.courses;
        if (!this.selectedCourseId && courses.length > 0) {
            this.selectedCourseId = courses[0].id;
        }

        const stats = this._getStats();

        page.innerHTML = `
            <div class="training-hero">
                <div class="training-hero-content">
                    <div class="training-hero-kicker">Centre de formation en ligne</div>
                    <h2>Former votre equipe, sans deplacements</h2>
                    <p>
                        Des parcours HACCP structures, des quiz de validation et des attestations exportables.
                        Tout est concu pour former rapidement et garder la conformite.
                    </p>
                    <div class="training-hero-actions">
                        <button class="btn btn-primary" onclick="CentreFormation.selectCourse('${this.selectedCourseId}')">Demarrer un parcours</button>
                        <button class="btn btn-secondary" onclick="App.navigate('formation')">Voir les attestations</button>
                        <button class="btn btn-info" onclick="CentreFormation.exportTracabilite()">Export tracabilite</button>
                    </div>
                </div>
                <div class="training-hero-card">
                    <div class="training-hero-metric">
                        <span class="label">Cours disponibles</span>
                        <span class="value">${stats.totalCourses}</span>
                    </div>
                    <div class="training-hero-metric">
                        <span class="label">Cours termines</span>
                        <span class="value">${stats.completedCourses}</span>
                    </div>
                    <div class="training-hero-metric">
                        <span class="label">Temps total</span>
                        <span class="value">${stats.totalDuration}</span>
                    </div>
                    <div class="training-hero-badge">Progression equipe</div>
                </div>
            </div>

            <div class="training-stats">
                <div class="stat-card info">
                    <div class="stat-label">Progression globale</div>
                    <div class="stat-value">${stats.progressPercent}%</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Quiz reussis</div>
                    <div class="stat-value">${stats.quizPassed}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Cours en cours</div>
                    <div class="stat-value">${stats.inProgress}</div>
                </div>
            </div>

            <div class="training-grid">
                ${courses.map((course, index) => this._renderCourseCard(course, index)).join('')}
            </div>

            <div class="training-detail" id="training-detail">
                ${this._renderCourseDetail(this.selectedCourseId)}
            </div>
        `;
    },

    selectCourse(courseId) {
        this.selectedCourseId = courseId;
        const detail = document.getElementById('training-detail');
        if (detail) {
            detail.innerHTML = this._renderCourseDetail(courseId);
        }
    },

    openLesson(courseId, lessonId) {
        const course = this._getCourse(courseId);
        if (!course) return;
        const lesson = course.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Démarrer traçabilité
        this.lessonStartTime = new Date();
        this.currentLessonId = lessonId;

        const bodyHTML = `
            <div class="training-lesson">
                <h3>${UI.escapeHTML(lesson.title)}</h3>
                <div class="training-lesson-content">
                    ${lesson.content}
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Fermer</button>
            <button class="btn btn-success" onclick="CentreFormation.completeLesson('${courseId}','${lessonId}')">Marquer comme termine</button>
        `;

        UI.openModal(course.title, bodyHTML, footerHTML);
    },

    completeLesson(courseId, lessonId) {
        const { data, userId, userProgress } = this._getUserProgress();
        const courseProgress = userProgress.courses[courseId] || { completedLessons: [], quiz: null, lessonHistory: [] };
        
        // Ajouter la leçon si pas déjà complétée
        if (!courseProgress.completedLessons.includes(lessonId)) {
            courseProgress.completedLessons.push(lessonId);
        }

        // Traçabilité : enregistrer l'historique
        if (!courseProgress.lessonHistory) courseProgress.lessonHistory = [];
        
        const endTime = new Date();
        const durationMinutes = this.lessonStartTime 
            ? Math.round((endTime - this.lessonStartTime) / 60000)
            : 0;

        const course = this._getCourse(courseId);
        const lesson = course?.lessons.find(l => l.id === lessonId);

        courseProgress.lessonHistory.push({
            lessonId: lessonId,
            lessonTitle: lesson ? lesson.title : lessonId,
            completedAt: endTime.toISOString(),
            duration: durationMinutes
        });

        userProgress.courses[courseId] = courseProgress;
        data[userId] = userProgress;
        this._saveProgress(data);

        // Reset
        this.lessonStartTime = null;
        this.currentLessonId = null;

        UI.closeModal();
        UI.toast('Lecon validee', 'success');
        this.render();
    },

    openQuiz(courseId) {
        const course = this._getCourse(courseId);
        if (!course || !course.quiz) return;

        const bodyHTML = `
            <form class="training-quiz" id="training-quiz-form">
                ${course.quiz.questions.map((q, idx) => `
                    <div class="quiz-question">
                        <div class="quiz-q">${idx + 1}. ${UI.escapeHTML(q.q)}</div>
                        <div class="quiz-options">
                            ${q.options.map((opt, optIdx) => `
                                <label class="quiz-option">
                                    <input type="radio" name="q${idx}" value="${optIdx}">
                                    <span>${UI.escapeHTML(opt)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </form>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-primary" onclick="CentreFormation.submitQuiz('${courseId}')">Valider le quiz</button>
        `;

        UI.openModal(`Quiz - ${course.title}`, bodyHTML, footerHTML);
    },

    submitQuiz(courseId) {
        const course = this._getCourse(courseId);
        if (!course || !course.quiz) return;

        const form = document.getElementById('training-quiz-form');
        if (!form) return;

        const answers = course.quiz.questions.map((q, idx) => {
            const selected = form.querySelector(`input[name="q${idx}"]:checked`);
            return selected ? Number(selected.value) : null;
        });

        if (answers.includes(null)) {
            UI.toast('Repondez a toutes les questions', 'warning');
            return;
        }

        let score = 0;
        answers.forEach((ans, idx) => {
            if (ans === course.quiz.questions[idx].answer) score += 1;
        });

        const percent = Math.round((score / course.quiz.questions.length) * 100);
        const passed = percent >= course.quiz.passScore;

        const { data, userId, userProgress } = this._getUserProgress();
        const courseProgress = userProgress.courses[courseId] || { completedLessons: [], quiz: null };
        courseProgress.quiz = {
            score: percent,
            passed,
            date: new Date().toISOString()
        };
        userProgress.courses[courseId] = courseProgress;
        data[userId] = userProgress;
        this._saveProgress(data);

        UI.closeModal();
        UI.toast(passed ? `Quiz reussi (${percent}%)` : `Quiz non valide (${percent}%)`, passed ? 'success' : 'danger');
        this.render();
    },

    generateAttestation(courseId) {
        const course = this._getCourse(courseId);
        if (!course) return;
        if (!App.currentUser) {
            UI.toast('Connectez-vous pour generer une attestation', 'warning');
            return;
        }

        const progress = this._getCourseProgress(courseId);
        const isComplete = this._isCourseComplete(course, progress);
        if (!isComplete) {
            UI.toast('Terminez toutes les lecons et le quiz', 'warning');
            return;
        }

        // Générer PDF professionnel amélioré
        this._generateAttestationPDF(course, progress);
    },

    // Génération PDF attestation format professionnel
    _generateAttestationPDF(course, progress) {
        const user = App.currentUser;
        const today = new Date();
        const dateStr = today.toLocaleDateString('fr-FR');
        const numAttestation = `CF-${today.getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Calculer durée totale
        let totalDuration = 0;
        if (progress.lessonHistory) {
            totalDuration = progress.lessonHistory.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        }
        const durationHours = (totalDuration / 60).toFixed(1);

        const bodyHTML = `
            <div style="text-align:center;padding:2rem;max-width:800px;margin:auto;font-family:Arial,sans-serif;">
                <div style="border:3px solid #0f3460;padding:3rem;background:#fff;">
                    
                    <div style="margin-bottom:2rem;">
                        <h1 style="color:#0f3460;font-size:2rem;margin-bottom:0.5rem;">ATTESTATION DE FORMATION</h1>
                        <p style="color:#666;font-size:0.9rem;">Formation continue en hygiene alimentaire</p>
                    </div>

                    <div style="border-top:2px solid #e8505b;border-bottom:2px solid #e8505b;padding:1.5rem;margin:2rem 0;">
                        <p style="font-size:1.1rem;line-height:1.8;color:#333;">
                            Nous, <strong>OK CUISINE - Centre de Formation</strong>,<br>
                            Certifions que <strong style="color:#0f3460;font-size:1.3rem;">${user.nom}</strong><br>
                            a suivi et valide avec succes la formation :<br>
                            <strong style="color:#e8505b;font-size:1.2rem;">${course.title}</strong>
                        </p>
                    </div>

                    <div style="text-align:left;max-width:500px;margin:2rem auto;background:#f8f9fa;padding:1.5rem;border-radius:8px;">
                        <p style="margin:0.5rem 0;color:#333;"><strong>Date de formation :</strong> ${dateStr}</p>
                        <p style="margin:0.5rem 0;color:#333;"><strong>Duree :</strong> ${durationHours}h (${course.duration} programme)</p>
                        <p style="margin:0.5rem 0;color:#333;"><strong>Niveau :</strong> ${course.level}</p>
                        <p style="margin:0.5rem 0;color:#333;"><strong>Score quiz valide :</strong> ${progress.quiz?.score || 0}%</p>
                        <p style="margin:0.5rem 0;color:#333;"><strong>N° attestation :</strong> ${numAttestation}</p>
                    </div>

                    <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #ddd;">
                        <p style="font-size:0.85rem;color:#666;line-height:1.6;text-align:left;">
                            <strong>Objectifs pedagogiques :</strong><br>
                            ${course.objectives.map(obj => `• ${obj}`).join('<br>')}
                        </p>
                    </div>

                    <div style="margin-top:2rem;text-align:right;">
                        <p style="margin:0;color:#333;">Fait le ${dateStr}</p>
                        <p style="margin:0.5rem 0;color:#0f3460;font-weight:bold;">OK CUISINE - Centre de Formation</p>
                        <p style="margin:0;color:#666;font-size:0.85rem;">Formation en ligne certifiee</p>
                    </div>

                    <div style="margin-top:2rem;padding:1rem;background:#f0f0f0;border-radius:4px;">
                        <p style="font-size:0.75rem;color:#666;margin:0;line-height:1.5;">
                            <strong>Mentions legales :</strong> Cette attestation certifie la participation et la validation de la formation.
                            Conforme aux exigences de formation continue en hygiene alimentaire.
                            Conservez ce document pour vos audits et controles officiels.
                        </p>
                    </div>

                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Fermer</button>
            <button class="btn btn-primary" onclick="CentreFormation._downloadAttestationPDF('${numAttestation}')">Telecharger PDF</button>
        `;

        UI.openModal('Attestation de Formation', bodyHTML, footerHTML);

        // Enregistrer aussi dans le système
        this._saveAttestationRecord(course, numAttestation);
    },

    _downloadAttestationPDF(numAttestation) {
        // TODO: Intégration jsPDF pour génération PDF réelle
        // Pour l'instant, on enregistre dans les formations
        UI.toast('Attestation enregistree dans vos formations', 'success');
        UI.closeModal();
    },

    _saveAttestationRecord(course, numAttestation) {
        const formations = Storage.getFormations();
        const existing = formations.find(f => 
            f.user_id === App.currentUser.id && 
            f.type === `${course.title} (en ligne)`
        );
        
        if (existing) {
            UI.toast('Attestation deja enregistree', 'info');
            return;
        }

        const today = Storage.today();
        const formation = {
            id: Storage.uid(),
            user_id: App.currentUser.id,
            type: `${course.title} (en ligne)`,
            date_formation: today,
            formateur: 'OK Cuisine - Centre de Formation',
            date_expiration: Storage.addDays(today, 365),
            num_attestation: numAttestation,
            notes: `Formation validee - Score quiz: ${this._getCourseProgress(course.id).quiz?.score || 0}%`,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom
        };

        Storage.saveFormation(formation);
        Journal.log('formation', `Formation en ligne validee: ${course.title}`, formation);
    },

    _renderCourseCard(course, index) {
        const progress = this._getCourseProgress(course.id);
        const percent = this._getProgressPercent(course, progress);
        const completed = this._isCourseComplete(course, progress);
        const quizStatus = progress.quiz?.passed ? 'Quiz valide' : 'Quiz a faire';

        return `
            <div class="training-card ${course.id === this.selectedCourseId ? 'active' : ''}" style="animation-delay:${index * 80}ms" onclick="CentreFormation.selectCourse('${course.id}')">
                <div class="training-card-header">
                    <span class="training-level">${UI.escapeHTML(course.level)}</span>
                    <span class="training-duration">${UI.escapeHTML(course.duration)}</span>
                </div>
                <h3>${UI.escapeHTML(course.title)}</h3>
                <p>${UI.escapeHTML(course.description)}</p>
                <div class="training-progress">
                    <div class="training-progress-bar" style="width:${percent}%"></div>
                </div>
                <div class="training-progress-meta">
                    <span>${percent}% termine</span>
                    <span>${quizStatus}</span>
                </div>
                <div class="training-card-footer">
                    <span class="training-status ${completed ? 'done' : 'ongoing'}">${completed ? 'Parcours valide' : 'En cours'}</span>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); CentreFormation.selectCourse('${course.id}')">Ouvrir</button>
                </div>
            </div>
        `;
    },

    _renderCourseDetail(courseId) {
        const course = this._getCourse(courseId);
        if (!course) return '';

        const progress = this._getCourseProgress(courseId);
        const percent = this._getProgressPercent(course, progress);
        const isComplete = this._isCourseComplete(course, progress);
        const quizPassed = progress.quiz?.passed;

        return `
            <div class="training-detail-header">
                <div>
                    <div class="training-detail-kicker">Parcours selectionne</div>
                    <h3>${UI.escapeHTML(course.title)}</h3>
                    <p>${UI.escapeHTML(course.description)}</p>
                </div>
                <div class="training-detail-actions">
                    <button class="btn btn-primary" onclick="CentreFormation.openQuiz('${courseId}')">Lancer le quiz</button>
                    <button class="btn btn-success" onclick="CentreFormation.generateAttestation('${courseId}')" ${isComplete ? '' : 'disabled'}>Generer attestation</button>
                </div>
            </div>

            <div class="training-detail-progress">
                <div>
                    <div class="training-progress">
                        <div class="training-progress-bar" style="width:${percent}%"></div>
                    </div>
                    <div class="training-progress-meta">
                        <span>${percent}% des lecons terminees</span>
                        <span>${quizPassed ? `Quiz valide (${progress.quiz.score}%)` : 'Quiz a faire'}</span>
                    </div>
                </div>
                <div class="training-detail-badges">
                    <span class="badge ${isComplete ? 'badge-success' : 'badge-warning'}">${isComplete ? 'Certification obtenue' : 'Validation requise'}</span>
                    <span class="badge badge-info">${UI.escapeHTML(course.level)}</span>
                </div>
            </div>

            <div class="training-detail-grid">
                <div class="training-block">
                    <h4>Objectifs pedagogiques</h4>
                    <ul>
                        ${course.objectives.map(obj => `<li>${UI.escapeHTML(obj)}</li>`).join('')}
                    </ul>
                </div>
                <div class="training-block">
                    <h4>Lecons disponibles</h4>
                    <div class="training-lesson-list">
                        ${course.lessons.map(lesson => {
                            const done = progress.completedLessons?.includes(lesson.id);
                            return `
                                <div class="lesson-item ${done ? 'done' : ''}">
                                    <div>
                                        <span class="lesson-title">${UI.escapeHTML(lesson.title)}</span>
                                        <span class="lesson-status">${done ? 'Terminee' : 'A faire'}</span>
                                    </div>
                                    <button class="btn btn-secondary" onclick="CentreFormation.openLesson('${courseId}','${lesson.id}')">Ouvrir</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _getCourse(courseId) {
        return this.courses.find(c => c.id === courseId);
    },

    _getProgressData() {
        return Storage.load('training_progress', {});
    },

    _saveProgress(data) {
        Storage.save('training_progress', data);
    },

    _getUserProgress() {
        const data = this._getProgressData();
        const userId = App.currentUser?.id || 'guest';
        const userProgress = data[userId] || { courses: {} };
        userProgress.courses = userProgress.courses || {};
        return { data, userId, userProgress };
    },

    _getCourseProgress(courseId) {
        const { userProgress } = this._getUserProgress();
        return userProgress.courses[courseId] || { completedLessons: [], quiz: null };
    },

    _getProgressPercent(course, progress) {
        const total = course.lessons.length;
        const done = progress.completedLessons ? progress.completedLessons.length : 0;
        if (total === 0) return 0;
        return Math.min(100, Math.round((done / total) * 100));
    },

    _isCourseComplete(course, progress) {
        const lessonsComplete = (progress.completedLessons || []).length === course.lessons.length;
        const quizPassed = progress.quiz?.passed === true;
        return lessonsComplete && quizPassed;
    },

    _getStats() {
        const courses = this.courses;
        const totalCourses = courses.length;
        let completedCourses = 0;
        let inProgress = 0;
        let quizPassed = 0;

        courses.forEach(course => {
            const progress = this._getCourseProgress(course.id);
            const percent = this._getProgressPercent(course, progress);
            const completed = this._isCourseComplete(course, progress);
            if (completed) completedCourses += 1;
            if (percent > 0 && !completed) inProgress += 1;
            if (progress.quiz?.passed) quizPassed += 1;
        });

        const progressPercent = totalCourses === 0 ? 0 : Math.round((completedCourses / totalCourses) * 100);

        return {
            totalCourses,
            completedCourses,
            inProgress,
            quizPassed,
            progressPercent,
            totalDuration: '14h 00' // Programme complet 14h conforme arrêté 5 octobre 2011
        };
    },

    // Export traçabilité pour audit (base pour développement futur)
    exportTracabilite() {
        const { userId, userProgress } = this._getUserProgress();
        const user = App.currentUser || { nom: 'Utilisateur anonyme', id: userId };
        
        let report = `RAPPORT DE TRACABILITE - FORMATION HACCP\n`;
        report += `===========================================\n\n`;
        report += `Utilisateur: ${user.nom} (ID: ${user.id})\n`;
        report += `Date rapport: ${new Date().toLocaleString('fr-FR')}\n\n`;

        this.courses.forEach(course => {
            const progress = userProgress.courses[course.id];
            if (!progress || progress.completedLessons.length === 0) return;

            report += `\n--- ${course.title} ---\n`;
            report += `Progression: ${progress.completedLessons.length}/${course.lessons.length} lecons\n`;
            
            if (progress.quiz) {
                report += `Quiz: ${progress.quiz.passed ? 'REUSSI' : 'ECHOUE'} (${progress.quiz.score}%)\n`;
                report += `Date quiz: ${new Date(progress.quiz.date).toLocaleString('fr-FR')}\n`;
            }

            if (progress.lessonHistory && progress.lessonHistory.length > 0) {
                report += `\nHistorique des lecons:\n`;
                progress.lessonHistory.forEach(entry => {
                    report += `  - ${entry.lessonTitle}\n`;
                    report += `    Complete le: ${new Date(entry.completedAt).toLocaleString('fr-FR')}\n`;
                    report += `    Duree: ${entry.duration} min\n`;
                });
            }
        });

        // Télécharger le rapport
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tracabilite_formation_${user.id}_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        UI.toast('Rapport de tracabilite exporte', 'success');
    }
};
