# Crédits audio — KOMBIEN ?

## Effets sonores

Tous les effets sonores du jeu sont **générés à la volée par le code**, via l'API
Web Audio du navigateur (oscillateurs synthétisés en temps réel). Aucun fichier
audio externe n'est utilisé.

- **Source** : synthèse procédurale maison (`frontend/src/utils/sound.js`)
- **Licence** : aucune licence tierce requise — sons 100% originaux et générés
  par le programme. Utilisables sans restriction, y compris en contexte commercial.

Sons produits :

| Événement | Fonction | Description |
|-----------|----------|-------------|
| Bonne réponse | `playCorrect` | Accord ascendant do-mi-sol |
| Mauvaise réponse | `playWrong` | Buzz descendant |
| Victoire | `playVictory` | Arpège majeur |
| Défaite | `playDefeat` | Descente sombre |
| Carte bonus | `playBonus` | Petite fanfare |
| Clic / tirage | `playClick` | Pop court |

## Musique de fond

Pas de musique de fond longue pour l'instant. Si une piste est ajoutée
ultérieurement, elle devra provenir **exclusivement** d'une source libre de
droits explicitement autorisée pour usage commercial (ex. CC0 / domaine public),
et sa source + licence devront être documentées ici (nom, lien, licence).

**Interdiction stricte** : aucun extrait de musique commerciale existante, même court.
