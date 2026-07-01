import { useState, useEffect, useMemo } from 'react';
import { useGameStore, CAT_COLORS } from '../store/gameStore.js';
import { playCorrect, playWrong } from '../utils/sound.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getLevelColor(lvl) {
  if (lvl <= 3) return '#00e87a';
  if (lvl <= 6) return '#ffb400';
  return '#ff4444';
}

export default function Modal() {
  const {
    modalOpen, currentQuestion, teams, currentTeamIdx, questionId, config,
    confirmLevel, selectChoice, judgeAnswer, closeModal, chooseStartTeam,
  } = useGameStore();

  const [step, setStep] = useState('level');
  const [chosenLevel, setChosenLevel] = useState(null);
  const [chosenChoice, setChosenChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timedOut, setTimedOut] = useState(false);

  const timerCfg = config?.timer || { enabled: false, seconds: 30 };

  // ⚠ useMemo AVANT tout early return — règle des hooks React
  const shuffledChoices = useMemo(() => {
    if (!currentQuestion?.choices) return null;
    return shuffle(currentQuestion.choices);
  }, [currentQuestion]);

  // Reset basé sur questionId (stable) — currentQuestion change quand on tire
  // la question après la mise, on ne veut pas re-déclencher le reset à ce moment.
  useEffect(() => {
    if (modalOpen && currentQuestion) {
      const skipLevel = currentQuestion.isDebut || currentQuestion.isFinale || currentQuestion.isBonusMalus;
      setStep(skipLevel ? 'answer' : 'level');
      setChosenLevel(null);
      setChosenChoice(null);
      setRevealed(false);
      setTimedOut(false);
      setTimeLeft(null);
    }
  }, [modalOpen, questionId]);

  // Chrono : actif pendant qu'on répond à une vraie question (pas carte/bonus/malus)
  const timerActive =
    modalOpen && timerCfg.enabled && step === 'answer' &&
    !currentQuestion?.isDebut && !currentQuestion?.isBonusMalus &&
    !chosenChoice && !revealed && !timedOut;

  useEffect(() => {
    if (!timerActive) return;
    // (re)démarre le compte à rebours à l'entrée de la phase réponse
    setTimeLeft(prev => (prev == null ? timerCfg.seconds : prev));
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t == null) return t;
        if (t <= 1) { clearInterval(id); setTimedOut(true); setRevealed(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive, questionId]);

  // Early return APRÈS tous les hooks
  if (!modalOpen || !currentQuestion) return null;

  const team = teams[currentTeamIdx];
  const cat = currentQuestion.cat;
  const colors = cat ? CAT_COLORS[cat] : null;
  const accent = colors?.stroke || '#7c3aed';
  const headerBg = colors?.fill || '#1a1a2e';

  const isDebut      = currentQuestion.isDebut;
  const isFinale     = currentQuestion.isFinale;
  const isBonusMalus = currentQuestion.isBonusMalus;
  const isMCQ = !!shuffledChoices && step === 'answer' && !isDebut && !isBonusMalus;

  function handleLevelSelect(lvl) {
    setChosenLevel(lvl);
    confirmLevel(lvl);
    setStep('answer');
  }

  function handleChoiceClick(choice) {
    if (chosenChoice) return;
    setChosenChoice(choice);
    selectChoice(choice);
    (choice === currentQuestion.a ? playCorrect : playWrong)();
  }

  function handleJudge(correct) {
    (correct ? playCorrect : playWrong)();
    judgeAnswer(correct);
    closeModal(correct);
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal(false)}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={{ ...styles.header, background: headerBg, borderBottomColor: accent }}>
          <div style={{ ...styles.catBadge, background: accent }}>
            {isDebut ? 'Départ' : isFinale ? 'Arrivée' : isBonusMalus ? currentQuestion.theme : cat}
          </div>
          {/* Thème précis (ex. « Football ») sous la catégorie */}
          {!isDebut && !isFinale && !isBonusMalus && currentQuestion.theme && (
            <p style={{ ...styles.theme, color: accent }}>
              <span style={styles.themeLabel}>Thème : </span>{currentQuestion.theme}
            </p>
          )}
          {(isFinale || isBonusMalus) && currentQuestion.theme && (
            <p style={{ ...styles.theme, color: accent }}>{currentQuestion.theme}</p>
          )}
          {!(isDebut && currentQuestion.pickStart) && (
            <p style={styles.teamLabel}>
              Tour de <strong style={{ color: team?.color }}>{team?.name}</strong>
            </p>
          )}
        </div>

        {/* Body */}
        <div style={styles.body}>

          {/* Étape 1 : choisir son niveau */}
          {step === 'level' && (
            <>
              <p style={styles.prompt}>Tu te cotes combien ?</p>
              <p style={styles.hint}>Choisis ton niveau (1 = facile → 10 = expert)</p>
              <div style={styles.levels}>
                {LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    style={{ ...styles.levelBtn, borderColor: getLevelColor(lvl) + '99' }}
                    onClick={() => handleLevelSelect(lvl)}
                  >
                    <span style={{ ...styles.levelNum, color: getLevelColor(lvl) }}>{lvl}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Étape 2 : question */}
          {step === 'answer' && (
            <>
              {chosenLevel && (
                <div style={{ ...styles.levelPill, borderColor: accent }}>
                  Mise : <strong style={{ color: accent }}>{chosenLevel}</strong> case{chosenLevel > 1 ? 's' : ''}
                </div>
              )}

              {/* Chrono */}
              {timerCfg.enabled && !isDebut && !isBonusMalus && timeLeft != null && (
                <div style={styles.timerWrap}>
                  <div style={styles.timerBarBg}>
                    <div style={{
                      ...styles.timerBarFill,
                      width: `${(timeLeft / timerCfg.seconds) * 100}%`,
                      background: timeLeft <= 5 ? '#ff4444' : timeLeft <= 10 ? '#ffb400' : '#00e87a',
                    }} />
                  </div>
                  <span style={{
                    ...styles.timerNum,
                    color: timeLeft <= 5 ? '#ff4444' : 'var(--text)',
                  }}>
                    {timedOut ? '⏱ Temps écoulé' : `⏱ ${timeLeft}s`}
                  </span>
                </div>
              )}

              <p style={styles.question}>{currentQuestion.q}</p>

              {/* QCM */}
              {isMCQ && (
                <div style={styles.choices}>
                  {shuffledChoices.map((choice, i) => {
                    let bg = 'var(--surface2)';
                    let border = 'var(--border)';
                    if (chosenChoice) {
                      if (choice === currentQuestion.a) { bg = '#1a3d00'; border = '#00e87a'; }
                      else if (choice === chosenChoice) { bg = '#3d0000'; border = '#ff4444'; }
                    }
                    return (
                      <button
                        key={i}
                        style={{ ...styles.choiceBtn, background: bg, borderColor: border, opacity: timedOut ? 0.6 : 1 }}
                        onClick={() => handleChoiceClick(choice)}
                        disabled={!!chosenChoice || timedOut}
                      >
                        <span style={styles.choiceLetter}>{String.fromCharCode(65 + i)}</span>
                        {choice}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Réponse — cachée jusqu'à révélation */}
              {!isDebut && (chosenChoice || revealed) && (
                <div style={styles.answerBox}>
                  <span style={styles.answerLabel}>Réponse :</span>
                  <strong style={{ color: accent }}>{currentQuestion.a}</strong>
                </div>
              )}

              {/* Actions */}
              <div style={styles.actions}>
                {/* Temps écoulé → question ratée */}
                {timedOut && !isDebut && !isBonusMalus && (
                  <>
                    <p style={{ ...styles.judgeLabel, color: '#ff4444', fontWeight: 700 }}>
                      ⏱ Temps écoulé — question ratée
                    </p>
                    <button style={styles.btnFail} onClick={() => closeModal(false)}>
                      Continuer
                    </button>
                  </>
                )}
                {isDebut && currentQuestion.pickStart && (
                  <>
                    <p style={styles.judgeLabel}>Quelle équipe commence ?</p>
                    <div style={styles.startTeams}>
                      {teams.map((t, i) => (
                        <button key={t.id}
                          style={{ ...styles.startTeamBtn, borderColor: t.color, color: t.color }}
                          onClick={() => chooseStartTeam(i)}>
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {isDebut && !currentQuestion.pickStart && (
                  <button style={styles.btnPrimary} onClick={() => closeModal(false)}>
                    OK, on a décidé !
                  </button>
                )}
                {isBonusMalus && (
                  <button style={currentQuestion.isBonus ? styles.btnSuccess : styles.btnFail}
                          onClick={() => closeModal(true)}>
                    {currentQuestion.isBonus ? '⭐ Avancer !' : '💀 Appliquer'}
                  </button>
                )}
                {!timedOut && !isDebut && !isBonusMalus && isMCQ && chosenChoice && (
                  <button style={styles.btnSuccess} onClick={() => closeModal(chosenChoice === currentQuestion.a)}>
                    Continuer
                  </button>
                )}
                {!timedOut && !isDebut && !isBonusMalus && !isMCQ && (
                  <>
                    {!revealed && (
                      <button
                        style={{ ...styles.btnPrimary, borderColor: accent, color: accent }}
                        onClick={() => setRevealed(true)}
                      >
                        Révéler la réponse
                      </button>
                    )}
                    {revealed && (
                      <>
                        <p style={styles.judgeLabel}>Les autres équipes jugent…</p>
                        <div style={styles.judgeRow}>
                          <button style={styles.btnFail} onClick={() => handleJudge(false)}>✗ Raté</button>
                          <button style={styles.btnSuccess} onClick={() => handleJudge(true)}>✓ Correct</button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    width: '100%', maxWidth: '560px', maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '2px solid',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  catBadge: {
    display: 'inline-block', padding: '3px 10px',
    borderRadius: '20px', fontSize: '11px', fontWeight: 700,
    color: '#000', alignSelf: 'flex-start',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  theme: { fontSize: '18px', fontWeight: 700 },
  themeLabel: { fontSize: '13px', fontWeight: 500, opacity: 0.7 },
  teamLabel: { fontSize: '13px', color: 'var(--text-muted)' },
  body: {
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  prompt: { fontSize: '22px', fontWeight: 800, textAlign: 'center' },
  hint: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' },
  levels: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px',
  },
  levelBtn: {
    background: 'var(--surface2)', border: '2px solid',
    borderRadius: 'var(--radius-sm)', padding: '14px 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  levelNum: { fontSize: '20px', fontWeight: 800 },
  levelPill: {
    display: 'inline-flex', alignSelf: 'flex-start',
    padding: '4px 14px', border: '1px solid',
    borderRadius: '20px', fontSize: '13px',
  },
  question: { fontSize: '20px', fontWeight: 700, lineHeight: 1.5, textAlign: 'center', whiteSpace: 'pre-line' },
  choices: { display: 'flex', flexDirection: 'column', gap: '10px' },
  choiceBtn: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', border: '2px solid',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)',
    fontSize: '14px', fontWeight: 500, textAlign: 'left',
  },
  choiceLetter: {
    background: 'rgba(255,255,255,0.1)', borderRadius: '4px',
    padding: '2px 8px', fontSize: '12px', fontWeight: 700, flexShrink: 0,
  },
  answerBox: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '14px 16px',
    display: 'flex', gap: '10px', alignItems: 'center', fontSize: '16px',
  },
  answerLabel: { color: 'var(--text-muted)', fontSize: '13px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' },
  judgeLabel: { textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' },
  judgeRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  timerWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  timerBarBg: {
    flex: 1, height: '8px', borderRadius: '4px',
    background: 'var(--surface2)', overflow: 'hidden',
  },
  timerBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1s linear, background 0.3s' },
  timerNum: { fontSize: '13px', fontWeight: 700, minWidth: '48px', textAlign: 'right' },
  startTeams: { display: 'flex', flexDirection: 'column', gap: '10px' },
  startTeamBtn: {
    padding: '13px', borderRadius: 'var(--radius-sm)',
    fontSize: '15px', fontWeight: 700,
    background: 'var(--surface2)', border: '2px solid',
  },
  btnPrimary: {
    padding: '13px', borderRadius: 'var(--radius-sm)',
    fontSize: '15px', fontWeight: 700,
    background: 'var(--surface2)', border: '2px solid var(--border)', color: 'var(--text)',
  },
  btnSuccess: {
    padding: '13px', borderRadius: 'var(--radius-sm)',
    fontSize: '15px', fontWeight: 700,
    background: '#1a3d00', border: '2px solid #00e87a', color: '#00e87a',
  },
  btnFail: {
    padding: '13px', borderRadius: 'var(--radius-sm)',
    fontSize: '15px', fontWeight: 700,
    background: '#3d0000', border: '2px solid #ff4444', color: '#ff4444',
  },
};
