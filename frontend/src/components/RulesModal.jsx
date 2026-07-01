import { GAME_TITLE } from '../constants/labels.js';

const RULES = [
  ['But du jeu', 'Faites avancer votre équipe jusqu\'à la case Arrivée en répondant à des questions. La première équipe à atteindre l\'Arrivée (et à réussir sa question finale) gagne.'],
  ['La cote (1-10)', 'À votre tour, vous choisissez une difficulté de 1 (facile) à 10 (expert) : c\'est votre mise. Une bonne réponse vous fait avancer d\'autant de cases que la difficulté choisie.'],
  ['Les catégories', 'Chaque case colorée correspond à une catégorie (Scolaire, Plaisir, Mature, Improbable). La question est tirée dans la catégorie de la case.'],
  ['Cases Bonus', 'Tirez une carte Bonus : selon la carte, réussissez un défi pour gagner des cases, voler de l\'avance aux autres, ou obtenir un pouvoir gardé (bouclier, seconde chance…).'],
  ['Cases Malus', 'Tirez une carte Malus : un défi souvent risqué. Réussir limite ou annule la sanction ; échouer vous fait reculer, passer un tour, voire perdre.'],
  ['Case Arrivée', 'Question finale, volontairement difficile et sur n\'importe quel sujet. La réussir scelle la victoire.'],
  ['Jugement', 'Pour les questions ouvertes, les autres équipes valident si la réponse est correcte. Fair-play recommandé !'],
];

export default function RulesModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Règles du jeu</h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
        <p style={styles.intro}><strong>{GAME_TITLE.full}</strong> — {GAME_TITLE.tagline.toLowerCase()}.</p>
        <div style={styles.list}>
          {RULES.map(([t, d]) => (
            <div key={t} style={styles.rule}>
              <h3 style={styles.ruleTitle}>{t}</h3>
              <p style={styles.ruleText}>{d}</p>
            </div>
          ))}
        </div>
        <button style={styles.ok} onClick={onClose}>J'ai compris</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg, #00c3ff, #7c3aed, #ff1a6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  close: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', width: 32, height: 32, fontSize: 15 },
  intro: { fontSize: 14, color: 'var(--text-muted)' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  rule: { background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' },
  ruleTitle: { fontSize: 15, fontWeight: 800, marginBottom: 4 },
  ruleText: { fontSize: 13.5, color: 'var(--text)', lineHeight: 1.45 },
  ok: { padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #00c3ff)', color: '#fff', border: 'none' },
};
