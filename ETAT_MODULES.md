# OK Cuisine — Etat des modules (demo)

## Comment lire ce document
- Fonctionnel: le module rend l'UI et enregistre les donnees
- Export: export PDF/CSV present
- Points a verifier: tests a faire ou risques connus

## Operations quotidiennes
### Temperatures
- Fonctionnel: oui
- Export: non specifique (via audit/journal)
- Points a verifier: CCP, seuils, alertes

### Nettoyage
- Fonctionnel: oui
- Export: non specifique
- Points a verifier: actions correctives, historique

### Receptions
- Fonctionnel: oui
- Export: non specifique
- Points a verifier: lots, temperature, conformité

### Inventaire
- Fonctionnel: oui
- Export: PDF
- Points a verifier: edition, suppression, stock negatif

### Menus
- Fonctionnel: oui
- Export: PDF
- Points a verifier: generation, historique

## Gestion des risques
### Alertes
- Fonctionnel: oui
- Export: non
- Points a verifier: statut resolu, journalisation

### Allergennes
- Fonctionnel: oui
- Export: PDF
- Points a verifier: matrice, edition

### Tracabilite
- Fonctionnel: oui
- Export: PDF
- Points a verifier: etiquettes, plats temoins

### Protocoles
- Fonctionnel: oui
- Export: PDF
- Points a verifier: huiles friture

### Journal
- Fonctionnel: oui
- Export: PDF + impression
- Points a verifier: filtres dates

### Audit
- Fonctionnel: oui
- Export: DDPP
- Points a verifier: periode, coherences

### Simulateur
- Fonctionnel: oui (mode manuel + simulation)
- Export: PDF
- Points a verifier: coherences score, historique

## Gestion systeme
### Recettes
- Fonctionnel: oui
- Export: PDF
- Points a verifier: calculs

### Fournisseurs
- Fonctionnel: oui
- Export: non
- Points a verifier: filtres, contacts

### Configuration
- Fonctionnel: oui
- Export: JSON global
- Points a verifier: import, reset, roles

## Conformite avancee
### Formations
- Fonctionnel: oui
- Export: PDF
- Points a verifier: expirations

### Centre de formation
- Fonctionnel: oui
- Export: attestations
- Points a verifier: quiz, progression

### TIAC
- Fonctionnel: oui
- Export: DDPP
- Points a verifier: enquete, cloture

### RGPD
- Fonctionnel: oui
- Export: JSON/PDF
- Points a verifier: suppression + archivage

### Rappels produits
- Fonctionnel: oui
- Export: PDF/CSV
- Points a verifier: retrait, statut

### PAI
- Fonctionnel: oui
- Export: PDF + affichage cuisine
- Points a verifier: adrenaline, alertes

### AGEC avance
- Fonctionnel: oui
- Export: plan d'action
- Points a verifier: stats

### Maintenance
- Fonctionnel: oui
- Export: calendrier
- Points a verifier: retard, validation

### Analyse risques
- Fonctionnel: oui
- Export: PDF
- Points a verifier: detection CCP

### Validation nettoyage
- Fonctionnel: oui
- Export: PDF
- Points a verifier: seuils ATP

### Separation cru/cuit
- Fonctionnel: oui
- Export: PDF
- Points a verifier: procedures, equipements

### Douches/vestiaires
- Fonctionnel: oui
- Export: PDF
- Points a verifier: checklists

### Archivage DLC
- Fonctionnel: oui
- Export: JSON/CSV
- Points a verifier: auto-archivage

## Risques techniques connus (demo)
- Donnees locales (localStorage) sans synchro
- Offline incomplet si SW ne cache pas tous les modules
- Demo selector ne remplit pas encore les donnees (a relier)

