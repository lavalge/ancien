/* ============================================================
   OK CUISINE — Application Controller
   Gestion de l'authentification, navigation, initialisation
   ============================================================ */

const App = {
    currentUser: null,
    currentPage: 'dashboard',
    pinBuffer: '',
    selectedUserId: null,
    pinAttempts: {},
    lockedUntil: {},
    idleTimeout: null,
    idleEventsBound: false,
    MAX_PIN_ATTEMPTS: 3,
    LOCKOUT_MS: 5 * 60 * 1000,
    IDLE_TIMEOUT_MS: 5 * 60 * 1000,

    // --- Initialisation ---
    init() {
        // Initialiser les modules existants
        Voice.init();
        Temperatures.init();
        Nettoyage.init();
        Receptions.init();
        Tracabilite.init();
        Journal.init();
        Menus.init();
        Audit.init();
        Simulateur.init();
        Recettes.init();
        Fournisseurs.init();
        CentreFormation.init();

        // Initialiser les nouveaux modules de conformité
        // (pas de init() requis pour la plupart, mais can add si nécessaire)
        // Formation.init(); // N/A
        // TIAC.init(); // N/A
        // etc.

        // Vérifier si une config existe
        const config = Storage.getConfig();
        if (!config.users || config.users.length === 0) {
            // Première utilisation, créer la config par défaut
            Storage.saveConfig(Storage.getDefaultConfig());
        }

        // Initialiser les recettes et fournisseurs par défaut
        Storage.initRecettesDefault();
        Storage.initFournisseursDefault();

        // Vérifier si un admin existe (sans auto-création)
        this._ensureAdminExists();

        // Afficher l'écran de connexion
        this._renderLoginUsers();

        // Préparer le suivi d'inactivité
        this._bindIdleEvents();

        // Enregistrer le service worker si possible
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    },

    // --- Login ---
    _ensureAdminExists() {
        const config = Storage.getConfig();
        if (!config.users) config.users = [];
        
        // Vérifier si admin existe
        const adminExists = config.users.some(u => u.id === 'admin');
        if (!adminExists && config.users.length > 0) {
            console.warn('⚠️ Aucun administrateur detecte. Creez un admin via la configuration.');
        }
    },

    _renderLoginUsers() {
        const users = Storage.getConfig().users;
        const container = document.getElementById('user-list');

        if (users.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Aucun utilisateur. <button class="btn btn-primary" onclick="App.showSetup()">Configurer</button></p>';
            return;
        }

        container.innerHTML = users.map(u => `
            <div class="user-list-item" onclick="App.selectUser('${u.id}')" tabindex="0">
                <div class="avatar">${UI.escapeHTML(u.initiales)}</div>
                <div class="user-info">
                    <div class="user-name">${UI.escapeHTML(u.nom)}</div>
                    <div class="user-role">${u.role === 'admin' ? 'Administrateur' : 'Employé'}</div>
                </div>
            </div>
        `).join('');
    },

    selectUser(userId) {
        this.selectedUserId = userId;
        this.pinBuffer = '';
        this._updatePinDots();
        document.getElementById('user-list').parentElement.querySelector('.user-list').style.display = 'none';
        document.getElementById('pin-section').style.display = 'block';

        const user = Storage.getConfig().users.find(u => u.id === userId);
        document.getElementById('pin-label').textContent = `Code PIN — ${user ? user.nom : ''}`;
    },

    backToUsers() {
        this.selectedUserId = null;
        this.pinBuffer = '';
        document.getElementById('user-list').style.display = 'flex';
        document.getElementById('pin-section').style.display = 'none';
        this._renderLoginUsers();
    },

    // Rediriger vers la configuration initiale si besoin
    resetAdmin() {
        UI.toast('Veuillez configurer un nouvel administrateur.', 'info');
        this.showSetup();
    },

    pinInput(digit) {
        if (this.pinBuffer.length >= 4) return;
        this.pinBuffer += digit;
        this._updatePinDots();

        if (this.pinBuffer.length === 4) {
            setTimeout(() => this.pinSubmit(), 200);
        }
    },

    pinClear() {
        this.pinBuffer = this.pinBuffer.slice(0, -1);
        this._updatePinDots();
    },

    pinSubmit() {
        const users = Storage.getConfig().users;
        const user = users.find(u => u.id === this.selectedUserId);
        const now = Date.now();

        if (!user) {
            UI.toast('Utilisateur introuvable', 'danger');
            return;
        }

        const lockUntil = this.lockedUntil[user.id];
        if (lockUntil && now < lockUntil) {
            const remainingMin = Math.ceil((lockUntil - now) / 60000);
            UI.toast(`Compte bloque. Reessayez dans ${remainingMin} min.`, 'warning');
            return;
        }

        // Comparer PIN hashé (nouveau format) ou plaintext (ancien format)
        const inputHash = Storage.hashPin(this.pinBuffer);
        const pinMatches = user.pinHash ? (inputHash === user.pinHash) : (user.pin === this.pinBuffer);
        
        if (pinMatches) {
            delete this.pinAttempts[user.id];
            delete this.lockedUntil[user.id];
            this.currentUser = user;
            this._login();
        } else {
            this._registerFailedPin(user.id);
            this.pinBuffer = '';
            this._updatePinDots();
            // Shake animation
            const pinDisplay = document.getElementById('pin-display');
            pinDisplay.style.animation = 'none';
            pinDisplay.offsetHeight;
            pinDisplay.style.animation = 'shake 0.3s ease';
        }
    },

    _registerFailedPin(userId) {
        const attempts = this.pinAttempts[userId] || { count: 0 };
        attempts.count += 1;
        this.pinAttempts[userId] = attempts;

        if (attempts.count >= this.MAX_PIN_ATTEMPTS) {
            this.lockedUntil[userId] = Date.now() + this.LOCKOUT_MS;
            attempts.count = 0;
            UI.toast(`Trop de tentatives. Compte bloque ${Math.ceil(this.LOCKOUT_MS / 60000)} min.`, 'danger');
            return;
        }

        UI.toast('Code PIN incorrect', 'danger');
    },

    _updatePinDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.pinBuffer.length);
        });
    },

    _login() {
        // Log connexion
        Journal.log('connexion', `Connexion de ${this.currentUser.nom}`);

        // Switch screens
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');

        // Update user badge
        document.getElementById('user-avatar').textContent = this.currentUser.initiales;

        // Navigate to dashboard
        this.navigate('dashboard');
        UI.updateAlertBadge();
        UI.updateSidebarInfo();

        UI.toast(`Bienvenue, ${this.currentUser.nom} !`, 'success');

        // Démarrer le verrouillage auto
        this._startIdleTimer();

        // Activer le vocal automatiquement — toujours ON après connexion
        setTimeout(() => {
            Voice.activateAlwaysOn();
            UI.toast('🎤 Assistant vocal actif — Dites "OK Cuisine" à tout moment', 'info', 5000);
        }, 1500);
    },

    logout() {
        if (this.currentUser) {
            Journal.log('connexion', `Déconnexion de ${this.currentUser.nom}`);
        }

        this.currentUser = null;
        Voice.deactivate();
        this._stopIdleTimer();

        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('user-list').style.display = 'flex';
        document.getElementById('pin-section').style.display = 'none';
        this.pinBuffer = '';

        this._renderLoginUsers();
    },

    showUserMenu() {
        if (!this.currentUser) return;
        const body = `
            <div style="text-align:center;margin-bottom:1rem;">
                <div class="user-avatar" style="width:64px;height:64px;font-size:1.5rem;margin:0 auto 0.5rem;">${this.currentUser.initiales}</div>
                <h3>${UI.escapeHTML(this.currentUser.nom)}</h3>
                <span class="badge ${this.currentUser.role === 'admin' ? 'badge-warning' : 'badge-info'}">${this.currentUser.role}</span>
            </div>
        `;
        const footer = `
            <button class="btn btn-danger" onclick="UI.closeModal(); App.logout();">🚪 Déconnexion</button>
        `;
        UI.openModal('Mon profil', body, footer);
    },

    // --- Navigation ---
    navigate(page) {
        this.currentPage = page;
        UI.showPage(page);

        // Render page content
        switch (page) {
            case 'dashboard': Dashboard.render(); break;
            case 'agents': Agents.render(); break;
            case 'calendrier': Calendrier.render(); break;
            case 'temperatures': Temperatures.render(); break;
            case 'nettoyage': Nettoyage.render(); break;
            case 'receptions': Receptions.render(); break;
            case 'inventaire': Inventaire.render(); break;
            case 'alertes': Alertes.render(); break;
            case 'allergenes': Allergenes.render(); break;
            case 'tracabilite': Tracabilite.render(); break;
            case 'protocoles': Protocoles.render(); break;
            case 'journal': Journal.render(); break;
            case 'recettes': Recettes.render(); break;
            case 'fournisseurs': Fournisseurs.render(); break;
            case 'config': Config.render(); break;
            case 'menus': Menus.render(); break;
            case 'audit': Audit.render(); break;
            case 'simulateur': Simulateur.render(); break;
            case 'formation': Formation.render(); break;
            case 'centre-formation': CentreFormation.render(); break;
            case 'tiac': TIAC.render(); break;
            case 'rgpd': RGPD.render(); break;
            case 'rappels-produits': RappelsProduits.render(); break;
            case 'pai': PAI.render(); break;
            case 'agec-avance': AGECAvance.render(); break;
            case 'maintenance': Maintenance.render(); break;
            case 'analyse-risques': AnalyseRisques.render(); break;
            case 'validation-nettoyage': ValidationNettoyage.render(); break;
            case 'separation-cru-cuit': SeparationCruCuit.render(); break;
            case 'douches-vestiaires': DoushesVestiaires.render(); break;
            case 'archivage-dlc': ArchivageDLC.render(); break;
        }
    },

    // --- Setup (first time) ---
    showSetup() {
        const body = `
            <p style="color:var(--text-secondary);margin-bottom:1rem;">
                Configuration initiale. Créez le premier compte administrateur.
            </p>
            <div class="form-group">
                <label>Nom de l'établissement</label>
                <input type="text" class="form-control form-control-lg" id="setup-etab" placeholder="Ex: Cuisine du Collège Victor Hugo">
            </div>
            <div class="form-group">
                <label>Votre nom</label>
                <input type="text" class="form-control form-control-lg" id="setup-nom" placeholder="Ex: Chef Martin">
            </div>
            <div class="form-group">
                <label>Initiales</label>
                <input type="text" class="form-control" id="setup-init" placeholder="Ex: CM" maxlength="3">
            </div>
            <div class="form-group">
                <label>Code PIN (4 chiffres)</label>
                <input type="password" class="form-control form-control-lg" id="setup-pin" maxlength="4" placeholder="0000">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="App.saveSetup()">Démarrer</button>
        `;

        UI.openModal('Configuration initiale', body, footer);
    },

    saveSetup() {
        const etab = document.getElementById('setup-etab').value.trim() || 'Ma Cuisine';
        const nom = document.getElementById('setup-nom').value.trim();
        const initiales = document.getElementById('setup-init').value.trim().toUpperCase();
        const pin = document.getElementById('setup-pin').value;

        if (!nom || !initiales || !pin || !/^\d{4}$/.test(pin)) {
            UI.toast('Remplissez tous les champs (PIN = 4 chiffres)', 'warning');
            return;
        }

        const config = Storage.getConfig();
        config.etablissement = etab;
        config.users = [{
            id: 'admin',
            nom,
            initiales,
            pinHash: Storage.hashPin(pin),  // Hash le PIN avant stockage
            role: 'admin'
        }];

        Storage.saveConfig(config);
        UI.toast('Configuration enregistrée !', 'success');
        UI.closeModal();
        this._renderLoginUsers();
    },

    // --- Inactivité / verrouillage auto ---
    _bindIdleEvents() {
        if (this.idleEventsBound) return;
        const reset = () => this._resetIdleTimer();
        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(evt => {
            document.addEventListener(evt, reset, { passive: true });
        });
        this.idleEventsBound = true;
    },

    _startIdleTimer() {
        this._resetIdleTimer();
    },

    _resetIdleTimer() {
        if (!this.currentUser) return;
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => {
            UI.toast('Session verrouillee par inactivite', 'info');
            this.logout();
        }, this.IDLE_TIMEOUT_MS);
    },

    _stopIdleTimer() {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
    },

    // --- Demo mode ---
    showDemo() {
        window.open('demo-selector.html', 'demo-data-selector', 'width=1000,height=800,menubar=no,toolbar=no');
    },

    // --- Load Demo Data ---
    async loadDemoData() {
        if (!confirm('🎬 DÉMO COMPLÈTE INVESTISSEUR\n\nGénère 3 mois de données réalistes :\n✓ 7 agents (secteurs college)\n✓ Températures, cuissons, nettoyages\n✓ Réceptions, inventaires, alertes\n✓ Formations, PAI, allergènes\n✓ TIAC, analyses risques, archivage\n\nContinuer ?')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h2 style="margin-bottom: 1rem;">🔍 Test écrans noirs</h2>
                <div style="margin: 2rem 0;">
                    <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                    <p id="demo-progress" style="color: var(--text-muted); font-size: 0.9rem;">Initialisation...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const updateProgress = (msg) => {
            const el = document.getElementById('demo-progress');
            if (el) el.textContent = msg;
        };

        try {
            const randomId = () => Math.random().toString(36).substr(2, 12);
            const dateStr = (d) => d.toISOString().split('T')[0];
            const today = new Date();

            // 1. ALLERGÈNES (TEST 1) - CLÉ CORRIGÉE: allergene_plats
            updateProgress('Test 1/4 : Allergènes...');
            await new Promise(resolve => setTimeout(resolve, 100));

            const platsAllergenes = [
                { 
                    nom: 'Blanquette de veau', 
                    categorie: 'Plat principal',
                    allergenes: ['lait', 'celeri', 'gluten'],
                    ingredients: 'Veau, crème fraîche, carottes, céleri, farine'
                },
                { 
                    nom: 'Salade César', 
                    categorie: 'Entrée',
                    allergenes: ['oeufs', 'lait', 'poissons', 'gluten'],
                    ingredients: 'Laitue romaine, parmesan, anchois, œufs, croûtons'
                },
                { 
                    nom: 'Cake au thon', 
                    categorie: 'Entrée',
                    allergenes: ['poissons', 'oeufs', 'lait', 'gluten'],
                    ingredients: 'Thon, farine, œufs, lait, gruyère'
                }
            ];
            localStorage.setItem('okc_allergene_plats', JSON.stringify(platsAllergenes.map(p => ({
                ...p, 
                id: randomId(),
                date_ajout: new Date().toISOString()
            }))));
            
            updateProgress('✅ Allergènes OK');
            await new Promise(resolve => setTimeout(resolve, 200));

            // 2. TIAC (TEST 2) - STRUCTURE CORRIGÉE
            updateProgress('Test 2/4 : TIAC...');
            await new Promise(resolve => setTimeout(resolve, 100));

            const tiacs = [
                { 
                    titre: 'Suspicion gastro-entérite', 
                    type: 'Suspicion TIAC',
                    date_incident: '2025-10-08',
                    heure_incident: '14:30',
                    description: 'Un convive a signalé des nausées 3h après le repas. Symptômes légers.',
                    gravite: 'mineur',
                    produits_impliques: 'Poulet rôti du déjeuner',
                    num_lot: 'LOT2510A',
                    quantite_produit: '150g (1 portion)',
                    personnes_touchees: 1,
                    symptomes: 'Nausées, légers maux de ventre',
                    enquete_interne: 'Vérification des températures de cuisson : conformes (75°C à cœur). Aucun autre cas signalé.',
                    cause_presumee: 'Probable cause externe (non liée à la cuisine)',
                    actions_correctives: 'Surveillance renforcée. Aucune action requise.',
                    timestamp: new Date('2025-10-08').toISOString(),
                    user: 'Administrateur',
                    clos: true,
                    ddpp_notified: false
                }
            ];
            localStorage.setItem('okc_tiac', JSON.stringify(tiacs.map(t => ({
                ...t, 
                id: randomId()
            }))));
            
            updateProgress('✅ TIAC OK');
            await new Promise(resolve => setTimeout(resolve, 200));

            // 3. ANALYSE RISQUES (TEST 3) - STRUCTURE CORRIGÉE
            updateProgress('Test 3/4 : Analyse risques...');
            await new Promise(resolve => setTimeout(resolve, 100));

            const analyses = [
                { 
                    nom_processus: 'Cuisson viandes rouges',
                    risques: [
                        {
                            type: 'Biologique (bactéries pathogènes)',
                            desc: 'Risque de survie de bactéries (E.coli, Salmonella) si température à cœur insuffisante',
                            proba: 'Moyenne',
                            gravite: 'critique',
                            ccp: true
                        }
                    ],
                    mesures_controle: 'Contrôle systématique température à cœur (≥63°C). Sonde étalonnée. Formation du personnel.',
                    date_analyse: dateStr(today),
                    user: 'Administrateur',
                    timestamp: new Date().toISOString()
                },
                { 
                    nom_processus: 'Refroidissement rapide',
                    risques: [
                        {
                            type: 'Biologique (bactéries pathogènes)',
                            desc: 'Multiplication bactérienne si refroidissement lent (>2h pour 63°C→10°C)',
                            proba: 'Faible',
                            gravite: 'majeur',
                            ccp: true
                        }
                    ],
                    mesures_controle: 'Cellule de refroidissement rapide. Contrôle durée/température. Enregistrement.',
                    date_analyse: dateStr(today),
                    user: 'Administrateur',
                    timestamp: new Date().toISOString()
                }
            ];
            localStorage.setItem('okc_analyse_risques', JSON.stringify(analyses.map(a => ({
                ...a, 
                id: randomId()
            }))));
            
            updateProgress('✅ Analyse risques OK');
            await new Promise(resolve => setTimeout(resolve, 200));

            // 4. ARCHIVAGE DLC (TEST 4) - STRUCTURE CORRIGÉE
            updateProgress('Test 4/4 : Archivage DLC...');
            await new Promise(resolve => setTimeout(resolve, 100));

            const archives = [
                {
                    date: '2025-12-01',
                    type_donnees: '🌡️ Températures',
                    nb_records: 48,
                    data: [] // Simplifié pour le test
                },
                {
                    date: '2025-11-15',
                    type_donnees: '🧼 Nettoyages',
                    nb_records: 35,
                    data: []
                },
                {
                    date: '2025-10-20',
                    type_donnees: '📫 Réceptions',
                    nb_records: 12,
                    data: []
                }
            ];
            localStorage.setItem('okc_archives_dlc', JSON.stringify(archives.map(a => ({
                ...a, 
                id: randomId()
            }))));
            
            updateProgress('✅ Archivage DLC OK');
            await new Promise(resolve => setTimeout(resolve, 200));

            // Terminer
            updateProgress('✅ Tous les tests OK !');
            await new Promise(resolve => setTimeout(resolve, 500));

            document.body.removeChild(modal);
            UI.toast('✅ Test terminé ! Visitez : Allergènes, TIAC, Analyse risques, Archivage DLC', 'success');
            
        } catch (error) {
            console.error('❌ ERREUR:', error);
            updateProgress('❌ ERREUR: ' + error.message);
            await new Promise(resolve => setTimeout(resolve, 2000));
            document.body.removeChild(modal);
            UI.toast('❌ Erreur: ' + error.message, 'danger');
        }
    }
};

// --- Shake animation for wrong PIN ---
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// --- Start app ---
document.addEventListener('DOMContentLoaded', () => App.init());
