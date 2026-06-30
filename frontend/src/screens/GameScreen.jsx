import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, CAT_COLORS, buildCells } from '../store/gameStore.js';
import Board from '../components/Board.jsx';
import Modal from '../components/Modal.jsx';

export default function GameScreen() {
  const navigate = useNavigate();
  const {
    teams, currentTeamIdx, phase, modalOpen,
    landOnCell, questionsData, config, questionsPlayed,
    history, undoLastMove,
  } = useGameStore();

  useEffect(() => {
    if (phase === 'victory') navigate('/victory');
  }, [phase, navigate]);

  // Redirection si aucune équipe configurée
  useEffect(() => {
    if (!teams.length) navigate('/');
  }, [teams.length, navigate]);

  if (!teams.length || !questionsData) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7b78a8' }}>
        Chargement…
      </div>
    );
  }

  const currentTeam = teams[currentTeamIdx];
  const cells = buildCells(config.customCells);
  const activeCellIdx = currentTeam.position;
  const remaining = config.questionLimit != null
    ? Math.max(0, config.questionLimit - questionsPlayed)
    : null;

  function handleRoll() {
    if (modalOpen) return;
    // On lance directement la question pour la case actuelle
    landOnCell(activeCellIdx);
  }

  const catColors = CAT_COLORS[cells[activeCellIdx]?.cat] || {};

  return (
    <div style={styles.root}>
      {/* Sidebar équipes */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Équipes</h2>
        {remaining != null && (
          <div style={styles.counter}>
            Questions restantes : <strong>{remaining}</strong>
          </div>
        )}
        {teams.map((team, ti) => {
          const isCurrent = ti === currentTeamIdx;
          return (
            <div
              key={team.id}
              style={{
                ...styles.teamRow,
                borderColor: team.color + (isCurrent ? 'ff' : '44'),
                background: isCurrent ? team.color + '1a' : 'var(--surface)',
              }}
            >
              <div style={{ ...styles.teamDot, background: team.color }} />
              <div style={styles.teamInfo}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: isCurrent ? team.color : 'var(--text)' }}>
                  {team.name}
                </span>
                <span style={styles.teamPos}>Case {team.position + 1} / {cells.length}</span>
                {team.players?.length > 0 && (
                  <span style={styles.teamPlayers}>{team.players.join(', ')}</span>
                )}
              </div>
              {isCurrent && <span style={{ ...styles.turnBadge, background: team.color }}>Tour</span>}
            </div>
          );
        })}
      </aside>

      {/* Plateau */}
      <main style={styles.boardArea}>
        <div style={styles.boardWrapper}>
          <Board
            teams={teams}
            currentTeamIdx={currentTeamIdx}
            activeCellIdx={activeCellIdx}
            layout={cells}
          />
        </div>

        {/* Barre action bas */}
        <div style={styles.actionBar}>
          <div style={styles.currentInfo}>
            <span style={{ color: currentTeam.color, fontWeight: 700 }}>
              {currentTeam.name}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {' '}· Case {activeCellIdx + 1} · {cells[activeCellIdx]?.cat}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ ...styles.undoBtn, opacity: history.length && !modalOpen ? 1 : 0.4 }}
              onClick={() => !modalOpen && undoLastMove()}
              disabled={!history.length || modalOpen}
              title="Annuler le dernier coup"
            >
              ↩ Annuler
            </button>
            <button
              style={{
                ...styles.rollBtn,
                background: catColors.stroke ? `linear-gradient(135deg, ${catColors.stroke}44, ${catColors.stroke}22)` : 'var(--surface2)',
                borderColor: catColors.stroke || 'var(--border)',
                color: catColors.stroke || 'var(--text)',
              }}
              onClick={handleRoll}
              disabled={modalOpen}
            >
              🎲 Tirer une question
            </button>
          </div>
        </div>
      </main>

      {/* Modal question */}
      <Modal />
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px 12px',
    overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  teamRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px',
    border: '2px solid',
    borderRadius: 'var(--radius-sm)',
    transition: 'border-color 0.2s, background 0.2s',
  },
  teamDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '3px',
  },
  teamInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  teamPos: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  teamPlayers: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  turnBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '10px',
    color: '#000',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  boardArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  boardWrapper: {
    flex: 1,
    overflow: 'hidden',
    padding: '12px',
  },
  actionBar: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexShrink: 0,
  },
  currentInfo: {
    fontSize: '15px',
  },
  rollBtn: {
    padding: '10px 24px',
    borderRadius: '50px',
    border: '2px solid',
    fontSize: '14px',
    fontWeight: 700,
    transition: 'opacity 0.2s',
  },
  undoBtn: {
    padding: '10px 18px',
    borderRadius: '50px',
    border: '2px solid var(--border)',
    background: 'var(--surface2)',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: 700,
    transition: 'opacity 0.2s',
  },
  counter: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    marginBottom: '4px',
  },
};
