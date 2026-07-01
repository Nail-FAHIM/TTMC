import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { CATS, CAT_COLORS } from '../constants/categories.js';

const GOLD = '#F5D020';

export default function BonusModal() {
  const {
    bonusSession, teams, currentTeamIdx,
    bonusBegin, bonusPickCategory, bonusPickLevel, bonusJudge, bonusPickTarget, closeBonus,
  } = useGameStore();

  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setRevealed(false); }, [bonusSession?.phase, bonusSession?.roundIdx]);

  if (!bonusSession) return null;
  const bs = bonusSession;
  const card = bs.card;
  const team = teams[currentTeamIdx];

  const levelRange = () => {
    const [lo, hi] = bs.levelBounds || [1, 10];
    const arr = []; for (let i = lo; i <= hi; i++) arr.push(i);
    return arr;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header carte */}
        <div style={styles.header}>
          <div style={styles.badge}>⭐ C'EST SUPERBE</div>
          <h2 style={styles.title}>{card.titre}</h2>
          <p style={styles.desc}>{card.description}</p>
          {bs.totalRounds > 1 && bs.phase !== 'result' && (
            <p style={styles.progress}>Question {Math.min(bs.roundIdx + 1, bs.totalRounds)} / {bs.totalRounds}</p>
          )}
          <p style={styles.team}>Équipe : <strong style={{ color: team?.color }}>{team?.name}</strong></p>
        </div>

        <div style={styles.body}>
          {/* INTRO */}
          {bs.phase === 'intro' && (
            <button style={styles.btnGold} onClick={bonusBegin}>Commencer</button>
          )}

          {/* CHOIX CATÉGORIE */}
          {bs.phase === 'category' && (
            <>
              <p style={styles.prompt}>
                {bs.categoryMode === 'adversary'
                  ? '👥 L\'équipe adverse impose la catégorie'
                  : 'Choisissez une catégorie (différente de votre case)'}
              </p>
              <div style={styles.grid}>
                {CATS.filter(c => bs.categoryMode !== 'chooseOther' || c !== bs.cellCat).map(c => (
                  <button key={c} style={{ ...styles.catBtn, borderColor: CAT_COLORS[c].stroke, color: CAT_COLORS[c].stroke }}
                          onClick={() => bonusPickCategory(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* CHOIX NIVEAU */}
          {bs.phase === 'level' && (
            <>
              <p style={styles.prompt}>
                {bs.isAdversary ? '👥 L\'équipe adverse impose la difficulté'
                  : bs.isBet ? '🎭 Annoncez une difficulté (avant de voir la question)'
                  : 'Choisissez la difficulté'}
              </p>
              <div style={styles.levels}>
                {levelRange().map(l => (
                  <button key={l} style={styles.levelBtn} onClick={() => bonusPickLevel(l)}>{l}</button>
                ))}
              </div>
            </>
          )}

          {/* CHOOSE 3 */}
          {bs.phase === 'choose3' && (
            <>
              <p style={styles.prompt}>🎲 Choisissez l'une des 3 difficultés</p>
              <div style={styles.levels}>
                {bs.choose3.map(l => (
                  <button key={l} style={styles.levelBtn} onClick={() => bonusPickLevel(l)}>{l}</button>
                ))}
              </div>
            </>
          )}

          {/* ENTRE DEUX QUESTIONS */}
          {bs.phase === 'between' && (
            <button style={styles.btnGold} onClick={bonusBegin}>Question suivante →</button>
          )}

          {/* QUESTION */}
          {bs.phase === 'question' && bs.question && (
            <>
              <div style={styles.metaRow}>
                <span style={{ ...styles.pill, color: CAT_COLORS[bs.question.cat]?.stroke }}>{bs.question.cat}</span>
                <span style={styles.pill}>Thème : {bs.question.theme}</span>
                <span style={styles.pill}>Diff. {bs.chosenLevel}</span>
              </div>
              <p style={styles.question}>{bs.question.q}</p>
              {revealed && (
                <div style={styles.answerBox}>
                  <span style={styles.answerLabel}>Réponse :</span>
                  <strong style={{ color: GOLD }}>{bs.question.a}</strong>
                </div>
              )}
              {!revealed ? (
                <button style={styles.btnPrimary} onClick={() => setRevealed(true)}>Révéler la réponse</button>
              ) : (
                <>
                  <p style={styles.judgeLabel}>Les autres équipes jugent…</p>
                  <div style={styles.judgeRow}>
                    <button style={styles.btnFail} onClick={() => bonusJudge(false)}>✗ Raté</button>
                    <button style={styles.btnSuccess} onClick={() => bonusJudge(true)}>✓ Correct</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* CHOIX ÉQUIPE CIBLE */}
          {bs.phase === 'target' && (
            <>
              <p style={styles.prompt}>Choisissez l'équipe avec qui échanger votre position</p>
              <div style={styles.grid}>
                {teams.map((t, i) => i !== currentTeamIdx && (
                  <button key={t.id} style={{ ...styles.catBtn, borderColor: t.color, color: t.color }}
                          onClick={() => bonusPickTarget(i)}>
                    {t.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* RÉSULTAT */}
          {bs.phase === 'result' && (
            <>
              <div style={{ ...styles.resultBanner, background: bs.success ? '#1a3d00' : '#3d0000',
                            borderColor: bs.success ? '#00e87a' : '#ff4444' }}>
                <span style={{ fontSize: 22 }}>{bs.success ? '⭐' : '✗'}</span>
                <span>{bs.resultText}</span>
              </div>
              <button style={styles.btnGold} onClick={closeBonus}>Continuer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 110, padding: 16, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--surface)', border: `2px solid ${GOLD}`,
    borderRadius: 'var(--radius)', width: '100%', maxWidth: 560,
    maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
    boxShadow: `0 0 40px ${GOLD}44`,
  },
  header: {
    padding: '20px 24px 16px', borderBottom: `2px solid ${GOLD}55`,
    display: 'flex', flexDirection: 'column', gap: 6,
    background: 'linear-gradient(135deg, #3d3400, #1a1a2e)',
  },
  badge: {
    alignSelf: 'flex-start', background: GOLD, color: '#111',
    padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 900, letterSpacing: 1,
  },
  title: { fontSize: 24, fontWeight: 900, color: GOLD },
  desc: { fontSize: 14, color: 'var(--text)', lineHeight: 1.4 },
  progress: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 },
  team: { fontSize: 13, color: 'var(--text-muted)' },
  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
  prompt: { fontSize: 16, fontWeight: 700, textAlign: 'center' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  catBtn: {
    padding: '12px 20px', border: '2px solid', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface2)', fontSize: 15, fontWeight: 700,
  },
  levels: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 },
  levelBtn: {
    background: 'var(--surface2)', border: `2px solid ${GOLD}88`,
    borderRadius: 'var(--radius-sm)', padding: '14px 0', fontSize: 20, fontWeight: 800, color: GOLD,
  },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: {
    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
    background: 'var(--surface2)', color: 'var(--text-muted)',
  },
  question: { fontSize: 20, fontWeight: 700, lineHeight: 1.4, textAlign: 'center' },
  answerBox: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '14px 16px',
    display: 'flex', gap: 10, alignItems: 'center', fontSize: 16,
  },
  answerLabel: { color: 'var(--text-muted)', fontSize: 13 },
  judgeLabel: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' },
  judgeRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btnPrimary: {
    padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
    background: 'var(--surface2)', border: `2px solid ${GOLD}`, color: GOLD,
  },
  btnGold: {
    padding: 14, borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 800,
    background: GOLD, color: '#111', border: 'none',
  },
  btnSuccess: {
    padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
    background: '#1a3d00', border: '2px solid #00e87a', color: '#00e87a',
  },
  btnFail: {
    padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
    background: '#3d0000', border: '2px solid #ff4444', color: '#ff4444',
  },
  resultBanner: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px',
    border: '2px solid', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 600,
  },
};
