/* ============================================================
   OK CUISINE — Module Protocoles HACCP
   Documentation PMS, procedures, controle huiles de friture,
   protocoles reglementaires, references
   ============================================================ */

const Protocoles = {
    activeSection: 'vue_ensemble',

    render() {
        const page = document.getElementById('page-protocoles');
        const config = Storage.getConfig();

        page.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">\uD83D\uDCD6 Protocoles HACCP & PMS</h2>
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="PDF.export('protocoles')">
                        \uD83D\uDCC4 Exporter PDF
                    </button>
                </div>
            </div>

            <!-- Navigation sections -->
            <div class="tab-bar">
                <button class="tab-btn ${this.activeSection === 'vue_ensemble' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('vue_ensemble')">Vue d'ensemble</button>
                <button class="tab-btn ${this.activeSection === 'temperatures_ref' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('temperatures_ref')">Temperatures</button>
                <button class="tab-btn ${this.activeSection === 'nettoyage_pnd' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('nettoyage_pnd')">PND</button>
                <button class="tab-btn ${this.activeSection === 'huiles' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('huiles')">Huiles friture</button>
                <button class="tab-btn ${this.activeSection === 'lavage_mains' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('lavage_mains')">Lavage mains</button>
                <button class="tab-btn ${this.activeSection === 'marche_avant' ? 'active' : ''}"
                        onclick="Protocoles.switchSection('marche_avant')">Marche en avant</button>
            </div>

            <div id="protocoles-content">
                ${this._renderSection()}
            </div>
        `;
    },

    switchSection(section) {
        this.activeSection = section;
        this.render();
    },

    _renderSection() {
        switch (this.activeSection) {
            case 'vue_ensemble': return this._renderVueEnsemble();
            case 'temperatures_ref': return this._renderTemperaturesRef();
            case 'nettoyage_pnd': return this._renderPND();
            case 'huiles': return this._renderHuiles();
            case 'lavage_mains': return this._renderLavageMains();
            case 'marche_avant': return this._renderMarcheAvant();
            default: return '';
        }
    },

    // ==================== VUE D'ENSEMBLE PMS ====================

    _renderVueEnsemble() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCCB Plan de Maitrise Sanitaire (PMS)</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Le PMS est le document obligatoire qui decrit l'ensemble des mesures de securite alimentaire
                    de votre etablissement. Il repose sur 3 piliers :
                </p>
                <div class="protocol-pillars">
                    <div class="pillar-card">
                        <div class="pillar-num">1</div>
                        <div class="pillar-title">BPH / PRP</div>
                        <div class="pillar-desc">Bonnes Pratiques d'Hygiene (prerequis)</div>
                        <ul class="pillar-list">
                            <li>Hygiene du personnel</li>
                            <li>Plan de nettoyage (PND)</li>
                            <li>Lutte contre les nuisibles</li>
                            <li>Gestion de l'eau</li>
                            <li>Maintenance / Metrologie</li>
                            <li>Gestion des dechets</li>
                        </ul>
                    </div>
                    <div class="pillar-card">
                        <div class="pillar-num">2</div>
                        <div class="pillar-title">Plan HACCP</div>
                        <div class="pillar-desc">7 principes, analyse des dangers</div>
                        <ul class="pillar-list">
                            <li>Analyse des dangers (B/C/P)</li>
                            <li>Determination des CCP</li>
                            <li>Limites critiques</li>
                            <li>Surveillance des CCP</li>
                            <li>Actions correctives</li>
                            <li>Verification du systeme</li>
                            <li>Documentation</li>
                        </ul>
                    </div>
                    <div class="pillar-card">
                        <div class="pillar-num">3</div>
                        <div class="pillar-title">Tracabilite</div>
                        <div class="pillar-desc">Amont, interne, gestion non-conformites</div>
                        <ul class="pillar-list">
                            <li>Fournisseurs agrees</li>
                            <li>Controle a reception</li>
                            <li>Etiquetage interne</li>
                            <li>FIFO / DLC / DDM</li>
                            <li>Procedure retrait/rappel</li>
                            <li>Plats temoins</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCDA Les 7 principes HACCP</span>
                </div>
                <div class="haccp-principles">
                    ${[
                        { n: 1, titre: 'Analyse des dangers', desc: 'Identifier tous les dangers biologiques, chimiques et physiques a chaque etape du processus.' },
                        { n: 2, titre: 'Points critiques (CCP)', desc: 'Determiner les etapes ou un controle est essentiel pour prevenir ou eliminer un danger.' },
                        { n: 3, titre: 'Limites critiques', desc: 'Fixer des seuils mesurables pour chaque CCP (temperature, temps, pH...).' },
                        { n: 4, titre: 'Surveillance', desc: 'Mettre en place un systeme de surveillance pour chaque CCP (qui, quoi, quand, comment).' },
                        { n: 5, titre: 'Actions correctives', desc: 'Definir les actions a mener lorsqu\'une limite critique est depassee.' },
                        { n: 6, titre: 'Verification', desc: 'Verifier que le systeme HACCP fonctionne correctement (audits, analyses, revue annuelle).' },
                        { n: 7, titre: 'Documentation', desc: 'Constituer et maintenir le systeme documentaire (enregistrements, procedures, preuves).' }
                    ].map(p => `
                        <div class="principle-item">
                            <div class="principle-num">${p.n}</div>
                            <div>
                                <div class="principle-titre">${p.titre}</div>
                                <div class="principle-desc">${p.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCDC References reglementaires</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Reglement</th><th>Objet</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Reg. (CE) 178/2002</strong></td><td>Droit alimentaire general, tracabilite, EFSA, RASFF</td></tr>
                            <tr><td><strong>Reg. (CE) 852/2004</strong></td><td>Hygiene generale des denrees — obligation HACCP</td></tr>
                            <tr><td><strong>Reg. (CE) 853/2004</strong></td><td>Regles d'hygiene pour les denrees d'origine animale</td></tr>
                            <tr><td><strong>Reg. (UE) 1169/2011</strong></td><td>Information des consommateurs (INCO) — 14 allergenes</td></tr>
                            <tr><td><strong>Arrete 21/12/2009</strong></td><td>Temperatures de conservation reglementaires</td></tr>
                            <tr><td><strong>Decret 2011-731</strong></td><td>Formation obligatoire en hygiene alimentaire</td></tr>
                            <tr><td><strong>Arrete 12/02/2024</strong></td><td>Reforme de la formation hygiene (14h dont 4h presentiel)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ==================== TEMPERATURES REGLEMENTAIRES ====================

    _renderTemperaturesRef() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDF21\uFE0F Temperatures de conservation reglementaires</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">
                    Ref: Arrete du 21 decembre 2009 — Temperatures de conservation des denrees alimentaires.
                </p>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Produit</th><th>Temperature max.</th></tr></thead>
                        <tbody>
                            <tr><td>Viandes hachees, preparations de viandes</td><td class="temp-val"><strong>+2\u00B0C</strong></td></tr>
                            <tr><td>Poissons frais, crustaces, mollusques crus</td><td class="temp-val"><strong>0 a +2\u00B0C</strong> (glace fondante)</td></tr>
                            <tr><td>Volailles, gibier, lapin</td><td class="temp-val"><strong>+4\u00B0C</strong></td></tr>
                            <tr><td>Viandes (pieces de decoupe)</td><td class="temp-val"><strong>+4\u00B0C</strong> (detail) / +7\u00B0C (gros)</td></tr>
                            <tr><td>Plats cuisines elabores a l'avance (PCEA)</td><td class="temp-val"><strong>+3\u00B0C</strong></td></tr>
                            <tr><td>Produits tres perissables (general)</td><td class="temp-val"><strong>+4\u00B0C</strong></td></tr>
                            <tr><td>Produits perissables (general)</td><td class="temp-val"><strong>+8\u00B0C</strong></td></tr>
                            <tr><td>Produits laitiers, beurre, fromage</td><td class="temp-val"><strong>+4 a +8\u00B0C</strong> (selon etiquette)</td></tr>
                            <tr><td>Oeufs, ovoproduits</td><td class="temp-val"><strong>+4\u00B0C</strong></td></tr>
                            <tr><td>Produits congeles</td><td class="temp-val"><strong>-12\u00B0C</strong></td></tr>
                            <tr><td>Produits surgeles, glaces</td><td class="temp-val"><strong>-18\u00B0C</strong></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDD25 Temperatures de cuisson (coeur du produit)</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Aliment</th><th>Temperature a coeur min.</th></tr></thead>
                        <tbody>
                            <tr><td>Cuisson generale</td><td class="temp-val"><strong>+63\u00B0C</strong></td></tr>
                            <tr><td>Viande hachee, steak hache</td><td class="temp-val"><strong>+70\u00B0C</strong></td></tr>
                            <tr><td>Volaille (poulet, dinde)</td><td class="temp-val"><strong>+74\u00B0C</strong></td></tr>
                            <tr><td>Porc</td><td class="temp-val"><strong>+70\u00B0C</strong></td></tr>
                            <tr><td>Poisson</td><td class="temp-val"><strong>+63\u00B0C</strong></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\u2744\uFE0F Refroidissement & Remise en temperature</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Operation</th><th>Regle</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Refroidissement rapide</strong></td><td>De +63\u00B0C a <strong>&lt; +10\u00B0C en moins de 2 heures</strong> (cellule de refroidissement)</td></tr>
                            <tr><td><strong>Remise en temperature</strong></td><td>De &lt; +10\u00B0C a <strong>&gt; +63\u00B0C en moins de 1 heure</strong></td></tr>
                            <tr><td><strong>Maintien au chaud</strong></td><td>Temperature <strong>\u2265 +63\u00B0C</strong> en permanence</td></tr>
                            <tr><td><strong>Decongelation</strong></td><td>En enceinte refrigeree a <strong>+3\u00B0C</strong> (jamais a temperature ambiante)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="border-left:4px solid var(--danger);">
                <div class="card-header">
                    <span class="card-title">\u26A0\uFE0F Actions correctives selon temperature</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Situation</th><th>Action</th></tr></thead>
                        <tbody>
                            <tr><td>Produit \u2264 +5\u00B0C (chambre froide non conforme)</td><td style="color:var(--warning);">Transferer vers une autre enceinte froide</td></tr>
                            <tr><td>Produit entre +6 et +7\u00B0C</td><td style="color:var(--warning);">Utiliser immediatement</td></tr>
                            <tr><td>Produit &gt; +10\u00B0C</td><td style="color:var(--danger);"><strong>DETRUIRE IMMEDIATEMENT</strong></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ==================== PLAN DE NETTOYAGE (PND) ====================

    _renderPND() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83E\uDDF9 Plan de Nettoyage et Desinfection (PND)</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Le PND suit la methode <strong>QQOQCP</strong> : Quoi, Qui, Ou, Quand, Comment, Pourquoi.
                    Le nettoyage precede TOUJOURS la desinfection.
                </p>

                <h4 style="color:var(--primary);margin:1rem 0 0.5rem;">Protocole en 6 etapes</h4>
                <div class="protocol-steps">
                    <div class="protocol-step"><span class="step-num">1</span><span>Pre-rincage</span><span class="step-desc">Eliminer les souillures grossieres a l'eau</span></div>
                    <div class="protocol-step"><span class="step-num">2</span><span>Nettoyage</span><span class="step-desc">Appliquer le detergent, action mecanique</span></div>
                    <div class="protocol-step"><span class="step-num">3</span><span>Rincage</span><span class="step-desc">Eliminer les residus de detergent</span></div>
                    <div class="protocol-step"><span class="step-num">4</span><span>Desinfection</span><span class="step-desc">Appliquer le desinfectant, respecter le temps de contact</span></div>
                    <div class="protocol-step"><span class="step-num">5</span><span>Rincage final</span><span class="step-desc">Eliminer les residus chimiques</span></div>
                    <div class="protocol-step"><span class="step-num">6</span><span>Sechage</span><span class="step-desc">Laisser secher a l'air ou papier a usage unique</span></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDD04 Cercle de Sinner (TACT)</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:1rem;">
                    Les 4 facteurs interdependants pour un nettoyage efficace :
                </p>
                <div class="stats-grid">
                    <div class="stat-card info">
                        <div class="stat-label">Temperature</div>
                        <div class="stat-value">\uD83C\uDF21\uFE0F T</div>
                        <div style="font-size:0.8rem;">Temperature de l'eau</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-label">Action chimique</div>
                        <div class="stat-value">\uD83E\uDDEA A</div>
                        <div style="font-size:0.8rem;">Concentration du produit</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-label">Action mecanique</div>
                        <div class="stat-value">\uD83E\uDDF9 C</div>
                        <div style="font-size:0.8rem;">Frottement / brossage</div>
                    </div>
                    <div class="stat-card info">
                        <div class="stat-label">Temps de contact</div>
                        <div class="stat-value">\u23F1\uFE0F T</div>
                        <div style="font-size:0.8rem;">Duree d'application</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCC5 Frequences recommandees</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Surface / Equipement</th><th>Frequence</th></tr></thead>
                        <tbody>
                            <tr><td>Plans de travail</td><td>Avant/apres chaque tache, entre chaque produit</td></tr>
                            <tr><td>Planches a decouper</td><td>Entre chaque type de produit</td></tr>
                            <tr><td>Trancheuse</td><td>Demontage complet quotidien</td></tr>
                            <tr><td>Fours, piano de cuisson</td><td>Apres chaque service / quotidien</td></tr>
                            <tr><td>Friteuse</td><td>A chaque changement d'huile</td></tr>
                            <tr><td>Filtres de hotte</td><td>Hebdomadaire</td></tr>
                            <tr><td>Chambres froides</td><td>Hebdomadaire</td></tr>
                            <tr><td>Refrigerateurs</td><td>Hebdomadaire</td></tr>
                            <tr><td>Sols</td><td>2 fois par jour minimum</td></tr>
                            <tr><td>Murs (projections)</td><td>Hebdomadaire</td></tr>
                            <tr><td>Poignees, interrupteurs</td><td>2 fois par jour minimum</td></tr>
                            <tr><td>Sanitaires / vestiaires</td><td>Quotidien</td></tr>
                            <tr><td>Zone dechets</td><td>Quotidien</td></tr>
                            <tr><td>Plafonds</td><td>Trimestriel a annuel</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ==================== CONTROLE HUILES DE FRITURE ====================

    _renderHuiles() {
        const controles = Storage.getControlesHuiles();

        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83C\uDF73 Controle des huiles de friture</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    <strong>Obligation reglementaire :</strong> Les huiles de friture doivent etre controlees regulierement.
                    Le taux de composes polaires ne doit pas depasser <strong>25%</strong> (test polaire).
                    L'huile doit etre changee des que le seuil est atteint ou en cas d'alteration visuelle/olfactive.
                </p>

                <div style="margin-bottom:1rem;">
                    <button class="btn btn-primary btn-kitchen" onclick="Protocoles.showAddHuileModal()">
                        + Nouveau controle
                    </button>
                </div>

                ${controles.length === 0
                    ? UI.emptyState('\uD83C\uDF73', 'Aucun controle d\'huile enregistre')
                    : this._renderHuilesTable(controles)
                }
            </div>

            <div class="card" style="border-left:4px solid var(--warning);">
                <div class="card-header">
                    <span class="card-title">\u26A0\uFE0F Regles de bonne pratique</span>
                </div>
                <ul style="color:var(--text-secondary);font-size:0.9rem;margin:0;padding-left:1.5rem;">
                    <li>Ne pas depasser <strong>180\u00B0C</strong> pour la temperature de l'huile</li>
                    <li>Filtrer l'huile apres chaque service</li>
                    <li>Realiser le test polaire au minimum <strong>1 fois par semaine</strong></li>
                    <li>Changer l'huile si &gt; 25% de composes polaires</li>
                    <li>Changer l'huile si aspect fonce, mousse excessive, odeur acre</li>
                    <li>Ne jamais melanger huile neuve et huile usagee</li>
                    <li>Faire collecter les huiles usagees par un prestataire agree</li>
                </ul>
            </div>
        `;
    },

    _renderHuilesTable(controles) {
        let rows = controles.map(c => {
            const isOk = c.taux_polaire <= 25;
            return `
                <tr>
                    <td>${c.date}</td>
                    <td>${UI.escapeHTML(c.friteuse)}</td>
                    <td class="${isOk ? '' : 'status-danger'}">
                        <strong>${c.taux_polaire}%</strong>
                        ${isOk ? '' : ' \u26A0\uFE0F'}
                    </td>
                    <td>${c.huile_changee ? '<span class="badge badge-success">Oui</span>' : '<span class="badge badge-info">Non</span>'}</td>
                    <td>${UI.escapeHTML(c.commentaire || '-')}</td>
                    <td>${UI.escapeHTML(c.user)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Friteuse</th>
                            <th>Taux polaire</th>
                            <th>Huile changee</th>
                            <th>Commentaire</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    showAddHuileModal() {
        const body = `
            <div class="form-group">
                <label>Friteuse</label>
                <input type="text" class="form-control form-control-lg" id="huile-friteuse"
                       placeholder="Ex: Friteuse 1" autofocus>
            </div>
            <div class="form-group">
                <label>Taux de composes polaires (%)</label>
                <input type="number" step="1" min="0" max="100" class="form-control form-control-lg" id="huile-taux"
                       placeholder="Ex: 18">
                <small style="color:var(--text-muted);">Seuil maximum : 25% — Au-dela, l'huile DOIT etre changee.</small>
            </div>
            <div class="form-group">
                <label>Huile changee ?</label>
                <div style="display:flex;gap:1rem;margin-top:0.5rem;">
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="huile-changee" value="non" checked> Non
                    </label>
                    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:1.1rem;">
                        <input type="radio" name="huile-changee" value="oui"> Oui, changee
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Commentaire (optionnel)</label>
                <textarea class="form-control" id="huile-comment" rows="2" placeholder="Observations..."></textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="UI.closeModal()">Annuler</button>
            <button class="btn btn-success btn-lg" onclick="Protocoles.saveHuile()">Enregistrer</button>
        `;

        UI.openModal('Controle huile de friture', body, footer);
    },

    saveHuile() {
        const friteuse = document.getElementById('huile-friteuse').value.trim();
        const taux_polaire = parseInt(document.getElementById('huile-taux').value);
        const huile_changee = document.querySelector('input[name="huile-changee"]:checked').value === 'oui';
        const commentaire = document.getElementById('huile-comment').value.trim();

        if (!friteuse || isNaN(taux_polaire)) {
            UI.toast('Remplissez la friteuse et le taux polaire', 'warning');
            return;
        }

        Storage.addControleHuile({
            friteuse, taux_polaire, huile_changee, commentaire,
            date: Storage.today()
        });

        if (taux_polaire > 25 && !huile_changee) {
            Storage.addAlerte({
                type: 'huile',
                niveau: 'critique',
                titre: `Huile de friture non conforme: ${friteuse}`,
                description: `Taux polaire: ${taux_polaire}% (max 25%) — Huile a changer IMMEDIATEMENT`
            });
            UI.updateAlertBadge();
            UI.toast(`ALERTE: Huile non conforme (${taux_polaire}%) — A changer !`, 'danger');
        } else {
            UI.toast(`Controle huile enregistre: ${friteuse} (${taux_polaire}%)`, 'success');
        }

        UI.closeModal();
        this.render();
    },

    // ==================== LAVAGE DES MAINS ====================

    _renderLavageMains() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83E\uDDF4 Protocole de lavage des mains</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    Le lavage des mains est la mesure d'hygiene la plus importante en cuisine.
                    Duree minimale : <strong>30 secondes</strong>. A afficher pres de chaque poste de lavage.
                </p>

                <div class="protocol-steps">
                    <div class="protocol-step"><span class="step-num">1</span><span>Mouiller</span><span class="step-desc">Mouiller les mains et avant-bras a l'eau tiede</span></div>
                    <div class="protocol-step"><span class="step-num">2</span><span>Savonner</span><span class="step-desc">Appliquer le savon bactericide</span></div>
                    <div class="protocol-step"><span class="step-num">3</span><span>Frotter 30s</span><span class="step-desc">Paumes, dos, entre les doigts, ongles, poignets</span></div>
                    <div class="protocol-step"><span class="step-num">4</span><span>Rincer</span><span class="step-desc">Rincer abondamment a l'eau claire</span></div>
                    <div class="protocol-step"><span class="step-num">5</span><span>Secher</span><span class="step-desc">Secher avec du papier a usage unique</span></div>
                    <div class="protocol-step"><span class="step-num">6</span><span>Desinfecter</span><span class="step-desc">Appliquer une solution hydroalcoolique (optionnel)</span></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\u23F0 Quand se laver les mains ?</span>
                </div>
                <div class="when-wash-grid">
                    ${[
                        'A la prise de poste',
                        'Apres passage aux toilettes',
                        'Apres manipulation de dechets',
                        'Apres manipulation de produits crus',
                        'Avant manipulation de produits cuits',
                        'Apres s\'etre mouche, avoir tousse ou eternue',
                        'Apres avoir touche son visage ou ses cheveux',
                        'Apres manipulation de produits d\'entretien',
                        'Entre chaque tache differente',
                        'Apres une pause'
                    ].map(item => `
                        <div class="when-wash-item">\u2705 ${item}</div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ==================== MARCHE EN AVANT ====================

    _renderMarcheAvant() {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">\u27A1\uFE0F Principe de la marche en avant</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                    La marche en avant est un principe fondamental HACCP : le circuit propre ne doit
                    <strong>jamais croiser</strong> le circuit sale. Les produits progressent toujours
                    de la zone "sale" vers la zone "propre".
                </p>

                <div class="marche-avant-flow">
                    <div class="flow-step">
                        <div class="flow-icon">\uD83D\uDE9A</div>
                        <div class="flow-label">Reception</div>
                        <div class="flow-detail">Zone de deballage</div>
                    </div>
                    <div class="flow-arrow">\u27A1\uFE0F</div>
                    <div class="flow-step">
                        <div class="flow-icon">\uD83D\uDCE6</div>
                        <div class="flow-label">Stockage</div>
                        <div class="flow-detail">Froid / sec / surgele</div>
                    </div>
                    <div class="flow-arrow">\u27A1\uFE0F</div>
                    <div class="flow-step">
                        <div class="flow-icon">\uD83D\uDD2A</div>
                        <div class="flow-label">Preparation</div>
                        <div class="flow-detail">Epluchage, decoupe</div>
                    </div>
                    <div class="flow-arrow">\u27A1\uFE0F</div>
                    <div class="flow-step">
                        <div class="flow-icon">\uD83D\uDD25</div>
                        <div class="flow-label">Cuisson</div>
                        <div class="flow-detail">Fours, plaques</div>
                    </div>
                    <div class="flow-arrow">\u27A1\uFE0F</div>
                    <div class="flow-step">
                        <div class="flow-icon">\u2744\uFE0F</div>
                        <div class="flow-label">Refroidissement</div>
                        <div class="flow-detail">Cellule rapide</div>
                    </div>
                    <div class="flow-arrow">\u27A1\uFE0F</div>
                    <div class="flow-step">
                        <div class="flow-icon">\uD83C\uDF7D\uFE0F</div>
                        <div class="flow-label">Service</div>
                        <div class="flow-detail">Distribution</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDD04 Separation des flux</span>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>Flux</th><th>Regle</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Personnel</strong></td><td>Personnel propre separe du personnel de livraison. Les livreurs ne doivent PAS entrer en zone de production.</td></tr>
                            <tr><td><strong>Produits</strong></td><td>Cru separe du cuit. Propre separe du sale. Pas de retour en arriere.</td></tr>
                            <tr><td><strong>Dechets</strong></td><td>Le circuit des dechets ne doit jamais croiser celui des produits propres.</td></tr>
                            <tr><td><strong>Vaisselle</strong></td><td>La vaisselle sale suit un circuit separe de la nourriture propre.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="border-left:4px solid var(--info);">
                <div class="card-header">
                    <span class="card-title">\uD83D\uDCA1 Marche en avant dans le temps</span>
                </div>
                <p style="color:var(--text-secondary);font-size:0.9rem;margin:0;">
                    Si l'espace ne permet pas une separation physique des zones, appliquer la
                    <strong>marche en avant dans le temps</strong> : realiser les taches sequentiellement
                    avec un nettoyage-desinfection complet entre chaque etape.
                    <br><br>
                    <em>Exemple : Preparer les legumes crus &rarr; Nettoyer/desinfecter le plan de travail &rarr;
                    Preparer les produits cuits.</em>
                </p>
            </div>
        `;
    }
};
