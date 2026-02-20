/* ============================================================
   OK CUISINE — Module Journal / Traçabilité
   Log complet de toutes les actions horodatées
   ============================================================ */

const Journal = {
    selectedDate: null,

    init() {
        this.selectedDate = Storage.today();
    },

    // Log an action (called by Storage on each operation)
    log(type, message, data = null) {
        Storage.addJournalEntry({
            type,
            message,
            data: data ? JSON.stringify(data) : null
        });
    },

    render() {
        const page = document.getElementById('page-journal');
        const entries = Storage.getJournal(this.selectedDate);

        const icons = {
            temperature: '🌡️',
            nettoyage: '🧹',
            reception: '📦',
            inventaire: '📋',
            alerte: '⚠️',
            connexion: '🔑',
            config: '⚙️',
            export: '📄',
            system: 'ℹ️'
        };

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">📝 Journal de traçabilité</h2>
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="PDF.export('journal')">
                        📄 Exporter PDF
                    </button>
                    <button class="btn btn-secondary" onclick="window.print()">
                        🖨️ Imprimer
                    </button>
                </div>
            </div>

            <div class="date-filter">
                <label>Date :</label>
                <input type="date" class="form-control" value="${this.selectedDate}"
                       onchange="Journal.changeDate(this.value)" style="width:auto;">
                <span style="color:var(--text-muted);margin-left:0.5rem;">${Storage.formatDate(this.selectedDate)}</span>
            </div>

            <div class="stat-card info" style="margin-bottom:1.5rem;">
                <div class="stat-label">Actions enregistrées</div>
                <div class="stat-value">${entries.length}</div>
            </div>

            <div class="card">
                ${entries.length === 0
                    ? UI.emptyState('📝', 'Aucune activité enregistrée pour cette date')
                    : `<div class="journal-list">
                        ${entries.slice().reverse().map(e => `
                            <div class="journal-entry fade-in">
                                <div class="journal-time">${Storage.formatTime(e.timestamp)}</div>
                                <div class="journal-icon">${icons[e.type] || 'ℹ️'}</div>
                                <div class="journal-text">${UI.escapeHTML(e.message)}</div>
                                <div class="journal-user">${UI.escapeHTML(e.user)}</div>
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>
        `;
    },

    changeDate(date) {
        this.selectedDate = date;
        this.render();
    }
};
