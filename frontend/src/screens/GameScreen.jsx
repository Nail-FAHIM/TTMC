import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, CAT_COLORS, buildCells } from '../store/gameStore.js';
import { Banner } from '../assets/banners/index.jsx';
import Board from '../components/Board.jsx';
import Modal from '../components/Modal.jsx';
import BonusModal from '../components/BonusModal.jsx';
import RulesModal from '../components/RulesModal.jsx';

export default function GameScreen() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const {
    teams, currentTeamIdx, phase, modalOpen, bonusSession,
    landOnCell, questionsData, config, questionsPlayed,
    history, undoLastMove, resetGame,
  } = useGameStore();
  const busy = modalOpen || !!bonusSession;

  useEffect(() => {
    if (phase === 'victory') navigate('/victory');
  }, [phase, navigate]);

  // Redirection si aucune équipe configurée
  useEffect(() => {
    if (!teams.length) navigate('/config');
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
  const leaderPos = Math.max(...teams.map(t => t.position));
  const leaderCount = teams.filter(t => t.position === leaderPos).length;

  function handleRoll() {
    if (busy) return;
    // On lance directement la question pour la case actuelle
    landOnCell(activeCellIdx);
  }

  const catColors = CAT_COLORS[cells[activeCellIdx]?.cat] || {};

  return (
    <div style={styles.root}>
      {/* Sidebar équipes (repliable) */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 220 : 48 }}>
        <button style={styles.collapseBtn} onClick={() => setSidebarOpen(o => !o)}
                title={sidebarOpen ? 'Replier' : 'Déplier'}>
          {sidebarOpen ? '‹' : '›'}
        </button>
        {sidebarOpen && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={styles.rulesBtn} onClick={() => setShowRules(true)}>📖 Règles</button>
            <button style={styles.quitBtn} onClick={() => setConfirmQuit(true)}>✕ Quitter</button>
          </div>
        )}
        {sidebarOpen && <h2 style={styles.sidebarTitle}>Équipes</h2>}
        {sidebarOpen && remaining != null && (
          <div style={styles.counter}>
            Questions restantes : <strong>{remaining}</strong>
          </div>
        )}
        {teams.map((team, ti) => {
          const isCurrent = ti === currentTeamIdx;
          const isLeader = team.position > 0 && team.position === leaderPos && leaderCount === 1;
          const pct = Math.round((team.position / (cells.length - 1)) * 100);
          const avSize = sidebarOpen ? 24 : 26;
          const avatar = team.avatar
            ? <img src={team.avatar} alt="" style={{ width: avSize, height: avSize, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
            : team.banner
              ? <Banner id={team.banner} color={team.color} size={avSize} radius={5} />
              : <div style={{ ...styles.teamDot, background: team.color }} />;
          if (!sidebarOpen) {
            return (
              <div key={team.id} style={{ ...styles.teamMini, outline: isCurrent ? `2px solid ${team.color}` : 'none' }}
                   title={`${team.name} · case ${team.position + 1}`}>
                {avatar}
              </div>
            );
          }
          return (
            <div
              key={team.id}
              style={{
                ...styles.teamRow,
                borderColor: team.color + (isCurrent ? 'ff' : '44'),
                background: isCurrent ? team.color + '1a' : 'var(--surface)',
                boxShadow: isCurrent ? `0 0 0 1px ${team.color}, 0 2px 12px ${team.color}44` : 'none',
              }}
            >
              {avatar}
              <div style={styles.teamInfo}>
                <div style={styles.teamNameRow}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: isCurrent ? team.color : 'var(--text)' }}>
                    {isLeader && '👑 '}{team.name}
                  </span>
                  {isCurrent && <span style={{ ...styles.turnBadge, background: team.color }}>Tour</span>}
                </div>
                {/* Barre de progression temps réel */}
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${pct}%`, background: team.color }} />
                </div>
                <div style={styles.teamStats}>
                  <span>Case {team.position + 1}/{cells.length}</span>
                  <span style={{ color: team.color, fontWeight: 700 }}>{team.score} pts</span>
                </div>
                {team.players?.length > 0 && (
                  <span style={styles.teamPlayers}>👥 {team.players.join(', ')}</span>
                )}
              </div>
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
              disabled={busy}
            >
              🎲 Tirer une question
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation avant de quitter */}
      {confirmQuit && (
        <div style={styles.confirmOverlay} onClick={e => e.target === e.currentTarget && setConfirmQuit(false)}>
          <div style={styles.confirmBox}>
            <h3 style={styles.confirmTitle}>Quitter la partie ?</h3>
            <p style={styles.confirmText}>La progression en cours sera perdue.</p>
            <div style={styles.confirmRow}>
              <button style={styles.confirmCancel} onClick={() => setConfirmQuit(false)}>Annuler</button>
              <button style={styles.confirmQuit} onClick={() => { resetGame(); navigate('/'); }}>Quitter</button>
            </div>
          </div>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Modales */}
      <Modal />
      <BonusModal />
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
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 8px',
    overflowY: 'auto',
    transition: 'width 0.2s ease',
  },
  collapseBtn: {
    alignSelf: 'flex-end',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    width: '28px', height: '28px',
    fontSize: '16px', fontWeight: 700,
    flexShrink: 0,
  },
  teamMini: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3px', borderRadius: '7px', marginTop: '2px',
  },
  quitBtn: {
    flex: 1, background: 'transparent', border: '1px solid #ff444455', color: '#ff6666',
    borderRadius: '8px', padding: '7px 8px', fontSize: '12px', fontWeight: 700,
  },
  rulesBtn: {
    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
    borderRadius: '8px', padding: '7px 8px', fontSize: '12px', fontWeight: 700,
  },
  confirmOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 130,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(3px)',
  },
  confirmBox: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    padding: '24px', width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center',
  },
  confirmTitle: { fontSize: 20, fontWeight: 800 },
  confirmText: { fontSize: 14, color: 'var(--text-muted)' },
  confirmRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 },
  confirmCancel: { padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' },
  confirmQuit: { padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, background: '#3d0000', border: '2px solid #ff4444', color: '#ff4444' },
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
    gap: '4px',
    minWidth: 0,
  },
  teamNameRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  progressBar: { height: 5, borderRadius: 3, background: 'var(--surface)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  teamStats: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' },
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
    // Sur grand écran le plateau remplit ; sur mobile on autorise le scroll
    overflow: 'auto',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
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
