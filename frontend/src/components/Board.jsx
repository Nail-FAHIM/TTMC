/**
 * Board — plateau serpentin TTMC façon vrai plateau physique.
 * Style graffiti sur fond bois, 41 cases, virages bézier.
 */
import { useMemo } from 'react';
import { BOARD_LAYOUT } from '../data/boardLayout.js';

// ── Géométrie du serpent ──────────────────────────────────────────────────────
const CELL_LEN = 60;     // longueur d'une case dans le sens du chemin
const CELL_W   = 74;     // largeur (épaisseur du serpent)
// Rayon du demi-cercle tel que 3 cases le remplissent exactement
const ARC_R    = Math.round(CELL_LEN * 3 / Math.PI); // ≈ 57

const XL  = ARC_R + CELL_W / 2 + 8;   // bord gauche du chemin
const XR  = XL + 8 * CELL_LEN;        // bord droit
const SVG_W = Math.ceil(XR + ARC_R + CELL_W / 2 + 8);

// Centres Y des rangées (du bas vers le haut en coordonnées SVG)
const Y0 = 850;
const Y1 = Y0 - 2 * ARC_R;
const Y2 = Y1 - 2 * ARC_R;
const Y3 = Y2 - 2 * ARC_R;
const SVG_H = Y0 + CELL_W / 2 + 60;  // +60 pour ticket départ en bas

// ── Couleurs (proches du vrai plateau) ───────────────────────────────────────
const TYPE_STYLE = {
  Mature:     { fill: '#7BA7D4', border: '#1a1a1a', text: '#fff' },
  Scolaire:   { fill: '#79BC43', border: '#1a1a1a', text: '#fff' },
  Plaisir:    { fill: '#F5821F', border: '#1a1a1a', text: '#fff' },
  Improbable: { fill: '#9060C8', border: '#1a1a1a', text: '#fff' },
  bonus:      { fill: '#F5D020', border: '#1a1a1a', text: '#1a1a1a' },
  malus:      { fill: '#111',    border: '#444',    text: '#fff'    },
  challenge:  { fill: '#CC2222', border: '#1a1a1a', text: '#fff'    },
  finale:     { fill: '#87CEEB', border: '#1a1a1a', text: '#1a1a1a' },
};

const TYPE_LABEL = {
  Mature:     'MATURE',    Scolaire:  'SCOLAIRE',
  Plaisir:    'PLAISIR',   Improbable:'IMPROBABLE',
  bonus:      "C'EST\nSUPERBE", malus: 'ÇA VA PAS\nDU TOUT',
  challenge:  'CHALLENGE', finale: 'HÉSITE PAS\nÀ GAGNER',
};

// Icônes blanches inline (SVG path en style pochoir)
function CatIcon({ type, cat }) {
  const key = type === 'cat' ? cat : type;
  const icons = {
    Mature:     <path d="M-10-12 h20 v24 h-20z M-8-10 h16 M-8-5 h16 M-8 0 h16 M-8 5 h12" stroke="#fff" strokeWidth="1.5" fill="none"/>,
    Scolaire:   <path d="M-11-8 h22 v18 h-22z M-7-4 h14 M-7 0 h14 M-7 4 h10 M-11-12 h7 v4 h-7z M0-12 h7 v4 H0z" stroke="#fff" strokeWidth="1.5" fill="none"/>,
    Plaisir:    <><path d="M-12-8 h6 v16 h-6z M-6-6 h18 v12 h-18z M12-8 h6 v16 h-6z" stroke="#fff" strokeWidth="1.5" fill="none"/><circle cx="0" cy="0" r="3" stroke="#fff" strokeWidth="1.5" fill="none"/></>,
    Improbable: <><path d="M0-12 v4 M0 8 v4 M-8-8 C-12-4 -12 4 -8 8 C-4 12 4 12 8 8 C12 4 12-4 8-8 C4-12 -4-12 -8-8z" stroke="#fff" strokeWidth="1.5" fill="none"/><path d="M-4-4 h8 v4 h-8z" stroke="#fff" strokeWidth="1.2" fill="none"/></>,
    bonus:      <path d="M0-14 L3.5-4 L14-4 L5 2 L8 13 L0 7 L-8 13 L-5 2 L-14-4 L-3.5-4z" stroke="#1a1a1a" strokeWidth="1.5" fill="#F5D020"/>,
    malus:      <path d="M0-12 C8-10 14-4 12 4 C10 10 4 14-4 12 C-10 10-14 4-12-4 C-10-10-4-14 0-12z M-6-2 h12 M0-8 v12" stroke="#fff" strokeWidth="2" fill="none"/>,
    challenge:  <path d="M-4-14 h10 L0-2 h8 L-6 14 L-2 2 h-9z" stroke="#fff" strokeWidth="1.5" fill="#fff"/>,
    finale:     <path d="M0-14 L4-4 L14-4 L6 2 L9 13 L0 7 L-9 13 L-6 2 L-14-4 L-4-4z" stroke="#1a1a1a" strokeWidth="1.5" fill="#1a1a1a"/>,
  };
  return icons[key] || null;
}

// ── Positions de toutes les cases ─────────────────────────────────────────────
function buildPositions() {
  const pts = [];

  // Row 0 : droite → gauche (idx 0-7)
  for (let i = 0; i < 8; i++) {
    pts.push({ cx: XR - (i + 0.5) * CELL_LEN, cy: Y0, angleDeg: 180 });
  }

  // Arc gauche (idx 8-10) : (XL,Y0) going LEFT → (XL,Y1) going RIGHT
  const m01 = (Y0 + Y1) / 2;
  for (let k = 0; k < 3; k++) {
    const t = Math.PI * (k + 1) / 4;
    pts.push({
      cx: XL - ARC_R * Math.sin(t),
      cy: m01 + ARC_R * Math.cos(t),
      angleDeg: Math.atan2(-Math.sin(t), -Math.cos(t)) * 180 / Math.PI,
    });
  }

  // Row 1 : gauche → droite (idx 11-18)
  for (let i = 0; i < 8; i++) {
    pts.push({ cx: XL + (i + 0.5) * CELL_LEN, cy: Y1, angleDeg: 0 });
  }

  // Arc droit (idx 19-21) : (XR,Y1) going RIGHT → (XR,Y2) going LEFT
  const m12 = (Y1 + Y2) / 2;
  for (let k = 0; k < 3; k++) {
    const t = Math.PI * (k + 1) / 4;
    pts.push({
      cx: XR + ARC_R * Math.sin(t),
      cy: m12 + ARC_R * Math.cos(t),
      angleDeg: Math.atan2(-Math.sin(t), Math.cos(t)) * 180 / Math.PI,
    });
  }

  // Row 2 : droite → gauche (idx 22-29)
  for (let i = 0; i < 8; i++) {
    pts.push({ cx: XR - (i + 0.5) * CELL_LEN, cy: Y2, angleDeg: 180 });
  }

  // Arc gauche (idx 30-32) : (XL,Y2) going LEFT → (XL,Y3) going RIGHT
  const m23 = (Y2 + Y3) / 2;
  for (let k = 0; k < 3; k++) {
    const t = Math.PI * (k + 1) / 4;
    pts.push({
      cx: XL - ARC_R * Math.sin(t),
      cy: m23 + ARC_R * Math.cos(t),
      angleDeg: Math.atan2(-Math.sin(t), -Math.cos(t)) * 180 / Math.PI,
    });
  }

  // Row 3 : gauche → droite (idx 33-40)
  for (let i = 0; i < 8; i++) {
    pts.push({ cx: XL + (i + 0.5) * CELL_LEN, cy: Y3, angleDeg: 0 });
  }

  return pts; // 8+3+8+3+8+3+8 = 41
}

// Chemin SVG du centre du serpent (pour le fond)
function buildSnakePath() {
  const m01 = (Y0 + Y1) / 2;
  const m12 = (Y1 + Y2) / 2;
  const m23 = (Y2 + Y3) / 2;
  return [
    `M ${XR} ${Y0}`,
    `L ${XL} ${Y0}`,
    `A ${ARC_R} ${ARC_R} 0 0 0 ${XL} ${Y1}`,
    `L ${XR} ${Y1}`,
    `A ${ARC_R} ${ARC_R} 0 0 1 ${XR} ${Y2}`,
    `L ${XL} ${Y2}`,
    `A ${ARC_R} ${ARC_R} 0 0 0 ${XL} ${Y3}`,
    `L ${XR} ${Y3}`,
  ].join(' ');
}

// Quelques éclaboussures de peinture pour le style graffiti
const SPLATTERS = [
  { cx: 95,  cy: 310, rx: 28, ry: 20, rot: 15,  fill: '#CC2222', op: 0.55 },
  { cx: 620, cy: 490, rx: 24, ry: 18, rot: -20, fill: '#F5D020', op: 0.50 },
  { cx: 80,  cy: 640, rx: 22, ry: 16, rot: 30,  fill: '#9060C8', op: 0.45 },
  { cx: 610, cy: 760, rx: 26, ry: 19, rot: -10, fill: '#79BC43', op: 0.45 },
  { cx: 130, cy: 840, rx: 30, ry: 14, rot: 40,  fill: '#111',    op: 0.60 },
];

export default function Board({ teams, currentTeamIdx, activeCellIdx }) {
  const positions = useMemo(() => buildPositions(), []);
  const snakePath = useMemo(() => buildSnakePath(), []);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* ── Fond bois ── */}
        <linearGradient id="wood1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c4873a"/>
          <stop offset="30%"  stopColor="#b07230"/>
          <stop offset="70%"  stopColor="#a06228"/>
          <stop offset="100%" stopColor="#8a5220"/>
        </linearGradient>
        <pattern id="woodgrain" x="0" y="0" width="60" height="200" patternUnits="userSpaceOnUse">
          <rect width="60" height="200" fill="url(#wood1)"/>
          <path d="M0 30 Q30 35 60 28 M0 80 Q30 88 60 75 M0 130 Q30 138 60 122 M0 180 Q30 185 60 175"
                stroke="#7a4515" strokeOpacity="0.35" strokeWidth="2" fill="none"/>
          <path d="M0 55 Q30 58 60 50 M0 105 Q30 112 60 100 M0 155 Q30 158 60 148"
                stroke="#d4973a" strokeOpacity="0.25" strokeWidth="1.5" fill="none"/>
        </pattern>

        {/* ── Ombre case ── */}
        <filter id="shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#fff" floodOpacity="0.8"/>
        </filter>
        <filter id="finale-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#87CEEB" floodOpacity="0.9"/>
        </filter>

        {/* ── Pions ── */}
        {teams.map(t => (
          <radialGradient key={t.id} id={`pg-${t.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0.8"/>
            <stop offset="100%" stopColor={t.color} stopOpacity="1"/>
          </radialGradient>
        ))}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
          .cell-label { font-family: 'Bangers', 'Impact', sans-serif; }
          @keyframes pulse {
            0%,100% { stroke-opacity:1; stroke-width:4; }
            50%      { stroke-opacity:0.3; stroke-width:7; }
          }
          .pulse { animation: pulse 1.2s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── Fond bois ── */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#woodgrain)" rx="12"/>

      {/* Obscurcissement léger sur les bords */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H}
            fill="radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)"
            rx="12" opacity="0.3"/>

      {/* ── Éclaboussures style graffiti ── */}
      {SPLATTERS.map((s, i) => (
        <ellipse key={i}
          cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
          fill={s.fill} opacity={s.op}
          transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
          style={{ filter: 'blur(1px)' }}
        />
      ))}

      {/* ── Corps du serpent (fond sombre) ── */}
      <path d={snakePath} fill="none"
            stroke="#111" strokeWidth={CELL_W + 18}
            strokeLinecap="round" strokeLinejoin="round"/>
      {/* Bordure bois du serpent */}
      <path d={snakePath} fill="none"
            stroke="#5c3010" strokeWidth={CELL_W + 24}
            strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
            style={{ mixBlendMode: 'multiply' }}/>
      {/* Reflet subtil */}
      <path d={snakePath} fill="none"
            stroke="#fff" strokeWidth={CELL_W + 26}
            strokeLinecap="round" strokeLinejoin="round" opacity="0.04"/>

      {/* ── Cases ── */}
      {BOARD_LAYOUT.map((cell, idx) => {
        const { cx, cy, angleDeg } = positions[idx];
        const isActive  = idx === activeCellIdx;
        const isFinale  = cell.type === 'finale';
        const styleKey  = cell.type === 'cat' ? cell.cat : cell.type;
        const style     = TYPE_STYLE[styleKey] || TYPE_STYLE.Scolaire;
        const rawLabel  = TYPE_LABEL[styleKey] || styleKey.toUpperCase();
        const lines     = rawLabel.split('\n');
        const CL = isFinale ? CELL_LEN * 1.3 : CELL_LEN;
        const CW = isFinale ? CELL_W * 1.3   : CELL_W;

        const here = teams.filter(t => t.position === idx);

        return (
          <g key={idx}
             transform={`translate(${cx},${cy}) rotate(${angleDeg})`}
             filter={isFinale ? 'url(#finale-glow)' : isActive ? 'url(#glow)' : 'url(#shadow)'}
          >
            {/* Anneau pulsant sur la case active */}
            {isActive && (
              <rect className="pulse"
                x={-CL/2 - 5} y={-CW/2 - 5} width={CL + 10} height={CW + 10}
                rx="10" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="8 4"
              />
            )}

            {/* Corps de la case */}
            <rect x={-CL/2} y={-CW/2} width={CL} height={CW}
                  fill={style.fill}
                  stroke={style.border} strokeWidth={isFinale ? 4 : 3}
                  rx="6"
            />

            {/* Icône */}
            <g transform="translate(0,-8) scale(0.85)">
              <CatIcon type={cell.type} cat={cell.cat}/>
            </g>

            {/* Label (1 ou 2 lignes) */}
            {lines.map((line, li) => (
              <text key={li}
                x={0}
                y={CW / 2 - (lines.length === 2 ? (18 - li * 12) : 12)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isFinale ? 11 : cell.type === 'cat' ? 9 : 8}
                fontWeight="900"
                fill={style.text}
                fontFamily="'Bangers', 'Impact', sans-serif"
                letterSpacing="0.8"
                style={{ paintOrder: 'stroke', stroke: style.border, strokeWidth: 3, strokeLinejoin: 'round' }}
              >{line}</text>
            ))}

            {/* Numéro de case (petit, coin) */}
            {!isFinale && (
              <text x={-CL/2 + 5} y={-CW/2 + 9}
                    fontSize="7" fill={style.text} opacity="0.5"
                    fontFamily="Inter, sans-serif" fontWeight="700"
              >{idx + 1}</text>
            )}

            {/* Pions sur cette case */}
            {here.map((team, ti) => {
              const angle  = (2 * Math.PI * ti) / Math.max(here.length, 1);
              const offset = here.length > 1 ? 12 : 0;
              const px = Math.cos(angle) * offset;
              const py = Math.sin(angle) * offset;
              return (
                <g key={team.id} transform={`translate(${px},${py}) rotate(${-angleDeg})`}>
                  <circle r="12" fill={`url(#pg-${team.id})`}
                          stroke="#fff" strokeWidth="2"/>
                  <text x="0" y="0" textAnchor="middle" dominantBaseline="middle"
                        fontSize="9" fontWeight="800" fill="#fff"
                        fontFamily="Inter, sans-serif">
                    {(team.name || '?')[0].toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ── Ticket DÉPART ── */}
      {(() => {
        const { cx, cy } = positions[0];
        return (
          <g transform={`translate(${cx + 60}, ${cy + 28})`}>
            <rect x="-52" y="-28" width="104" height="56"
                  rx="6" fill="#f5e8c0" stroke="#8a6820" strokeWidth="2"/>
            <line x1="-52" y1="0" x2="52" y2="0" stroke="#8a6820" strokeWidth="1" strokeDasharray="4 3"/>
            <text x="0" y="-10" textAnchor="middle" fontSize="7" fill="#8a6820" fontWeight="700"
                  fontFamily="Inter, sans-serif" letterSpacing="0.5">HÉSITE PAS À</text>
            <text x="0" y="8" textAnchor="middle" fontSize="11" fill="#3a1a00" fontWeight="900"
                  fontFamily="'Bangers', Impact, sans-serif" letterSpacing="1">DÉBUTER</text>
          </g>
        );
      })()}

      {/* ── Bannière ARRIVÉE ── */}
      {(() => {
        const { cx, cy } = positions[40];
        return (
          <g transform={`translate(${cx}, ${cy - CELL_W - 20})`}>
            {/* Étoile */}
            <path d="M0-28 L6-10 L24-10 L11 2 L16 20 L0 10 L-16 20 L-11 2 L-24-10 L-6-10z"
                  fill="#87CEEB" stroke="#1a1a1a" strokeWidth="2"/>
            <text x="0" y="-4" textAnchor="middle" dominantBaseline="middle"
                  fontSize="16" fontWeight="900" fill="#1a1a1a"
                  fontFamily="'Bangers', Impact, sans-serif">★</text>
          </g>
        );
      })()}

      {/* ── Logo TTMC en haut à droite ── */}
      <g transform={`translate(${SVG_W - 10}, 10)`}>
        <rect x="-80" y="0" width="80" height="38" rx="8" fill="#111" opacity="0.7"/>
        <text x="-40" y="14" textAnchor="middle"
              fontSize="22" fontWeight="900" fill="#fff"
              fontFamily="'Bangers', Impact, sans-serif" letterSpacing="2">TTMC</text>
        <text x="-40" y="30" textAnchor="middle"
              fontSize="9" fontWeight="700" fill="#F5D020"
              fontFamily="Inter, sans-serif" letterSpacing="1">COMBIEN TE METS-TU ?</text>
      </g>
    </svg>
  );
}
