# ✅ Plan de Test - Simulateur HACCP v2.0

## 🚀 Instructions de Test Rapide

### Prérequis
- Application OK Cuisine ouverte dans le navigateur
- Compte utilisateur créé et connecté
- Console navigateur accessible (F12)

---

## 📋 Tests à Effectuer

### Test 1: Accès au Simulateur ✓
```
1. Menu latéral → Audit → Simulateur
2. Vérifier: Écran principal avec titre "Simulateur de Controle Sanitaire DDPP"
3. Vérifier: 3 boutons visibles (Manuel, Scénarios, Personnalisé)
```

### Test 2: Mode Manuel ✓
```
1. Cliquer "✋ Mode Manuel"
2. Vérifier: Audit vierge sans réponses pré-générées
3. Modifier 5-10 réponses (Conforme/A corriger/Non conforme)
4. Ajouter actions correctives sur 2-3 non-conformités
5. Essayer de finaliser à 40% complétion → Doit afficher toast "50% requis"
6. Compléter plus de 50% et finaliser
7. Vérifier: Audit sauvegardé dans historique
```

**Résultat attendu** : ✅ Fonctionne sans erreur

---

### Test 3: Scénarios Prédéfinis ✓
```
Test 3a - Sélection:
1. Cliquer "🎲 Scénarios"
2. Vérifier: 5 cartes visibles avec :
   - Emoji et titre
   - Description
   - Percent conformité
   - Note estimée (A/B/C/D)

Test 3b - École:
1. Cliquer "École Primaire"
2. Vérifier: 
   - Titre montre "École Primaire"
   - ~90% conformité globale
   - Note A estimée
   - Réponses générées (pas vides)

Test 3c - Problématique:
1. Cliquer "Établissement Problématique"
2. Vérifier:
   - ~55% conformité globale
   - Note C
   - Beaucoup de NC majeures (>20%)

Test 3d - Modifier Réponses:
1. Dans Un scénario, changer 5 réponses "non" → "oui"
2. Score global doit augmenter
3. Finaliser après modification
```

**Résultat attendu** : ✅ 5 scénarios générés correctement

---

### Test 4: Mode Personnalisé ✓
```
1. Cliquer "🎨 Personnalisé"
2. Vérifier: Interface avec :
   - Input "Nom établissement"
   - Slider "Taux conformité" (0-100%)
   - Checkbox options avancées
   - Grade estimé change avec slider

Test 4a - Conformité 100%:
1. Mettre slider à 100%
2. Vérifier: Grade A, tous textes "Très satisfaisant"
3. Démarrer
4. Vérifier: Presque toutes les réponses sont "oui"

Test 4b - Conformité 50%:
1. Mettre slider à 50%
2. Vérifier: Grade C, texte "À améliorer"
3. Démarrer
4. Vérifier: Répartition aléatoire 50/50

Test 4c - Options Avancées:
1. Slider 75%
2. Cocher "Concentrer NC majeures"
3. Démarrer
4. Vérifier: Défauts concentrés sur questions majeures

Test 4d - Variation Sections:
1. Slider 70%
2. Cocher "Varier les sections"
3. Vérifier: Certaines sections meilleures que d'autres
```

**Résultat attendu** : ✅ Personnalisation fonctionne, paramètres appliqués

---

### Test 5: Dashboard Stability ✓
```
1. Faire 3 audits simulés différents
2. À chaque fois, retourner au Dashboard (Menu → Tableau de bord)
3. Vérifier: Dashboard reste noir, stats affichées normalement
4. Aucune erreur console (F12)

Bonus - Vérifier données réelles non affectées:
5. Ouvrir Temperatures, ajouter une température réelle
6. Vérifier: Elle apparaît SEULEMENT dans temp réelles, PAS dans audit simu
```

**Résultat attendu** : ✅ Dashboard stable, zéro impact

---

### Test 6: Historique ✓
```
1. Faire 3 audits (1 manuel, 1 scénario, 1 perso)
2. Retourner à écran d'accueil simulateur
3. Vérifier: Tableau historique avec 3 lignes
4. Vérifier colonnes:
   - Date (aujourd'hui)
   - Type (Manuel, 🎲 Scénario, 🎨 Personnalisé)
   - Établissement différent pour chaque
   - Note (A/B/C/D) correspondante
   - Score (%)
   - NC Maj.

5. Cliquer "Voir" sur un audit passé
6. Vérifier: Retrouve l'audit complet avec ses réponses
```

**Résultat attendu** : ✅ Historique sauvegardé et consultable

---

### Test 7: Export PDF ✓
```
1. Faire un audit (n'importe quel mode)
2. Dans audit, cliquer "📄 Export PDF"
3. Vérifier: PDF généré avec :
   - Titre audit
   - Établissement
   - Date/Auditeur
   - Score par section
   - Détail questions/réponses
   - Plan actions correctives
```

**Résultat attendu** : ✅ PDF généré et téléchargeable

---

### Test 8: Responsive/Mobile ✓
```
1. F12 → Responsive Design Mode (Ctrl+Shift+M)
2. Changer viewport (iPhone/iPad/Android)
3. Tester chaque écran:
   - Sélection mode
   - Sélection scénarios (cartes adaptées)
   - Audit (questions lisibles)
   - Personnalisé (slider fonction)
```

**Résultat attendu** : ✅ Responsive fonctionne

---

### Test 9: Erreur Handling ✓
```
Console:
1. F12 → Console
2. Taper: localStorage.removeItem('okc_config')
3. Recharger page et lancer simulateur
4. Vérifier: Message explicite ou fonctionnement graceful

Restore:
5. Fermer app et rouvrir (config sera restaurée)
```

**Résultat attendu** : ✅ Pas de crash, message clair

---

## 🧮 Criterios de Réussite

| Test | Critère | Statut |
|------|---------|--------|
| 1 | Accès simulateur sans erreur | ☐ |
| 2 | Mode manuel 50% complétude requis | ☐ |
| 3 | 5 scénarios générés correctement | ☐ |
| 4 | Personnalisé applique paramètres | ☐ |
| 5 | Dashboard stable zéro impact | ☐ |
| 6 | Historique sauvegarde types audit | ☐ |
| 7 | Export PDF fonctionne | ☐ |
| 8 | Mobile responsive | ☐ |
| 9 | Erreur handling graceful | ☐ |

---

## 🔍 Vérifications Avancées (Optionnel)

### Vérifier LocalStorage Isolation
```javascript
// Console:
Object.keys(localStorage).filter(k => k.includes('simulateur')).length
// Devrait retourner 2+ (history + au moins 1 audit)

Object.keys(localStorage).filter(k => k.includes('temp_')).length
// Devrait retourner même nombre qu'avant (pas affecté)
```

### Vérifier Génération Cohérente
```javascript
// Relancer même scénario x3
// Les notes globales doivent être similaires (±5%)
// Jamais identiques (différentes réponses à chaque fois)
```

### Vérifier Pondération Correcte
```javascript
// Faire un "Déjà Problématique" (55%)
// Vérifier: Grade C (50-69%)
// Vérifier: Beaucoup NC majeures

// Faire un "École Conforme" (90%)
// Vérifier: Grade A (90%+)
// Vérifier: Presque aucune NC
```

---

## 📝 Notes de Test

- Tous les tests doivent passer avant production
- Si un test échoue, vérifier console (F12) pour erreurs
- Prendre screenshot de chaque écran principal pour evidence
- Note: Temps test estimé = 30-45 minutes

---

## 🐛 Report si Bug

Si erreur pendant test:
1. Note le numéro de test exact
2. Décris ce qui s'est passé
3. Ouvre Console (F12) et copie l'erreur
4. Redémarrage app et reproduis

---

**Date Test** : ______  
**Testeur** : ______  
**Navigateur/Version** : ______  
**Résultat Global** : ☐ PASS ☐ FAIL

