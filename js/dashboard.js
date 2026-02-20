/* ============================================================
   OK CUISINE — Module Dashboard
   Vue d'ensemble de la journee avec conformite HACCP
   ============================================================ */

const Dashboard = {
    defaultLayout: ['calendrier', 'temperatures', 'ccp', 'nettoyage', 'receptions', 'alertes', 'allergenes'],
    dragState: {
        active: false,
        widgetId: null,
        source: null,
        ghost: null,
        placeholder: null,
        originIndex: null,
        lastX: 0,
        lastY: 0,
        suppressClick: false
    },
    _navDragBound: false,
    _dragHandlersBound: false,
    _suppressClickBound: false,
    _lastDashboardData: null,

    getWidgetCatalog() {
        const catalog = {};
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            const id = item.dataset.page;
            const label = item.querySelector('.nav-label')?.textContent.trim() || id;
            const icon = item.querySelector('.nav-icon')?.textContent.trim() || '⬚';
            catalog[id] = { id, label, icon, page: id };
        });

        return {
            ...catalog,
            ccp: {
                id: 'ccp',
                label: 'CCP Cuisson',
                icon: '🔥',
                page: 'temperatures',
                getValue: data => data.ccpCount,
                getSubtext: () => 'controles',
                getStatus: data => data.ccpCount > 0 ? (data.ccpNonConformes > 0 ? 'danger' : 'success') : 'info',
                getBadge: data => data.ccpNonConformes > 0 ? { type: 'danger', text: `${data.ccpNonConformes} non conforme(s)` } : null
            },
            temperatures: {
                ...(catalog.temperatures || { id: 'temperatures', label: 'Temperatures', icon: '🌡️', page: 'temperatures' }),
                getValue: data => `${data.tempZonesDone} / ${data.totalTempZones}`,
                getSubtext: () => 'zones relevees',
                getStatus: data => data.tempZonesDone === data.totalTempZones ? 'success' : 'warning',
                getBadge: data => data.tempIssues > 0 ? { type: 'danger', text: `${data.tempIssues} hors limites` } : null
            },
            nettoyage: {
                ...(catalog.nettoyage || { id: 'nettoyage', label: 'Nettoyage', icon: '🧹', page: 'nettoyage' }),
                getValue: data => `${data.cleanedZones} / ${data.totalZones}`,
                getSubtext: () => 'zones nettoyees',
                getStatus: data => data.cleanedZones === data.totalZones ? 'success' : 'warning'
            },
            receptions: {
                ...(catalog.receptions || { id: 'receptions', label: 'Receptions', icon: '📦', page: 'receptions' }),
                getValue: data => data.receptionsCount,
                getSubtext: () => 'livraisons',
                getStatus: () => 'info',
                getBadge: data => data.receptionsNonConformes > 0 ? { type: 'danger', text: `${data.receptionsNonConformes} non conforme(s)` } : null
            },
            alertes: {
                ...(catalog.alertes || { id: 'alertes', label: 'Alertes', icon: '⚠️', page: 'alertes' }),
                getValue: data => data.totalAlertes,
                getSubtext: () => 'actives',
                getStatus: data => data.totalAlertes > 0 ? 'danger' : 'success'
            },
            allergenes: {
                ...(catalog.allergenes || { id: 'allergenes', label: 'Allergenes', icon: '🌾', page: 'allergenes' }),
                getValue: data => data.allergenesCount,
                getSubtext: () => 'plats documentes',
                getStatus: () => 'info'
            },
            inventaire: {
                ...(catalog.inventaire || { id: 'inventaire', label: 'Inventaire', icon: '📋', page: 'inventaire' }),
                getValue: data => data.inventaireCount,
                getSubtext: () => 'articles',
                getStatus: () => 'info'
            },
            menus: {
                ...(catalog.menus || { id: 'menus', label: 'Menus', icon: '🍽️', page: 'menus' }),
                getValue: data => data.menusCount,
                getSubtext: () => 'menus du jour',
                getStatus: () => 'info'
            },
            journal: {
                ...(catalog.journal || { id: 'journal', label: 'Journal', icon: '📝', page: 'journal' }),
                getValue: data => data.journalCount,
                getSubtext: () => 'actions aujourd\'hui',
                getStatus: () => 'info'
            },
            tracabilite: {
                ...(catalog.tracabilite || { id: 'tracabilite', label: 'Tracabilite', icon: '🔍', page: 'tracabilite' }),
                getValue: data => data.etiquettesCount,
                getSubtext: () => 'etiquettes',
                getStatus: () => 'info'
            },
            fournisseurs: {
                ...(catalog.fournisseurs || { id: 'fournisseurs', label: 'Fournisseurs', icon: '🏪', page: 'fournisseurs' }),
                getValue: data => data.fournisseursCount,
                getSubtext: () => 'fournisseurs',
                getStatus: () => 'info'
            },
            recettes: {
                ...(catalog.recettes || { id: 'recettes', label: 'Recettes', icon: '📒', page: 'recettes' }),
                getValue: data => data.recettesCount,
                getSubtext: () => 'fiches techniques',
                getStatus: () => 'info'
            },
            calendrier: {
                ...(catalog.calendrier || { id: 'calendrier', label: 'Calendrier', icon: '📅', page: 'calendrier' }),
                getValue: data => {
                    const days = Calendrier.getNext3Days();
                    const totalEvents = days.reduce((sum, day) => sum + day.events.length, 0);
                    return totalEvents;
                },
                getSubtext: () => 'événements à venir',
                getStatus: data => {
                    const days = Calendrier.getNext3Days();
                    const totalEvents = days.reduce((sum, day) => sum + day.events.length, 0);
                    return totalEvents > 0 ? 'info' : 'success';
                }
            }
        };
    },

    getLayout(catalog = this.getWidgetCatalog()) {
        const saved = Storage.getDashboardLayout(this.defaultLayout);
        const filtered = saved.filter(id => catalog[id]);
        return Array.from(new Set(filtered));
    },

    saveLayout(layout) {
        Storage.saveDashboardLayout(layout);
    },

    renderWidgetCard(def, data) {
        if (!def) return '';
        const status = def.getStatus ? def.getStatus(data) : 'info';
        const value = def.getValue ? def.getValue(data) : '';
        const subtext = def.getSubtext ? def.getSubtext(data) : 'Ouvrir';
        const badge = def.getBadge ? def.getBadge(data) : null;
        const valueHtml = value !== '' && value != null ? `<div class="stat-value">${value}</div>` : '';
        const subtextHtml = subtext ? `<div class="widget-subtext">${subtext}</div>` : '';
        const badgeHtml = badge ? `<div class="widget-badge"><span class="badge badge-${badge.type || 'info'}">${badge.text}</span></div>` : '';

        return `
            <div class="stat-card widget-card ${status}" data-widget-id="${def.id}" data-page="${def.page || ''}" role="button" tabindex="0">
                <div class="stat-label">${def.icon} ${def.label}</div>
                ${valueHtml}
                ${subtextHtml}
                ${badgeHtml}
            </div>
        `;
    },

    bindDashboardInteractions() {
        const grid = document.getElementById('dashboard-widgets');
        if (!grid) return;

        if (!this._dragHandlersBound) {
            this._handleDragMove = this._handleDragMove.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this._dragHandlersBound = true;
        }

        if (!this._suppressClickBound) {
            document.addEventListener('click', (event) => {
                if (!this.dragState.suppressClick) return;
                event.preventDefault();
                event.stopPropagation();
                this.dragState.suppressClick = false;
            }, true);
            this._suppressClickBound = true;
        }

        this._bindNavDraggables();
        this._bindGridDraggables(grid);
    },

    _bindNavDraggables() {
        if (this._navDragBound) return;
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.add('widget-draggable');
            item.addEventListener('pointerdown', (event) => {
                if (App.currentPage !== 'dashboard') return;
                this._startLongPressDrag(event, {
                    source: 'sidebar',
                    widgetId: item.dataset.page,
                    element: item
                });
            });
        });
        this._navDragBound = true;
    },

    _bindGridDraggables(grid) {
        grid.querySelectorAll('.widget-card').forEach(card => {
            card.addEventListener('pointerdown', (event) => {
                this._startLongPressDrag(event, {
                    source: 'dashboard',
                    widgetId: card.dataset.widgetId,
                    element: card
                });
            });
        });

        grid.addEventListener('click', (event) => {
            const card = event.target.closest('.widget-card');
            if (!card || this.dragState.suppressClick) return;
            const page = card.dataset.page;
            if (page) App.navigate(page);
        });
    },

    _startLongPressDrag(event, details) {
        if (this.dragState.active) return;
        if (event.button !== undefined && event.button !== 0) return;
        if (App.currentPage !== 'dashboard') return;

        const startX = event.clientX;
        const startY = event.clientY;
        let timer = null;

        const cancel = () => {
            clearTimeout(timer);
            cleanup();
        };

        const moveHandler = (moveEvent) => {
            const dx = Math.abs(moveEvent.clientX - startX);
            const dy = Math.abs(moveEvent.clientY - startY);
            if (dx > 8 || dy > 8) cancel();
        };

        const upHandler = () => cancel();

        const cleanup = () => {
            document.removeEventListener('pointermove', moveHandler);
            document.removeEventListener('pointerup', upHandler);
            document.removeEventListener('pointercancel', upHandler);
        };

        timer = setTimeout(() => {
            cleanup();
            this._beginDrag({ ...details, startX, startY });
        }, 300);

        document.addEventListener('pointermove', moveHandler);
        document.addEventListener('pointerup', upHandler, { once: true });
        document.addEventListener('pointercancel', upHandler, { once: true });
    },

    _beginDrag({ source, widgetId, element, startX, startY }) {
        const grid = document.getElementById('dashboard-widgets');
        if (!grid) return;

        const catalog = this.getWidgetCatalog();
        if (!catalog[widgetId]) return;

        const placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = `${element.offsetHeight || 72}px`;
        placeholder.style.width = `${element.offsetWidth || 160}px`;

        if (source === 'dashboard') {
            grid.insertBefore(placeholder, element.nextSibling);
            element.remove();
        } else {
            grid.appendChild(placeholder);
        }

        const ghostSource = source === 'sidebar'
            ? this._createWidgetGhost(catalog[widgetId])
            : element;
        const ghost = ghostSource.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.style.left = `${startX}px`;
        ghost.style.top = `${startY}px`;
        document.body.appendChild(ghost);

        this.dragState = {
            active: true,
            widgetId,
            source,
            ghost,
            placeholder,
            originIndex: null,
            lastX: startX,
            lastY: startY,
            suppressClick: true
        };

        document.body.classList.add('dashboard-dragging');
        document.addEventListener('pointermove', this._handleDragMove, { passive: false });
        document.addEventListener('pointerup', this._handleDragEnd, { once: true });
        document.addEventListener('pointercancel', this._handleDragEnd, { once: true });
    },

    _createWidgetGhost(def) {
        const temp = document.createElement('div');
        temp.innerHTML = this.renderWidgetCard(def, this._lastDashboardData || {});
        return temp.firstElementChild || temp;
    },

    _handleDragMove(event) {
        if (!this.dragState.active) return;
        event.preventDefault();

        const grid = document.getElementById('dashboard-widgets');
        const trash = document.getElementById('dashboard-trash');
        if (!grid || !this.dragState.placeholder) return;

        this.dragState.lastX = event.clientX;
        this.dragState.lastY = event.clientY;

        if (this.dragState.ghost) {
            this.dragState.ghost.style.left = `${event.clientX}px`;
            this.dragState.ghost.style.top = `${event.clientY}px`;
        }

        if (trash) {
            const trashRect = trash.getBoundingClientRect();
            trash.classList.toggle('active', this._isPointInRect(event.clientX, event.clientY, trashRect));
        }

        const gridRect = grid.getBoundingClientRect();
        if (!this._isPointInRect(event.clientX, event.clientY, gridRect)) return;

        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.widget-card');
        if (target && target !== this.dragState.placeholder) {
            const targetRect = target.getBoundingClientRect();
            const before = event.clientY < targetRect.top + targetRect.height / 2;
            grid.insertBefore(this.dragState.placeholder, before ? target : target.nextSibling);
        } else if (!target) {
            grid.appendChild(this.dragState.placeholder);
        }
    },

    _handleDragEnd() {
        document.removeEventListener('pointermove', this._handleDragMove);
        document.body.classList.remove('dashboard-dragging');

        const grid = document.getElementById('dashboard-widgets');
        const trash = document.getElementById('dashboard-trash');
        const trashRect = trash ? trash.getBoundingClientRect() : null;
        const droppedOnTrash = trashRect
            ? this._isPointInRect(this.dragState.lastX, this.dragState.lastY, trashRect)
            : false;

        if (this.dragState.ghost) this.dragState.ghost.remove();
        if (trash) trash.classList.remove('active');

        let layout = this.getLayout();
        const existingIndex = layout.indexOf(this.dragState.widgetId);

        if (!droppedOnTrash && grid && this.dragState.placeholder) {
            if (existingIndex >= 0) layout = layout.filter(id => id !== this.dragState.widgetId);
            const children = Array.from(grid.children);
            const placeholderIndex = children.indexOf(this.dragState.placeholder);
            const insertIndex = children
                .slice(0, placeholderIndex)
                .filter(el => el.classList.contains('widget-card')).length;
            layout.splice(insertIndex, 0, this.dragState.widgetId);
        } else if (droppedOnTrash && this.dragState.source === 'dashboard') {
            layout = layout.filter(id => id !== this.dragState.widgetId);
        }

        this.saveLayout(layout);
        if (this.dragState.placeholder) this.dragState.placeholder.remove();

        const suppressClick = this.dragState.suppressClick;

        this.dragState = {
            active: false,
            widgetId: null,
            source: null,
            ghost: null,
            placeholder: null,
            originIndex: null,
            lastX: 0,
            lastY: 0,
            suppressClick
        };

        this.render();
        setTimeout(() => {
            this.dragState.suppressClick = false;
        }, 0);
    },

    _isPointInRect(x, y, rect) {
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    },
    render() {
        const page = document.getElementById('page-dashboard');
        const config = Storage.getConfig();
        const today = Storage.today();

        const temps = Storage.getTemperatures(today);
        const ccpRecords = Storage.getCCPRecords(today);
        const nettoyages = Storage.getNettoyages(today);
        const receptions = Storage.getReceptions(today);
        const alertes = Storage.getAlertes().filter(a => !a.resolved);
        const journal = Storage.getJournal(today);
        const dlcAlerts = Storage.checkDLCAlerts();
        const inventaireCount = Storage.getInventaire().length;
        const menusCount = Storage.getMenus(today).length;
        const etiquettesCount = Storage.getEtiquettes().length;
        const fournisseursCount = Storage.getFournisseurs().length;
        const recettesCount = Storage.getRecettes().length;

        // ===== NOUVEAUX MODULES =====
        const formations = Storage.getFormations() || [];
        const tiacIncidents = Storage.getTIAC() || [];
        const paiEnfants = Storage.getPAIEnfants() || [];
        const rappelsProduits = Storage.getRappelsProduits() || [];
        const agecDons = Storage.getAGECDons() || [];
        const maintenances = Storage.getMaintenances() || [];
        const analyseRisques = Storage.getAnalyseRisques() || [];
        const validationsNettoyage = Storage.getValidationNettoyages() || [];
        const separationPlans = Storage.getSeparationPlans() || [];
        const doushesVestiaires = Storage.getDoushesVestiaires() || [];
        const archives = Storage.getArchivesDLC() || [];

        // ===== CALCULS STATISTIQUES NOUVEAUX MODULES =====
        // Formations
        const formationsExpirantes = formations.filter(f => f.date_expiration && 
            new Date(f.date_expiration) <= new Date(Storage.addDays(Storage.today(), 30)) &&
            new Date(f.date_expiration) > new Date(Storage.today())).length;
        const formationsExpirees = formations.filter(f => f.date_expiration && 
            new Date(f.date_expiration) < new Date(Storage.today())).length;

        // TIAC
        const tiacActifs = tiacIncidents.filter(i => !i.clos).length;
        const tiacCritiques = tiacIncidents.filter(i => i.gravite === 'critique').length;

        // PAI
        const paiAlertees = paiEnfants.filter(p => {
            const adrenaline = p.adrenaline_presente && p.adrenaline_expiration;
            if (!adrenaline) return true;
            return new Date(p.adrenaline_expiration) < new Date(Storage.addDays(Storage.today(), 30));
        }).length;

        // Rappels produits
        const rappelsActifs = rappelsProduits.filter(r => !r.resolu).length;

        // AGEC dons
        const totalDonsKg = agecDons.reduce((sum, d) => sum + (d.quantite_kg || 0), 0);

        // Maintenance
        const maintenancesRetard = maintenances.filter(m => m.date_prevue && 
            new Date(m.date_prevue) < new Date(Storage.today()) && !m.complet).length;

        // Validation nettoyage
        const nettoyageNC = validationsNettoyage.filter(v => v.resultat === 'non-conforme').length;

        // Doush/Vestiaires
        const installationsNC = doushesVestiaires.filter(d => d.resultat === 'non-conforme').length;

        // Zones nettoyees
        const cleanedZones = new Set();
        nettoyages.forEach(r => r.zones.forEach(z => cleanedZones.add(z)));
        const totalZones = config.zones_nettoyage.length;

        // Zones temperature relevees
        const tempZonesDone = new Set(temps.map(t => t.zone_id));
        const totalTempZones = config.zones_temperature.length;

        // Temperatures hors limites
        let tempIssues = 0;
        for (const t of temps) {
            const zone = config.zones_temperature.find(z => z.id === t.zone_id);
            if (zone) {
                const status = UI.temperatureStatus(t.valeur, zone.min, zone.max);
                if (status.status !== 'ok') tempIssues++;
            }
        }

        // Receptions non conformes
        const nonConformes = receptions.filter(r => !r.conforme).length;

        // CCP non conformes
        const ccpNonConformes = ccpRecords.filter(r => !r.conforme).length;

        // Allergenes
        const totalPlats = Storage.getAllergenePlats().length;

        // Total alertes actives (y compris DLC)
        const totalAlertes = alertes.length + dlcAlerts.filter(d => d.niveau === 'critique').length;

        const dashboardData = {
            tempZonesDone: tempZonesDone.size,
            totalTempZones,
            tempIssues,
            cleanedZones: cleanedZones.size,
            totalZones,
            receptionsCount: receptions.length,
            receptionsNonConformes: nonConformes,
            ccpCount: ccpRecords.length,
            ccpNonConformes,
            totalAlertes,
            allergenesCount: totalPlats,
            inventaireCount,
            menusCount,
            journalCount: journal.length,
            etiquettesCount,
            fournisseursCount,
            recettesCount
        };

        const widgetCatalog = this.getWidgetCatalog();
        const layout = this.getLayout(widgetCatalog);
        const widgetsHtml = layout.map(id => this.renderWidgetCard(widgetCatalog[id], dashboardData)).join('');

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83D\uDCCA Tableau de bord \u2014 ${Storage.formatDate(today)}</h2>
            </div>

            <!-- Alertes DLC critiques -->
            ${dlcAlerts.filter(d => d.niveau === 'critique').length > 0 ? `
                <div class="card" style="border-left:4px solid var(--danger);margin-bottom:1rem;">
                    <div class="card-header" style="cursor:pointer;" onclick="Dashboard.toggleDLCList('critiques')">
                        <span class="card-title">\uD83D\uDEA8 Alertes DLC critiques</span>
                        <span class="badge badge-danger">${dlcAlerts.filter(d => d.niveau === 'critique').length}</span>
                    </div>
                    <div id="dlc-critiques-content" style="display:none;">
                        ${dlcAlerts.filter(d => d.niveau === 'critique').map(d => `
                            <div class="alert-item critical" style="margin-bottom:0.5rem;">
                                <div class="alert-icon">\uD83D\uDD34</div>
                                <div class="alert-content">
                                    <div class="alert-title">${UI.escapeHTML(d.item)}</div>
                                    <div class="alert-time">${d.message} (DLC: ${d.dlc})</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Widgets personnalisables -->
            <div class="dashboard-widgets-header">
                <span style="font-size:1.2rem;font-weight:600;">\uD83E\uDDE9 Widgets du tableau de bord</span>
                <span class="widget-hint">Appui long pour deplacer. Glisser depuis la barre laterale pour ajouter.</span>
            </div>
            <div class="dashboard-widgets" id="dashboard-widgets">
                ${widgetsHtml}
            </div>
            ${layout.length === 0 ? `
                <div class="dashboard-widgets-empty">Aucun widget. Glissez un module depuis la barre laterale.</div>
            ` : ''}
            <div class="dashboard-trash" id="dashboard-trash" aria-hidden="true">
                <span class="trash-icon">\uD83D\uDDD1\uFE0F</span>
                <span class="trash-label">Supprimer</span>
            </div>

            <!-- DLC approchantes (attention) -->
            ${dlcAlerts.filter(d => d.niveau === 'attention').length > 0 ? `
                <div class="card" style="border-left:4px solid var(--warning);">
                    <div class="card-header" style="cursor:pointer;" onclick="Dashboard.toggleDLCList('attention')">
                        <span class="card-title">\u23F0 DLC approchantes</span>
                        <span class="badge badge-warning">${dlcAlerts.filter(d => d.niveau === 'attention').length}</span>
                    </div>
                    <div id="dlc-attention-content" style="display:none;">
                        ${dlcAlerts.filter(d => d.niveau === 'attention').map(d => `
                            <div class="alert-item warning" style="margin-bottom:0.5rem;">
                                <div class="alert-icon">\uD83D\uDFE1</div>
                                <div class="alert-content">
                                    <div class="alert-title">${UI.escapeHTML(d.item)}</div>
                                    <div class="alert-time">${d.message} (DLC: ${d.dlc})</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- CONFORMITÉ AVANCÉE (Nouveaux modules) -->
            <div style="margin-bottom:1rem;">
                <span style="font-size:1.2rem;font-weight:600;">📋 Conformité Avancée</span>
                <span style="font-size:0.85rem;color:var(--text-muted);margin-left:0.5rem;">Nouveaux modules</span>
            </div>
            <div class="stats-grid" style="gap:0.75rem;margin-bottom:1.5rem;">
                    <!-- FORMATIONS -->
                    <div class="stat-card ${formationsExpirees > 0 ? 'danger' : formationsExpirantes > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('formation')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">📚</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Formations</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${formations.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${formationsExpirees > 0 ? `<span style="color:var(--danger);">⚠️ ${formationsExpirees} expirées</span>` : formationsExpirantes > 0 ? `<span style="color:var(--warning);">⏰ ${formationsExpirantes} expirent</span>` : '✓ Valides'}
                        </div>
                    </div>

                    <!-- TIAC INCIDENTS -->
                    <div class="stat-card ${tiacCritiques > 0 ? 'danger' : tiacActifs > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('tiac')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">🚨</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Incidents TIAC</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${tiacActifs}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${tiacCritiques > 0 ? `<span style="color:var(--danger);">🔴 ${tiacCritiques} critiques</span>` : tiacActifs > 0 ? '📒 En cours' : '✓ Zéro incident'}
                        </div>
                    </div>

                    <!-- PAI ALLERGIES -->
                    <div class="stat-card ${paiAlertees > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('pai')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">⚠️</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">PAI Enfants</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${paiEnfants.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${paiAlertees > 0 ? `<span style="color:var(--warning);">⏰ ${paiAlertees} check adrenaline</span>` : '✓ À jour'}
                        </div>
                    </div>

                    <!-- RAPPELS PRODUITS -->
                    <div class="stat-card ${rappelsActifs > 0 ? 'danger' : 'success'}" 
                         onclick="App.navigate('rappels-produits')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">📦</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Rappels Produits</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${rappelsActifs}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${rappelsActifs > 0 ? `<span style="color:var(--danger);">En cours</span>` : '✓ Aucun'}
                        </div>
                    </div>

                    <!-- MAINTENANCE -->
                    <div class="stat-card ${maintenancesRetard > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('maintenance')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">🔧</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Maintenance</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${maintenances.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${maintenancesRetard > 0 ? `<span style="color:var(--warning);">⏰ ${maintenancesRetard} retard</span>` : '✓ À jour'}
                        </div>
                    </div>

                    <!-- VALIDATION NETTOYAGE -->
                    <div class="stat-card ${nettoyageNC > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('validation-nettoyage')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">🧼</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Validation nettoyage</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${validationsNettoyage.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${nettoyageNC > 0 ? `<span style="color:var(--warning);">⚠️ ${nettoyageNC} NC</span>` : '✓ OK'}
                        </div>
                    </div>

                    <!-- AGEC DONS -->
                    <div class="stat-card success" 
                         onclick="App.navigate('agec-avance')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">♻️</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">AGEC Dons</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${totalDonsKg.toFixed(1)}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">kg donnés</div>
                    </div>

                    <!-- ANALYSE RISQUES -->
                    <div class="stat-card ${analyseRisques.length === 0 ? 'info' : 'success'}" 
                         onclick="App.navigate('analyse-risques')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">🔬</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Analyse risques</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${analyseRisques.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">formalisées</div>
                    </div>

                    <!-- INSTALLATIONS SANITAIRES -->
                    <div class="stat-card ${installationsNC > 0 ? 'warning' : 'success'}" 
                         onclick="App.navigate('douches-vestiaires')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">🚿</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Installations</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${doushesVestiaires.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">
                            ${installationsNC > 0 ? `<span style="color:var(--warning);">⚠️ ${installationsNC} NC</span>` : '✓ OK'}
                        </div>
                    </div>

                    <!-- ARCHIVES -->
                    <div class="stat-card info" 
                         onclick="App.navigate('archivage-dlc')" style="cursor:pointer;padding:0.75rem;">
                        <div style="font-size:1.2rem;">📦</div>
                        <div class="stat-label" style="margin:0.25rem 0 0 0;">Archivage</div>
                        <div class="stat-value" style="font-size:1.5rem;margin:0.25rem 0;">${archives.length}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">snapshots 5 ans</div>
                    </div>
                </div>

            <!-- Actions rapides -->
            <div style="margin-bottom:1rem;">
                <span style="font-size:1.2rem;font-weight:600;">Actions rapides</span>
            </div>
            <div class="quick-actions" style="margin-bottom:1.5rem;">
                    <button class="quick-action-btn" onclick="Temperatures.showAddModal()">
                        <span class="qa-icon">\uD83C\uDF21\uFE0F</span>
                        Releve temperature
                    </button>
                    <button class="quick-action-btn" onclick="Temperatures.showCCPModal()">
                        <span class="qa-icon">\uD83D\uDD25</span>
                        CCP Cuisson
                    </button>
                    <button class="quick-action-btn" onclick="Nettoyage.showAddModal()">
                        <span class="qa-icon">\uD83E\uDDF9</span>
                        Enregistrer nettoyage
                    </button>
                    <button class="quick-action-btn" onclick="Receptions.showAddModal()">
                        <span class="qa-icon">\uD83D\uDCE6</span>
                        Nouvelle reception
                    </button>
                    <button class="quick-action-btn" onclick="Tracabilite.showAddEtiquetteModal()">
                        <span class="qa-icon">\uD83C\uDFF7\uFE0F</span>
                        Etiquette J+3
                    </button>
                    <button class="quick-action-btn" onclick="Protocoles.showAddHuileModal()">
                        <span class="qa-icon">\uD83C\uDF73</span>
                        Controle huile
                    </button>
                    <button class="quick-action-btn" onclick="Inventaire.showAddModal()">
                        <span class="qa-icon">\uD83D\uDCCB</span>
                        Ajouter inventaire
                    </button>
                    <button class="quick-action-btn" onclick="Alertes.showAddModal()">
                        <span class="qa-icon">\u26A0\uFE0F</span>
                        Creer alerte
                    </button>
                    <button class="quick-action-btn" onclick="Voice.activate()">
                        <span class="qa-icon">\uD83C\uDFA4</span>
                        OK Cuisine
                    </button>
                </div>

            <!-- Alertes actives -->
            ${alertes.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">\u26A0\uFE0F Alertes actives</span>
                        <button class="btn btn-secondary" onclick="App.navigate('alertes')" style="font-size:0.85rem;">Voir tout</button>
                    </div>
                    ${alertes.slice(0, 5).map(a => {
                        const icon = a.niveau === 'critique' ? '\uD83D\uDD34' : '\uD83D\uDFE1';
                        return `
                            <div class="alert-item ${a.niveau === 'critique' ? 'critical' : 'warning'}" style="margin-bottom:0.5rem;">
                                <div class="alert-icon">${icon}</div>
                                <div class="alert-content">
                                    <div class="alert-title">${UI.escapeHTML(a.titre)}</div>
                                    <div class="alert-time">${Storage.formatDateTime(a.timestamp)}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}

            <!-- Dernieres actions -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCDD Dernieres actions</span>
                    <button class="btn btn-secondary" onclick="App.navigate('journal')" style="font-size:0.85rem;">Voir tout</button>
                </div>
                ${journal.length === 0
                    ? '<p style="color:var(--text-muted);text-align:center;padding:1rem;">Aucune action aujourd\'hui</p>'
                    : `<div>
                        ${journal.slice(-10).reverse().map(e => {
                            const icons = { temperature: '\uD83C\uDF21\uFE0F', nettoyage: '\uD83E\uDDF9', reception: '\uD83D\uDCE6', inventaire: '\uD83D\uDCCB', alerte: '\u26A0\uFE0F', connexion: '\uD83D\uDD11', ccp: '\uD83D\uDD25', allergenes: '\uD83C\uDF3E', tracabilite: '\uD83D\uDD0D', huile: '\uD83C\uDF73' };
                            return `
                                <div class="journal-entry">
                                    <div class="journal-time">${Storage.formatTime(e.timestamp)}</div>
                                    <div class="journal-icon">${icons[e.type] || '\u2139\uFE0F'}</div>
                                    <div class="journal-text">${UI.escapeHTML(e.message)}</div>
                                    <div class="journal-user">${UI.escapeHTML(e.user)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>`
                }
            </div>

            <!-- Derniers releves temperatures -->
            ${temps.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">\uD83C\uDF21\uFE0F Derniers releves</span>
                    </div>
                    <div class="stats-grid">
                        ${config.zones_temperature.map(zone => {
                            const lastRecord = [...temps].reverse().find(r => r.zone_id === zone.id);
                            if (!lastRecord) return '';
                            const status = UI.temperatureStatus(lastRecord.valeur, zone.min, zone.max);
                            const cls = status.class === 'status-ok' ? 'success' : status.class === 'status-warning' ? 'warning' : 'danger';
                            return `
                                <div class="stat-card ${cls}">
                                    <div class="stat-label">${zone.nom}</div>
                                    <div class="stat-value">${lastRecord.valeur}\u00B0C</div>
                                    <div style="font-size:0.75rem;color:var(--text-muted);">${Storage.formatTime(lastRecord.timestamp)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        this._lastDashboardData = dashboardData;
        this.bindDashboardInteractions();

        // Update sidebar info
        setTimeout(() => UI.updateSidebarInfo(), 100);
    },

    // Toggle DLC list visibility
    toggleDLCList(type) {
        const contentEl = document.getElementById(`dlc-${type}-content`);
        if (!contentEl) return;

        const isHidden = contentEl.style.display === 'none';
        contentEl.style.display = isHidden ? 'block' : 'none';
    }
};
