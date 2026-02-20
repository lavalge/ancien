/* ============================================================
   OK CUISINE — Module PAI (Plan d'Accueil Individualisé)
   Gestion allergies alimentaires enfants etablissements scolaires
   Conformité Code pénal art. 223-1 (risque grave mort)
   ============================================================ */

const PAI = {
    selectedTab: 'enfants', // 'enfants', 'alertes', 'protocoles'

    render() {
        const page = document.getElementById('page-pai');
        const enfants = Storage.getPAIEnfants();
        const alertes = enfants.filter(e => e.allerg_severite === 'critique').length;

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">⚠️ PAI — Plan d'Accueil Individualisé</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="PAI.showAddEnfantModal()">
                        + Nouvel enfant PAI
                    </button>
                    <button class="btn btn-secondary" onclick="PAI.exportPAIsPDF()">
                        📄 Exporter tous PAI
                    </button>
                </div>
            </div>

            <!-- Rappel critique -->
            <div class="card" style="border-left:4px solid var(--danger);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">🔴 Conformité légale CRITIQUE</span>
                </div>
                <p style="color:var(--danger);font-size:0.9rem;margin:0;">
                    <strong>Code pénal art. 223-1 :</strong> Responsabilité pénale en cas de décès/hospitalisation par allergie non documentée. 
                    <strong>PAI obligatoire signé parents/médecin.</strong> Adrenaline auto-injecteur en établissement. 
                    <strong>Tous accueil/cuisine/récréation informés.</strong>
                </p>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.selectedTab === 'enfants' ? 'active' : ''}"
                        onclick="PAI.selectedTab='enfants'; PAI.render();">
                    👨‍👩‍👧 Enfants (${enfants.length})
                </button>
                <button class="tab-btn ${this.selectedTab === 'alertes' ? 'active' : ''}"
                        onclick="PAI.selectedTab='alertes'; PAI.render();">
                    🚨 Alertes critiques (${alertes})
                </button>
                <button class="tab-btn ${this.selectedTab === 'protocoles' ? 'active' : ''}"
                        onclick="PAI.selectedTab='protocoles'; PAI.render();">
                    📋 Protocoles d'urgence
                </button>
            </div>

            <div id="pai-content" style="margin-top:1.5rem;">
                ${this._renderTabContent()}
            </div>
        `;
    },

    _renderTabContent() {
        switch (this.selectedTab) {
            case 'enfants': return this._renderEnfants();
            case 'alertes': return this._renderAlertes();
            case 'protocoles': return this._renderProtocoles();
            default: return '';
        }
    },

    _renderEnfants() {
        const enfants = Storage.getPAIEnfants();

        return `
            <div>
                ${enfants.length === 0 
                    ? UI.emptyState('⚠️', 'Aucun PAI enregistré. Cliquez sur "+ Nouvel enfant PAI".')
                    : enfants.map(e => `
                        <div class="card" style="margin-bottom:1rem;border-left:5px solid ${e.allerg_severite === 'critique' ? 'var(--danger)' : 'var(--warning)'};">
                            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                                <div style="flex:1;">
                                    <span class="card-title">${UI.escapeHTML(e.nom_enfant)}</span>
                                    <span style="margin-left:1rem;color:var(--text-muted);font-size:0.85rem;">${e.classe || 'Classe ?'}</span>
                                </div>
                                <span style="font-weight:bold;color:${e.allerg_severite === 'critique' ? 'var(--danger)' : 'var(--warning)'};">${e.allerg_severite.toUpperCase()}</span>
                            </div>

                            <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;margin-bottom:0.75rem;">
                                <strong>Allergies :</strong> ${e.allergies.join(', ') || '—'}<br>
                                <strong>Parent responsable :</strong> ${UI.escapeHTML(e.parent_nom)} (${e.parent_tel || '?'})<br>
                                <strong>Médecin :</strong> ${UI.escapeHTML(e.medecin_nom || '—')} (${e.medecin_tel || '—'})<br>
                                <strong>PAI signé :</strong> ${e.pai_signe ? '✓ OUI le ' + Storage.formatDate(e.date_pai_signe) : '✗ NON (URGENT)'}
                            </div>

                            ${e.allerg_severite === 'critique' ? `
                                <div style="padding:0.75rem;background:rgba(220,53,69,0.1);border-left:3px solid var(--danger);margin-bottom:0.75rem;border-radius:0.25rem;">
                                    <strong>🔴 ALLERGIE CRITIQUE - Risque anaphylaxie</strong><br>
                                    <strong>Adrenaline auto-injecteur :</strong> ${e.adrenaline_present ? '✓ Présent' : '✗ ABSENT (URGENT)'}
                                    ${e.adrenaline_present ? ` - Expiration : ${e.adrenaline_expiration}` : ''}
                                </div>
                            ` : ''}

                            <div style="margin-bottom:0.75rem;">
                                <strong>Aliments INTERDITS :</strong> ${UI.escapeHTML(e.aliments_interdits || '—')}<br>
                                <strong>Plats de secours :</strong> ${UI.escapeHTML(e.plats_secours || '—')}
                            </div>

                            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="PAI.showDetail('${e.id}')">📋 Detail complet</button>
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="PAI.editEnfant('${e.id}')">✏️ Modifier</button>
                                <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="PAI.downloadPAI('${e.id}')">📄 PAI PDF</button>
                                <button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                        onclick="PAI.deleteEnfant('${e.id}')">Supprimer</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    _renderAlertes() {
        const enfants = Storage.getPAIEnfants().filter(e => e.allerg_severite === 'critique');

        return `
            <div class="card" style="border-left:4px solid var(--danger);">
                <div class="card-header">
                    <span class="card-title">🔴 Allergies alimentaires critiques (risque anaphylaxie)</span>
                </div>
                ${enfants.length === 0 
                    ? '<p style="color:var(--text-muted);">Aucune allergie critique enregistrée.</p>'
                    : `<div style="display:flex;flex-direction:column;gap:1rem;">
                        ${enfants.map(e => `
                            <div style="padding:0.75rem;background:rgba(220,53,69,0.1);border-left:3px solid var(--danger);border-radius:0.25rem;">
                                <strong>${UI.escapeHTML(e.nom_enfant)}</strong> (${e.classe})<br>
                                <strong>Allergies :</strong> ${e.allergies.join(', ')}<br>
                                <strong>Parent :</strong> ${UI.escapeHTML(e.parent_nom)} - <strong>Tel :</strong> ${e.parent_tel}<br>
                                <strong>Adrenaline auto-injecteur :</strong> ${e.adrenaline_present ? '✓ Présent' : '🔴 ABSENT - URGENT'}
                                ${e.adrenaline_present ? `<br><strong>Expiration :</strong> ${e.adrenaline_expiration}${new Date(e.adrenaline_expiration) < new Date() ? ' 🔴 EXPIRÉ' : ''}` : ''}
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
    },

    _renderProtocoles() {
        return `
            <div class="card" style="margin-bottom:1rem;">
                <div class="card-header">
                    <span class="card-title">🚑 Protocole d'urgence — Anaphylaxie</span>
                </div>
                <div style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6;">
                    <strong>1. RECONNAISSANCE SYMPTÔMES (< 5 min après ingestion) :</strong><br>
                    ☐ Difficultés respiratoires, sifflements<br>
                    ☐ Gonflement lèvres, langue, gorge<br>
                    ☐ Éruptions/urticaire sévère<br>
                    ☐ Vomissements, diarrhée, crampes<br>
                    ☐ Hypotension, perte conscience<br>

                    <br><strong>2. ACTIONS IMMÉDIATES :</strong><br>
                    ☐ <strong style="color:var(--danger);">APPELER SAMU 15 immédiatement</strong><br>
                    ☐ Allonger enfant sur le dos (jambes surélevées)<br>
                    ☐ <strong>INJECTER ADRENALINE AUTO-INJECTEUR</strong> dans la cuisse (habit ou peau)<br>
                    ☐ Appeler PARENT immédiatement<br>
                    ☐ Ne jamais laisser enfant seul<br>

                    <br><strong>3. DEUXIÈME INJECTION (si pas amélioration après 5-15 min) :</strong><br>
                    ☐ Injecter DEUXIÈME auto-injecteur si disponible<br>
                    ☐ Attendre SAMU (départ direct hôpital obligatoire)<br>

                    <br><strong>4. DOCUMENTATION :</strong><br>
                    ☐ Noter heure injection, symptômes<br>
                    ☐ Récupérer auto-injecteur utilisé pour hôpital<br>
                    ☐ Déposer plainte/incident URGENT si erreur<br>

                    <br><strong>État de choc : risque MORTEL < 30 min si untreated</strong>
                </div>
            </div>

            <div class="card" style="margin-bottom:1rem;">
                <div class="card-header">
                    <span class="card-title">📋 Affichage obligatoire cuisine</span>
                </div>
                <button class="btn btn-secondary" onclick="PAI.printAffichageCuisine()">
                    🖨️ Imprimer affichage allergies (A3)
                </button>
                <p style="color:var(--text-muted);font-size:0.85rem;margin-top:1rem;">
                    À afficher visiblement en cuisine : LISTE ENFANTS + ALLERGIES + CONTACTS URGENCE
                </p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">📞 Numéros d'urgence affichés partout</span>
                </div>
                <div style="font-weight:bold;font-size:1.2rem;display:flex;flex-direction:column;gap:0.5rem;">
                    <div>🚑 <strong style="color:var(--danger);">SAMU: 15</strong></div>
                    <div>☠️ <strong style="color:var(--danger);">POISON: 01 40 05 48 48</strong></div>
                    <div>👮 <strong>Police: 17</strong></div>
                    <div>🔥 <strong style="color:var(--warning);">Pompiers: 18</strong></div>
                </div>
            </div>
        `;
    },

    showAddEnfantModal() {
        const allergiesOptions = Allergenes.LISTE_ALLERGENES
            .map(a => `<label style="display:flex;gap:0.5rem;margin-bottom:0.5rem;cursor:pointer;">
                <input type="checkbox" value="${a.id}" class="pai-allergy-cb">
                ${a.icone} ${a.nom}
            </label>`).join('');

        const bodyHTML = `
            <div style="padding:0.75rem;background:var(--danger);background-color:rgba(220,53,69,0.1);margin-bottom:1rem;border-radius:0.25rem;">
                <strong>⚠️ PAI OBLIGATOIRE :</strong> Doit être SIGNÉ par parents + médecin scolaire.
            </div>

            <div class="form-group">
                <label>Nom enfant</label>
                <input type="text" class="form-control form-control-lg" id="pai-nom-enfant" placeholder="Prénom Nom" required>
            </div>
            <div class="form-group">
                <label>Classe/Âge</label>
                <input type="text" class="form-control form-control-lg" id="pai-classe" placeholder="Ex: CP, 3ème">
            </div>

            <div class="form-group">
                <label><strong>Sélectionnez les allergies</strong></label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;max-height:300px;overflow-y:auto;">
                    ${allergiesOptions}
                </div>
            </div>

            <div class="form-group">
                <label>Autres allergies (non standard)</label>
                <input type="text" class="form-control form-control-lg" id="pai-autre-allerg" placeholder="Arachides, latex, etc...">
            </div>

            <div class="form-group">
                <label>Sévérité</label>
                <select class="form-control form-control-lg" id="pai-severite" required>
                    <option value="">Sélectionner...</option>
                    <option value="modere">🟡 Modérée (eruption, démangeaisons)</option>
                    <option value="severe">🟠 Sévère (gonflement, mal respirer)</option>
                    <option value="critique">🔴 Critique (anaphylaxie, risque décès)</option>
                </select>
            </div>

            <div class="form-group">
                <label>Aliments INTERDITS dans ce réfectoire</label>
                <textarea class="form-control" id="pai-aliments-interdits" rows="2" placeholder="Énumération exacte" required></textarea>
            </div>

            <div class="form-group">
                <label>Plats de secours proposés par établissement</label>
                <textarea class="form-control" id="pai-plats-secours" rows="2" placeholder="Menu sans allergène proposé"></textarea>
            </div>

            <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:1rem;">
                <strong>Contact PARENT</strong>
            </div>

            <div class="form-group" style="margin-top:0.75rem;">
                <label>Nom parent/responsable</label>
                <input type="text" class="form-control form-control-lg" id="pai-parent-nom" placeholder="Prénom Nom" required>
            </div>
            <div class="form-group">
                <label>Téléphone parent (24/7)</label>
                <input type="tel" class="form-control form-control-lg" id="pai-parent-tel" placeholder="06 XX XX XX XX" required>
            </div>
            <div class="form-group">
                <label>Email parent</label>
                <input type="email" class="form-control form-control-lg" id="pai-parent-email">
            </div>

            <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:1rem;">
                <strong>Contact MÉDECIN SCOLAIRE / PRESCRIPTEUR</strong>
            </div>

            <div class="form-group" style="margin-top:0.75rem;">
                <label>Nom médecin</label>
                <input type="text" class="form-control form-control-lg" id="pai-medecin-nom" placeholder="Dr...">
            </div>
            <div class="form-group">
                <label>Téléphone médecin</label>
                <input type="tel" class="form-control form-control-lg" id="pai-medecin-tel">
            </div>

            <div style="border-top:1px solid var(--border-color);padding-top:1rem;margin-top:1rem;">
                <strong>Traitement d'urgence</strong>
            </div>

            <label style="display:flex;gap:0.5rem;margin-top:0.75rem;cursor:pointer;">
                <input type="checkbox" id="pai-adrenaline" onchange="document.getElementById('pai-adrenaline-details').style.display = this.checked ? 'block' : 'none';">
                <span>Adrenaline auto-injecteur présente à l'établissement</span>
            </label>

            <div id="pai-adrenaline-details" style="display:none;margin-top:0.75rem;padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                <div class="form-group">
                    <label>Numéro lot/Expiration</label>
                    <input type="date" class="form-control" id="pai-adrenaline-exp">
                </div>
                <div class="form-group">
                    <label>Lieu rangement</label>
                    <input type="text" class="form-control" id="pai-adrenaline-lieu" placeholder="Bureau direction, infirmerie...">
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="PAI.saveEnfant();">Enregistrer PAI</button>
        `;

        UI.openModal('Créer Plan Accueil Individualisé (PAI)', bodyHTML, footerHTML);
    },

    saveEnfant() {
        const nomEnfant = document.getElementById('pai-nom-enfant').value;
        const classe = document.getElementById('pai-classe').value;
        const severite = document.getElementById('pai-severite').value;
        const alimentsInterdits = document.getElementById('pai-aliments-interdits').value;
        const platSecours = document.getElementById('pai-plats-secours').value;
        const parentNom = document.getElementById('pai-parent-nom').value;
        const parentTel = document.getElementById('pai-parent-tel').value;
        const parentEmail = document.getElementById('pai-parent-email').value;
        const medecinNom = document.getElementById('pai-medecin-nom').value;
        const medecinTel = document.getElementById('pai-medecin-tel').value;
        const adrenalinePresent = document.getElementById('pai-adrenaline').checked;

        if (!nomEnfant || !classe || !severite || !alimentsInterdits || !parentNom || !parentTel) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        // Récupérer allergies sélectionnées
        const selectedAllergies = Array.from(document.querySelectorAll('.pai-allergy-cb:checked'))
            .map(cb => {
                const allergy = Allergenes.LISTE_ALLERGENES.find(a => a.id === cb.value);
                return allergy ? allergy.nom : cb.value;
            });
        const autreAllerg = document.getElementById('pai-autre-allerg').value;
        if (autreAllerg) selectedAllergies.push(autreAllerg);

        if (selectedAllergies.length === 0) {
            UI.toast('Sélectionnez au moins une allergie', 'warning');
            return;
        }

        const enfant = {
            id: Storage.uid(),
            nom_enfant: nomEnfant,
            classe: classe,
            allergies: selectedAllergies,
            allerg_severite: severite,
            aliments_interdits: alimentsInterdits,
            plats_secours: platSecours,
            parent_nom: parentNom,
            parent_tel: parentTel,
            parent_email: parentEmail,
            medecin_nom: medecinNom,
            medecin_tel: medecinTel,
            adrenaline_present: adrenalinePresent,
            adrenaline_expiration: adrenalinePresent ? document.getElementById('pai-adrenaline-exp').value : null,
            adrenaline_lieu: adrenalinePresent ? document.getElementById('pai-adrenaline-lieu').value : null,
            pai_signe: false,
            date_pai_signe: null,
            date_creation: Storage.today(),
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.savePAIEnfant(enfant);
        UI.closeModal();
        UI.toast('✓ PAI créé (À faire signer parents + médecin)', 'success');
        this.render();
        Journal.log('pai', `PAI créé: ${nomEnfant} (${enfant.classe})`, enfant);
    },

    showDetail(enfantId) {
        const enfant = Storage.getPAIEnfants().find(e => e.id === enfantId);
        if (!enfant) return;

        const bodyHTML = `
            <div style="max-height:500px;overflow-y:auto;">
                <div class="table-container">
                    <table style="width:100%;font-size:0.9rem;">
                        <tr>
                            <td><strong>Enfant</strong></td>
                            <td>${UI.escapeHTML(enfant.nom_enfant)}</td>
                        </tr>
                        <tr>
                            <td><strong>Classe</strong></td>
                            <td>${enfant.classe}</td>
                        </tr>
                        <tr>
                            <td><strong>Allergies</strong></td>
                            <td>${enfant.allergies.join(', ')}</td>
                        </tr>
                        <tr>
                            <td><strong>Sévérité</strong></td>
                            <td><strong style="color:${enfant.allerg_severite === 'critique' ? 'var(--danger)' : 'var(--warning)'}">${enfant.allerg_severite.toUpperCase()}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>Aliments interdits</strong></td>
                            <td>${UI.escapeHTML(enfant.aliments_interdits)}</td>
                        </tr>
                        <tr>
                            <td><strong>Plats de secours</strong></td>
                            <td>${UI.escapeHTML(enfant.plats_secours || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>Parent</strong></td>
                            <td>${UI.escapeHTML(enfant.parent_nom)} (${enfant.parent_tel})</td>
                        </tr>
                        <tr>
                            <td><strong>Médecin</strong></td>
                            <td>${UI.escapeHTML(enfant.medecin_nom || '—')} (${enfant.medecin_tel || '—'})</td>
                        </tr>
                        <tr>
                            <td><strong>PAI signé</strong></td>
                            <td>${enfant.pai_signe ? '✓ Oui' : '✗ Non (URGENT)'}</td>
                        </tr>
                        <tr>
                            <td><strong>Adrenaline</strong></td>
                            <td>${enfant.adrenaline_present ? '✓ Présente' : '✗ Absente'} ${enfant.adrenaline_expiration ? `(Exp: ${enfant.adrenaline_expiration})` : ''}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
        `;

        UI.openModal('Détail PAI', bodyHTML, footerHTML);
    },

    downloadPAI(enfantId) {
        const enfant = Storage.getPAIEnfants().find(e => e.id === enfantId);
        if (!enfant) return;

        const content = `
PLAN D'ACCUEIL INDIVIDUALISÉ (PAI)
Établissement: ${Storage.getConfig().etablissement}

ENFANT:
Nom: ${enfant.nom_enfant}
Classe: ${enfant.classe}
Date création: ${Storage.formatDate(enfant.date_creation)}

ALLERGIES ALIMENTAIRES:
Allergies: ${enfant.allergies.join(', ')}
Sévérité: ${enfant.allerg_severite.toUpperCase()}
Aliments STRICTEMENT INTERDITS:
${enfant.aliments_interdits}

PLAN D'ALIMENTATION:
Plats proposés sans allergène:
${enfant.plats_secours || '(À définir avec cuisine)'}

CONTACT PARENT/RESPONSABLE:
Nom: ${enfant.parent_nom}
Téléphone d'urgence (24/7): ${enfant.parent_tel}
Email: ${enfant.parent_email || '—'}

PRESCRIPTEUR MÉDICAL:
Médecin prescripteur: ${enfant.medecin_nom || '—'}
Téléphone: ${enfant.medecin_tel || '—'}

TRAITEMENT D'URGENCE:
Adrenaline auto-injecteur: ${enfant.adrenaline_present ? `OUI - Exp ${enfant.adrenaline_expiration} - Stock: ${enfant.adrenaline_lieu}` : 'NON'}

PROTOCOL ANAPHYLAXIE:
1. APPELER SAMU 15 IMMEDIATEMENT
2. Allonger enfant sur le dos
3. INJECTER ADRENALINE (cuisse)
4. APPELER PARENT
5. Attendre SAMU

SIGNATURE:
Parent: _________________________ Date: _______
Médecin: ________________________ Date: _______
Direction: ______________________ Date: _______

DOCUMENT LÉGAL — À conserver 1AN MINIMUM
Généré le: ${Storage.formatDate(Storage.today())}
        `;

        PDF.downloadText(`PAI_${enfant.nom_enfant}.txt`, content);
        UI.toast('✓ PAI téléchargé', 'success');
    },

    editEnfant(enfantId) {
        UI.toast('Fonction modification en développement', 'info');
    },

    deleteEnfant(enfantId) {
        if (!confirm('Supprimer ce PAI ? (Action irréversible)')) return;
        Storage.removePAIEnfant(enfantId);
        UI.toast('✓ PAI supprimé', 'success');
        this.render();
    },

    exportPAIsPDF() {
        const enfants = Storage.getPAIEnfants();
        if (enfants.length === 0) {
            UI.toast('Aucun PAI', 'info');
            return;
        }

        let content = '=== REGISTRE PAI ===\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré le: ${Storage.formatDate(Storage.today())}\n\n`;

        enfants.forEach(e => {
            content += `\nENFANT: ${e.nom_enfant} (${e.classe})\n`;
            content += `Allergies: ${e.allergies.join(', ')}\n`;
            content += `Sévérité: ${e.allerg_severite}\n`;
            content += `Parent: ${e.parent_nom} - ${e.parent_tel}\n`;
            content += `PAI signé: ${e.pai_signe ? 'OUI' : 'NON'}\n`;
            content += `---\n`;
        });

        PDF.downloadText('Registre_PAI_Complet.txt', content);
        UI.toast('✓ Registre PAI exporté', 'success');
    },

    printAffichageCuisine() {
        const enfants = Storage.getPAIEnfants();
        if (enfants.length === 0) {
            UI.toast('Aucun PAI à afficher', 'info');
            return;
        }

        let html = '<html><head><meta charset="UTF-8"><style>';
        html += 'body {font-family:Arial; margin:20px; font-size:14px;}';
        html += 'h1 {color:red; font-size:24px; border-bottom:3px solid red;}';
        html += '.child {border:2px solid red; margin:15px 0; padding:15px; background:#fff3cd;}';
        html += '.critical {background:#ffcccc; border-color:#cc0000;}';
        html += 'strong {color:red;}';
        html += '</style></head><body>';

        html += '<h1>⚠️ AFFICHAGE OBLIGATOIRE CUISINE - ALLERGIES ENFANTS</h1>';
        html += `<p><strong>À afficher en cuisine et réfectoire</strong></p>`;

        enfants.forEach(e => {
            const cssClass = e.allerg_severite === 'critique' ? 'child critical' : 'child';
            html += `<div class="${cssClass}">
                <strong>${e.nom_enfant} (${e.classe})</strong><br>
                <strong>ALLERGIES:</strong> ${e.allergies.join(', ')}<br>
                <strong>ALIMENTS INTERDITS:</strong> ${e.aliments_interdits}<br>
                <strong>Sévérité:</strong> ${e.allerg_severite.toUpperCase()}<br>
                <strong>Parent:</strong> ${e.parent_nom} - <strong>Tel:</strong> ${e.parent_tel}
                ${e.adrenaline_present ? `<br><strong>⚠️ ADRENALINE PRESENTE - Location: ${e.adrenaline_lieu}</strong>` : ''}
            </div>`;
        });

        html += `<p style="color:red;font-weight:bold;">EN CAS D'ALLERGIE GRAVE: APPELER SAMU 15 IMMEDIATEMENT</p>`;
        html += '</body></html>';

        const win = window.open('', '', 'width=800,height=900');
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 250);
    }
};
