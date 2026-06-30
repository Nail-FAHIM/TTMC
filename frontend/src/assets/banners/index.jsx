/**
 * Banque de bannières d'équipes — motifs SVG générés (libres de droits).
 * Chaque bannière est une fonction (color) → <svg> motif, identifiée par `id`.
 * Ajoute/retire des motifs ici sans toucher au reste du code.
 */
import React from 'react';

function darken(hex, f = 0.55) {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.slice(0, 2), 16) * f);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * f);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * f);
  return `rgb(${r},${g},${b})`;
}

// Chaque motif : (color) => contenu SVG (repère 0..40)
const MOTIFS = {
  bolt: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M22 4 L12 22 H20 L16 36 L30 16 H22 Z" fill={c} stroke="#fff" strokeWidth="1.2" />
    </>
  ),
  star: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M20 5 L24 16 L36 16 L26 23 L30 35 L20 27 L10 35 L14 23 L4 16 L16 16 Z"
            fill={c} stroke="#fff" strokeWidth="1" />
    </>
  ),
  stripes: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M-10 30 L30 -10 M0 40 L40 0 M10 50 L50 10" stroke={c} strokeWidth="7" />
    </>
  ),
  dots: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <g fill={c}>
        <circle cx="10" cy="10" r="5" /><circle cx="30" cy="10" r="5" />
        <circle cx="20" cy="20" r="5" />
        <circle cx="10" cy="30" r="5" /><circle cx="30" cy="30" r="5" />
      </g>
    </>
  ),
  flame: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M20 6 C28 14 26 20 24 24 C30 22 30 30 24 34 C28 28 20 30 20 34 C12 32 14 24 16 22 C12 24 14 16 20 6 Z"
            fill={c} stroke="#fff" strokeWidth="0.8" />
    </>
  ),
  shield: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M20 5 L33 10 V20 C33 29 27 34 20 36 C13 34 7 29 7 20 V10 Z"
            fill={c} stroke="#fff" strokeWidth="1.2" />
    </>
  ),
  wave: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M-2 14 Q8 6 18 14 T38 14 M-2 26 Q8 18 18 26 T38 26"
            fill="none" stroke={c} strokeWidth="5" />
    </>
  ),
  diamond: c => (
    <>
      <rect width="40" height="40" fill={darken(c)} />
      <path d="M20 4 L36 20 L20 36 L4 20 Z" fill={c} stroke="#fff" strokeWidth="1.2" />
      <path d="M20 12 L28 20 L20 28 L12 20 Z" fill={darken(c, 0.8)} />
    </>
  ),
};

export const BANNER_IDS = Object.keys(MOTIFS);

export function Banner({ id, color = '#7c3aed', size = 40, radius = 8 }) {
  const draw = MOTIFS[id] || MOTIFS.star;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40"
         style={{ borderRadius: radius, display: 'block' }}>
      <clipPath id={`clip-${id}-${size}`}>
        <rect width="40" height="40" rx={radius * 40 / size} />
      </clipPath>
      <g clipPath={`url(#clip-${id}-${size})`}>{draw(color)}</g>
    </svg>
  );
}
