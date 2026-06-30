/**
 * Board — plateau serpentin TTMC, 41 cases, 4 rangées + finale.
 * Chemin serpentin SVG avec virages bézier arrondis.
 */
import { useMemo } from 'react';
import { CAT_COLORS, SPECIAL_CELLS } from '../store/gameStore.js';

// ─── Layout ───────────────────────────────────────────────────────────────────
const TOTAL      = 41;
const PER_ROW    = 10;   // cases par rangée (4 rangées × 10 + finale)
const CELL_W     = 56;
const CELL_H     = 52;
const ROW_GAP    = 58;   // espace vertical centre-à-centre entre rangées

const XL  = 60;                            // bord gauche des rangées
const XR  = XL + PER_ROW * CELL_W;        // bord droit
const SVG_W = XR + 60;

// Centre Y de chaque rangée (0 = bas = départ)
const RY = [540, 540 - ROW_GAP, 540 - ROW_GAP * 2, 540 - ROW_GAP * 3];
const SVG_H = RY[3] - 60 + 60 * 2;       // un peu de marge en haut/bas

// Rayon bézier du virage (demi-gap + un peu)
const TURN_BUL = 46;

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

// Position du coin supérieur gauche de la case idx
function cellPos(idx) {
  if (idx >= TOTAL - 1) {
    // Finale : centrée au-dessus de la dernière rangée
    const cx = XL + PER_ROW * CELL_W / 2;
    const cy = RY[3] - ROW_GAP;
    return { x: cx - CELL_W / 2, y: cy - CELL_H / 2 };
  }
  const row    = Math.floor(idx / PER_ROW);   // 0-3
  const posRow = idx % PER_ROW;
  const goRight = row % 2 === 0;
  const col = goRight ? posRow : (PER_ROW - 1 - posRow);
  return {
    x: XL + col * CELL_W,
    y: RY[row] - CELL_H / 2,
  };
}

// Chemin SVG du serpent (fond)
function buildTrackPath() {
  const parts = [];

  for (let row = 0; row < 4; row++) {
    const y       = RY[row];
    const goRight = row % 2 === 0;
    const x0      = goRight ? XL : XR;
    const x1      = goRight ? XR : XL;

    if (row === 0) parts.push(`M ${x0} ${y}`);
    parts.push(`L ${x1} ${y}`);

    if (row < 3) {
      const yNext = RY[row + 1];
      const yMid  = (y + yNext) / 2;
      const bulge = goRight ? XR + TURN_BUL : XL - TURN_BUL;
      // Bézier quadratique : Q cx cy  x1 y1
      parts.push(`Q ${bulge} ${yMid} ${x1} ${yNext}`);
    }
  }

  // Tige vers la case finale
  const finalPos = cellPos(40);
  const fx = finalPos.x + CELL_W / 2;
  const fy = finalPos.y + CELL_H;
  parts.push(`L ${fx} ${fy}`);

  return parts.join(' ');
}

export default function Board({ teams, currentTeamIdx, activeCellIdx }) {
  const cells = useMemo(() =>
    Array.from({ length: TOTAL }, (_, i) => {
      const CATS = ['Scolaire', 'Plaisir', 'Mature', 'Improbable'];
      return { idx: i, cat: CATS[i % CATS.length] };
    }),
  []);

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

        {/* Rail sombre */}
        <linearGradient id="track-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#120c04" />
          <stop offset="100%" stopColor="#0d0804" />
        </linearGradient>

        {/* Pions */}
        {teams.map(t => (
          <radialGradient key={t.id} id={`pg-${t.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor={t.color}  stopOpacity="1" />
          </radialGradient>
        ))}

        <filter id="cell-shadow" x="-10%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
        </filter>

        <filter id="glow" x="-20%" y="-25%" width="150%" height="155%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fff" floodOpacity="0.7" />
        </filter>

        <filter id="finale-glow" x="-30%" y="-30%" width="160%" height="165%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#ffb400" floodOpacity="0.8" />
        </filter>

        <style>{`
          @keyframes pulse-ring {
            0%   { stroke-opacity: 1; stroke-width: 3; }
            50%  { stroke-opacity: 0.3; stroke-width: 6; }
            100% { stroke-opacity: 1; stroke-width: 3; }
          }
          .pulse { animation: pulse-ring 1.2s ease-in-out infinite; }
          @keyframes spin-star {
            from { transform-origin: center; transform: rotate(0deg); }
            to   { transform-origin: center; transform: rotate(360deg); }
          }
          .spin { animation: spin-star 8s linear infinite; }
        `}</style>
      </defs>

      {/* ── Fond bois ── */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#wood-bg)" rx="16" />

      {/* Grain bois */}
      {Array.from({ length: 20 }, (_, i) => (
        <line
          key={i}
          x1={-120 + i * 55} y1="0"
          x2={i * 55 + SVG_H} y2={SVG_H}
          stroke="#ffffff" strokeOpacity="0.02" strokeWidth="20"
        />
      ))}

      {/* ── Corps du serpent (fond) ── */}
      <path
        d={trackPath}
        fill="none"
        stroke="url(#track-grad)"
        strokeWidth={CELL_H + 20}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bordure bois dorée */}
      <path
        d={trackPath}
        fill="none"
        stroke="#8B5E3C"
        strokeWidth={CELL_H + 26}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
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
        let label       = CAT_LABELS[cat] || '';

        if (isBonus)  { fillColor = '#2e2500'; strokeColor = '#ffd700'; textColor = '#ffd700'; icon = '⭐'; label = 'SUPER'; }
        if (isMalus)  { fillColor = '#180000'; strokeColor = '#cc0000'; textColor = '#ff4444'; icon = '💀'; label = 'MALUS'; }
        if (isFinale) { fillColor = '#1a1200'; strokeColor = '#ffb400'; textColor = '#ffb400'; icon = '🏆'; label = 'FINALE'; }

        const cw = isFinale ? CELL_W + 16 : CELL_W;
        const ch = isFinale ? CELL_H + 16 : CELL_H;
        const cx = x + (isFinale ? -8 : 0);
        const cy = y + (isFinale ? -8 : 0);

        const here = teams.filter(t => t.position === idx);

        return (
          <g key={idx} filter={isFinale ? 'url(#finale-glow)' : isActive ? 'url(#glow)' : 'url(#cell-shadow)'}>
            {/* Anneau animé case active */}
            {isActive && (
              <rect
                className="pulse"
                x={cx - 4} y={cy - 4}
                width={cw + 8} height={ch + 8}
                rx="11" ry="11"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeDasharray="8 4"
              />
            )}

            {/* Corps */}
            <rect
              x={cx} y={cy}
              width={cw} height={ch}
              rx="8" ry="8"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isActive || isFinale ? 2.5 : 1.5}
            />

            {/* Bande colorée haut */}
            <rect x={cx} y={cy} width={cw} height={10} rx="8" ry="8" fill={strokeColor} opacity="0.9" />
            <rect x={cx} y={cy + 4} width={cw} height={6} fill={strokeColor} opacity="0.9" />

            {/* Icône */}
            <text
              x={cx + cw / 2} y={cy + ch / 2 - 4}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isFinale ? 22 : 15}
            >{icon}</text>

            {/* Label */}
            <text
              x={cx + cw / 2} y={cy + ch - 9}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isFinale ? 10 : 8} fontWeight="800"
              fill={textColor} opacity="0.9"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.5"
            >{label}</text>

            {/* Numéro */}
            {!isFinale && (
              <text
                x={cx + 5} y={cy + 13}
                fontSize="7" fill={textColor} opacity="0.45"
                fontFamily="Inter, system-ui, sans-serif" fontWeight="700"
              >{idx + 1}</text>
            )}

            {/* Pions */}
            {here.map((team, ti) => {
              const angle  = (2 * Math.PI * ti) / Math.max(here.length, 1);
              const offset = here.length > 1 ? 10 : 0;
              const px = cx + cw / 2 + Math.cos(angle) * offset;
              const py = cy + ch / 2 + Math.sin(angle) * offset;
              return (
                <g key={team.id}>
                  <circle cx={px} cy={py} r={10} fill={`url(#pg-${team.id})`} stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={px} y={py}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="8" fontWeight="800" fill="#fff"
                    fontFamily="Inter, system-ui, sans-serif"
                  >{(team.name || '?')[0].toUpperCase()}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Label départ */}
      {(() => {
        const { x, y } = cellPos(0);
        return (
          <text
            x={x + CELL_W / 2} y={y + CELL_H + 16}
            textAnchor="middle"
            fontSize="10" fontWeight="800"
            fill="#00e87a"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="1"
          >DÉPART</text>
        );
      })()}

      {/* Label FINALE */}
      {(() => {
        const pos = cellPos(40);
        return (
          <text
            x={pos.x + CELL_W / 2} y={pos.y - 10}
            textAnchor="middle"
            fontSize="9" fontWeight="800"
            fill="#ffb400"
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="1"
          >HÉSITE PAS À GAGNER</text>
        );
      })()}
    </svg>
  );
}
