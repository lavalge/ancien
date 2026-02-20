/* ============================================================
   OK CUISINE — Module AGEC Avancé
   Gestion dons alimentaires, plan réduction gaspillage
   Conformité Loi AGEC 2020-105 & Article L541-15-2 Code env.
   ============================================================ */

const AGECAvance = {
    selectedTab: 'dons', // 'dons', 'plan_action', 'stats'

    render() {
        const page = document.getElementById('page-agec-avance');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">♻️ Loi AGEC — Réduction gaspillage & Dons</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="AGECAvance.showAddDonModal()">
                        + Enregistrer don
                    </button>
                    <button class="btn btn-secondary" onclick="AGECAvance.exportPlanAction()">
                        📄 Exporter plan action
                    </button>
                </div>
            </div>

            <!-- Rappel réglementaire -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 Loi AGEC (n°2020-105) — Réduction 50% gaspillage</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Objectif :</strong> Réduire de 50% gaspillage alimentaire d'ici 2025 (vs 2015). 
                    <strong>Obligation :</strong> Diagnostic établi, plan d'action documenté, dons alimentaires tracés, 
                    convention avec associations agréées. Restauration collective: 45€ min/repas à réduire.
                </p>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.selectedTab === 'dons' ? 'active' : ''}"
                        onclick="AGECAvance.selectedTab='dons'; AGECAvance.render();">
                    🎁 Dons alimentaires
                </button>
                <button class="tab-btn ${this.selectedTab === 'plan_action' ? 'active' : ''}"
                        onclick="AGECAvance.selectedTab='plan_action'; AGECAvance.render();">
                    📋 Plan d'action
                </button>
                <button class="tab-btn ${this.selectedTab === 'stats' ? 'active' : ''}"
                        onclick="AGECAvance.selectedTab='stats'; AGECAvance.render();">
                    📊 Statistiques
                </button>
            </div>

            <div id="agec-content" style="margin-top:1.5rem;">
                ${this._renderTabContent()}
            </div>
        `;
    },

    _renderTabContent() {
        switch (this.selectedTab) {
            case 'dons': return this._renderDons();
            case 'plan_action': return this._renderPlanAction();
            case 'stats': return this._renderStats();
            default: return '';
        }
    },

    _renderDons() {
        const dons = Storage.getAGECDons();
        const totalDons = dons.length;
        const totalKg = dons.reduce((sum, d) => sum + (d.quantite_kg || 0), 0);

        return `
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card info">
                    <div class="stat-label">Dons enregistrés</div>
                    <div class="stat-value">${totalDons}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Total kg donnés</div>
                    <div class="stat-value">${totalKg.toFixed(1)}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">🎁 Registre dons alimentaires</span>
                </div>

                <div style="margin-bottom:1rem;padding:0.75rem;background:var(--bg-secondary);border-left:3px solid var(--info);border-radius:0.25rem;">
                    <strong>📋 Obligation légale :</strong> Tous les dons doivent être tracés (date, quantité, bénéficiaire, conditions alimentaires).
                </div>

                ${dons.length === 0 
                    ? UI.emptyState('🎁', 'Aucun don enregistré.')
                    : `<div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Produit(s)</th>
                                    <th>Quantité</th>
                                    <th>Bénéficiaire</th>
                                    <th>État sanitaire</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dons.map(d => `
                                    <tr>
                                        <td>${Storage.formatDate(d.date_don)}</td>
                                        <td>${UI.escapeHTML(d.produits)}</td>
                                        <td>${d.quantite_kg} kg</td>
                                        <td>${UI.escapeHTML(d.benef_nom)}</td>
                                        <td>${d.etat_sanitaire === 'ok' ? '✓ OK' : '⚠️ À vérifier'}</td>
                                        <td>
                                            <button class="btn btn-secondary" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                    onclick="AGECAvance.showDonDetail('${d.id}')">Detail</button>
                                            <button class="btn btn-danger" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                                    onclick="AGECAvance.deleteDon('${d.id}')">Supprimer</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            </div>

            <div class="card" style="margin-top:1rem;">
                <div class="card-header">
                    <span class="card-title">🤝 Associations agréées (bénéficiaires dons)</span>
                </div>

                <button class="btn btn-primary" style="margin-bottom:1rem;" onclick="AGECAvance.showAddAssociationModal()">
                    + Ajouter association
                </button>

                ${this._renderAssociations()}
            </div>
        `;
    },

    _renderAssociations() {
        const assocs = Storage.getAGECAssociations();

        if (assocs.length === 0) {
            return UI.emptyState('🤝', 'Aucune association enregistrée.');
        }

        let html = '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
        assocs.forEach(a => {
            html += `
                <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;border-left:3px solid var(--info);">
                    <strong>${UI.escapeHTML(a.nom_assoc)}</strong><br>
                    <strong>Tel:</strong> ${a.contact_tel || '—'} | <strong>Email:</strong> ${a.contact_email || '—'}<br>
                    <strong>Agrément:</strong> ${a.num_agrément || 'À vérifier'} | <strong>Type:</strong> ${a.type_assoc}
                    <button class="btn btn-secondary" style="margin-top:0.5rem;padding:0.2rem 0.4rem;font-size:0.75rem;" 
                            onclick="AGECAvance.deleteAssociation('${a.id}')">Supprimer</button>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    _renderPlanAction() {
        const plan = Storage.getAGECPlanAction();

        return `
            <div class="card" style="margin-bottom:1rem;">
                <div class="card-header">
                    <span class="card-title">📋 Plan d'action réduction gaspillage</span>
                </div>

                <button class="btn btn-primary" style="margin-bottom:1rem;" onclick="AGECAvance.editPlanAction()">
                    ✏️ Éditer/Créer plan
                </button>

                ${!plan || !plan.diagnostic
                    ? UI.emptyState('📋', 'Plan d\'action non créé. Cliquez sur "Éditer".')
                    : `
                        <div style="display:flex;flex-direction:column;gap:1rem;">
                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                                <strong>Diagnostic initial :</strong><br>
                                ${UI.escapeHTML(plan.diagnostic)}
                            </div>

                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                                <strong>Actions prioritaires :</strong><br>
                                ${plan.actions ? plan.actions.split('\\n').map(a => `- ${a}`).join('<br>') : '—'}
                            </div>

                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                                <strong>Responsables & Calendrier :</strong><br>
                                ${UI.escapeHTML(plan.responsables || '—')}
                            </div>

                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                                <strong>Suivi indicateurs :</strong><br>
                                <ul style="margin:0.5rem 0;padding-left:1.5rem;">
                                    <li>Gaspillage/couvert/jour : ${plan.target_gaspillage || '—'}</li>
                                    <li>Kg dons/mois : ${plan.target_dons || '—'}</li>
                                    <li>Réduction % vs année précédente : 50% (objectif)</li>
                                </ul>
                            </div>

                            <div style="padding:0.75rem;background:rgba(0,123,255,0.1);border-left:3px solid var(--primary);border-radius:0.25rem;">
                                <strong>Date création :</strong> ${Storage.formatDate(plan.date_creation)}<br>
                                <strong>Dernière MAJ :</strong> ${Storage.formatDate(plan.date_maj || plan.date_creation)}
                            </div>
                        </div>
                    `
                }
            </div>
        `;
    },

    _renderStats() {
        const dons = Storage.getAGECDons();
        const gaspillage = Storage.getGaspillage(Storage.today());

        const totalDonsKg = dons.reduce((sum, d) => sum + (d.quantite_kg || 0), 0);
        const totalGaspillageKg = gaspillage.reduce((sum, g) => sum + (g.quantite_kg || 0), 0);

        return `
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card success">
                    <div class="stat-label">Total kg donnés</div>
                    <div class="stat-value">${totalDonsKg.toFixed(1)}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Total kg gaspillé</div>
                    <div class="stat-value">${totalGaspillageKg.toFixed(1)}</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Ratio dons/gaspillage</div>
                    <div class="stat-value">${totalGaspillageKg > 0 ? (totalDonsKg / totalGaspillageKg * 100).toFixed(0) : 0}%</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">📊 Synthèse AGEC</span>
                </div>
                <div style="font-size:0.9rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:0.75rem;">
                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                        <strong>Dons alimentaires :</strong><br>
                        Total dons enregistrés : ${dons.length}<br>
                        Quantité totale : ${totalDonsKg.toFixed(1)} kg<br>
                        Bénéficiaires uniques : ${new Set(dons.map(d => d.benef_nom)).size}
                    </div>

                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                        <strong>Gaspillage :</strong><br>
                        Kg gaspillé aujourd'hui : ${totalGaspillageKg.toFixed(1)}<br>
                        Objectif ADEME : 120 g/couvert<br>
                        Status : ${totalGaspillageKg > 0 ? '📊 À optimiser' : '✓ Bon'}
                    </div>

                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                        <strong>Conformité loi AGEC :</strong><br>
                        Plan d'action : ${Storage.getAGECPlanAction() && Storage.getAGECPlanAction().diagnostic ? '✓ Créé' : '❌ À créer'}<br>
                        Dons tracés : ${dons.length > 0 ? '✓ Oui' : '❌ À commencer'}<br>
                        Objectif 50% : ${totalGaspillageKg <= 60 ? '✓ Atteint' : '📊 En cours'}
                    </div>
                </div>
            </div>
        `;
    },

    showAddDonModal() {
        const assocs = Storage.getAGECAssociations();
        const assocOptions = assocs.map(a => `<option value="${a.id}">${UI.escapeHTML(a.nom_assoc)}</option>`).join('');

        const bodyHTML = `
            <div style="margin-bottom:1rem;padding:0.75rem;background:var(--info);background-color:rgba(23,162,184,0.1);border-radius:0.25rem;">
                <strong>📋 Obligation légale :</strong> Chaque don doit être documenté : date, quantité, bénéficiaire, conditions sanitaires.
            </div>

            <div class="form-group">
                <label>Date du don</label>
                <input type="date" class="form-control form-control-lg" id="agec-date-don" required value="${Storage.today()}">
            </div>
            <div class="form-group">
                <label>Produit(s) donnés</label>
                <textarea class="form-control" id="agec-produits" rows="2" placeholder="Énumération produits" required></textarea>
            </div>
            <div class="form-group">
                <label>Quantité (kg)</label>
                <input type="number" class="form-control form-control-lg" id="agec-quantite-kg" step="0.1" placeholder="Ex: 5.5" required>
            </div>
            <div class="form-group">
                <label>Bénéficiaire (association agréée)</label>
                <select class="form-control form-control-lg" id="agec-benef-id" required>
                    <option value="">Sélectionner...</option>
                    ${assocOptions}
                    <option value="autre">Autre (saisir manuellement)</option>
                </select>
            </div>
            <div class="form-group" id="agec-benef-autre" style="display:none;">
                <label>Nom bénéficiaire (autre)</label>
                <input type="text" class="form-control form-control-lg" id="agec-benef-nom" placeholder="Nom association">
            </div>
            <div class="form-group">
                <label>Conditions sanitaires</label>
                <select class="form-control form-control-lg" id="agec-etat-sanitaire" required>
                    <option value="">Sélectionner...</option>
                    <option value="ok">✓ OK - Aliments sains, consommables</option>
                    <option value="limite">⚠️ Limite - À consommer rapidement</option>
                    <option value="inspection">🔍 Inspection - À valider partenaire</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes (transport, conditions)</label>
                <textarea class="form-control" id="agec-notes" rows="2" placeholder="Détails livraison..."></textarea>
            </div>

            <script>
                document.getElementById('agec-benef-id').addEventListener('change', function() {
                    const autre = document.getElementById('agec-benef-autre');
                    autre.style.display = this.value === 'autre' ? 'block' : 'none';
                });
            </script>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="AGECAvance.saveDon();">Enregistrer don</button>
        `;

        UI.openModal('Enregistrer don alimentaire', bodyHTML, footerHTML);
    },

    saveDon() {
        const dateDon = document.getElementById('agec-date-don').value;
        const produits = document.getElementById('agec-produits').value;
        const quantiteKg = parseFloat(document.getElementById('agec-quantite-kg').value);
        const benefId = document.getElementById('agec-benef-id').value;
        const benefNom = document.getElementById('agec-benef-nom').value;
        const etatSanitaire = document.getElementById('agec-etat-sanitaire').value;
        const notes = document.getElementById('agec-notes').value;

        if (!dateDon || !produits || !quantiteKg || !etatSanitaire || (!benefId || (benefId === 'autre' && !benefNom))) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        let nomBenef = benefNom;
        if (benefId !== 'autre') {
            const assoc = Storage.getAGECAssociations().find(a => a.id === benefId);
            nomBenef = assoc ? assoc.nom_assoc : 'Inconnu';
        }

        const don = {
            id: Storage.uid(),
            date_don: dateDon,
            produits: produits,
            quantite_kg: quantiteKg,
            benef_id: benefId === 'autre' ? null : benefId,
            benef_nom: nomBenef,
            etat_sanitaire: etatSanitaire,
            notes: notes,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom
        };

        Storage.saveAGECDon(don);
        UI.closeModal();
        UI.toast('✓ Don enregistré & tracé légalement', 'success');
        this.render();
        Journal.log('agec', `Don alimentaire: ${quantiteKg}kg à ${nomBenef}`, don);
    },

    showAddAssociationModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Nom association</label>
                <input type="text" class="form-control form-control-lg" id="agec-assoc-nom" placeholder="Ex: Banque alimentaire..." required>
            </div>
            <div class="form-group">
                <label>Type association</label>
                <select class="form-control form-control-lg" id="agec-assoc-type" required>
                    <option value="">Sélectionner...</option>
                    <option value="Banque alimentaire">Banque alimentaire</option>
                    <option value="Association caritative">Association caritative</option>
                    <option value="Épicerie sociale">Épicerie sociale</option>
                    <option value="Association lutte pauvreté">Association lutte pauvreté</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Numéro d'agrément (si applicable)</label>
                <input type="text" class="form-control form-control-lg" id="agec-assoc-agreg" placeholder="N° agrément">
            </div>
            <div class="form-group">
                <label>Téléphone contact</label>
                <input type="tel" class="form-control form-control-lg" id="agec-assoc-tel" placeholder="06 XX XX XX XX">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-control form-control-lg" id="agec-assoc-email" placeholder="contact@association.fr">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="AGECAvance.saveAssociation();">Ajouter association</button>
        `;

        UI.openModal('Ajouter association bénéficiaire', bodyHTML, footerHTML);
    },

    saveAssociation() {
        const nom = document.getElementById('agec-assoc-nom').value;
        const type = document.getElementById('agec-assoc-type').value;
        const agreg = document.getElementById('agec-assoc-agreg').value;
        const tel = document.getElementById('agec-assoc-tel').value;
        const email = document.getElementById('agec-assoc-email').value;

        if (!nom || !type) {
            UI.toast('Remplissez les champs obligatoires', 'warning');
            return;
        }

        const assoc = {
            id: Storage.uid(),
            nom_assoc: nom,
            type_assoc: type,
            num_agrément: agreg,
            contact_tel: tel,
            contact_email: email,
            date_ajout: Storage.today()
        };

        Storage.saveAGECAssociation(assoc);
        UI.closeModal();
        UI.toast('✓ Association ajoutée', 'success');
        this.render();
    },

    editPlanAction() {
        const plan = Storage.getAGECPlanAction() || {};

        const bodyHTML = `
            <div class="form-group">
                <label><strong>1. Diagnostic initial</strong> - État gaspillage actuellement</label>
                <textarea class="form-control" id="agec-diagnostic" rows="3" placeholder="Ex: 150g/couvert, manque de dons..." required>${plan.diagnostic || ''}</textarea>
            </div>

            <div class="form-group">
                <label><strong>2. Actions prioritaires</strong> (1 par ligne)</label>
                <textarea class="form-control" id="agec-actions" rows="4" placeholder="- Augmenter portion exacte
- Partenariat associations
- Sensibilisation personnel
- Collecte plateforme GASPILLAGE...
- Repérage dons" required>${plan.actions || ''}</textarea>
            </div>

            <div class="form-group">
                <label><strong>3. Responsables & Calendrier</strong></label>
                <textarea class="form-control" id="agec-responsables" rows="3" placeholder="Chef cusine: réduction portions (Jan)
Direction: partenariats (Fev-Mars)..." required>${plan.responsables || ''}</textarea>
            </div>

            <div class="form-group">
                <label><strong>4. Cible de réduction</strong> (g/couvert)</label>
                <input type="text" class="form-control form-control-lg" id="agec-target-gasp" placeholder="Ex: 60g/couvert (50% reduction)" value="${plan.target_gaspillage || ''}">
            </div>

            <div class="form-group">
                <label><strong>5. Cible dons mensuels</strong> (kg)</label>
                <input type="text" class="form-control form-control-lg" id="agec-target-dons" placeholder="Ex: 500 kg" value="${plan.target_dons || ''}">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="AGECAvance.savePlanAction();">Enregistrer plan</button>
        `;

        UI.openModal('Plan d\'action AGEC (Diagnostic + Actions)', bodyHTML, footerHTML);
    },

    savePlanAction() {
        const diagnostic = document.getElementById('agec-diagnostic').value;
        const actions = document.getElementById('agec-actions').value;
        const responsables = document.getElementById('agec-responsables').value;
        const targetGasp = document.getElementById('agec-target-gasp').value;
        const targetDons = document.getElementById('agec-target-dons').value;

        if (!diagnostic || !actions || !responsables) {
            UI.toast('Remplissez les champs obligatoires', 'warning');
            return;
        }

        const plan = {
            diagnostic: diagnostic,
            actions: actions,
            responsables: responsables,
            target_gaspillage: targetGasp,
            target_dons: targetDons,
            date_creation: Storage.today(),
            date_maj: Storage.today()
        };

        Storage.saveAGECPlanAction(plan);
        UI.closeModal();
        UI.toast('✓ Plan d\'action créé/mis à jour', 'success');
        this.render();
        Journal.log('agec', 'Plan action AGEC enregistré', plan);
    },

    showDonDetail(donId) {
        const don = Storage.getAGECDons().find(d => d.id === donId);
        if (!don) return;

        const bodyHTML = `
            <table style="width:100%;font-size:0.9rem;">
                <tr><td><strong>Date</strong></td><td>${Storage.formatDate(don.date_don)}</td></tr>
                <tr><td><strong>Produits</strong></td><td>${UI.escapeHTML(don.produits)}</td></tr>
                <tr><td><strong>Quantité</strong></td><td>${don.quantite_kg} kg</td></tr>
                <tr><td><strong>Bénéficiaire</strong></td><td>${UI.escapeHTML(don.benef_nom)}</td></tr>
                <tr><td><strong>État sanitaire</strong></td><td>${don.etat_sanitaire}</td></tr>
                <tr><td><strong>Notes</strong></td><td>${UI.escapeHTML(don.notes || '—')}</td></tr>
                <tr><td><strong>Enregistré par</strong></td><td>${don.user}</td></tr>
            </table>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
        `;

        UI.openModal('Détail don', bodyHTML, footerHTML);
    },

    deleteDon(donId) {
        if (!confirm('Supprimer ce don du registre ?')) return;
        Storage.removeAGECDon(donId);
        UI.toast('✓ Don supprimé', 'success');
        this.render();
    },

    deleteAssociation(assocId) {
        if (!confirm('Supprimer cette association ?')) return;
        Storage.removeAGECAssociation(assocId);
        UI.toast('✓ Association supprimée', 'success');
        this.render();
    },

    exportPlanAction() {
        const plan = Storage.getAGECPlanAction();
        if (!plan) {
            UI.toast('Aucun plan créé', 'info');
            return;
        }

        let content = `
PLAN D'ACTION RÉDUCTION GASPILLAGE ALIMENTAIRE
Établissement: ${Storage.getConfig().etablissement}
Date création: ${Storage.formatDate(plan.date_creation)}
Dernière MAJ: ${Storage.formatDate(plan.date_maj)}

CONTEXTE RÉGLEMENTAIRE:
Loi AGEC 2020-105 - Réduction 50% gaspillage d'ici 2025
Référence ADEME: 120 g/couvert restauration collective

--- DIAGNOSTIC INITIAL ---
${plan.diagnostic}

--- ACTIONS PRIORITAIRES ---
${plan.actions}

--- RESPONSABILITÉS & CALENDRIER ---
${plan.responsables}

--- OBJECTIFS MESURABLES ---
Réduction gaspillage: ${plan.target_gaspillage || '—'}
Dons mensuels: ${plan.target_dons || '—'}

--- SUIVI ---
À reviewed trimestriellement pendant 1 an.
        `;

        PDF.downloadText('Plan_Action_AGEC.txt', content);
        UI.toast('✓ Plan d\'action exporté', 'success');
    }
};
