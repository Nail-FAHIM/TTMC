import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';

export default function VictoryScreen() {
  const navigate = useNavigate();
  const { teams, currentTeamIdx, resetGame } = useGameStore();

  const winner = teams[currentTeamIdx] || teams[0];

  function handleRestart() {
    resetGame();
    navigate('/');
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.trophy}>🏆</div>
        <h1 style={styles.title}>Victoire !</h1>
        <p style={{ ...styles.winnerName, color: winner?.color }}>
          {winner?.name}
        </p>
        <p style={styles.subtitle}>a atteint la dernière case !</p>

        {teams.length > 1 && (
          <div style={styles.ranking}>
            <h3 style={styles.rankTitle}>Classement</h3>
            {[...teams]
              .sort((a, b) => b.position - a.position)
              .map((team, i) => (
                <div key={team.id} style={styles.rankRow}>
                  <span style={styles.rankNum}>{i + 1}</span>
                  <div style={{ ...styles.rankDot, background: team.color }} />
                  <span style={{ flex: 1 }}>{team.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Case {team.position + 1}
                  </span>
                </div>
              ))}
          </div>
        )}

        <button style={styles.btn} onClick={handleRestart}>
          Nouvelle partie
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  trophy: {
    fontSize: '64px',
    lineHeight: 1,
  },
  title: {
    fontSize: '40px',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #ffb400, #ff1a6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  winnerName: {
    fontSize: '28px',
    fontWeight: 800,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '15px',
  },
  ranking: {
    width: '100%',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius-sm)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  rankTitle: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  rankRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
  },
  rankNum: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    width: '16px',
  },
  rankDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  btn: {
    marginTop: '16px',
    background: 'linear-gradient(135deg, #7c3aed, #00c3ff)',
    color: '#fff',
    borderRadius: '50px',
    padding: '13px 36px',
    fontSize: '15px',
    fontWeight: 700,
  },
};
