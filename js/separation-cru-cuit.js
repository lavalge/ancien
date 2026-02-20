/* ============================================================
   OK CUISINE — Module Séparation Cru/Cuit
   Contamination croisée: procédures, zones, équipements
   Conformité CE 853/2004, CE 852/2004 art. 4
   ============================================================ */

const SeparationCruCuit = {
    render() {
        const page = document.getElementById('page-separation-cru-cuit');
        const plans = Storage.getSeparationPlans();
        const config = Storage.getConfig();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🔪 Séparation Cru/Cuit — Anti-contamination</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="SeparationCruCuit.showAddProcedureModal()">
                        + Ajouter procédure
                    </button>
                    <button class="btn btn-secondary" onclick="SeparationCruCuit.editLocalMap()">
                        🗺️ Plan locaux
                    </button>
                </div>
            </div>

            <!-- Info légale -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">⚠️ Risque de contamination croisée</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>CE 853/2004 annexe I :</strong> Les zones de production doivent être disposées 
                    de manière à éviter contamination entre matières premières (cru) et produits finis (cuit).
                    Nécessite: zones séparées, équipements dédiés, rangement spécifique, procédures écrites.
                </p>
            </div>

            <!-- Principes de base -->
            <div class="card" style="margin-bottom:1.5rem;padding:1rem;background:var(--bg-secondary);">
                <strong>🎯 Principes clés :</strong>
                <ul style="font-size:0.9rem;color:var(--text-secondary);margin:0.5rem 0 0 1rem;">
                    <li>Zones physiquement séparées pour cru/cuit</li>
                    <li>Équipements exclusifs (planches, couteaux, plateaux)</li>
                    <li>Rangement réfrigéré: cru en bas, cuit en haut</li>
                    <li>Nettoyage différencié avant passage d'un flux à l'autre</li>
                    <li>Procédures écrites + fiches instruction personnel</li>
                </ul>
            </div>

            <!-- Zones physiques -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <strong>📍 Zonage Établissement</strong>
                    <button class="btn btn-secondary" style="padding:0.3rem 0.5rem;font-size:0.75rem;" onclick="SeparationCruCuit.editZonage()">Modifier zones</button>
                </div>
                ${config.separation_zones ? `
                    <div style="padding:0.75rem;background:var(--bg-secondary);font-size:0.85rem;white-space:pre-wrap;font-family:monospace;">
${UI.escapeHTML(config.separation_zones)}
                    </div>
                ` : `
                    <p style="padding:0.75rem;color:var(--text-secondary);font-size:0.9rem;">Aucune description. Cliquez pour ajouter.</p>
                `}
            </div>

            <!-- Procédures -->
            <div style="margin-bottom:1.5rem;">
                <h3 style="margin:0 0 1rem 0;font-size:1rem;">📋 Procédures documentées</h3>
                ${plans.length === 0
                    ? UI.emptyState('🔪', 'Aucune procédure. Cliquez "+ Ajouter procédure".')
                    : plans.map(p => `
                        <div class="card" style="margin-bottom:0.75rem;border-left:3px solid var(--primary);">
                            <div class="card-header" style="padding:0.75rem;">
                                <strong>${p.nom_proc}</strong>
                                <span style="font-size:0.8rem;color:var(--text-secondary);">Catégorie: ${p.categorie}</span>
                            </div>
                            <div style="padding:0.75rem;background:var(--bg-secondary);font-size:0.9rem;">
                                <div><strong>Responsable:</strong> ${p.responsable}</div>
                                <div style="margin-top:0.5rem;white-space:pre-wrap;">${UI.escapeHTML(p.description)}</div>
                                ${p.equipements ? `<div style="margin-top:0.5rem;"><strong>Équipements concernés:</strong> ${UI.escapeHTML(p.equipements)}</div>` : ''}
                                ${p.validation_frequence ? `<div style="margin-top:0.5rem;"><strong>Validation:</strong> ${p.validation_frequence}</div>` : ''}
                            </div>
                            <div style="display:flex;gap:0.5rem;padding:0.75rem;">
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="SeparationCruCuit.downloadProcedure('${p.id}')">📄</button>
                                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="SeparationCruCuit.deleteProcedure('${p.id}')">Supprimer</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>

            <!-- Équipements -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <strong>🔧 Équipements Cru/Cuit</strong>
                    <button class="btn btn-secondary" style="padding:0.3rem 0.5rem;font-size:0.75rem;" onclick="SeparationCruCuit.editEquipements()">Gérer</button>
                </div>
                ${config.separation_equipements ? `
                    <div style="padding:0.75rem;font-size:0.85rem;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:var(--bg-secondary);">
                                    <th style="padding:0.5rem;text-align:left;">Type</th>
                                    <th style="padding:0.5rem;text-align:left;">CRU</th>
                                    <th style="padding:0.5rem;text-align:left;">CUIT</th>
                                    <th style="padding:0.5rem;text-align:left;">Couleur/Repère</th>
                                </tr>
                            </thead>
                            <tbody>
${config.separation_equipements.split('\n').filter(l => l.trim()).map(line => `
                                <tr style="border-bottom:1px solid var(--border-color);">
                                    <td style="padding:0.5rem;">${line.split('|')[0] || ''}</td>
                                    <td style="padding:0.5rem;">${line.split('|')[1] || ''}</td>
                                    <td style="padding:0.5rem;">${line.split('|')[2] || ''}</td>
                                    <td style="padding:0.5rem;">${line.split('|')[3] || ''}</td>
                                </tr>
`).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p style="padding:0.75rem;color:var(--text-secondary);font-size:0.9rem;">Non configuré. Cliquez pour ajouter.</p>
                `}
            </div>

            <!-- Rangement réfrigéré -->
            <div class="card">
                <div class="card-header">
                    <strong>❄️ Procedure Rangement Réfrigéré</strong>
                </div>
                <div style="padding:0.75rem;background:var(--bg-secondary);font-size:0.9rem;">
                    <strong>RÈGLE VERTICALE (bas → haut):</strong>
                    <ol style="margin:0.5rem 0 0 1.5rem;">
                        <li><strong style="color:var(--danger);">ÉTAGE BAS</strong> — Viandes/poissons crus</li>
                        <li><strong style="color:var(--warning);">ÉTAGE 2</strong> — Légumes crus (peuvent être au-dessus)</li>
                        <li><strong style="color:var(--info);">ÉTAGE 3</strong> — Produits cuits/fromages/œufs cuits</li>
                        <li><strong style="color:var(--success);">ÉTAGE SUPÉRIEUR</strong> — Produits prêts à manger, salades préparées</li>
                    </ol>
                </div>
            </div>
        `;
    },

    showAddProcedureModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Nom de la procédure</label>
                <input type="text" class="form-control form-control-lg" id="scc-nom" placeholder="Ex: Nettoyage entre flux cru/cuit" required>
            </div>

            <div class="form-group">
                <label>Catégorie</label>
                <select class="form-control form-control-lg" id="scc-categorie" required>
                    <option value="">Sélectionner...</option>
                    <option value="Procédure nettoyage/sanitation">Nettoyage entre flux</option>
                    <option value="Procedure rangement">Rangement réfrigération</option>
                    <option value="Designation equipements">Assignation équipements</option>
                    <option value="Flux preparation">Organisation workflow</option>
                    <option value="Formation personnel">Formation personnel</option>
                </select>
            </div>

            <div class="form-group">
                <label>Description détaillée de la procédure</label>
                <textarea class="form-control" id="scc-desc" rows="4" placeholder="Étapes, vérifications, responsables..." required></textarea>
            </div>

            <div class="form-group">
                <label>Équipements concernés</label>
                <input type="text" class="form-control" id="scc-equip" placeholder="Ex: Planches à découper, couteaux, plateaux">
            </div>

            <div class="form-group">
                <label>Responsable de cette procédure</label>
                <input type="text" class="form-control" id="scc-resp" placeholder="Responsable" value="${App.currentUser.nom}">
            </div>

            <div class="form-group">
                <label>Fréquence de validation / audit</label>
                <select class="form-control" id="scc-validation">
                    <option value="">Sélectionner...</option>
                    <option value="Quotidienne">Quotidienne</option>
                    <option value="Hebdomadaire">Hebdomadaire</option>
                    <option value="Mensuelle">Mensuelle</option>
                    <option value="Trimestrielle">Trimestrielle</option>
                </select>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="SeparationCruCuit.saveProcedure();">Enregistrer</button>
        `;

        UI.openModal('Nouvelle procédure séparation', bodyHTML, footerHTML);
    },

    saveProcedure() {
        const nom = document.getElementById('scc-nom').value;
        const cat = document.getElementById('scc-categorie').value;
        const desc = document.getElementById('scc-desc').value;
        const equip = document.getElementById('scc-equip').value;
        const resp = document.getElementById('scc-resp').value;
        const val = document.getElementById('scc-validation').value;

        if (!nom || !cat || !desc) {
            UI.toast('Complétez les champs obligatoires', 'warning');
            return;
        }

        const plan = {
            id: Storage.uid(),
            nom_proc: nom,
            categorie: cat,
            description: desc,
            equipements: equip,
            responsable: resp,
            validation_frequence: val,
            date_creation: Storage.today(),
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.saveSeparationPlan(plan);
        UI.closeModal();
        UI.toast('✓ Procédure enregistrée', 'success');
        this.render();
        Journal.log('separation_cru_cuit', `Procédure: ${nom}`, plan);
    },

    editZonage() {
        const config = Storage.getConfig();
        const current = config.separation_zones || '';

        const bodyHTML = `
            <div class="form-group">
                <label>Description des zones physiques de l'établissement</label>
                <textarea class="form-control" id="scc-zonage" rows="6" placeholder="Exemple:
- ZONE CRU: Réception viandes, préparation crue (mur nord)
  Équipements: Plan de travail CRU, réfrigérateur CRU
  Personnel: Accès limité
  
- ZONE CUIT: Cuisson, service (mur sud)
  Équipements: Plan de travail CUIT, hotte
  
- ZONE NEUTRE: Légumes, sauces..." style="font-family:monospace;font-size:0.85rem;">${UI.escapeHTML(current)}</textarea>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="SeparationCruCuit.saveZonage()">Enregistrer</button>
        `;

        UI.openModal('Décrire les zones', bodyHTML, footerHTML);
    },

    saveZonage() {
        const zonage = document.getElementById('scc-zonage').value;
        let config = Storage.getConfig();
        config.separation_zones = zonage;
        Storage.saveConfig(config);
        UI.closeModal();
        UI.toast('✓ Zones mises à jour', 'success');
        this.render();
    },

    editEquipements() {
        const config = Storage.getConfig();
        const current = config.separation_equipements || '';

        const bodyHTML = `
            <div class="form-group">
                <label>Tableau équipements Cru/Cuit</label>
                <textarea class="form-control" id="scc-eq" rows="8" placeholder="Type|CRU|CUIT|Couleur/Repère
Planches|Blanche-CRU|Jaune-CUIT|Étiquette rouge
Couteaux|Lame 20cm-CRU|Lame 25cm-CUIT|Poignée rouge
Plateaux|Inox-CRU|Inox-CUIT|Étiquette noir
Gants|Bleu|Rose|Label établissement" style="font-family:monospace;font-size:0.85rem;">${UI.escapeHTML(current)}</textarea>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="SeparationCruCuit.saveEquipements()">Enregistrer</button>
        `;

        UI.openModal('Équipements Cru/Cuit', bodyHTML, footerHTML);
    },

    saveEquipements() {
        const equip = document.getElementById('scc-eq').value;
        let config = Storage.getConfig();
        config.separation_equipements = equip;
        Storage.saveConfig(config);
        UI.closeModal();
        UI.toast('✓ Équipements mis à jour', 'success');
        this.render();
    },

    downloadProcedure(procedureId) {
        const plan = Storage.getSeparationPlans().find(p => p.id === procedureId);
        if (!plan) return;

        let content = `PROCÉDURE SÉPARATION CRU/CUIT
Établissement: ${Storage.getConfig().etablissement}
Date: ${Storage.formatDate(Storage.today())}

PROCÉDURE: ${plan.nom_proc}
Catégorie: ${plan.categorie}

DESCRIPTION:
${plan.description}

Équipements: ${plan.equipements || '—'}
Responsable: ${plan.responsable}
Validation: ${plan.validation_frequence || '—'}

Créée le: ${Storage.formatDate(plan.date_creation)}
Créée par: ${plan.user}
        `;

        PDF.downloadText(`Procedure_${plan.nom_proc}.txt`, content);
        UI.toast('✓ Procédure exportée', 'success');
    },

    deleteProcedure(procedureId) {
        if (!confirm('Supprimer cette procédure ?')) return;
        Storage.removeSeparationPlan(procedureId);
        UI.toast('✓ Procédure supprimée', 'success');
        this.render();
    },

    editLocalMap() {
        UI.toast('Plan locaux: modifier via module "Installations" (en développement)', 'info');
    }
};
