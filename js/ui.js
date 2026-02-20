/* ============================================================
   OK CUISINE — UI Utilities
   Toasts, modales, sidebar, helpers d'affichage
   ============================================================ */

const UI = {
    // --- Sidebar ---
    sidebarOpen: false,

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        document.getElementById('sidebar').classList.toggle('open', this.sidebarOpen);
        document.getElementById('sidebar-overlay').classList.toggle('active', this.sidebarOpen);
    },

    closeSidebar() {
        this.sidebarOpen = false;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    },

    // --- Nav Group toggle (collapsible sections) ---
    toggleNavGroup(groupName) {
        const group = document.querySelector(`.nav-group[data-group="${groupName}"]`);
        if (group) group.classList.toggle('open');
    },

    // Open the nav group containing a specific page
    openNavGroupForPage(page) {
        const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navItem) {
            const group = navItem.closest('.nav-group');
            if (group && !group.classList.contains('open')) {
                group.classList.add('open');
            }
        }
    },

    // --- Toasts ---
    toast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = { success: '✓', warning: '⚠', danger: '✕', info: 'ℹ' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // --- Modal ---
    openModal(title, bodyHTML, footerHTML = '') {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHTML;
        document.getElementById('modal-footer').innerHTML = footerHTML;
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    // --- Confirmation dialog ---
    confirm(title, message) {
        return new Promise((resolve) => {
            const body = `<p style="font-size:1.05rem;color:var(--text-secondary);">${message}</p>`;
            const footer = `
                <button class="btn btn-secondary" onclick="UI.closeModal(); UI._confirmResolve(false);">Annuler</button>
                <button class="btn btn-danger" onclick="UI.closeModal(); UI._confirmResolve(true);">Confirmer</button>
            `;
            this._confirmResolve = resolve;
            this.openModal(title, body, footer);
        });
    },

    // --- Update alert badge ---
    updateAlertBadge() {
        const alertes = Storage.getAlertes().filter(a => !a.resolved);
        const badge = document.getElementById('alert-badge');
        if (alertes.length > 0) {
            badge.textContent = alertes.length;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    },

    // --- Update sidebar info ---
    updateSidebarInfo() {
        // Update user info in footer
        if (App.currentUser) {
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) userNameEl.textContent = App.currentUser.nom || '-- Utilisateur --';
            const avatarEl = document.getElementById('sidebar-user-avatar');
            if (avatarEl) avatarEl.textContent = App.currentUser.initiales || '?';
            const roleEl = document.getElementById('sidebar-user-role');
            if (roleEl) roleEl.textContent = App.currentUser.role === 'admin' ? 'Administrateur' : 'Employé';
        }

        // Update risk badge (Gestion risques)
        const alertes = Storage.getAlertes().filter(a => !a.resolved);
        const tiacActifs = Storage.getTIAC().filter(t => !t.clos).length;
        const rappelsActifs = Storage.getRappelsProduits().filter(r => !r.resolu).length;
        const risksCount = alertes.length + tiacActifs + rappelsActifs;
        
        const riskBadge = document.getElementById('risk-badge');
        if (riskBadge) {
            if (risksCount > 0) {
                riskBadge.textContent = risksCount;
                riskBadge.style.display = 'flex';
            } else {
                riskBadge.style.display = 'none';
            }
        }

        // Update compliance badge
        const complianceBadge = document.getElementById('compliance-badge');
        if (complianceBadge) {
            const formations = Storage.getFormations().length;
            const tiac = Storage.getTIAC().length;
            const pai = Storage.getPAIEnfants().length;
            const rgpd = Storage.getRGPDConsentements().length;
            const rappels = Storage.getRappelsProduits().length;
            const agec = Storage.getAGECDons().length;
            const maintenance = Storage.getMaintenances().length;
            const analyse = Storage.getAnalyseRisques().length;
            const validation = Storage.getValidationNettoyages().length;
            const separation = Storage.getSeparationPlans().length;
            const douches = Storage.getDoushesVestiaires().length;
            const archives = Storage.getArchivesDLC().length;

            const total = [formations, tiac, pai, rgpd, rappels, agec, maintenance, analyse, validation, separation, douches, archives].filter(c => c > 0).length;
            complianceBadge.textContent = total + '/12';
        }
    },

    // --- Set active nav ---
    setActiveNav(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
    },

    // --- Page title map ---
    pageTitles: {
        dashboard: 'Tableau de bord',
        agents: 'Gestion des agents',
        temperatures: 'Températures',
        nettoyage: 'Nettoyage',
        receptions: 'Réceptions',
        inventaire: 'Inventaire',
        alertes: 'Alertes',
        allergenes: 'Allergènes',
        tracabilite: 'Traçabilité',
        protocoles: 'Protocoles HACCP',
        journal: 'Journal',
        config: 'Configuration',
        menus: 'Menus',
        audit: 'Audit & Contrôle',
        simulateur: 'Simulateur DDPP',
        recettes: 'Recettes',
        fournisseurs: 'Fournisseurs',
        formation: 'Formations du personnel',
        'centre-formation': 'Centre de formation',
        tiac: 'TIAC Incidents',
        rgpd: 'RGPD Données',
        'rappels-produits': 'Rappels produits',
        pai: 'PAI Allergies',
        'agec-avance': 'AGEC Dons alimentaires',
        maintenance: 'Maintenance équipements',
        'analyse-risques': 'Analyse des risques',
        'validation-nettoyage': 'Validation nettoyage',
        'separation-cru-cuit': 'Séparation cru/cuit',
        'douches-vestiaires': 'Douches/Vestiaires',
        'archivage-dlc': 'Archivage DLC'
    },

    // --- Show page ---
    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const el = document.getElementById('page-' + page);
        if (el) el.classList.add('active');
        document.getElementById('page-title').textContent = this.pageTitles[page] || page;
        this.setActiveNav(page);
        this.openNavGroupForPage(page);
        this.updateSidebarInfo();
        document.body.classList.toggle('dashboard-active', page === 'dashboard');
        this.closeSidebar();
    },

    // --- Render helpers ---
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Format conformity status
    conformityBadge(isConforme) {
        if (isConforme) {
            return '<span class="badge badge-success">Conforme</span>';
        }
        return '<span class="badge badge-danger">Non conforme</span>';
    },

    temperatureStatus(valeur, min, max) {
        const v = parseFloat(valeur);
        if (isNaN(v)) return { status: 'unknown', label: '?', class: '' };
        if (v >= min && v <= max) {
            return { status: 'ok', label: 'Conforme', class: 'status-ok' };
        } else if (v < min - 2 || v > max + 2) {
            return { status: 'danger', label: 'Critique', class: 'status-danger' };
        } else {
            return { status: 'warning', label: 'Attention', class: 'status-warning' };
        }
    },

    // Empty state
    emptyState(icon, text) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-text">${text}</div>
            </div>
        `;
    }
};
