/* ============================================================
   OK CUISINE — Module Alertes
   Alertes automatiques et manuelles, résolution, historique
   ============================================================ */

const Alertes = {
    filterStatus: 'active', // 'active', 'resolved', 'all'

    render() {
        const page = document.getElementById('page-alertes');
        let alertes = Storage.getAlertes();

        const totalActive = alertes.filter(a => !a.resolved).length;
        const totalResolved = alertes.filter(a => a.resolved).length;
        const totalCritiques = alertes.filter(a => !a.resolved && a.niveau === 'critique').length;

        if (this.filterStatus === 'active') {
            alertes = alertes.filter(a => !a.resolved);
        } else if (this.filterStatus === 'resolved') {
            alertes = alertes.filter(a => a.resolved);
        }

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">⚠️ Alertes</h2>
                <div class="section-actions">
                    <button class="btn btn-warning btn-kitchen" onclick="Alertes.showAddModal()">
                        + Nouvelle alerte
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card ${totalCritiques > 0 ? 'danger' : 'success'}">
                    <div class="stat-label">Critiques</div>
                    <div class="stat-value">${totalCritiques}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Actives</div>
                    <div class="stat-value">${totalActive}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Résolues</div>
                    <div class="stat-value">${totalResolved}</div>
                </div>
            </div>

            <div class="tabs">
                <button class="tab-btn ${this.filterStatus === 'active' ? 'active' : ''}"
                        onclick="Alertes.filterStatus='active'; Alertes.render();">
                    Actives (${totalActive})
                </button>
                <button class="tab-btn ${this.filterStatus === 'resolved' ? 'active' : ''}"
                        onclick="Alertes.filterStatus='resolved'; Alertes.render();">
                    Résolues (${totalResolved})
                </button>
                <button class="tab-btn ${this.filterStatus === 'all' ? 'active' : ''}"
                        onclick="Alertes.filterStatus='all'; Alertes.render();">
                    Toutes
                </button>
            </div>

            ${alertes.length === 0
                ? UI.emptyState('✅', this.filterStatus === 'active' ? 'Aucune alerte active' : 'Aucune alerte')
                : alertes.map(a => this._renderAlertItem(a)).join('')
            }
        `;

        UI.updateAlertBadge();
    },

    _renderAlertItem(a) {
        const icon = a.niveau === 'critique' ? '🔴' : a.resolved ? '✅' : '🟡';
        const cssClass = a.resolved ? 'resolved' : a.niveau === 'critique' ? 'critical' : 'warning';
        const typeLabel = {
            temperature: '🌡️ Température',
            reception: '📦 Réception',
            nettoyage: '🧹 Nettoyage',
            manuelle: '⚠️ Manuelle'
        }[a.type] || '⚠️ ' + a.type;

        return `
            <div class="alert-item ${cssClass}">
                <div class="alert-icon">${icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${UI.escapeHTML(a.titre)}</div>
                    <div class="alert-desc">${typeLabel} — ${UI.escapeHTML(a.description || '')}</div>
                    <div class="alert-time">
                        ${Storage.formatDateTime(a.timestamp)} — ${a.user}
                        ${a.resolved ? `<br>Résolu le ${Storage.formatDateTime(a.resolved_at)} par ${a.resolved_by}${a.resolved_comment ? ' : ' + UI.escapeHTML(a.resolved_comment) : ''}` : ''}
                    </div>
                </div>
                <div class="alert-actions">
                    ${!a.resolved ? `<button class="btn btn-success" onclick="Alertes.showResolveModal('${a.id}')">Résoudre</button>` : ''}
                </div>
            </div>
        `;
    },

    showAddModal() {
        const body = `
            <div class="form-group">
                <label>Titre de l'alerte</label>
                <input type="text" class="form-control form-control-lg" id="alert-titre"
                       placeholder="Ex: Frigo en panne" autofocus>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" id="alert-desc" rows="3"
                          placeholder="Détails du problème..."></textarea>
            </div>
            <div class="form-group">
                <label>Niveau</label>
                <div style="display:flex;gap:1rem;margin-top:0.5rem;">
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="radio" name="alert-niveau" value="attention" checked> 🟡 Attention
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                        <input type="radio" name="alert-niveau" value="critique"> 🔴 Critique
                    </label>
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-warning btn-lg" onclick="Alertes.saveFromModal()">Créer l'alerte</button>
        `;

        UI.openModal('Nouvelle alerte', body, footer);
    },

    saveFromModal() {
        const titre = document.getElementById('alert-titre').value.trim();
        const description = document.getElementById('alert-desc').value.trim();
        const niveau = document.querySelector('input[name="alert-niveau"]:checked').value;

        if (!titre) {
            UI.toast('Entrez un titre pour l\'alerte', 'warning');
            return;
        }

        Storage.addAlerte({ type: 'manuelle', niveau, titre, description });
        UI.toast('Alerte créée', 'warning');
        UI.closeModal();
        UI.updateAlertBadge();
        this.render();
    },

    showResolveModal(id) {
        const body = `
            <div class="form-group">
                <label>Commentaire de résolution (optionnel)</label>
                <textarea class="form-control" id="resolve-comment" rows="3"
                          placeholder="Actions correctives prises..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Alertes.resolve('${id}')">Marquer comme résolu</button>
        `;

        UI.openModal('Résoudre l\'alerte', body, footer);
    },

    resolve(id) {
        const comment = document.getElementById('resolve-comment').value.trim();
        Storage.resolveAlerte(id, comment);
        UI.toast('Alerte résolue', 'success');
        UI.closeModal();
        UI.updateAlertBadge();
        this.render();
    }
};
