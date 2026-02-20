/* ============================================================
   OK CUISINE — Module Simulateur de Controle HACCP / DDPP
   Simulation d'audit sanitaire professionnel
   Compatible controle DDPP reel
   Ref: Reg. CE 852/2004, Paquet Hygiene, Arrete 21/12/2009
   ============================================================ */

const Simulateur = {
    mode: 'manuel',       // 'manuel' ou 'simulation'
    currentAudit: null,   // Audit en cours
    history: [],          // Historique des audits

    // =====================================================================
    // QUESTIONS PAR SECTION — basees sur les grilles officielles DDPP
    // =====================================================================
    SECTIONS: [
        {
            id: 'pms',
            nom: 'Plan de Maitrise Sanitaire (PMS)',
            icone: '📋',
            ref: 'Reg. CE 852/2004 - Art. 5',
            questions: [
                { id: 'pms_1', q: 'Le PMS est-il redige, a jour et accessible ?', poids: 5, criticite: 'majeure' },
                { id: 'pms_2', q: 'Le plan HACCP est-il formalise avec les 7 principes ?', poids: 4, criticite: 'majeure' },
                { id: 'pms_3', q: 'Les procedures de bonnes pratiques d\'hygiene (BPH) sont-elles documentees ?', poids: 3, criticite: 'mineure' },
                { id: 'pms_4', q: 'Le systeme de tracabilite est-il operationnel (amont/aval) ?', poids: 4, criticite: 'majeure' },
                { id: 'pms_5', q: 'Les procedures de retrait/rappel sont-elles formalisees et testees ?', poids: 3, criticite: 'majeure' },
                { id: 'pms_6', q: 'L\'organigramme et les responsabilites hygiene sont-ils definis ?', poids: 2, criticite: 'mineure' }
            ]
        },
        {
            id: 'documentation',
            nom: 'Documentation & Registres',
            icone: '📑',
            ref: 'Reg. CE 852/2004 - Annexe II',
            questions: [
                { id: 'doc_1', q: 'Les registres de temperatures (frigo/congelateur) du jour sont-ils remplis ?', poids: 4, criticite: 'majeure', autoCheck: 'temperatures' },
                { id: 'doc_2', q: 'Le registre de nettoyage/desinfection est-il a jour ?', poids: 3, criticite: 'mineure', autoCheck: 'nettoyage' },
                { id: 'doc_3', q: 'Les fiches de reception des marchandises sont-elles archivees ?', poids: 3, criticite: 'mineure', autoCheck: 'receptions' },
                { id: 'doc_4', q: 'Les procedures de nettoyage sont-elles affichees aux postes ?', poids: 2, criticite: 'mineure' },
                { id: 'doc_5', q: 'La liste des fournisseurs agrees est-elle a jour avec N° d\'agrement ?', poids: 3, criticite: 'mineure' },
                { id: 'doc_6', q: 'Les fiches techniques des produits de nettoyage sont-elles disponibles ?', poids: 2, criticite: 'observation' },
                { id: 'doc_7', q: 'Les attestations de formation hygiene du personnel sont-elles presentes ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'locaux',
            nom: 'Locaux & Installations',
            icone: '🏗️',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. I & II',
            questions: [
                { id: 'loc_1', q: 'Les sols, murs et plafonds sont-ils en bon etat, lisses et lavables ?', poids: 3, criticite: 'mineure' },
                { id: 'loc_2', q: 'Les chambres froides sont-elles propres et organisees ?', poids: 4, criticite: 'majeure' },
                { id: 'loc_3', q: 'La separation zones propres / zones sales (marche en avant) est-elle respectee ?', poids: 5, criticite: 'majeure' },
                { id: 'loc_4', q: 'L\'eclairage est-il suffisant et fonctionnel (protections anti-eclats) ?', poids: 2, criticite: 'mineure' },
                { id: 'loc_5', q: 'La ventilation/extraction est-elle correcte et entretenue ?', poids: 2, criticite: 'mineure' },
                { id: 'loc_6', q: 'Les vestiaires/sanitaires du personnel sont-ils separes de la zone de production ?', poids: 3, criticite: 'mineure' },
                { id: 'loc_7', q: 'Les postes de lavage des mains sont-ils equipes (eau chaude, savon, essuie-mains) ?', poids: 4, criticite: 'majeure' },
                { id: 'loc_8', q: 'Le local dechets est-il separe et conforme ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'hygiene',
            nom: 'Hygiene du Personnel',
            icone: '🧑‍🍳',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. VIII',
            questions: [
                { id: 'hyg_1', q: 'Le port de la tenue complete est-il respecte (charlotte, blouse, chaussures) ?', poids: 3, criticite: 'mineure' },
                { id: 'hyg_2', q: 'Les tenues sont-elles propres et changees quotidiennement ?', poids: 3, criticite: 'mineure' },
                { id: 'hyg_3', q: 'Le lavage des mains est-il effectue aux moments critiques ?', poids: 5, criticite: 'majeure' },
                { id: 'hyg_4', q: 'Les bijoux, montres et vernis a ongles sont-ils absents en zone de production ?', poids: 2, criticite: 'mineure' },
                { id: 'hyg_5', q: 'Le personnel malade est-il ecarte de la manipulation des denrees ?', poids: 4, criticite: 'majeure' },
                { id: 'hyg_6', q: 'Le personnel a-t-il recu une formation hygiene adaptee ?', poids: 3, criticite: 'mineure' },
                { id: 'hyg_7', q: 'Le protocole de lavage des mains est-il affiche pres des lavabos ?', poids: 2, criticite: 'observation' }
            ]
        },
        {
            id: 'temperatures',
            nom: 'Maitrise des Temperatures',
            icone: '🌡️',
            ref: 'Arrete du 21/12/2009 - Annexe I & II',
            questions: [
                { id: 'tmp_1', q: 'Les temperatures des enceintes froides positives sont-elles conformes (0 a +3°C) ?', poids: 5, criticite: 'majeure' },
                { id: 'tmp_2', q: 'Les temperatures des congelateurs/surgelateurs sont-elles conformes (-18°C) ?', poids: 5, criticite: 'majeure' },
                { id: 'tmp_3', q: 'Les releves de temperature sont-ils effectues au moins 2 fois par jour ?', poids: 4, criticite: 'majeure', autoCheck: 'temperatures' },
                { id: 'tmp_4', q: 'Les thermometres sont-ils calibres/verifies regulierement ?', poids: 3, criticite: 'mineure' },
                { id: 'tmp_5', q: 'Les temperatures de cuisson a coeur sont-elles controlees (>=63°C) ?', poids: 5, criticite: 'majeure' },
                { id: 'tmp_6', q: 'Le refroidissement rapide est-il respecte (63°C a <10°C en <2h) ?', poids: 5, criticite: 'majeure' },
                { id: 'tmp_7', q: 'La remise en temperature est-elle conforme (>63°C en <1h) ?', poids: 4, criticite: 'majeure' },
                { id: 'tmp_8', q: 'Le maintien au chaud est-il assure a >=63°C ?', poids: 4, criticite: 'majeure' }
            ]
        },
        {
            id: 'cuisson',
            nom: 'Cuisson & Plats Temoins',
            icone: '🔥',
            ref: 'Arrete du 21/12/2009 - Art. 37',
            questions: [
                { id: 'cui_1', q: 'Les plats temoins sont-ils preleves a chaque service (>100g) ?', poids: 5, criticite: 'majeure' },
                { id: 'cui_2', q: 'Les plats temoins sont-ils etiquetes (date, service, plat) et conserves 5 jours ?', poids: 4, criticite: 'majeure' },
                { id: 'cui_3', q: 'Les temperatures de cuisson sont-elles enregistrees ?', poids: 4, criticite: 'majeure' },
                { id: 'cui_4', q: 'Les huiles de friture sont-elles controlees (TPM <25%) ?', poids: 3, criticite: 'mineure' },
                { id: 'cui_5', q: 'L\'etiquetage des preparations intermediaires (DLC secondaire J+3) est-il fait ?', poids: 3, criticite: 'mineure' },
                { id: 'cui_6', q: 'Les preparations du jour sont-elles correctement identifiees et datees ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'stockage',
            nom: 'Stockage & DLC',
            icone: '📦',
            ref: 'Reg. CE 853/2004, Reg. INCO 1169/2011',
            questions: [
                { id: 'sto_1', q: 'Tous les produits sont-ils correctement etiquetes (DLC/DDM, lot, origine) ?', poids: 4, criticite: 'majeure' },
                { id: 'sto_2', q: 'Les DLC/DDM sont-elles toutes respectees (aucun produit perime) ?', poids: 5, criticite: 'majeure', autoCheck: 'dlc' },
                { id: 'sto_3', q: 'La separation cru/cuit est-elle respectee dans les enceintes froides ?', poids: 4, criticite: 'majeure' },
                { id: 'sto_4', q: 'Les produits allergenes sont-ils clairement identifies et separes ?', poids: 4, criticite: 'majeure' },
                { id: 'sto_5', q: 'Le principe FIFO (premier entre, premier sorti) est-il applique ?', poids: 3, criticite: 'mineure' },
                { id: 'sto_6', q: 'Les denrees sont-elles stockees hors sol (pas de contact direct) ?', poids: 3, criticite: 'mineure' },
                { id: 'sto_7', q: 'Les produits d\'entretien sont-ils stockes dans un local separe ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'reception',
            nom: 'Reception des Marchandises',
            icone: '🚚',
            ref: 'Reg. CE 178/2002 - Art. 18, Reg. CE 853/2004',
            questions: [
                { id: 'rec_1', q: 'Les temperatures des produits sont-elles controlees a reception ?', poids: 4, criticite: 'majeure' },
                { id: 'rec_2', q: 'L\'etat des emballages est-il verifie (integrite, proprete) ?', poids: 3, criticite: 'mineure' },
                { id: 'rec_3', q: 'Les DLC/DDM sont-elles verifiees a reception ?', poids: 4, criticite: 'majeure' },
                { id: 'rec_4', q: 'Les numeros de lot et l\'origine sont-ils releves ?', poids: 3, criticite: 'mineure' },
                { id: 'rec_5', q: 'La proprete du vehicule de livraison est-elle verifiee ?', poids: 2, criticite: 'observation' },
                { id: 'rec_6', q: 'Les produits non conformes sont-ils refuses et documentes ?', poids: 4, criticite: 'majeure' }
            ]
        },
        {
            id: 'nettoyage',
            nom: 'Nettoyage & Desinfection',
            icone: '🧹',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. V',
            questions: [
                { id: 'net_1', q: 'Le plan de nettoyage est-il affiche, detaille et respecte ?', poids: 4, criticite: 'majeure', autoCheck: 'nettoyage' },
                { id: 'net_2', q: 'Les surfaces de travail sont-elles propres visuellement et au toucher ?', poids: 4, criticite: 'majeure' },
                { id: 'net_3', q: 'Le materiel de nettoyage est-il en bon etat et correctement range ?', poids: 2, criticite: 'observation' },
                { id: 'net_4', q: 'Les produits de nettoyage sont-ils homologues et correctement doses ?', poids: 3, criticite: 'mineure' },
                { id: 'net_5', q: 'Le nettoyage suit-il le protocole : debarrasser, pre-laver, nettoyer, rincer, desinfecter, rincer ?', poids: 3, criticite: 'mineure' },
                { id: 'net_6', q: 'Les chambres froides sont-elles nettoyees regulierement (hebdomadaire min.) ?', poids: 3, criticite: 'mineure' },
                { id: 'net_7', q: 'Les sols et caniveaux sont-ils propres ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'nuisibles',
            nom: 'Gestion des Nuisibles',
            icone: '🪲',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. IX',
            questions: [
                { id: 'nui_1', q: 'Un plan de lutte contre les nuisibles est-il en place ?', poids: 3, criticite: 'mineure' },
                { id: 'nui_2', q: 'Le contrat avec un prestataire de deratisation/desinsectisation est-il a jour ?', poids: 3, criticite: 'mineure' },
                { id: 'nui_3', q: 'Les releves des pieges/appats sont-ils effectues et documentes ?', poids: 2, criticite: 'observation' },
                { id: 'nui_4', q: 'Les ouvertures (portes, fenetres) sont-elles protegees (moustiquaires, rideaux) ?', poids: 3, criticite: 'mineure' },
                { id: 'nui_5', q: 'Aucune trace de nuisibles n\'est visible (dejections, traces, rongement) ?', poids: 5, criticite: 'majeure' }
            ]
        },
        {
            id: 'dechets',
            nom: 'Gestion des Dechets',
            icone: '🗑️',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. VI',
            questions: [
                { id: 'dec_1', q: 'Les poubelles sont-elles a commande non manuelle (pedale) et en nombre suffisant ?', poids: 3, criticite: 'mineure' },
                { id: 'dec_2', q: 'L\'evacuation des dechets est-elle effectuee regulierement (pas d\'accumulation) ?', poids: 3, criticite: 'mineure' },
                { id: 'dec_3', q: 'Le circuit des dechets ne croise pas le circuit des denrees ?', poids: 4, criticite: 'majeure' },
                { id: 'dec_4', q: 'Le local poubelles est-il propre, ferme et eloigne de la cuisine ?', poids: 3, criticite: 'mineure' },
                { id: 'dec_5', q: 'Les huiles usagees sont-elles collectees par un prestataire agree ?', poids: 2, criticite: 'observation' }
            ]
        },
        {
            id: 'allergenes',
            nom: 'Gestion des Allergenes',
            icone: '🥜',
            ref: 'Reg. INCO 1169/2011 - Art. 21 & Annexe II',
            questions: [
                { id: 'all_1', q: 'La liste des 14 allergenes est-elle affichee et connue du personnel ?', poids: 4, criticite: 'majeure' },
                { id: 'all_2', q: 'Les allergenes sont-ils identifies pour chaque plat servi ?', poids: 5, criticite: 'majeure' },
                { id: 'all_3', q: 'L\'information allergene est-elle accessible aux convives (affichage, classeur) ?', poids: 4, criticite: 'majeure' },
                { id: 'all_4', q: 'Les procedures PAI (Projet d\'Accueil Individualise) sont-elles respectees ?', poids: 4, criticite: 'majeure' },
                { id: 'all_5', q: 'La contamination croisee est-elle maitrisee (ustensiles dedies, nettoyage) ?', poids: 3, criticite: 'mineure' }
            ]
        },
        {
            id: 'eau',
            nom: 'Gestion de l\'Eau',
            icone: '💧',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. VII',
            questions: [
                { id: 'eau_1', q: 'L\'eau utilisee est-elle potable (reseau public ou analyse recente) ?', poids: 4, criticite: 'majeure' },
                { id: 'eau_2', q: 'L\'eau chaude est-elle disponible en quantite suffisante a tous les postes ?', poids: 3, criticite: 'mineure' },
                { id: 'eau_3', q: 'Les analyses d\'eau sont-elles realisees si alimentation non publique ?', poids: 3, criticite: 'majeure' },
                { id: 'eau_4', q: 'La glace alimentaire est-elle produite a partir d\'eau potable ?', poids: 2, criticite: 'observation' }
            ]
        },
        {
            id: 'materiel',
            nom: 'Materiel & Equipements',
            icone: '🔧',
            ref: 'Reg. CE 852/2004 - Annexe II, Chap. V',
            questions: [
                { id: 'mat_1', q: 'Les ustensiles et equipements sont-ils en bon etat et propres ?', poids: 3, criticite: 'mineure' },
                { id: 'mat_2', q: 'Les planches a decouper sont-elles differenciees par couleur (cru/cuit) ?', poids: 3, criticite: 'mineure' },
                { id: 'mat_3', q: 'Les equipements frigorifiques sont-ils entretenus et en bon etat ?', poids: 4, criticite: 'majeure' },
                { id: 'mat_4', q: 'Les balances et thermometres sont-ils calibres/verifies ?', poids: 3, criticite: 'mineure' },
                { id: 'mat_5', q: 'Le four et les plaques de cuisson sont-ils propres et fonctionnels ?', poids: 2, criticite: 'mineure' },
                { id: 'mat_6', q: 'Le lave-vaisselle fonctionne-t-il aux temperatures requises (55-65°C min.) ?', poids: 3, criticite: 'mineure' }
            ]
        }
    ],

    // =====================================================================
    // INITIALISATION
    // =====================================================================
    init() {
        this._loadHistory();
    },

    // =====================================================================
    // RENDU PRINCIPAL
    // =====================================================================
    render() {
        const page = document.getElementById('page-simulateur');

        const totalQuestions = this.SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);
        const totalSections = this.SECTIONS.length;

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🛡️ Simulateur de Controle HACCP</h2>
                <div class="section-actions">
                    ${this.currentAudit ? `
                        <button class="btn btn-success btn-kitchen" onclick="Simulateur.exportPDF()">
                            📄 Export PDF
                        </button>
                        <button class="btn btn-danger" onclick="Simulateur.resetAudit()">
                            Nouveau
                        </button>
                    ` : ''}
                </div>
            </div>

            ${!this.currentAudit ? this._renderStartScreen(totalQuestions, totalSections) : this._renderAuditScreen()}
        `;
    },

    // =====================================================================
    // ECRAN DE DEMARRAGE
    // =====================================================================
    _renderStartScreen(totalQuestions, totalSections) {
        return `
            <div class="card" style="text-align:center;padding:2rem;">
                <div style="font-size:4rem;margin-bottom:1rem;">🛡️</div>
                <h3 style="font-size:1.3rem;margin-bottom:0.5rem;">Simulateur de Controle Sanitaire DDPP</h3>
                <p style="color:var(--text-secondary);margin-bottom:1.5rem;">
                    Reproduit fidelement une inspection officielle DDPP.<br>
                    ${totalSections} categories, ${totalQuestions} points de controle.
                </p>

                <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem;">
                    <button class="btn btn-primary btn-kitchen" onclick="Simulateur.startAudit('manuel')">
                        ✋ Mode Manuel<br><small>Repondez vous-meme</small>
                    </button>
                    <button class="btn btn-warning btn-kitchen" onclick="Simulateur.startAudit('simulation')">
                        🎲 Simulation<br><small>Reponses aleatoires</small>
                    </button>
                </div>

                <div class="card" style="text-align:left;background:var(--bg-input);">
                    <div class="card-title" style="margin-bottom:0.75rem;">📖 Reglementation de reference</div>
                    <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
                        <strong>Paquet Hygiene</strong> — Reg. CE 852/2004, 853/2004, 178/2002<br>
                        <strong>Arrete du 21/12/2009</strong> — Restauration collective<br>
                        <strong>Reg. INCO 1169/2011</strong> — Information consommateur, allergenes<br>
                        <strong>Note DGAL 2011-8117</strong> — Grille d'inspection officielle
                    </div>
                </div>
            </div>

            ${this._renderHistory()}
        `;
    },

    // =====================================================================
    // DEMARRAGE D'UN AUDIT
    // =====================================================================
    startAudit(mode) {
        this.mode = mode;
        const config = Storage.getConfig();

        this.currentAudit = {
            id: Date.now().toString(36),
            date: new Date().toISOString(),
            etablissement: config.etablissement || 'Non defini',
            auditeur: App.currentUser ? App.currentUser.nom : 'Inconnu',
            mode: mode,
            sections: this.SECTIONS.map(sec => ({
                id: sec.id,
                nom: sec.nom,
                icone: sec.icone,
                ref: sec.ref,
                questions: sec.questions.map(q => {
                    let reponse = null;
                    let autoValue = null;

                    // Auto-check depuis les donnees de l'app
                    if (q.autoCheck) {
                        autoValue = this._autoCheckQuestion(q.autoCheck);
                    }

                    // Mode simulation : generer aleatoirement
                    if (mode === 'simulation') {
                        const rand = Math.random();
                        if (rand < 0.08) reponse = 'non';
                        else if (rand < 0.18) reponse = 'a_corriger';
                        else reponse = 'oui';
                    }

                    return {
                        id: q.id,
                        question: q.q,
                        poids: q.poids,
                        criticite: q.criticite,
                        reponse: reponse,
                        action_corrective: '',
                        responsable: '',
                        delai: '',
                        autoValue: autoValue
                    };
                })
            }))
        };

        Journal.log('audit', `Simulateur: Demarrage audit ${mode} par ${this.currentAudit.auditeur}`);
        this.render();
    },

    // =====================================================================
    // AUTO-CHECK depuis les donnees de l'app
    // =====================================================================
    _autoCheckQuestion(type) {
        const today = Storage.today();
        switch (type) {
            case 'temperatures': {
                const records = Storage.getTemperatures(today);
                return records.length > 0 ? 'oui' : 'non';
            }
            case 'nettoyage': {
                const records = Storage.getNettoyages(today);
                return records.length > 0 ? 'oui' : 'non';
            }
            case 'receptions': {
                const records = Storage.getReceptions(today);
                return records.length > 0 ? 'oui' : null;
            }
            case 'dlc': {
                const alerts = Storage.checkDLCAlerts();
                const critiques = alerts.filter(a => a.niveau === 'critique');
                return critiques.length === 0 ? 'oui' : 'non';
            }
            default:
                return null;
        }
    },

    // =====================================================================
    // RENDU DE L'AUDIT EN COURS
    // =====================================================================
    _renderAuditScreen() {
        const audit = this.currentAudit;
        const scores = this._calculateScores();

        return `
            <!-- En-tete audit -->
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                    <div>
                        <div style="font-size:0.85rem;color:var(--text-muted);">
                            ${audit.mode === 'simulation' ? '🎲 Simulation' : '✋ Auto-evaluation'}
                            — ${new Date(audit.date).toLocaleDateString('fr-FR')} a ${new Date(audit.date).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}
                        </div>
                        <div style="font-weight:600;font-size:1.1rem;margin-top:0.25rem;">${UI.escapeHTML(audit.etablissement)}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Auditeur : ${UI.escapeHTML(audit.auditeur)}</div>
                    </div>
                    <div style="text-align:center;">
                        ${this._renderGlobalScore(scores)}
                    </div>
                </div>
            </div>

            <!-- Score par section -->
            <div class="stats-grid">
                ${audit.sections.map(sec => {
                    const secScore = this._sectionScore(sec);
                    return `
                        <div class="stat-card ${secScore.pct >= 80 ? 'success' : secScore.pct >= 50 ? 'warning' : 'danger'}" style="cursor:pointer;" onclick="document.getElementById('sim-section-${sec.id}').scrollIntoView({behavior:'smooth',block:'start'});">
                            <div class="stat-label">${sec.icone} ${sec.nom.length > 15 ? sec.nom.substring(0,15) + '...' : sec.nom}</div>
                            <div class="stat-value">${secScore.pct}%</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${secScore.answered}/${sec.questions.length} repondu(s)</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Sections de questions -->
            ${audit.sections.map(sec => this._renderSection(sec)).join('')}

            <!-- Resume non-conformites -->
            ${this._renderNonConformites(audit)}

            <!-- Actions: Valider -->
            <div style="text-align:center;margin:2rem 0;">
                <button class="btn btn-success btn-kitchen" onclick="Simulateur.finalizeAudit()">
                    ✅ Finaliser & Sauvegarder l'Audit
                </button>
            </div>
        `;
    },

    // =====================================================================
    // SCORE GLOBAL + NOTE DDPP
    // =====================================================================
    _renderGlobalScore(scores) {
        const { pct, grade, gradeColor, gradeLabel } = scores;
        return `
            <div style="display:inline-flex;align-items:center;gap:1rem;">
                <div style="width:64px;height:64px;border-radius:50%;background:${gradeColor};display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:900;color:#fff;">
                    ${grade}
                </div>
                <div style="text-align:left;">
                    <div style="font-size:1.8rem;font-weight:700;color:${gradeColor};">${pct}%</div>
                    <div style="font-size:0.8rem;color:var(--text-secondary);">${gradeLabel}</div>
                </div>
            </div>
        `;
    },

    // =====================================================================
    // CALCUL DES SCORES
    // =====================================================================
    _calculateScores() {
        const audit = this.currentAudit;
        let totalPoids = 0;
        let totalScore = 0;
        let majeures = 0;
        let mineures = 0;
        let observations = 0;

        audit.sections.forEach(sec => {
            sec.questions.forEach(q => {
                totalPoids += q.poids;
                if (q.reponse === 'oui') totalScore += q.poids;
                else if (q.reponse === 'a_corriger') totalScore += q.poids * 0.5;

                if (q.reponse === 'non') {
                    if (q.criticite === 'majeure') majeures++;
                    else if (q.criticite === 'mineure') mineures++;
                    else observations++;
                }
            });
        });

        const pct = totalPoids > 0 ? Math.round((totalScore / totalPoids) * 100) : 0;

        let grade, gradeColor, gradeLabel;
        if (pct >= 90 && majeures === 0) {
            grade = 'A'; gradeColor = 'var(--success)'; gradeLabel = 'Tres satisfaisant';
        } else if (pct >= 70 && majeures <= 2) {
            grade = 'B'; gradeColor = 'var(--info)'; gradeLabel = 'Satisfaisant — corrections mineures';
        } else if (pct >= 50) {
            grade = 'C'; gradeColor = 'var(--warning)'; gradeLabel = 'A ameliorer — mise en demeure';
        } else {
            grade = 'D'; gradeColor = 'var(--danger)'; gradeLabel = 'Non satisfaisant — fermeture possible';
        }

        return { pct, totalScore, totalPoids, majeures, mineures, observations, grade, gradeColor, gradeLabel };
    },

    _sectionScore(sec) {
        let totalPoids = 0;
        let totalScore = 0;
        let answered = 0;

        sec.questions.forEach(q => {
            totalPoids += q.poids;
            if (q.reponse !== null) answered++;
            if (q.reponse === 'oui') totalScore += q.poids;
            else if (q.reponse === 'a_corriger') totalScore += q.poids * 0.5;
        });

        const pct = totalPoids > 0 ? Math.round((totalScore / totalPoids) * 100) : 0;
        return { pct, totalScore, totalPoids, answered };
    },

    // =====================================================================
    // RENDU D'UNE SECTION
    // =====================================================================
    _renderSection(sec) {
        const secScore = this._sectionScore(sec);
        const statusClass = secScore.pct >= 80 ? 'success' : secScore.pct >= 50 ? 'warning' : 'danger';

        return `
            <div class="card" id="sim-section-${sec.id}">
                <div class="card-header" style="cursor:pointer;" onclick="Simulateur._toggleSection('${sec.id}')">
                    <div class="card-title">${sec.icone} ${sec.nom}</div>
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                        <span class="badge badge-${statusClass}">${secScore.pct}%</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${sec.ref}</span>
                        <span id="sim-chevron-${sec.id}" style="transition:transform 0.2s;">▼</span>
                    </div>
                </div>
                <div id="sim-body-${sec.id}" style="display:none;margin-top:1rem;">
                    ${sec.questions.map((q, qi) => this._renderQuestion(sec.id, qi, q)).join('')}
                </div>
            </div>
        `;
    },

    _toggleSection(secId) {
        const body = document.getElementById('sim-body-' + secId);
        const chevron = document.getElementById('sim-chevron-' + secId);
        if (body.style.display === 'none') {
            body.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
        } else {
            body.style.display = 'none';
            chevron.style.transform = 'rotate(0)';
        }
    },

    // =====================================================================
    // RENDU D'UNE QUESTION
    // =====================================================================
    _renderQuestion(secId, qi, q) {
        const isOui = q.reponse === 'oui';
        const isNon = q.reponse === 'non';
        const isAC = q.reponse === 'a_corriger';
        const noAnswer = q.reponse === null;

        let borderColor = 'var(--border)';
        if (isOui) borderColor = 'var(--success)';
        else if (isNon) borderColor = 'var(--danger)';
        else if (isAC) borderColor = 'var(--warning)';

        const criticiteLabel = q.criticite === 'majeure' ? '🔴 Majeure' : q.criticite === 'mineure' ? '🟡 Mineure' : '🔵 Observation';

        return `
            <div class="sim-question" style="padding:1rem;margin-bottom:0.75rem;background:var(--bg-input);border-radius:var(--radius-sm);border-left:4px solid ${borderColor};">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:0.5rem;">
                    <div style="flex:1;">
                        <div style="font-weight:500;line-height:1.4;">${q.question}</div>
                        <div style="display:flex;gap:0.75rem;margin-top:0.25rem;font-size:0.75rem;color:var(--text-muted);">
                            <span>Poids: ${q.poids}/5</span>
                            <span>${criticiteLabel}</span>
                            ${q.autoValue ? `<span style="color:var(--accent);">📊 Donnee app: ${q.autoValue === 'oui' ? '✅' : '❌'}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn ${isOui ? 'btn-success' : 'btn-secondary'}" style="min-width:100px;padding:0.5rem 1rem;" onclick="Simulateur._setAnswer('${secId}',${qi},'oui')">
                        ✅ Conforme
                    </button>
                    <button class="btn ${isAC ? 'btn-warning' : 'btn-secondary'}" style="min-width:100px;padding:0.5rem 1rem;" onclick="Simulateur._setAnswer('${secId}',${qi},'a_corriger')">
                        ⚠️ A corriger
                    </button>
                    <button class="btn ${isNon ? 'btn-danger' : 'btn-secondary'}" style="min-width:100px;padding:0.5rem 1rem;" onclick="Simulateur._setAnswer('${secId}',${qi},'non')">
                        ❌ Non conforme
                    </button>
                </div>
                ${(isNon || isAC) ? `
                    <div style="margin-top:0.75rem;display:grid;gap:0.5rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.8rem;">Action corrective</label>
                            <input type="text" class="form-control" style="font-size:0.85rem;padding:0.5rem;"
                                   value="${UI.escapeHTML(q.action_corrective)}"
                                   onchange="Simulateur._setField('${secId}',${qi},'action_corrective',this.value)"
                                   placeholder="Decrire l'action a mener...">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.8rem;">Responsable</label>
                            <input type="text" class="form-control" style="font-size:0.85rem;padding:0.5rem;"
                                   value="${UI.escapeHTML(q.responsable)}"
                                   onchange="Simulateur._setField('${secId}',${qi},'responsable',this.value)"
                                   placeholder="Qui ?">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label style="font-size:0.8rem;">Delai</label>
                            <select class="form-control" style="font-size:0.85rem;padding:0.5rem;"
                                    onchange="Simulateur._setField('${secId}',${qi},'delai',this.value)">
                                <option value="" ${!q.delai ? 'selected' : ''}>Choisir...</option>
                                <option value="immediat" ${q.delai === 'immediat' ? 'selected' : ''}>Immediat</option>
                                <option value="24h" ${q.delai === '24h' ? 'selected' : ''}>Sous 24h</option>
                                <option value="1_semaine" ${q.delai === '1_semaine' ? 'selected' : ''}>Sous 1 semaine</option>
                                <option value="1_mois" ${q.delai === '1_mois' ? 'selected' : ''}>Sous 1 mois</option>
                            </select>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // =====================================================================
    // ACTIONS SUR LES QUESTIONS
    // =====================================================================
    _setAnswer(secId, qi, value) {
        const sec = this.currentAudit.sections.find(s => s.id === secId);
        if (sec) {
            sec.questions[qi].reponse = value;
            this.render();
        }
    },

    _setField(secId, qi, field, value) {
        const sec = this.currentAudit.sections.find(s => s.id === secId);
        if (sec) {
            sec.questions[qi][field] = value;
        }
    },

    // =====================================================================
    // RESUME DES NON-CONFORMITES
    // =====================================================================
    _renderNonConformites(audit) {
        const nc = [];
        audit.sections.forEach(sec => {
            sec.questions.forEach(q => {
                if (q.reponse === 'non' || q.reponse === 'a_corriger') {
                    nc.push({ section: sec.nom, icone: sec.icone, ...q });
                }
            });
        });

        if (nc.length === 0) {
            return `
                <div class="card" style="border-left:4px solid var(--success);">
                    <div style="display:flex;align-items:center;gap:1rem;">
                        <span style="font-size:2rem;">✅</span>
                        <div>
                            <div style="font-weight:600;">Aucune non-conformite detectee</div>
                            <div style="font-size:0.85rem;color:var(--text-muted);">Excellent ! Votre etablissement est pret pour un controle officiel.</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Trier: majeures d'abord, puis mineures, puis observations
        const ordre = { majeure: 0, mineure: 1, observation: 2 };
        nc.sort((a, b) => ordre[a.criticite] - ordre[b.criticite]);

        const majeures = nc.filter(n => n.criticite === 'majeure' && n.reponse === 'non');
        const mineures = nc.filter(n => n.criticite === 'mineure' || (n.criticite === 'majeure' && n.reponse === 'a_corriger'));
        const obs = nc.filter(n => n.criticite === 'observation');

        return `
            <div class="card" style="border-left:4px solid var(--danger);">
                <div class="card-title" style="color:var(--danger);margin-bottom:1rem;">📋 Plan d'Actions Correctives (${nc.length} point(s))</div>

                ${majeures.length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-weight:700;color:var(--danger);margin-bottom:0.5rem;">🔴 Non-conformites majeures (${majeures.length})</div>
                        ${majeures.map(n => this._renderNCItem(n)).join('')}
                    </div>
                ` : ''}

                ${mineures.length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-weight:700;color:var(--warning);margin-bottom:0.5rem;">🟡 Non-conformites mineures / A corriger (${mineures.length})</div>
                        ${mineures.map(n => this._renderNCItem(n)).join('')}
                    </div>
                ` : ''}

                ${obs.length > 0 ? `
                    <div>
                        <div style="font-weight:700;color:var(--info);margin-bottom:0.5rem;">🔵 Observations (${obs.length})</div>
                        ${obs.map(n => this._renderNCItem(n)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    _renderNCItem(n) {
        const delaiLabels = { immediat: 'Immediat', '24h': 'Sous 24h', '1_semaine': 'Sous 1 semaine', '1_mois': 'Sous 1 mois' };
        return `
            <div style="padding:0.5rem 0.75rem;margin-bottom:0.5rem;background:var(--bg-input);border-radius:var(--radius-sm);font-size:0.9rem;border-left:3px solid ${n.reponse === 'non' ? 'var(--danger)' : 'var(--warning)'};">
                <div><strong>${n.icone} ${n.section}</strong> — ${n.question}</div>
                ${n.action_corrective ? `<div style="color:var(--accent);margin-top:0.25rem;">→ ${UI.escapeHTML(n.action_corrective)} ${n.responsable ? '(' + UI.escapeHTML(n.responsable) + ')' : ''} ${n.delai ? '— ' + delaiLabels[n.delai] : ''}</div>` : '<div style="color:var(--text-muted);margin-top:0.25rem;font-style:italic;">Aucune action corrective definie</div>'}
            </div>
        `;
    },

    // =====================================================================
    // FINALISER ET SAUVEGARDER
    // =====================================================================
    finalizeAudit() {
        if (!this.currentAudit) return;

        // Verifier si au moins 50% des questions ont une reponse
        let totalQ = 0;
        let answeredQ = 0;
        this.currentAudit.sections.forEach(sec => {
            sec.questions.forEach(q => {
                totalQ++;
                if (q.reponse !== null) answeredQ++;
            });
        });

        if (answeredQ < totalQ * 0.5 && this.mode === 'manuel') {
            UI.toast('Repondez a au moins 50% des questions avant de finaliser.', 'warning');
            return;
        }

        const scores = this._calculateScores();
        this.currentAudit.scores = scores;
        this.currentAudit.finalized = true;

        // Sauvegarder dans l'historique
        this.history.unshift({
            id: this.currentAudit.id,
            date: this.currentAudit.date,
            etablissement: this.currentAudit.etablissement,
            auditeur: this.currentAudit.auditeur,
            mode: this.currentAudit.mode,
            grade: scores.grade,
            pct: scores.pct,
            majeures: scores.majeures,
            mineures: scores.mineures
        });

        // Garder max 20 audits dans l'historique
        if (this.history.length > 20) this.history = this.history.slice(0, 20);

        this._saveHistory();
        this._saveCurrentAudit();

        Journal.log('audit', `Simulateur: Audit finalise — Note ${scores.grade} (${scores.pct}%), ${scores.majeures} NC majeures`);
        UI.toast(`Audit finalise ! Note ${scores.grade} — ${scores.pct}%`, 'success');
        this.render();
    },

    // =====================================================================
    // HISTORIQUE
    // =====================================================================
    _renderHistory() {
        if (this.history.length === 0) return '';

        return `
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-title" style="margin-bottom:1rem;">📊 Historique des Audits</div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Note</th>
                                <th>Score</th>
                                <th>NC Maj.</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.history.map(h => {
                                const gradeColors = { A: 'var(--success)', B: 'var(--info)', C: 'var(--warning)', D: 'var(--danger)' };
                                return `
                                    <tr>
                                        <td>${new Date(h.date).toLocaleDateString('fr-FR')}</td>
                                        <td>${h.mode === 'simulation' ? '🎲' : '✋'} ${h.mode}</td>
                                        <td><span style="display:inline-flex;width:32px;height:32px;border-radius:50%;background:${gradeColors[h.grade]};color:#fff;font-weight:900;align-items:center;justify-content:center;">${h.grade}</span></td>
                                        <td style="font-weight:600;">${h.pct}%</td>
                                        <td>${h.majeures > 0 ? '<span style="color:var(--danger);font-weight:600;">' + h.majeures + '</span>' : '0'}</td>
                                        <td>
                                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="Simulateur.loadAudit('${h.id}')">
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // =====================================================================
    // RESET / NOUVEAU
    // =====================================================================
    resetAudit() {
        this.currentAudit = null;
        this.render();
    },

    // =====================================================================
    // CHARGER UN AUDIT DEPUIS L'HISTORIQUE
    // =====================================================================
    loadAudit(id) {
        const key = 'okc_simulateur_audit_' + id;
        const data = localStorage.getItem(key);
        if (data) {
            try {
                this.currentAudit = JSON.parse(data);
                this.render();
            } catch (e) {
                UI.toast('Impossible de charger cet audit.', 'danger');
            }
        } else {
            UI.toast('Audit non trouve dans le stockage.', 'warning');
        }
    },

    // =====================================================================
    // PERSISTENCE
    // =====================================================================
    _saveHistory() {
        localStorage.setItem('okc_simulateur_history', JSON.stringify(this.history));
    },

    _loadHistory() {
        try {
            const data = localStorage.getItem('okc_simulateur_history');
            this.history = data ? JSON.parse(data) : [];
        } catch (e) {
            this.history = [];
        }
    },

    _saveCurrentAudit() {
        if (this.currentAudit) {
            localStorage.setItem('okc_simulateur_audit_' + this.currentAudit.id, JSON.stringify(this.currentAudit));
        }
    },

    // =====================================================================
    // EXPORT PDF PROFESSIONNEL
    // =====================================================================
    exportPDF() {
        PDF.export('simulateur');
    }
};
