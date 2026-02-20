/* ============================================================
   OK CUISINE — Module Tracabilite
   Tracabilite amont/interne, etiquettes deconditionement,
   gestion fournisseurs, DLC secondaire J+3
   ============================================================ */

const Tracabilite = {
    selectedDate: null,
    activeTab: 'etiquettes',

    init() {
        this.selectedDate = Storage.today();
    },

    render() {
        const page = document.getElementById('page-tracabilite');
        const config = Storage.getConfig();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83D\uDD0D Tracabilite</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="Tracabilite.showAddEtiquetteModal()">
                        + Etiquette deconditionement
                    </button>
                    <button class="btn btn-secondary" onclick="PDF.export('tracabilite')">
                        \uD83D\uDCC4 Exporter PDF
                    </button>
                </div>
            </div>

            <!-- Rappel reglementaire -->
            <div class="card" style="border-left:4px solid var(--info);">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Reglement (CE) 178/2002 — Tracabilite</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>Obligation :</strong> Tout exploitant du secteur alimentaire doit etre en mesure
                    d'identifier ses fournisseurs et les entreprises auxquelles il a fourni ses produits.
                    Les informations doivent etre disponibles immediatement en cas de controle ou de TIAC.
                </p>
            </div>

            <!-- Onglets -->
            <div class="tab-bar">
                <button class="tab-btn ${this.activeTab === 'etiquettes' ? 'active' : ''}"
                        onclick="Tracabilite.switchTab('etiquettes')">
                    \uD83C\uDFF7\uFE0F Etiquettes (J+3)
                </button>
                <button class="tab-btn ${this.activeTab === 'fournisseurs' ? 'active' : ''}"
                        onclick="Tracabilite.switchTab('fournisseurs')">
                    \uD83D\uDE9A Fournisseurs agrees
                </button>
                <button class="tab-btn ${this.activeTab === 'plats_temoins' ? 'active' : ''}"
                        onclick="Tracabilite.switchTab('plats_temoins')">
                    \uD83C\uDF7D\uFE0F Plats temoins
                </button>
            </div>

            <div id="tracabilite-content">
                ${this._renderTabContent()}
            </div>
        `;
    },

    switchTab(tab) {
        this.activeTab = tab;
        this.render();
    },

    _renderTabContent() {
        switch (this.activeTab) {
            case 'etiquettes': return this._renderEtiquettes();
            case 'fournisseurs': return this._renderFournisseurs();
            case 'plats_temoins': return this._renderPlatsTemoins();
            default: return '';
        }
    },

    // ==================== ETIQUETTES DE DECONDITIONEMENT ====================

    _renderEtiquettes() {
        const etiquettes = Storage.getEtiquettes();
        const today = new Date(Storage.today());

        // Classer : actives (non expirees) vs expirees
        const actives = [];
        const expirees = [];
        for (const e of etiquettes) {
            const dlcDate = new Date(e.dlc_secondaire);
            if (dlcDate < today) {
                expirees.push(e);
            } else {
                actives.push(e);
            }
        }

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDFF7\uFE0F Etiquettes de deconditionement actives</span>
                    <span class="badge badge-info">${actives.length}</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">
                    <strong>Regle J+3 :</strong> Tout produit deconditionne doit etre etiquete avec une DLC secondaire
                    de 3 jours maximum (sauf analyse microbiologique validante).
                </p>
                ${actives.length === 0
                    ? UI.emptyState('\uD83C\uDFF7\uFE0F', 'Aucune etiquette active')
                    : this._renderEtiquettesTable(actives, false)
                }
            </div>

            ${expirees.length > 0 ? `
                <div class="card" style="border-left:4px solid var(--danger);">
                    <div class="card-header">
                        <span class="card-title">\u26A0\uFE0F Etiquettes expirees — A DETRUIRE</span>
                        <span class="badge badge-danger">${expirees.length}</span>
                    </div>
                    ${this._renderEtiquettesTable(expirees, true)}
                </div>
            ` : ''}
        `;
    },

    _renderEtiquettesTable(etiquettes, expired) {
        let rows = etiquettes.map(e => `
            <tr class="${expired ? 'row-danger' : ''}">
                <td><strong>${UI.escapeHTML(e.produit)}</strong></td>
                <td>${UI.escapeHTML(e.origine || '-')}</td>
                <td>${e.date_deconditionement}</td>
                <td><strong>${e.dlc_secondaire}</strong></td>
                <td>${e.temperature_stockage || '-'}</td>
                <td>${e.lot || '-'}</td>
                <td>${UI.escapeHTML(e.user)}</td>
                <td>
                    <button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem;"
                            onclick="Tracabilite.deleteEtiquette('${e.id}')">Suppr.</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Origine</th>
                            <th>Deconditionne le</th>
                            <th>DLC secondaire</th>
                            <th>Temp. stockage</th>
                            <th>N. lot</th>
                            <th>Par</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    showAddEtiquetteModal() {
        const today = Storage.today();
        // J+3 par defaut
        const j3 = new Date();
        j3.setDate(j3.getDate() + 3);
        const dlcDefault = j3.toISOString().split('T')[0];

        const body = `
            <div class="form-group">
                <label>Nom du produit</label>
                <input type="text" class="form-control form-control-lg" id="etiq-produit"
                       placeholder="Ex: Carottes rapees" autofocus>
            </div>
            <div class="form-group">
                <label>Origine / Fournisseur</label>
                <input type="text" class="form-control" id="etiq-origine"
                       placeholder="Ex: Pomona / France">
            </div>
            <div class="form-group">
                <label>Numero de lot (du fournisseur)</label>
                <input type="text" class="form-control" id="etiq-lot"
                       placeholder="Ex: L2026-0206">
            </div>
            <div style="display:flex;gap:1rem;">
                <div class="form-group" style="flex:1;">
                    <label>Date de deconditionement</label>
                    <input type="date" class="form-control" id="etiq-date" value="${today}">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>DLC secondaire (J+3 max)</label>
                    <input type="date" class="form-control" id="etiq-dlc" value="${dlcDefault}">
                </div>
            </div>
            <div class="form-group">
                <label>Temperature de stockage</label>
                <select class="form-control" id="etiq-temp">
                    <option value="0 a +3\u00B0C">0 a +3\u00B0C (chambre froide positive)</option>
                    <option value="0 a +4\u00B0C">0 a +4\u00B0C (refrigerateur)</option>
                    <option value="-18\u00B0C">-18\u00B0C (congelateur)</option>
                    <option value="Ambiante">Temperature ambiante (epicerie seche)</option>
                </select>
            </div>
            <div style="background:var(--bg-card);padding:0.75rem;border-radius:var(--radius-sm);border-left:3px solid var(--warning);margin-top:0.5rem;">
                <strong>\u26A0\uFE0F Rappel :</strong> La DLC secondaire ne peut exceder J+3 sans analyse microbiologique.
                Elle ne doit jamais depasser la DLC d'origine du produit.
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Tracabilite.saveEtiquette()">Creer l'etiquette</button>
        `;

        UI.openModal('Etiquette de deconditionement', body, footer);
    },

    saveEtiquette() {
        const produit = document.getElementById('etiq-produit').value.trim();
        const origine = document.getElementById('etiq-origine').value.trim();
        const lot = document.getElementById('etiq-lot').value.trim();
        const date_deconditionement = document.getElementById('etiq-date').value;
        const dlc_secondaire = document.getElementById('etiq-dlc').value;
        const temperature_stockage = document.getElementById('etiq-temp').value;

        if (!produit) {
            UI.toast('Entrez un nom de produit', 'warning');
            return;
        }

        // Verifier que la DLC ne depasse pas J+3
        const dateDecond = new Date(date_deconditionement);
        const dateDlc = new Date(dlc_secondaire);
        const diffDays = Math.ceil((dateDlc - dateDecond) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
            UI.toast('Attention : DLC secondaire > J+3 ! Necessite une analyse microbiologique.', 'warning');
        }

        Storage.addEtiquette({ produit, origine, lot, date_deconditionement, dlc_secondaire, temperature_stockage });
        UI.toast(`Etiquette creee : ${produit} (DLC: ${dlc_secondaire})`, 'success');
        UI.closeModal();
        this.render();
    },

    async deleteEtiquette(id) {
        const confirmed = await UI.confirm('Supprimer cette etiquette ?', 'Confirmez la destruction du produit.');
        if (confirmed) {
            Storage.removeEtiquette(id);
            UI.toast('Etiquette supprimee', 'info');
            this.render();
        }
    },

    // ==================== FOURNISSEURS AGREES ====================

    _renderFournisseurs() {
        const config = Storage.getConfig();
        const fournisseurs = config.fournisseurs_agrees || [];

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDE9A Liste des fournisseurs agrees</span>
                    <span class="badge badge-info">${fournisseurs.length}</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">
                    Registre des fournisseurs conformement au Reglement (CE) 178/2002.
                    Conservez les bons de livraison et fiches techniques associees.
                </p>
                ${fournisseurs.length === 0
                    ? UI.emptyState('\uD83D\uDE9A', 'Aucun fournisseur enregistre')
                    : this._renderFournisseursTable(fournisseurs)
                }
                <div style="margin-top:1rem;">
                    <button class="btn btn-primary" onclick="Tracabilite.showAddFournisseurModal()">
                        + Ajouter un fournisseur
                    </button>
                </div>
            </div>
        `;
    },

    _renderFournisseursTable(fournisseurs) {
        let rows = fournisseurs.map((f, i) => `
            <tr>
                <td><strong>${UI.escapeHTML(f.nom)}</strong></td>
                <td>${UI.escapeHTML(f.adresse || '-')}</td>
                <td>${UI.escapeHTML(f.telephone || '-')}</td>
                <td>${UI.escapeHTML(f.produits || '-')}</td>
                <td>${UI.escapeHTML(f.agrement || '-')}</td>
                <td>
                    <button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem;"
                            onclick="Tracabilite.removeFournisseur(${i})">Suppr.</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Adresse</th>
                            <th>Telephone</th>
                            <th>Produits fournis</th>
                            <th>N. agrement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    showAddFournisseurModal() {
        const body = `
            <div class="form-group">
                <label>Nom du fournisseur</label>
                <input type="text" class="form-control form-control-lg" id="fourn-nom"
                       placeholder="Ex: Pomona" autofocus>
            </div>
            <div class="form-group">
                <label>Adresse</label>
                <input type="text" class="form-control" id="fourn-adresse"
                       placeholder="Adresse complete">
            </div>
            <div class="form-group">
                <label>Telephone</label>
                <input type="tel" class="form-control" id="fourn-tel"
                       placeholder="Ex: 01 23 45 67 89">
            </div>
            <div class="form-group">
                <label>Type de produits fournis</label>
                <input type="text" class="form-control" id="fourn-produits"
                       placeholder="Ex: Fruits et legumes, Viandes">
            </div>
            <div class="form-group">
                <label>N. d'agrement sanitaire (si applicable)</label>
                <input type="text" class="form-control" id="fourn-agrement"
                       placeholder="Ex: FR 75.105.001 CE">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Tracabilite.saveFournisseur()">Ajouter</button>
        `;

        UI.openModal('Ajouter un fournisseur', body, footer);
    },

    saveFournisseur() {
        const nom = document.getElementById('fourn-nom').value.trim();
        const adresse = document.getElementById('fourn-adresse').value.trim();
        const telephone = document.getElementById('fourn-tel').value.trim();
        const produits = document.getElementById('fourn-produits').value.trim();
        const agrement = document.getElementById('fourn-agrement').value.trim();

        if (!nom) {
            UI.toast('Entrez le nom du fournisseur', 'warning');
            return;
        }

        const config = Storage.getConfig();
        if (!config.fournisseurs_agrees) config.fournisseurs_agrees = [];
        config.fournisseurs_agrees.push({ nom, adresse, telephone, produits, agrement });
        Storage.saveConfig(config);

        Journal.log('tracabilite', `Fournisseur ajoute : ${nom}`);
        UI.toast(`Fournisseur ajoute : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    removeFournisseur(index) {
        const config = Storage.getConfig();
        if (config.fournisseurs_agrees) {
            const nom = config.fournisseurs_agrees[index]?.nom;
            config.fournisseurs_agrees.splice(index, 1);
            Storage.saveConfig(config);
            Journal.log('tracabilite', `Fournisseur supprime : ${nom}`);
            this.render();
        }
    },

    // ==================== PLATS TEMOINS ====================

    _renderPlatsTemoins() {
        const temoins = Storage.getPlatsTemoins();
        const today = new Date(Storage.today());

        // Separer actifs (< 5 jours) et archives
        const actifs = [];
        const archives = [];
        for (const t of temoins) {
            const dateLimit = new Date(t.date_service);
            dateLimit.setDate(dateLimit.getDate() + 5);
            if (dateLimit >= today) {
                actifs.push(t);
            } else {
                archives.push(t);
            }
        }

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDF7D\uFE0F Plats temoins</span>
                    <span class="badge badge-info">${actifs.length} actif(s)</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">
                    <strong>Obligation (restauration collective) :</strong> Conserver un echantillon de chaque plat
                    servi pendant <strong>5 jours</strong> apres la derniere date de service, a une temperature
                    de 0 a +3\u00B0C. Quantite minimale : 80 a 100g.
                </p>
                ${actifs.length === 0
                    ? UI.emptyState('\uD83C\uDF7D\uFE0F', 'Aucun plat temoin actif')
                    : this._renderPlatsTemoinsTable(actifs)
                }
                <div style="margin-top:1rem;">
                    <button class="btn btn-primary" onclick="Tracabilite.showAddPlatTemoinModal()">
                        + Enregistrer un plat temoin
                    </button>
                </div>
            </div>

            ${archives.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">\uD83D\uDCC1 Archives (> 5 jours — peuvent etre detruits)</span>
                        <span class="badge badge-warning">${archives.length}</span>
                    </div>
                    ${this._renderPlatsTemoinsTable(archives)}
                    <div style="margin-top:0.5rem;">
                        <button class="btn btn-danger" onclick="Tracabilite.purgeArchives()">
                            Purger les archives
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    },

    _renderPlatsTemoinsTable(temoins) {
        let rows = temoins.map(t => {
            const dateLimit = new Date(t.date_service);
            dateLimit.setDate(dateLimit.getDate() + 5);
            const limitStr = dateLimit.toISOString().split('T')[0];

            return `
                <tr>
                    <td><strong>${UI.escapeHTML(t.plat)}</strong></td>
                    <td>${t.date_service}</td>
                    <td>${limitStr}</td>
                    <td>${UI.escapeHTML(t.emplacement || 'Chambre froide')}</td>
                    <td>${UI.escapeHTML(t.user)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Plat</th>
                            <th>Date service</th>
                            <th>Conserver jusqu'au</th>
                            <th>Emplacement</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    showAddPlatTemoinModal() {
        const body = `
            <div class="form-group">
                <label>Nom du plat</label>
                <input type="text" class="form-control form-control-lg" id="temoin-plat"
                       placeholder="Ex: Blanquette de veau" autofocus>
            </div>
            <div class="form-group">
                <label>Date de service</label>
                <input type="date" class="form-control" id="temoin-date" value="${Storage.today()}">
            </div>
            <div class="form-group">
                <label>Emplacement de conservation</label>
                <input type="text" class="form-control" id="temoin-emplacement"
                       value="Chambre froide positive (0 a +3\u00B0C)">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Tracabilite.savePlatTemoin()">Enregistrer</button>
        `;

        UI.openModal('Plat temoin', body, footer);
    },

    savePlatTemoin() {
        const plat = document.getElementById('temoin-plat').value.trim();
        const date_service = document.getElementById('temoin-date').value;
        const emplacement = document.getElementById('temoin-emplacement').value.trim();

        if (!plat) {
            UI.toast('Entrez le nom du plat', 'warning');
            return;
        }

        Storage.addPlatTemoin({ plat, date_service, emplacement });
        UI.toast(`Plat temoin enregistre : ${plat}`, 'success');
        UI.closeModal();
        this.render();
    },

    async purgeArchives() {
        const confirmed = await UI.confirm('Purger les archives ?', 'Les plats temoins de plus de 5 jours seront supprimes.');
        if (confirmed) {
            const temoins = Storage.getPlatsTemoins();
            const today = new Date(Storage.today());
            const actifs = temoins.filter(t => {
                const dateLimit = new Date(t.date_service);
                dateLimit.setDate(dateLimit.getDate() + 5);
                return dateLimit >= today;
            });
            Storage.save('plats_temoins', actifs);
            Journal.log('tracabilite', 'Purge des plats temoins archives');
            UI.toast('Archives purgees', 'info');
            this.render();
        }
    }
};
