/* ============================================================
   OK CUISINE — Module Maintenance Équipements
   Calendrier maintenance, tests, étalonnages
   Conformité CE 852/2004 — équipements en bon état
   ============================================================ */

const Maintenance = {
    selectedTab: 'calendrier', // 'calendrier', 'historique'

    render() {
        const page = document.getElementById('page-maintenance');
        const maintenances = Storage.getMaintenances();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🔧 Maintenance Équipements</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Maintenance.showAddModal()">
                        + Programmer maintenance
                    </button>
                    <button class="btn btn-secondary" onclick="Maintenance.exportCalendrier()">
                        📄 Exporter calendrier
                    </button>
                </div>
            </div>

            <!-- Rappel -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 CE 852/2004 - Équipements en bon état</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligation :</strong> Tous les équipements doivent être maintenus, calibrés régulièrement 
                    (thermomètres, balances, fours). Registre entretien obligatoire pour audit DDPP.
                </p>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.selectedTab === 'calendrier' ? 'active' : ''}"
                        onclick="Maintenance.selectedTab='calendrier'; Maintenance.render();">
                    📅 Calendrier
                </button>
                <button class="tab-btn ${this.selectedTab === 'historique' ? 'active' : ''}"
                        onclick="Maintenance.selectedTab='historique'; Maintenance.render();">
                    📋 Historique
                </button>
            </div>

            <div style="margin-top:1.5rem;">
                ${this.selectedTab === 'calendrier' ? this._renderCalendrier(maintenances) : this._renderHistorique(maintenances)}
            </div>
        `;
    },

    _renderCalendrier(maintenances) {
        const aVenir = maintenances.filter(m => !m.date_execution && new Date(m.date_prevue) >= new Date());
        const enRetard = maintenances.filter(m => !m.date_execution && new Date(m.date_prevue) < new Date());

        return `
            ${enRetard.length > 0 ? `
                <div class="card" style="border-left:4px solid var(--danger);margin-bottom:1.5rem;">
                    <div class="card-header">
                        <span class="card-title">🔴 En retard</span>
                    </div>
                    ${enRetard.map(m => `
                        <div style="padding:0.75rem;background:rgba(220,53,69,0.1);margin-bottom:0.5rem;border-radius:0.25rem;">
                            <strong>${m.equipement}</strong> — ${m.type_maintenance}<br>
                            <strong>Prévu :</strong> ${Storage.formatDate(m.date_prevue)}<br>
                            <button class="btn btn-success" style="margin-top:0.5rem;padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                    onclick="Maintenance.validateMaintenance('${m.id}')">✓ Marquer effectué</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="card">
                <div class="card-header">
                    <span class="card-title">À venir</span>
                </div>
                ${aVenir.length === 0 
                    ? UI.emptyState('✅', 'Aucune maintenance programmée.')
                    : aVenir.map(m => `
                        <div style="padding:0.75rem;background:var(--bg-secondary);margin-bottom:0.5rem;border-radius:0.25rem;">
                            <strong>${m.equipement}</strong> — ${m.type_maintenance}<br>
                            <strong>Prévu :</strong> ${Storage.formatDate(m.date_prevue)} | ${m.periodicite}<br>
                            <button class="btn btn-success" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                    onclick="Maintenance.validateMaintenance('${m.id}')">✓ Effectuée</button>
                            <button class="btn btn-danger" style="padding:0.2rem 0.4rem;font-size:0.75rem;" 
                                    onclick="Maintenance.deleteMaintenance('${m.id}')">Supprimer</button>
                        </div>
                    `).join('')
                }
            </div>
        `;
    },

    _renderHistorique(maintenances) {
        const effectuees = maintenances.filter(m => m.date_execution);

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Maintenances effectuées</span>
                </div>
                ${effectuees.length === 0
                    ? UI.emptyState('✅', 'Aucune maintenance enregistrée.')
                    : `<div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Équipement</th>
                                    <th>Type maintenance</th>
                                    <th>Date</th>
                                    <th>Technicien</th>
                                    <th>État</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${effectuees.map(m => `
                                    <tr>
                                        <td>${m.equipement}</td>
                                        <td>${m.type_maintenance}</td>
                                        <td>${Storage.formatDate(m.date_execution)}</td>
                                        <td>${m.technicien || '—'}</td>
                                        <td>${m.etat_apres || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            </div>
        `;
    },

    showAddModal() {
        const bodyHTML = `
            <div class="form-group">
                <label>Equipment</label>
                <input type="text" class="form-control form-control-lg" id="maint-equipement" placeholder="Four, réfrigérateur, thermomètre..." required>
            </div>
            <div class="form-group">
                <label>Type de maintenance</label>
                <select class="form-control form-control-lg" id="maint-type" required>
                    <option value="">Sélectionner...</option>
                    <option value="Calibrage thermomètre">Calibrage thermomètre</option>
                    <option value="Vérification balance">Vérification balance</option>
                    <option value="Contrôle frigo/congélateur">Contrôle frigo/congélateur</option>
                    <option value="Nettoyage filtres/hotte">Nettoyage filtres/hotte</option>
                    <option value="Révision complète">Révision complète</option>
                    <option value="Remplacement pièces">Remplacement pièces</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date prévue</label>
                <input type="date" class="form-control form-control-lg" id="maint-date-prevue" required>
            </div>
            <div class="form-group">
                <label>Periodicité</label>
                <select class="form-control form-control-lg" id="maint-periodicite">
                    <option value="">Pas de répétition</option>
                    <option value="Mensuelle">Mensuelle</option>
                    <option value="Trimestrielle">Trimestrielle</option>
                    <option value="Annuelle">Annuelle</option>
                </select>
            </div>
            <div class="form-group">
                <label>Technicien responsable</label>
                <input type="text" class="form-control form-control-lg" id="maint-technicien" placeholder="Nom technicien / prestataire">
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea class="form-control" id="maint-notes" rows="2"></textarea>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-primary" onclick="Maintenance.saveMaintenance();">Programmer</button>
        `;

        UI.openModal('Programmer maintenance', bodyHTML, footerHTML);
    },

    saveMaintenance() {
        const equipement = document.getElementById('maint-equipement').value;
        const type = document.getElementById('maint-type').value;
        const datePrevue = document.getElementById('maint-date-prevue').value;
        const periodicite = document.getElementById('maint-periodicite').value;
        const technicien = document.getElementById('maint-technicien').value;
        const notes = document.getElementById('maint-notes').value;

        if (!equipement || !type || !datePrevue) {
            UI.toast('Remplissez les champs obligatoires', 'warning');
            return;
        }

        const maint = {
            id: Storage.uid(),
            equipement: equipement,
            type_maintenance: type,
            date_prevue: datePrevue,
            periodicite: periodicite,
            technicien: technicien,
            notes: notes,
            date_execution: null,
            etat_apres: null,
            user: App.currentUser.nom,
            timestamp: new Date().toISOString()
        };

        Storage.saveMaintenance(maint);
        UI.closeModal();
        UI.toast('✓ Maintenance programmée', 'success');
        this.render();
        Journal.log('maintenance', `Maintenance programmée: ${equipement}`, maint);
    },

    validateMaintenance(maintenanceId) {
        const maint = Storage.getMaintenances().find(m => m.id === maintenanceId);
        if (!maint) return;

        const bodyHTML = `
            <div class="form-group">
                <label>État après maintenance</label>
                <select class="form-control form-control-lg" id="maint-etat" required>
                    <option value="">Sélectionner...</option>
                    <option value="OK - Fonctionnel">✓ OK - Fonctionnel</option>
                    <option value="OK avec régulag">✓ OK avec réglage mineur</option>
                    <option value="À surveiller">⚠️ À surveiller</option>
                    <option value="NON conforme">✕ Non conforme (résul attendu)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes maintenance effectuée</label>
                <textarea class="form-control" id="maint-details" rows="2" placeholder="Résultats, observations..."></textarea>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-success" onclick="Maintenance.saveMaintainanceCompletee('${maintenanceId}');">✓ Valider</button>
        `;

        UI.openModal('Valider maintenance effectuée', bodyHTML, footerHTML);
    },

    saveMaintainanceCompletee(maintenanceId) {
        const maint = Storage.getMaintenances().find(m => m.id === maintenanceId);
        if (!maint) return;

        const etat = document.getElementById('maint-etat').value;
        const details = document.getElementById('maint-details').value;

        if (!etat) {
            UI.toast('Sélectionnez l\'état après maintenance', 'warning');
            return;
        }

        maint.date_execution = Storage.today();
        maint.etat_apres = etat;
        maint.details_execution = details;

        Storage.saveMaintenance(maint);
        UI.closeModal();
        UI.toast('✓ Maintenance validée', 'success');
        this.render();
    },

    deleteMaintenance(maintenanceId) {
        if (!confirm('Supprimer cette maintenance ?')) return;
        Storage.removeMaintenance(maintenanceId);
        UI.toast('✓ Maintenance supprimée', 'success');
        this.render();
    },

    exportCalendrier() {
        const maintenances =Storage.getMaintenances();
        if (maintenances.length === 0) {
            UI.toast('Aucune maintenance', 'info');
            return;
        }

        let content = 'CALENDRIER MAINTENANCE ÉQUIPEMENTS\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré le: ${Storage.formatDate(Storage.today())}\n\n`;

        maintenances.sort((a, b) => new Date(a.date_prevue) - new Date(b.date_prevue));

        maintenances.forEach(m => {
            content += `\n${m.equipement}\n`;
            content += `Type: ${m.type_maintenance}\n`;
            content += `Date prévue: ${Storage.formatDate(m.date_prevue)}\n`;
            content += `Périodicité: ${m.periodicite || 'Unique'}\n`;
            content += `Technicien: ${m.technicien || '—'}\n`;
            content += m.date_execution ? `EFFECTUÉ le ${Storage.formatDate(m.date_execution)} - État: ${m.etat_apres}\n` : 'PLANIFIÉ\n';
            content += `---\n`;
        });

        PDF.downloadText('Calendrier_Maintenance.txt', content);
        UI.toast('✓ Calendrier exporté', 'success');
    }
};
