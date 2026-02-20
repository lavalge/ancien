/* ============================================================
   OK CUISINE — Module PDF Export
   Génération de rapports PDF et impression
   ============================================================ */

const PDF = {
    export(type) {
        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                UI.toast('Module PDF non chargé. Vérifiez votre connexion internet.', 'danger');
                return;
            }

            switch (type) {
                case 'temperatures': this._exportTemperatures(); break;
                case 'nettoyage': this._exportNettoyage(); break;
                case 'receptions': this._exportReceptions(); break;
                case 'inventaire': this._exportInventaire(); break;
                case 'journal': this._exportJournal(); break;
                case 'allergenes': this._exportAllergenes(); break;
                case 'tracabilite': this._exportTracabilite(); break;
                case 'protocoles': this._exportProtocoles(); break;
                case 'menus': this._exportMenus(); break;
                case 'ddpp': this._exportDDPP(); break;
                case 'simulateur': this._exportSimulateur(); break;
                default: UI.toast('Type d\'export inconnu', 'warning');
            }
        } catch (e) {
            console.error('PDF export error:', e);
            UI.toast('Erreur lors de l\'export PDF', 'danger');
        }
    },

    // Nettoie les emojis et caracteres Unicode non supportes par jsPDF
    _clean(text) {
        if (!text) return '';
        return String(text)
            .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')   // Emojis supplementaires
            .replace(/[\u{2600}-\u{27BF}]/gu, '')      // Symboles divers
            .replace(/[\u{FE00}-\u{FE0F}]/gu, '')      // Variation selectors
            .replace(/[\u{200D}]/gu, '')                // Zero-width joiner
            .replace(/[\u{20E3}]/gu, '')                // Enclosing keycap
            .replace(/[\u{E0020}-\u{E007F}]/gu, '')    // Tags
            .replace(/\u2014/g, '--')                   // Em dash -> --
            .replace(/\u2013/g, '-')                    // En dash -> -
            .replace(/[\u2018\u2019]/g, "'")            // Smart quotes simples
            .replace(/[\u201C\u201D]/g, '"')            // Smart quotes doubles
            .replace(/\u2026/g, '...')                  // Ellipsis
            .replace(/\u00A0/g, ' ')                    // Non-breaking space
            .replace(/\s{2,}/g, ' ')                    // Espaces multiples
            .trim();
    },

    _header(doc, title) {
        const config = Storage.getConfig();
        doc.setFontSize(18);
        doc.setTextColor(0, 100, 180);
        doc.text('OK Cuisine -- ' + this._clean(config.etablissement), 14, 15);

        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(this._clean(title), 14, 24);

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 14, 30);

        doc.setDrawColor(0, 100, 180);
        doc.setLineWidth(0.5);
        doc.line(14, 33, 196, 33);

        return 40;
    },

    _footer(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('OK Cuisine -- Page ' + i + '/' + pageCount, 14, 287);
            doc.text(Storage.formatDate(Storage.today()), 196, 287, { align: 'right' });
        }
    },

    _exportTemperatures() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const date = Temperatures.selectedDate || Storage.today();
        const records = Storage.getTemperatures(date);
        const config = Storage.getConfig();

        this._header(doc, `Relevés de Températures — ${Storage.formatDate(date)}`);

        if (records.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucun relevé pour cette date.', 14, 50);
        } else {
            const rows = records.map(r => {
                const zone = config.zones_temperature.find(z => z.id === r.zone_id);
                const limits = zone ? `${zone.min}°C - ${zone.max}°C` : '-';
                const status = zone ? UI.temperatureStatus(r.valeur, zone.min, zone.max) : { label: '?' };
                return [
                    Storage.formatTime(r.timestamp),
                    r.zone_nom,
                    r.valeur + '°C',
                    limits,
                    status.label,
                    r.user
                ];
            });

            doc.autoTable({
                startY: 40,
                head: [['Heure', 'Zone', 'Temp.', 'Limites', 'Statut', 'Par']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255 }
            });
        }

        this._footer(doc);
        doc.save(`temperatures-${date}.pdf`);
        UI.toast('PDF Températures exporté', 'success');
    },

    _exportNettoyage() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const date = Nettoyage.selectedDate || Storage.today();
        const records = Storage.getNettoyages(date);

        this._header(doc, `Suivi Nettoyage — ${Storage.formatDate(date)}`);

        if (records.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucun nettoyage pour cette date.', 14, 50);
        } else {
            const rows = records.map(r => [
                Storage.formatTime(r.timestamp),
                r.zones.join(', '),
                r.produit,
                r.user
            ]);

            doc.autoTable({
                startY: 40,
                head: [['Heure', 'Zones', 'Produit', 'Par']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255 }
            });
        }

        this._footer(doc);
        doc.save(`nettoyage-${date}.pdf`);
        UI.toast('PDF Nettoyage exporté', 'success');
    },

    _exportReceptions() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const date = Receptions.selectedDate || Storage.today();
        const records = Storage.getReceptions(date);

        this._header(doc, `Réceptions — ${Storage.formatDate(date)}`);

        if (records.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucune réception pour cette date.', 14, 50);
        } else {
            const rows = records.map(r => [
                Storage.formatTime(r.timestamp),
                r.fournisseur,
                r.produit,
                r.temperature !== null ? r.temperature + '°C' : '-',
                r.conforme ? 'Conforme' : 'NON CONFORME',
                r.user
            ]);

            doc.autoTable({
                startY: 40,
                head: [['Heure', 'Fournisseur', 'Produit', 'Temp.', 'Conformité', 'Par']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255 },
                bodyStyles: {},
                didParseCell: function(data) {
                    if (data.column.index === 4 && data.section === 'body') {
                        if (data.cell.raw === 'NON CONFORME') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
        }

        this._footer(doc);
        doc.save(`receptions-${date}.pdf`);
        UI.toast('PDF Réceptions exporté', 'success');
    },

    _exportInventaire() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const items = Storage.getInventaire();

        this._header(doc, 'Inventaire');

        if (items.length === 0) {
            doc.setFontSize(12);
            doc.text('Inventaire vide.', 14, 50);
        } else {
            // Grouper par catégorie
            const grouped = {};
            items.forEach(item => {
                const cat = item.categorie || 'Non classé';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(item);
            });

            let startY = 40;
            for (const [cat, catItems] of Object.entries(grouped)) {
                doc.setFontSize(11);
                doc.setTextColor(0, 100, 180);
                doc.text(cat, 14, startY);
                startY += 2;

                const rows = catItems.map(i => [i.nom, i.quantite, i.unite, i.dlc || '—']);

                doc.autoTable({
                    startY: startY,
                    head: [['Produit', 'Quantité', 'Unité', 'DLC']],
                    body: rows,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 3 },
                    headStyles: { fillColor: [80, 80, 80], textColor: 255 }
                });

                startY = doc.lastAutoTable.finalY + 10;
            }
        }

        this._footer(doc);
        doc.save(`inventaire-${Storage.today()}.pdf`);
        UI.toast('PDF Inventaire exporté', 'success');
    },

    _exportJournal() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const date = Journal.selectedDate || Storage.today();
        const entries = Storage.getJournal(date);

        this._header(doc, `Journal — ${Storage.formatDate(date)}`);

        if (entries.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucune entrée pour cette date.', 14, 50);
        } else {
            const rows = entries.map(e => [
                Storage.formatTime(e.timestamp),
                e.type,
                e.message,
                e.user
            ]);

            doc.autoTable({
                startY: 40,
                head: [['Heure', 'Type', 'Action', 'Par']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255 },
                columnStyles: {
                    2: { cellWidth: 90 }
                }
            });
        }

        this._footer(doc);
        doc.save(`journal-${date}.pdf`);
        UI.toast('PDF Journal exporte', 'success');
    },

    _exportAllergenes() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l');
        const plats = Storage.getAllergenePlats();

        this._header(doc, 'Matrice des Allergenes (Reg. INCO 1169/2011)');

        if (plats.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucun plat enregistre.', 14, 50);
        } else {
            const allerNames = Allergenes.LISTE_ALLERGENES.map(a => a.nom);
            const rows = plats.map(p => {
                const cells = [p.nom, p.categorie || '-'];
                Allergenes.LISTE_ALLERGENES.forEach(a => {
                    cells.push((p.allergenes || []).includes(a.id) ? 'X' : '');
                });
                return cells;
            });

            doc.autoTable({
                startY: 40,
                head: [['Plat', 'Cat.', ...allerNames]],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 6, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 6 },
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index >= 2) {
                        if (data.cell.raw === 'X') {
                            data.cell.styles.fillColor = [255, 220, 220];
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.textColor = [200, 0, 0];
                        }
                    }
                }
            });
        }

        this._footer(doc);
        doc.save(`allergenes-${Storage.today()}.pdf`);
        UI.toast('PDF Allergenes exporte', 'success');
    },

    _exportTracabilite() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const etiquettes = Storage.getEtiquettes();
        const config = Storage.getConfig();
        const fournisseurs = config.fournisseurs_agrees || [];

        this._header(doc, 'Tracabilite — Etiquettes & Fournisseurs');

        let startY = 40;

        // Fournisseurs
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 180);
        doc.text('Fournisseurs agrees', 14, startY);
        startY += 2;

        if (fournisseurs.length > 0) {
            doc.autoTable({
                startY: startY,
                head: [['Nom', 'Adresse', 'Telephone', 'Produits', 'Agrement']],
                body: fournisseurs.map(f => [f.nom, f.adresse || '-', f.telephone || '-', f.produits || '-', f.agrement || '-']),
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255 }
            });
            startY = doc.lastAutoTable.finalY + 10;
        } else {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucun fournisseur enregistre.', 14, startY + 5);
            startY += 15;
        }

        // Etiquettes
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 180);
        doc.text('Etiquettes de deconditionement', 14, startY);
        startY += 2;

        if (etiquettes.length > 0) {
            doc.autoTable({
                startY: startY,
                head: [['Produit', 'Origine', 'Date decond.', 'DLC sec.', 'Temp.', 'Lot', 'Par']],
                body: etiquettes.map(e => [e.produit, e.origine || '-', e.date_deconditionement, e.dlc_secondaire, e.temperature_stockage || '-', e.lot || '-', e.user]),
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [80, 80, 80], textColor: 255 }
            });
        }

        this._footer(doc);
        doc.save(`tracabilite-${Storage.today()}.pdf`);
        UI.toast('PDF Tracabilite exporte', 'success');
    },

    _exportProtocoles() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        this._header(doc, 'Protocoles HACCP — Temperatures reglementaires');

        // Conservation temperatures
        doc.autoTable({
            startY: 40,
            head: [['Produit', 'Temperature max.']],
            body: [
                ['Viandes hachees, preparations de viandes', '+2\u00B0C'],
                ['Poissons frais, crustaces crus', '0 a +2\u00B0C'],
                ['Volailles, gibier, lapin', '+4\u00B0C'],
                ['PCEA (plats cuisines elabores a l\'avance)', '+3\u00B0C'],
                ['Produits tres perissables', '+4\u00B0C'],
                ['Produits perissables', '+8\u00B0C'],
                ['Produits congeles', '-12\u00B0C'],
                ['Produits surgeles', '-18\u00B0C']
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [0, 100, 180], textColor: 255 }
        });

        let startY = doc.lastAutoTable.finalY + 10;

        // CCP
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 180);
        doc.text('Points Critiques de Controle (CCP)', 14, startY);

        doc.autoTable({
            startY: startY + 2,
            head: [['CCP', 'Limite critique']],
            body: [
                ['Cuisson generale', '\u2265 63\u00B0C a coeur'],
                ['Cuisson viande hachee', '\u2265 70\u00B0C a coeur'],
                ['Cuisson volaille', '\u2265 74\u00B0C a coeur'],
                ['Refroidissement rapide', 'De 63\u00B0C a < 10\u00B0C en < 2h'],
                ['Remise en temperature', 'De < 10\u00B0C a > 63\u00B0C en < 1h'],
                ['Maintien au chaud', '\u2265 63\u00B0C en permanence']
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [200, 50, 50], textColor: 255 }
        });

        this._footer(doc);
        doc.save(`protocoles-haccp-${Storage.today()}.pdf`);
        UI.toast('PDF Protocoles exporte', 'success');
    },

    // ============================================================
    // EXPORT MENUS PDF
    // ============================================================
    _exportMenus() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l'); // landscape pour les menus
        const date = Menus.selectedDate || Storage.today();
        const menus = Storage.getMenus(date);

        this._header(doc, `Menus — Semaine du ${Storage.formatDate(date)}`);

        if (menus.length === 0) {
            doc.setFontSize(12);
            doc.text('Aucun menu genere pour cette date.', 14, 50);
        } else {
            let startY = 40;
            menus.forEach((menu, idx) => {
                if (idx > 0) { doc.addPage(); startY = 40; this._header(doc, `Menus — Semaine ${idx + 1}`); }

                doc.setFontSize(11);
                doc.setTextColor(0, 100, 180);
                doc.text(this._clean('Semaine ' + (menu.semaine || idx + 1) + ' -- ' + menu.theme_nom + ' (' + menu.collectivite_nom + ')'), 14, startY);
                startY += 2;

                const rows = menu.jours.map(j => [
                    j.jour, j.entree, j.plat, j.accompagnement, j.dessert, j.fromage, j.allergenes || '—'
                ]);

                doc.autoTable({
                    startY: startY,
                    head: [['Jour', 'Entree', 'Plat', 'Accompagnement', 'Dessert', 'Fromage', 'Allergenes']],
                    body: rows,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 3 },
                    headStyles: { fillColor: [0, 100, 180], textColor: 255 },
                    columnStyles: {
                        0: { fontStyle: 'bold', fillColor: [230, 240, 250] },
                        6: { textColor: [200, 100, 0], fontSize: 7 }
                    }
                });

                startY = doc.lastAutoTable.finalY + 10;
            });
        }

        this._footer(doc);
        doc.save(`menus-${date}.pdf`);
        UI.toast('PDF Menus exporte', 'success');
    },

    // ============================================================
    // EXPORT PDF DDPP — CONTROLE SANITAIRE COMPLET
    // ============================================================
    _exportDDPP() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const config = Storage.getConfig();

        // Periode
        const dateDebut = Audit.dateDebut || Storage.today();
        const dateFin = Audit.dateFin || Storage.today();
        const dates = Audit._getDateRange(dateDebut, dateFin);

        // --- PAGE DE GARDE ---
        doc.setFontSize(24);
        doc.setTextColor(0, 100, 180);
        doc.text('DOSSIER DE CONTROLE SANITAIRE', 105, 50, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(50, 50, 50);
        doc.text(this._clean(config.etablissement), 105, 70, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Periode : du ' + Storage.formatDate(dateDebut) + ' au ' + Storage.formatDate(dateFin), 105, 85, { align: 'center' });
        doc.text('Document genere le ' + new Date().toLocaleDateString('fr-FR') + ' a ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), 105, 95, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('OK Cuisine -- Assistant HACCP', 105, 115, { align: 'center' });

        // Sommaire
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 180);
        doc.text('Sommaire', 14, 140);

        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        const sommaire = [
            '1. Releves de temperatures',
            '2. CCP — Points critiques de controle',
            '3. Plan de nettoyage',
            '4. Receptions et tracabilite des produits',
            '5. Menus servis et allergenes',
            '6. Alertes et non-conformites'
        ];
        sommaire.forEach((item, i) => {
            doc.text(item, 20, 155 + i * 10);
        });

        // --- SECTION 1 : TEMPERATURES ---
        doc.addPage();
        let y = this._header(doc, '1. Releves de Temperatures');

        dates.forEach(date => {
            const records = Storage.getTemperatures(date);
            if (records.length === 0) return;

            if (y > 250) { doc.addPage(); y = this._header(doc, '1. Releves de Temperatures (suite)'); }

            doc.setFontSize(10);
            doc.setTextColor(0, 100, 180);
            doc.text(Storage.formatDate(date), 14, y);
            y += 2;

            const rows = records.map(r => {
                const zone = config.zones_temperature.find(z => z.id === r.zone_id);
                const limits = zone ? `${zone.min} / ${zone.max}\u00B0C` : '-';
                const status = zone ? UI.temperatureStatus(r.valeur, zone.min, zone.max) : { label: '?' };
                return [
                    Storage.formatTime(r.timestamp),
                    r.zone_nom,
                    r.valeur + '\u00B0C',
                    limits,
                    status.label,
                    r.user
                ];
            });

            doc.autoTable({
                startY: y,
                head: [['Heure', 'Zone', 'Temp.', 'Limites', 'Statut', 'Operateur']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 7 },
                didParseCell: function(data) {
                    if (data.column.index === 4 && data.section === 'body') {
                        if (data.cell.raw === 'Critique') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (data.cell.raw === 'Attention') {
                            data.cell.styles.textColor = [230, 150, 0];
                        }
                    }
                }
            });
            y = doc.lastAutoTable.finalY + 8;
        });

        // --- SECTION 2 : CCP ---
        doc.addPage();
        y = this._header(doc, '2. CCP — Points Critiques de Controle');

        let hasCCP = false;
        dates.forEach(date => {
            const records = Storage.getCCPRecords(date);
            if (records.length === 0) return;
            hasCCP = true;

            if (y > 250) { doc.addPage(); y = this._header(doc, '2. CCP (suite)'); }

            doc.setFontSize(10);
            doc.setTextColor(0, 100, 180);
            doc.text(Storage.formatDate(date), 14, y);
            y += 2;

            const typeLabels = { cuisson: 'Cuisson', refroidissement: 'Refroidissement', remise_temp: 'Remise en temp.' };
            const rows = records.map(r => [
                Storage.formatTime(r.timestamp),
                typeLabels[r.type_ccp] || r.type_ccp,
                r.produit || '-',
                r.temp_mesuree != null ? r.temp_mesuree + '\u00B0C' : '-',
                r.conforme ? 'Conforme' : 'Non conforme',
                r.user
            ]);

            doc.autoTable({
                startY: y,
                head: [['Heure', 'Type CCP', 'Produit', 'Temp.', 'Conformite', 'Operateur']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [200, 50, 50], textColor: 255, fontSize: 7 },
                didParseCell: function(data) {
                    if (data.column.index === 4 && data.section === 'body') {
                        if (data.cell.raw === 'Non conforme') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
            y = doc.lastAutoTable.finalY + 8;
        });

        if (!hasCCP) {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucun controle CCP sur la periode.', 14, y);
        }

        // --- SECTION 3 : NETTOYAGE ---
        doc.addPage();
        y = this._header(doc, '3. Plan de Nettoyage');

        dates.forEach(date => {
            const records = Storage.getNettoyages(date);
            if (records.length === 0) return;

            if (y > 250) { doc.addPage(); y = this._header(doc, '3. Plan de Nettoyage (suite)'); }

            doc.setFontSize(10);
            doc.setTextColor(0, 100, 180);
            doc.text(Storage.formatDate(date), 14, y);
            y += 2;

            const rows = records.map(r => [
                Storage.formatTime(r.timestamp),
                (r.zones || []).join(', '),
                r.produit || '-',
                r.user
            ]);

            doc.autoTable({
                startY: y,
                head: [['Heure', 'Zones nettoyees', 'Produit', 'Operateur']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [39, 174, 96], textColor: 255, fontSize: 7 }
            });
            y = doc.lastAutoTable.finalY + 8;
        });

        // --- SECTION 4 : RECEPTIONS & TRACABILITE ---
        doc.addPage();
        y = this._header(doc, '4. Receptions et Tracabilite');

        // Fournisseurs agrees
        const fournisseurs = config.fournisseurs_agrees || [];
        if (fournisseurs.length > 0) {
            doc.setFontSize(11);
            doc.setTextColor(0, 100, 180);
            doc.text('Fournisseurs agrees', 14, y);
            y += 2;

            doc.autoTable({
                startY: y,
                head: [['Nom', 'Adresse', 'Telephone', 'Produits', 'N\u00B0 agrement']],
                body: fournisseurs.map(f => [f.nom, f.adresse || '-', f.telephone || '-', f.produits || '-', f.agrement || '-']),
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 7 }
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // Receptions
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 180);
        doc.text('Receptions de marchandises', 14, y);
        y += 2;

        let hasReception = false;
        dates.forEach(date => {
            const records = Storage.getReceptions(date);
            if (records.length === 0) return;
            hasReception = true;

            if (y > 250) { doc.addPage(); y = this._header(doc, '4. Receptions (suite)'); }

            const rows = records.map(r => [
                Storage.formatDate(date),
                Storage.formatTime(r.timestamp),
                r.fournisseur || '-',
                r.produit || '-',
                r.lot || '-',
                r.dlc || '-',
                r.temperature !== null && r.temperature !== undefined ? r.temperature + '\u00B0C' : '-',
                r.conforme ? 'OK' : 'NC'
            ]);

            doc.autoTable({
                startY: y,
                head: [['Date', 'Heure', 'Fournisseur', 'Produit', 'N\u00B0 Lot', 'DLC', 'Temp.', 'Conf.']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 7 },
                didParseCell: function(data) {
                    if (data.column.index === 7 && data.section === 'body') {
                        if (data.cell.raw === 'NC') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
            y = doc.lastAutoTable.finalY + 6;
        });

        if (!hasReception) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucune reception sur la periode.', 14, y);
            y += 10;
        }

        // Etiquettes deconditionement
        const etiquettes = Storage.getEtiquettes();
        if (etiquettes.length > 0) {
            if (y > 230) { doc.addPage(); y = this._header(doc, '4. Tracabilite (suite)'); }

            doc.setFontSize(11);
            doc.setTextColor(0, 100, 180);
            doc.text('Etiquettes de deconditionement', 14, y);
            y += 2;

            doc.autoTable({
                startY: y,
                head: [['Produit', 'Origine', 'Lot', 'Date', 'DLC sec.', 'Temp.', 'Operateur']],
                body: etiquettes.map(e => [e.produit, e.origine || '-', e.lot || '-', e.date_deconditionement || '-', e.dlc_secondaire || '-', e.temperature_stockage || '-', e.user]),
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [80, 80, 80], textColor: 255, fontSize: 7 }
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // --- SECTION 5 : MENUS & ALLERGENES ---
        doc.addPage();
        y = this._header(doc, '5. Menus Servis et Allergenes');

        // Menus
        let hasMenus = false;
        dates.forEach(date => {
            const menus = Storage.getMenus(date);
            if (menus.length === 0) return;
            hasMenus = true;

            menus.forEach(menu => {
                if (y > 220) { doc.addPage(); y = this._header(doc, '5. Menus (suite)'); }

                doc.setFontSize(10);
                doc.setTextColor(0, 100, 180);
                doc.text(this._clean(Storage.formatDate(date) + ' -- ' + menu.theme_nom + ' (' + menu.collectivite_nom + ')'), 14, y);
                y += 2;

                const rows = menu.jours.map(j => [j.jour, j.entree, j.plat, j.accompagnement, j.dessert, j.fromage, j.allergenes || '-']);

                doc.autoTable({
                    startY: y,
                    head: [['Jour', 'Entree', 'Plat', 'Accomp.', 'Dessert', 'Fromage', 'Allergenes']],
                    body: rows,
                    theme: 'grid',
                    styles: { fontSize: 7, cellPadding: 2 },
                    headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 7 },
                    columnStyles: {
                        6: { textColor: [200, 100, 0], fontSize: 6 }
                    }
                });
                y = doc.lastAutoTable.finalY + 8;
            });
        });

        if (!hasMenus) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Aucun menu enregistre sur la periode.', 14, y);
            y += 10;
        }

        // Allergenes — matrice des plats
        const plats = Storage.getAllergenePlats();
        if (plats.length > 0) {
            if (y > 180) { doc.addPage(); y = this._header(doc, '5. Allergenes (suite)'); }

            doc.setFontSize(11);
            doc.setTextColor(0, 100, 180);
            doc.text('Matrice des allergenes (Reg. INCO 1169/2011)', 14, y);
            y += 2;

            const allerNames = Allergenes.LISTE_ALLERGENES.map(a => a.nom.substring(0, 6));
            const rows = plats.map(p => {
                const cells = [p.nom];
                Allergenes.LISTE_ALLERGENES.forEach(a => {
                    cells.push((p.allergenes || []).includes(a.id) ? 'X' : '');
                });
                return cells;
            });

            doc.autoTable({
                startY: y,
                head: [['Plat', ...allerNames]],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 5, cellPadding: 1 },
                headStyles: { fillColor: [200, 50, 50], textColor: 255, fontSize: 5 },
                didParseCell: function(data) {
                    if (data.section === 'body' && data.column.index >= 1) {
                        if (data.cell.raw === 'X') {
                            data.cell.styles.fillColor = [255, 220, 220];
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.textColor = [200, 0, 0];
                        }
                    }
                }
            });
            y = doc.lastAutoTable.finalY + 10;
        }

        // --- SECTION 6 : ALERTES ---
        doc.addPage();
        y = this._header(doc, '6. Alertes et Non-Conformites');

        const alertes = Storage.getAlertes();
        const alertesPeriode = alertes.filter(a => {
            const aDate = a.timestamp ? a.timestamp.split('T')[0] : '';
            return aDate >= dateDebut && aDate <= dateFin;
        });

        if (alertesPeriode.length === 0) {
            doc.setFontSize(11);
            doc.setTextColor(39, 174, 96);
            doc.text('Aucune alerte ni non-conformite sur la periode.', 14, y);
        } else {
            const rows = alertesPeriode.map(a => [
                Storage.formatDateTime(a.timestamp),
                a.niveau === 'critique' ? 'CRITIQUE' : 'Attention',
                a.type || '-',
                a.titre || '-',
                a.description || '-',
                a.resolved ? `Oui (${Storage.formatDateTime(a.resolved_at)})` : 'Non',
                a.resolved_comment || '-'
            ]);

            doc.autoTable({
                startY: y,
                head: [['Date', 'Niveau', 'Type', 'Titre', 'Description', 'Resolu', 'Action corrective']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [200, 50, 50], textColor: 255, fontSize: 7 },
                columnStyles: {
                    4: { cellWidth: 40 },
                    6: { cellWidth: 35 }
                },
                didParseCell: function(data) {
                    if (data.column.index === 1 && data.section === 'body') {
                        if (data.cell.raw === 'CRITIQUE') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.column.index === 5 && data.section === 'body') {
                        if (data.cell.raw === 'Non') {
                            data.cell.styles.textColor = [220, 50, 50];
                        }
                    }
                }
            });
        }

        // --- PIED DE PAGE GLOBAL ---
        this._footer(doc);

        doc.save(`controle-sanitaire-ddpp-${Storage.today()}.pdf`);
        UI.toast('PDF Controle Sanitaire DDPP exporte avec succes', 'success');
        Journal.log('audit', `Export PDF DDPP: periode ${dateDebut} au ${dateFin}`);
    },

    // ============================================================
    // EXPORT PDF SIMULATEUR DE CONTROLE HACCP
    // ============================================================
    _exportSimulateur() {
        const audit = Simulateur.currentAudit;
        if (!audit) {
            UI.toast('Aucun audit en cours a exporter.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const scores = Simulateur._calculateScores();
        const gradeColors = { A: [46, 204, 113], B: [52, 152, 219], C: [243, 156, 18], D: [231, 76, 60] };
        const gc = gradeColors[scores.grade] || [100, 100, 100];

        // --- PAGE DE GARDE ---
        doc.setFontSize(22);
        doc.setTextColor(0, 100, 180);
        doc.text('RAPPORT DE CONTROLE SANITAIRE', 105, 40, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(gc[0], gc[1], gc[2]);
        doc.text('SIMULATION D\'AUDIT HACCP / DDPP', 105, 52, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(this._clean(audit.etablissement), 105, 70, { align: 'center' });

        // Note encadree
        doc.setDrawColor(gc[0], gc[1], gc[2]);
        doc.setLineWidth(2);
        doc.roundedRect(70, 80, 70, 35, 5, 5, 'S');
        doc.setFontSize(36);
        doc.setTextColor(gc[0], gc[1], gc[2]);
        doc.text(scores.grade, 90, 102, { align: 'center' });
        doc.setFontSize(20);
        doc.text(scores.pct + '%', 120, 102, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(this._clean(scores.gradeLabel), 105, 112, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text('Date : ' + new Date(audit.date).toLocaleDateString('fr-FR'), 105, 130, { align: 'center' });
        doc.text('Auditeur : ' + this._clean(audit.auditeur), 105, 138, { align: 'center' });
        doc.text('Mode : ' + (audit.mode === 'simulation' ? 'Simulation aleatoire' : 'Auto-evaluation manuelle'), 105, 146, { align: 'center' });

        // Synthese chiffree
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 180);
        doc.text('Synthese', 14, 165);

        doc.autoTable({
            startY: 170,
            head: [['Indicateur', 'Valeur']],
            body: [
                ['Score global', scores.pct + '%'],
                ['Note DDPP', scores.grade + ' -- ' + this._clean(scores.gradeLabel)],
                ['Non-conformites majeures', String(scores.majeures)],
                ['Non-conformites mineures', String(scores.mineures)],
                ['Observations', String(scores.observations)],
                ['Nombre de sections', String(audit.sections.length)],
                ['Questions totales', String(audit.sections.reduce((s, sec) => s + sec.questions.length, 0))]
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [0, 100, 180], textColor: 255 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });

        // Reference reglementaire
        let y = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text('Ref: Reg. CE 852/2004, 853/2004, 178/2002 -- Arrete du 21/12/2009 -- Reg. INCO 1169/2011', 14, y);

        // --- DETAIL PAR SECTION ---
        audit.sections.forEach(sec => {
            doc.addPage();
            const secScore = Simulateur._sectionScore(sec);
            y = this._header(doc, sec.icone + ' ' + sec.nom + ' (' + secScore.pct + '%)');

            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(sec.ref, 14, y);
            y += 5;

            const rows = sec.questions.map(q => {
                let reponseText = '-';
                if (q.reponse === 'oui') reponseText = 'Conforme';
                else if (q.reponse === 'a_corriger') reponseText = 'A corriger';
                else if (q.reponse === 'non') reponseText = 'Non conforme';

                const criticiteText = q.criticite === 'majeure' ? 'Majeure' : q.criticite === 'mineure' ? 'Mineure' : 'Obs.';

                return [
                    this._clean(q.question),
                    criticiteText,
                    reponseText,
                    this._clean(q.action_corrective) || '-'
                ];
            });

            doc.autoTable({
                startY: y,
                head: [['Point de controle', 'Criticite', 'Resultat', 'Action corrective']],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [0, 100, 180], textColor: 255, fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 18 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 55 }
                },
                didParseCell: function(data) {
                    if (data.column.index === 2 && data.section === 'body') {
                        if (data.cell.raw === 'Non conforme') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (data.cell.raw === 'A corriger') {
                            data.cell.styles.textColor = [230, 150, 0];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (data.cell.raw === 'Conforme') {
                            data.cell.styles.textColor = [39, 174, 96];
                        }
                    }
                    if (data.column.index === 1 && data.section === 'body') {
                        if (data.cell.raw === 'Majeure') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });
        });

        // --- PAGE PLAN D'ACTIONS CORRECTIVES ---
        doc.addPage();
        y = this._header(doc, 'Plan d\'Actions Correctives');

        const ncList = [];
        audit.sections.forEach(sec => {
            sec.questions.forEach(q => {
                if (q.reponse === 'non' || q.reponse === 'a_corriger') {
                    ncList.push({
                        section: sec.nom,
                        question: q.question,
                        criticite: q.criticite,
                        reponse: q.reponse,
                        action: q.action_corrective || '-',
                        responsable: q.responsable || '-',
                        delai: q.delai || '-'
                    });
                }
            });
        });

        if (ncList.length === 0) {
            doc.setFontSize(12);
            doc.setTextColor(39, 174, 96);
            doc.text('Aucune non-conformite detectee. Felicitations !', 14, y);
        } else {
            const delaiLabels = { immediat: 'Immediat', '24h': 'Sous 24h', '1_semaine': '1 semaine', '1_mois': '1 mois', '-': '-' };
            const ncRows = ncList.map(nc => [
                this._clean(nc.section),
                this._clean(nc.question),
                nc.criticite === 'majeure' ? 'MAJEURE' : nc.criticite === 'mineure' ? 'Mineure' : 'Obs.',
                nc.reponse === 'non' ? 'NC' : 'AC',
                this._clean(nc.action),
                this._clean(nc.responsable),
                delaiLabels[nc.delai] || nc.delai
            ]);

            doc.autoTable({
                startY: y,
                head: [['Section', 'Point', 'Criticite', 'Statut', 'Action', 'Resp.', 'Delai']],
                body: ncRows,
                theme: 'grid',
                styles: { fontSize: 6, cellPadding: 2 },
                headStyles: { fillColor: [200, 50, 50], textColor: 255, fontSize: 6 },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 55 },
                    2: { cellWidth: 16 },
                    3: { cellWidth: 10 },
                    4: { cellWidth: 40 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 17 }
                },
                didParseCell: function(data) {
                    if (data.column.index === 2 && data.section === 'body') {
                        if (data.cell.raw === 'MAJEURE') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    if (data.column.index === 3 && data.section === 'body') {
                        if (data.cell.raw === 'NC') {
                            data.cell.styles.textColor = [220, 50, 50];
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [230, 150, 0];
                        }
                    }
                }
            });
        }

        // --- PIED DE PAGE ---
        this._footer(doc);

        doc.save(`simulateur-audit-haccp-${Storage.today()}.pdf`);
        UI.toast('PDF Simulateur Audit HACCP exporte', 'success');
        Journal.log('audit', 'Export PDF Simulateur Audit HACCP - Note ' + scores.grade);
    },

    downloadText(filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadJSON(filename, data) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
