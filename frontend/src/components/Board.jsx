/**
 * Board — plateau hexagonal SVG serpentin.
 * Pointy-top hexagons, 8 colonnes, 7 rangées, 56 cases.
 * Layout identique au index.html original.
 */
import { useMemo } from 'react';
import {
  COLS, HR, GAP, HW, HH, HX, HY,
  CAT_COLORS, SPECIAL_CELLS,
  buildCells,
} from '../store/gameStore.js';

// Points d'un hexagone pointy-top centré en (0,0), rayon HR
function hexPts(hr) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(hr * Math.cos(a)).toFixed(2)},${(hr * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

const HEX_PTS = hexPts(HR - 2);
const HEX_PTS_INNER = hexPts(HR - 6);

const SPECIAL_LABELS = {
  bonus: 'Incroyable ✨',
  malus: 'Pas de chance 💀',
  finale: 'N\'hésite pas\nà gagner 🏆',
  debut: 'Départ',
};

function getSpecialType(idx) {
  for (const [type, indices] of Object.entries(SPECIAL_CELLS)) {
    if (indices.includes(idx)) return type;
  }
  return null;
}

export default function Board({ teams, currentTeamIdx, onCellClick, activeCellIdx }) {
  const cells = useMemo(() => buildCells(), []);

  // Dimensions SVG
  const svgW = COLS * HX + HX / 2 + GAP * 2;
  const rows = 7;
  const svgH = rows * HY + HR + GAP * 2;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* Gradients radial pour les pions */}
        {teams.map(team => (
          <radialGradient key={team.id} id={`pion-${team.id}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="100%" stopColor={team.color} stopOpacity="1" />
          </radialGradient>
        ))}
        {/* Animation ring */}
        <style>{`
          @keyframes dash-spin {
            to { stroke-dashoffset: -32; }
          }
          .active-ring {
            animation: dash-spin 1.2s linear infinite;
          }
        `}</style>
      </defs>

      {/* Cases */}
      {cells.map((cell, idx) => {
        const specialType = getSpecialType(idx);
        const isSpecial = specialType !== null;
        const isActive = idx === activeCellIdx;

        let fill = CAT_COLORS[cell.cat]?.fill || '#1a1a2e';
        let stroke = CAT_COLORS[cell.cat]?.stroke || '#444';
        let labelColor = CAT_COLORS[cell.cat]?.text || '#fff';

        if (specialType === 'bonus') { fill = '#1a3d00'; stroke = '#00e87a'; labelColor = '#00e87a'; }
        if (specialType === 'malus') { fill = '#3d0000'; stroke = '#ff4444'; labelColor = '#ff4444'; }
        if (specialType === 'finale') { fill = '#2a1a00'; stroke = '#ffb400'; labelColor = '#ffb400'; }
        if (specialType === 'debut') { fill = '#1a0a3d'; stroke = '#7c3aed'; labelColor = '#c4aaff'; }

        // Équipes sur cette case
        const teamsHere = teams.filter(t => t.position === idx);

        return (
          <g
            key={idx}
            transform={`translate(${cell.cx},${cell.cy})`}
            style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            onClick={() => onCellClick && onCellClick(idx)}
          >
            <polygon
              points={HEX_PTS}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive ? 2.5 : 1.5}
              opacity={0.95}
            />

            {/* Ring animé sur la case active (équipe en cours) */}
            {isActive && (
              <polygon
                className="active-ring"
                points={HEX_PTS}
                fill="none"
                stroke={stroke}
                strokeWidth="3"
                strokeDasharray="8 4"
                opacity={0.8}
              />
            )}

            {/* Numéro de case */}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              dy={isSpecial ? -HR * 0.3 : 0}
              fontSize={isSpecial ? 9 : 11}
              fontWeight="700"
              fill={labelColor}
              opacity={0.6}
            >
              {idx + 1}
            </text>

            {/* Label cases spéciales */}
            {isSpecial && (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                dy={HR * 0.15}
                fontSize={7}
                fontWeight="600"
                fill={labelColor}
              >
                {SPECIAL_LABELS[specialType]?.split('\n').map((line, li) => (
                  <tspan key={li} x="0" dy={li === 0 ? 0 : 10}>{line}</tspan>
                ))}
              </text>
            )}

            {/* Catégorie (premières lettres) sur cases normales */}
            {!isSpecial && (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                dy={HR * 0.38}
                fontSize={7}
                fill={labelColor}
                opacity={0.5}
              >
                {cell.cat.slice(0, 3).toUpperCase()}
              </text>
            )}

            {/* Pions des équipes sur cette case */}
            {teamsHere.map((team, ti) => {
              const angle = (2 * Math.PI * ti) / Math.max(teamsHere.length, 1);
              const offset = teamsHere.length > 1 ? 14 : 0;
              const px = Math.cos(angle) * offset;
              const py = Math.sin(angle) * offset;
              return (
                <g key={team.id} transform={`translate(${px},${py})`}>
                  <circle r="10" fill={`url(#pion-${team.id})`} stroke="#fff" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="#fff"
                  >
                    {(team.name || '?')[0].toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
