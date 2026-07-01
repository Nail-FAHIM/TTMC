/**
 * Labels centralisés du plateau et des cases.
 * Modifie ici sans toucher au code de rendu (Board.jsx, Modal.jsx).
 * On garde les noms d'origine TTMC.
 */

// Libellés affichés sur les cases du plateau (\n = retour à la ligne)
export const CELL_LABELS = {
  Mature:     'MATURE',
  Scolaire:   'SCOLAIRE',
  Plaisir:    'PLAISIR',
  Insolite:   'INSOLITE',
  bonus:      "C'EST\nSUPERBE",
  malus:      "ÇA VA\nPAS DU TOUT",
  challenge:  'CHALLENGE',
  finale:     "HÉSITE PAS\nÀ GAGNER",
};

// Libellés "longs" utilisés dans les modales / titres
export const CELL_TITLES = {
  bonus:     "C'est superbe !",
  malus:     'Ça va pas du tout !',
  challenge: 'Challenge',
  finale:    "N'hésite pas à gagner",
  debut:     'Hésite pas à débuter',
  depart:    'Hésite pas à débuter',
};

// Titre du jeu (point 9) — facilement éditable
export const GAME_TITLE = {
  short_logo: 'TTMC ?',          // logo affiché dans l'encart du plateau
  full:  'Combien te mets-tu ?', // titre de l'écran de config
  tagline: 'COMBIEN TE METS-TU ?',
};
