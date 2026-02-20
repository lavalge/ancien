/* ============================================================
   OK CUISINE — Module Formation du Personnel
   Attestations de formation HACCP, hygiène, allergènes
   Conformité CE 852/2004 art. 5 — traçabilité formation
   ============================================================ */

const Formation = {
    selectedDate: null,
    filterUser: 'all',

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-formation');
        const users = Storage.getConfig().users || [];
        const formations = Storage.getFormations();
        const config = Storage.getConfig();

        // Filtrer par utilisateur
        let filledFormations = formations;
        if (this.filterUser !== 'all') {
            filledFormations = formations.filter(f => f.user_id === this.filterUser);
        }

        // Grouper par type
        const grouped = {};
        filledFormations.forEach(f => {
            if (!grouped[f.type]) grouped[f.type] = [];
            grouped[f.type].push(f);
        });

        const userOptions = `<option value="all">Tous les utilisateurs</option>` +
            users.map(u => `<option value="${u.id}" ${this.filterUser === u.id ? 'selected' : ''}>${u.nom}</option>`).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🎓 Formation du Personnel</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Formation.showAddModal()">
                        + Nouvelle formation
                    </button>
                    <button class="btn btn-secondary" onclick="Formation.exportAttestation()">
                        📜 Exporter attestations PDF
                    </button>
                </div>
            </div>

            <!-- Rappel réglementaire -->
            <div class="card" style="border-left:4px solid var(--info);">
                <div class="card-header">
                    <span class="card-title">📋 Conformité CE 852/2004</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligation :</strong> Chaque membre du personnel manipulant des denrées alimentaires doit suivre une formation 
                    en hygiène et sécurité sanitaire. Attestations obligatoires pour audit DDPP. 
                    Formation initiale + renouvellement annuel recommandé.
                </p>
            </div>

            <!-- Filtre -->
            <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
                <select class="form-control" style="width:auto;min-width:200px;"
                        onchange="Formation.filterUser=this.value; Formation.render();">
                    ${userOptions}
                </select>
            </div>

            <!-- Stats -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Formations totales</div>
                    <div class="stat-value">${filledFormations.length}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Utilisateurs formés</div>
                    <div class="stat-value">${new Set(formations.map(f => f.user_id)).size}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">À renouveler</div>
                    <div class="stat-value">${this._countExpiring()}</div>
                </div>
            </div>

            <!-- Formations expirant bientôt -->
            ${this._renderExpiringAlerts()}

            <!-- Formations par type -->
            <div>
                ${Object.keys(grouped).length === 0 
                    ? UI.emptyState('🎓', 'Aucune formation enregistrée. Cliquez sur "+ Nouvelle formation".')
                    : this._renderByType(grouped, users)
                }
            </div>
        `;
    },

    _renderExpiringAlerts() {
        const expiring = this._getExpiringFormations();
        if (expiring.length === 0) return '';

        return `
            <div class="card" style="border-left:4px solid var(--warning);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">⚠️ Formations expirant bientôt (30 jours)</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${expiring.map(f => {
                        const user = Storage.getConfig().users.find(u => u.id === f.user_id);
                        return `
                            <div style="padding:0.75rem;background:var(--bg-secondary);border-left:3px solid var(--warning);border-radius:0.25rem;">
                                <strong>${user ? user.nom : 'Utilisateur'}</strong> — ${f.type} 
                                <br><span style="font-size:0.9rem;color:var(--text-muted);">Expire le ${Storage.formatDate(f.date_expiration)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    _renderByType(grouped, users) {
        let html = '';
        const types = ['HACCP', 'Hygiène générale', 'Allergènes', 'Premiers secours', 'Nettoyage', 'Autre'];
        
        for (const type of types) {
            if (!grouped[type]) continue;
            const list = grouped[type];

            html += `
                <div class="card" style="margin-bottom:1rem;">
                    <div class="card-header">
                        <span class="card-title">${type}</span>
                        <span class="badge badge-info">${list.length}</span>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Utilisateur</th>
                                    <th>Date formation</th>
                                    <th>Formateur</th>
                                    <th>Validité</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list.map(f => {
                                    const user = users.find(u => u.id === f.user_id);
                                    const status = this._getStatus(f.date_expiration);
                                    return `
                                        <tr>
                                            <td><strong>${user ? user.nom : 'N/A'}</strong></td>
                                            <td>${Storage.formatDate(f.date_formation)}</td>
                                            <td>${UI.escapeHTML(f.formateur || '—')}</td>
                                            <td>${f.date_expiration ? Storage.formatDate(f.date_expiration) : '—'}</td>
                                            <td>${this._statusBadge(status)}</td>
                                            <td>
                                                <button class="btn btn-secondary" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                        onclick="Formation.showDetail('${f.id}')">Detail</button>
                                                <button class="btn btn-secondary" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                        onclick="Formation.downloadAttestation('${f.id}')">📜</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        return html;
    },

    _getStatus(dateExpiration) {
        if (!dateExpiration) return 'indeterminé';
        const today = new Date(Storage.today());
        const expDate = new Date(dateExpiration);
        const daysLeft = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) return 'expiré';
        if (daysLeft <= 30) return 'expirant';
        return 'valide';
    },

    _statusBadge(status) {
        const icons = {
            'valide': '<span style="color:var(--success);">✓ Valide</span>',
            'expirant': '<span style="color:var(--warning);">⚠️ Expiration 30j</span>',
            'expiré': '<span style="color:var(--danger);">✕ Expiré</span>',
            'indeterminé': '<span style="color:var(--text-muted);">— Indéterminé</span>'
        };
        return icons[status] || '';
    },

    _getExpiringFormations() {
        const today = new Date(Storage.today());
        return Storage.getFormations().filter(f => {
            if (!f.date_expiration) return false;
            const expDate = new Date(f.date_expiration);
            const daysLeft = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
            return daysLeft >= 0 && daysLeft <= 30;
        });
    },

    _countExpiring() {
        return this._getExpiringFormations().length;
    },

    showAddModal() {
        const users = Storage.getConfig().users || [];
        const userOptions = users.map(u => `<option value="${u.id}">${u.nom}</option>`).join('');
        const types = ['HACCP', 'Hygiène générale', 'Allergènes', 'Premiers secours', 'Nettoyage', 'Autre'];
        const typeOptions = types.map(t => `<option value="${t}">${t}</option>`).join('');

        const bodyHTML = `
            <div class="form-group">
                <label>Utilisateur</label>
                <select class="form-control form-control-lg" id="fm-user-id" required>
                    <option value="">Sélectionner...</option>
                    ${userOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Type de formation</label>
                <select class="form-control form-control-lg" id="fm-type" required>
                    <option value="">Sélectionner...</option>
                    ${typeOptions}
                    <option value="Autre">Autre (à préciser)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Autre type (si applicable)</label>
                <input type="text" class="form-control form-control-lg" id="fm-autre-type" placeholder="Préciser le type">
            </div>
            <div class="form-group">
                <label>Date de formation</label>
                <input type="date" class="form-control form-control-lg" id="fm-date-formation" required value="${Storage.today()}">
            </div>
            <div class="form-group">
                <label>Formateur / Organisme</label>
                <input type="text" class="form-control form-control-lg" id="fm-formateur" placeholder="Nom formateur ou organisme agréé" required>
            </div>
            <div class="form-group">
                <label>Date d'expiration (renouvellement)</label>
                <input type="date" class="form-control form-control-lg" id="fm-date-expiration" title="Laisser vide si sans limite de validité">
            </div>
            <div class="form-group">
                <label>Numéro d'attestation</label>
                <input type="text" class="form-control form-control-lg" id="fm-num-attestation" placeholder="N° attestation ou certification">
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea class="form-control" id="fm-notes" rows="3" placeholder="Contenu formation, points clés..."></textarea>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="Formation.saveFormation();">Enregistrer</button>
        `;

        UI.openModal('Nouvelle formation', bodyHTML, footerHTML);
    },

    saveFormation() {
        const userId = document.getElementById('fm-user-id').value;
        const type = document.getElementById('fm-type').value;
        const autreType = document.getElementById('fm-autre-type').value;
        const dateFormation = document.getElementById('fm-date-formation').value;
        const formateur = document.getElementById('fm-formateur').value;
        const dateExpiration = document.getElementById('fm-date-expiration').value;
        const numAttestation = document.getElementById('fm-num-attestation').value;
        const notes = document.getElementById('fm-notes').value;

        if (!userId || !type || !dateFormation || !formateur) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const finalType = type === 'Autre' ? autreType : type;
        if (!finalType) {
            UI.toast('Précisez le type de formation', 'warning');
            return;
        }

        const formation = {
            id: Storage.uid(),
            user_id: userId,
            type: finalType,
            date_formation: dateFormation,
            formateur: formateur,
            date_expiration: dateExpiration || null,
            num_attestation: numAttestation,
            notes: notes,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom
        };

        Storage.saveFormation(formation);
        UI.closeModal();
        UI.toast('✓ Formation enregistrée', 'success');
        this.render();
        Journal.log('formation', `Formation HACCP enregistrée : ${formation.type} pour ${Storage.getConfig().users.find(u => u.id === userId)?.nom || 'N/A'}`, formation);
    },

    showDetail(formationId) {
        const formation = Storage.getFormations().find(f => f.id === formationId);
        if (!formation) return;

        const user = Storage.getConfig().users.find(u => u.id === formation.user_id);
        const status = this._getStatus(formation.date_expiration);

        const bodyHTML = `
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Utilisateur</label>
                    <div style="font-size:1.1rem;font-weight:bold;">${user ? user.nom : 'N/A'}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Type de formation</label>
                    <div>${UI.escapeHTML(formation.type)}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Date de formation</label>
                    <div>${Storage.formatDate(formation.date_formation)}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Formateur / Organisme</label>
                    <div>${UI.escapeHTML(formation.formateur)}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Date expiration</label>
                    <div>${formation.date_expiration ? Storage.formatDate(formation.date_expiration) : 'Sans limite'}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">N° attestation</label>
                    <div>${UI.escapeHTML(formation.num_attestation || '—')}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Statut</label>
                    <div>${this._statusBadge(status)}</div>
                </div>
                <div>
                    <label style="color:var(--text-muted);font-size:0.85rem;">Notes</label>
                    <div>${UI.escapeHTML(formation.notes || '—')}</div>
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
            <button class="btn btn-danger" onclick="Formation.deleteFormation('${formationId}');">Supprimer</button>
        `;

        UI.openModal('Détail formation', bodyHTML, footerHTML);
    },

    deleteFormation(formationId) {
        if (!confirm('Confirmer la suppression ?')) return;
        Storage.removeFormation(formationId);
        UI.closeModal();
        UI.toast('✓ Formation supprimée', 'success');
        this.render();
    },

    downloadAttestation(formationId) {
        const formation = Storage.getFormations().find(f => f.id === formationId);
        if (!formation) return;

        const user = Storage.getConfig().users.find(u => u.id === formation.user_id);
        const config = Storage.getConfig();

        const content = `
ATTESTATION DE FORMATION EN HYGIÈNE ET SÉCURITÉ ALIMENTAIRE

Établissement : ${UI.escapeHTML(config.etablissement)}

Je certifie par la présente que ${user ? user.nom : 'N/A'}
a suivi et validé une formation en :

${UI.escapeHTML(formation.type)}

Date de formation : ${Storage.formatDate(formation.date_formation)}
Formateur / Organisme : ${UI.escapeHTML(formation.formateur)}
${formation.num_attestation ? `Certification n° : ${formation.num_attestation}` : ''}

Cette formation remplit les obligations en matière de sécurité sanitaire 
des aliments conformément au Règlement (CE) n° 852/2004.

${formation.date_expiration ? `Validité jusqu'au : ${Storage.formatDate(formation.date_expiration)}` : 'Validité illimitée'}

Établie le ${Storage.formatDate(Storage.today())}

Signature responsable : ________________________

Notes : ${formation.notes || ''}
        `;

        PDF.downloadText(`Attestation_Formation_${user?.nom || 'personnel'}.txt`, content);
        UI.toast('✓ Attestation téléchargée', 'success');
    },

    exportAttestation() {
        const formations = Storage.getFormations();
        if (formations.length === 0) {
            UI.toast('Aucune formation à exporter', 'warning');
            return;
        }

        let content = 'REGISTRE DE FORMATION HACCP\n';
        content += `Établissement : ${Storage.getConfig().etablissement}\n`;
        content += `Généré le : ${Storage.formatDate(Storage.today())}\n\n`;

        formations.forEach(f => {
            const user = Storage.getConfig().users.find(u => u.id === f.user_id);
            content += `---\nUtilisateur : ${user?.nom || 'N/A'}\n`;
            content += `Type : ${f.type}\n`;
            content += `Date : ${Storage.formatDate(f.date_formation)}\n`;
            content += `Formateur : ${f.formateur}\n`;
            content += `Expiration : ${f.date_expiration ? Storage.formatDate(f.date_expiration) : 'N/A'}\n`;
            content += `Attestation : ${f.num_attestation || 'N/A'}\n\n`;
        });

        PDF.downloadText('Registre_Formations_Complet.txt', content);
        UI.toast('✓ Registre téléchargé', 'success');
    }
};
