/* ============================================================
   OK CUISINE — Module Rappels de Produits
   Gestion alertes fournisseurs, retraits d'urgence, traçabilité
   Conformité CE 852/2004 art. 19 (retrait produits)
   ============================================================ */

const RappelsProduits = {
    selectedDate: null,
    filterStatus: 'actifs', // 'actifs', 'resolu', 'all'

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-rappels-produits');
        let rappels = Storage.getRappelsProduits();

        // Filtre par statut
        if (this.filterStatus === 'actifs') {
            rappels = rappels.filter(r => !r.resolu);
        } else if (this.filterStatus === 'resolu') {
            rappels = rappels.filter(r => r.resolu);
        }

        const totalActifs = Storage.getRappelsProduits().filter(r => !r.resolu).length;
        const critiques = Storage.getRappelsProduits().filter(r => !r.resolu && r.gravite === 'critique').length;

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">🚨 Rappels de Produits</h2>
                <div class="section-actions">
                    <button class="btn btn-danger btn-kitchen" onclick="RappelsProduits.showAddModal()">
                        🚨 Nouveau rappel
                    </button>
                    <button class="btn btn-secondary" onclick="RappelsProduits.exportRappels()">
                        📄 Exporter rappels actifs
                    </button>
                </div>
            </div>

            <!-- Rappel réglementaire -->
            <div class="card" style="border-left:4px solid var(--danger);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 Obligation de retrait immédiat</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>CE 852/2004 art. 19 :</strong> Retrait immédiat de tout produit signalé défectueux/contaminé par fournisseur. 
                    Archivage rappel + traçabilité distribution (qui a reçu) obligatoire. Notification clients si consommateurs affectés.
                </p>
            </div>

            <!-- Stats critiques -->
            <div class="stats-grid" style="margin-bottom:1.5rem;">
                <div class="stat-card ${critiques > 0 ? 'danger' : 'success'}">
                    <div class="stat-label">Rappels critiques</div>
                    <div class="stat-value">${critiques}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Actifs</div>
                    <div class="stat-value">${totalActifs}</div>
                </div>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.filterStatus === 'actifs' ? 'active' : ''}"
                        onclick="RappelsProduits.filterStatus='actifs'; RappelsProduits.render();">
                    En cours (${totalActifs})
                </button>
                <button class="tab-btn ${this.filterStatus === 'resolu' ? 'active' : ''}"
                        onclick="RappelsProduits.filterStatus='resolu'; RappelsProduits.render();">
                    Résolus
                </button>
                <button class="tab-btn ${this.filterStatus === 'all' ? 'active' : ''}"
                        onclick="RappelsProduits.filterStatus='all'; RappelsProduits.render();">
                    Tous
                </button>
            </div>

            <!-- Liste rappels -->
            ${rappels.length === 0 
                ? UI.emptyState('✅', 'Aucun rappel' + (this.filterStatus === 'actifs' ? ' actif' : ''))
                : this._renderRappels(rappels)
            }
        `;
    },

    _renderRappels(rappels) {
        let html = '';

        for (const r of rappels) {
            const days = Math.floor((new Date() - new Date(r.date_rappel)) / (1000 * 60 * 60 * 24));
            const status = r.resolu ? '✓ Résolu' : '⚠️ ACTIF';

            html += `
                <div class="card" style="margin-bottom:1rem;border-left:5px solid ${r.gravite === 'critique' ? 'var(--danger)' : 'var(--warning)'};">
                    <div class="card-header" style="display:flex;justify-content:space-between;">
                        <div style="flex:1;">
                            <span class="card-title">${UI.escapeHTML(r.nom_produit)}</span>
                            <span style="margin-left:1rem;color:var(--text-muted);font-size:0.85rem;">${r.fournisseur || 'N/A'}</span>
                        </div>
                        <span style="font-weight:bold;color:${r.gravite === 'critique' ? 'var(--danger)' : 'var(--warning)'};">${r.gravite.toUpperCase()}</span>
                    </div>

                    <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;margin-bottom:0.75rem;">
                        <strong>N° lot/DLC :</strong> ${r.num_lot} / ${r.dlc || '?'}<br>
                        <strong>Motif :</strong> ${UI.escapeHTML(r.motif_rappel)}<br>
                        <strong>Date rappel :</strong> ${Storage.formatDate(r.date_rappel)} (${days}j ago)<br>
                        <strong>Statut :</strong> ${status}
                    </div>

                    ${r.raison_detail ? `
                        <div style="margin-bottom:0.75rem;padding:0.5rem;background:rgba(220,53,69,0.1);border-left:2px solid var(--danger);">
                            <strong>⚠️ Détails risque :</strong> ${UI.escapeHTML(r.raison_detail)}
                        </div>
                    ` : ''}

                    ${!r.resolu ? `
                        <div style="margin-bottom:0.75rem;padding:0.5rem;background:var(--warning);background-color:rgba(255,193,7,0.1);border-radius:0.25rem;">
                            <strong>✓ Actions à effectuer :</strong><br>
                            ☐ Isoler tous les lots concernés<br>
                            ☐ Vérifier distribution (qui a reçu)<br>
                            ☐ Contacter clients si distribution<br>
                            ☐ Valider destruction/retour
                        </div>
                    ` : ''}

                    ${r.stock_affecte ? `
                        <div style="margin-bottom:0.75rem;">
                            <strong>Stock affecté :</strong> ${UI.escapeHTML(r.stock_affecte)}<br>
                            <strong>Quantité retirée :</strong> ${r.quantite_retiree || '?'}
                        </div>
                    ` : ''}

                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                onclick="RappelsProduits.showDetail('${r.id}')">Detail</button>
                        ${!r.resolu ? `
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                    onclick="RappelsProduits.validateRetrait('${r.id}')">🔍 Tracer retrait</button>
                            <button class="btn btn-success" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                    onclick="RappelsProduits.resolveRappel('${r.id}')">✓ Résoudre</button>
                        ` : ''}
                        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" 
                                onclick="RappelsProduits.exportRappel('${r.id}')">📄</button>
                    </div>
                </div>
            `;
        }

        return html;
    },

    showAddModal() {
        const bodyHTML = `
            <div style="padding:0.75rem;background:var(--warning);background-color:rgba(255,193,7,0.1);margin-bottom:1rem;border-radius:0.25rem;">
                <strong>⚠️ URGENT :</strong> Un rappel signifie que le produit doit être retiré immédiatement de toute distribution.
            </div>

            <div class="form-group">
                <label>Nom du produit</label>
                <input type="text" class="form-control form-control-lg" id="rp-nom-produit" placeholder="Ex: Steak haché" required>
            </div>
            <div class="form-group">
                <label>Fournisseur</label>
                <input type="text" class="form-control form-control-lg" id="rp-fournisseur" placeholder="Nom fournisseur">
            </div>
            <div class="form-group">
                <label>N° lot/Référence</label>
                <input type="text" class="form-control form-control-lg" id="rp-num-lot" placeholder="Ex: LOT20260101" required>
            </div>
            <div class="form-group">
                <label>DLC/DDM affectée</label>
                <input type="date" class="form-control form-control-lg" id="rp-dlc" required>
            </div>
            <div class="form-group">
                <label>Motif du rappel</label>
                <select class="form-control form-control-lg" id="rp-motif" required>
                    <option value="">Sélectionner...</option>
                    <option value="Listéria monocytogènes">Listéria monocytogènes</option>
                    <option value="E. coli O157">E. coli O157</option>
                    <option value="Salmonella">Salmonella</option>
                    <option value="Contaminant chimique">Contaminant chimique</option>
                    <option value="Allergène non déclaré">Allergène non déclaré</option>
                    <option value="Emballage défectueux">Emballage défectueux</option>
                    <option value="Fraude/contrefaçon">Fraude/contrefaçon</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Détails risque sanitaire</label>
                <textarea class="form-control" id="rp-raison" rows="2" placeholder="Explications sanitaires détaillées" required></textarea>
            </div>
            <div class="form-group">
                <label>Gravité</label>
                <select class="form-control form-control-lg" id="rp-gravite" required>
                    <option value="majeur">🟡 Majeur (retrait recommandé)</option>
                    <option value="critique">🔴 Critique (retrait obligatoire immédiat)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Date du rappel (notification fournisseur)</label>
                <input type="date" class="form-control form-control-lg" id="rp-date-rappel" required value="${Storage.today()}">
            </div>
            <div class="form-group">
                <label>Quantité en stock affectée</label>
                <input type="text" class="form-control form-control-lg" id="rp-quantite" placeholder="Ex: 50 unités, 10 kg">
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-danger" onclick="RappelsProduits.saveRappel();">🚨 Signaler rappel</button>
        `;

        UI.openModal('Signaler rappel de produit', bodyHTML, footerHTML);
    },

    saveRappel() {
        const nomProduit = document.getElementById('rp-nom-produit').value;
        const fournisseur = document.getElementById('rp-fournisseur').value;
        const numLot = document.getElementById('rp-num-lot').value;
        const dlc = document.getElementById('rp-dlc').value;
        const motif = document.getElementById('rp-motif').value;
        const raison = document.getElementById('rp-raison').value;
        const gravite = document.getElementById('rp-gravite').value;
        const dateRappel = document.getElementById('rp-date-rappel').value;
        const quantite = document.getElementById('rp-quantite').value;

        if (!nomProduit || !numLot || !dlc || !motif || !raison || !gravite || !dateRappel) {
            UI.toast('Remplissez tous les champs obligatoires', 'warning');
            return;
        }

        const rappel = {
            id: Storage.uid(),
            nom_produit: nomProduit,
            fournisseur: fournisseur,
            num_lot: numLot,
            dlc: dlc,
            motif_rappel: motif,
            raison_detail: raison,
            gravite: gravite,
            date_rappel: dateRappel,
            stock_affecte: quantite,
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom,
            resolu: false,
            quantite_retiree: '',
            date_resolution: null,
            trace_distribution: ''
        };

        Storage.saveRappelProduit(rappel);
        UI.closeModal();
        UI.toast('🚨 Rappel signalé — Retrait immédiat requis', 'danger');
        this.render();
        Journal.log('rappel_produit', `Rappel produit: ${nomProduit} lot ${numLot}`, rappel);

        // Alerte automatique
        const alerte = {
            id: Storage.uid(),
            titre: `🚨 RAPPEL: ${nomProduit}`,
            description: `Lot ${numLot} - Motif: ${motif}`,
            niveau: gravite === 'critique' ? 'critique' : 'warning',
            type: 'rappel_produit',
            timestamp: new Date().toISOString(),
            user: App.currentUser.nom,
            resolved: false
        };
        Storage.addAlerte(alerte);
    },

    validateRetrait(rappelId) {
        const rappel = Storage.getRappelsProduits().find(r => r.id === rappelId);
        if (!rappel) return;

        const bodyHTML = `
            <div style="margin-bottom:1rem;padding:0.75rem;background:var(--bg-secondary);border-radius:0.25rem;">
                <strong>Produit :</strong> ${UI.escapeHTML(rappel.nom_produit)}<br>
                <strong>Lot :</strong> ${rappel.num_lot}<br>
                <strong>Stock initial :</strong> ${rappel.stock_affecte || '?'}
            </div>

            <div class="form-group">
                <label>Quantité effectivement retirée/détruite</label>
                <input type="text" class="form-control form-control-lg" id="rp-qty-retiree" placeholder="Ex: 50 unités, 10 kg" required>
            </div>
            <div class="form-group">
                <label>Mode de traitement</label>
                <select class="form-control form-control-lg" id="rp-traitement" required>
                    <option value="">Sélectionner...</option>
                    <option value="Destruction (incinération)">Destruction (incinération)</option>
                    <option value="Retour fournisseur">Retour fournisseur</option>
                    <option value="Transformation (stérilisation)">Transformation (stérilisation)</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Distribution détectée (clients/établissements ayant reçu)</label>
                <textarea class="form-control" id="rp-distribution" rows="3" placeholder="Liste établissements/clients affectés (si applicable)"></textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="rp-sanae-notified">
                    SANAE/Fournisseur notifié du retrait
                </label>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Annuler</button>
            <button class="btn btn-success" onclick="RappelsProduits.saveTraceRetrait('${rappelId}');">✓ Valider retrait</button>
        `;

        UI.openModal('Tracer retrait produit', bodyHTML, footerHTML);
    },

    saveTraceRetrait(rappelId) {
        const rappel = Storage.getRappelsProduits().find(r => r.id === rappelId);
        if (!rappel) return;

        const qtyRetiree = document.getElementById('rp-qty-retiree').value;
        const traitement = document.getElementById('rp-traitement').value;
        const distribution = document.getElementById('rp-distribution').value;
        const notified = document.getElementById('rp-sanae-notified').checked;

        if (!qtyRetiree || !traitement) {
            UI.toast('Remplissez les champs obligatoires', 'warning');
            return;
        }

        rappel.quantite_retiree = qtyRetiree;
        rappel.trace_distribution = `Mode: ${traitement} | Distribution: ${distribution || 'Aucune'} | SANAE notifié: ${notified ? 'Oui' : 'Non'}`;

        Storage.saveRappelProduit(rappel);
        UI.closeModal();
        UI.toast('✓ Retrait tracé', 'success');
        this.render();
        Journal.log('rappel_produit', `Retrait validé: ${rappel.nom_produit}`, { qtyRetiree, traitement, distribution });
    },

    resolveRappel(rappelId) {
        const rappel = Storage.getRappelsProduits().find(r => r.id === rappelId);
        if (!rappel) return;

        const confirmation = confirm(`Clore le rappel "${rappel.nom_produit}" ? (Confirmer retrait complet)`);
        if (!confirmation) return;

        rappel.resolu = true;
        rappel.date_resolution = Storage.today();

        Storage.saveRappelProduit(rappel);
        UI.toast('✓ Rappel clos', 'success');
        this.render();
        Journal.log('rappel_produit', `Rappel clos: ${rappel.nom_produit}`, rappel);
    },

    showDetail(rappelId) {
        const rappel = Storage.getRappelsProduits().find(r => r.id === rappelId);
        if (!rappel) return;

        const bodyHTML = `
            <div class="table-container" style="max-height:400px;overflow-y:auto;">
                <table style="width:100%;font-size:0.9rem;">
                    <tr><td><strong>Produit</strong></td><td>${UI.escapeHTML(rappel.nom_produit)}</td></tr>
                    <tr><td><strong>Fournisseur</strong></td><td>${UI.escapeHTML(rappel.fournisseur || '—')}</td></tr>
                    <tr><td><strong>N° lot</strong></td><td>${rappel.num_lot}</td></tr>
                    <tr><td><strong>DLC</strong></td><td>${rappel.dlc}</td></tr>
                    <tr><td><strong>Motif</strong></td><td>${UI.escapeHTML(rappel.motif_rappel)}</td></tr>
                    <tr><td><strong>Gravité</strong></td><td><strong style="color:${rappel.gravite === 'critique' ? 'var(--danger)' : 'var(--warning)'}">${rappel.gravite.toUpperCase()}</strong></td></tr>
                    <tr><td><strong>Raison détaillée</strong></td><td>${UI.escapeHTML(rappel.raison_detail)}</td></tr>
                    <tr><td><strong>Stock affecté</strong></td><td>${rappel.stock_affecte || '—'}</td></tr>
                    <tr><td><strong>Quantité retirée</strong></td><td>${rappel.quantite_retiree || '—'}</td></tr>
                    <tr><td><strong>Trace retrait</strong></td><td>${UI.escapeHTML(rappel.trace_distribution || '—')}</td></tr>
                    <tr><td><strong>Date rappel</strong></td><td>${Storage.formatDate(rappel.date_rappel)}</td></tr>
                    <tr><td><strong>Statut</strong></td><td>${rappel.resolu ? '✓ Résolu le ' + Storage.formatDate(rappel.date_resolution) : '⚠️ ACTIF'}</td></tr>
                </table>
            </div>
        `;

        const footerHTML = `
            <button class="btn btn-secondary" onclick="UI.closeModal();">Fermer</button>
        `;

        UI.openModal('Détail rappel', bodyHTML, footerHTML);
    },

    exportRappel(rappelId) {
        const rappel = Storage.getRappelsProduits().find(r => r.id === rappelId);
        if (!rappel) return;

        const content = `
RAPPORT RAPPEL DE PRODUIT
Établissement: ${Storage.getConfig().etablissement}
Date rapport: ${Storage.formatDate(Storage.today())}

PRODUIT AFFECTÉ:
Nom: ${rappel.nom_produit}
Fournisseur: ${rappel.fournisseur || '—'}
N° lot: ${rappel.num_lot}
DLC/DDM: ${rappel.dlc}
Stock affecté: ${rappel.stock_affecte || '—'}

RAISON DU RAPPEL:
Motif: ${rappel.motif_rappel}
Détails sanitaires: ${rappel.raison_detail}
Gravité: ${rappel.gravite.toUpperCase()}

DATE & RESPONSABLE:
Date signalement: ${Storage.formatDate(rappel.date_rappel)}
Signalé par: ${rappel.user}

ACTIONS EFFECTUÉES:
Quantité retirée: ${rappel.quantite_retiree || '—'}
Mode traitement: ${rappel.trace_distribution || '—'}

STATUT:
${rappel.resolu ? 'RÉSOLU le ' + Storage.formatDate(rappel.date_resolution) : 'ACTIF - Retrait en cours'}

---
À archiver légalement (5 ans)
        `;

        PDF.downloadText(`Rappel_${rappel.nom_produit}_${rappel.num_lot}.txt`, content);
        UI.toast('✓ Rapport rappel exporté', 'success');
    },

    exportRappels() {
        const rappels = Storage.getRappelsProduits();
        if (rappels.length === 0) {
            UI.toast('Aucun rappel', 'info');
            return;
        }

        let content = 'REGISTRE RAPPELS DE PRODUITS\n';
        content += `Établissement: ${Storage.getConfig().etablissement}\n`;
        content += `Généré le: ${Storage.formatDate(Storage.today())}\n\n`;

        rappels.forEach((r, idx) => {
            content += `
\n=== RAPPEL ${idx + 1} ===
Produit: ${r.nom_produit}
Fournisseur: ${r.fournisseur || '—'}
Lot: ${r.num_lot} | DLC: ${r.dlc}
Motif: ${r.motif_rappel}
Gravité: ${r.gravite.toUpperCase()}
Date: ${Storage.formatDate(r.date_rappel)}
Quantité retirée: ${r.quantite_retiree || '—'}
Statut: ${r.resolu ? 'RÉSOLU' : 'ACTIF'}
`;
        });

        PDF.downloadText('Registre_Rappels_Complet.txt', content);
        UI.toast('✓ Registre rappels exporté', 'success');
    }
};
