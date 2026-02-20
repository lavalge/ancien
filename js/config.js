/* ============================================================
   OK CUISINE — Module Configuration
   Gestion des zones, produits, utilisateurs, établissement
   ============================================================ */

const Config = {
    render() {
        const page = document.getElementById('page-config');
        const config = Storage.getConfig();
        const isAdmin = App.currentUser?.role === 'admin';

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">⚙️ Configuration</h2>
            </div>

            ${!isAdmin ? '<div class="card"><p style="color:var(--warning);">Seuls les administrateurs peuvent modifier la configuration.</p></div>' : ''}

            <!-- Établissement -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🏢 Établissement</span>
                </div>
                <div class="form-group">
                    <label>Nom de l'établissement</label>
                    <input type="text" class="form-control form-control-lg" id="cfg-etab"
                           value="${UI.escapeHTML(config.etablissement)}" ${!isAdmin ? 'disabled' : ''}
                           onchange="Config.saveEtab(this.value)">
                </div>
            </div>

            <!-- Zones de température -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🌡️ Zones de température</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Zone</th>
                                <th>Min °C</th>
                                <th>Max °C</th>
                                ${isAdmin ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${config.zones_temperature.map((z, i) => `
                                <tr>
                                    <td>${UI.escapeHTML(z.nom)}</td>
                                    <td>${z.min}°C</td>
                                    <td>${z.max}°C</td>
                                    ${isAdmin ? `<td><button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="Config.removeZoneTemp(${i})">Supprimer</button></td>` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${isAdmin ? `
                    <div class="add-row" style="margin-top:1rem;">
                        <input type="text" class="form-control" id="cfg-zone-name" placeholder="Nom de la zone">
                        <input type="number" class="form-control" id="cfg-zone-min" placeholder="Min °C" style="width:100px;">
                        <input type="number" class="form-control" id="cfg-zone-max" placeholder="Max °C" style="width:100px;">
                        <button class="btn btn-primary" onclick="Config.addZoneTemp()">Ajouter</button>
                    </div>
                ` : ''}
            </div>

            <!-- Zones de nettoyage -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🧹 Zones de nettoyage</span>
                </div>
                <div class="chip-list">
                    ${config.zones_nettoyage.map((z, i) => `
                        <span class="chip">
                            ${UI.escapeHTML(z.nom)}
                            ${isAdmin ? `<button class="chip-remove" onclick="Config.removeZoneNet(${i})">×</button>` : ''}
                        </span>
                    `).join('')}
                </div>
                ${isAdmin ? `
                    <div class="add-row">
                        <input type="text" class="form-control" id="cfg-zone-net" placeholder="Nouvelle zone">
                        <button class="btn btn-primary" onclick="Config.addZoneNet()">Ajouter</button>
                    </div>
                ` : ''}
            </div>

            <!-- Produits de nettoyage -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">🧴 Produits de nettoyage</span>
                </div>
                <div class="chip-list">
                    ${config.produits_nettoyage.map((p, i) => `
                        <span class="chip">
                            ${UI.escapeHTML(p)}
                            ${isAdmin ? `<button class="chip-remove" onclick="Config.removeProdNet(${i})">×</button>` : ''}
                        </span>
                    `).join('')}
                </div>
                ${isAdmin ? `
                    <div class="add-row">
                        <input type="text" class="form-control" id="cfg-prod-net" placeholder="Nouveau produit">
                        <button class="btn btn-primary" onclick="Config.addProdNet()">Ajouter</button>
                    </div>
                ` : ''}
            </div>

            <!-- Catégories inventaire -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📋 Catégories d'inventaire</span>
                </div>
                <div class="chip-list">
                    ${config.categories_inventaire.map((c, i) => `
                        <span class="chip">
                            ${UI.escapeHTML(c)}
                            ${isAdmin ? `<button class="chip-remove" onclick="Config.removeCatInv(${i})">×</button>` : ''}
                        </span>
                    `).join('')}
                </div>
                ${isAdmin ? `
                    <div class="add-row">
                        <input type="text" class="form-control" id="cfg-cat-inv" placeholder="Nouvelle catégorie">
                        <button class="btn btn-primary" onclick="Config.addCatInv()">Ajouter</button>
                    </div>
                ` : ''}
            </div>

            <!-- Utilisateurs -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">👤 Utilisateurs</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Initiales</th>
                                <th>Rôle</th>
                                ${isAdmin ? '<th>Actions</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${config.users.map((u, i) => `
                                <tr>
                                    <td>${UI.escapeHTML(u.nom)}</td>
                                    <td>${UI.escapeHTML(u.initiales)}</td>
                                    <td><span class="badge ${u.role === 'admin' ? 'badge-warning' : 'badge-info'}">${u.role}</span></td>
                                    ${isAdmin ? `<td>${u.id !== 'admin' ? `<button class="btn btn-danger" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="Config.removeUser(${i})">Supprimer</button>` : '—'}</td>` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${isAdmin ? `
                    <div style="margin-top:1rem;">
                        <button class="btn btn-primary" onclick="Config.showAddUserModal()">+ Ajouter un utilisateur</button>
                    </div>
                ` : ''}
            </div>

            <!-- Export / Import -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">💾 Données</span>
                </div>
                <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="Config.exportData()">📥 Exporter les données (JSON)</button>
                    ${isAdmin ? `
                        <label class="btn btn-secondary" style="cursor:pointer;">
                            📤 Importer des données
                            <input type="file" accept=".json" style="display:none;" onchange="Config.importData(event)">
                        </label>
                        <button class="btn btn-danger" onclick="Config.resetData()">🗑️ Réinitialiser tout</button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // --- Établissement ---
    saveEtab(name) {
        const config = Storage.getConfig();
        config.etablissement = name;
        Storage.saveConfig(config);
        UI.toast('Nom de l\'établissement mis à jour', 'success');
    },

    // --- Zones température ---
    addZoneTemp() {
        const nom = document.getElementById('cfg-zone-name').value.trim();
        const min = parseFloat(document.getElementById('cfg-zone-min').value);
        const max = parseFloat(document.getElementById('cfg-zone-max').value);

        if (!nom || isNaN(min) || isNaN(max)) {
            UI.toast('Remplissez tous les champs', 'warning');
            return;
        }

        const config = Storage.getConfig();
        config.zones_temperature.push({
            id: nom.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
            nom, min, max
        });
        Storage.saveConfig(config);
        UI.toast(`Zone ajoutée : ${nom}`, 'success');
        this.render();
    },

    removeZoneTemp(index) {
        const config = Storage.getConfig();
        config.zones_temperature.splice(index, 1);
        Storage.saveConfig(config);
        this.render();
    },

    // --- Zones nettoyage ---
    addZoneNet() {
        const nom = document.getElementById('cfg-zone-net').value.trim();
        if (!nom) return;
        const config = Storage.getConfig();
        config.zones_nettoyage.push({
            id: nom.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
            nom
        });
        Storage.saveConfig(config);
        UI.toast(`Zone ajoutée : ${nom}`, 'success');
        this.render();
    },

    removeZoneNet(index) {
        const config = Storage.getConfig();
        config.zones_nettoyage.splice(index, 1);
        Storage.saveConfig(config);
        this.render();
    },

    // --- Produits nettoyage ---
    addProdNet() {
        const nom = document.getElementById('cfg-prod-net').value.trim();
        if (!nom) return;
        const config = Storage.getConfig();
        config.produits_nettoyage.push(nom);
        Storage.saveConfig(config);
        UI.toast(`Produit ajouté : ${nom}`, 'success');
        this.render();
    },

    removeProdNet(index) {
        const config = Storage.getConfig();
        config.produits_nettoyage.splice(index, 1);
        Storage.saveConfig(config);
        this.render();
    },

    // --- Catégories inventaire ---
    addCatInv() {
        const nom = document.getElementById('cfg-cat-inv').value.trim();
        if (!nom) return;
        const config = Storage.getConfig();
        config.categories_inventaire.push(nom);
        Storage.saveConfig(config);
        UI.toast(`Catégorie ajoutée : ${nom}`, 'success');
        this.render();
    },

    removeCatInv(index) {
        const config = Storage.getConfig();
        config.categories_inventaire.splice(index, 1);
        Storage.saveConfig(config);
        this.render();
    },

    // --- Utilisateurs ---
    showAddUserModal() {
        const body = `
            <div class="form-group">
                <label>Nom complet</label>
                <input type="text" class="form-control form-control-lg" id="cfg-user-nom" placeholder="Ex: Jean Dupont">
            </div>
            <div class="form-group">
                <label>Initiales</label>
                <input type="text" class="form-control" id="cfg-user-init" placeholder="Ex: JD" maxlength="3">
            </div>
            <div class="form-group">
                <label>Code PIN (4 chiffres)</label>
                <input type="password" class="form-control form-control-lg" id="cfg-user-pin" maxlength="4" placeholder="0000">
            </div>
            <div class="form-group">
                <label>Rôle</label>
                <select class="form-control" id="cfg-user-role">
                    <option value="employe">Employé</option>
                    <option value="admin">Administrateur</option>
                </select>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Config.saveUser()">Ajouter</button>
        `;

        UI.openModal('Ajouter un utilisateur', body, footer);
    },

    saveUser() {
        const nom = document.getElementById('cfg-user-nom').value.trim();
        const initiales = document.getElementById('cfg-user-init').value.trim().toUpperCase();
        const pin = document.getElementById('cfg-user-pin').value;
        const role = document.getElementById('cfg-user-role').value;

        if (!nom || !initiales || !pin || pin.length !== 4) {
            UI.toast('Remplissez tous les champs (PIN = 4 chiffres)', 'warning');
            return;
        }

        const config = Storage.getConfig();
        config.users.push({
            id: Storage.uid(),
            nom, initiales, pin, role
        });
        Storage.saveConfig(config);
        UI.toast(`Utilisateur ajouté : ${nom}`, 'success');
        UI.closeModal();
        this.render();
    },

    removeUser(index) {
        const config = Storage.getConfig();
        const user = config.users[index];
        if (user.id === 'admin') {
            UI.toast('Impossible de supprimer l\'administrateur principal', 'danger');
            return;
        }
        config.users.splice(index, 1);
        Storage.saveConfig(config);
        UI.toast('Utilisateur supprimé', 'info');
        this.render();
    },

    // --- Export / Import ---
    exportData() {
        const data = Storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ok-cuisine-backup-${Storage.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UI.toast('Données exportées', 'success');
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Storage.importAll(data);
                UI.toast('Données importées avec succès', 'success');
                App.navigate(App.currentPage);
            } catch (err) {
                UI.toast('Fichier invalide', 'danger');
            }
        };
        reader.readAsText(file);
    },

    async resetData() {
        const confirmed = await UI.confirm(
            'Réinitialiser toutes les données ?',
            'Toutes les données seront supprimées définitivement. Exportez vos données avant si besoin.'
        );
        if (confirmed) {
            // Clear all okc_ keys
            const preserve = new Set([Storage._key(Storage.DASHBOARD_LAYOUT_KEY)]);
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(Storage.PREFIX) && !preserve.has(key)) keys.push(key);
            }
            keys.forEach(k => localStorage.removeItem(k));
            UI.toast('Données réinitialisées', 'info');
            location.reload();
        }
    }
};
