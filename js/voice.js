/* ============================================================
   OK CUISINE — Voice Engine
   Moteur vocal complet : wake word "OK Cuisine",
   reconnaissance vocale continue, synthèse vocale,
   flux conversationnel avec confirmation
   ============================================================ */

const Voice = {
    // --- State ---
    recognition: null,
    synthesis: window.speechSynthesis,
    isSupported: false,
    isActive: false,           // Vocal activé (écoute wake word)
    isAlwaysOn: false,         // Mode toujours actif (h24 après login)
    isListening: false,        // En train d'écouter
    isCommandMode: false,      // En mode commande (après wake word)
    isSpeaking: false,         // L'app parle
    currentFlow: null,         // Flux conversationnel en cours
    flowStep: 0,
    flowData: {},
    awaitingResponse: false,
    restartTimeout: null,
    keepAliveInterval: null,   // Intervalle pour maintenir l'écoute active
    voiceFR: null,

    // --- Init ---
    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('SpeechRecognition non supporté');
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'fr-FR';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;

        this.recognition.onresult = (event) => this._onResult(event);
        this.recognition.onerror = (event) => this._onError(event);
        this.recognition.onend = () => this._onEnd();
        this.recognition.onstart = () => {
            this.isListening = true;
            this._updateUI();
        };

        // Précharger la voix française
        this._loadVoice();
        this.synthesis.onvoiceschanged = () => this._loadVoice();
    },

    _loadVoice() {
        const voices = this.synthesis.getVoices();
        this.voiceFR = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Google')) ||
                       voices.find(v => v.lang.startsWith('fr-FR')) ||
                       voices.find(v => v.lang.startsWith('fr')) ||
                       null;
    },

    // --- Activation / Désactivation ---
    toggle() {
        if (this.isCommandMode) {
            // Si déjà en commande, fermer le panneau
            this._hidePanel();
            this._exitCommandMode();
        } else if (this.isActive) {
            // Ouvrir le panneau et entrer en mode commande directement
            this._enterCommandMode();
        } else {
            this.activate();
        }
    },

    activate() {
        if (!this.isSupported) {
            UI.toast('Reconnaissance vocale non supportée. Utilisez Chrome ou Edge.', 'warning');
            return;
        }
        this.isActive = true;
        this._startListening();
        this._showPanel();
        this._updateStatus(true);
        UI.toast('Assistant vocal activé — Dites "OK Cuisine"', 'success');
    },

    // Activation silencieuse au login — toujours actif, panneau fermé
    activateAlwaysOn() {
        if (!this.isSupported) {
            UI.toast('Reconnaissance vocale non supportée. Utilisez Chrome ou Edge.', 'warning', 5000);
            return;
        }
        this.isActive = true;
        this.isAlwaysOn = true;
        this._startListening();
        this._startKeepAlive();
        this._updateStatus(true);
        // Panneau fermé par défaut — s'ouvre sur "OK Cuisine"
    },

    deactivate() {
        this.isActive = false;
        this.isAlwaysOn = false;
        this.isCommandMode = false;
        this.currentFlow = null;
        this._stopListening();
        this._stopKeepAlive();
        this._hidePanel();
        this._updateStatus(false);
        this.synthesis.cancel();
    },

    // --- Keep Alive : Chrome coupe la reconnaissance après ~60s de silence ---
    _startKeepAlive() {
        this._stopKeepAlive();
        // Vérifier toutes les 5 secondes que l'écoute est active
        this.keepAliveInterval = setInterval(() => {
            if (this.isActive && !this.isListening && !this.isSpeaking) {
                console.log('[Voice] KeepAlive: redémarrage de l\'écoute');
                this._startListening();
            }
        }, 5000);
    },

    _stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    },

    // --- Reconnaissance vocale ---
    _startListening() {
        if (this.isListening) return;
        try {
            clearTimeout(this.restartTimeout);
            this.recognition.start();
        } catch (e) {
            // Already started
        }
    },

    _stopListening() {
        this.isListening = false;
        clearTimeout(this.restartTimeout);
        try {
            this.recognition.stop();
        } catch (e) {}
    },

    _onResult(event) {
        const last = event.results[event.results.length - 1];
        if (!last.isFinal) return;

        const transcript = last[0].transcript.trim().toLowerCase();
        console.log('[Voice] Entendu:', transcript);

        if (!this.isCommandMode) {
            // Mode veille — écoute wake word
            if (this._matchWakeWord(transcript)) {
                this._enterCommandMode();
            }
        } else if (this.awaitingResponse) {
            // En attente d'une réponse dans un flux
            this._handleFlowResponse(transcript);
        } else {
            // Mode commande — attente d'une commande
            this._parseCommand(transcript);
        }
    },

    _onError(event) {
        console.warn('[Voice] Error:', event.error);
        this.isListening = false;

        if (event.error === 'not-allowed') {
            UI.toast('Accès au micro refusé. Autorisez le micro dans les paramètres du navigateur.', 'danger', 6000);
            this.deactivate();
            return;
        }

        // 'no-speech' arrive souvent quand personne ne parle — normal en mode always-on
        // 'aborted' arrive quand on stop/restart rapidement
        // Dans tous les cas, redémarrer si actif
        if (this.isActive) {
            const delay = event.error === 'no-speech' ? 100 : 1000;
            this.restartTimeout = setTimeout(() => this._startListening(), delay);
        }
    },

    _onEnd() {
        this.isListening = false;
        this._updateUI();
        // Auto-restart immédiat si toujours actif (mode always-on)
        if (this.isActive && !this.isSpeaking) {
            this.restartTimeout = setTimeout(() => this._startListening(), 200);
        }
    },

    // --- Wake Word ---
    _matchWakeWord(text) {
        const triggers = ['ok cuisine', 'okay cuisine', 'aucune cuisine', 'oh cuisine',
                         'hockey cuisine', 'aux cuisines', 'o cuisine', 'ok cousine'];
        return triggers.some(t => text.includes(t));
    },

    _enterCommandMode() {
        this.isCommandMode = true;
        this.currentFlow = null;
        this.flowData = {};
        this._updateUI();
        this._showPanel();  // Ouvrir le panneau automatiquement
        this._showCommands();
        this.speak('Je vous écoute. Que souhaitez-vous faire ?');
    },

    // --- Parsing commande ---
    _parseCommand(text) {
        const cmd = text.toLowerCase().trim();

        // Température stockage
        if (this._match(cmd, ['température', 'temperature', 'températures', 'temp', 'prise temperature', 'frigo', 'chambre froide', 'conservation', 'stockage']) && !this._match(cmd, ['cuisson', 'refroid', 'remise'])) {
            this._startFlow('temperature');
            return;
        }

        // CCP Cuisson
        if (this._match(cmd, ['cuisson', 'ccp cuisson', 'contrôle cuisson', 'controle cuisson', 'cuire', 'cuisson viande'])) {
            this._startFlow('ccp_cuisson');
            return;
        }

        // CCP Refroidissement
        if (this._match(cmd, ['refroidissement', 'ccp refroidissement', 'refroidir', 'refroid', 'refroidi'])) {
            this._startFlow('ccp_refroidissement');
            return;
        }

        // CCP Remise en température
        if (this._match(cmd, ['remise en température', 'remise en temperature', 'remise temp', 'remise en temp', 'réchauffage', 'rechauffage', 'réchauffer', 'rechauffer'])) {
            this._startFlow('ccp_remise_temp');
            return;
        }

        // Nettoyage
        if (this._match(cmd, ['nettoyage', 'nettoyer', 'nettoyé', 'propreté', 'proprete', 'désinfection', 'desinfection'])) {
            this._startFlow('nettoyage');
            return;
        }

        // Réception
        if (this._match(cmd, ['réception', 'reception', 'livraison', 'livraisons', 'réceptionner'])) {
            this._startFlow('reception');
            return;
        }

        // Inventaire
        if (this._match(cmd, ['inventaire', 'inventorier', 'stock', 'stocks'])) {
            this._startFlow('inventaire');
            return;
        }

        // Alerte
        if (this._match(cmd, ['alerte', 'alertes', 'problème', 'probleme', 'incident', 'signalement', 'signaler'])) {
            this._startFlow('alerte');
            return;
        }

        // Contrôle huile de friture
        if (this._match(cmd, ['huile', 'huile de friture', 'friture', 'friteuse', 'composés polaires', 'composes polaires'])) {
            this._startFlow('huile');
            return;
        }

        // Étiquette de déconditionement
        if (this._match(cmd, ['étiquette', 'etiquette', 'étiquette j+3', 'etiquette j+3', 'etiquette j plus 3', 'j+3', 'j plus 3', 'déconditionement', 'deconditionement', 'conditionement', 'dlc secondaire'])) {
            this._startFlow('etiquette');
            return;
        }

        // Plat témoin
        if (this._match(cmd, ['plat témoin', 'plat temoin', 'témoin', 'temoin', 'échantillon', 'echantillon'])) {
            this._startFlow('plat_temoin');
            return;
        }

        // Génération de menu vocal
        if (this._match(cmd, ['génère un menu', 'genere un menu', 'générer un menu', 'generer un menu', 'génère menu', 'genere menu',
                               'menu pour', 'créer un menu', 'creer un menu', 'générer des menus', 'generer des menus',
                               'menu une semaine', 'menu deux semaines', 'menu trois semaines', 'menu quatre semaines',
                               'menu 1 semaine', 'menu 2 semaines', 'menu 3 semaines', 'menu 4 semaines',
                               'prépare un menu', 'prepare un menu', 'planifier les menus', 'planifier un menu',
                               'menu 8 semaines', 'menu 12 semaines', 'menu 36 semaines', 'menu annee', 'menu année'])) {
            this._startFlow('menu_generation');
            return;
        }

        // Lancement de simulation d'audit
        if (this._match(cmd, ['lance une simulation', 'lancer une simulation', 'lancer simulation',
                               'lance un audit', 'lancer un audit', 'démarrer un audit', 'demarrer un audit',
                               'simuler un contrôle', 'simuler un controle', 'lance le simulateur', 'lancer le simulateur',
                               'démarrer simulation', 'demarrer simulation', 'nouveau contrôle', 'nouveau controle',
                               'nouvel audit', 'faire un audit', 'faire une simulation'])) {
            this._startFlow('simulateur_launch');
            return;
        }

        // Navigation — Menus
        if (this._match(cmd, ['menu', 'menus', 'planning menu', 'planning des menus', 'planning repas', 'carte', 'menu du jour'])) {
            App.navigate('menus');
            this.speak('Voici la gestion des menus.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Allergènes
        if (this._match(cmd, ['allergène', 'allergene', 'allergènes', 'allergenes', 'allergies', 'intolerances', 'intolérances'])) {
            App.navigate('allergenes');
            this.speak('Voici la gestion des allergènes.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Traçabilité
        if (this._match(cmd, ['traçabilité', 'tracabilite', 'tracabilité', 'traçabilite', 'traçage', 'trace'])) {
            App.navigate('tracabilite');
            this.speak('Voici la traçabilité.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Simulateur DDPP
        if (this._match(cmd, ['simulateur', 'simulation', 'controle sanitaire', 'contrôle sanitaire', 'ddpp', 'controle ddpp', 'inspection ddpp', 'audit simulé', 'audit simule'])) {
            App.navigate('simulateur');
            this.speak('Voici le simulateur de controle sanitaire.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Protocoles HACCP
        if (this._match(cmd, ['protocole', 'protocoles', 'haccp', 'pms', 'plan de maîtrise', 'plan de maitrise'])) {
            App.navigate('protocoles');
            this.speak('Voici les protocoles HACCP.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Dashboard
        if (this._match(cmd, ['tableau de bord', 'accueil', 'dashboard', 'home'])) {
            App.navigate('dashboard');
            this.speak('Voici le tableau de bord.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Journal
        if (this._match(cmd, ['journal', 'historique', 'log'])) {
            App.navigate('journal');
            this.speak('Voici le journal.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Configuration
        if (this._match(cmd, ['configuration', 'config', 'paramètres', 'parametres', 'réglages', 'reglages'])) {
            App.navigate('config');
            this.speak('Voici la configuration.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Recettes / Fiches Techniques
        if (this._match(cmd, ['recette', 'recettes', 'fiche', 'fiches techniques', 'fiche technique'])) {
            App.navigate('recettes');
            this.speak('Voici la gestion des fiches techniques et recettes.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Fournisseurs
        if (this._match(cmd, ['fournisseur', 'fournisseurs', 'fornisseur', 'fornisseurs', 'supplier', 'suppliers'])) {
            App.navigate('fournisseurs');
            this.speak('Voici la gestion des fournisseurs agréés.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Agents
        if (this._match(cmd, ['agents', 'agent', 'gestion agents', 'employes', 'employés', 'personnel'])) {
            App.navigate('agents');
            this.speak('Voici la gestion des agents.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Calendrier
        if (this._match(cmd, ['calendrier', 'agenda', 'planning', 'rendez-vous', 'rdv', 'rdv du jour'])) {
            App.navigate('calendrier');
            this.speak('Voici le calendrier.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Audit & Contrôle (hors simulation)
        if (this._match(cmd, ['audit', 'audit & controle', 'audit et controle', 'contrôle interne', 'controle interne', 'audit interne']) &&
            !this._match(cmd, ['lance', 'lancer', 'simul', 'simulation', 'simulateur'])) {
            App.navigate('audit');
            this.speak('Voici la page Audit et Contrôle.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Formation
        if (this._match(cmd, ['formation', 'formations', 'formation du personnel', 'formations du personnel'])) {
            App.navigate('formation');
            this.speak('Voici les formations du personnel.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Centre de formation
        if (this._match(cmd, ['centre de formation', 'centre formation', 'centre formations', 'formation en ligne'])) {
            App.navigate('centre-formation');
            this.speak('Voici le centre de formation.');
            this._exitCommandMode();
            return;
        }

        // Navigation — TIAC
        if (this._match(cmd, ['tiac', 'incident tiac', 'incidents tiac', 'toxi infection', 'toxi-infection', 'intoxication alimentaire'])) {
            App.navigate('tiac');
            this.speak('Voici les incidents TIAC.');
            this._exitCommandMode();
            return;
        }

        // Navigation — RGPD
        if (this._match(cmd, ['rgpd', 'gdpr', 'donnees personnelles', 'données personnelles', 'confidentialité', 'confidentialite'])) {
            App.navigate('rgpd');
            this.speak('Voici les données RGPD.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Rappels produits
        if (this._match(cmd, ['rappel produit', 'rappels produits', 'retrait produit', 'retraits produits', 'alerte produit'])) {
            App.navigate('rappels-produits');
            this.speak('Voici la gestion des rappels produits.');
            this._exitCommandMode();
            return;
        }

        // Navigation — PAI Allergies
        if (this._match(cmd, ['pai', 'pai allergies', 'protocole allergie', 'allergies', 'projet d\'accueil individualise', 'projet accueil individualise'])) {
            App.navigate('pai');
            this.speak('Voici les PAI allergies.');
            this._exitCommandMode();
            return;
        }

        // Navigation — AGEC Dons
        if (this._match(cmd, ['agec', 'dons', 'don', 'anti gaspillage', 'anti-gaspillage'])) {
            App.navigate('agec-avance');
            this.speak('Voici le module AGEC Dons.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Maintenance
        if (this._match(cmd, ['maintenance', 'entretien', 'panne', 'pannes', 'reparation', 'réparation'])) {
            App.navigate('maintenance');
            this.speak('Voici la maintenance.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Analyse des risques
        if (this._match(cmd, ['analyse risques', 'analyse des risques', 'analyse de risques', 'analyse danger', 'analyse des dangers'])) {
            App.navigate('analyse-risques');
            this.speak('Voici l\'analyse des risques.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Validation nettoyage
        if (this._match(cmd, ['validation nettoyage', 'validation du nettoyage', 'controle nettoyage', 'contrôle nettoyage'])) {
            App.navigate('validation-nettoyage');
            this.speak('Voici la validation du nettoyage.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Separation cru/cuit
        if (this._match(cmd, ['separation cru cuit', 'separation cru', 'separation cuit', 'cru cuit', 'séparation cru cuit'])) {
            App.navigate('separation-cru-cuit');
            this.speak('Voici la separation cru cuit.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Douches / Vestiaires
        if (this._match(cmd, ['douches', 'vestiaires', 'douches vestiaires', 'vestiaire'])) {
            App.navigate('douches-vestiaires');
            this.speak('Voici les douches et vestiaires.');
            this._exitCommandMode();
            return;
        }

        // Navigation — Archivage DLC
        if (this._match(cmd, ['archivage dlc', 'archivage', 'archive', 'archives', 'dlc'])) {
            App.navigate('archivage-dlc');
            this.speak('Voici l\'archivage DLC.');
            this._exitCommandMode();
            return;
        }

        // Export
        if (this._match(cmd, ['exporter', 'export', 'pdf'])) {
            this._startFlow('export');
            return;
        }

        // Imprimer
        if (this._match(cmd, ['imprimer', 'impression', 'imprime'])) {
            this.speak('Lancement de l\'impression.');
            setTimeout(() => window.print(), 1500);
            this._exitCommandMode();
            return;
        }

        // Aide
        if (this._match(cmd, ['aide', 'help', 'commandes'])) {
            this.speak('Commandes disponibles : temperature, cuisson, refroidissement, remise en temperature, nettoyage, reception, inventaire, alerte, huile de friture, etiquette, plat temoin. Navigation : tableau de bord, agents, calendrier, menus, allergenes, tracabilite, protocoles, journal, audit et controle, simulateur, recettes, fournisseurs, formation, centre de formation, tiac, rgpd, rappels produits, pai, agec, maintenance, analyse des risques, validation nettoyage, separation cru cuit, douches vestiaires, archivage dlc, configuration. Actions : genere un menu, lance une simulation, exporter, imprimer, ou annuler.');
            return;
        }

        // Annuler
        if (this._match(cmd, ['annuler', 'annule', 'stop', 'arrête', 'fermer'])) {
            this.speak('D\'accord, commande annulée.');
            this._exitCommandMode();
            return;
        }

        // Non reconnu
        this.speak('Je n\'ai pas compris. Dites aide pour la liste des commandes. Exemples : temperature, cuisson, nettoyage, recettes, fournisseurs, genere un menu, lance une simulation, exporter.');
    },

    _match(text, keywords) {
        return keywords.some(k => text.includes(k));
    },

    // --- Synthèse vocale ---
    speak(text) {
        return new Promise((resolve) => {
            this.synthesis.cancel();
            this.isSpeaking = true;
            // Pause recognition while speaking to avoid echo
            this._stopListening();
            this._updateUI();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.volume = 1;
            if (this.voiceFR) utterance.voice = this.voiceFR;

            utterance.onend = () => {
                this.isSpeaking = false;
                this._updateUI();
                // Restart listening after speaking
                if (this.isActive) {
                    setTimeout(() => this._startListening(), 300);
                }
                resolve();
            };

            utterance.onerror = () => {
                this.isSpeaking = false;
                if (this.isActive) this._startListening();
                resolve();
            };

            this.synthesis.speak(utterance);
            this._addConversationMessage(text, 'assistant');
        });
    },

    // --- Flux conversationnels ---
    _startFlow(flowName) {
        this.currentFlow = flowName;
        this.flowStep = 0;
        this.flowData = {};
        this._showConversation();

        switch (flowName) {
            case 'temperature': this._flowTemperature(); break;
            case 'nettoyage': this._flowNettoyage(); break;
            case 'reception': this._flowReception(); break;
            case 'inventaire': this._flowInventaire(); break;
            case 'alerte': this._flowAlerte(); break;
            case 'export': this._flowExport(); break;
            case 'ccp_cuisson': this._flowCCPCuisson(); break;
            case 'ccp_refroidissement': this._flowCCPRefroidissement(); break;
            case 'ccp_remise_temp': this._flowCCPRemiseTemp(); break;
            case 'huile': this._flowHuile(); break;
            case 'etiquette': this._flowEtiquette(); break;
            case 'plat_temoin': this._flowPlatTemoin(); break;
            case 'menu_generation': this._flowMenuGeneration(); break;
            case 'simulateur_launch': this._flowSimulateurLaunch(); break;
        }
    },

    // ---- FLUX TEMPÉRATURE ----
    async _flowTemperature() {
        const config = Storage.getConfig();
        const zones = config.zones_temperature;
        const zoneNames = zones.map(z => z.nom).join(', ');

        if (this.flowStep === 0) {
            await this.speak(`Relevé de température. Quelle zone ? Les zones disponibles sont : ${zoneNames}.`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Quelle température en degrés pour ${this.flowData.zone_nom} ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            const { zone_nom, valeur } = this.flowData;
            await this.speak(`J'ai compris : ${zone_nom}, ${valeur} degrés. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX NETTOYAGE ----
    async _flowNettoyage() {
        const config = Storage.getConfig();

        if (this.flowStep === 0) {
            const zonesDisp = config.zones_nettoyage.map(z => z.nom).join(', ');
            this.flowData.zones = [];
            await this.speak(`Enregistrement de nettoyage. Quelles zones avez-vous nettoyées ? Zones disponibles : ${zonesDisp}. Dites les zones une par une, puis dites terminé.`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            const produits = config.produits_nettoyage.join(', ');
            await this.speak(`Zones enregistrées : ${this.flowData.zones.join(', ')}. Quel produit avez-vous utilisé ? Produits disponibles : ${produits}.`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            const { zones, produit } = this.flowData;
            await this.speak(`Nettoyage de ${zones.join(', ')} avec ${produit}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX RÉCEPTION ----
    async _flowReception() {
        if (this.flowStep === 0) {
            await this.speak('Réception de marchandise. Quel est le nom du fournisseur ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Fournisseur : ${this.flowData.fournisseur}. Quel est le produit livré ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Produit : ${this.flowData.produit}. Quelle est la température du produit en degrés ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            await this.speak(`Le produit est-il conforme ? Emballage intact, DLC correcte, aspect normal ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 4) {
            const { fournisseur, produit, temperature, conforme } = this.flowData;
            const conf = conforme ? 'conforme' : 'non conforme';
            await this.speak(`Réception : ${fournisseur}, ${produit}, ${temperature} degrés, ${conf}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX INVENTAIRE ----
    async _flowInventaire() {
        if (this.flowStep === 0) {
            await this.speak('Inventaire. Quel est le nom du produit ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Produit : ${this.flowData.nom}. Quelle quantité ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            const config = Storage.getConfig();
            const unites = config.unites.join(', ');
            await this.speak(`Quantité : ${this.flowData.quantite}. Quelle unité ? ${unites}.`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            const { nom, quantite, unite } = this.flowData;
            await this.speak(`Inventaire : ${nom}, ${quantite} ${unite}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX ALERTE ----
    async _flowAlerte() {
        if (this.flowStep === 0) {
            await this.speak('Création d\'alerte. Décrivez le problème.');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Alerte : ${this.flowData.description}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX EXPORT ----
    async _flowExport() {
        if (this.flowStep === 0) {
            await this.speak('Quel rapport exporter ? Dites : temperatures, nettoyage, receptions, inventaire, allergenes, tracabilite, protocoles, menus, ou simulateur.');
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX CCP CUISSON ----
    async _flowCCPCuisson() {
        if (this.flowStep === 0) {
            await this.speak('Contrôle CCP cuisson. Quel est le nom du produit cuit ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Produit : ${this.flowData.produit}. Quelle est la température à cœur mesurée, en degrés ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Température : ${this.flowData.temperature} degrés. La limite critique est de 63 degrés. La cuisson est-elle conforme ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            if (!this.flowData.conforme) {
                await this.speak('Non conforme. Quelle action corrective avez-vous prise ? Par exemple : prolongé la cuisson, jeté le produit.');
                this.awaitingResponse = true;
            } else {
                // Skip corrective action
                this.flowStep = 4;
                this._flowCCPCuisson();
            }
        } else if (this.flowStep === 4) {
            const { produit, temperature, conforme, action_corrective } = this.flowData;
            const conf = conforme ? 'conforme' : 'non conforme';
            let summary = `CCP cuisson : ${produit}, ${temperature} degrés, ${conf}.`;
            if (action_corrective) summary += ` Action corrective : ${action_corrective}.`;
            summary += ' C\'est correct ?';
            await this.speak(summary);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX CCP REFROIDISSEMENT ----
    async _flowCCPRefroidissement() {
        if (this.flowStep === 0) {
            await this.speak('Contrôle CCP refroidissement rapide. Quel est le nom du produit ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Produit : ${this.flowData.produit}. Quelle est la température mesurée après refroidissement, en degrés ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Température : ${this.flowData.temperature} degrés. L'objectif est d'atteindre moins de 10 degrés en moins de 2 heures. Le refroidissement est-il conforme ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            if (!this.flowData.conforme) {
                await this.speak('Non conforme. Quelle action corrective ?');
                this.awaitingResponse = true;
            } else {
                this.flowStep = 4;
                this._flowCCPRefroidissement();
            }
        } else if (this.flowStep === 4) {
            const { produit, temperature, conforme, action_corrective } = this.flowData;
            const conf = conforme ? 'conforme' : 'non conforme';
            let summary = `CCP refroidissement : ${produit}, ${temperature} degrés, ${conf}.`;
            if (action_corrective) summary += ` Action corrective : ${action_corrective}.`;
            summary += ' C\'est correct ?';
            await this.speak(summary);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX CCP REMISE EN TEMPÉRATURE ----
    async _flowCCPRemiseTemp() {
        if (this.flowStep === 0) {
            await this.speak('Contrôle CCP remise en température. Quel est le nom du produit ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Produit : ${this.flowData.produit}. Quelle température à cœur atteinte, en degrés ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Température : ${this.flowData.temperature} degrés. L'objectif est plus de 63 degrés en moins d'une heure. La remise en température est-elle conforme ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            if (!this.flowData.conforme) {
                await this.speak('Non conforme. Quelle action corrective ?');
                this.awaitingResponse = true;
            } else {
                this.flowStep = 4;
                this._flowCCPRemiseTemp();
            }
        } else if (this.flowStep === 4) {
            const { produit, temperature, conforme, action_corrective } = this.flowData;
            const conf = conforme ? 'conforme' : 'non conforme';
            let summary = `CCP remise en température : ${produit}, ${temperature} degrés, ${conf}.`;
            if (action_corrective) summary += ` Action corrective : ${action_corrective}.`;
            summary += ' C\'est correct ?';
            await this.speak(summary);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX HUILE DE FRITURE ----
    async _flowHuile() {
        if (this.flowStep === 0) {
            await this.speak('Contrôle huile de friture. Quel est le nom ou numéro de la friteuse ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Friteuse : ${this.flowData.friteuse}. Quel est le taux de composés polaires mesuré, en pourcentage ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Taux : ${this.flowData.taux_polaire} pour cent. ${this.flowData.taux_polaire > 25 ? 'Attention, le seuil réglementaire de 25 pour cent est dépassé ! ' : ''}Avez-vous changé l'huile ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            const { friteuse, taux_polaire, huile_changee } = this.flowData;
            const change = huile_changee ? 'huile changée' : 'huile non changée';
            await this.speak(`Contrôle huile : friteuse ${friteuse}, ${taux_polaire} pour cent, ${change}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX ÉTIQUETTE DÉCONDITIONEMENT ----
    async _flowEtiquette() {
        if (this.flowStep === 0) {
            await this.speak('Création d\'étiquette de déconditionement. Quel est le nom du produit ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Produit : ${this.flowData.produit}. Quelle est l'origine ou le fournisseur ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak(`Origine : ${this.flowData.origine}. Quelle est la température de conservation en degrés ?`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            // Auto-calculate DLC J+3
            const today = new Date();
            const dlc = new Date(today);
            dlc.setDate(dlc.getDate() + 3);
            const dlcStr = dlc.toISOString().split('T')[0];
            this.flowData.dlc_secondaire = dlcStr;
            this.flowData.date_ouverture = Storage.today();

            await this.speak(`Étiquette : ${this.flowData.produit}, origine ${this.flowData.origine}, ${this.flowData.temperature_conservation} degrés, DLC secondaire J+3 soit le ${dlc.getDate()} ${['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][dlc.getMonth()]}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX PLAT TÉMOIN ----
    async _flowPlatTemoin() {
        if (this.flowStep === 0) {
            await this.speak('Enregistrement d\'un plat témoin. Quel est le nom du plat servi ?');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak(`Plat : ${this.flowData.plat}. Pour quel service ? Dites midi ou soir.`);
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            const { plat, service } = this.flowData;
            this.flowData.date_service = Storage.today();
            // Conservation 5 jours
            const dateConserv = new Date();
            dateConserv.setDate(dateConserv.getDate() + 5);
            this.flowData.date_conservation = dateConserv.toISOString().split('T')[0];

            await this.speak(`Plat témoin : ${plat}, service ${service}, conservation 5 jours. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX GENERATION DE MENU ----
    async _flowMenuGeneration() {
        if (this.flowStep === 0) {
            await this.speak('Generation de menu. Pour combien de semaines ? Dites un nombre : 1, 2, 3, 4, 8, 12 ou 36 pour une annee complete.');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            await this.speak('Quel theme souhaitez-vous ? Classique, automne, hiver, printemps, ete, noel, paques, halloween, fete, chandeleur, semaine du gout, ou cuisines du monde.');
            this.awaitingResponse = true;
        } else if (this.flowStep === 2) {
            await this.speak('Pour quel type d\'etablissement ? Ecole primaire, college, lycee, creche, ou EHPAD.');
            this.awaitingResponse = true;
        } else if (this.flowStep === 3) {
            const { nbSemaines, themeNom, collectiviteNom } = this.flowData;
            await this.speak(`Je vais generer un menu ${themeNom} pour ${nbSemaines} semaines, etablissement ${collectiviteNom}. C'est correct ?`);
            this.awaitingResponse = true;
        }
    },

    // ---- FLUX LANCEMENT SIMULATION ----
    async _flowSimulateurLaunch() {
        if (this.flowStep === 0) {
            await this.speak('Lancement d\'un audit de controle sanitaire. Quel mode souhaitez-vous ? Dites manuel pour repondre vous-meme aux questions, ou simulation pour un audit automatique aleatoire.');
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            const modeNom = this.flowData.mode === 'manuel' ? 'manuel' : 'simulation automatique';
            await this.speak(`Audit en mode ${modeNom}. On lance ? Dites oui pour confirmer.`);
            this.awaitingResponse = true;
        }
    },

    // --- Traitement des réponses dans les flux ---
    _handleFlowResponse(text) {
        this.awaitingResponse = false;
        const cmd = text.toLowerCase().trim();
        this._addConversationMessage(text, 'user');

        // Annulation globale
        if (this._match(cmd, ['annuler', 'annule', 'stop'])) {
            this.speak('Annulé.');
            this._exitCommandMode();
            return;
        }

        switch (this.currentFlow) {
            case 'temperature': this._handleTempResponse(cmd, text); break;
            case 'nettoyage': this._handleNettoyageResponse(cmd, text); break;
            case 'reception': this._handleReceptionResponse(cmd, text); break;
            case 'inventaire': this._handleInventaireResponse(cmd, text); break;
            case 'alerte': this._handleAlerteResponse(cmd, text); break;
            case 'export': this._handleExportResponse(cmd, text); break;
            case 'ccp_cuisson': this._handleCCPCuissonResponse(cmd, text); break;
            case 'ccp_refroidissement': this._handleCCPRefroidissementResponse(cmd, text); break;
            case 'ccp_remise_temp': this._handleCCPRemiseTempResponse(cmd, text); break;
            case 'huile': this._handleHuileResponse(cmd, text); break;
            case 'etiquette': this._handleEtiquetteResponse(cmd, text); break;
            case 'plat_temoin': this._handlePlatTemoinResponse(cmd, text); break;
            case 'menu_generation': this._handleMenuGenerationResponse(cmd, text); break;
            case 'simulateur_launch': this._handleSimulateurLaunchResponse(cmd, text); break;
        }
    },

    // --- Réponses Température ---
    _handleTempResponse(cmd, text) {
        const config = Storage.getConfig();

        if (this.flowStep === 0) {
            // Chercher la zone
            const zone = this._findZone(cmd, config.zones_temperature);
            if (zone) {
                this.flowData.zone_id = zone.id;
                this.flowData.zone_nom = zone.nom;
                this.flowData.zone_min = zone.min;
                this.flowData.zone_max = zone.max;
                this.flowStep = 1;
                this._flowTemperature();
            } else {
                this.speak('Je n\'ai pas reconnu cette zone. Répétez s\'il vous plaît.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 1) {
            // Chercher le nombre
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.valeur = num;
                this.flowStep = 2;
                this._flowTemperature();
            } else {
                this.speak('Je n\'ai pas compris la température. Dites un nombre, par exemple 3 degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            // Confirmation
            if (this._isYes(cmd)) {
                const entry = Storage.addTemperature({
                    zone_id: this.flowData.zone_id,
                    zone_nom: this.flowData.zone_nom,
                    valeur: this.flowData.valeur
                });
                const status = UI.temperatureStatus(this.flowData.valeur, this.flowData.zone_min, this.flowData.zone_max);

                // Alerte auto si hors limites
                if (status.status !== 'ok') {
                    Storage.addAlerte({
                        type: 'temperature',
                        niveau: status.status === 'danger' ? 'critique' : 'attention',
                        titre: `Température ${status.label}: ${this.flowData.zone_nom}`,
                        description: `${this.flowData.valeur}°C (limites: ${this.flowData.zone_min}°C à ${this.flowData.zone_max}°C)`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`Température enregistrée ! ${this.flowData.zone_nom}: ${this.flowData.valeur}°C — ${status.label}`, 'success');
                this.speak(`Température enregistrée. ${this.flowData.zone_nom}, ${this.flowData.valeur} degrés. ${status.label}.`);

                // Rafraîchir si on est sur la page
                if (App.currentPage === 'temperatures') Temperatures.render();
                if (App.currentPage === 'dashboard') Dashboard.render();

                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('D\'accord, on recommence. Quelle zone ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Nettoyage ---
    _handleNettoyageResponse(cmd, text) {
        const config = Storage.getConfig();

        if (this.flowStep === 0) {
            // Terminé ?
            if (this._match(cmd, ['terminé', 'termine', 'fini', 'c\'est tout', 'c\'est bon'])) {
                if (this.flowData.zones.length === 0) {
                    this.speak('Aucune zone sélectionnée. Dites le nom d\'une zone.');
                    this.awaitingResponse = true;
                    return;
                }
                this.flowStep = 1;
                this._flowNettoyage();
                return;
            }

            // Chercher les zones mentionnées
            const found = [];
            for (const zone of config.zones_nettoyage) {
                if (this._fuzzyMatch(cmd, zone.nom)) {
                    if (!this.flowData.zones.includes(zone.nom)) {
                        this.flowData.zones.push(zone.nom);
                        found.push(zone.nom);
                    }
                }
            }

            if (found.length > 0) {
                this.speak(`Ajouté : ${found.join(', ')}. Continuez ou dites terminé.`);
            } else {
                this.speak('Zone non reconnue. Répétez ou dites terminé.');
            }
            this.awaitingResponse = true;
        } else if (this.flowStep === 1) {
            // Produit
            const produit = this._findInList(cmd, config.produits_nettoyage);
            if (produit) {
                this.flowData.produit = produit;
                this.flowStep = 2;
                this._flowNettoyage();
            } else {
                this.flowData.produit = text;
                this.flowStep = 2;
                this._flowNettoyage();
            }
        } else if (this.flowStep === 2) {
            if (this._isYes(cmd)) {
                Storage.addNettoyage({
                    zones: this.flowData.zones,
                    produit: this.flowData.produit
                });
                this._addConversationMessage(`Nettoyage enregistré ! ${this.flowData.zones.join(', ')} avec ${this.flowData.produit}`, 'success');
                this.speak(`Nettoyage enregistré. ${this.flowData.zones.join(', ')} avec ${this.flowData.produit}.`);
                if (App.currentPage === 'nettoyage') Nettoyage.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quelles zones ?');
                this.flowStep = 0;
                this.flowData = { zones: [] };
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Réception ---
    _handleReceptionResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.fournisseur = text;
            this.flowStep = 1;
            this._flowReception();
        } else if (this.flowStep === 1) {
            this.flowData.produit = text;
            this.flowStep = 2;
            this._flowReception();
        } else if (this.flowStep === 2) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.temperature = num;
                this.flowStep = 3;
                this._flowReception();
            } else {
                this.speak('Dites la température en degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 3) {
            this.flowData.conforme = this._isYes(cmd);
            this.flowStep = 4;
            this._flowReception();
        } else if (this.flowStep === 4) {
            if (this._isYes(cmd)) {
                Storage.addReception({
                    fournisseur: this.flowData.fournisseur,
                    produit: this.flowData.produit,
                    temperature: this.flowData.temperature,
                    conforme: this.flowData.conforme
                });

                if (!this.flowData.conforme) {
                    Storage.addAlerte({
                        type: 'reception',
                        niveau: 'critique',
                        titre: `Réception non conforme: ${this.flowData.produit}`,
                        description: `Fournisseur: ${this.flowData.fournisseur}, Temp: ${this.flowData.temperature}°C`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`Réception enregistrée ! ${this.flowData.fournisseur} — ${this.flowData.produit}`, 'success');
                this.speak('Réception enregistrée.');
                if (App.currentPage === 'receptions') Receptions.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel fournisseur ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Inventaire ---
    _handleInventaireResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.nom = text;
            this.flowStep = 1;
            this._flowInventaire();
        } else if (this.flowStep === 1) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.quantite = num;
                this.flowStep = 2;
                this._flowInventaire();
            } else {
                this.speak('Dites un nombre pour la quantité.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            const config = Storage.getConfig();
            const unite = this._findInList(cmd, config.unites);
            this.flowData.unite = unite || text;
            this.flowStep = 3;
            this._flowInventaire();
        } else if (this.flowStep === 3) {
            if (this._isYes(cmd)) {
                Storage.addInventaireItem({
                    nom: this.flowData.nom,
                    quantite: this.flowData.quantite,
                    unite: this.flowData.unite,
                    categorie: 'Non classé'
                });
                this._addConversationMessage(`Inventaire : ${this.flowData.nom} — ${this.flowData.quantite} ${this.flowData.unite}`, 'success');
                this.speak(`Ajouté à l'inventaire. ${this.flowData.nom}, ${this.flowData.quantite} ${this.flowData.unite}.`);
                if (App.currentPage === 'inventaire') Inventaire.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel produit ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Alerte ---
    _handleAlerteResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.description = text;
            this.flowStep = 1;
            this._flowAlerte();
        } else if (this.flowStep === 1) {
            if (this._isYes(cmd)) {
                Storage.addAlerte({
                    type: 'manuelle',
                    niveau: 'attention',
                    titre: this.flowData.description,
                    description: 'Alerte créée vocalement'
                });
                UI.updateAlertBadge();
                this._addConversationMessage(`Alerte créée : ${this.flowData.description}`, 'success');
                this.speak('Alerte enregistrée.');
                if (App.currentPage === 'alertes') Alertes.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('Décrivez à nouveau le problème.');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Export ---
    _handleExportResponse(cmd, text) {
        if (this.flowStep === 0) {
            let type = null;
            if (this._match(cmd, ['température', 'températures', 'temp'])) type = 'temperatures';
            else if (this._match(cmd, ['nettoyage'])) type = 'nettoyage';
            else if (this._match(cmd, ['réception', 'reception'])) type = 'receptions';
            else if (this._match(cmd, ['inventaire'])) type = 'inventaire';
            else if (this._match(cmd, ['allergène', 'allergene', 'allergènes', 'allergenes'])) type = 'allergenes';
            else if (this._match(cmd, ['traçabilité', 'tracabilite', 'tracabilité'])) type = 'tracabilite';
            else if (this._match(cmd, ['protocole', 'protocoles', 'haccp'])) type = 'protocoles';
            else if (this._match(cmd, ['journal'])) type = 'journal';
            else if (this._match(cmd, ['simulateur', 'simulation', 'ddpp'])) type = 'simulateur';

            if (this._match(cmd, ['menu', 'menus'])) type = 'menus';

            if (type) {
                this.speak(`Export ${type} en cours.`);
                setTimeout(() => PDF.export(type), 500);
                this._exitCommandMode();
            } else {
                this.speak('Dites : temperatures, nettoyage, receptions, inventaire, allergenes, tracabilite, protocoles, menus, simulateur, ou journal.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses CCP Cuisson ---
    _handleCCPCuissonResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.produit = text;
            this.flowStep = 1;
            this._flowCCPCuisson();
        } else if (this.flowStep === 1) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.temperature = num;
                this.flowStep = 2;
                this._flowCCPCuisson();
            } else {
                this.speak('Dites la température en degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            this.flowData.conforme = this._isYes(cmd);
            this.flowStep = 3;
            this._flowCCPCuisson();
        } else if (this.flowStep === 3) {
            // Action corrective (only if non-conforme)
            this.flowData.action_corrective = text;
            this.flowStep = 4;
            this._flowCCPCuisson();
        } else if (this.flowStep === 4) {
            if (this._isYes(cmd)) {
                const entry = {
                    type: 'cuisson',
                    produit: this.flowData.produit,
                    temperature: this.flowData.temperature,
                    limite_critique: 63,
                    conforme: this.flowData.conforme,
                    action_corrective: this.flowData.action_corrective || ''
                };
                Storage.addCCPRecord(entry);

                if (!this.flowData.conforme) {
                    Storage.addAlerte({
                        type: 'temperature',
                        niveau: 'critique',
                        titre: `CCP Cuisson non conforme: ${this.flowData.produit}`,
                        description: `${this.flowData.temperature}°C (limite: ≥63°C). Action: ${this.flowData.action_corrective || 'aucune'}`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`CCP Cuisson enregistré ! ${this.flowData.produit}: ${this.flowData.temperature}°C`, 'success');
                this.speak(`CCP cuisson enregistré. ${this.flowData.produit}, ${this.flowData.temperature} degrés.`);
                if (App.currentPage === 'temperatures') Temperatures.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel produit ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses CCP Refroidissement ---
    _handleCCPRefroidissementResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.produit = text;
            this.flowStep = 1;
            this._flowCCPRefroidissement();
        } else if (this.flowStep === 1) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.temperature = num;
                this.flowStep = 2;
                this._flowCCPRefroidissement();
            } else {
                this.speak('Dites la température en degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            this.flowData.conforme = this._isYes(cmd);
            this.flowStep = 3;
            this._flowCCPRefroidissement();
        } else if (this.flowStep === 3) {
            this.flowData.action_corrective = text;
            this.flowStep = 4;
            this._flowCCPRefroidissement();
        } else if (this.flowStep === 4) {
            if (this._isYes(cmd)) {
                const entry = {
                    type: 'refroidissement',
                    produit: this.flowData.produit,
                    temperature: this.flowData.temperature,
                    limite_critique: 10,
                    conforme: this.flowData.conforme,
                    action_corrective: this.flowData.action_corrective || ''
                };
                Storage.addCCPRecord(entry);

                if (!this.flowData.conforme) {
                    Storage.addAlerte({
                        type: 'temperature',
                        niveau: 'critique',
                        titre: `CCP Refroidissement non conforme: ${this.flowData.produit}`,
                        description: `${this.flowData.temperature}°C (limite: <10°C en <2h). Action: ${this.flowData.action_corrective || 'aucune'}`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`CCP Refroidissement enregistré ! ${this.flowData.produit}: ${this.flowData.temperature}°C`, 'success');
                this.speak(`CCP refroidissement enregistré. ${this.flowData.produit}, ${this.flowData.temperature} degrés.`);
                if (App.currentPage === 'temperatures') Temperatures.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel produit ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses CCP Remise en Température ---
    _handleCCPRemiseTempResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.produit = text;
            this.flowStep = 1;
            this._flowCCPRemiseTemp();
        } else if (this.flowStep === 1) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.temperature = num;
                this.flowStep = 2;
                this._flowCCPRemiseTemp();
            } else {
                this.speak('Dites la température en degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            this.flowData.conforme = this._isYes(cmd);
            this.flowStep = 3;
            this._flowCCPRemiseTemp();
        } else if (this.flowStep === 3) {
            this.flowData.action_corrective = text;
            this.flowStep = 4;
            this._flowCCPRemiseTemp();
        } else if (this.flowStep === 4) {
            if (this._isYes(cmd)) {
                const entry = {
                    type: 'remise_temp',
                    produit: this.flowData.produit,
                    temperature: this.flowData.temperature,
                    limite_critique: 63,
                    conforme: this.flowData.conforme,
                    action_corrective: this.flowData.action_corrective || ''
                };
                Storage.addCCPRecord(entry);

                if (!this.flowData.conforme) {
                    Storage.addAlerte({
                        type: 'temperature',
                        niveau: 'critique',
                        titre: `CCP Remise en temp. non conforme: ${this.flowData.produit}`,
                        description: `${this.flowData.temperature}°C (limite: >63°C en <1h). Action: ${this.flowData.action_corrective || 'aucune'}`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`CCP Remise en température enregistré ! ${this.flowData.produit}: ${this.flowData.temperature}°C`, 'success');
                this.speak(`CCP remise en température enregistré. ${this.flowData.produit}, ${this.flowData.temperature} degrés.`);
                if (App.currentPage === 'temperatures') Temperatures.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel produit ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Huile de Friture ---
    _handleHuileResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.friteuse = text;
            this.flowStep = 1;
            this._flowHuile();
        } else if (this.flowStep === 1) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.taux_polaire = num;
                this.flowStep = 2;
                this._flowHuile();
            } else {
                this.speak('Dites le taux de composés polaires en pourcentage. Par exemple, 20 pour cent.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            this.flowData.huile_changee = this._isYes(cmd);
            this.flowStep = 3;
            this._flowHuile();
        } else if (this.flowStep === 3) {
            if (this._isYes(cmd)) {
                const controle = {
                    friteuse: this.flowData.friteuse,
                    taux_polaire: this.flowData.taux_polaire,
                    huile_changee: this.flowData.huile_changee,
                    conforme: this.flowData.taux_polaire <= 25
                };
                Storage.addControleHuile(controle);

                if (this.flowData.taux_polaire > 25) {
                    Storage.addAlerte({
                        type: 'manuelle',
                        niveau: 'critique',
                        titre: `Huile friture non conforme: ${this.flowData.friteuse}`,
                        description: `Taux de composés polaires: ${this.flowData.taux_polaire}% (seuil: 25%). ${this.flowData.huile_changee ? 'Huile changée.' : 'HUILE NON CHANGÉE !'}`
                    });
                    UI.updateAlertBadge();
                }

                this._addConversationMessage(`Contrôle huile enregistré ! ${this.flowData.friteuse}: ${this.flowData.taux_polaire}%`, 'success');
                this.speak(`Contrôle huile enregistré. Friteuse ${this.flowData.friteuse}, ${this.flowData.taux_polaire} pour cent.`);
                if (App.currentPage === 'protocoles') Protocoles.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quelle friteuse ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Étiquette Déconditionement ---
    _handleEtiquetteResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.produit = text;
            this.flowStep = 1;
            this._flowEtiquette();
        } else if (this.flowStep === 1) {
            this.flowData.origine = text;
            this.flowStep = 2;
            this._flowEtiquette();
        } else if (this.flowStep === 2) {
            const num = this._extractNumber(cmd);
            if (num !== null) {
                this.flowData.temperature_conservation = num;
                this.flowStep = 3;
                this._flowEtiquette();
            } else {
                this.speak('Dites la température de conservation en degrés.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 3) {
            if (this._isYes(cmd)) {
                const etiquette = {
                    produit: this.flowData.produit,
                    origine: this.flowData.origine,
                    date_ouverture: this.flowData.date_ouverture,
                    dlc_secondaire: this.flowData.dlc_secondaire,
                    temperature_conservation: this.flowData.temperature_conservation
                };
                Storage.addEtiquette(etiquette);

                this._addConversationMessage(`Étiquette créée ! ${this.flowData.produit} — DLC: ${this.flowData.dlc_secondaire}`, 'success');
                this.speak(`Étiquette créée. ${this.flowData.produit}, DLC secondaire J plus 3.`);
                if (App.currentPage === 'tracabilite') Tracabilite.render();
                if (App.currentPage === 'dashboard') Dashboard.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel produit ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Plat Témoin ---
    _handlePlatTemoinResponse(cmd, text) {
        if (this.flowStep === 0) {
            this.flowData.plat = text;
            this.flowStep = 1;
            this._flowPlatTemoin();
        } else if (this.flowStep === 1) {
            if (this._match(cmd, ['midi', 'déjeuner', 'dejeuner', 'matin'])) {
                this.flowData.service = 'midi';
            } else if (this._match(cmd, ['soir', 'dîner', 'diner', 'souper'])) {
                this.flowData.service = 'soir';
            } else {
                this.flowData.service = text;
            }
            this.flowStep = 2;
            this._flowPlatTemoin();
        } else if (this.flowStep === 2) {
            if (this._isYes(cmd)) {
                const temoin = {
                    plat: this.flowData.plat,
                    service: this.flowData.service,
                    date_service: this.flowData.date_service,
                    date_conservation: this.flowData.date_conservation,
                    temperature_stockage: 3
                };
                Storage.addPlatTemoin(temoin);

                this._addConversationMessage(`Plat témoin enregistré ! ${this.flowData.plat} — service ${this.flowData.service}`, 'success');
                this.speak(`Plat témoin enregistré. ${this.flowData.plat}, service ${this.flowData.service}. Conservation 5 jours.`);
                if (App.currentPage === 'tracabilite') Tracabilite.render();
                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Quel plat ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Génération de Menu ---
    _handleMenuGenerationResponse(cmd, text) {
        if (this.flowStep === 0) {
            // Nombre de semaines
            let nb = null;
            if (this._match(cmd, ['une semaine', '1 semaine', 'une'])) nb = 1;
            else if (this._match(cmd, ['deux semaines', '2 semaines', 'deux'])) nb = 2;
            else if (this._match(cmd, ['trois semaines', '3 semaines', 'trois'])) nb = 3;
            else if (this._match(cmd, ['quatre semaines', '4 semaines', 'quatre'])) nb = 4;
            else if (this._match(cmd, ['huit semaines', '8 semaines', 'huit'])) nb = 8;
            else if (this._match(cmd, ['douze semaines', '12 semaines', 'douze'])) nb = 12;
            else if (this._match(cmd, ['trente-six', 'trente six', '36 semaines', '36', 'année', 'annee', 'année complète', 'annee complete'])) nb = 36;
            else {
                const num = this._extractNumber(cmd);
                if (num && [1,2,3,4,8,12,36].includes(num)) nb = num;
            }

            if (nb) {
                this.flowData.nbSemaines = nb;
                this.flowStep = 1;
                this._flowMenuGeneration();
            } else {
                this.speak('Je n\'ai pas compris. Dites 1, 2, 3, 4, 8, 12 ou 36 semaines.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 1) {
            // Thème
            let themeId = null;
            let themeNom = null;
            if (this._match(cmd, ['classique', 'normal', 'standard'])) { themeId = 'classique'; themeNom = 'classique'; }
            else if (this._match(cmd, ['automne'])) { themeId = 'automne'; themeNom = 'automne'; }
            else if (this._match(cmd, ['hiver'])) { themeId = 'hiver'; themeNom = 'hiver'; }
            else if (this._match(cmd, ['printemps'])) { themeId = 'printemps'; themeNom = 'printemps'; }
            else if (this._match(cmd, ['été', 'ete'])) { themeId = 'ete'; themeNom = 'ete'; }
            else if (this._match(cmd, ['noël', 'noel'])) { themeId = 'noel'; themeNom = 'Noel'; }
            else if (this._match(cmd, ['pâques', 'paques'])) { themeId = 'paques'; themeNom = 'Paques'; }
            else if (this._match(cmd, ['halloween'])) { themeId = 'halloween'; themeNom = 'Halloween'; }
            else if (this._match(cmd, ['fête', 'fete', 'enfants'])) { themeId = 'fete'; themeNom = 'Fete des enfants'; }
            else if (this._match(cmd, ['chandeleur', 'crêpes', 'crepes'])) { themeId = 'chandeleur'; themeNom = 'Chandeleur'; }
            else if (this._match(cmd, ['goût', 'gout', 'semaine du goût', 'semaine du gout'])) { themeId = 'semaine_gout'; themeNom = 'Semaine du Gout'; }
            else if (this._match(cmd, ['monde', 'international', 'cuisines du monde'])) { themeId = 'monde'; themeNom = 'Cuisines du Monde'; }

            if (themeId) {
                this.flowData.themeId = themeId;
                this.flowData.themeNom = themeNom;
                this.flowStep = 2;
                this._flowMenuGeneration();
            } else {
                this.speak('Theme non reconnu. Dites : classique, automne, hiver, printemps, ete, noel, paques, halloween, fete, chandeleur, semaine du gout, ou cuisines du monde.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 2) {
            // Collectivité
            let collectiviteId = null;
            let collectiviteNom = null;
            if (this._match(cmd, ['école', 'ecole', 'primaire', 'école primaire', 'ecole primaire'])) { collectiviteId = 'ecole'; collectiviteNom = 'Ecole Primaire'; }
            else if (this._match(cmd, ['collège', 'college'])) { collectiviteId = 'college'; collectiviteNom = 'College'; }
            else if (this._match(cmd, ['lycée', 'lycee'])) { collectiviteId = 'lycee'; collectiviteNom = 'Lycee'; }
            else if (this._match(cmd, ['crèche', 'creche'])) { collectiviteId = 'creche'; collectiviteNom = 'Creche'; }
            else if (this._match(cmd, ['ehpad', 'maison de retraite', 'personnes âgées', 'personnes agees'])) { collectiviteId = 'ehpad'; collectiviteNom = 'EHPAD'; }

            if (collectiviteId) {
                this.flowData.collectiviteId = collectiviteId;
                this.flowData.collectiviteNom = collectiviteNom;
                this.flowStep = 3;
                this._flowMenuGeneration();
            } else {
                this.speak('Etablissement non reconnu. Dites : ecole primaire, college, lycee, creche, ou EHPAD.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 3) {
            // Confirmation
            if (this._isYes(cmd)) {
                // Naviguer vers la page menus et générer
                App.navigate('menus');
                this.speak('Generation des menus en cours.');

                // Laisser le temps au render, puis injecter les valeurs dans le modal et générer
                setTimeout(() => {
                    Menus.showGenerateModal();
                    setTimeout(() => {
                        const selCollectivite = document.getElementById('menu-collectivite');
                        const selTheme = document.getElementById('menu-theme');
                        const selSemaines = document.getElementById('menu-nb-semaines');
                        if (selCollectivite) selCollectivite.value = this.flowData.collectiviteId;
                        if (selTheme) selTheme.value = this.flowData.themeId;
                        if (selSemaines) selSemaines.value = this.flowData.nbSemaines;
                        Menus.generateMenus();
                        this._addConversationMessage('Menus generes avec succes !', 'success');
                    }, 300);
                }, 500);

                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('On recommence. Pour combien de semaines ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour recommencer.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Réponses Lancement Simulation ---
    _handleSimulateurLaunchResponse(cmd, text) {
        if (this.flowStep === 0) {
            // Mode
            if (this._match(cmd, ['manuel', 'manuellement', 'moi-même', 'moi même', 'moi meme', 'je réponds', 'je reponds'])) {
                this.flowData.mode = 'manuel';
                this.flowStep = 1;
                this._flowSimulateurLaunch();
            } else if (this._match(cmd, ['simulation', 'simuler', 'automatique', 'aléatoire', 'aleatoire', 'auto'])) {
                this.flowData.mode = 'simulation';
                this.flowStep = 1;
                this._flowSimulateurLaunch();
            } else {
                this.speak('Dites manuel pour repondre vous-meme, ou simulation pour un audit automatique.');
                this.awaitingResponse = true;
            }
        } else if (this.flowStep === 1) {
            // Confirmation
            if (this._isYes(cmd)) {
                const mode = this.flowData.mode;
                App.navigate('simulateur');
                this.speak(mode === 'manuel' ? 'Audit lance en mode manuel. Repondez aux questions a l\'ecran.' : 'Audit lance en mode simulation. Les reponses sont generees automatiquement.');

                setTimeout(() => {
                    Simulateur.startAudit(mode);
                }, 500);

                this._exitCommandMode();
            } else if (this._isNo(cmd)) {
                this.speak('D\'accord. Quel mode souhaitez-vous ? Manuel ou simulation ?');
                this.flowStep = 0;
                this.flowData = {};
                this.awaitingResponse = true;
            } else {
                this.speak('Dites oui pour confirmer ou non pour changer de mode.');
                this.awaitingResponse = true;
            }
        }
    },

    // --- Helpers ---
    _isYes(text) {
        return this._match(text, ['oui', 'yes', 'ok', 'correct', 'exactement', 'c\'est ça', 'c\'est bon', 'confirme', 'parfait', 'valide']);
    },

    _isNo(text) {
        return this._match(text, ['non', 'no', 'pas correct', 'incorrect', 'faux', 'erreur', 'corrige', 'corriger', 'recommence']);
    },

    _extractNumber(text) {
        // Gérer les nombres en lettres courantes
        const wordMap = {
            'zéro': 0, 'zero': 0, 'un': 1, 'une': 1, 'deux': 2, 'trois': 3,
            'quatre': 4, 'cinq': 5, 'six': 6, 'sept': 7, 'huit': 8, 'neuf': 9,
            'dix': 10, 'onze': 11, 'douze': 12, 'treize': 13, 'quatorze': 14,
            'quinze': 15, 'seize': 16, 'vingt': 20, 'trente': 30, 'quarante': 40,
            'cinquante': 50, 'soixante': 60, 'cent': 100,
            'moins un': -1, 'moins deux': -2, 'moins trois': -3, 'moins quatre': -4,
            'moins cinq': -5, 'moins dix': -10, 'moins quinze': -15,
            'moins dix-huit': -18, 'moins vingt': -20, 'moins vingt-cinq': -25
        };

        // Vérifier les mots d'abord
        for (const [word, num] of Object.entries(wordMap)) {
            if (text.includes(word)) return num;
        }

        // Chercher un nombre dans le texte
        const match = text.match(/-?\d+([.,]\d+)?/);
        if (match) {
            return parseFloat(match[0].replace(',', '.'));
        }

        return null;
    },

    _findZone(text, zones) {
        // Correspondance exacte d'abord
        for (const zone of zones) {
            if (this._fuzzyMatch(text, zone.nom)) return zone;
        }
        // Correspondance partielle
        for (const zone of zones) {
            const words = zone.nom.toLowerCase().split(/\s+/);
            if (words.some(w => w.length > 3 && text.includes(w))) return zone;
        }
        return null;
    },

    _findInList(text, list) {
        for (const item of list) {
            if (this._fuzzyMatch(text, item)) return item;
        }
        for (const item of list) {
            const words = item.toLowerCase().split(/\s+/);
            if (words.some(w => w.length > 3 && text.includes(w))) return item;
        }
        return null;
    },

    _fuzzyMatch(text, target) {
        const t = target.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const s = text.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return s.includes(t) || t.includes(s);
    },

    // --- UI Updates ---
    _updateStatus(active) {
        const dot = document.querySelector('.voice-dot');
        const text = document.querySelector('.voice-text');
        const fab = document.getElementById('fab-mic');

        if (active) {
            dot.classList.add('active');
            text.textContent = 'Vocal ON';
            fab.classList.add('listening');
        } else {
            dot.classList.remove('active');
            text.textContent = 'Vocal OFF';
            fab.classList.remove('listening');
        }
    },

    _updateUI() {
        const indicator = document.getElementById('voice-listening');
        indicator.className = 'voice-listening';

        if (this.isSpeaking) {
            indicator.classList.add('speaking');
        } else if (this.isListening) {
            indicator.classList.add('listening');
        } else {
            indicator.classList.add('idle');
        }
    },

    _showPanel() {
        document.getElementById('voice-panel').classList.add('open');
    },

    _hidePanel() {
        document.getElementById('voice-panel').classList.remove('open');
    },

    _showCommands() {
        document.getElementById('voice-commands').style.display = 'block';
        document.getElementById('voice-conversation').style.display = 'none';
        document.getElementById('voice-transcript').innerHTML = 'Dites une commande ou touchez une option';
    },

    _showConversation() {
        document.getElementById('voice-commands').style.display = 'none';
        document.getElementById('voice-conversation').style.display = 'block';
        document.getElementById('conversation-messages').innerHTML = '';
    },

    _addConversationMessage(text, type) {
        const container = document.getElementById('conversation-messages');
        const msg = document.createElement('div');
        msg.className = `conv-msg ${type}`;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;

        // Also update transcript
        const transcript = document.getElementById('voice-transcript');
        if (type === 'user') {
            transcript.innerHTML = `Vous avez dit : <span class="heard">"${UI.escapeHTML(text)}"</span>`;
        } else if (type === 'assistant') {
            transcript.innerHTML = UI.escapeHTML(text);
        }
    },

    _exitCommandMode() {
        this.isCommandMode = false;
        this.currentFlow = null;
        this.flowStep = 0;
        this.flowData = {};
        this.awaitingResponse = false;

        // En mode always-on : fermer le panneau après 3s, retour en écoute wake word
        setTimeout(() => {
            if (this.isActive) {
                if (this.isAlwaysOn) {
                    this._hidePanel();
                } else {
                    document.getElementById('voice-transcript').innerHTML = 'Dites <strong>"OK Cuisine"</strong> pour une nouvelle commande';
                    this._showCommands();
                }
            }
        }, 3000);
    },

    // --- Trigger command from button click ---
    triggerCommand(command) {
        if (!this.isActive) this.activate();
        this.isCommandMode = true;
        this._showPanel();
        this._parseCommand(command);
    },

    // --- Cancel current flow ---
    cancel() {
        this.synthesis.cancel();
        this.isSpeaking = false;
        if (this.currentFlow) {
            this._addConversationMessage('Annulé.', 'error');
        }
        this._exitCommandMode();
    },

    // --- Fermer le panneau sans désactiver l'écoute ---
    closePanelOnly() {
        this._hidePanel();
        if (this.currentFlow) {
            this.cancel();
        }
        this.isCommandMode = false;
        // L'écoute continue en arrière-plan si always-on
    }
};
