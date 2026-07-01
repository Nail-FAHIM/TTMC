/**
 * Catégories de thèmes + couleurs.
 * Source unique de vérité pour les 4 catégories du jeu.
 */

export const CATS = ['Scolaire', 'Plaisir', 'Mature', 'Insolite'];

// Couleurs UI (sidebar, modales) — fond sombre + accent vif
export const CAT_COLORS = {
  Scolaire:   { stroke: '#00c3ff', fill: '#093347', text: '#00c3ff' },
  Plaisir:    { stroke: '#ffb400', fill: '#3d2c00', text: '#ffb400' },
  Mature:     { stroke: '#ff1a6b', fill: '#3d0022', text: '#ff1a6b' },
  Insolite:   { stroke: '#00e87a', fill: '#003d20', text: '#00e87a' },
};

// Couleurs des cases du plateau (proche du vrai plateau physique)
export const CELL_STYLE = {
  Mature:     { fill: '#7BA7D4', border: '#111', text: '#fff' },
  Scolaire:   { fill: '#7BBF42', border: '#111', text: '#fff' },
  Plaisir:    { fill: '#F27E1B', border: '#111', text: '#fff' },
  Insolite:   { fill: '#8B50CC', border: '#111', text: '#fff' },
  bonus:      { fill: '#F5D020', border: '#111', text: '#111' },
  malus:      { fill: '#111',    border: '#555', text: '#fff' },
  challenge:  { fill: '#CC2222', border: '#111', text: '#fff' },
  finale:     { fill: '#87CEEB', border: '#111', text: '#111' },
};

export const PION_COLORS = [
  '#7c3aed', '#f97316', '#06b6d4', '#22c55e',
  '#f43f5e', '#3b82f6', '#d946ef', '#84cc16',
];
