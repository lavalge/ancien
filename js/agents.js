/* ============================================================
   OK CUISINE — Module Gestion des Agents
   Gestion des agents, secteurs assignés, horaires, pauses
   ============================================================ */

const Agents = {
    selectedAgentId: null,

    getDefaultAgents() {
        return [
            {
                id: 'ag_jean',
                nom: 'Dupont',
                prenom: 'Jean',
                fonction: 'Agent ménage',
                secteurs: ['classe_121', 'classe_122', 'classe_123', 'escalier', 'couloirs', 'hall', 'poubelles'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '123 Rue de la Paix, 75000 Paris',
                email: 'jean.dupont@college.fr',
                telephone: '06 12 34 56 78',
                actif: true
            },
            {
                id: 'ag_marie',
                nom: 'Martin',
                prenom: 'Marie',
                fonction: 'Agent ménage',
                secteurs: ['classe_124', 'classe_125', 'classe_126', 'classe_127', 'toilettes', 'vestiaires'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '456 Avenue des Fleurs, 75000 Paris',
                email: 'marie.martin@college.fr',
                telephone: '06 98 76 54 32',
                actif: true
            },
            {
                id: 'ag_pierre',
                nom: 'Bernard',
                prenom: 'Pierre',
                fonction: 'Agent ménage',
                secteurs: ['salle_informatique', 'salle_multimedia', 'bibliotheque', 'hall'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '789 Boulevard Central, 75000 Paris',
                email: 'pierre.bernard@college.fr',
                telephone: '06 45 67 89 01',
                actif: true
            },
            {
                id: 'ag_sophie',
                nom: 'Thomas',
                prenom: 'Sophie',
                fonction: 'Agent ménage',
                secteurs: ['refectoire', 'cuisine_service', 'stockage_alimentaire'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '321 Rue du Commerce, 75000 Paris',
                email: 'sophie.thomas@college.fr',
                telephone: '06 23 45 67 89',
                actif: true
            },
            {
                id: 'ag_thomas',
                nom: 'Petit',
                prenom: 'Thomas',
                fonction: 'Agent ménage',
                secteurs: ['cour_principale', 'cour_secondaire', 'parking', 'entrees'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '654 Rue de la Gare, 75000 Paris',
                email: 'thomas.petit@college.fr',
                telephone: '06 78 90 12 34',
                actif: true
            },
            {
                id: 'ag_veronique',
                nom: 'Leclerc',
                prenom: 'Véronique',
                fonction: 'Agent ménage',
                secteurs: ['bureaux_admin', 'salle_reunion', 'CDC', 'secretariat'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '987 Avenue Principale, 75000 Paris',
                email: 'veronique.leclerc@college.fr',
                telephone: '06 34 56 78 90',
                actif: true
            },
            {
                id: 'ag_claude',
                nom: 'Girard',
                prenom: 'Claude',
                fonction: 'Agent ménage',
                secteurs: ['infirmerie', 'CDI', 'couloirs_etage', 'vestiaires_prof'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '147 Rue du Port, 75000 Paris',
                email: 'claude.girard@college.fr',
                telephone: '06 56 78 90 12',
                actif: true
            },
            {
                id: 'ag_patricia',
                nom: 'Robert',
                prenom: 'Patricia',
                fonction: 'Agent ménage',
                secteurs: ['salle_gym', 'vestiaires_sport', 'stockage_materiel', 'atelier'],
                horaire: '10h30-19h',
                pauses: ['11h-11h30', '16h-16h30'],
                adresse: '258 Rue de la Fontaine, 75000 Paris',
                email: 'patricia.robert@college.fr',
                telephone: '06 89 01 23 45',
                actif: true
            },
            {
                id: 'ag_pascal',
                nom: 'Moreau',
                prenom: 'Pascal',
                fonction: 'Agent ménage',
                secteurs: ['hall', 'escalier', 'poubelles'],
                horaire: '10h30-19h',
                pauses: ['11h-11h30', '16h-16h30'],
                adresse: '369 Boulevard Saint-Michel, 75000 Paris',
                email: 'pascal.moreau@college.fr',
                telephone: '06 01 23 45 67',
                actif: true
            },
            {
                id: 'ag_laurent',
                nom: 'Lefebvre',
                prenom: 'Laurent',
                fonction: 'Maintenance "OP"',
                secteurs: ['chaufferie', 'electricite', 'plomberie', 'toit', 'espaces_techniques'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '741 Route de la Vallée, 75000 Paris',
                email: 'laurent.lefebvre@college.fr',
                telephone: '06 12 34 56 78',
                actif: true
            },
            {
                id: 'ag_robert',
                nom: 'Dubois',
                prenom: 'Robert',
                fonction: 'Chef cuisine',
                secteurs: ['cuisine_principale', 'stockage_sec', 'stockage_froid'],
                horaire: '6h30-14h',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '852 Rue de la Paix, 75000 Paris',
                email: 'robert.dubois@college.fr',
                telephone: '06 45 67 89 01',
                actif: true
            },
            {
                id: 'ag_alain',
                nom: 'Fournier',
                prenom: 'Alain',
                fonction: 'Second cuisine',
                secteurs: ['cuisine_principale', 'preparation', 'plonge'],
                horaire: '6h30-14h',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '963 Avenue du Port, 75000 Paris',
                email: 'alain.fournier@college.fr',
                telephone: '06 78 90 12 34',
                actif: true
            },
            {
                id: 'ag_sylvain',
                nom: 'Rousseau',
                prenom: 'Sylvain',
                fonction: 'Commis cuisine',
                secteurs: ['cuisine_principale', 'plonge', 'laverie'],
                horaire: '6h30-14h',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '159 Rue du Lac, 75000 Paris',
                email: 'sylvain.rousseau@college.fr',
                telephone: '06 23 45 67 89',
                actif: true
            },
            {
                id: 'ag_corinne',
                nom: 'Perez',
                prenom: 'Corinne',
                fonction: 'Agent accueil',
                secteurs: ['hall_entree', 'secretariat', 'standard'],
                horaire: '6h30-14h45',
                pauses: ['8h-8h30', '11h-11h30'],
                adresse: '357 Boulevard du Commerce, 75000 Paris',
                email: 'corinne.perez@college.fr',
                telephone: '06 34 56 78 90',
                actif: true
            }
        ];
    },

    // Secteurs par défaut (peut être personnalisé par établissement)
    getDefaultSecteurs() {
        return [
            { id: 'classe_121', nom: 'Classe 121' },
            { id: 'classe_122', nom: 'Classe 122' },
            { id: 'classe_123', nom: 'Classe 123' },
            { id: 'classe_124', nom: 'Classe 124' },
            { id: 'classe_125', nom: 'Classe 125' },
            { id: 'classe_126', nom: 'Classe 126' },
            { id: 'classe_127', nom: 'Classe 127' },
            { id: 'salle_informatique', nom: 'Salle informatique' },
            { id: 'salle_multimedia', nom: 'Salle multimédia' },
            { id: 'bibliotheque', nom: 'Bibliothèque' },
            { id: 'refectoire', nom: 'Réfectoire' },
            { id: 'cuisine_service', nom: 'Cuisine / Service' },
            { id: 'stockage_alimentaire', nom: 'Stockage alimentaire' },
            { id: 'cour_principale', nom: 'Cour principale' },
            { id: 'cour_secondaire', nom: 'Cour secondaire' },
            { id: 'parking', nom: 'Parking' },
            { id: 'entrees', nom: 'Entrées' },
            { id: 'bureaux_admin', nom: 'Bureaux administratifs' },
            { id: 'salle_reunion', nom: 'Salle de réunion' },
            { id: 'CDC', nom: 'CDC' },
            { id: 'secretariat', nom: 'Secrétariat' },
            { id: 'infirmerie', nom: 'Infirmerie' },
            { id: 'CDI', nom: 'CDI' },
            { id: 'couloirs_etage', nom: 'Couloirs étage' },
            { id: 'vestiaires_prof', nom: 'Vestiaires prof' },
            { id: 'salle_gym', nom: 'Salle de gym' },
            { id: 'vestiaires_sport', nom: 'Vestiaires sport' },
            { id: 'stockage_materiel', nom: 'Stockage matériel' },
            { id: 'atelier', nom: 'Atelier' },
            { id: 'chaufferie', nom: 'Chaufferie' },
            { id: 'electricite', nom: 'Électricité' },
            { id: 'plomberie', nom: 'Plomberie' },
            { id: 'toit', nom: 'Toit' },
            { id: 'espaces_techniques', nom: 'Espaces techniques' },
            { id: 'cuisine_principale', nom: 'Cuisine principale' },
            { id: 'stockage_sec', nom: 'Stockage sec' },
            { id: 'stockage_froid', nom: 'Stockage froid' },
            { id: 'preparation', nom: 'Préparation' },
            { id: 'plonge', nom: 'Plonge' },
            { id: 'laverie', nom: 'Laverie' },
            { id: 'hall', nom: 'Hall' },
            { id: 'toilettes', nom: 'Toilettes' },
            { id: 'vestiaires', nom: 'Vestiaires' },
            { id: 'escalier', nom: 'Escalier' },
            { id: 'couloirs', nom: 'Couloirs' },
            { id: 'poubelles', nom: 'Poubelles / Déchets' },
            { id: 'hall_entree', nom: 'Hall d\'entrée' },
            { id: 'standard', nom: 'Standard téléphonique' }
        ];
    },

    getAllSecteurs() {
        const config = Storage.getConfig();
        if (!config.secteurs || config.secteurs.length === 0) {
            const secteurs = this.getDefaultSecteurs();
            config.secteurs = secteurs;
            Storage.saveConfig(config);
            return secteurs;
        }
        return config.secteurs;
    },

    saveSecteurs(secteurs) {
        const config = Storage.getConfig();
        config.secteurs = secteurs;
        Storage.saveConfig(config);
    },

    getAgents() {
        const config = Storage.getConfig();
        if (!config.agents || config.agents.length === 0) {
            const agents = this.getDefaultAgents();
            config.agents = agents;
            Storage.saveConfig(config);
            return agents;
        }
        return config.agents;
    },

    saveAgents(agents) {
        const config = Storage.getConfig();
        config.agents = agents;
        Storage.saveConfig(config);
    },

    render() {
        const page = document.getElementById('page-agents');
        const agents = this.getAgents();
        const secteurs = this.getAllSecteurs();

        const agentsHTML = agents.map((agent, idx) => {
            return `
                <tr>
                    <td>
                        <button style="background:none;border:none;color:var(--accent);cursor:pointer;text-decoration:underline;" onclick="Agents.showFicheAgent(${idx})">
                            <strong>${agent.prenom} ${agent.nom}</strong>
                        </button>
                    </td>
                    <td>${agent.fonction}</td>
                    <td style="max-width:200px;">
                        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
                            ${agent.secteurs.slice(0, 2).map(id => {
                                const sect = secteurs.find(s => s.id === id);
                                return `<span class="badge badge-info" style="font-size:0.75rem;">${sect ? sect.nom : id}</span>`;
                            }).join('')}
                            ${agent.secteurs.length > 2 ? `<span class="badge badge-secondary" style="font-size:0.75rem;">+${agent.secteurs.length - 2}</span>` : ''}
                        </div>
                    </td>
                    <td>${agent.horaire}</td>
                    <td>
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="Agents.showEditModal(${idx})">✏️ Modifier</button>
                        <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;margin-left:0.25rem;" onclick="Agents.deleteAgent(${idx})">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">👥 Gestion des Agents</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Agents.showAddAgentModal()">
                        + Ajouter agent
                    </button>
                    <button class="btn btn-secondary" onclick="Agents.showGestionSecteursModal()">
                        🏫 Gérer secteurs
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Agents totaux</div>
                    <div class="stat-value">${agents.length}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Agents matin</div>
                    <div class="stat-value">${agents.filter(a => a.horaire.includes('6h30')).length}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Agents après-midi</div>
                    <div class="stat-value">${agents.filter(a => a.horaire.includes('10h30')).length}</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Cuisine</div>
                    <div class="stat-value">${agents.filter(a => a.fonction.includes('cuisine') || a.fonction.includes('Cuisine')).length}</div>
                </div>
            </div>

            <!-- Tableau agents -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Liste des agents</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Fonction</th>
                                <th>Secteurs</th>
                                <th>Horaires</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${agentsHTML}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Infos réglementaires -->
            <div class="card" style="border-left:4px solid var(--info);">
                <div class="card-header">
                    <span class="card-title">📋 Horaires et Pauses</span>
                </div>
                <div style="color:var(--text-secondary);font-size:0.85rem;">
                    <p><strong>Matin :</strong> 6h30 - 14h45 avec pauses 8h-8h30 et 11h-11h30</p>
                    <p><strong>Après-midi :</strong> 10h30 - 19h avec pauses 11h-11h30 et 16h-16h30</p>
                    <p><strong>Cuisine :</strong> 6h30 - 14h avec pauses 8h-8h30 et 11h-11h30</p>
                    <p><strong>Traçabilité :</strong> Cliquez sur le nom d'un agent pour voir sa fiche complète.</p>
                </div>
            </div>
        `;
    },

    showFicheAgent(agentIdx) {
        const agents = this.getAgents();
        const agent = agents[agentIdx];
        const secteurs = this.getAllSecteurs();

        const secteursList = agent.secteurs.map(id => {
            const sect = secteurs.find(s => s.id === id);
            return `<li>${sect ? sect.nom : id}</li>`;
        }).join('');

        const bodyHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
                <!-- Infos personnelles -->
                <div>
                    <h4 style="margin-bottom:1rem;color:var(--accent);">👤 Infos personnelles</h4>
                    <div style="display:flex;flex-direction:column;gap:0.75rem;">
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">Nom</span>
                            <p style="font-weight:600;margin:0.25rem 0;">${UI.escapeHTML(agent.nom)}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">Prénom</span>
                            <p style="font-weight:600;margin:0.25rem 0;">${UI.escapeHTML(agent.prenom)}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">📱 Téléphone</span>
                            <p style="margin:0.25rem 0;">${UI.escapeHTML(agent.telephone)}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">📧 Email</span>
                            <p style="margin:0.25rem 0;word-break:break-all;">${UI.escapeHTML(agent.email)}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">📍 Adresse</span>
                            <p style="margin:0.25rem 0;font-size:0.9rem;">${UI.escapeHTML(agent.adresse)}</p>
                        </div>
                    </div>
                </div>

                <!-- Infos professionnelles -->
                <div>
                    <h4 style="margin-bottom:1rem;color:var(--accent);">💼 Infos professionnelles</h4>
                    <div style="display:flex;flex-direction:column;gap:0.75rem;">
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">Fonction</span>
                            <p style="font-weight:600;margin:0.25rem 0;">${UI.escapeHTML(agent.fonction)}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">🕐 Horaires</span>
                            <p style="font-weight:600;margin:0.25rem 0;">${agent.horaire}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">⏸️ Pauses</span>
                            <p style="margin:0.25rem 0;">${agent.pauses.length > 0 ? agent.pauses.join(' + ') : '—'}</p>
                        </div>
                        <div>
                            <span style="color:var(--text-muted);font-size:0.85rem;">🏠 Secteurs assignés</span>
                            <ul style="margin:0.5rem 0;padding-left:1.5rem;font-size:0.9rem;">
                                ${secteursList}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Fermer</button>
            <button class="btn btn-warning" onclick="UI.closeModal(); Agents.showEditModal(${agentIdx})">Modifier infos</button>
        `;

        UI.openModal(`Fiche agent : ${agent.prenom} ${agent.nom}`, bodyHTML, footerHTML);
    },

    showEditModal(agentIdx) {
        const agents = this.getAgents();
        const agent = agents[agentIdx];
        const secteurs = this.getAllSecteurs();

        const secteurCheckboxes = secteurs.map(sect => {
            const checked = agent.secteurs.includes(sect.id) ? 'checked' : '';
            return `
                <label style="display:flex;align-items:center;gap:0.5rem;margin:0.5rem 0;">
                    <input type="checkbox" value="${sect.id}" ${checked} class="agent-secteur-checkbox">
                    <span>${sect.nom}</span>
                </label>
            `;
        }).join('');

        const bodyHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <!-- Infos perso -->
                <div>
                    <h4 style="margin-bottom:0.75rem;">👤 Infos personnelles</h4>
                    <div class="form-group">
                        <label>Nom</label>
                        <input type="text" class="form-control form-control-lg" id="agent-nom" value="${UI.escapeHTML(agent.nom)}" required>
                    </div>
                    <div class="form-group">
                        <label>Prénom</label>
                        <input type="text" class="form-control form-control-lg" id="agent-prenom" value="${UI.escapeHTML(agent.prenom)}" required>
                    </div>
                    <div class="form-group">
                        <label>📞 Téléphone</label>
                        <input type="tel" class="form-control form-control-lg" id="agent-telephone" value="${UI.escapeHTML(agent.telephone)}">
                    </div>
                    <div class="form-group">
                        <label>📧 Email</label>
                        <input type="email" class="form-control form-control-lg" id="agent-email" value="${UI.escapeHTML(agent.email)}">
                    </div>
                    <div class="form-group">
                        <label>📍 Adresse</label>
                        <input type="text" class="form-control form-control-lg" id="agent-adresse" value="${UI.escapeHTML(agent.adresse)}">
                    </div>
                </div>

                <!-- Infos professionnelles -->
                <div>
                    <h4 style="margin-bottom:0.75rem;">💼 Infos professionnelles</h4>
                    <div class="form-group">
                        <label>Fonction</label>
                        <p style="font-weight:600;padding:0.5rem 0;">${UI.escapeHTML(agent.fonction)}</p>
                        <span style="font-size:0.8rem;color:var(--text-muted);">(non modifiable)</span>
                    </div>

                    <div class="form-group">
                        <label><strong>🕐 Horaires</strong></label>
                        <select class="form-control form-control-lg" id="agent-horaire" onchange="Agents._toggleCustomSchedule('edit')" style="margin:0.5rem 0;">
                            <option value="6h30-14h45" ${agent.horaire === '6h30-14h45' ? 'selected' : ''}>Matin (6h30 - 14h45)</option>
                            <option value="10h30-19h" ${agent.horaire === '10h30-19h' ? 'selected' : ''}>Après-midi (10h30 - 19h)</option>
                            <option value="6h30-14h" ${agent.horaire === '6h30-14h' ? 'selected' : ''}>Cuisine (6h30 - 14h)</option>
                            <option value="__CUSTOM__" ${!['6h30-14h45', '10h30-19h', '6h30-14h'].includes(agent.horaire) ? 'selected' : ''}>✏️ Personnalisé...</option>
                        </select>
                        <div id="edit-agent-custom-schedule" style="${!['6h30-14h45', '10h30-19h', '6h30-14h'].includes(agent.horaire) ? '' : 'display:none;'}margin-top:0.75rem;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius);">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                                <div>
                                    <label style="font-size:0.85rem;margin-bottom:0.25rem;display:block;">Début</label>
                                    <input type="time" class="form-control" id="edit-agent-horaire-debut" value="${agent.horaire.split('-')[0] || ''}">
                                </div>
                                <div>
                                    <label style="font-size:0.85rem;margin-bottom:0.25rem;display:block;">Fin</label>
                                    <input type="time" class="form-control" id="edit-agent-horaire-fin" value="${agent.horaire.split('-')[1] || ''}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top:1rem;">
                <h4 style="margin-bottom:0.75rem;">🏠 Secteurs assignés</h4>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">
                    Cochez/décochez les secteurs assignés
                </p>
                <div style="max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:1rem;">
                    ${secteurCheckboxes}
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success" onclick="Agents.saveEditModal(${agentIdx})">Enregistrer</button>
        `;

        UI.openModal(`Modifier agent : ${agent.prenom} ${agent.nom}`, bodyHTML, footerHTML);
    },

    saveEditModal(agentIdx) {
        const agents = this.getAgents();
        const agent = agents[agentIdx];

        const nom = document.getElementById('agent-nom').value.trim();
        const prenom = document.getElementById('agent-prenom').value.trim();
        const telephone = document.getElementById('agent-telephone').value.trim();
        const email = document.getElementById('agent-email').value.trim();
        const adresse = document.getElementById('agent-adresse').value.trim();
        let horaire = document.getElementById('agent-horaire').value;

        // Si horaire personnalisé
        if (horaire === '__CUSTOM__') {
            const debut = document.getElementById('edit-agent-horaire-debut').value;
            const fin = document.getElementById('edit-agent-horaire-fin').value;
            if (!debut || !fin) {
                UI.toast('Remplissez les horaires de début et fin', 'warning');
                return;
            }
            horaire = `${debut}-${fin}`;
        }

        if (!nom || !prenom) {
            UI.toast('Nom et prénom obligatoires', 'warning');
            return;
        }

        // Récupérer secteurs
        const checkboxes = document.querySelectorAll('.agent-secteur-checkbox:checked');
        const secteurs = Array.from(checkboxes).map(cb => cb.value);

        if (secteurs.length === 0) {
            UI.toast('Assignez au moins un secteur', 'warning');
            return;
        }

        // Déterminer pauses selon horaire
        let pauses = [];
        if (horaire === '6h30-14h45' || horaire === '6h30-14h') {
            pauses = ['8h-8h30', '11h-11h30'];
        } else if (horaire === '10h30-19h') {
            pauses = ['11h-11h30', '16h-16h30'];
        }

        // Mettre à jour
        agent.nom = nom;
        agent.prenom = prenom;
        agent.telephone = telephone;
        agent.email = email;
        agent.adresse = adresse;
        agent.horaire = horaire;
        agent.secteurs = secteurs;
        agent.pauses = pauses;

        this.saveAgents(agents);
        UI.closeModal();
        UI.toast('Agent modifié avec succès', 'success');
        this.render();
    },

    showAddAgentModal() {
        const bodyHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <!-- Infos perso -->
                <div>
                    <h4 style="margin-bottom:0.75rem;">👤 Infos personnelles</h4>
                    <div class="form-group">
                        <label>Nom *</label>
                        <input type="text" class="form-control form-control-lg" id="new-agent-nom" placeholder="Dupont" required>
                    </div>
                    <div class="form-group">
                        <label>Prénom *</label>
                        <input type="text" class="form-control form-control-lg" id="new-agent-prenom" placeholder="Jean" required>
                    </div>
                    <div class="form-group">
                        <label>📞 Téléphone</label>
                        <input type="tel" class="form-control form-control-lg" id="new-agent-telephone" placeholder="06 12 34 56 78">
                    </div>
                    <div class="form-group">
                        <label>📧 Email</label>
                        <input type="email" class="form-control form-control-lg" id="new-agent-email" placeholder="agent@college.fr">
                    </div>
                    <div class="form-group">
                        <label>📍 Adresse</label>
                        <input type="text" class="form-control form-control-lg" id="new-agent-adresse" placeholder="123 Rue de la Paix, 75000 Paris">
                    </div>
                </div>

                <!-- Infos professionnelles -->
                <div>
                    <h4 style="margin-bottom:0.75rem;">💼 Infos professionnelles</h4>
                    <div class="form-group">
                        <label>Fonction *</label>
                        <select class="form-control form-control-lg" id="new-agent-fonction" onchange="Agents._toggleCustomFonction('new')" required>
                            <option value="">Sélectionner...</option>
                            <option value="__CUSTOM__">✏️ Ajouter custom...</option>
                            <option value="Agent ménage">Agent ménage</option>
                            <option value="Contractuel">Contractuel</option>
                            <option value="Maintenance OP">Maintenance "OP"</option>
                            <option value="Chef cuisine">Chef cuisine</option>
                            <option value="Second cuisine">Second cuisine</option>
                            <option value="Commis cuisine">Commis cuisine</option>
                            <option value="Agent accueil">Agent accueil</option>
                        </select>
                        <div id="new-agent-custom-fonction" style="display:none;margin-top:0.75rem;">
                            <input type="text" class="form-control" id="new-agent-fonction-custom-input" placeholder="Ex: Stagiaire, Intérimaire, Agent polyvalent..." style="font-style:italic;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label><strong>🕐 Horaires *</strong></label>
                        <select class="form-control form-control-lg" id="new-agent-horaire" onchange="Agents._toggleCustomSchedule('new')" required>
                            <option value="">Sélectionner...</option>
                            <option value="6h30-14h45">Matin (6h30 - 14h45)</option>
                            <option value="10h30-19h">Après-midi (10h30 - 19h)</option>
                            <option value="6h30-14h">Cuisine (6h30 - 14h)</option>
                            <option value="__CUSTOM__">✏️ Personnalisé...</option>
                        </select>
                        <div id="new-agent-custom-schedule" style="display:none;margin-top:0.75rem;padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius);">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                                <div>
                                    <label style="font-size:0.85rem;margin-bottom:0.25rem;display:block;">Début</label>
                                    <input type="time" class="form-control" id="new-agent-horaire-debut" placeholder="Ex: 08:00">
                                </div>
                                <div>
                                    <label style="font-size:0.85rem;margin-bottom:0.25rem;display:block;">Fin</label>
                                    <input type="time" class="form-control" id="new-agent-horaire-fin" placeholder="Ex: 16:00">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top:1rem;">
                <h4 style="margin-bottom:0.75rem;">🏠 Secteurs assignés *</h4>
                <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:1rem;">
                    ${this.getAllSecteurs().map(sect => `
                        <label style="display:flex;align-items:center;gap:0.5rem;margin:0.5rem 0;">
                            <input type="checkbox" value="${sect.id}" class="new-agent-secteur-checkbox">
                            <span>${sect.nom}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success" onclick="Agents.saveAddAgent()">Créer agent</button>
        `;

        UI.openModal('Ajouter un nouvel agent', bodyHTML, footerHTML);
    },

    saveAddAgent() {
        const nom = document.getElementById('new-agent-nom').value.trim();
        const prenom = document.getElementById('new-agent-prenom').value.trim();
        const telephone = document.getElementById('new-agent-telephone').value.trim();
        const email = document.getElementById('new-agent-email').value.trim();
        const adresse = document.getElementById('new-agent-adresse').value.trim();
        let fonction = document.getElementById('new-agent-fonction').value;
        let horaire = document.getElementById('new-agent-horaire').value;

        // Si fonction personnalisée
        if (fonction === '__CUSTOM__') {
            const fonctionCustom = document.getElementById('new-agent-fonction-custom-input').value.trim();
            if (!fonctionCustom) {
                UI.toast('Entrez le nom de la fonction personnalisée', 'warning');
                return;
            }
            fonction = fonctionCustom;
        }

        // Si horaire personnalisé
        if (horaire === '__CUSTOM__') {
            const debut = document.getElementById('new-agent-horaire-debut').value;
            const fin = document.getElementById('new-agent-horaire-fin').value;
            if (!debut || !fin) {
                UI.toast('Remplissez les horaires de début et fin', 'warning');
                return;
            }
            horaire = `${debut}-${fin}`;
        }

        if (!nom || !prenom || !fonction || !horaire) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const checkboxes = document.querySelectorAll('.new-agent-secteur-checkbox:checked');
        const secteurs = Array.from(checkboxes).map(cb => cb.value);

        if (secteurs.length === 0) {
            UI.toast('Assignez au moins un secteur', 'warning');
            return;
        }

        let pauses = [];
        if (horaire === '6h30-14h45' || horaire === '6h30-14h') {
            pauses = ['8h-8h30', '11h-11h30'];
        } else if (horaire === '10h30-19h') {
            pauses = ['11h-11h30', '16h-16h30'];
        }

        const agents = this.getAgents();
        const newAgent = {
            id: 'ag_' + Date.now(),
            nom,
            prenom,
            fonction,
            secteurs,
            horaire,
            pauses,
            adresse,
            email,
            telephone,
            actif: true
        };

        agents.push(newAgent);
        this.saveAgents(agents);
        UI.closeModal();
        UI.toast('Agent créé avec succès', 'success');
        this.render();
    },

    deleteAgent(agentIdx) {
        const agents = this.getAgents();
        const agent = agents[agentIdx];

        if (confirm(`Êtes-vous sûr de vouloir supprimer ${agent.prenom} ${agent.nom} ?`)) {
            agents.splice(agentIdx, 1);
            this.saveAgents(agents);
            UI.toast('Agent supprimé', 'success');
            this.render();
        }
    },

    // Toggle affichage des inputs horaires personnalisés
    _toggleCustomSchedule(mode) {
        const select = document.getElementById(mode === 'new' ? 'new-agent-horaire' : 'agent-horaire');
        const container = document.getElementById(mode === 'new' ? 'new-agent-custom-schedule' : 'edit-agent-custom-schedule');
        
        if (select.value === '__CUSTOM__') {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    },

    // Toggle affichage de l'input fonction personnalisée
    _toggleCustomFonction(mode) {
        const select = document.getElementById(mode === 'new' ? 'new-agent-fonction' : 'agent-fonction');
        const container = document.getElementById(mode === 'new' ? 'new-agent-custom-fonction' : 'edit-agent-custom-fonction');
        
        if (select.value === '__CUSTOM__') {
            container.style.display = 'block';
            const input = document.getElementById(mode === 'new' ? 'new-agent-fonction-custom-input' : 'edit-agent-fonction-custom-input');
            setTimeout(() => input.focus(), 0);
        } else {
            container.style.display = 'none';
        }
    },

    // =====================================================================
    // GESTION DES SECTEURS
    // =====================================================================
    showGestionSecteursModal() {
        const secteurs = this.getAllSecteurs();

        const bodyHTML = `
            <div class="card" style="margin-bottom:1rem;">
                <div class="card-title">📋 Secteurs actuels (${secteurs.length})</div>
                <div style="max-height:350px;overflow-y:auto;margin-top:0.75rem;">
                    ${secteurs.length === 0 ? '<p style="color:var(--text-muted);font-style:italic;">Aucun secteur. Ajoutez-en ou réinitialisez.</p>' : ''}
                    ${secteurs.map((sect, idx) => `
                        <div class="checklist-item" style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border-bottom:1px solid var(--border);">
                            <div>
                                <strong>${UI.escapeHTML(sect.nom)}</strong>
                                <span style="color:var(--text-muted);font-size:0.85rem;margin-left:0.5rem;">(${sect.id})</span>
                            </div>
                            <div style="display:flex;gap:0.5rem;">
                                <button class="btn btn-secondary" style="padding:0.25rem 0.5rem;font-size:0.85rem;" onclick="Agents.showEditSecteurModal(${idx})">✏️</button>
                                <button class="btn btn-danger" style="padding:0.25rem 0.5rem;font-size:0.85rem;" onclick="Agents.deleteSecteur(${idx})">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="display:flex;gap:0.75rem;margin-top:1rem;">
                <button class="btn btn-primary" onclick="Agents.showAddSecteurModal()" style="flex:1;">+ Ajouter secteur</button>
                <button class="btn btn-warning" onclick="Agents.resetSecteursToDefault()" style="flex:1;">🔄 Réinitialiser</button>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal(); Agents.render();">Fermer</button>
        `;

        UI.openModal('🏫 Gestion des secteurs', bodyHTML, footerHTML);
    },

    showAddSecteurModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Nom du secteur *</label>
                <input type="text" class="form-control form-control-lg" id="new-secteur-nom" placeholder="Ex: Classe 6èmeA" required>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.5rem;">Le nom qui apparaîtra dans les listes</p>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal(); Agents.showGestionSecteursModal();">Annuler</button>
            <button class="btn btn-success" onclick="Agents.saveAddSecteur()">Ajouter</button>
        `;

        UI.openModal('Ajouter un secteur', bodyHTML, footerHTML);
    },

    saveAddSecteur() {
        const nom = document.getElementById('new-secteur-nom').value.trim();
        if (!nom) {
            UI.toast('Entrez un nom de secteur', 'warning');
            return;
        }

        const secteurs = this.getAllSecteurs();
        const id = 'sect_' + nom.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
        
        secteurs.push({ id, nom });
        this.saveSecteurs(secteurs);
        
        UI.toast('Secteur ajouté', 'success');
        UI.closeModal();
        this.showGestionSecteursModal();
    },

    showEditSecteurModal(idx) {
        const secteurs = this.getAllSecteurs();
        const secteur = secteurs[idx];

        const bodyHTML = `
            <div class="form-group">
                <label>Nom du secteur *</label>
                <input type="text" class="form-control form-control-lg" id="edit-secteur-nom" value="${UI.escapeHTML(secteur.nom)}" required>
            </div>
            <p style="font-size:0.85rem;color:var(--text-muted);">ID: ${secteur.id}</p>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal(); Agents.showGestionSecteursModal();">Annuler</button>
            <button class="btn btn-success" onclick="Agents.saveEditSecteur(${idx})">Enregistrer</button>
        `;

        UI.openModal('Modifier le secteur', bodyHTML, footerHTML);
    },

    saveEditSecteur(idx) {
        const nom = document.getElementById('edit-secteur-nom').value.trim();
        if (!nom) {
            UI.toast('Entrez un nom de secteur', 'warning');
            return;
        }

        const secteurs = this.getAllSecteurs();
        secteurs[idx].nom = nom;
        this.saveSecteurs(secteurs);
        
        UI.toast('Secteur modifié', 'success');
        UI.closeModal();
        this.showGestionSecteursModal();
    },

    deleteSecteur(idx) {
        const secteurs = this.getAllSecteurs();
        const secteur = secteurs[idx];

        if (confirm(`Supprimer le secteur "${secteur.nom}" ?\n\nAttention : les agents assignés à ce secteur le garderont dans leur liste.`)) {
            secteurs.splice(idx, 1);
            this.saveSecteurs(secteurs);
            UI.toast('Secteur supprimé', 'info');
            this.showGestionSecteursModal();
        }
    },

    resetSecteursToDefault() {
        if (confirm('Réinitialiser tous les secteurs aux valeurs par défaut ?\n\nCela effacera tous vos secteurs personnalisés !')) {
            const defaultSecteurs = this.getDefaultSecteurs();
            this.saveSecteurs(defaultSecteurs);
            UI.toast('Secteurs réinitialisés', 'success');
            this.showGestionSecteursModal();
        }
    }
};
