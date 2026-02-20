# Politique d'Accès et Sécurité des Sessions
## OK Cuisine - Application HACCP

**Version**: 1.0  
**Effective Date**: 2025-02-10  
**Classification**: Internal / For RFP Review  

---

## 1. Objectif

Cette politique définit les mesures de sécurité pour l'authentification d'accès et la gestion des sessions au sein de l'application OK Cuisine, en conformité avec les bonnes pratiques de sécurité informatique et les exigences réglementaires de traçabilité HACCP.

---

## 2. Principes de Base

### 2.1 Pas de Credentials par Défaut
- ❌ **INTERDITE**: Utilisation de compte administrateur par défaut avec mot de passe connu
- ✅ **REQUIS**: Chaque installation crée ses propres identifiants au premier lancement
- **Impact**: Élimine le vecteur d'attaque "default credentials"

### 2.2 Authentification Forte par PIN
- **Format**: Exactement 4 chiffres (0-9)
- **Exemples valides**: "0000", "1234", "9999"
- **Exemples invalides**: "PIN0", "12ab", "000" (trop court)
- **Stockage**: localStorage (Phase 1) → Chiffrement AES (Phase 2)

### 2.3 Protection Contre Accès Non Autorisé
- **Lockout automatique**: Après 3 tentatives de PIN échouées
- **Durée du lockout**: 5 minutes
- **Message aux utilisateurs**: "Compte bloqué. Réessayez dans X minutes"
- **Impact**: Prévient les attaques par force brute sur le PIN 4-chiffres

### 2.4 Timeout Automatique
- **Durée**: 5 minutes d'inactivité du clavier/souris
- **Déclencheurs d'activité**: 
  - Mouvements de souris
  - Frappes clavier
  - Clic souris
  - Gestes tactiles (mobile/tablette)
  - Scrolling
- **Action**: Déconnexion immédiate, retour écran de connexion
- **Raison**: Contexte cuisine partagée (prévention d'accès accidentel après départ)

---

## 3. Procédures Opérationnelles

### 3.1 Première Utilisation - Création Administrateur
```
Étape 1: Lancer l'application
Étape 2: La page d'accueil affiche "Aucun utilisateur"
Étape 3: Cliquer le bouton "Configurer"
Étape 4: Remplir le formulaire:
  - Établissement: [Nom libre]
  - Nom Utilisateur: [Prénom Nom]
  - Initiales: [2-3 lettres]
  - Code PIN: [4 chiffres, exemple: "1234"]
Étape 5: Cliquer "Démarrer"
Étape 6: Message "Configuration enregistrée !"
Étape 7: L'utilisateur apparaît dans la liste de connexion
```

### 3.2 Connexion Quotidienne
```
Étape 1: Ouvrir application OK Cuisine
Étape 2: Voir liste d'utilisateurs
Étape 3: Cliquer sur son nom
Étape 4: Saisir code PIN (4 chiffres)
Étape 5: Appuyer "Valider" ou voir validation automatique après 4 chiffres
Résultat: 
  - Si correct: Accès accordé, session démarre
  - Si incorrect: Message "Code PIN incorrect", retour à l'écran de saisie
```

### 3.3 Cas: Mauvais PIN (3 Tentatives Max)
```
Tentative 1: PIN incorrect → Message "Code PIN incorrect"
Tentative 2: PIN incorrect → Message "Code PIN incorrect"
Tentative 3: PIN incorrect → Message "Trop de tentatives. Compte bloqué 5 min."

Compte verrouillé:
  - Impossible de tester d'autres PIN
  - Attendre 5 minutes
  - Compte se déverrouille automatiquement
  - Message: "Compte bloqué. Réessayez dans 5 minutes" (décompte)
```

### 3.4 Inactivité (5 Minutes)
```
Scénario: Utilisateur connecté oublie de se déconnecter
Actions:
  - 0-5 min: Utilisateur actif, session normale
  - 5 min sans activité: Déconnexion automatique
  - Message (avant): Opcional, possibilité de toast "Session expire dans 30 sec"
  - Message (après): Retour écran de connexion, "Session expirée"
  
Journal: Entrée créée "Déconnexion de [Nom Utilisateur]"
```

### 3.5 Déconnexion Volontaire
```
Pendant session active:
  - Cliquer menu utilisateur (↓ coin supérieur droit)
  - Voir nom et rôle de l'utilisateur
  - Cliquer "Déconnexion"
  - Confirmation: Retour écran de connexion immédiatement
```

---

## 4. Mesures de Sécurité En Place

### 4.1 Liste des Contrôles (Phase S1)

| Contrôle | Détail | Validé |
|----------|--------|--------|
| **Pas de PIN par défaut** | `_ensureAdminExists()` ne crée plus 'admin' → remet à 0000 | ✅ |
| **Force brute limitée** | 3 tentatives max, puis lockout 5 min/utilisateur | ✅ |
| **Validation PIN strict** | Regex `/^\d{4}$/` → exactement 4 chiffres | ✅ |
| **Idle logout** | 5 min inactivité → `logout()` appelée | ✅ |
| **Activation détection** | mousemove, keydown, click, touchstart, scroll | ✅ |
| **Journal traçabilité** | Connexion/déconnexion loggées dans [Journal](js/journal.js) | ✅ |

### 4.2 Mesures Prévues (Phases S2-S7)

| Phase | Mesure | Impact RFP |
|-------|--------|-----------|
| **S2** | Chiffrement PIN + données sensibles (PAI) | Critique |
| **S3** | Schéma validation import/export JSON | Important |
| **S4** | Hardening XSS (escapeHTML systématique) | Important |
| **S5** | Consentement RGPD explicite, droit d'oubli | **CRITIQUE** pour RFP France |
| **S6** | Suppression dépendances CDN, cache local | Important |
| **S7** | Journal immutable, hash intégrité audit | Important |

---

## 5. Conformité et Audit

### 5.1 Traçabilité Journal
Chaque accès est enregistré:
```
Entry Type: "connexion"
Message: "Connexion de [Nom Utilisateur]"
Timestamp: [ISO 8601]
Context: Module/Action effectuée

Entry Type: "connexion"
Message: "Déconnexion de [Nom Utilisateur]"
Timestamp: [ISO 8601]
Raison: "Timeout (5 min)" ou "Déconnexion manuelle"
```

Export Journal: Via module "Journal" → Fichier JSON/CSV → Preuve audit DDPP

### 5.2 Incidents Signalés
Lockout automatique surmonitoré, exemples à rechercher dans Journal:
```
- Utilisation de "Code PIN incorrect" (3x = incident sécurité)
- Déconnexion forcée (timeout)
- Tentatives sur compte inexistant
```

### 5.3 Rapports de Conformité
- **HACCP**: ✅ Traçabilité des utilisateurs et actions
- **DDPP**: ✅ Audit trail (journal) for health inspection
- **RGPD**: 🟡 Partiellement (Phase S5 complète consentement)

---

## 6. Responsabilités

### 6.1 Administrateur Système
- Créer compte admin lors du premier démarrage
- Gérer la liste des utilisateurs (ajouter/supprimer)
- Protéger le code PIN de partage accidentel
- Consigner les utilisateurs par rôle (admin vs employé)

### 6.2 Utilisateurs
- Mémoriser et protéger son code PIN personnel
- Se déconnecter volontairement à la fin de son service
- **Ne pas laisser son compte connecté** (protection assurée par timeout 5 min)
- Signaler un compte verrouilé si soupçonné accès non autorisé

### 6.3 Développeur/Exploitant
- Maintenir la politique accessible et à jour
- Surveiller Journal pour activités anormales
- Tester la sécurité à chaque version release
- Mettre à jour vers Phases S2-S7 selon priorités RFP

---

## 7. Limitations Connues

### 7.1 Pour Phase S1
| Limitation | Impact | Mitigation (Phase) |
|---|---|---|
| PIN stocké plaintext localStorage | Moyen (SI compromis navigateur) | Phase S2: Chiffrement AES |
| Lockout en-mémoire (réinitial. page reload) | Bas (attaquant doit continuer même session) | Phase S2: Persist localStorage |
| Pas de rappel avant timeout | UX (utilisateur peut perdre données non-sauvegardées) | Phase S1.5: Toast avertissement 30s avant |
| Pas de blocage par adresse IP | Bas (single-device, intranet food facility) | Phase S6: Si déploiement Internet |

---

## 8. Escalade et Support

### 8.1 "J'ai oublié mon PIN"
**Solution**: 
- Contacter l'administrateur système
- Admin utilisera module "Gestion Usagers" → Réinitialise PIN utilisateur
- Utilisateur reçoit nouveau PIN temporaire
- Utiliser nouveau PIN pour se connecter
- Imédiatement changer vers un nouveau PIN personnel

*(Note: Interface "Changer mon PIN" à implémenter Phase S2)*

### 8.2 "Mon compte reste bloqué (5 min écoulées mais refuse PIN)"
**Cause probables**:
1. Page d'application non rafraîchie
2. localStorage ou cache navigateur corrompu
3. JavaScript erreur en console (F12)

**Solution**:
1. Rafraîchir la page (F5 ou Ctrl+R)
2. Vider cache navigateur (Ctrl+Shift+Delete) 
3. Vérifier console pour erreurs (F12 → Console)
4. Contacter support

### 8.3 "Impossible de faire première configuration"
**Symptôme**: Bouton "Configurer" non-cliquable ou modal ne s'ouvre pas

**Diagnostic**:
1. Vérifier que localStorage n'est pas désactivé (paramètres navigateur)
2. Vérifier que JavaScript est activé
3. Essayer autre navigateur (Chrome / Firefox / Safari)
4. Virer cookies et cache (Ctrl+Shift+Delete)

---

## 9. Glossaire

| Terme | Signification |
|-------|---|
| **PIN** | Personal Identification Number = Code 4 chiffres |
| **Lockout** | Compte verrouillé suite tentatives échouées |
| **Idle / Inactivité** | Pas de mouvement souris, clic, clavier, toucher écran pendant 5 min |
| **Session** | Période connecté après succès authentification |
| **Journal/Log** | Enregistrement trace de connexion, action, erreur |
| **HACCP** | Hazard Analysis and Critical Control Point (système sécurité alimentaire) |
| **DDPP** | Direction Départementale de la Protection des Populations (inspection sanitaire) |
| **localStorage** | Stockage données navigateur (persiste entre sessions) |

---

## 10. Historique Versions

| Version | Date | Auteur | Changements |
|---------|------|--------|---|
| 1.0 | 2025-02-10 | Dev Team | Phase S1 initial security policy |

---

## 11. Signature et Approbation

**Politique approuvée par**:

| Rôle | Nom | Date | Signature |
|------|------|------|-----------|
| Développeur | _____ | _____ | _____ |
| Responsable QA | _____ | _____ | _____ |
| Directeur Projet | _____ | _____ | _____ |

---

## 12. Références

- [PHASE_S1_VALIDATION.md](PHASE_S1_VALIDATION.md) - Rapport technique validation
- [PHASE_S1_QUICKSTART.md](PHASE_S1_QUICKSTART.md) - Guide démarrage rapide
- [js/app.js](js/app.js) - Code source authentification
- [js/journal.js](js/journal.js) - Code source traçabilité logs

---

**Pour toute question concernant cette politique, contactez l'équipe dev.**

*Politique d'Accès et Sécurité des Sessions - OK Cuisine v1.0*
