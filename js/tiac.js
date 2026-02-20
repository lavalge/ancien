/* ============================================================
   OK CUISINE — Module TIAC (Toxi-Infection Alimentaire Collective)
   Gestion des incidents alimentaires, enquête rapide, notification DDPP
   Conformité CE 852/2004 art. 4 & art. 45, Règlement 1148/2014
   ============================================================ */

const TIAC = {
    selectedDate: null,
    filterStatus: 'all', // 'actifs', 'clos', 'all'

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-tiac');
        let incidents = Storage.getTIAC();

        // Filtre par statut
        if (this.filterStatus === 'actifs') {
            incidents = incidents.filter(i => !i.clos);
        } else if (this.filterStatus === 'clos') {
            incidents = incidents.filter(i => i.clos);
        }

        const totalIncidents = Storage.getTIAC().length;
        const incidentsActifs = Storage.getTIAC().filter(i => !i.clos).length;
        const critiques = Storage.getTIAC().filter(i => !i.clos && i.gravite === 'critique').length;

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🚨 TIAC — Incidents Sanitaires</h2>
                <div class="section-actions">
                    <button class="btn btn-danger btn-kitchen" onclick="TIAC.showAddModal()">
                        🚨 Signaler incident
                    </button>
                    <button class="btn btn-secondary" onclick="TIAC.exportDDPP()">
                        📄 Exporter notification DDPP
                    </button>
                </div>
            </div>

            <!-- Rappel réglementaire -->
            <div class="card" style="border-left:4px solid var(--danger);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 Obligation légale de signalement</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Règlement (CE) 1148/2014 & Art. 45 Reg. 178/2002 :</strong> 
                    Tout incident ou suspicion doit être signalé à la DDPP <strong>dans les 48 heures</strong>. 
                    Enquête interne obligatoire, isolement produits, traçabilité client immédiate.
                </p>
            </div>

            <!-- Stats critiques -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card ${critiques > 0 ? 'danger' : 'success'}">
                    <div class="stat-label">Incidents critiques</div>
                    <div class="stat-value">${critiques}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Actifs (en cours)</div>
                    <div class="stat-value">${incidentsActifs}</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Total incidents</div>
                    <div class="stat-value">${totalIncidents}</div>
                </div>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.filterStatus === 'actifs' ? 'active' : ''}"
                        onclick="TIAC.filterStatus='actifs'; TIAC.render();">
                    En cours (${incidentsActifs})
                </button>
                <button class="tab-btn ${this.filterStatus === 'clos' ? 'active' : ''}"
                        onclick="TIAC.filterStatus='clos'; TIAC.render();">
                    Clos
                </button>
                <button class="tab-btn ${this.filterStatus === 'all' ? 'active' : ''}"
                        onclick="TIAC.filterStatus='all'; TIAC.render();">
                    Tous (${totalIncidents})
                </button>
            </div>

            <!-- Liste incidents -->
            ${incidents.length === 0 
                ? UI.emptyState('✅', this.filterStatus === 'actifs' ? 'Aucun incident actif' : 'Aucun incident enregistré')
                : this._renderIncidents(incidents)
            }
        `;
    },

    _renderIncidents(incidents) {
        let html = '';
        
        for (const inc of incidents) {
            const days = Math.floor((new Date() - new Date(inc.timestamp)) / (1000 * 60 * 60 * 24));
            const urgence = days > 2 && !inc.clos ? '🔴 URGENT DDPP' : '';
            
            html += `
                <div class="card" style="margin-bottom:1rem;border-left:5px solid ${this._getColor(inc.gravite)};">
                    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="flex:1;">
                            <span class="card-title">${UI.escapeHTML(inc.titre)}</span>
                            <span style="margin-left:1rem;color:var(--text-muted);font-size:0.85rem;">
                                ${inc.type || 'Non spécifié'}
                            </span>
                        </div>
                        <span style="color:var(--danger);font-weight:bold;font-size:0.85rem;">${urgence}</span>
                    </div>
                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;margin-bottom:0.75rem;">
                        <strong>Description :</strong> ${UI.escapeHTML(inc.description || '—')}<br>
                        <strong>Date incident :</strong> ${Storage.formatDate(inc.date_incident)} à ${inc.heure_incident || '?'}<br>
                        <strong>Signalement :</strong> ${Storage.formatDateTime(inc.timestamp)} (${days}j)<br>
                        <strong>Gravité :</strong> ${inc.gravite.toUpperCase()} | <strong>Statut :</strong> ${inc.clos ? '✓ Clos' : '⚠️ ACTIF'}
                    </div>

                    ${inc.produits_impliques ? `
                        <div style="margin-bottom:0.75rem;">
                            <strong>Produits impliqués :</strong> ${UI.escapeHTML(inc.produits_impliques)}<br>
                            <strong>Quantité :</strong> ${inc.quantite_produit || '?'} | <strong>N° lot :</strong> ${inc.num_lot || '?'}
                        </div>
                    ` : ''}

                    ${inc.personnes_touchees ? `
                        <div style="margin-bottom:0.75rem;padding:0.5rem;background:var(--danger);background-color:rgba(220,53,69,0.1);border-radius:0.25rem;">
                            <strong>👥 Personnes touchées :</strong> ${inc.personnes_touchees} 
                            ${inc.symptomes ? `| Symptômes : ${UI.escapeHTML(inc.symptomes)}` : ''}
                        </div>
                    ` : ''}

                    ${inc.enquete_interne ? `
                        <div style="margin-bottom:0.75rem;padding:0.5rem;background:var(--bg-secondary);border-left:2px solid var(--info);">
                            <strong>Enquête interne :</strong> ${UI.escapeHTML(inc.enquete_interne)}<br>
                            <strong>Cause présumée :</strong> ${UI.escapeHTML(inc.cause_presumee || '—')}
                        </div>
                    ` : ''}

                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                onclick="TIAC.showDetail('${inc.id}')">📋 Détail complet</button>
                        ${!inc.clos ? `
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                    onclick="TIAC.showEnquete('${inc.id}')">🔍 Enquête</button>
                            <button class="btn btn-warning" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                    onclick="TIAC.closeIncident('${inc.id}')">✓ Clore</button>
                        ` : ''}
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                onclick="TIAC.exportIncident('${inc.id}')">📄 Exporter</button>
                    </div>
                </div>
            `;
        }
        
        return html;
    },

    _getColor(gravite) {
        const colors = {
            'critique': 'var(--danger)',
            'majeur': 'var(--warning)',
            'mineur': 'var(--info)'
        };
        return colors[gravite] || 'var(--text-muted)';
    },

    showAddModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Titre de l'incident</label>
                <input type="text" class="form-control form-control-lg" id="ti-titre" placeholder="Ex: Gastro équipe cuisine" required>
            </div>
            <div class="form-group">
                <label>Type d'incident</label>
                <select class="form-control form-control-lg" id="ti-type" required>
                    <option value="">Sélectionner...</option>
                    <option value="Toxi-infection collective (TIAC)">Toxi-infection collective (TIAC)</option>
                    <option value="Suspicion TIAC">Suspicion TIAC</option>
                    <option value="Allergie grave/anaphylaxie">Allergie grave/anaphylaxie</option>
                    <option value="Contamination chimique">Contamination chimique</option>
                    <option value="Corps étrangers">Corps étrangers</option>
                    <option value="Non-conformité température">Non-conformité température</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date et heure de l'incident</label>
                <div style="display:flex;gap:0.5rem;">
                    <input type="date" class="form-control" id="ti-date-incident" required value="${Storage.today()}">
                    <input type="time" class="form-control" id="ti-heure-incident" required>
                </div>
            </div>
            <div class="form-group">
                <label>Description détaillée</label>
                <textarea class="form-control" id="ti-description" rows="3" placeholder="Circonstances, observations..." required></textarea>
            </div>
            <div class="form-group">
                <label>Gravité</label>
                <select class="form-control form-control-lg" id="ti-gravite" required>
                    <option value="mineur">⚪ Mineur</option>
                    <option value="majeur">🟡 Majeur</option>
                    <option value="critique">🔴 Critique (hospitalisation/décès)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Produit(s) impliqué(s)</label>
                <input type="text" class="form-control form-control-lg" id="ti-produits" placeholder="Liste des produits">
            </div>
            <div class="form-group">
                <label>N° lot / DLC</label>
                <input type="text" class="form-control form-control-lg" id="ti-num-lot" placeholder="Numéro lot et date">
            </div>
            <div class="form-group">
                <label>Quantité consommée/prise</label>
                <input type="text" class="form-control form-control-lg" id="ti-quantite" placeholder="Ex: 50g, 2 portions">
            </div>
            <div class="form-group">
                <label>Nombre de personnes touchées</label>
                <input type="number" class="form-control form-control-lg" id="ti-personnes-touchees" min="0" placeholder="0">
            </div>
            <div class="form-group">
                <label>Symptômes observés</label>
                <input type="text" class="form-control form-control-lg" id="ti-symptomes" placeholder="Nausées, vomissements, diarrhée, douleurs abdominales...">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-danger" onclick="TIAC.saveIncident();">🚨 Signaler incident</button>
        `;

        UI.openModal('Signaler un incident / TIAC', bodyHTML, footerHTML);
    },

    saveIncident() {
        const titre = document.getElementById('ti-titre').value;
        const type = document.getElementById('ti-type').value;
        const dateIncident = document.getElementById('ti-date-incident').value;
        const heureIncident = document.getElementById('ti-heure-incident').value;
        const description = document.getElementById('ti-description').value;
        const gravite = document.getElementById('ti-gravite').value;
        const produits = document.getElementById('ti-produits').value;
        const numLot = document.getElementById('ti-num-lot').value;
        const quantite = document.getElementById('ti-quantite').value;
        const personnes = document.getElementById('ti-personnes-touchees').value;
        const symptomes = document.getElementById('ti-symptomes').value;

        if (!titre || !type || !dateIncident || !heureIncident || !description || !gravite) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const incident = {
            id: Storage.uid(),
            titre: titre,
            type: type,
            date_incident: dateIncident,
            heure_incident: heureIncident,
            description: description,
            gravite: gravite,
            produits_impliques: produits,
            num_lot: numLot,
            quantite_produit: quantite,
            personnes_touchees: personnes ? parseInt(personnes) : 0,
            symptomes: symptomes,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom,
            clos: false,
            ddpp_notified: false,
            enquete_interne: '',
            cause_presumee: '',
            actions_correctives: ''
        };

        Storage.saveTIAC(incident);
        UI.closeModal();
        UI.toast('🚨 Incident signalé — Enquête interne en cours', 'danger');
        this.render();
        Journal.log('tiac', `TIAC signalé : ${titre}`, incident);

        // Alerter les administrateurs
        const alerteAdmin = {
            id: Storage.uid(),
            titre: `🚨 INCIDENT SANITAIRE: ${titre}`,
            description: `Gravité ${gravite.toUpperCase()} - ${personnes || 0} personnes affectées`,
            niveau: gravite === 'critique' ? 'critique' : 'warning',
            type: 'tiac',
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom,
            resolved: false
        };
        Storage.addAlerte(alerteAdmin);
    },

    showEnquete(incidentId) {
        const incident = Storage.getTIAC().find(i => i.id === incidentId);
        if (!incident) return;

        const bodyHTML = `
            <div style="margin-bottom:1.5rem;">
                <h4 style="color:var(--primary);">Formulaire d'enquête rapide TIAC</h4>
                <p style="color:var(--text-muted);font-size:0.9rem;">
                    À compléter dans les 24h suivant le signalement pour établir les causes.
                </p>
            </div>

            <div class="form-group">
                <label><strong>1. Origine présumée</strong></label>
                <select class="form-control" id="ti-origine" required>
                    <option value="">Sélectionner...</option>
                    <option value="Matière première">Matière première</option>
                    <option value="Processus de cuisson">Processus de cuisson insuffisant</option>
                    <option value="Refroidissement">Refroidissement lent / inadéquat</option>
                    <option value="Contamination croisée">Contamination croisée</option>
                    <option value="Hygiène personnel">Hygiène du personnel</option>
                    <option value="Nettoyage">Nettoyage/désinfection défaillant</option>
                    <option value="Stockage température">Rupture chaîne froid/chaud</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>

            <div class="form-group">
                <label><strong>2. Conclusions enquête interne</strong></label>
                <textarea class="form-control" id="ti-enquete" rows="3" placeholder="Résultats investigation interne...">${incident.enquete_interne || ''}</textarea>
            </div>

            <div class="form-group">
                <label><strong>3. Cause présumée confirmée</strong></label>
                <textarea class="form-control" id="ti-cause" rows="2" placeholder="Cause déterminée après enquête...">${incident.cause_presumee || ''}</textarea>
            </div>

            <div class="form-group">
                <label><strong>4. Actions correctives immédiates</strong></label>
                <textarea class="form-control" id="ti-actions" rows="3" placeholder="Isolement produits, retrait chaîne, information clients...">${incident.actions_correctives || ''}</textarea>
            </div>

            <div class="form-group">
                <label>
                    <input type="checkbox" id="ti-ddpp-notify" ${incident.ddpp_notified ? 'checked' : ''}>
                    DDPP notifiée (à cocher après signalement)
                </label>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
            <button class="btn btn-primary" onclick="TIAC.saveEnquete('${incidentId}');">Enregistrer enquête</button>
        `;

        UI.openModal('Enquête TIAC — Déterminer causes', bodyHTML, footerHTML);
    },

    saveEnquete(incidentId) {
        const incident = Storage.getTIAC().find(i => i.id === incidentId);
        if (!incident) return;

        const origine = document.getElementById('ti-origine').value;
        const enquete = document.getElementById('ti-enquete').value;
        const cause = document.getElementById('ti-cause').value;
        const actions = document.getElementById('ti-actions').value;
        const ddppNotified = document.getElementById('ti-ddpp-notify').checked;

        incident.enquete_interne = enquete;
        incident.cause_presumee = cause;
        incident.actions_correctives = actions;
        incident.ddpp_notified = ddppNotified;

        Storage.saveTIAC(incident);
        UI.closeModal();
        UI.toast('✓ Enquête enregistrée', 'success');
        this.render();
        Journal.log('tiac', `Enquête TIAC complétée : ${incident.titre}`, { cause, actions });
    },

    closeIncident(incidentId) {
        const incident = Storage.getTIAC().find(i => i.id === incidentId);
        if (!incident) return;

        const confirmation = confirm(`Clore l'incident "${incident.titre}" ? (Action irréversible)`);
        if (!confirmation) return;

        incident.clos = true;
        incident.date_clos = Storage.today();
        incident.user_clos = App.currentUser.nom;

        Storage.saveTIAC(incident);
        UI.toast('✓ Incident clos', 'success');
        this.render();
        Journal.log('tiac', `Incident clos : ${incident.titre}`, incident);
    },

    showDetail(incidentId) {
        const incident = Storage.getTIAC().find(i => i.id === incidentId);
        if (!incident) return;

        const bodyHTML = `
            <div style="max-height:500px;overflow-y:auto;">
                <div class="table-container" style="margin-bottom:1rem;">
                    <table style="width:100%;font-size:0.9rem;">
                        <tr>
                            <td><strong>Titre</strong></td>
                            <td>${UI.escapeHTML(incident.titre)}</td>
                        </tr>
                        <tr>
                            <td><strong>Type</strong></td>
                            <td>${UI.escapeHTML(incident.type)}</td>
                        </tr>
                        <tr>
                            <td><strong>Date/Heure incident</strong></td>
                            <td>${Storage.formatDate(incident.date_incident)} à ${incident.heure_incident}</td>
                        </tr>
                        <tr>
                            <td><strong>Signalement</strong></td>
                            <td>${Storage.formatDateTime(incident.timestamp)}</td>
                        </tr>
                        <tr>
                            <td><strong>Gravité</strong></td>
                            <td><strong style="color:${incident.gravite === 'critique' ? 'var(--danger)' : incident.gravite === 'majeur' ? 'var(--warning)' : 'var(--info)'}">${incident.gravite.toUpperCase()}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>Personnes touchées</strong></td>
                            <td>${incident.personnes_touchees || 0}</td>
                        </tr>
                        <tr>
                            <td><strong>Symptômes</strong></td>
                            <td>${UI.escapeHTML(incident.symptomes || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>Produits impliqués</strong></td>
                            <td>${UI.escapeHTML(incident.produits_impliques || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>N° lot</strong></td>
                            <td>${UI.escapeHTML(incident.num_lot || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>Quantité</strong></td>
                            <td>${UI.escapeHTML(incident.quantite_produit || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>Cause présumée</strong></td>
                            <td>${UI.escapeHTML(incident.cause_presumee || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>Actions correctives</strong></td>
                            <td>${UI.escapeHTML(incident.actions_correctives || '—')}</td>
                        </tr>
                        <tr>
                            <td><strong>DDPP notifiée</strong></td>
                            <td>${incident.ddpp_notified ? '✓ Oui' : '✗ Non'}</td>
                        </tr>
                        <tr>
                            <td><strong>Statut</strong></td>
                            <td>${incident.clos ? '✓ CLS le ' + Storage.formatDate(incident.date_clos) : '⚠️ ACTIF'}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
        `;

        UI.openModal('Détail incident / TIAC', bodyHTML, footerHTML);
    },

    exportIncident(incidentId) {
        const incident = Storage.getTIAC().find(i => i.id === incidentId);
        if (!incident) return;

        const content = `
RAPPORT INCIDENT / TIAC
Établissement : ${Storage.getConfig().etablissement}

INCIDENT: ${incident.titre}
Type: ${incident.type}
Gravité: ${incident.gravite.toUpperCase()}
Date/Heure: ${Storage.formatDate(incident.date_incident)} à ${incident.heure_incident}
Signalement: ${Storage.formatDateTime(incident.timestamp)}

DESCRIPTION:
${incident.description}

PERSONNES AFFECTÉES: ${incident.personnes_touchees || 0}
Symptômes: ${incident.symptomes || '—'}

PRODUITS IMPLIQUÉS:
- Produits: ${incident.produits_impliques || '—'}
- N° lot: ${incident.num_lot || '—'}
- Quantité: ${incident.quantite_produit || '—'}

ENQUÊTE INTERNE:
${incident.enquete_interne || '(Non complétée)'}

CAUSE PRÉSUMÉE:
${incident.cause_presumee || '—'}

ACTIONS CORRECTIVES:
${incident.actions_correctives || '—'}

NOTIFICATION DDPP: ${incident.ddpp_notified ? 'OUI' : 'NON'}

STATUT: ${incident.clos ? 'CLS ' + Storage.formatDate(incident.date_clos) : 'ACTIF'}

Rapporté par: ${incident.user}

---
Généré le ${Storage.formatDate(Storage.today())}
        `;

        PDF.downloadText(`TIAC_${incident.id}.txt`, content);
        UI.toast('✓ Rapport incident exporté', 'success');
    },

    exportDDPP() {
        const incidents = Storage.getTIAC().filter(i => i.gravite === 'critique' || i.personnes_touchees > 0);
        if (incidents.length === 0) {
            UI.toast('Aucun incident à signaler à la DDPP', 'info');
            return;
        }

        let content = `SIGNALEMENT D'INCIDENT SANITAIRE AUPRÈS DE LA DDPP
Établissement: ${Storage.getConfig().etablissement}
Date: ${Storage.formatDate(Storage.today())}

`;

        incidents.forEach((inc, idx) => {
            content += `
=== INCIDENT ${idx + 1} ===
Titre: ${inc.titre}
Type: ${inc.type}
Gravité: ${inc.gravite.toUpperCase()}
Date/Heure: ${Storage.formatDate(inc.date_incident)} ${inc.heure_incident}
Personnes affectées: ${inc.personnes_touchees || 0}

Description: ${inc.description}
Symptômes: ${inc.symptomes || '—'}
Produits impliqués: ${inc.produits_impliques || '—'}
N° lot: ${inc.num_lot || '—'}

Enquête: ${inc.enquete_interne || '(En cours)'}
Cause: ${inc.cause_presumee || '(À déterminer)'}
Actions: ${inc.actions_correctives || '(En cours)'}

`;
        });

        PDF.downloadText('Signalement_DDPP.txt', content);
        UI.toast('✓ Notification DDPP générée (48h max)', 'success');
    }
};
