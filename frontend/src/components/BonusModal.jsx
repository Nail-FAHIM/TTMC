import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { CATS, CAT_COLORS } from '../constants/categories.js';

const THEME = {
  bonus: { accent: '#F5D020', badge: '⭐ BONUS', bg: 'linear-gradient(135deg, #3d3400, #1a1a2e)' },
  malus: { accent: '#ff4444', badge: '💀 MALUS', bg: 'linear-gradient(135deg, #3d0000, #1a1a2e)' },
};

export default function BonusModal() {
  const {
    bonusSession, teams, currentTeamIdx,
    bonusBegin, bonusConfirm, bonusPickOption, bonusPickCategory,
    bonusPickLevel, bonusJudge, bonusPickTarget, closeBonus,
  } = useGameStore();

  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const firedRef = useRef(false);

  const phase = bonusSession?.phase;
  const roundIdx = bonusSession?.roundIdx;
  const timerSecs = bonusSession?.card?.q?.timer;

  useEffect(() => { setRevealed(false); }, [phase, roundIdx]);

  // Chrono pour les phases 'question' / 'challenge' des cartes chronométrées
  useEffect(() => {
    firedRef.current = false;
    if (!timerSecs || (phase !== 'question' && phase !== 'challenge')) { setTimeLeft(null); return; }
    setTimeLeft(timerSecs);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t == null) return t;
        if (t <= 1) {
          clearInterval(id);
          if (!firedRef.current) { firedRef.current = true; setTimeout(() => useGameStore.getState().bonusJudge(false), 0); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, roundIdx, timerSecs]);

  if (!bonusSession) return null;
  const bs = bonusSession;
  const card = bs.card;
  const team = teams[currentTeamIdx];
  const T = THEME[bs.kind] || THEME.bonus;
  const A = T.accent;

  const levelRange = () => {
    const [lo, hi] = bs.levelBounds || [1, 10];
    const arr = []; for (let i = lo; i <= hi; i++) arr.push(i);
    return arr;
  };

  const catLabel = bs.categoryMode === 'behind' ? 'L\'équipe juste derrière impose la catégorie'
    : bs.categoryMode === 'adversary' ? '👥 L\'équipe adverse impose la catégorie'
    : 'Choisissez une catégorie (différente de votre case)';
  const levelLabel = bs.isVote ? '👥 Les autres équipes votent la difficulté'
    : bs.isAdversary ? '👥 L\'équipe adverse impose la difficulté'
    : bs.isBet ? '🎭 Annoncez une difficulté (avant de voir la question)'
    : 'Choisissez la difficulté';

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, border: `2px solid ${A}`, boxShadow: `0 0 40px ${A}44` }}>
        <div style={{ ...styles.header, borderBottom: `2px solid ${A}55`, background: T.bg }}>
          <div style={{ ...styles.badge, background: A, color: bs.kind === 'malus' ? '#fff' : '#111' }}>{T.badge}</div>
          <h2 style={{ ...styles.title, color: A }}>{card.titre}</h2>
          <p style={styles.desc}>{card.description}</p>
          {bs.member && <p style={styles.member}>🎯 Membre désigné : <strong>{bs.member}</strong></p>}
          {bs.totalRounds > 1 && !['result', 'options', 'confirm'].includes(bs.phase) && (
            <p style={styles.progress}>Question {Math.min(bs.roundIdx + 1, bs.totalRounds)} / {bs.totalRounds}</p>
          )}
          <p style={styles.team}>Équipe : <strong style={{ color: team?.color }}>{team?.name}</strong></p>
        </div>

        <div style={styles.body}>
          {/* CONFIRMATION */}
          {bs.phase === 'confirm' && (
            <>
              <p style={{ ...styles.prompt, color: A }}>⚠️ Carte à haut risque</p>
              <button style={{ ...styles.btnMain, background: A, color: '#fff' }} onClick={bonusConfirm}>
                Je confirme, lancer la séquence
              </button>
            </>
          )}

          {/* OPTIONS (carte 8) */}
          {bs.phase === 'options' && (
            <div style={styles.col}>
              {card.options.map((o, i) => (
                <button key={i} style={styles.optionBtn} onClick={() => bonusPickOption(i)}>{o.label}</button>
              ))}
            </div>
          )}

          {/* INTRO */}
          {bs.phase === 'intro' && (
            <button style={{ ...styles.btnMain, background: A, color: bs.kind === 'malus' ? '#fff' : '#111' }} onClick={bonusBegin}>
              Commencer
            </button>
          )}

          {/* CATÉGORIE */}
          {bs.phase === 'category' && (
            <>
              <p style={styles.prompt}>{catLabel}</p>
              <div style={styles.grid}>
                {CATS.filter(c => bs.categoryMode !== 'chooseOther' || c !== bs.cellCat).map(c => (
                  <button key={c} style={{ ...styles.catBtn, borderColor: CAT_COLORS[c].stroke, color: CAT_COLORS[c].stroke }}
                          onClick={() => bonusPickCategory(c)}>{c}</button>
                ))}
              </div>
            </>
          )}

          {/* NIVEAU / CHOOSE3 / PICKVALUES */}
          {(bs.phase === 'level' || bs.phase === 'choose3') && (
            <>
              <p style={styles.prompt}>{bs.phase === 'choose3' ? '🎲 Choisissez une difficulté' : levelLabel}</p>
              <div style={styles.levels}>
                {(bs.phase === 'choose3' ? bs.choose3 : levelRange()).map(l => (
                  <button key={l} style={{ ...styles.levelBtn, borderColor: `${A}88`, color: A }}
                          onClick={() => bonusPickLevel(l)}>{l}</button>
                ))}
              </div>
            </>
          )}

          {/* ENTRE DEUX QUESTIONS */}
          {bs.phase === 'between' && (
            <button style={{ ...styles.btnMain, background: A, color: bs.kind === 'malus' ? '#fff' : '#111' }} onClick={bonusBegin}>
              Question suivante →
            </button>
          )}

          {/* DÉFI LIBRE */}
          {bs.phase === 'challenge' && (
            <>
              {timeLeft != null && <Timer timeLeft={timeLeft} total={timerSecs} />}
              <p style={styles.question}>{card.q.freeChallenge}</p>
              <p style={styles.judgeLabel}>Les autres équipes valident</p>
              <div style={styles.judgeRow}>
                <button style={styles.btnFail} onClick={() => bonusJudge(false)}>✗ Raté</button>
                <button style={styles.btnSuccess} onClick={() => bonusJudge(true)}>✓ Réussi</button>
              </div>
            </>
          )}

          {/* QUESTION */}
          {bs.phase === 'question' && bs.question && (
            <>
              {timeLeft != null && <Timer timeLeft={timeLeft} total={timerSecs} />}
              <div style={styles.metaRow}>
                <span style={{ ...styles.pill, color: CAT_COLORS[bs.question.cat]?.stroke }}>{bs.question.cat}</span>
                <span style={styles.pill}>Thème : {bs.question.theme}</span>
                <span style={styles.pill}>Diff. {bs.chosenLevel}</span>
              </div>
              <p style={styles.question}>{bs.question.q}</p>
              {revealed && (
                <div style={styles.answerBox}>
                  <span style={styles.answerLabel}>Réponse :</span>
                  <strong style={{ color: A }}>{bs.question.a}</strong>
                </div>
              )}
              {!revealed ? (
                <button style={{ ...styles.btnPrimary, borderColor: A, color: A }} onClick={() => setRevealed(true)}>
                  Révéler la réponse
                </button>
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

          {/* CIBLE (swap bonus) */}
          {bs.phase === 'target' && (
            <>
              <p style={styles.prompt}>Choisissez l'équipe avec qui échanger votre position</p>
              <div style={styles.grid}>
                {teams.map((t, i) => i !== currentTeamIdx && (
                  <button key={t.id} style={{ ...styles.catBtn, borderColor: t.color, color: t.color }}
                          onClick={() => bonusPickTarget(i)}>{t.name}</button>
                ))}
              </div>
            </>
          )}

          {/* RÉSULTAT */}
          {bs.phase === 'result' && (
            <>
              <div style={{ ...styles.resultBanner,
                            background: bs.defeat ? '#3d0000' : bs.success ? '#1a3d00' : '#2a1500',
                            borderColor: bs.defeat ? '#ff4444' : bs.success ? '#00e87a' : '#ffb400' }}>
                <span style={{ fontSize: 22 }}>{bs.defeat ? '💀' : bs.success ? '⭐' : '➖'}</span>
                <span>{bs.resultText}</span>
              </div>
              <button style={{ ...styles.btnMain, background: A, color: bs.kind === 'malus' ? '#fff' : '#111' }} onClick={closeBonus}>
                Continuer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Timer({ timeLeft, total }) {
  const col = timeLeft <= 5 ? '#ff4444' : timeLeft <= 10 ? '#ffb400' : '#00e87a';
  return (
    <div style={styles.timerWrap}>
      <div style={styles.timerBg}>
        <div style={{ height: '100%', borderRadius: 4, width: `${(timeLeft / total) * 100}%`, background: col, transition: 'width 1s linear' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: col, minWidth: 42, textAlign: 'right' }}>⏱ {timeLeft}s</span>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 16, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: { padding: '20px 24px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  badge: { alignSelf: 'flex-start', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 900, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: 900 },
  desc: { fontSize: 14, color: 'var(--text)', lineHeight: 1.4 },
  member: { fontSize: 13, color: 'var(--text)' },
  progress: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 },
  team: { fontSize: 13, color: 'var(--text-muted)' },
  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 },
  prompt: { fontSize: 16, fontWeight: 700, textAlign: 'center' },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  catBtn: { padding: '12px 20px', border: '2px solid', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', fontSize: 15, fontWeight: 700 },
  optionBtn: { padding: '14px 16px', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 15, fontWeight: 600, textAlign: 'left' },
  levels: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 },
  levelBtn: { background: 'var(--surface2)', border: '2px solid', borderRadius: 'var(--radius-sm)', padding: '14px 0', fontSize: 20, fontWeight: 800 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: { fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: 'var(--surface2)', color: 'var(--text-muted)' },
  question: { fontSize: 20, fontWeight: 700, lineHeight: 1.4, textAlign: 'center' },
  answerBox: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center', fontSize: 16 },
  answerLabel: { color: 'var(--text-muted)', fontSize: 13 },
  judgeLabel: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' },
  judgeRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btnPrimary: { padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, background: 'var(--surface2)', border: '2px solid', },
  btnMain: { padding: 14, borderRadius: 'var(--radius-sm)', fontSize: 16, fontWeight: 800, border: 'none' },
  btnSuccess: { padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, background: '#1a3d00', border: '2px solid #00e87a', color: '#00e87a' },
  btnFail: { padding: 13, borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700, background: '#3d0000', border: '2px solid #ff4444', color: '#ff4444' },
  resultBanner: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', border: '2px solid', borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 600 },
  timerWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  timerBg: { flex: 1, height: 8, borderRadius: 4, background: 'var(--surface2)', overflow: 'hidden' },
};
