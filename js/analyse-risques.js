/* ============================================================
   OK CUISINE — Module Analyse des Risques HACCP
   Analyse formalisée: microbes, chimique, allergène
   Conformité ISO 22000 & approche HACCP 7 principes
   ============================================================ */

const AnalyseRisques = {
    render() {
        const page = document.getElementById('page-analyse-risques');
        const analyses = Storage.getAnalyseRisques();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🔬 Analyse des Risques HACCP</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="AnalyseRisques.showAddModal()">
                        + Nouvelle analyse
                    </button>
                    <button class="btn btn-secondary" onclick="AnalyseRisques.exportAnalyses()">
                        📄 Exporter analyses
                    </button>
                </div>
            </div>

            <!-- Rappel -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 Principe 1 HACCP — Analyse des risques</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligation :</strong> Analyser formellement les risques biologiques, chimiques et allergéniques
                    pour chaque processus/produit. Documenter probabilité/gravité pour identifier CCP (critiques).
                </p>
            </div>

            <div>
                ${analyses.length === 0 
                    ? UI.emptyState('🔬', 'Aucune analyse créée. Cliquez sur "+ Nouvelle analyse".')
                    : analyses.map(a => `
                        <div class="card" style="margin-bottom:1rem;">
                            <div class="card-header">
                                <span class="card-title">${UI.escapeHTML(a.nom_processus)}</span>
                            </div>
                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;margin-bottom:0.75rem;">
                                <strong>Risques identifiés :</strong><br>
                                ${a.risques.map(r => `
                                    <div style="margin:0.5rem 0;padding:0.5rem;background:white;color:#333;border-left:2px solid ${r.gravite === 'critique' ? 'var(--danger)' : r.gravite === 'majeur' ? 'var(--warning)' : 'var(--info)'};border-radius:0.25rem;">
                                        <strong>${r.type}</strong> - ${r.description}<br>
                                        <span style="font-size:0.85rem;">Probabilité: ${r.probabilite} | Gravité: ${r.gravite} | CCP: ${r.est_ccp ? '✓ OUI' : '—'}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="display:flex;gap:0.5rem;">
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="AnalyseRisques.editAnalyse('${a.id}')">✏️ Modifier</button>
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="AnalyseRisques.downloadAnalyse('${a.id}')">📄</button>
                                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="AnalyseRisques.deleteAnalyse('${a.id}')">Supprimer</button>
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
                <label>Nom du processus / Produit analysé</label>
                <input type="text" class="form-control form-control-lg" id="ar-processus" placeholder="Ex: Cuisson viande rouge" required>
            </div>

            <div style="margin:1rem 0;border-top:1px solid var(--border-color);padding-top:1rem;">
                <strong>Risques identifiés</strong>
                <p style="color:var(--text-muted);font-size:0.85rem;">Ajouter chaque risque identifié (biologique, chimique, allergène)</p>
            </div>

            <div id="ar-risques-list"></div>

            <button class="btn btn-secondary" style="margin-top:0.75rem;" onclick="AnalyseRisques.addRisqueField()">
                + Ajouter risque
            </button>

            <div class="form-group" style="margin-top:1rem;">
                <label>Mesure(s) de contrôle recommandée(s)</label>
                <textarea class="form-control" id="ar-mesures" rows="2" placeholder="Contrôles, procédures de prévention"></textarea>
            </div>
        `;

        // Initial risque field
        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="AnalyseRisques.saveAnalyse();">Enregistrer analyse</button>
        `;

        UI.openModal('Nouvelle analyse de risques', bodyHTML, footerHTML);
        
        // Add first empty field
        setTimeout(() => AnalyseRisques.addRisqueField(), 100);
    },

    addRisqueField() {
        const list = document.getElementById('ar-risques-list');
        const index = list.children.length;

        const html = `
            <div class="risque-field" style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;margin-bottom:0.75rem;border-left:3px solid var(--info);">
                <input type="hidden" class="risque-index" value="${index}">
                
                <label style="font-size:0.9rem;"><strong>Risque ${index + 1}</strong></label>

                <div class="form-group">
                    <label style="font-size:0.85rem;">Type de risque</label>
                    <select class="form-control" required>
                        <option value="">Sélectionner...</option>
                        <option value="Biologique (Listeria, E.coli...)">Biologique (bactéries pathogènes)</option>
                        <option value="Chimique (résidus pesti...)">Chimique (résidus, additifs)</option>
                        <option value="Allergène non déclaré">Allergène non déclaré</option>
                        <option value="Physique (corps étrangers)">Physique (corps étrangers)</option>
                        <option value="PRP (Pratiques Hygiene)">PRP - Pratiques hygiène insuffisantes</option>
                    </select>
                </div>

                <div class="form-group">
                    <label style="font-size:0.85rem;">Description détaillée du risque</label>
                    <textarea class="form-control" rows="2" placeholder="Comment/où ce risque peut survenir" style="font-size:0.85rem;"></textarea>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:0.85rem;">Probabilité</label>
                        <select class="form-control" required>
                            <option value="">Sélectionner...</option>
                            <option value="Faible">Faible</option>
                            <option value="Moyenne">Moyenne</option>
                            <option value="Élevée">Élevée</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label style="font-size:0.85rem;">Gravité si survient</label>
                        <select class="form-control" required>
                            <option value="">Sélectionner...</option>
                            <option value="mineur">Mineur</option>
                            <option value="majeur">Majeur</option>
                            <option value="critique">Critique (décès)</option>
                        </select>
                    </div>
                </div>

                <label style="margin-top:0.5rem;display:flex;gap:0.5rem;cursor:pointer;font-size:0.85rem;">
                    <input type="checkbox"> <span>Est un CCP (Point Critique de Contrôle)</span>
                </label>

                <button class="btn btn-danger" style="margin-top:0.5rem;padding:0.2rem 0.4rem;font-size:0.75rem;" 
                        onclick="this.closest('.risque-field').remove()">Supprimer</button>
            </div>
        `;

        list.insertAdjacentHTML('beforeend', html);
    },

    saveAnalyse() {
        const processus = document.getElementById('ar-processus').value;
        const mesures = document.getElementById('ar-mesures').value;

        if (!processus) {
            UI.toast('Entrez le nom du processus', 'warning');
            return;
        }

        const risques = [];
        document.querySelectorAll('.risque-field').forEach(field => {
            const type = field.querySelector('select').value;
            const desc = field.querySelectorAll('textarea')[0].value;
            const proba = field.querySelectorAll('select')[1].value;
            const gravite = field.querySelectorAll('select')[2].value;
            const ccp = field.querySelector('input[type="checkbox"]').checked;

            if (type && desc && proba && gravite) {
                risques.push({ type, desc, proba, gravite, ccp });
            }
        });

        if (risques.length === 0) {
            UI.toast('Ajoutez au moins un risque', 'warning');
            return;
        }

        const analyse = {
            id: Storage.uid(),
            nom_processus: processus,
            risques: risques,
            mesures_controle: mesures,
            date_analyse: Storage.today(),
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.saveAnalyseRisques(analyse);
        UI.closeModal();
        UI.toast('✓ Analyse enregistrée', 'success');
        this.render();
        Journal.log('analyse_risques', `Analyse risques: ${processus}`, analyse);
    },

    editAnalyse(analyseId) {
        UI.toast('Fonction modification en développement', 'info');
    },

    deleteAnalyse(analyseId) {
        if (!confirm('Supprimer cette analyse ?')) return;
        Storage.removeAnalyseRisques(analyseId);
        UI.toast('✓ Analyse supprimée', 'success');
        this.render();
    },

    downloadAnalyse(analyseId) {
        const analyse = Storage.getAnalyseRisques().find(a => a.id === analyseId);
        if (!analyse) return;

        let content = `
ANALYSE DES RISQUES HACCP
Établissement: ${Storage.getConfig().etablissement}
Date analyse: ${Storage.formatDate(analyse.date_analyse)}

PROCESSUS: ${analyse.nom_processus}

RISQUES IDENTIFIÉS:
`;
        analyse.risques.forEach((r, idx) => {
            content += `
${idx + 1}. ${r.type}
   Description: ${r.desc}
   Probabilité: ${r.proba}
   Gravité: ${r.gravite}
   CCP: ${r.ccp ? 'OUI' : 'NON'}
`;
        });

        content += `
MESURES DE CONTRÔLE:
${analyse.mesures_controle || '—'}

Analysé par: ${analyse.user}
        `;

        PDF.downloadText(`Analyse_Risques_${analyse.nom_processus}.txt`, content);
        UI.toast('✓ Analyse exportée', 'success');
    },

    exportAnalyses() {
        const analyses = Storage.getAnalyseRisques();
        if (analyses.length === 0) {
            UI.toast('Aucune analyse', 'info');
            return;
        }

        let content = 'REGISTRE ANALYSES RISQUES HACCP\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré le: ${Storage.formatDate(Storage.today())}\n\n`;

        analyses.forEach(a => {
            content += `\nPROCESSUS: ${a.nom_processus} (${Storage.formatDate(a.date_analyse)})\n`;
            a.risques.forEach((r, idx) => {
                content += `  ${idx + 1}. ${r.type} - ${r.desc} (${r.proba}/${r.gravite})${r.ccp ? ' [CCP]' : ''}\n`;
            });
        });

        PDF.downloadText('Registre_Analyses_Risques.txt', content);
        UI.toast('✓ Registre exporté', 'success');
    }
};
