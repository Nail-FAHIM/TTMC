/**
 * Labels centralisés du plateau et des cases — noms 100% originaux (anti-copyright).
 * Modifie ici sans toucher au code de rendu (Board.jsx, Modal.jsx).
 */

// Libellés affichés sur les cases du plateau (\n = retour à la ligne)
export const CELL_LABELS = {
  Mature:     'MATURE',
  Scolaire:   'SCOLAIRE',
  Plaisir:    'PLAISIR',
  Improbable: 'IMPROBABLE',
  bonus:      'BONUS',
  malus:      'MALUS',
  challenge:  'CHALLENGE',
  finale:     'ARRIVÉE',
};

// Libellés "longs" utilisés dans les modales / titres
export const CELL_TITLES = {
  bonus:     'Bonus',
  malus:     'Malus',
  challenge: 'Challenge',
  finale:    'Arrivée',
  debut:     'Départ',
  depart:    'Départ',
};

// Identité du jeu — facilement éditable
export const GAME_TITLE = {
  short_logo: 'KOMBIEN ?',       // logo affiché dans l'encart du plateau
  full:  'KOMBIEN ?',            // titre de l'écran de config / menu
  tagline: 'LE QUIZ OÙ TU TE COTES',
};
