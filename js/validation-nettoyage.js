/* ============================================================
   OK CUISINE — Module Validation Nettoyage
   Tests d'efficacité nettoyage: ATP, contrôles visuels
   Conformité CE 852/2004 art. 4.4 (nettoyage/désinfection)
   ============================================================ */

const ValidationNettoyage = {
    render() {
        const page = document.getElementById('page-validation-nettoyage');
        const validations = Storage.getValidationNettoyages();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🧼 Validation Nettoyage — Efficacité</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="ValidationNettoyage.showAddModal()">
                        + Nouveau contrôle
                    </button>
                    <button class="btn btn-secondary" onclick="ValidationNettoyage.exportRapports()">
                        📄 Exporter rapports
                    </button>
                </div>
            </div>

            <!-- Rappel -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">🔬 Obligation — Validation nettoyage</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>CE 852/2004 art. 4.4 :</strong> Vérifier que les procédures nettoyage/désinfection 
                    sont efficaces. Utiliser tests ATP swabs, contrôles visuels, ou analyses microbiologiques. 
                    Documenter résultats et actions correctives.
                </p>
            </div>

            <!-- Dashboard -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
                <div class="card" style="background:linear-gradient(135deg,var(--success),rgba(76,175,80,0.1));">
                    <div style="padding:1rem;">
                        <div style="font-size:2rem;font-weight:bold;color:var(--success);">${validations.filter(v => v.resultat === 'conforme').length}</div>
                        <div style="font-size:0.9rem;color:var(--text-secondary);">Conformes</div>
                    </div>
                </div>
                <div class="card" style="background:linear-gradient(135deg,var(--warning),rgba(255,152,0,0.1));">
                    <div style="padding:1rem;">
                        <div style="font-size:2rem;font-weight:bold;color:var(--warning);">${validations.filter(v => v.resultat === 'non-conforme').length}</div>
                        <div style="font-size:0.9rem;color:var(--text-secondary);">Non conformes</div>
                    </div>
                </div>
            </div>

            <!-- Historique validations -->
            <div>
                ${validations.length === 0
                    ? UI.emptyState('🧼', 'Aucune validation. Lancez un contrôle d\'efficacité.')
                    : validations.sort((a,b) => new Date(b.date) - new Date(a.date)).map(v => `
                        <div class="card" style="margin-bottom:1rem;border-left:4px solid ${v.resultat === 'conforme' ? 'var(--success)' : 'var(--danger)'};position:relative;">
                            <div class="card-header">
                                <span class="card-title">
                                    ${v.resultat === 'conforme' ? '✓' : '✗'} ${UI.escapeHTML(v.lieu)}: ${v.type_test}
                                </span>
                                <span style="font-size:0.85rem;color:var(--text-secondary);">${Storage.formatDate(v.date)}</span>
                            </div>
                            <div style="padding:0.75rem;background:var(--bg-secondary);">
                                ${v.type_test === 'ATP' ? `
                                    <div><strong>Valeur ATP :</strong> ${v.atp_valeur} RLU ${v.atp_valeur <= 15 ? '✓ OK' : v.atp_valeur <= 30 ? '⚠️ Limites' : '✗ CRITIQUE'}</div>
                                ` : v.type_test === 'Visuel' ? `
                                    <div><strong>Résultat :</strong> ${v.constat_visuel}</div>
                                ` : `
                                    <div><strong>Analyses :</strong> ${v.analyses_resultat}</div>
                                `}
                                <div style="margin-top:0.5rem;"><strong>Personnel :</strong> ${UI.escapeHTML(v.personnel)}</div>
                                ${v.action_corrective ? `<div style="margin-top:0.5rem;"><strong>Action corrective : </strong> ${UI.escapeHTML(v.action_corrective)}</div>` : ''}
                            </div>
                            <div style="display:flex;gap:0.5rem;padding:0.75rem;">
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="ValidationNettoyage.downloadRapport('${v.id}')">📄</button>
                                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="ValidationNettoyage.deleteValidation('${v.id}')">Supprimer</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    showAddModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Lieu / Surface contrôlée</label>
                <input type="text" class="form-control form-control-lg" id="vn-lieu" placeholder="Ex: Plan de travail cuisine" required>
            </div>

            <div class="form-group">
                <label>Type de test</label>
                <select class="form-control form-control-lg" id="vn-type-test" onchange="ValidationNettoyage.updateTestFields()">
                    <option value="">Sélectionner...</option>
                    <option value="ATP">ATP Luminomètre (luminescence)</option>
                    <option value="Visuel">Contrôle visuel</option>
                    <option value="Microbiologique">Analyse microbiologique</option>
                </select>
            </div>

            <div id="vn-test-fields"></div>

            <div class="form-group" style="margin-top:1rem;">
                <label>Responsable du test</label>
                <input type="text" class="form-control" id="vn-personnel" placeholder="Nom" value="${App.currentUser.nom}">
            </div>

            <div class="form-group">
                <label>Actions correctives programmées (si non-conforme)</label>
                <textarea class="form-control" id="vn-actions" rows="2" placeholder="Descriptif + calendrier"></textarea>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="ValidationNettoyage.saveValidation();">Enregistrer</button>
        `;

        UI.openModal('Validation nettoyage', bodyHTML, footerHTML);
    },

    updateTestFields() {
        const type = document.getElementById('vn-type-test').value;
        const container = document.getElementById('vn-test-fields');

        if (type === 'ATP') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Valeur ATP (RLU - Relative Light Units)</label>
                    <input type="number" class="form-control" id="vn-atp-valeur" placeholder="0-300" min="0" required>
                </div>
                <div style="background:#f5f5f5;padding:0.75rem;border-radius:0.25rem;color:var(--text-secondary);font-size:0.85rem;">
                    <strong>Interprétation :</strong><br>
                    ≤ 15 RLU = ✓ Conforme (surface propre)<br>
                    16-30 RLU = ⚠️ Limites (nettoyage insuffisant)<br>
                    > 30 RLU = ✗ Non-conforme (contamination)
                </div>
            `;
        } else if (type === 'Visuel') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Constat visuel</label>
                    <textarea class="form-control" id="vn-constat-visuel" rows="2" placeholder="Résidus, taches, état surface..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Résultat</label>
                    <select class="form-control" id="vn-resultat-visuel" required>
                        <option value="">Sélectionner...</option>
                        <option value="Propre">Propre - pas de résidus</option>
                        <option value="Légèrement sale">Légèrement sale - résidus visibles</option>
                        <option value="Sale">Sale - important nettoyage nécessaire</option>
                    </select>
                </div>
            `;
        } else if (type === 'Microbiologique') {
            container.innerHTML = `
                <div class="form-group">
                    <label>Analyses demandées</label>
                    <input type="text" class="form-control" id="vn-analyses" placeholder="Ex: Flore totale, E.coli, Listeria" required>
                </div>
                <div class="form-group">
                    <label>Résultats (en attente ou reçus)</label>
                    <textarea class="form-control" id="vn-analyses-resultat" rows="2" placeholder="CFU/cm², résultats bruts..."></textarea>
                </div>
            `;
        }
    },

    saveValidation() {
        const lieu = document.getElementById('vn-lieu').value;
        const type_test = document.getElementById('vn-type-test').value;
        const personnel = document.getElementById('vn-personnel').value;
        const actions = document.getElementById('vn-actions').value;

        if (!lieu || !type_test) {
            UI.toast('Complétez les champs obligatoires', 'warning');
            return;
        }

        let resultat = 'conforme';
        let data = { type_test, personnel, action_corrective: actions };

        if (type_test === 'ATP') {
            const atp = parseInt(document.getElementById('vn-atp-valeur').value) || 0;
            data.atp_valeur = atp;
            resultat = atp <= 15 ? 'conforme' : 'non-conforme';
        } else if (type_test === 'Visuel') {
            const constat = document.getElementById('vn-constat-visuel').value;
            const resultat_visuel = document.getElementById('vn-resultat-visuel').value;
            data.constat_visuel = constat;
            data.resultat_visuel = resultat_visuel;
            resultat = resultat_visuel === 'Propre' ? 'conforme' : 'non-conforme';
        } else if (type_test === 'Microbiologique') {
            const analyses = document.getElementById('vn-analyses').value;
            const resultat_analyses = document.getElementById('vn-analyses-resultat').value;
            data.analyses = analyses;
            data.analyses_resultat = resultat_analyses;
        }

        const validation = {
            id: Storage.uid(),
            lieu: lieu,
            date: Storage.today(),
            ...data,
            resultat: resultat,
            type_test: type_test,
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.saveValidationNettoyage(validation);
        
        // Alerte si non-conforme
        if (resultat === 'non-conforme') {
            Storage.addAlerte({
                id: Storage.uid(),
                type: 'validation_nc',
                titre: `Nettoyage non-conforme: ${lieu}`,
                message: `${type_test} non-conforme. Action corrective requise.`,
                urgence: 'haute',
                date: Storage.today(),
                lue: false
            });
        }

        UI.closeModal();
        UI.toast('✓ Validation enregistrée', 'success');
        this.render();
        Journal.log('validation_nettoyage', `${type_test}: ${lieu} - ${resultat}`, validation);
    },

    downloadRapport(validationId) {
        const validation = Storage.getValidationNettoyages().find(v => v.id === validationId);
        if (!validation) return;

        let content = `RAPPORT VALIDATION NETTOYAGE
Établissement: ${Storage.getConfig().etablissement}
Date: ${Storage.formatDate(validation.date)}

LIEU: ${validation.lieu}
TYPE TEST: ${validation.type_test}
PERSONNEL: ${validation.personnel}

RÉSULTAT: ${validation.resultat.toUpperCase()}
`;

        if (validation.type_test === 'ATP') {
            content += `\nVALEUR ATP: ${validation.atp_valeur} RLU
Interprétation: ${validation.atp_valeur <= 15 ? 'Conforme (propre)' : validation.atp_valeur <= 30 ? 'Limites' : 'Non-conforme'}
`;
        } else if (validation.type_test === 'Visuel') {
            content += `\nCONSTAT: ${validation.constat_visuel}
Résultat: ${validation.resultat_visuel}
`;
        } else if (validation.type_test === 'Microbiologique') {
            content += `\nANALYSES: ${validation.analyses}
Résultats: ${validation.analyses_resultat}
`;
        }

        if (validation.action_corrective) {
            content += `\nACTIONS CORRECTIVES:\n${validation.action_corrective}`;
        }

        PDF.downloadText(`Rapport_Validation_${validation.lieu}.txt`, content);
        UI.toast('✓ Rapport exporté', 'success');
    },

    deleteValidation(validationId) {
        if (!confirm('Supprimer cette validation ?')) return;
        Storage.removeValidationNettoyage(validationId);
        UI.toast('✓ Validation supprimée', 'success');
        this.render();
    },

    exportRapports() {
        const validations = Storage.getValidationNettoyages();
        if (validations.length === 0) {
            UI.toast('Aucune validation', 'info');
            return;
        }

        let content = 'REGISTRE VALIDATIONS NETTOYAGE\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré: ${Storage.formatDate(Storage.today())}\n\n`;

        content += 'DATE\t|LIEU\t|TYPE_TEST\t|RESULTAT\t|PERSONNEL\n';
        content += '-'.repeat(80) + '\n';

        validations.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(v => {
            content += `${v.date}\t|${v.lieu}\t|${v.type_test}\t|${v.resultat}\t|${v.personnel}\n`;
        });

        PDF.downloadText('Registre_Validations_Nettoyage.csv', content);
        UI.toast('✓ Registre exporté', 'success');
    }
};
