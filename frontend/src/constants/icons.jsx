/**
 * Icônes SVG centralisées par type de case (style pochoir, lisibles en petit).
 * Dessinées dans un repère centré (0,0). `color="currentColor"` → héritent
 * de la couleur de texte de la case. Modifie / remplace ici sans toucher au rendu.
 */
import React from 'react';

const stroke = {
  stroke: 'currentColor', strokeWidth: 2, fill: 'none',
  strokeLinecap: 'round', strokeLinejoin: 'round',
};

export const CELL_ICONS = {
  // Scolaire — cahiers + livre
  Scolaire: () => (
    <g {...stroke}>
      <rect x="-10" y="-7" width="20" height="14" rx="2" />
      <rect x="-10" y="-11" width="7" height="5" rx="1" />
      <rect x="-1" y="-11" width="7" height="5" rx="1" />
      <line x1="-7" y1="-2" x2="7" y2="-2" />
      <line x1="-7" y1="2" x2="5" y2="2" />
    </g>
  ),
  // Plaisir — accordéon
  Plaisir: () => (
    <g {...stroke}>
      <rect x="-11" y="-7" width="6" height="14" rx="1" />
      <rect x="-5" y="-9" width="10" height="18" rx="2" />
      <rect x="5" y="-7" width="6" height="14" rx="1" />
      <circle cx="0" cy="0" r="3" />
    </g>
  ),
  // Mature — livre fermé
  Mature: () => (
    <g {...stroke}>
      <rect x="-9" y="-11" width="18" height="22" rx="2" />
      <line x1="-6" y1="-5" x2="6" y2="-5" />
      <line x1="-6" y1="0" x2="6" y2="0" />
      <line x1="-6" y1="5" x2="4" y2="5" />
    </g>
  ),
  // Insolite — rouleau de PQ
  Insolite: () => (
    <g {...stroke}>
      <ellipse cx="0" cy="-3" rx="7" ry="9" />
      <rect x="-5" y="5" width="10" height="5" rx="1" />
      <line x1="-3" y1="10" x2="3" y2="10" />
    </g>
  ),
  // Challenge — éclair
  challenge: () => (
    <g fill="currentColor">
      <path d="M-3-13 h8 L-1-1 h7 L-7 13 L-1 1 h-8z" />
    </g>
  ),
  // Bonus — étoile pleine
  bonus: () => (
    <g fill="currentColor">
      <path d="M0-12 L3-4 L12-4 L5 2 L7 11 L0 6 L-7 11 L-5 2 L-12-4 L-3-4z" />
    </g>
  ),
  // Malus — interdiction
  malus: () => (
    <g {...stroke}>
      <circle cx="0" cy="0" r="10" />
      <line x1="-7" y1="-7" x2="7" y2="7" />
      <line x1="7" y1="-7" x2="-7" y2="7" />
    </g>
  ),
  // Finale — étoile éclatante
  finale: () => (
    <g fill="currentColor">
      <path d="M0-13 L4-4 L14-4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14-4 L-4-4z" />
    </g>
  ),
};

export function CellIcon({ typeKey }) {
  const I = CELL_ICONS[typeKey];
  return I ? <I /> : null;
}
