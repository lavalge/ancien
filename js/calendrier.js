/* ============================================================
   OK CUISINE — Module Calendrier
   Gestion des événements, réunions, livraisons, rendez-vous
   ============================================================ */

const Calendrier = {
    events: [],
    currentDate: new Date(), // Date de référence pour navigation
    viewMode: '3days', // '3days' ou 'month'
    
    init() {
        this.events = Storage.load('calendrier_events', []);
        this.currentDate = new Date();
    },

    // --- Données ---
    getEventsForDay(date) {
        const dateStr = this._formatDate(date);
        return this.events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    },

    getNext3Days(startDate = null) {
        if (!startDate) {
            startDate = new Date();
        }
        
        const days = [];
        for (let i = 0; i < 3; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            days.push({
                date: day,
                dateStr: this._formatDate(day),
                dayName: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day.getDay()],
                dayNum: day.getDate(),
                events: this.getEventsForDay(day),
                isToday: this._formatDate(new Date()) === this._formatDate(day)
            });
        }
        return days;
    },

    getMonthDays(date = null) {
        if (!date) date = new Date();
        
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        for (let i = 0; i < 42; i++) { // 6 semaines x 7 jours
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            days.push({
                date: day,
                dateStr: this._formatDate(day),
                dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][day.getDay()],
                dayNum: day.getDate(),
                month: day.getMonth(),
                events: this.getEventsForDay(day),
                isToday: this._formatDate(new Date()) === this._formatDate(day),
                isCurrentMonth: day.getMonth() === month
            });
        }
        return days;
    },

    addEvent(event) {
        const newEvent = {
            id: 'evt_' + Date.now(),
            date: event.date,
            time: event.time || '09:00',
            title: event.title,
            description: event.description || '',
            type: event.type || 'event',
            color: event.color || '#3498db',
            createdBy: App.currentUser?.nom || 'Système',
            createdAt: new Date().toISOString()
        };
        
        this.events.push(newEvent);
        Storage.save('calendrier_events', this.events);
        Journal.log('calendrier', `Événement ajouté: ${newEvent.title}`);
        return newEvent;
    },

    updateEvent(id, updates) {
        const idx = this.events.findIndex(e => e.id === id);
        if (idx === -1) return false;
        
        this.events[idx] = { ...this.events[idx], ...updates };
        Storage.save('calendrier_events', this.events);
        Journal.log('calendrier', `Événement modifié: ${this.events[idx].title}`);
        return true;
    },

    deleteEvent(id) {
        const idx = this.events.findIndex(e => e.id === id);
        if (idx === -1) return false;
        
        const title = this.events[idx].title;
        this.events.splice(idx, 1);
        Storage.save('calendrier_events', this.events);
        Journal.log('calendrier', `Événement supprimé: ${title}`);
        return true;
    },

    // --- Navigation ---
    prevDays() {
        this.currentDate.setDate(this.currentDate.getDate() - 3);
        this.render();
    },

    nextDays() {
        this.currentDate.setDate(this.currentDate.getDate() + 3);
        this.render();
    },

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    setViewMode(mode) {
        this.viewMode = mode;
        this.currentDate = new Date(); // Reset à aujourd'hui
        this.render();
    },

    // --- UI ---
    render() {
        try {
            const page = document.getElementById('page-calendrier');
            if (!page) {
                console.error('❌ page-calendrier div not found');
                return;
            }
            
            if (this.viewMode === '3days') {
                page.innerHTML = this._render3Days();
            } else if (this.viewMode === 'month') {
                page.innerHTML = this._renderMonth();
            }
        } catch (err) {
            console.error('❌ Calendrier render error:', err);
            const page = document.getElementById('page-calendrier');
            if (page) page.innerHTML = `<div style="color:red;padding:2rem;">Erreur: ${err.message}</div>`;
        }
    },

    _render3Days() {
        const days = this.getNext3Days(this.currentDate);
        const monthName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const month = monthName[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        
        let html = `
            <div class="page-header">
                <h1>📅 Calendrier</h1>
                <div class="calendar-view-switch">
                    <button class="btn btn-sm ${this.viewMode === '3days' ? 'active' : ''}" onclick="Calendrier.setViewMode('3days')">
                        3 JOURS
                    </button>
                    <button class="btn btn-sm ${this.viewMode === 'month' ? 'active' : ''}" onclick="Calendrier.setViewMode('month')">
                        MOIS
                    </button>
                </div>
            </div>

            <div class="calendar-3days">
                <div class="three-days-container">
                    <div class="three-days-header">
                        <button class="nav-button nav-prev-month" onclick="Calendrier.prevDays()">← Précédent</button>
                        <h2>${month} ${year}</h2>
                        <button class="nav-button nav-next-month" onclick="Calendrier.nextDays()">Suivant →</button>
                    </div>
                    <div class="days-row">
        `;

        days.forEach(day => {
            html += `
                <div class="day-card ${day.isToday ? 'today' : ''}" onclick="Calendrier.showDayModal('${day.dateStr}')">
                    <div class="day-card-header">
                        <h3>${day.dayName}</h3>
                        <span class="day-num">${day.dayNum}</span>
                    </div>
                    <div class="day-card-events">
            `;

            if (day.events.length === 0) {
                html += `<p class="no-events">Aucun<br>événement</p>`;
            } else {
                day.events.forEach(evt => {
                    html += `
                        <div class="event-compact" style="border-left: 4px solid ${evt.color || '#3498db'}">
                            <div class="event-compact-time">${evt.time}</div>
                            <div class="event-compact-title">${UI.escapeHTML(evt.title)}</div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
        return html;
    },

    _renderMonth() {
        const days = this.getMonthDays(this.currentDate);
        const monthName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const month = monthName[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        
        let html = `
            <div class="page-header">
                <h1>📅 Calendrier</h1>
                <div class="calendar-view-switch">
                    <button class="btn btn-sm ${this.viewMode === '3days' ? 'active' : ''}" onclick="Calendrier.setViewMode('3days')">
                        3 JOURS
                    </button>
                    <button class="btn btn-sm ${this.viewMode === 'month' ? 'active' : ''}" onclick="Calendrier.setViewMode('month')">
                        MOIS
                    </button>
                </div>
            </div>

            <div class="calendar-month">
                <div class="month-header">
                    <button class="nav-button nav-prev-month" onclick="Calendrier.prevMonth()">← ${monthName[new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1).getMonth()]}</button>
                    <h2>${month} ${year}</h2>
                    <button class="nav-button nav-next-month" onclick="Calendrier.nextMonth()">${monthName[new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1).getMonth()]} →</button>
                </div>

                <div class="month-days-header">
                    <div>Dimanche</div>
                    <div>Lundi</div>
                    <div>Mardi</div>
                    <div>Mercredi</div>
                    <div>Jeudi</div>
                    <div>Vendredi</div>
                    <div>Samedi</div>
                </div>

                <div class="month-grid">
        `;

        days.forEach(day => {
            if (day.month !== this.currentDate.getMonth()) {
                html += `<div class="month-day other-month"></div>`;
            } else {
                html += `
                    <div class="month-day ${day.isToday ? 'today' : ''}" onclick="Calendrier.showDayModal('${day.dateStr}')">
                        <div class="month-day-num">${day.dayNum}</div>
                        <div class="month-day-events">
                `;

                day.events.slice(0, 2).forEach(evt => {
                    html += `<div class="event-dot" style="background:${evt.color || '#3498db'}" title="${UI.escapeHTML(evt.title)}"></div>`;
                });

                if (day.events.length > 2) {
                    html += `<div class="event-more">+${day.events.length - 2}</div>`;
                }

                html += `
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;
        return html;
    },

    showAddEventModal(dateStr = null) {
        if (!dateStr) {
            dateStr = this._formatDate(new Date());
        }

        const types = ['réunion', 'livraison', 'rendez-vous', 'repas', 'maintenance', 'autre'];
        const body = `
            <form onsubmit="Calendrier.submitAddEvent(event)">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="event-date" value="${dateStr}" required>
                </div>
                <div class="form-group">
                    <label>Heure</label>
                    <input type="time" id="event-time" value="09:00" required>
                </div>
                <div class="form-group">
                    <label>Titre</label>
                    <input type="text" id="event-title" placeholder="Titre de l'événement" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="event-type">
                        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="event-desc" placeholder="Détails supplémentaires..." rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Couleur</label>
                    <input type="color" id="event-color" value="#3498db">
                </div>
                <button type="submit" class="btn btn-success">Ajouter</button>
            </form>
        `;
        
        UI.openModal('Nouvel Événement', body);
    },

    showDayModal(dateStr) {
        const events = this.getEventsForDay(new Date(dateStr));
        const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][new Date(dateStr).getDay()];
        const dayNum = new Date(dateStr).getDate();
        const monthName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][new Date(dateStr).getMonth()];
        
        let body = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="color: var(--accent); margin-bottom: 0.5rem;">${dayName}</h3>
                <p style="font-size: 1.2rem; font-weight: 600;">${dayNum} ${monthName}</p>
            </div>
        `;

        if (events.length === 0) {
            body += `<p style="text-align: center; color: var(--text-muted); margin-bottom: 1.5rem;">Aucun événement ce jour</p>`;
        } else {
            body += `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--accent); margin-bottom: 1rem;">Événements du jour:</h4>
            `;
            
            events.forEach(evt => {
                body += `
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${evt.color};">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-weight: 700; color: var(--accent); font-size: 0.9rem;">${evt.time}</div>
                                <div style="font-weight: 600; color: var(--text-primary); margin-top: 0.25rem;">${UI.escapeHTML(evt.title)}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">${evt.type}</div>
                                ${evt.description ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">${UI.escapeHTML(evt.description)}</div>` : ''}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn-edit-quick" onclick="Calendrier.showEditEventModal('${evt.id}')" style="padding: 0.4rem 0.6rem; background: var(--border); border: none; border-radius: 4px; cursor: pointer; color: var(--text-secondary);">✏️</button>
                                <button class="btn-delete-quick" onclick="Calendrier.deleteEventAndRefresh('${evt.id}', '${dateStr}')" style="padding: 0.4rem 0.6rem; background: var(--danger); border: none; border-radius: 4px; cursor: pointer; color: white;">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            body += `</div>`;
        }

        body += `
            <button class="btn btn-accent" style="width: 100%;" onclick="UI.closeModal(); Calendrier.showAddEventModal('${dateStr}');">
                + AJOUTER UN ÉVÉNEMENT
            </button>
        `;

        UI.openModal(`Événements du ${dayNum} ${monthName}`, body);
    },

    deleteEventAndRefresh(id, dateStr) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
            this.deleteEvent(id);
            this.showDayModal(dateStr); // Rafraîchir la modale
        }
    },

    showEditEventModal(eventId) {
        const evt = this.events.find(e => e.id === eventId);
        if (!evt) return;

        const types = ['réunion', 'livraison', 'rendez-vous', 'repas', 'maintenance', 'autre'];
        const body = `
            <form onsubmit="Calendrier.submitEditEvent('${eventId}', event)">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="event-date" value="${evt.date}" required>
                </div>
                <div class="form-group">
                    <label>Heure</label>
                    <input type="time" id="event-time" value="${evt.time}" required>
                </div>
                <div class="form-group">
                    <label>Titre</label>
                    <input type="text" id="event-title" value="${UI.escapeHTML(evt.title)}" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="event-type">
                        ${types.map(t => `<option value="${t}" ${t === evt.type ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="event-desc" rows="3">${UI.escapeHTML(evt.description)}</textarea>
                </div>
                <div class="form-group">
                    <label>Couleur</label>
                    <input type="color" id="event-color" value="${evt.color}">
                </div>
                <button type="submit" class="btn btn-success">Mettre à jour</button>
            </form>
        `;
        
        UI.openModal('Éditer Événement', body);
    },

    submitAddEvent(e) {
        e.preventDefault();
        const event = {
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            title: document.getElementById('event-title').value,
            type: document.getElementById('event-type').value,
            description: document.getElementById('event-desc').value,
            color: document.getElementById('event-color').value
        };

        this.addEvent(event);
        UI.closeModal();
        this.render();
        UI.toast('Événement ajouté !', 'success');
    },

    submitEditEvent(id, e) {
        e.preventDefault();
        const updates = {
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            title: document.getElementById('event-title').value,
            type: document.getElementById('event-type').value,
            description: document.getElementById('event-desc').value,
            color: document.getElementById('event-color').value
        };

        this.updateEvent(id, updates);
        UI.closeModal();
        this.render();
        UI.toast('Événement mis à jour !', 'success');
    },

    // --- Utilitaires ---
    _formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

// Initialiser au démarrage
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Calendrier.init());
} else {
    Calendrier.init();
}

