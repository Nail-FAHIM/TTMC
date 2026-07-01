import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TITLE } from '../constants/labels.js';
import { isMuted, toggleMuted, playClick } from '../utils/sound.js';
import RulesModal from '../components/RulesModal.jsx';

export default function MenuScreen() {
  const navigate = useNavigate();
  const [rules, setRules] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  return (
    <div style={styles.root}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <h1 style={styles.logo}>{GAME_TITLE.short_logo}</h1>
        <p style={styles.tagline}>{GAME_TITLE.tagline}</p>

        <div style={styles.buttons}>
          <button style={styles.play} onClick={() => { playClick(); navigate('/config'); }}>▶ Jouer</button>
          <button style={styles.secondary} onClick={() => navigate('/config')}>⚙ Configurer une partie</button>
          <button style={styles.secondary} onClick={() => setRules(true)}>📖 Règles du jeu</button>
          <button style={styles.secondary} onClick={() => setMuted(toggleMuted())}>
            {muted ? '🔇 Son coupé' : '🔊 Son activé'}
          </button>
        </div>

        <p style={styles.hint}>Un quiz de plateau où tu paries sur ton propre niveau.</p>
      </div>

      {rules && <RulesModal onClose={() => setRules(false)} />}
    </div>
  );
}

const styles = {
  root: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed33, transparent 70%)', filter: 'blur(40px)' },
  content: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: 24 },
  logo: {
    fontSize: 'clamp(56px, 12vw, 110px)', fontWeight: 900, letterSpacing: 2,
    fontFamily: "'Bangers', Impact, sans-serif",
    background: 'linear-gradient(135deg, #00c3ff, #7c3aed, #ff1a6b)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  tagline: { fontSize: 14, fontWeight: 700, letterSpacing: 3, color: '#F5D020', marginBottom: 28 },
  buttons: { display: 'flex', flexDirection: 'column', gap: 12, width: 'min(340px, 90vw)' },
  play: { padding: '18px', borderRadius: 50, fontSize: 20, fontWeight: 800, color: '#fff', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #00c3ff)', boxShadow: '0 6px 24px #7c3aed66' },
  secondary: { padding: '14px', borderRadius: 50, fontSize: 15, fontWeight: 700, color: 'var(--text)', background: 'var(--surface2)', border: '1px solid var(--border)' },
  hint: { marginTop: 24, fontSize: 13, color: 'var(--text-muted)' },
};
