/**
 * Board — plateau serpentin style vrai TTMC.
 * Chemin de cases rectangulaires qui zigzaguent, fond bois,
 * virages arrondis entre les rangées.
 */
import { useMemo } from 'react';
import { CAT_COLORS, SPECIAL_CELLS } from '../store/gameStore.js';

// ─── Constantes layout ────────────────────────────────────────────────────────
const CELL_W = 82;
const CELL_H = 54;
const GAP_X   = 4;
const GAP_Y   = 36;   // espace vertical entre rangées (pour le virage)
const PER_ROW = 8;
const ROWS    = 7;
const PAD_X   = 44;
const PAD_Y   = 32;

const STEP_X = CELL_W + GAP_X;
const STEP_Y = CELL_H + GAP_Y;
const SVG_W  = PAD_X * 2 + PER_ROW * STEP_X - GAP_X;
const SVG_H  = PAD_Y * 2 + ROWS * STEP_Y - GAP_Y;

// Rayon du virage en U entre rangées
const TURN_R = GAP_Y / 2 + CELL_H / 2;

const CAT_ICONS = {
  Scolaire:   '📚',
  Plaisir:    '🎲',
  Mature:     '🍷',
  Improbable: '🦄',
};

const CAT_LABELS = {
  Scolaire:   'SCO',
  Plaisir:    'PLR',
  Mature:     'MAT',
  Improbable: 'IMP',
};

function getSpecialType(idx) {
  for (const [type, indices] of Object.entries(SPECIAL_CELLS)) {
    if (indices.includes(idx)) return type;
  }
  return null;
}

// Position d'une case dans le SVG
function cellPos(idx) {
  const row    = Math.floor(idx / PER_ROW);
  const posRow = idx % PER_ROW;
  const col    = row % 2 === 0 ? posRow : PER_ROW - 1 - posRow;
  return {
    x: PAD_X + col * STEP_X,
    y: PAD_Y + (ROWS - 1 - row) * STEP_Y,
  };
}

// Construit le SVG path du "rail" de fond (chemin continu)
function buildTrackPath() {
  const parts = [];

  for (let row = 0; row < ROWS; row++) {
    const y = PAD_Y + (ROWS - 1 - row) * STEP_Y + CELL_H / 2;
    const goRight = row % 2 === 0;

    const xLeft  = PAD_X - GAP_X / 2;
    const xRight = PAD_X + PER_ROW * STEP_X - GAP_X / 2;

    if (row === 0) {
      parts.push(`M ${goRight ? xLeft : xRight} ${y}`);
    }

    parts.push(`L ${goRight ? xRight : xLeft} ${y}`);

    // Virage vers la rangée suivante
    if (row < ROWS - 1) {
      const yNext = PAD_Y + (ROWS - 2 - row) * STEP_Y + CELL_H / 2;
      const cx = goRight ? xRight + TURN_R : xLeft - TURN_R;

      // Arc : sweep 1 si virage à droite (pair→impair), 0 sinon
      const sweep = goRight ? 1 : 0;
      parts.push(`A ${TURN_R} ${TURN_R} 0 0 ${sweep} ${goRight ? xRight : xLeft} ${yNext}`);
    }
  }
  return parts.join(' ');
}

export default function Board({ teams, currentTeamIdx, activeCellIdx }) {
  const cells = useMemo(() => {
    const CATS = ['Scolaire', 'Plaisir', 'Mature', 'Improbable'];
    return Array.from({ length: PER_ROW * ROWS }, (_, i) => ({
      idx: i,
      cat: CATS[i % CATS.length],
    }));
  }, []);

  const trackPath = useMemo(() => buildTrackPath(), []);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* Fond bois */}
        <linearGradient id="wood-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2c1a0e" />
          <stop offset="40%"  stopColor="#3d2410" />
          <stop offset="100%" stopColor="#1e1108" />
        </linearGradient>

        {/* Rail du chemin */}
        <linearGradient id="track-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a1008" />
          <stop offset="100%" stopColor="#0d0804" />
        </linearGradient>

        {/* Pions */}
        {teams.map(t => (
          <radialGradient key={t.id} id={`pg-${t.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={t.color}  stopOpacity="1" />
          </radialGradient>
        ))}

        {/* Ombre case */}
        <filter id="cell-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
        </filter>

        {/* Lueur case active */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fff" floodOpacity="0.6" />
        </filter>

        <style>{`
          @keyframes pulse-ring {
            0%   { stroke-opacity: 1; stroke-width: 3; }
            50%  { stroke-opacity: 0.3; stroke-width: 5; }
            100% { stroke-opacity: 1; stroke-width: 3; }
          }
          .pulse { animation: pulse-ring 1.2s ease-in-out infinite; }
          @keyframes wood-grain { to { stroke-dashoffset: 200; } }
        `}</style>
      </defs>

      {/* ── Fond bois ── */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#wood-bg)" rx="16" />

      {/* Grain bois (lignes diagonales légères) */}
      {Array.from({ length: 18 }, (_, i) => (
        <line
          key={i}
          x1={-100 + i * 60} y1="0"
          x2={i * 60 + SVG_H} y2={SVG_H}
          stroke="#ffffff" strokeOpacity="0.025" strokeWidth="18"
        />
      ))}

      {/* ── Rail central ── */}
      <path
        d={trackPath}
        fill="none"
        stroke="url(#track-grad)"
        strokeWidth={CELL_H + GAP_Y * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bordure rail */}
      <path
        d={trackPath}
        fill="none"
        stroke="#8B5E3C"
        strokeWidth={CELL_H + GAP_Y * 0.9 + 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* ── Cases ── */}
      {cells.map(({ idx, cat }) => {
        const { x, y } = cellPos(idx);
        const special   = getSpecialType(idx);
        const isActive  = idx === activeCellIdx;
        const isFinale  = special === 'finale';
        const isBonus   = special === 'bonus';
        const isMalus   = special === 'malus';

        let fillColor   = CAT_COLORS[cat]?.fill   || '#1a1a2e';
        let strokeColor = CAT_COLORS[cat]?.stroke  || '#444';
        let textColor   = CAT_COLORS[cat]?.text    || '#fff';
        let icon        = CAT_ICONS[cat] || '';
        let label       = CAT_LABELS[cat] || cat.slice(0,3).toUpperCase();

        if (isBonus)  { fillColor = '#3d3300'; strokeColor = '#ffd700'; textColor = '#ffd700'; icon = '⭐'; label = 'SUPER'; }
        if (isMalus)  { fillColor = '#1a0000'; strokeColor = '#cc0000'; textColor = '#ff4444'; icon = '💀'; label = 'MALUS'; }
        if (isFinale) { fillColor = '#1a1200'; strokeColor = '#ffb400'; textColor = '#ffb400'; icon = '🏆'; label = 'FINALE'; }

        // Équipes sur cette case
        const here = teams.filter(t => t.position === idx);

        return (
          <g key={idx} filter={isActive ? 'url(#glow)' : 'url(#cell-shadow)'}>
            {/* Contour animé case active */}
            {isActive && (
              <rect
                className="pulse"
                x={x - 3} y={y - 3}
                width={CELL_W + 6} height={CELL_H + 6}
                rx="10" ry="10"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
            )}

            {/* Corps de la case */}
            <rect
              x={x} y={y}
              width={CELL_W} height={CELL_H}
              rx="8" ry="8"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isActive ? 2.5 : 1.5}
            />

            {/* Bande colorée en haut */}
            <rect
              x={x} y={y}
              width={CELL_W} height={10}
              rx="8" ry="8"
              fill={strokeColor}
              opacity="0.9"
            />
            <rect
              x={x} y={y + 4}
              width={CELL_W} height={6}
              fill={strokeColor}
              opacity="0.9"
            />

            {/* Icône */}
            <text
              x={x + CELL_W / 2} y={y + 28}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isFinale ? 18 : 14}
            >{icon}</text>

            {/* Label catégorie */}
            <text
              x={x + CELL_W / 2} y={y + CELL_H - 9}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontWeight="700"
              fill={textColor} opacity="0.85"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.5"
            >{label}</text>

            {/* Numéro */}
            <text
              x={x + 6} y={y + 14}
              fontSize="8" fill={textColor} opacity="0.5"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="600"
            >{idx + 1}</text>

            {/* Pions */}
            {here.map((team, ti) => {
              const angle  = (2 * Math.PI * ti) / Math.max(here.length, 1);
              const offset = here.length > 1 ? 11 : 0;
              const px = x + CELL_W / 2 + Math.cos(angle) * offset;
              const py = y + CELL_H / 2 + Math.sin(angle) * offset;
              return (
                <g key={team.id}>
                  <circle cx={px} cy={py} r={11} fill={`url(#pg-${team.id})`} stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={px} y={py}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontWeight="800" fill="#fff"
                    fontFamily="Inter, system-ui, sans-serif"
                  >{(team.name || '?')[0].toUpperCase()}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ── Label FINALE en haut ── */}
      {(() => {
        const finalePos = cellPos(55);
        return (
          <text
            x={finalePos.x + CELL_W / 2}
            y={finalePos.y - 12}
            textAnchor="middle"
            fontSize="10" fontWeight="800"
            fill="#ffb400"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="1"
          >HÉSITE PAS À GAGNER</text>
        );
      })()}
    </svg>
  );
}
