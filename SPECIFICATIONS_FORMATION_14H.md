# 🎓 SPÉCIFICATIONS TECHNIQUES - FORMATION HACCP 14H PRODUCTION

## VERSION DÉFINITIVE CONFORME DREETS/QUALIOPI

---

## 1. ARCHITECTURE SYSTÈME

### 1.1 Structure des données

```javascript
FormationSession = {
    id: string,                          // UUID unique
    userId: string,                      // ID utilisateur
    courseId: "formation-haccp-14h",     // Formation 14h
    status: "not-started" | "in-progress" | "completed" | "validated",
    startDate: ISO8601,                  // Date début formation
    endDate: ISO8601 | null,             // Date fin formation
    totalDuration: number,               // Durée totale en secondes
    modules: {
        [moduleId]: {
            status: "locked" | "unlocked" | "in-progress" | "completed",
            lessons: {
                [lessonId]: {
                    status: "locked" | "unlocked" | "in-progress" | "completed",
                    startTimestamp: ISO8601 | null,
                    endTimestamp: ISO8601 | null,
                    duration: number,           // Secondes
                    visits: number,             // Nombre de visites
                    scrollProgress: number      // % scrollé (tracking lecture)
                }
            },
            quizAttempts: [
                {
                    timestamp: ISO8601,
                    score: number,              // 0-100
                    passed: boolean,
                    answers: array
                }
            ],
            quizPassed: boolean,
            unlockedAt: ISO8601
        }
    },
    currentModule: string | null,
    currentLesson: string | null,
    attestationGenerated: boolean,
    attestationNumber: string | null,
    validatedBy: string | null,           // ID formateur
    validatedAt: ISO8601 | null
}
```

### 1.2 Structure du programme 14h

**MODULE 1 : Aliments et risques (2h30)**
- Leçon 1.1 : Dangers microbiens (45min)
- Leçon 1.2 : Autres dangers chimiques, physiques (45min)
- Leçon 1.3 : Moyens de maîtrise (60min)
- Quiz Module 1

**MODULE 2 : Réglementation (2h00)**
- Leçon 2.1 : Paquet Hygiène européen (40min)
- Leçon 2.2 : Obligations exploitants (40min)
- Leçon 2.3 : Contrôles officiels et sanctions (40min)
- Quiz Module 2

**MODULE 3 : HACCP et PMS (3h00)**
- Leçon 3.1 : Les 7 principes HACCP (60min)
- Leçon 3.2 : Identification des CCP (45min)
- Leçon 3.3 : Plan de Maîtrise Sanitaire (45min)
- Leçon 3.4 : Documentation et enregistrements (30min)
- Quiz Module 3

**MODULE 4 : Températures et conservation (2h00)**
- Leçon 4.1 : Températures réglementaires (40min)
- Leçon 4.2 : Refroidissement et remise en température (40min)
- Leçon 4.3 : Contrôles et traçabilité (40min)
- Quiz Module 4

**MODULE 5 : Hygiène du personnel et des locaux (2h00)**
- Leçon 5.1 : Hygiène personnelle (40min)
- Leçon 5.2 : Tenue et lavage des mains (40min)
- Leçon 5.3 : Nettoyage et désinfection (40min)
- Quiz Module 5

**MODULE 6 : Allergènes et INCO (1h30)**
- Leçon 6.1 : Les 14 allergènes majeurs (30min)
- Leçon 6.2 : Prévention contaminations croisées (30min)
- Leçon 6.3 : Information consommateur (30min)
- Quiz Module 6

**MODULE 7 : Cas pratiques restauration collective (1h00)**
- Leçon 7.1 : Cas pratique 1 : Réception marchandises (20min)
- Leçon 7.2 : Cas pratique 2 : Service et maintien température (20min)
- Leçon 7.3 : Cas pratique 3 : Gestion incident (20min)
- Quiz Module 7

**ÉVALUATION FINALE (30min)**
- Quiz global 30 questions
- Score minimum requis : 75%

---

## 2. TRAÇABILITÉ TECHNIQUE

### 2.1 Horodatage automatique

**Événements tracés :**
- Connexion à la formation
- Début de chaque leçon (timestamp précis)
- Fin de chaque leçon (timestamp précis)
- Durée effective de lecture (timer actif seulement si onglet actif)
- Scroll progress (% de contenu lu)
- Tentatives de quiz (timestamp, score, réponses)
- Validation module
- Génération attestation

**Stockage :**
```javascript
localStorage['okc_formation_trace_' + userId] = {
    sessions: [
        {
            timestamp: ISO8601,
            event: "lesson_start" | "lesson_end" | "quiz_attempt" | "module_complete",
            moduleId: string,
            lessonId: string,
            data: object
        }
    ]
}
```

### 2.2 Timer de lecture actif

```javascript
LessonTimer = {
    start(lessonId) {
        // Démarre chrono
        // Pause automatique si changement onglet (document.hidden)
        // Reprise au retour
    },
    pause(),
    resume(),
    stop() {
        // Enregistre durée totale
        // Met à jour progression
    }
}
```

### 2.3 Scroll tracking

```javascript
// Détecte % de scroll dans la leçon
// Si 90%+ atteint → marque comme "complètement lue"
// Nécessaire pour validation DREETS (preuve de lecture effective)
```

---

## 3. VERROUILLAGE PROGRESSIF

### 3.1 Règles de déverrouillage

**Module 1 :** Déverrouillé par défaut

**Module 2 :** Déverrouillé SI Module 1 Quiz validé (score ≥ 75%)

**Module N :** Déverrouillé SI Module N-1 Quiz validé

**Leçon 1.1 :** Déverrouillée par défaut (première leçon)

**Leçon N :** Déverrouillée SI Leçon N-1 complétée (scroll 90%+ ET durée minimum 80% du temps prévu)

**Quiz module :** Déverrouillé SI toutes les leçons du module complétées

**Évaluation finale :** Déverrouillée SI tous les 7 modules validés

### 3.2 Interface visuelle

```
[✓] Module 1 : Terminé (score 85%)
[▶] Module 2 : En cours
[🔒] Module 3 : Verrouillé
```

---

## 4. GÉNÉRATION ATTESTATIONS PDF

### 4.1 Format légal

```
═════════════════════════════════════════════════════════════
              ATTESTATION DE FORMATION
═════════════════════════════════════════════════════════════

N° [YYYY-ORG-00001]

Nous soussignés, [NOM ORGANISME]
Organisme de formation enregistré sous le n° [XX XX XXXXX XX]
certifions que :

    M./Mme [Nom Prénom]
    Né(e) le [Date]

A suivi avec assiduité la formation :

    "Hygiène alimentaire adaptée à l'activité des 
     établissements de restauration commerciale et collective"

Conforme à l'arrêté du 5 octobre 2011

Du [Date début] au [Date fin]
Durée : 14 heures + évaluation

Programme détaillé :
• Module 1 : Aliments et risques (2h30)
• Module 2 : Réglementation (2h00)
• Module 3 : HACCP et PMS (3h00)
• Module 4 : Températures (2h00)
• Module 5 : Hygiène (2h00)
• Module 6 : Allergènes (1h30)
• Module 7 : Cas pratiques (1h00)

Évaluation finale : [Score]% (score ≥ 75% requis)

Fait à [Ville], le [Date]

Signature du responsable de formation
[Emplacement signature]
═════════════════════════════════════════════════════════════
```

### 4.2 Numérotation

```javascript
AttestationNumber = {
    generate() {
        const year = new Date().getFullYear();
        const org = "OKCUISINE"; // ou code établissement
        const counter = this.getNextCounter();
        return `${year}-${org}-${counter.toString().padStart(5, '0')}`;
        // Exemple : 2026-OKCUISINE-00042
    }
}
```

### 4.3 Génération jsPDF

```javascript
PDF.generateAttestation(sessionData) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("ATTESTATION DE FORMATION", 105, 30, { align: 'center' });
    
    // Numéro
    doc.setFontSize(12);
    doc.text(`N° ${sessionData.attestationNumber}`, 105, 40, { align: 'center' });
    
    // Organisme
    doc.setFontSize(11);
    doc.text("Nous soussignés, OK Cuisine", 20, 60);
    doc.text(`Organisme de formation enregistré sous le n° [À COMPLÉTER]`, 20, 67);
    
    // Stagiaire
    doc.text("certifions que :", 20, 77);
    doc.setFont(undefined, 'bold');
    doc.text(`    ${sessionData.userName}`,20, 87);
    doc.setFont(undefined, 'normal');
    
    // Formation
    doc.text('A suivi avec assiduité la formation :', 20, 100);
    doc.setFont(undefined, 'bold');
    doc.text('"Hygiène alimentaire adaptée à l\'activité des', 30, 107);
    doc.text('établissements de restauration commerciale et collective"', 30, 114);
    doc.setFont(undefined, 'normal');
    
    // Conformité
    doc.setFontSize(10);
    doc.text('Conforme à l\'arrêté du 5 octobre 2011', 30, 122);
    
    // Dates
    doc.setFontSize(11);
    doc.text(`Du ${sessionData.startDate} au ${sessionData.endDate}`, 20, 135);
    doc.text(`Durée : 14 heures + évaluation`, 20, 142);
    
    // Programme
    doc.text('Programme détaillé :', 20, 155);
    const modules = [
        '• Module 1 : Aliments et risques (2h30)',
        '• Module 2 : Réglementation (2h00)',
        '• Module 3 : HACCP et PMS (3h00)',
        '• Module 4 : Températures (2h00)',
        '• Module 5 : Hygiène (2h00)',
        '• Module 6 : Allergènes (1h30)',
        '• Module 7 : Cas pratiques (1h00)'
    ];
    modules.forEach((m, i) => {
        doc.text(m, 25, 163 + (i * 7));
    });
    
    // Score
    doc.text(`Évaluation finale : ${sessionData.finalScore}% (score ≥ 75% requis)`, 20, 215);
    
    // Signature
    doc.text(`Fait à [Ville], le ${new Date().toLocaleDateString('fr-FR')}`, 20, 235);
    doc.text('Signature du responsable de formation', 20, 250);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Document généré automatiquement par OK Cuisine - Formation HACCP', 105, 285, { align: 'center' });
    
    return doc;
}
```

---

## 5. INTERFACE FORMATEUR

### 5.1 Vue d'ensemble

```
╔════════════════════════════════════════════════════════════╗
║             VUE FORMATEUR - SUIVI FORMATIONS               ║
╚════════════════════════════════════════════════════════════╝

Établissement : [Collège Jean Moulin]
Période : [Janvier 2026]

┌─────────────────────────────────────────────────────────────┐
│ STAGIAIRES EN FORMATION                                     │
├─────────────────────────────────────────────────────────────┤
│ Nom              │ Progression │ Module actuel │ Démarré    │
│ ──────────────────────────────────────────────────────────── │
│ Dupont Marie     │ ████████░░ 78% │ Module 6  │ 05/01/2026  │
│ Martin Pierre    │ ████░░░░░░ 42% │ Module 3  │ 08/01/2026  │
│ Bernard Sophie   │ ██████████ 100% │ Terminé   │ 02/01/2026  │
└─────────────────────────────────────────────────────────────┘

[Voir détails] [Exporter rapport] [Valider formation]
```

### 5.2 Détail stagiaire

```
DÉTAIL FORMATION - Bernard Sophie
═══════════════════════════════════════════════════════════

Statut : Formation terminée - En attente validation formateur
Durée totale : 14h 32min
Date début : 02/01/2026 09:15
Date fin : 09/01/2026 16:42

PROGRESSION PAR MODULE
─────────────────────────────────────────────────────────────
✓ Module 1 : Complété (Score quiz : 85%) - Durée : 2h35
✓ Module 2 : Complété (Score quiz : 92%) - Durée : 2h12
✓ Module 3 : Complété (Score quiz : 78%) - Durée : 3h18
✓ Module 4 : Complété (Score quiz : 88%) - Durée : 2h05
✓ Module 5 : Complété (Score quiz : 95%) - Durée : 1h58
✓ Module 6 : Complété (Score quiz : 82%) - Durée : 1h35
✓ Module 7 : Complété (Score quiz : 90%) - Durée : 1h02

ÉVALUATION FINALE
─────────────────────────────────────────────────────────────
Score : 87% (30/30 questions - 26 bonnes réponses)
Durée : 28 minutes
Date : 09/01/2026 16:14

TRAÇABILITÉ DÉTAILLÉE
─────────────────────────────────────────────────────────────
[Télécharger rapport complet PDF]

ACTIONS FORMATEUR
─────────────────────────────────────────────────────────────
✓ Formation complétée
✓ Score > 75% validé
✓ Durée 14h respectée

[✓ VALIDER LA FORMATION] [✗ Refuser] [🗣️ Demander complément]

Après validation :
→ Génération automatique attestation
→ Notification stagiaire
→ Archivage dossier
```

### 5.3 Export rapport traçabilité

**Format PDF pour audit DREETS/Qualiopi**

```
RAPPORT DE TRAÇABILITÉ - FORMATION HACCP 14H
═══════════════════════════════════════════════════════════

Stagiaire : Bernard Sophie
Formation : Hygiène alimentaire 14h
Organisme : OK Cuisine
Numéro session : 2026-00042

CALENDRIER DES CONNEXIONS
─────────────────────────────────────────────────────────────
02/01/2026  09:15-11:50  Module 1 Leçon 1,2,3 + Quiz  2h35
03/01/2026  14:00-16:12  Module 2 Leçon 1,2,3 + Quiz  2h12
04/01/2026  10:30-13:48  Module 3 Leçon 1,2,3,4 + Quiz  3h18
...

DÉTAIL PAR LEÇON
─────────────────────────────────────────────────────────────
Module 1 - Leçon 1.1 : Dangers microbiens
  • Début : 02/01/2026 09:15:23
  • Fin : 02/01/2026 10:02:45
  • Durée : 47min 22sec
  • Scroll : 100% (contenu entièrement parcouru)
  • Visites : 1

Module 1 - Leçon 1.2 : Autres dangers
  • Début : 02/01/2026 10:03:12
  • Fin : 02/01/2026 10:51:08
  • Durée : 47min 56sec
  • Scroll : 98%
  • Visites : 1

[...]

TENTATIVES DE QUIZ
─────────────────────────────────────────────────────────────
Module 1 Quiz - Tentative 1
  • Date : 02/01/2026 11:32
  • Score : 85% (7/8 bonnes réponses)
  • Résultat : VALIDÉ
  • Durée : 8min 12sec

[...]

TEMPS TOTAL TRACÉ
─────────────────────────────────────────────────────────────
Temps leçons : 13h 47min
Temps quiz : 45min
Total : 14h 32min

VALIDATION CONFORME ✓
─────────────────────────────────────────────────────────────
✓ Durée ≥ 14h
✓ Tous modules complétés
✓ Tous quiz validés (score ≥ 75%)
✓ Évaluation finale réussie (87%)

Rapport généré le : 10/01/2026 09:23
Signature électronique : [HASH]
```

---

## 6. INTÉGRATION APP

### 6.1 Navigation

```
App.navigate('centre-formation') → Page formation
  ↓
Si pas de session active → Écran d'accueil formation
Si session en cours → Reprendre où j'en étais
Si session terminée → Vue attestation + recommencer
```

### 6.2 Persistance données

**localStorage :**
- Sessions formation (petit volume, ok pour démo)
- Trace événements
- Attestations générées

**À migrer backend (production) :**
- Sessions formation → PostgreSQL
- Fichiers PDF attestations → Stockage cloud
- Logs traçabilité → Base de données auditée

### 6.3 Menu navigation

```
Conformité avancée
  ├─ Formation (module existant - attestations délivrées)
  └─ Centre de formation (NOUVEAU - parcours 14h)
```

---

## 7. TESTS ET VALIDATION

### 7.1 Checklist avant déploiement

- [ ] 14h de contenu vérifiable (timer)
- [ ] Tous les quiz fonctionnels
- [ ] Verrouillage progressif opérationnel
- [ ] Traçabilité complète (tous événements)
- [ ] Génération PDF attestation conforme
- [ ] Export rapport traçabilité
- [ ] Interface formateur fonctionnelle
- [ ] Test parcours complet utilisateur
- [ ] Test avec plusieurs utilisateurs simultanés
- [ ] Compatibilité navigateurs (Chrome, Firefox, Edge)
- [ ] Responsive mobile/tablette
- [ ] Persistance données après refresh
- [ ] Tests de reprise après interruption

---

## 8. ROADMAP POST-MVP

### Phase 2 (après DREETS)
- Backend Node.js + PostgreSQL
- API REST sécurisée
- Dashboard département (multi-établissements)
- Signature électronique formateur
- Archivage 5 ans automatique
- Exports automatiques ARS/DDPP

### Phase 3 (après Qualiopi)
- Module évaluation pratique (photos/vidéos)
- Questionnaire satisfaction stagiaire
- Système de rappel (formation tous les 5 ans)
- Statistiques avancées
- Integration LMS standard (SCORM)

---

**DÉVELOPPEMENT ESTIMÉ : 6-8 heures de code pur**
**RÉSULTAT : Application production-ready conforme réglementation**

---

FIN DES SPÉCIFICATIONS
