/**
 * Board — plateau serpentin TTMC, style graffiti / vrai plateau physique.
 * Layout paysage : 3 rangées × 11 cases + 2 virages × 4 cases = 41 cases.
 */
import { useMemo } from 'react';
import { BOARD_LAYOUT } from '../data/boardLayout.js';

// ── Géométrie ─────────────────────────────────────────────────────────────────
const N_STRAIGHT = 11;   // cases par rangée droite
const N_ARC      = 4;    // cases par virage
const CELL_LEN   = 60;   // longueur case dans le sens du chemin
const CELL_W     = 74;   // largeur (épaisseur du serpent)
const ARC_R      = 70;   // rayon des virages

// Marges de sécurité pour que les arcs ne sortent pas du SVG
const PAD_X = ARC_R + CELL_W / 2 + 10;
const PAD_Y_TOP = 64;    // logo + banière finale au-dessus
const PAD_Y_BOT = 72;    // ticket départ en dessous

const XL = PAD_X;
const XR = XL + N_STRAIGHT * CELL_LEN;          // ~770
const SVG_W = Math.ceil(XR + PAD_X);             // ~850

const Y2 = PAD_Y_TOP + CELL_W / 2;              // rangée haute  ~101
const Y1 = Y2 + 2 * ARC_R;                      // rangée milieu ~241
const Y0 = Y1 + 2 * ARC_R;                      // rangée basse  ~381
const SVG_H = Math.ceil(Y0 + CELL_W / 2 + PAD_Y_BOT);  // ~490

// ── Couleurs proches du vrai plateau ─────────────────────────────────────────
const STYLE = {
  Mature:     { fill: '#7BA7D4', border: '#111', text: '#fff' },
  Scolaire:   { fill: '#7BBF42', border: '#111', text: '#fff' },
  Plaisir:    { fill: '#F27E1B', border: '#111', text: '#fff' },
  Improbable: { fill: '#8B50CC', border: '#111', text: '#fff' },
  bonus:      { fill: '#F5D020', border: '#111', text: '#111' },
  malus:      { fill: '#111',    border: '#555', text: '#fff' },
  challenge:  { fill: '#CC2222', border: '#111', text: '#fff' },
  finale:     { fill: '#87CEEB', border: '#111', text: '#111' },
};

const LABEL = {
  Mature:    'MATURE',     Scolaire:  'SCOLAIRE',
  Plaisir:   'PLAISIR',   Improbable:'IMPROBABLE',
  bonus:     "C'EST\nSUPERBE",  malus: "ÇA VA\nPAS DU TOUT",
  challenge: 'CHALLENGE', finale:    "HÉSITE PAS\nÀ GAGNER",
};

// Icônes SVG inline blanches (style pochoir)
function Icon({ typeKey }) {
  const s = { stroke: 'currentColor', strokeWidth: '2', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (typeKey === 'Mature')     return <g {...s}><rect x="-9" y="-11" width="18" height="22" rx="2"/><line x1="-6" y1="-5" x2="6" y2="-5"/><line x1="-6" y1="0" x2="6" y2="0"/><line x1="-6" y1="5" x2="4" y2="5"/></g>;
  if (typeKey === 'Scolaire')   return <g {...s}><rect x="-10" y="-7" width="20" height="14" rx="2"/><rect x="-10" y="-11" width="7" height="5" rx="1"/><rect x="-1" y="-11" width="7" height="5" rx="1"/><line x1="-7" y1="-2" x2="7" y2="-2"/><line x1="-7" y1="2" x2="5" y2="2"/></g>;
  if (typeKey === 'Plaisir')    return <g {...s}><rect x="-11" y="-7" width="6" height="14" rx="1"/><rect x="-5" y="-9" width="10" height="18" rx="2"/><rect x="5" y="-7" width="6" height="14" rx="1"/><circle cx="0" cy="0" r="3"/></g>;
  if (typeKey === 'Improbable') return <g {...s}><ellipse cx="0" cy="-3" rx="7" ry="9"/><rect x="-5" y="5" width="10" height="5" rx="1"/><line x1="-3" y1="10" x2="3" y2="10"/></g>;
  if (typeKey === 'challenge')  return <g fill="currentColor"><path d="M-3-13 h8 L-1-1 h7 L-7 13 L-1 1 h-8z"/></g>;
  if (typeKey === 'bonus')      return <g fill="currentColor"><path d="M0-12 L3-4 L12-4 L5 2 L7 11 L0 6 L-7 11 L-5 2 L-12-4 L-3-4z"/></g>;
  if (typeKey === 'malus')      return <g {...s}><circle cx="0" cy="0" r="10"/><line x1="-7" y1="-7" x2="7" y2="7"/><line x1="7" y1="-7" x2="-7" y2="7"/></g>;
  if (typeKey === 'finale')     return <g fill="currentColor"><path d="M0-13 L4-4 L14-4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14-4 L-4-4z"/></g>;
  return null;
}

// ── Calcul des 41 positions ───────────────────────────────────────────────────
function buildPositions() {
  const pts = [];

  // Row 0 : droite → gauche (idx 0-10)
  for (let i = 0; i < N_STRAIGHT; i++) {
    pts.push({ cx: XR - (i + 0.5) * CELL_LEN, cy: Y0, angleDeg: 180 });
  }

  // Arc gauche (idx 11-14) : (XL,Y0) going LEFT → (XL,Y1) going RIGHT
  const m01 = (Y0 + Y1) / 2;
  for (let k = 0; k < N_ARC; k++) {
    const t = Math.PI * (k + 1) / (N_ARC + 1);
    pts.push({
      cx: XL - ARC_R * Math.sin(t),
      cy: m01 + ARC_R * Math.cos(t),
      angleDeg: Math.atan2(-Math.sin(t), -Math.cos(t)) * 180 / Math.PI,
    });
  }

  // Row 1 : gauche → droite (idx 15-25)
  for (let i = 0; i < N_STRAIGHT; i++) {
    pts.push({ cx: XL + (i + 0.5) * CELL_LEN, cy: Y1, angleDeg: 0 });
  }

  // Arc droit (idx 26-29) : (XR,Y1) going RIGHT → (XR,Y2) going LEFT
  const m12 = (Y1 + Y2) / 2;
  for (let k = 0; k < N_ARC; k++) {
    const t = Math.PI * (k + 1) / (N_ARC + 1);
    pts.push({
      cx: XR + ARC_R * Math.sin(t),
      cy: m12 + ARC_R * Math.cos(t),
      angleDeg: Math.atan2(-Math.sin(t), Math.cos(t)) * 180 / Math.PI,
    });
  }

  // Row 2 : droite → gauche (idx 30-40, FINALE à gauche)
  for (let i = 0; i < N_STRAIGHT; i++) {
    pts.push({ cx: XR - (i + 0.5) * CELL_LEN, cy: Y2, angleDeg: 180 });
  }

  return pts; // 11+4+11+4+11 = 41
}

// Chemin SVG de la ligne centrale du serpent
function buildSnakePath() {
  const m01 = (Y0 + Y1) / 2;
  const m12 = (Y1 + Y2) / 2;
  return [
    `M ${XR} ${Y0}`,
    `L ${XL} ${Y0}`,
    `A ${ARC_R} ${ARC_R} 0 0 0 ${XL} ${Y1}`,
    `L ${XR} ${Y1}`,
    `A ${ARC_R} ${ARC_R} 0 0 1 ${XR} ${Y2}`,
    `L ${XL} ${Y2}`,
  ].join(' ');
}

// Quelques éclaboussures de peinture
const SPLATTERS = [
  { cx: 82,  cy: 60,  rx: 20, ry: 14, rot: 20,  fill: '#CC2222', op: 0.5 },
  { cx: SVG_W - 70, cy: 110, rx: 18, ry: 13, rot: -15, fill: '#F5D020', op: 0.45 },
  { cx: 65,  cy: 250, rx: 22, ry: 15, rot: 35,  fill: '#8B50CC', op: 0.4 },
  { cx: SVG_W - 60, cy: 320, rx: 20, ry: 12, rot: -25, fill: '#7BBF42', op: 0.4 },
  { cx: 130, cy: 420, rx: 25, ry: 12, rot: 45,  fill: '#111',    op: 0.55 },
];

export default function Board({ teams, currentTeamIdx, activeCellIdx, layout }) {
  const positions = useMemo(() => buildPositions(), []);
  const snakePath = useMemo(() => buildSnakePath(), []);
  const cells = layout || BOARD_LAYOUT;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Fond bois */}
        <linearGradient id="wood-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c8883c"/>
          <stop offset="50%"  stopColor="#a86828"/>
          <stop offset="100%" stopColor="#8a5020"/>
        </linearGradient>
        <pattern id="wood" x="0" y="0" width="80" height="240" patternUnits="userSpaceOnUse">
          <rect width="80" height="240" fill="url(#wood-base)"/>
          <path d="M0 40 Q40 46 80 38 M0 100 Q40 108 80 95 M0 160 Q40 166 80 154 M0 220 Q40 225 80 215"
                stroke="#7a4515" strokeOpacity="0.3" strokeWidth="2.5" fill="none"/>
          <path d="M0 70 Q40 74 80 66 M0 130 Q40 137 80 124 M0 190 Q40 195 80 183"
                stroke="#d89840" strokeOpacity="0.2" strokeWidth="1.5" fill="none"/>
        </pattern>

        <filter id="shadow" x="-15%" y="-20%" width="135%" height="145%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
        </filter>
        <filter id="glow" x="-25%" y="-30%" width="150%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#fff" floodOpacity="0.9"/>
        </filter>
        <filter id="finale-glow" x="-30%" y="-35%" width="160%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#87CEEB" floodOpacity="1"/>
        </filter>

        {teams.map(t => (
          <radialGradient key={t.id} id={`pg-${t.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.85"/>
            <stop offset="100%" stopColor={t.color} stopOpacity="1"/>
          </radialGradient>
        ))}

        <style>{`
          @keyframes pulse {
            0%,100% { stroke-opacity:1; stroke-width:4; }
            50%      { stroke-opacity:0.25; stroke-width:8; }
          }
          .pulse { animation: pulse 1.2s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── Fond bois ── */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#wood)" rx="10"/>
      {/* Vignette sombre sur les bords */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="10"
            fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="30"/>

      {/* ── Éclaboussures ── */}
      {SPLATTERS.map((s, i) => (
        <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
          fill={s.fill} opacity={s.op}
          transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
        />
      ))}

      {/* ── Serpent fond sombre + bordure ── */}
      <path d={snakePath} fill="none"
            stroke="#3a2008" strokeWidth={CELL_W + 28}
            strokeLinecap="round" strokeLinejoin="round"/>
      <path d={snakePath} fill="none"
            stroke="#111" strokeWidth={CELL_W + 14}
            strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── Cases ── */}
      {cells.map((cell, idx) => {
        const { cx, cy, angleDeg } = positions[idx];
        const isActive  = idx === activeCellIdx;
        const isFinale  = cell.type === 'finale';
        const styleKey  = cell.type === 'cat' ? cell.cat : cell.type;
        const s         = STYLE[styleKey] || STYLE.Scolaire;
        const rawLabel  = cell.custom
          ? cell.name.toUpperCase()
          : (LABEL[styleKey] || styleKey.toUpperCase());
        const lines     = rawLabel.split('\n');
        const CL = isFinale ? CELL_LEN * 1.4 : CELL_LEN;
        const CW = isFinale ? CELL_W * 1.35  : CELL_W;

        const here = teams.filter(t => t.position === idx);

        return (
          <g key={idx}
             transform={`translate(${cx},${cy}) rotate(${angleDeg})`}
             filter={isFinale ? 'url(#finale-glow)' : isActive ? 'url(#glow)' : 'url(#shadow)'}
          >
            {/* Anneau pulsant case active */}
            {isActive && (
              <rect className="pulse"
                x={-CL/2 - 6} y={-CW/2 - 6} width={CL + 12} height={CW + 12}
                rx="10" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="8 4"
              />
            )}

            {/* Corps */}
            <rect x={-CL/2} y={-CW/2} width={CL} height={CW}
                  fill={s.fill} stroke={s.border}
                  strokeWidth={isFinale ? 4 : 3} rx="6"/>

            {/* Tout le contenu textuel est CONTRE-ROTATÉ pour être toujours lisible */}
            <g transform={`rotate(${-angleDeg})`} color={s.text}>

              {/* Icône */}
              <g transform="translate(0,-9) scale(0.82)">
                <Icon typeKey={styleKey}/>
              </g>

              {/* Labels (1 ou 2 lignes) */}
              {lines.map((line, li) => {
                const totalLines = lines.length;
                const lineH = 10;
                const baseY = CW / 2 - 10;
                const offsetY = totalLines === 2
                  ? baseY - (totalLines - 1) * lineH / 2 + li * lineH
                  : baseY;
                return (
                  <text key={li}
                    x={0} y={offsetY}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={isFinale ? 9 : styleKey === 'Improbable' ? 7 : 8.5}
                    fontWeight="900"
                    fill={s.text}
                    fontFamily="'Bangers', Impact, sans-serif"
                    letterSpacing="0.5"
                    style={{
                      paintOrder: 'stroke',
                      stroke: s.border,
                      strokeWidth: 3,
                      strokeLinejoin: 'round',
                    }}
                  >{line}</text>
                );
              })}

              {/* Numéro */}
              {!isFinale && (
                <text x={-CL/2 + 4} y={-CW/2 + 8}
                      fontSize="6.5" fill={s.text} opacity="0.5"
                      fontFamily="Inter, sans-serif" fontWeight="700">
                  {idx + 1}
                </text>
              )}

              {/* Pions */}
              {here.map((team, ti) => {
                const angle  = (2 * Math.PI * ti) / Math.max(here.length, 1);
                const offset = here.length > 1 ? 12 : 0;
                const px = Math.cos(angle) * offset;
                const py = Math.sin(angle) * offset;
                return (
                  <g key={team.id} transform={`translate(${px},${py})`}>
                    <circle r="11" fill={`url(#pg-${team.id})`}
                            stroke="#fff" strokeWidth="2"/>
                    <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle"
                          fontSize="8" fontWeight="800" fill="#fff"
                          fontFamily="Inter, sans-serif">
                      {(team.name || '?')[0].toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}

      {/* ── Ticket DÉPART (en dessous de la case 0) ── */}
      {(() => {
        const { cx, cy } = positions[0];
        return (
          <g transform={`translate(${cx + 8}, ${cy + CELL_W / 2 + 24})`}>
            <rect x="-50" y="-22" width="100" height="44"
                  rx="6" fill="#f5e8c0" stroke="#8a6820" strokeWidth="2"/>
            <line x1="-50" y1="2" x2="50" y2="2"
                  stroke="#8a6820" strokeWidth="1" strokeDasharray="4 3"/>
            <text x="0" y="-8" textAnchor="middle"
                  fontSize="6.5" fill="#8a6820" fontWeight="700"
                  fontFamily="Inter, sans-serif" letterSpacing="0.5">HÉSITE PAS À</text>
            <text x="0" y="10" textAnchor="middle"
                  fontSize="12" fill="#3a1a00" fontWeight="900"
                  fontFamily="'Bangers', Impact, sans-serif" letterSpacing="1">DÉBUTER</text>
          </g>
        );
      })()}

      {/* ── Bannière étoile FINALE ── */}
      {(() => {
        const { cx, cy } = positions[40];
        const sy = cy - CELL_W / 2 - 22;
        return (
          <g transform={`translate(${cx}, ${sy})`}>
            <path d="M0-18 L5-7 L18-7 L8 1 L12 13 L0 6 L-12 13 L-8 1 L-18-7 L-5-7z"
                  fill="#87CEEB" stroke="#111" strokeWidth="2.5"/>
          </g>
        );
      })()}

      {/* ── Logo TTMC ── */}
      <g transform={`translate(${SVG_W - 8}, 8)`}>
        <rect x="-84" y="0" width="84" height="40" rx="7" fill="#111" opacity="0.72"/>
        <text x="-42" y="15" textAnchor="middle"
              fontSize="20" fontWeight="900" fill="#fff"
              fontFamily="'Bangers', Impact, sans-serif" letterSpacing="2">TTMC ?</text>
        <text x="-42" y="30" textAnchor="middle"
              fontSize="7.5" fontWeight="700" fill="#F5D020"
              fontFamily="Inter, sans-serif" letterSpacing="0.5">COMBIEN TE METS-TU ?</text>
      </g>
    </svg>
  );
}
