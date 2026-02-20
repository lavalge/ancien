/* ============================================================
   OK CUISINE — Module RGPD
   Gestion consentement, droit à l'oubli, registre traitements
   Conformité RGPD (UE) 2016/679 & CNIL
   ============================================================ */

const RGPD = {
    selectedTab: 'consentement', // 'consentement', 'registre', 'dpo', 'export'

    render() {
        const page = document.getElementById('page-rgpd');
        const config = Storage.getConfig();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🔐 RGPD — Protection des Données</h2>
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="RGPD.downloadReglement()">
                        📄 Télécharger RGPD
                    </button>
                    <button class="btn btn-secondary" onclick="RGPD.downloadDPA()">
                        📑 DPA modèle
                    </button>
                </div>
            </div>

            <!-- Rappel réglementaire -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 RGPD (UE) 2016/679 & CNIL</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligations :</strong> Consentement explicite pour traitement données personnelles, 
                    droit à l'oubli (suppression), droit d'accès, registre complété, responsable désigné (DPO), 
                    audit trail des accès, chiffrement au repos, notification d'incidents (72h).
                </p>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.selectedTab === 'consentement' ? 'active' : ''}"
                        onclick="RGPD.selectedTab='consentement'; RGPD.render();">
                    📋 Consentements
                </button>
                <button class="tab-btn ${this.selectedTab === 'registre' ? 'active' : ''}"
                        onclick="RGPD.selectedTab='registre'; RGPD.render();">
                    📑 Registre traitements
                </button>
                <button class="tab-btn ${this.selectedTab === 'dpo' ? 'active' : ''}"
                        onclick="RGPD.selectedTab='dpo'; RGPD.render();">
                    👤 DPO & Responsable
                </button>
                <button class="tab-btn ${this.selectedTab === 'export' ? 'active' : ''}"
                        onclick="RGPD.selectedTab='export'; RGPD.render();">
                    📊 Exports & Suppression
                </button>
            </div>

            <div id="rgpd-content" style="margin-top:1.5rem;">
                ${this._renderTabContent()}
            </div>
        `;
    },

    _renderTabContent() {
        switch (this.selectedTab) {
            case 'consentement': return this._renderConsentement();
            case 'registre': return this._renderRegistre();
            case 'dpo': return this._renderDPO();
            case 'export': return this._renderExportSuppression();
            default: return '';
        }
    },

    _renderConsentement() {
        const consentements = Storage.getRGPDConsentements();
        
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Gestion des consentements</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Tous les utilisateurs doivent consentir au traitement de leurs données personnelles. 
                    Audit trail et garantie d'archivage obligatoires.
                </p>

                <button class="btn btn-primary" style="margin-bottom:1rem;" onclick="RGPD.showConsentementModal()">
                    + Nouveau consentement
                </button>

                <div style="display:flex;gap:1rem;margin-bottom:1rem;">
                    <div class="stat-card success">
                        <div class="stat-label">Consentis</div>
                        <div class="stat-value">${consentements.filter(c => c.accepte).length}</div>
                    </div>
                    <div class="stat-card warning">
                        <div class="stat-label">Refusés/Révoqués</div>
                        <div class="stat-value">${consentements.filter(c => !c.accepte).length}</div>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Type traitement</th>
                                <th>Date consentement</th>
                                <th>Statut</th>
                                <th>Expiration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${consentements.map(c => {
                                const status = c.accepte ? '✓ Accepté' : '✗ Refusé';
                                const user = Storage.getConfig().users.find(u => u.id === c.user_id);
                                return `
                                    <tr>
                                        <td>${user?.nom || 'N/A'}</td>
                                        <td>${UI.escapeHTML(c.type_traitement)}</td>
                                        <td>${Storage.formatDate(c.date_consentement)}</td>
                                        <td>${status}</td>
                                        <td>${c.date_expiration ? Storage.formatDate(c.date_expiration) : '—'}</td>
                                        <td>
                                            <button class="btn btn-secondary" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                    onclick="RGPD.showConsentDetail('${c.id}')">Detail</button>
                                            <button class="btn btn-danger" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                    onclick="RGPD.revokeConsent('${c.id}')">Révoquer</button>
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

    _renderRegistre() {
        const registre = Storage.getRGPDRegistre();

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Registre des traitements</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Inventaire de tous les traitements de données personnelles — obligatoire selon RGPD art. 30.
                </p>

                <button class="btn btn-primary" style="margin-bottom:1rem;" onclick="RGPD.addTraitement()">
                    + Nouveau traitement
                </button>

                <div style="display:flex;flex-direction:column;gap:1rem;">
                    ${registre.length === 0 
                        ? UI.emptyState('📋', 'Aucun traitement enregistré')
                        : registre.map(t => `
                            <div style="padding:1rem;background:var(--bg-secondary);border-radius:0.5rem;border-left:4px solid var(--primary);">
                                <div style="font-weight:bold;margin-bottom:0.5rem;">${UI.escapeHTML(t.nom_traitement)}</div>
                                <div style="font-size:0.9rem;color:var(--text-muted);display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                                    <div><strong>Données :</strong> ${UI.escapeHTML(t.categories_donnees)}</div>
                                    <div><strong>Durée :</strong> ${UI.escapeHTML(t.duree_conservation)}</div>
                                    <div><strong>Finalité :</strong> ${UI.escapeHTML(t.finalite)}</div>
                                    <div><strong>Base légale :</strong> ${UI.escapeHTML(t.base_legale)}</div>
                                    <div><strong>Destinataires :</strong> ${UI.escapeHTML(t.destinataires)}</div>
                                    <div><strong>Transferts UE :</strong> ${t.transferts_internationaux ? 'Oui' : 'Non'}</div>
                                </div>
                                <button class="btn btn-secondary" style="margin-top:0.5rem;padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                        onclick="RGPD.editTraitement('${t.id}')">Modifier</button>
                                <button class="btn btn-danger" style="margin-top:0.5rem;padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                        onclick="RGPD.deleteTraitement('${t.id}')">Supprimer</button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    },

    _renderDPO() {
        const dpo = Storage.getRGPDDPO();
        const config = Storage.getConfig();

        return `
            <div class="card" style="margin-bottom:1rem;">
                <div class="card-header">
                    <span class="card-title">🔐 Responsable du traitement</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Personne responsable légalement de la conformité RGPD et protection données.
                </p>

                ${!dpo.responsable 
                    ? UI.emptyState('👤', 'Aucun responsable désigné. Cliquez sur modifier.')
                    : `
                        <div style="padding:1rem;background:var(--bg-secondary);border-radius:0.5rem;">
                            <div><strong>Nom :</strong> ${UI.escapeHTML(dpo.responsable)}</div>
                            <div><strong>Fonction :</strong> ${UI.escapeHTML(dpo.fonction || '—')}</div>
                            <div><strong>Email :</strong> ${UI.escapeHTML(dpo.email || '—')}</div>
                            <div><strong>Téléphone :</strong> ${UI.escapeHTML(dpo.telephone || '—')}</div>
                        </div>
                    `
                }

                <button class="btn btn-primary" style="margin-top:1rem;" onclick="RGPD.editDPO()">
                    ${dpo.responsable ? '✏️ Modifier' : '+ Désigner'}
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">📋 Mentions légales & Politique de confidentialité</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    À afficher/communiquer à tous les utilisateurs via modal au premier lancement.
                </p>

                <button class="btn btn-secondary" style="margin-bottom:1rem;" onclick="RGPD.downloadMentionsLegales()">
                    📄 Télécharger mentions légales
                </button>

                <button class="btn btn-secondary" style="margin-bottom:1rem;" onclick="RGPD.downloadPolitiqueConfidentialite()">
                    📄 Télécharger politique confidentialité
                </button>

                <label style="display:flex;align-items:center;gap:0.5rem;margin-top:1rem;cursor:pointer;">
                    <input type="checkbox" id="rgpd-acceptation" ${config.rgpd_accepte ? 'checked' : ''} 
                           onchange="Storage.updateRGPDAcceptation(this.checked)">
                    ✓ RGPD/mentions légales affichées aux utilisateurs
                </label>
            </div>
        `;
    },

    _renderExportSuppression() {
        return `
            <div class="card" style="margin-bottom:1rem;border-left:4px solid var(--warning);">
                <div class="card-header">
                    <span class="card-title">📊 Droit à l'accès — Exporter les données</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    RGPD art. 15 : Tout utilisateur peut demander l'export de ses données personnelles en format portable.
                </p>

                <button class="btn btn-primary" style="margin-bottom:1rem;" onclick="RGPD.showExportUserModal()">
                    📥 Exporter données utilisateur
                </button>
            </div>

            <div class="card" style="border-left:4px solid var(--danger);">
                <div class="card-header">
                    <span class="card-title">🗑️ Droit à l'oubli — Supprimer données</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    RGPD art. 17 : Suppression irréversible de toutes les données liées à un utilisateur. 
                    À conserver du rapport de suppression pour audit.
                </p>

                <button class="btn btn-danger" style="margin-bottom:1rem;" onclick="RGPD.showDeleteUserModal()">
                    ⚠️ Demande suppression (droit à l'oubli)
                </button>

                <div style="margin-top:1rem;">
                    <strong>Données à supprimer :</strong>
                    <ul style="margin:0;padding-left:1.5rem;color:var(--text-secondary);font-size:0.9rem;">
                        <li>Profil utilisateur & authentification</li>
                        <li>Consentements RGPD associés</li>
                        <li>Historique formations</li>
                        <li>Entrées journal (anonymisées)</li>
                        <li>Données audit trail (conservées 5 ans)</li>
                    </ul>
                </div>
            </div>
        `;
    },

    showConsentementModal() {
        const users = Storage.getConfig().users || [];
        const userOptions = users.map(u => `<option value="${u.id}">${u.nom}</option>`).join('');

        const bodyHTML = `
            <div class="form-group">
                <label>Utilisateur</label>
                <select class="form-control form-control-lg" id="rgpd-user-id" required>
                    <option value="">Sélectionner...</option>
                    ${userOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Type de traitement</label>
                <select class="form-control form-control-lg" id="rgpd-type-trait" required>
                    <option value="">Sélectionner...</option>
                    <option value="Données de connexion">Données de connexion</option>
                    <option value="Données d'activité (logs)">Données d'activité (logs)</option>
                    <option value="Données de formation">Données de formation</option>
                    <option value="Données d'audit">Données d'audit HACCP</option>
                    <option value="Données de traçabilité">Données de traçabilité</option>
                    <option value="Toutes les données">Toutes les données</option>
                </select>
            </div>
            <div class="form-group">
                <label>Consentement de l'utilisateur</label>
                <select class="form-control form-control-lg" id="rgpd-accepte" required>
                    <option value="">Sélectionner...</option>
                    <option value="true">✓ Accepté explicitement</option>
                    <option value="false">✗ Refusé</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date d'expiration du consentement (optionnel)</label>
                <input type="date" class="form-control form-control-lg" id="rgpd-exp-date">
            </div>
            <div class="form-group">
                <label>Signature utilisateur / Témoins</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-signature" placeholder="Nom témoin ou signature numérique">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="RGPD.saveConsentement();">Enregistrer consentement</button>
        `;

        UI.openModal('Enregistrer consentement RGPD', bodyHTML, footerHTML);
    },

    saveConsentement() {
        const userId = document.getElementById('rgpd-user-id').value;
        const typeTraitement = document.getElementById('rgpd-type-trait').value;
        const accepte = document.getElementById('rgpd-accepte').value === 'true';
        const dateExp = document.getElementById('rgpd-exp-date').value;
        const signature = document.getElementById('rgpd-signature').value;

        if (!userId || !typeTraitement || document.getElementById('rgpd-accepte').value === '') {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const consent = {
            id: Storage.uid(),
            user_id: userId,
            type_traitement: typeTraitement,
            accepte: accepte,
            date_consentement: Storage.today(),
            date_expiration: dateExp || null,
            signature: signature,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom
        };

        Storage.saveRGPDConsentement(consent);
        UI.closeModal();
        UI.toast('✓ Consentement enregistré', 'success');
        this.render();
    },

    showConsentDetail(consentId) {
        const consent = Storage.getRGPDConsentements().find(c => c.id === consentId);
        if (!consent) return;

        const user = Storage.getConfig().users.find(u => u.id === consent.user_id);

        const bodyHTML = `
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <div><strong>Utilisateur :</strong> ${user?.nom || 'N/A'}</div>
                <div><strong>Type traitement :</strong> ${UI.escapeHTML(consent.type_traitement)}</div>
                <div><strong>Statut :</strong> ${consent.accepte ? '✓ Accepté' : '✗ Refusé'}</div>
                <div><strong>Date consentement :</strong> ${Storage.formatDate(consent.date_consentement)}</div>
                <div><strong>Expiration :</strong> ${consent.date_expiration ? Storage.formatDate(consent.date_expiration) : '—'}</div>
                <div><strong>Signature :</strong> ${UI.escapeHTML(consent.signature || '—')}</div>
                <div><strong>Horodatisme :</strong> ${Storage.formatDateTime(consent.timestamp)}</div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
        `;

        UI.openModal('Détail consentement', bodyHTML, footerHTML);
    },

    revokeConsent(consentId) {
        if (!confirm('Révoquer ce consentement ?')) return;
        Storage.removeRGPDConsentement(consentId);
        UI.toast('✓ Consentement révoqué', 'success');
        this.render();
    },

    addTraitement() {
        const bodyHTML = `
            <div class="form-group">
                <label>Nom du traitement</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-nom-trait" placeholder="Ex: Gestion des relevés de température" required>
            </div>
            <div class="form-group">
                <label>Catégories de données concernées</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-cat-donnees" placeholder="Ex: Nom, email, données d'activité" required>
            </div>
            <div class="form-group">
                <label>Finalité</label>
                <textarea class="form-control" id="rgpd-finalite" rows="2" placeholder="Pourquoi ces données sont traitées" required></textarea>
            </div>
            <div class="form-group">
                <label>Base légale</label>
                <select class="form-control form-control-lg" id="rgpd-base-legale" required>
                    <option value="">Sélectionner...</option>
                    <option value="Consentement">Consentement</option>
                    <option value="Obligation légale">Obligation légale</option>
                    <option value="Intérêt légitime">Intérêt légitime</option>
                    <option value="Contrat">Contrat</option>
                    <option value="Obligations légales (HACCP/hygiène)">Obligations légales (HACCP)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Durée de conservation</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-duree" placeholder="Ex: 5 ans, 2 ans, indéfini" required>
            </div>
            <div class="form-group">
                <label>Destinataires</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-destinataires" placeholder="Ex: DDPP, CNIL, commissariat (si incident)">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="rgpd-transferts">
                    Transferts de données hors UE
                </label>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="RGPD.saveTraitement();">Enregistrer</button>
        `;

        UI.openModal('Nouveau traitement de données', bodyHTML, footerHTML);
    },

    saveTraitement() {
        const nomTraitement = document.getElementById('rgpd-nom-trait').value;
        const catDonnees = document.getElementById('rgpd-cat-donnees').value;
        const finalite = document.getElementById('rgpd-finalite').value;
        const baseLegale = document.getElementById('rgpd-base-legale').value;
        const duree = document.getElementById('rgpd-duree').value;
        const destinataires = document.getElementById('rgpd-destinataires').value;
        const transferts = document.getElementById('rgpd-transferts').checked;

        if (!nomTraitement || !catDonnees || !finalite || !baseLegale || !duree) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const traitement = {
            id: Storage.uid(),
            nom_traitement: nomTraitement,
            categories_donnees: catDonnees,
            finalite: finalite,
            base_legale: baseLegale,
            duree_conservation: duree,
            destinataires: destinataires,
            transferts_internationaux: transferts,
            date_enregistrement: Storage.today()
        };

        Storage.saveRGPDTraitement(traitement);
        UI.closeModal();
        UI.toast('✓ Traitement enregistré au registre', 'success');
        this.render();
    },

    editDPO() {
        const dpo = Storage.getRGPDDPO();

        const bodyHTML = `
            <div class="form-group">
                <label>Nom/Fonction responsable du traitement RGPD</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-dpo-name" value="${dpo.responsable || ''}" placeholder="Directeur, Responsable HACCP..." required>
            </div>
            <div class="form-group">
                <label>Fonction</label>
                <input type="text" class="form-control form-control-lg" id="rgpd-dpo-fonction" value="${dpo.fonction || ''}" placeholder="Ex: Directeur de cuisine, Responsable hygiène">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control form-control-lg" id="rgpd-dpo-email" value="${dpo.email || ''}" placeholder="email@etablissement.fr">
            </div>
            <div class="form-group">
                <label>Téléphone</label>
                <input type="tel" class="form-control form-control-lg" id="rgpd-dpo-phone" value="${dpo.telephone || ''}" placeholder="06 XX XX XX XX">
            </div>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-top:1rem;">
                Cette personne est la responsable légale de la conformité RGPD et doit être contactée en cas d'incident ou audit.
            </p>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="RGPD.saveDPO();">Enregistrer</button>
        `;

        UI.openModal('Désigner responsable RGPD', bodyHTML, footerHTML);
    },

    saveDPO() {
        const name = document.getElementById('rgpd-dpo-name').value;
        const fonction = document.getElementById('rgpd-dpo-fonction').value;
        const email = document.getElementById('rgpd-dpo-email').value;
        const phone = document.getElementById('rgpd-dpo-phone').value;

        if (!name) {
            UI.toast('Entrez le nom du responsable', 'warning');
            return;
        }

        Storage.saveRGPDDPO({ responsable: name, fonction, email, telephone: phone });
        UI.closeModal();
        UI.toast('✓ Responsable RGPD enregistré', 'success');
        this.render();
    },

    showExportUserModal() {
        const users = Storage.getConfig().users || [];
        const userOptions = users.map(u => `<option value="${u.id}">${u.nom}</option>`).join('');

        const bodyHTML = `
            <p style="color:var(--text-secondary);margin-bottom:1rem;">
                RGPD Art. 15 : Droit d'accès. L'utilisateur peut demander l'export de toutes ses données en format portable (JSON).
            </p>
            <div class="form-group">
                <label>Utilisateur</label>
                <select class="form-control form-control-lg" id="rgpd-export-user" required>
                    <option value="">Sélectionner...</option>
                    ${userOptions}
                </select>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="RGPD.exportUserData();">📥 Exporter données</button>
        `;

        UI.openModal('Exporter données utilisateur', bodyHTML, footerHTML);
    },

    exportUserData() {
        const userId = document.getElementById('rgpd-export-user').value;
        if (!userId) {
            UI.toast('Sélectionnez un utilisateur', 'warning');
            return;
        }

        const userData = {
            profil: Storage.getConfig().users.find(u => u.id === userId),
            consentements: Storage.getRGPDConsentements().filter(c => c.user_id === userId),
            formations: Storage.getFormations().filter(f => f.user_id === userId),
            // Autres données associées peuvent être ajoutées
            export_date: Storage.today(),
            export_droit_access: 'RGPD Article 15 - Droit d\'accès'
        };

        PDF.downloadJSON(`Donnees_Personnelles_${userData.profil?.nom || 'User'}.json`, userData);
        UI.toast('✓ Données exportées', 'success');
        UI.closeModal();
    },

    showDeleteUserModal() {
        const users = Storage.getConfig().users || [];
        const userOptions = users.map(u => `<option value="${u.id}">${u.nom}</option>`).join('');

        const bodyHTML = `
            <div style="padding:1rem;background:rgba(220,53,69,0.1);border-left:4px solid var(--danger);margin-bottom:1rem;border-radius:0.25rem;">
                <strong>⚠️ Action irréversible</strong><br>
                Ceci supprimera <strong>tous</strong> les enregistrements de l'utilisateur. Une copie archivée sera conservée 5 ans.
            </div>
            <div class="form-group">
                <label>Utilisateur à supprimer</label>
                <select class="form-control form-control-lg" id="rgpd-delete-user" required>
                    <option value="">Sélectionner...</option>
                    ${userOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Raison de suppression (RGPD art. 17)</label>
                <select class="form-control form-control-lg" id="rgpd-delete-reason" required>
                    <option value="">Sélectionner...</option>
                    <option value="Consentement retiré">Consentement retiré</option>
                    <option value="Données plus nécessaires">Données plus nécessaires</option>
                    <option value="Opposition droit oubli">Exercice droit à l'oubli</option>
                    <option value="Données traitées illégalement">Données traitées illégalement</option>
                    <option value="Obligation légale">Obligation légale</option>
                </select>
            </div>
            <label style="display:flex;gap:0.5rem;margin-top:1rem;">
                <input type="checkbox" id="rgpd-confirm-delete" required>
                <span>Je confirme la suppression irréversible de ces données</span>
            </label>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-danger" onclick="RGPD.confirmDeleteUser();">🗑️ Supprimer définitivement</button>
        `;

        UI.openModal('Suppression données (Droit à l\'oubli)', bodyHTML, footerHTML);
    },

    confirmDeleteUser() {
        const userId = document.getElementById('rgpd-delete-user').value;
        const reason = document.getElementById('rgpd-delete-reason').value;
        const confirmed = document.getElementById('rgpd-confirm-delete').checked;

        if (!userId || !reason || !confirmed) {
            UI.toast('Complétez tous les champs', 'warning');
            return;
        }

        // Archiver avant suppression (RGPD compliance)
        const userData = {
            user_id: userId,
            deletion_date: Storage.today(),
            deletion_reason: reason,
            deleted_by: App.currentUser.nom,
            archived: true
        };

        Storage.archiveDeletedUser(userData);
        Storage.deleteUser(userId);

        UI.closeModal();
        UI.toast('✓ Données supprimées & archivées (5 ans)', 'success');
        this.render();
        Journal.log('rgpd', `Suppression données utilisateur (droit oubli): ${reason}`, userData);
    },

    downloadReglement() {
        const content = `
RÈGLEMENT (UE) 2016/679 — RESPECT RGPD
Établissement: ${Storage.getConfig().etablissement}

DROITS DES UTILISATEURS:
- Droit d'accès: Demander l'export de ses données
- Droit de rectification: Corriger ses informations
- Droit à l'oubli: Demander suppression données
- Droit à la limitation: Limiter le traitement
- Droit à la portabilité: Récupérer données format portable
- Droit d'opposition: Refuser traitement
- Droits relatifs à la logique décisionnelle automatisée

OBLIGATIONS ÉTABLISSEMENT:
- Consentement explicite avant traitement
- Transparence sur l'utilisation des données
- Sécurité des données (chiffrement, accès contrôlé)
- Notification incidents (72h à CNIL si risque)
- Registre des traitements (art. 30)
- Désignation responsable RGPD

DONNÉES COLLECTÉES:
- Données de connexion/authentification
- Données d'activité (audit trail)
- Données de formation
- Données d'audit HACCP
- Données de traçabilité

DURÉE CONSERVATION:
- Données personnelles: Durée activité + 5 ans
- Données audit: 5 ans (légal)
- Consentements: Illimité (preuve)

RESPONSABLE DONNÉES:
${Storage.getRGPDDPO().responsable || 'À désigner'}
${Storage.getRGPDDPO().email || ''}
${Storage.getRGPDDPO().telephone || ''}

CONTACT CNIL: www.cnil.fr
        `;

        PDF.downloadText('RGPD_Règlement.txt', content);
        UI.toast('✓ Texte RGPD téléchargé', 'success');
    },

    downloadDPA() {
        const content = `
CONTRAT DE TRAITEMENT DE DONNÉES PERSONNELLES
Data Processing Agreement (DPA) — RGPD Art. 28

À conclure entre le Responsable du traitement et le Sous-traitant.

ARTICLE 1 — OBJET
Le Responsable confie au Sous-traitant le traitement de données personnelles 
relatives à ses utilisateurs conformément au RGPD.

ARTICLE 2 — DONNÉES TRAITÉES
- Données de connexion
- Données d'activité
- Données de formation
- Données d'audit HACCP

ARTICLE 3 — FINALITÉ
Assurer la conformité réglementaire en hygiène alimentaire (HACCP).

ARTICLE 4 — OBLIGATIONS SOUS-TRAITANT
- Traiter données sur instruction écrite
- Garantir confidentialité du personnel
- Implémenter mesures sécurité appropriées
- Notifier immédiatement tout incident
- Assister responsable dans exercice droits personnes
- Supprimer ou restituer données fin contrat

ARTICLE 5 — AUDIT & CONTRÔLE
Responsable peut auditer conformité sous-traitant à tout moment.

ARTICLE 6 — RÉSILIATION
Contrat peut être résilié moyennant 30 jours. Données restituées ou supprimées.

ARTICLE 7 — DURÉE
Valide tant que traitement données.

SIGNATURES:

Responsable du traitement: _______________________
Date: _______________________

Sous-traitant: _______________________
Date: _______________________

---
À adapter à votre fournisseur/prestataire.
        `;

        PDF.downloadText('DPA_Modele.txt', content);
        UI.toast('✓ Modèle DPA téléchargé', 'success');
    },

    downloadMentionsLegales() {
        const content = `
MENTIONS LÉGALES & POLITIQUE DE CONFIDENTIALITÉ
OK Cuisine — Application HACCP

ÉDITEUR
Nom établissement: ${Storage.getConfig().etablissement}
Responsable: ${Storage.getRGPDDPO().responsable || 'À désigner'}
Email: ${Storage.getRGPDDPO().email || 'contact@etablissement.fr'}

HÉBERGEMENT
Application hébergée localement (localStorage navigateur).
Aucun serveur externe.

DONNÉES PERSONNELLES
Données collectées: Profils utilisateurs, activité HACCP.
Durée conservation: Durée utilisation + 5 ans archive.

DROITS UTILISATEURS (RGPD)
Droit d'accès: Demander export données
Droit à l'oubli: Demander suppression
Droit de rectification: Corriger informations
Droit d'opposition: Refuser certains traitements

CONTACT RGPD
Responsable données: ${Storage.getRGPDDPO().responsable || '—'}
Email: ${Storage.getRGPDDPO().email || '—'}
Téléphone: ${Storage.getRGPDDPO().telephone || '—'}

CONFORMITÉ LÉGALE
- Règlement (CE) 852/2004 (hygiène)
- Règlement (CE) 1169/2011 (allergènes)
- Règlement (UE) 2016/679 (RGPD)
- Loi AGEC 2020-105 (gaspillage)

ÚLTIMA ACTUALIZACIÓN: ${Storage.formatDate(Storage.today())}
        `;

        PDF.downloadText('Mentions_Legales.txt', content);
        UI.toast('✓ Mentions légales téléchargées', 'success');
    },

    downloadPolitiqueConfidentialite() {
        const content = `
POLITIQUE DE CONFIDENTIALITÉ
OK Cuisine — Application HACCP

1. COLLECTE DE DONNÉES
Nous collectons uniquement les données nécessaires au fonctionnement de l'application HACCP:
- Données d'identification (nom, prénom, rôle)
- Données d'activité (audit trail, timestamps)
- Données de formation et certification
- Données d'audit hygiène et sécurité alimentaire

2. UTILISATION DES DONNÉES
- Assurer conformité obligations alimentaires
- Générer rapports audit et certification
- Traçabilité incidents sanitaires
- Formations personnel
- Aucun partage avec tiers sauf obligation légale

3. STOCKAGE SÉCURISÉ
- Données locales sur appareil
- Aucun cloud sauf configuration explicite
- Accès contrôlé par authentification PIN
- Archivage 5 ans minimum

4. DROITS UTILISATEURS
Chaque utilisateur peut à tout moment:
- Demander accès ses données (export JSON)
- Faire rectifier informations inexactes
- Demander suppression (droit oubli RGPD)
- Retirer consentement traitement

5. INCIDENTS SÉCURITÉ
En cas de risque, notification:
- Responsable RGPD sous 72h
- Autorités compétentes si nécessaire
- Utilisateurs affectés directement

6. CONFORMITÉ LÉGALE
Application conforme:
- RGPD (UE 2016/679)
- CNIL français
- Normes hygiène alimentaire (CE 852/2004)

7. MODIFICATIONS
Politique peut être modifiée. Notification utilisateurs requise.

Responsable données: ${Storage.getRGPDDPO().responsable || '—'}
Contacte: ${Storage.getRGPDDPO().email || '—'}
Date mise à jour: ${Storage.formatDate(Storage.today())}
        `;

        PDF.downloadText('Politique_Confidentialite.txt', content);
        UI.toast('✓ Politique confidentialité téléchargée', 'success');
    },

    editTraitement(traitementId) {
        // Implémentation simplifiée — à développer selon besoins
        UI.toast('Fonction modification en cours de développement', 'info');
    },

    deleteTraitement(traitementId) {
        if (!confirm('Supprimer ce traitement du registre ?')) return;
        Storage.removeRGPDTraitement(traitementId);
        UI.toast('✓ Traitement supprimé du registre', 'success');
        this.render();
    }
};
