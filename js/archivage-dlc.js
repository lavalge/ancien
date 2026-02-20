/* ============================================================
   OK CUISINE — Module Archivage DLC
   Archivage légal 5 ans: DLC, températures, incidents, contrôles
   Conformité CE 852/2004 art. 20 (durée conservation registres)
   ============================================================ */

const ArchivageDLC = {
    render() {
        const page = document.getElementById('page-archivage-dlc');
        const archives = Storage.getArchivesDLC();
        const config = Storage.getConfig();

        // Tri par année
        const parAnnee = {};
        archives.forEach(a => {
            const annee = a.date.split('-')[0];
            if (!parAnnee[annee]) parAnnee[annee] = [];
            parAnnee[annee].push(a);
        });

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">📦 Archivage DLC — Conservation légale 5 ans</h2>
                <div class="section-actions">
                    <button class="btn btn-primary btn-kitchen" onclick="ArchivageDLC.archiveNow()">
                        🔄 Archiver aujourd'hui
                    </button>
                    <button class="btn btn-secondary" onclick="ArchivageDLC.exportArchives()">
                        📄 Exporter archives
                    </button>
                </div>
            </div>

            <!-- Info légale -->
            <div class="card" style="border-left:4px solid var(--info);margin-bottom:1.5rem;">
                <div class="card-header">
                    <span class="card-title">📋 Obligation archivage</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    <strong>CE 852/2004 art. 20 :</strong> Conserver tous registres hygiène (températures, nettoyage, 
                    personnel, incidents, contrôles) pendant <strong>5 ans minimum</strong>. 
                    Obligatoire pour vérification DDPP/Santé Publique.
                </p>
            </div>

            <!-- Paramètres vidéo/suppression -->
            <div class="card" style="margin-bottom:1.5rem;">
                <div class="card-header">
                    <strong>⚙️ Configuration archivage</strong>
                </div>
                <div style="padding:0.75rem;font-size:0.9rem;">
                    <div style="margin-bottom:0.75rem;">
                        <label style="display:flex;gap:0.5rem;cursor:pointer;align-items:center;">
                            <input type="checkbox" id="auto-archive-check" ${config.auto_archive_enable ? 'checked' : ''} onchange="ArchivageDLC.toggleAutoArchive()">
                            <span>Archivage automatique chaque nuit</span>
                        </label>
                    </div>
                    <div style="padding:0.5rem;background:var(--bg-secondary);border-radius:0.25rem;font-size:0.85rem;color:var(--text-secondary);">
                        <strong>Comprend:</strong> Températures du jour, contrôles nettoyage, incidents, mouvements stock.
                    </div>
                </div>
            </div>

            <!-- Stats archivage -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">
                <div class="card" style="background:linear-gradient(135deg,var(--primary),rgba(33,150,243,0.1));">
                    <div style="padding:1rem;">
                        <div style="font-size:1.5rem;font-weight:bold;color:var(--primary);">${archives.length}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Archives totales</div>
                    </div>
                </div>
                <div class="card" style="background:linear-gradient(135deg,var(--success),rgba(76,175,80,0.1));">
                    <div style="padding:1rem;">
                        <div style="font-size:1.5rem;font-weight:bold;color:var(--success);">${Object.keys(parAnnee).length}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Années protégées</div>
                    </div>
                </div>
                <div class="card" style="background:${new Date().getFullYear() - 5 > parseInt(Object.keys(parAnnee)[0] || new Date().getFullYear()) ? 'linear-gradient(135deg,var(--danger),rgba(244,67,54,0.1))' : 'linear-gradient(135deg,var(--warning),rgba(255,152,0,0.1))'};">
                    <div style="padding:1rem;">
                        <div style="font-size:1.5rem;font-weight:bold;color:${new Date().getFullYear() - 5 > parseInt(Object.keys(parAnnee)[0] || new Date().getFullYear()) ? 'var(--danger)' : 'var(--warning)'};">${Math.min(...Object.keys(parAnnee).map(a => parseInt(a)), new Date().getFullYear() - 5)}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Année conservation min.</div>
                    </div>
                </div>
            </div>

            <!-- Archives par année -->
            <div>
                ${Object.keys(parAnnee).sort((a,b) => b-a).map(annee => `
                    <div class="card" style="margin-bottom:1rem;">
                        <div class="card-header" style="padding:0.75rem;">
                            <strong>📅 Année ${annee}</strong>
                            <span style="font-size:0.85rem;color:var(--text-secondary);">${parAnnee[annee].length} archives</span>
                        </div>
                        <div style="padding:0.75rem;background:var(--bg-secondary);">
                            ${parAnnee[annee].sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;background:white;border-radius:0.2rem;margin-bottom:0.5rem;">
                                    <div style="font-size:0.9rem;">
                                        <strong>${a.type_donnees}</strong><br>
                                        <span style="font-size:0.85rem;color:var(--text-secondary);">${Storage.formatDate(a.date)} — ${a.nb_records} enregistrements</span>
                                    </div>
                                    <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.75rem;" onclick="ArchivageDLC.downloadArchive('${a.id}')">
                                        📥 Télécharger
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                ${archives.length === 0
                    ? UI.emptyState('📦', 'Aucune archive. Cliquez "🔄 Archiver aujourd\'hui".')
                    : ''
                }
            </div>

            <!-- Aide -->
            <div class="card" style="margin-top:1.5rem;">
                <div class="card-header">
                    <strong>❓ Quoi archiver ?</strong>
                </div>
                <div style="padding:0.75rem;font-size:0.9rem;">
                    <ul style="margin:0 0 0 1.5rem;color:var(--text-secondary);">
                        <li>Enregistrements températures (réfrigération, congélation, cuisson)</li>
                        <li>Fiches nettoyage/désinfection + validation (ATP, visuel)</li>
                        <li>Registre incidents/TIAC/allergies</li>
                        <li>Contrôles réception marchandises (CQ fournisseurs)</li>
                        <li>Attestations formation personnel + habilitations</li>
                        <li>Appels d'offres/contrats fournisseurs (3 ans)</li>
                        <li>Registre plaintes consommateurs</li>
                        <li>Audits internes + rapports DDPP</li>
                    </ul>
                    <p style="margin-top:1rem;color:var(--text-muted);font-size:0.85rem;">
                        <strong>Format:</strong> CSV, JSON ou PDF selon module. Stockés en <!-- encrypted -->.
                    </p>
                </div>
            </div>
        `;
    },

    archiveNow() {
        const archives_to_create = [];

        // Archive températures
        const temps = Storage.getTemperatures() || [];
        if (temps.length > 0) {
            archives_to_create.push({
                type_donnees: '🌡️ Températures',
                nb_records: temps.length,
                data: temps
            });
        }

        // Archive nettoyage
        const nett = Storage.getNettoyages() || [];
        if (nett.length > 0) {
            archives_to_create.push({
                type_donnees: '🧼 Nettoyages',
                nb_records: nett.length,
                data: nett
            });
        }

        // Archive validations nettoyage
        const val_nett = Storage.getValidationNettoyages() || [];
        if (val_nett.length > 0) {
            archives_to_create.push({
                type_donnees: '✓ Validations nettoyage',
                nb_records: val_nett.length,
                data: val_nett
            });
        }

        // Archive incidents TIAC
        const tiac = Storage.getTIAC() || [];
        if (tiac.length > 0) {
            archives_to_create.push({
                type_donnees: '🚨 Incidents TIAC',
                nb_records: tiac.length,
                data: tiac
            });
        }

        // Archive formations
        const form = Storage.getFormations() || [];
        if (form.length > 0) {
            archives_to_create.push({
                type_donnees: '📚 Formations',
                nb_records: form.length,
                data: form
            });
        }

        // Archive receptions
        const rec = Storage.getReceptions() || [];
        if (rec.length > 0) {
            archives_to_create.push({
                type_donnees: '📫 Réceptions',
                nb_records: rec.length,
                data: rec
            });
        }

        // Archive alertes
        const alt = Storage.getAlertes() || [];
        if (alt.length > 0) {
            archives_to_create.push({
                type_donnees: '⚠️ Alertes',
                nb_records: alt.length,
                data: alt
            });
        }

        if (archives_to_create.length === 0) {
            UI.toast('Pas de données à archiver', 'info');
            return;
        }

        // Créer archives
        archives_to_create.forEach(a => {
            const archive = {
                id: Storage.uid(),
                type_donnees: a.type_donnees,
                nb_records: a.nb_records,
                date: Storage.today(),
                data_snapshot: a.data,
                user_archive: App.currentUser.nom,
                timestamp: new Date().toISOString()
            };
            Storage.saveArchiveDLC(archive);
        });

        UI.toast(`✓ ${archives_to_create.length} archives créées`, 'success');
        this.render();
        Journal.log('archivage', `Archive ${archives_to_create.map(a => a.type_donnees).join(', ')}`, { count: archives_to_create.length });
    },

    downloadArchive(archiveId) {
        const archive = Storage.getArchivesDLC().find(a => a.id === archiveId);
        if (!archive) return;

        const csvContent = `Archive: ${archive.type_donnees}
Date: ${Storage.formatDate(archive.date)}
Enregistrements: ${archive.nb_records}

${JSON.stringify(archive.data_snapshot, null, 2)}
        `;

        PDF.downloadText(`Archive_${archive.type_donnees}_${archive.date}.json`, csvContent);
        UI.toast('✓ Archive téléchargée', 'success');
    },

    exportArchives() {
        const archives = Storage.getArchivesDLC();
        if (archives.length === 0) {
            UI.toast('Aucune archive', 'info');
            return;
        }

        let csv = 'Date|Type|Nb_Records|Taille_approx\n';
        archives.forEach(a => {
            const taille = (JSON.stringify(a.data_snapshot).length / 1024).toFixed(2);
            csv += `${a.date}|${a.type_donnees}|${a.nb_records}|${taille}KB\n`;
        });

        PDF.downloadText('Registre_Archives_DLC.csv', csv);
        UI.toast('✓ Registre archives exporté', 'success');
    },

    toggleAutoArchive() {
        const enabled = document.getElementById('auto-archive-check').checked;
        let config = Storage.getConfig();
        config.auto_archive_enable = enabled;
        Storage.saveConfig(config);
        UI.toast(enabled ? '✓ Archivage auto activé' : '✓ Archivage auto désactivé', 'success');
    }
};
