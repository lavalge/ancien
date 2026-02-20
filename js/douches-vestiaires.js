/* ============================================================
   OK CUISINE — Module Douches/Vestiaires
   Installations sanitaires: vestiaires, WC, douches, hygiène
   Conformité CE 852/2004 annexe II art. 4.2 (locaux)
   ============================================================ */

const DoushesVestiaires = {
    render() {
        const page = document.getElementById('page-douches-vestiaires');
        const checklist = Storage.getDoushesVestiaires();
        const config = Storage.getConfig();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🚿 Douches/Vestiaires — Installations sanitaires</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="DoushesVestiaires.showAddCheckModal()">
                        + Nouveau contrôle
                    </button>
                    <button class="btn btn-secondary" onclick="DoushesVestiaires.exportRapports()">
                        📄 Exporter checks
                    </button>
                </div>
            </div>

            <!-- Info légale -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">⚖️ Obligation Installation Sanitaire</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>CE 852/2004 annexe II art. 4.2 :</strong> L'établissement doit disposer de 
                    locaux/installations en nombre suffisant et maintenues en état de propreté/fonctionnement.
                    Cela inclut: toilettes, lavabos, vestiaires/douches, local nettoyage, poubelles.
                </p>
            </div>

            <!-- Description locaux -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <strong>🏗️ Installations de l'établissement</strong>
                    <button class="btn btn-secondary" style="padding:0.3rem 0.5rem;font-size:0.75rem;" onclick="DoushesVestiaires.editDescription()">Modifier</button>
                </div>
                ${config.installations_description ? `
                    <div style="padding:0.75rem;font-size:0.9rem;white-space:pre-wrap;">
${UI.escapeHTML(config.installations_description)}
                    </div>
                ` : `
                    <p style="padding:0.75rem;color:var(--text-secondary);">Aucune description. Cliquez pour ajouter (nombre de WC, vestiaires, douches, etc.)</p>
                `}
            </div>

            <!-- Checklist critères -->
            <div style="margin-bottom:1.5rem;">
                <h3 style="margin:0 0 1rem 0;font-size:1rem;">✓ Critères à contrôler régulièrement</h3>

                ${[
                    { id: 'toilettes', titre: '🚽 Toilettes', criteres: [
                        'Nombre suffisant (minimum 1 WC pour 15 perso)',
                        'Porte qui ferme, état général bon',
                        'Papier toilette + distributeur',
                        'Poubelle (coverte si possible)',
                        'Chasse d\'eau fonctionnelle',
                        'Aération/ventilation suffisante'
                    ]},
                    { id: 'lavabos', titre: '🚰 Lavabos (zones production)', criteres: [
                        'Nombre suffisant en cuisine',
                        'Eau chaude + eau froide',
                        'Mitigeur ou robinet mains-libres',
                        'Savon/gel antibactérien',
                        'Essuie-mains: électrique ou papier jetable',
                        'Proximité zone production'
                    ]},
                    { id: 'vestiaires', titre: '👔 Vestiaires/Locaux repos', criteres: [
                        'Séparé des locaux production',
                        'Vestiaires = 1 m² min. par agent',
                        'Casiers individuels/fermés',
                        'Miroir, banc',
                        'Tenue de travail stockée à part'
                    ]},
                    { id: 'douches', titre: '🚿 Douches (si obligatoires)', criteres: [
                        'Lieu de travail nécessitant douche',
                        'Eau chaude + eau froide',
                        'Robinet/mitigeur',
                        'Savon/shampoing',
                        'Serviettes propres/jetables',
                        'Intimité (portes fermant)'
                    ]},
                    { id: 'nettoyage', titre: '🧹 Local nettoyage/produits', criteres: [
                        'Stockage produits chimiques séparé',
                        'Armoire/étagère fermée',
                        'Ventilation adéquate',
                        'Équipements (balai, gants, chiffons)',
                        'Interdiction risque contam croisée',
                        'Registre produits (fiches de données)'
                    ]},
                    { id: 'poubelles', titre: '🗑️ Propreté générales', criteres: [
                        'Poubelles fermées en cuisine',
                        'Collecte régulière déchets',
                        'Absence nuisibles (insectes/rongeurs)',
                        'Pas de stockage locaux non-conforme',
                        'Humidité/température OK'
                    ]}
                ].map(section => `
                    <div class="card" style="margin-bottom:1rem;">
                        <div class="card-header" style="padding:0.75rem;">
                            <strong>${section.titre}</strong>
                        </div>
                        <div style="padding:0.75rem;">
                            <div style="display:grid;grid-template-columns:1fr;gap:0.5rem;">
                                ${section.criteres.map((c, idx) => `
                                    <label style="display:flex;gap:0.5rem;cursor:pointer;font-size:0.9rem;align-items:center;">
                                        <input type="checkbox" class="check-${section.id}" value="${c}"> ${c}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Historique contrôles -->
            <div style="margin-bottom:1.5rem;">
                <h3 style="margin:0 0 1rem 0;font-size:1rem;">📋 Historique des contrôles</h3>
                ${checklist.length === 0
                    ? UI.emptyState('🚿', 'Aucun contrôle effectué. Cliquez "+ Nouveau contrôle".')
                    : checklist.sort((a,b) => new Date(b.date) - new Date(a.date)).map(c => `
                        <div class="card" style="margin-bottom:0.75rem;border-left:4px solid ${c.resultat === 'conforme' ? 'var(--success)' : 'var(--danger)'};position:relative;">
                            <div class="card-header" style="padding:0.75rem;">
                                <strong>${c.resultat === 'conforme' ? '✓' : '✗'} Contrôle ${Storage.formatDate(c.date)}</strong>
                                <span style="font-size:0.8rem;color:var(--text-secondary);">Par ${c.personnel}</span>
                            </div>
                            <div style="padding:0.75rem;background:var(--bg-secondary);font-size:0.9rem;">
                                <div><strong>Critères OK:</strong> ${c.criteres_ok.length}/${c.criteres_total}</div>
                                ${c.non_conformites.length > 0 ? `
                                    <div style="margin-top:0.5rem;">
                                        <strong style="color:var(--danger);">Non-conformités:</strong><br>
                                        ${c.non_conformites.map(nc => `• ${nc}`).join('<br>')}
                                    </div>
                                ` : ''}
                                ${c.actions_correctives ? `
                                    <div style="margin-top:0.5rem;">
                                        <strong>Actions correctives:</strong><br>${UI.escapeHTML(c.actions_correctives)}
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display:flex;gap:0.5rem;padding:0.75rem;">
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="DoushesVestiaires.downloadCheck('${c.id}')">📄</button>
                                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="DoushesVestiaires.deleteCheck('${c.id}')">Supprimer</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    showAddCheckModal() {
        const bodyHTML = `
            <div class="form-group" style="margin-bottom:1rem;">
                <strong>Date du contrôle: ${Storage.today()}</strong>
            </div>

            <div class="form-group">
                <label>Responsable du contrôle</label>
                <input type="text" class="form-control" id="dv-personnel" placeholder="Nom" value="${App.currentUser.nom}">
            </div>

            <div style="max-height:400px;overflow-y:auto;border:1px solid var(--border-color);padding:1rem;border-radius:0.25rem;margin:1rem 0;">
                <!-- Checklist inline -->
                ${[
                    { id: 'toilettes', titre: '🚽 Toilettes', criteres: [
                        'Nombre suffisant',
                        'État bon/portes OK',
                        'Papier toilette présent',
                        'Poubelle',
                        'Chasse d\'eau OK',
                        'Ventilation OK'
                    ]},
                    { id: 'lavabos', titre: '🚰 Lavabos', criteres: [
                        'Nombre suffisant',
                        'Eau chaude/froide',
                        'Savon présent',
                        'Essuie-mains OK',
                        'À proximité production'
                    ]},
                    { id: 'vestiaires', titre: '👔 Vestiaires', criteres: [
                        'Séparé production',
                        'Casiers fermés',
                        'Propreté générale'
                    ]},
                    { id: 'douches', titre: '🚿 Douches', criteres: [
                        'Eau chaude/froide',
                        'Savon/shampoing',
                        'Serviettes propres',
                        'Intimité OK'
                    ]},
                    { id: 'nettoyage', titre: '🧹 Local nettoyage', criteres: [
                        'Produits bien stockés',
                        'Armoire fermée',
                        'Ventilation',
                        'Pas contam croisée'
                    ]},
                    { id: 'poubelles', titre: '🗑️ Hygiène générale', criteres: [
                        'Poubelles fermées',
                        'Pas nuisibles',
                        'Humidité/temp OK',
                        'Ordre/propreté'
                    ]}
                ].map(section => `
                    <div style="margin-bottom:1rem;">
                        <strong style="font-size:0.9rem;">${section.titre}</strong>
                        <div style="display:grid;grid-template-columns:1fr;gap:0.4rem;margin-top:0.5rem;">
                            ${section.criteres.map(c => `
                                <label style="display:flex;gap:0.5rem;cursor:pointer;font-size:0.85rem;">
                                    <input type="checkbox" class="dv-critere" value="${c}"> ${c}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="form-group">
                <label>Éléments non-conformes</label>
                <textarea class="form-control" id="dv-nc" rows="2" placeholder="Détails des non-conformités si présentes"></textarea>
            </div>

            <div class="form-group">
                <label>Actions correctives programmées</label>
                <textarea class="form-control" id="dv-actions" rows="2" placeholder="Ce qui doit être corrigé + calendrier"></textarea>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="DoushesVestiaires.saveCheck()">Enregistrer contrôle</button>
        `;

        UI.openModal('Contrôle installations sanitaires', bodyHTML, footerHTML);
    },

    saveCheck() {
        const personnel = document.getElementById('dv-personnel').value;
        const nc = document.getElementById('dv-nc').value;
        const actions = document.getElementById('dv-actions').value;

        const criteres_ok = Array.from(document.querySelectorAll('.dv-critere:checked')).map(c => c.value);

        if (criteres_ok.length === 0) {
            UI.toast('Cochez au moins un critère', 'warning');
            return;
        }

        const check = {
            id: Storage.uid(),
            date: Storage.today(),
            personnel: personnel,
            criteres_ok: criteres_ok,
            criteres_total: document.querySelectorAll('.dv-critere').length,
            non_conformites: nc ? nc.split('\n').filter(l => l.trim()) : [],
            actions_correctives: actions,
            resultat: nc ? 'non-conforme' : 'conforme',
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.saveDoushesVestiaires(check);

        if (nc) {
            Storage.addAlerte({
                id: Storage.uid(),
                type: 'installations_nc',
                titre: 'Non-conformités installations sanitaires',
                message: `${check.non_conformites.length} éléments à corriger`,
                urgence: 'moyenne',
                date: Storage.today(),
                lue: false
            });
        }

        UI.closeModal();
        UI.toast('✓ Contrôle enregistré', 'success');
        this.render();
        Journal.log('installations_sanitaires', `Contrôle: ${criteres_ok.length} critères OK`, check);
    },

    editDescription() {
        const config = Storage.getConfig();
        const current = config.installations_description || '';

        const bodyHTML = `
            <div class="form-group">
                <label>Description des installations sanitaires</label>
                <textarea class="form-control" id="dv-desc" rows="6" placeholder="Exemple:
- Toilettes: 2 WC séparés côté vestiaire
- Lavabos: 3 sur la production, 1 à l'entrée
- Vestiaires: 1 local 10m² avec casiers
- Douches: non obligatoires pour établissement
- Local nettoyage: armoire fermée sous l'évier" style="font-family:monospace;font-size:0.85rem;">${UI.escapeHTML(current)}</textarea>
            </div>
        `;

        let footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="DoushesVestiaires.saveDescription()">Enregistrer</button>
        `;

        UI.openModal('Décrire installations', bodyHTML, footerHTML);
    },

    saveDescription() {
        const desc = document.getElementById('dv-desc').value;
        let config = Storage.getConfig();
        config.installations_description = desc;
        Storage.saveConfig(config);
        UI.closeModal();
        UI.toast('✓ Description mise à jour', 'success');
        this.render();
    },

    downloadCheck(checkId) {
        const check = Storage.getDoushesVestiaires().find(c => c.id === checkId);
        if (!check) return;

        let content = `RAPPORT CONTRÔLE INSTALLATIONS SANITAIRES
Établissement: ${Storage.getConfig().etablissement}
Date: ${Storage.formatDate(check.date)}
Responsable: ${check.personnel}

RÉSULTAT: ${check.resultat.toUpperCase()}

Critères conformes: ${check.criteres_ok.length}/${check.criteres_total}

CRITÈRES OK:
${check.criteres_ok.map(c => `✓ ${c}`).join('\n')}
`;

        if (check.non_conformites.length > 0) {
            content += `\nNON-CONFORMITÉS:\n${check.non_conformites.map(nc => `✗ ${nc}`).join('\n')}`;
        }

        if (check.actions_correctives) {
            content += `\nACTIONS CORRECTIVES:\n${check.actions_correctives}`;
        }

        PDF.downloadText(`Controle_Installations_${Storage.formatDate(check.date)}.txt`, content);
        UI.toast('✓ Rapport exporté', 'success');
    },

    deleteCheck(checkId) {
        if (!confirm('Supprimer ce contrôle ?')) return;
        Storage.removeDoushesVestiaires(checkId);
        UI.toast('✓ Contrôle supprimé', 'success');
        this.render();
    },

    exportRapports() {
        const checks = Storage.getDoushesVestiaires();
        if (checks.length === 0) {
            UI.toast('Aucun contrôle', 'info');
            return;
        }

        let content = 'REGISTRE CONTRÔLES INSTALLATIONS SANITAIRES\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré: ${Storage.formatDate(Storage.today())}\n\n`;

        content += 'DATE\t|PERSONNEL\t|RESULTAT\t|CRITÈRES_OK/TOTAL\n';
        content += '-'.repeat(70) + '\n';

        checks.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(c => {
            content += `${c.date}\t|${c.personnel}\t|${c.resultat}\t|${c.criteres_ok.length}/${c.criteres_total}\n`;
        });

        PDF.downloadText('Registre_Controles_Installations.csv', content);
        UI.toast('✓ Registre exporté', 'success');
    }
};
