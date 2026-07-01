/**
 * Board — plateau serpentin TTMC, style graffiti / vrai plateau physique.
 *
 * Point clé (alignement parfait) : la silhouette du serpent ET la position de
 * chaque case sont générées à partir du MÊME chemin SVG. Les cases sont posées
 * le long du path via getPointAtLength/getTotalLength, et orientées selon la
 * tangente du chemin — aucun décalage possible entre contour et cases.
 */
import { useMemo } from 'react';
import { BOARD_LAYOUT } from '../data/boardLayout.js';
import { CELL_STYLE as STYLE } from '../constants/categories.js';
import { CELL_LABELS as LABEL, GAME_TITLE } from '../constants/labels.js';
import { CellIcon } from '../constants/icons.jsx';

// ── Géométrie ─────────────────────────────────────────────────────────────────
const N_CELLS   = BOARD_LAYOUT.length; // 41
const CELL_LEN  = 58;   // longueur nominale d'une case le long du chemin
const CELL_W    = 66;   // épaisseur du serpent
const ARC_R     = 118;  // rayon des virages (assez large pour éviter le chevauchement)

const PAD_X = ARC_R + CELL_W / 2 + 10;
const PAD_Y_TOP = 64;
const PAD_Y_BOT = 72;

const XL = PAD_X;
const XR = XL + 11 * CELL_LEN;
const SVG_W = Math.ceil(XR + PAD_X);

const Y2 = PAD_Y_TOP + CELL_W / 2;        // rangée haute
const Y1 = Y2 + 2 * ARC_R;                // rangée milieu
const Y0 = Y1 + 2 * ARC_R;                // rangée basse
const SVG_H = Math.ceil(Y0 + CELL_W / 2 + PAD_Y_BOT);

// Chemin central unique du serpent (DÉPART bas-droite → FINALE haut-gauche)
function buildSnakePath() {
  return [
    `M ${XR} ${Y0}`,
    `L ${XL} ${Y0}`,
    `A ${ARC_R} ${ARC_R} 0 0 0 ${XL} ${Y1}`,
    `L ${XR} ${Y1}`,
    `A ${ARC_R} ${ARC_R} 0 0 1 ${XR} ${Y2}`,
    `L ${XL} ${Y2}`,
  ].join(' ');
}

// ── Contraste : texte noir ou blanc selon la luminance du fond ──────────────
function readableText(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // luminance relative (sRGB approximée)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

// ── Positions le long du path (même courbe que la silhouette) ───────────────
function computePositions(pathD, n) {
  if (typeof document === 'undefined') return [];
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathD);
  const total = path.getTotalLength();
  const pts = [];
  for (let i = 0; i < n; i++) {
    const len = ((i + 0.5) / n) * total;
    const p = path.getPointAtLength(len);
    const p2 = path.getPointAtLength(Math.min(len + 1, total));
    let angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
    pts.push({ cx: p.x, cy: p.y, angleDeg: angle });
  }
  return pts;
}

// Éclaboussures décoratives
const SPLATTERS = [
  { cx: 82,  cy: 60,  rx: 20, ry: 14, rot: 20,  fill: '#CC2222', op: 0.5 },
  { cx: SVG_W - 70, cy: 110, rx: 18, ry: 13, rot: -15, fill: '#F5D020', op: 0.45 },
  { cx: 65,  cy: 250, rx: 22, ry: 15, rot: 35,  fill: '#8B50CC', op: 0.4 },
  { cx: SVG_W - 60, cy: 320, rx: 20, ry: 12, rot: -25, fill: '#7BBF42', op: 0.4 },
  { cx: 130, cy: 420, rx: 25, ry: 12, rot: 45,  fill: '#111',    op: 0.55 },
];

export default function Board({ teams, currentTeamIdx, activeCellIdx, layout }) {
  const snakePath = useMemo(() => buildSnakePath(), []);
  const positions = useMemo(() => computePositions(snakePath, N_CELLS), [snakePath]);
  const cells = layout || BOARD_LAYOUT;

  if (!positions.length) return null;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
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

      {/* Fond bois */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#wood)" rx="10"/>
      <rect x="0" y="0" width={SVG_W} height={SVG_H} rx="10"
            fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="30"/>

      {/* Éclaboussures */}
      {SPLATTERS.map((s, i) => (
        <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
          fill={s.fill} opacity={s.op}
          transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
        />
      ))}

      {/* Silhouette du serpent (MÊME path que les cases) */}
      <path d={snakePath} fill="none"
            stroke="#3a2008" strokeWidth={CELL_W + 28}
            strokeLinecap="round" strokeLinejoin="round"/>
      <path d={snakePath} fill="none"
            stroke="#111" strokeWidth={CELL_W + 14}
            strokeLinecap="round" strokeLinejoin="round"/>

      {/* Cases */}
      {cells.map((cell, idx) => {
        const { cx, cy, angleDeg } = positions[idx];
        const isActive  = idx === activeCellIdx;
        const isFinale  = cell.type === 'finale';
        const styleKey  = cell.type === 'cat' ? cell.cat : cell.type;
        const s         = STYLE[styleKey] || STYLE.Scolaire;
        const textCol   = readableText(s.fill);
        const rawLabel  = cell.custom
          ? cell.name.toUpperCase()
          : (LABEL[styleKey] || styleKey.toUpperCase());
        const lines     = rawLabel.split('\n');
        const CL = isFinale ? CELL_LEN * 1.4 : CELL_LEN;
        const CW = isFinale ? CELL_W * 1.35  : CELL_W;

        // Taille de police adaptative : tient compte de la longueur du mot le plus long
        const longest = Math.max(...lines.map(l => l.length));
        const fitSize = Math.max(6.5, Math.min(isFinale ? 9.5 : 9, (CL - 8) / (longest * 0.62)));

        const here = teams.filter(t => t.position === idx);

        return (
          <g key={idx}
             transform={`translate(${cx},${cy}) rotate(${angleDeg})`}
             filter={isFinale ? 'url(#finale-glow)' : isActive ? 'url(#glow)' : 'url(#shadow)'}
          >
            {isActive && (
              <rect className="pulse"
                x={-CL/2 - 6} y={-CW/2 - 6} width={CL + 12} height={CW + 12}
                rx="10" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="8 4"
              />
            )}

            <rect x={-CL/2} y={-CW/2} width={CL} height={CW}
                  fill={s.fill} stroke={s.border}
                  strokeWidth={isFinale ? 4 : 3} rx="6"/>

            {/* Contenu CONTRE-ROTATÉ pour rester lisible quel que soit le virage */}
            <g transform={`rotate(${-angleDeg})`} color={textCol}>
              <g transform="translate(0,-10) scale(0.8)">
                <CellIcon typeKey={styleKey}/>
              </g>

              {lines.map((line, li) => {
                const totalLines = lines.length;
                const lineH = fitSize + 1.5;
                const baseY = CW / 2 - 11;
                const offsetY = totalLines === 2
                  ? baseY - (totalLines - 1) * lineH / 2 + li * lineH
                  : baseY;
                return (
                  <text key={li}
                    x={0} y={offsetY}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={fitSize}
                    fontWeight="900"
                    fill={textCol}
                    fontFamily="'Bangers', Impact, sans-serif"
                    letterSpacing="0.4"
                    style={{
                      paintOrder: 'stroke',
                      stroke: textCol === '#fff' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.6)',
                      strokeWidth: 2.6,
                      strokeLinejoin: 'round',
                    }}
                  >{line}</text>
                );
              })}

              {!isFinale && (
                <text x={-CL/2 + 4} y={-CW/2 + 8}
                      fontSize="6.5" fill={textCol} opacity="0.55"
                      fontFamily="Inter, sans-serif" fontWeight="700">
                  {idx + 1}
                </text>
              )}

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

      {/* Ticket DÉPART */}
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
                  fontFamily="Inter, sans-serif" letterSpacing="0.5">LIGNE DE</text>
            <text x="0" y="10" textAnchor="middle"
                  fontSize="12" fill="#3a1a00" fontWeight="900"
                  fontFamily="'Bangers', Impact, sans-serif" letterSpacing="1">DÉPART</text>
          </g>
        );
      })()}

      {/* Bannière étoile FINALE */}
      {(() => {
        const { cx, cy } = positions[N_CELLS - 1];
        const sy = cy - CELL_W / 2 - 22;
        return (
          <g transform={`translate(${cx}, ${sy})`}>
            <path d="M0-18 L5-7 L18-7 L8 1 L12 13 L0 6 L-12 13 L-8 1 L-18-7 L-5-7z"
                  fill="#87CEEB" stroke="#111" strokeWidth="2.5"/>
          </g>
        );
      })()}

      {/* Logo — encart auto-dimensionné, centré */}
      <g transform={`translate(${SVG_W - 132}, 8)`}>
        <rect x="0" y="0" width="124" height="44" rx="8" fill="#111" opacity="0.8"
              stroke="#F5D020" strokeOpacity="0.55" strokeWidth="1.5"/>
        <text x="62" y="19" textAnchor="middle" dominantBaseline="middle"
              fontSize="20" fontWeight="900" fill="#fff"
              fontFamily="'Bangers', Impact, sans-serif" letterSpacing="1.5">{GAME_TITLE.short_logo}</text>
        <text x="62" y="34" textAnchor="middle" dominantBaseline="middle"
              fontSize="6" fontWeight="700" fill="#F5D020"
              fontFamily="Inter, sans-serif" letterSpacing="0.5">{GAME_TITLE.tagline}</text>
      </g>
    </svg>
  );
}
