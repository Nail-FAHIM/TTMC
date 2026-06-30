import { useNavigate } from 'react-router-dom';
import { useGameStore, PION_COLORS } from '../store/gameStore.js';

const TEAM_LIMIT = 6;

export default function ConfigScreen() {
  const navigate = useNavigate();
  const {
    teamConfigs, questionsData,
    addTeamConfig, removeTeamConfig,
    updateTeamConfig, updatePlayerName, addPlayer, removePlayer,
    startGame,
  } = useGameStore();

  function handleStart() {
    // Valider : au moins 1 équipe, données chargées
    if (!questionsData) return;
    const validConfigs = teamConfigs.map((cfg, i) => ({
      name: cfg.name.trim() || `Équipe ${i + 1}`,
      players: cfg.players.map((p, pi) => p.trim() || `Joueur ${pi + 1}`).filter(Boolean),
    }));
    useGameStore.setState({ teamConfigs: validConfigs });
    startGame();
    navigate('/game');
  }

  const canStart = questionsData && teamConfigs.length >= 1;

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>Combien te mets-tu ?</h1>
        <p style={styles.subtitle}>Configurer la partie</p>
      </div>

      <div style={styles.teamsContainer}>
        {teamConfigs.map((cfg, ti) => (
          <TeamCard
            key={ti}
            config={cfg}
            index={ti}
            color={PION_COLORS[ti % PION_COLORS.length]}
            onNameChange={v => updateTeamConfig(ti, 'name', v)}
            onRemoveTeam={() => removeTeamConfig(ti)}
            onAddPlayer={() => addPlayer(ti)}
            onRemovePlayer={pi => removePlayer(ti, pi)}
            onPlayerName={(pi, v) => updatePlayerName(ti, pi, v)}
          />
        ))}

        {teamConfigs.length < TEAM_LIMIT && (
          <button style={styles.addTeamBtn} onClick={addTeamConfig}>
            + Ajouter une équipe
          </button>
        )}
      </div>

      <div style={styles.footer}>
        {!questionsData && (
          <p style={styles.loading}>Chargement des questions…</p>
        )}
        <button
          style={{ ...styles.startBtn, opacity: canStart ? 1 : 0.4 }}
          onClick={handleStart}
          disabled={!canStart}
        >
          {teamConfigs.length === 0 ? 'Ajouter une équipe pour commencer' : 'Lancer la partie →'}
        </button>
      </div>
    </div>
  );
}

function TeamCard({ config, index, color, onNameChange, onRemoveTeam, onAddPlayer, onRemovePlayer, onPlayerName }) {
  return (
    <div style={{ ...styles.card, borderColor: color + '66' }}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.pionDot, background: color }} />
        <input
          style={styles.teamNameInput}
          placeholder={`Équipe ${index + 1}`}
          value={config.name}
          onChange={e => onNameChange(e.target.value)}
          maxLength={30}
        />
        <button style={styles.removeBtn} onClick={onRemoveTeam} title="Supprimer">✕</button>
      </div>

      <div style={styles.playersList}>
        {config.players.map((player, pi) => (
          <div key={pi} style={styles.playerRow}>
            <span style={styles.playerNum}>{pi + 1}</span>
            <input
              style={styles.playerInput}
              placeholder={`Joueur ${pi + 1}`}
              value={player}
              onChange={e => onPlayerName(pi, e.target.value)}
              maxLength={25}
            />
            {config.players.length > 1 && (
              <button style={styles.removePlayerBtn} onClick={() => onRemovePlayer(pi)}>✕</button>
            )}
          </div>
        ))}
      </div>

      <button style={styles.addPlayerBtn} onClick={onAddPlayer}>+ Joueur</button>
    </div>
  );
}

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    padding: '32px 16px 100px',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 42px)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #00c3ff, #7c3aed, #ff1a6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginTop: '6px',
    fontSize: '15px',
  },
  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    width: '100%',
    maxWidth: '900px',
  },
  card: {
    background: 'var(--surface)',
    border: '2px solid',
    borderRadius: 'var(--radius)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pionDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 8px currentColor',
  },
  teamNameInput: {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    color: 'var(--text)',
    fontSize: '15px',
    fontWeight: 600,
  },
  removeBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '14px',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  playerNum: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    width: '16px',
    textAlign: 'center',
    flexShrink: 0,
  },
  playerInput: {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    color: 'var(--text)',
    fontSize: '13px',
  },
  removePlayerBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '4px 6px',
  },
  addPlayerBtn: {
    background: 'var(--surface2)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    padding: '8px',
    fontSize: '13px',
    transition: 'color 0.2s',
  },
  addTeamBtn: {
    background: 'var(--surface)',
    border: '2px dashed var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
    padding: '32px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s, color 0.2s',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px 24px',
    background: 'linear-gradient(to top, var(--bg) 80%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  loading: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  startBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #00c3ff)',
    color: '#fff',
    borderRadius: '50px',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: 700,
    boxShadow: '0 4px 20px #7c3aed55',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
};
