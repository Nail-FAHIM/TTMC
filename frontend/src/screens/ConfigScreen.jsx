import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, PION_COLORS } from '../store/gameStore.js';
import { CATS } from '../constants/categories.js';
import { GAME_TITLE } from '../constants/labels.js';

const TEAM_LIMIT = 6;

export default function ConfigScreen() {
  const navigate = useNavigate();
  const {
    teamConfigs, questionsData, config,
    addTeamConfig, removeTeamConfig,
    updateTeamConfig, updatePlayerName, addPlayer, removePlayer,
    startGame,
  } = useGameStore();

  // Nb de thèmes activés
  const enabledCount = Object.values(config.enabledThemes).filter(v => v !== false).length;
  const canStart =
    questionsData &&
    teamConfigs.length >= 1 &&
    enabledCount >= config.minThemes;

  function handleStart() {
    if (!canStart) return;
    const validConfigs = teamConfigs.map((cfg, i) => ({
      ...cfg,
      name: cfg.name.trim() || `Équipe ${i + 1}`,
      players: cfg.players.map((p, pi) => p.trim() || `Joueur ${pi + 1}`).filter(Boolean),
    }));
    useGameStore.setState({ teamConfigs: validConfigs });
    startGame();
    navigate('/game');
  }

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>{GAME_TITLE.full}</h1>
        <p style={styles.subtitle}>Configurer la partie</p>
      </div>

      {/* ── Équipes ── */}
      <Section title="Équipes" defaultOpen>
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
      </Section>

      {/* ── A1 Thèmes ── */}
      <ThemesSection enabledCount={enabledCount} />

      {/* ── A2 Difficulté ── */}
      <DifficultySection />

      {/* ── A4 Nombre de questions + A3 deck ── */}
      <DeckSection />

      {/* ── A5 Cases spéciales ── */}
      <SpecialCellsSection />

      {/* ── A6 Équipe qui commence ── */}
      <StartModeSection teamConfigs={teamConfigs} />

      <div style={styles.footer}>
        {!questionsData && <p style={styles.loading}>Chargement des questions…</p>}
        {questionsData && enabledCount < config.minThemes && (
          <p style={styles.warn}>
            Sélectionne au moins {config.minThemes} thèmes ({enabledCount} actuellement).
          </p>
        )}
        {teamConfigs.length === 0 && questionsData && (
          <p style={styles.warn}>Ajoute au moins une équipe.</p>
        )}
        <button
          style={{ ...styles.startBtn, opacity: canStart ? 1 : 0.4 }}
          onClick={handleStart}
          disabled={!canStart}
        >
          Lancer la partie →
        </button>
      </div>
    </div>
  );
}

// ─── Section pliable réutilisable ───────────────────────────────────────────
function Section({ title, children, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={styles.section}>
      <button style={styles.sectionHead} onClick={() => setOpen(o => !o)}>
        <span style={styles.sectionTitle}>{title}</span>
        {badge != null && <span style={styles.sectionBadge}>{badge}</span>}
        <span style={styles.chevron}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div style={styles.sectionBody}>{children}</div>}
    </div>
  );
}

// ─── A1 Thèmes ──────────────────────────────────────────────────────────────
function ThemesSection({ enabledCount }) {
  const { questionsData, config, toggleTheme, setCategoryThemes } = useGameStore();
  if (!questionsData) return null;

  return (
    <Section title="Thèmes joués" badge={enabledCount}>
      <p style={styles.help}>Seuls les thèmes cochés sont tirés pendant la partie.</p>
      {CATS.map(cat => {
        const themes = questionsData[cat] || [];
        const allOn = themes.every((_, ti) => config.enabledThemes[`${cat}:${ti}`] !== false);
        return (
          <div key={cat} style={styles.catBlock}>
            <div style={styles.catHead}>
              <strong>{cat}</strong>
              <button
                style={styles.miniBtn}
                onClick={() => setCategoryThemes(cat, !allOn)}
              >
                {allOn ? 'Tout décocher' : 'Tout cocher'}
              </button>
            </div>
            <div style={styles.themeGrid}>
              {themes.map((t, ti) => {
                const on = config.enabledThemes[`${cat}:${ti}`] !== false;
                return (
                  <label key={ti} style={{ ...styles.themeChip, opacity: on ? 1 : 0.4 }}>
                    <input type="checkbox" checked={on} onChange={() => toggleTheme(cat, ti)} />
                    <span>{t.theme.replace(/\s*\(.*\)$/, '')}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </Section>
  );
}

// ─── A2 Difficulté ──────────────────────────────────────────────────────────
function DifficultySection() {
  const { config, setConfig, setDifficultyLevel, toggleExcludedLevel } = useGameStore();
  const custom = config.difficultyMode === 'custom';

  return (
    <Section title="Attribution des difficultés" badge={custom ? 'Perso' : 'Standard'}>
      <div style={styles.radioRow}>
        <label style={styles.radioLabel}>
          <input type="radio" checked={!custom}
                 onChange={() => setConfig({ difficultyMode: 'standard' })} />
          Standard (note = difficulté)
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" checked={custom}
                 onChange={() => setConfig({ difficultyMode: 'custom' })} />
          Personnalisé
        </label>
      </div>

      {custom && (
        <div style={styles.customDiff}>
          <label style={styles.sliderRow}>
            Difficulté max : <strong>{config.maxDifficulty}</strong>
            <input type="range" min="1" max="10" value={config.maxDifficulty}
                   onChange={e => setConfig({ maxDifficulty: +e.target.value })} />
          </label>

          <p style={styles.help}>Remapper chaque note (1-10) vers une difficulté :</p>
          <div style={styles.mapGrid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(note => (
              <div key={note} style={styles.mapCell}>
                <span style={styles.mapNote}>{note}</span>
                <select
                  value={config.difficultyMap[note]}
                  onChange={e => setDifficultyLevel(note, +e.target.value)}
                  style={styles.mapSelect}
                >
                  {Array.from({ length: 10 }, (_, j) => j + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p style={styles.help}>Exclure des niveaux (jamais tirés) :</p>
          <div style={styles.themeGrid}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(lvl => {
              const ex = config.excludedLevels.includes(lvl);
              return (
                <label key={lvl} style={{ ...styles.themeChip, opacity: ex ? 0.5 : 1 }}>
                  <input type="checkbox" checked={ex} onChange={() => toggleExcludedLevel(lvl)} />
                  <span>Niv {lvl}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── A3 + A4 Deck & nombre de questions ─────────────────────────────────────
function DeckSection() {
  const { config, setConfig, resetDecks } = useGameStore();
  const limited = config.questionLimit != null;

  return (
    <Section title="Deck & nombre de questions">
      {/* A4 */}
      <div style={styles.radioRow}>
        <label style={styles.radioLabel}>
          <input type="radio" checked={!limited}
                 onChange={() => setConfig({ questionLimit: null })} />
          Illimité (jusqu'à l'arrivée)
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" checked={limited}
                 onChange={() => setConfig({ questionLimit: 20 })} />
          Limité
        </label>
      </div>
      {limited && (
        <label style={styles.sliderRow}>
          Nombre de questions : <strong>{config.questionLimit}</strong>
          <input type="range" min="5" max="60" step="5" value={config.questionLimit}
                 onChange={e => setConfig({ questionLimit: +e.target.value })} />
        </label>
      )}

      {/* A3 */}
      <label style={styles.checkRow}>
        <input type="checkbox" checked={config.allowRepeat}
               onChange={e => setConfig({ allowRepeat: e.target.checked })} />
        Autoriser les répétitions de questions
      </label>
      <label style={styles.checkRow}>
        <input type="checkbox" checked={config.autoReshuffle}
               onChange={e => setConfig({ autoReshuffle: e.target.checked })} />
        Re-mélanger automatiquement quand le deck est épuisé
      </label>
      <button style={styles.miniBtn} onClick={resetDecks}>
        ↺ Réinitialiser les questions déjà posées
      </button>
    </Section>
  );
}

// ─── A5 Cases spéciales ─────────────────────────────────────────────────────
function SpecialCellsSection() {
  const { config, setSpecialCell, addCustomCell, removeCustomCell } = useGameStore();
  const [newCell, setNewCell] = useState({ name: '', type: 'bonus', move: 2, index: 5 });

  return (
    <Section title="Cases spéciales">
      <div style={styles.specialRow}>
        <label style={styles.checkRow}>
          <input type="checkbox" checked={config.specialCells.bonus.enabled}
                 onChange={e => setSpecialCell('bonus', { enabled: e.target.checked })} />
          « C'est superbe » (bonus)
        </label>
        <label style={styles.sliderRow}>
          +{config.specialCells.bonus.move} cases
          <input type="range" min="1" max="6" value={config.specialCells.bonus.move}
                 onChange={e => setSpecialCell('bonus', { move: +e.target.value })} />
        </label>
      </div>

      <div style={styles.specialRow}>
        <label style={styles.checkRow}>
          <input type="checkbox" checked={config.specialCells.malus.enabled}
                 onChange={e => setSpecialCell('malus', { enabled: e.target.checked })} />
          « Ça va pas du tout » (malus)
        </label>
        <label style={styles.sliderRow}>
          {config.specialCells.malus.move} cases
          <input type="range" min="-6" max="-1" value={config.specialCells.malus.move}
                 onChange={e => setSpecialCell('malus', { move: +e.target.value })} />
        </label>
      </div>

      <label style={styles.checkRow}>
        <input type="checkbox" checked={config.specialCells.challenge.enabled}
               onChange={e => setSpecialCell('challenge', { enabled: e.target.checked })} />
        « Challenge » (question catégorie aléatoire)
      </label>

      {/* Cartes custom */}
      <div style={styles.customCellBox}>
        <p style={styles.help}>Ajouter une carte spéciale custom :</p>
        <div style={styles.customCellForm}>
          <input style={styles.smallInput} placeholder="Nom"
                 value={newCell.name}
                 onChange={e => setNewCell({ ...newCell, name: e.target.value })} />
          <select style={styles.smallInput} value={newCell.type}
                  onChange={e => setNewCell({ ...newCell, type: e.target.value })}>
            <option value="bonus">Bonus</option>
            <option value="malus">Malus</option>
          </select>
          <input style={styles.smallInput} type="number" min="1" max="6" placeholder="Cases"
                 value={newCell.move}
                 onChange={e => setNewCell({ ...newCell, move: +e.target.value })} />
          <input style={styles.smallInput} type="number" min="1" max="40" placeholder="Case n°"
                 value={newCell.index}
                 onChange={e => setNewCell({ ...newCell, index: +e.target.value })} />
          <button style={styles.miniBtn}
                  onClick={() => {
                    if (!newCell.name.trim()) return;
                    addCustomCell({ ...newCell, name: newCell.name.trim(), index: newCell.index - 1 });
                    setNewCell({ name: '', type: 'bonus', move: 2, index: 5 });
                  }}>
            + Ajouter
          </button>
        </div>
        {config.customCells.map(c => (
          <div key={c.id} style={styles.customCellItem}>
            <span>{c.name} · {c.type} · {c.type === 'malus' ? '-' : '+'}{Math.abs(c.move)} · case {c.index + 1}</span>
            <button style={styles.removePlayerBtn} onClick={() => removeCustomCell(c.id)}>✕</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── A6 Équipe qui commence ─────────────────────────────────────────────────
function StartModeSection({ teamConfigs }) {
  const { config, setConfig } = useGameStore();
  return (
    <Section title="Qui commence ?" badge={
      config.startMode === 'card' ? 'Carte' : config.startMode === 'manual' ? 'Manuel' : 'Aléatoire'
    }>
      <div style={styles.radioCol}>
        <label style={styles.radioLabel}>
          <input type="radio" checked={config.startMode === 'card'}
                 onChange={() => setConfig({ startMode: 'card' })} />
          Carte « Hésite pas à débuter » (tirage rigolo)
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" checked={config.startMode === 'random'}
                 onChange={() => setConfig({ startMode: 'random' })} />
          Aléatoire
        </label>
        <label style={styles.radioLabel}>
          <input type="radio" checked={config.startMode === 'manual'}
                 onChange={() => setConfig({ startMode: 'manual' })} />
          Manuel
        </label>
      </div>
      {config.startMode === 'manual' && (
        <select style={styles.smallInput} value={config.startTeamIdx}
                onChange={e => setConfig({ startTeamIdx: +e.target.value })}>
          {teamConfigs.map((t, i) => (
            <option key={i} value={i}>{t.name?.trim() || `Équipe ${i + 1}`}</option>
          ))}
        </select>
      )}
    </Section>
  );
}

// ─── TeamCard ───────────────────────────────────────────────────────────────
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
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    overflowY: 'auto', padding: '32px 16px 120px', gap: '16px',
    maxWidth: '960px', margin: '0 auto', width: '100%',
  },
  header: { textAlign: 'center', marginBottom: '8px' },
  title: {
    fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 900,
    background: 'linear-gradient(135deg, #00c3ff, #7c3aed, #ff1a6b)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: { color: 'var(--text-muted)', marginTop: '6px', fontSize: '15px' },

  section: {
    width: '100%', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  sectionHead: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 18px', background: 'transparent', color: 'var(--text)',
    fontSize: '16px', fontWeight: 700, textAlign: 'left',
  },
  sectionTitle: { flex: 1 },
  sectionBadge: {
    fontSize: '12px', fontWeight: 700, padding: '2px 10px',
    borderRadius: '12px', background: 'var(--surface2)', color: 'var(--text-muted)',
  },
  chevron: { color: 'var(--text-muted)', fontSize: '14px' },
  sectionBody: {
    padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '14px',
  },
  help: { fontSize: '13px', color: 'var(--text-muted)', margin: 0 },

  teamsContainer: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px', width: '100%',
  },
  card: {
    background: 'var(--surface2)', border: '2px solid', borderRadius: 'var(--radius)',
    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  pionDot: { width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 8px currentColor' },
  teamNameInput: {
    flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)',
    fontSize: '15px', fontWeight: 600,
  },
  removeBtn: { background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', padding: '4px 8px', borderRadius: '4px' },
  playersList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  playerRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  playerNum: { color: 'var(--text-muted)', fontSize: '12px', width: '16px', textAlign: 'center', flexShrink: 0 },
  playerInput: {
    flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--text)', fontSize: '13px',
  },
  removePlayerBtn: { background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', padding: '4px 6px' },
  addPlayerBtn: {
    background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)', padding: '8px', fontSize: '13px',
  },
  addTeamBtn: {
    background: 'var(--surface2)', border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-muted)', padding: '32px', fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  catBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  catHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  miniBtn: {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text)', padding: '6px 12px', fontSize: '12px', fontWeight: 600, alignSelf: 'flex-start',
  },
  themeGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  themeChip: {
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
  },

  radioRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  radioCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' },
  customDiff: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mapGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' },
  mapCell: { display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' },
  mapNote: { fontSize: '13px', fontWeight: 700, width: '20px', textAlign: 'right', color: 'var(--text-muted)' },
  mapSelect: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '4px' },

  specialRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  customCellBox: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)' },
  customCellForm: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  smallInput: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', padding: '6px 8px', fontSize: '13px', maxWidth: '120px' },
  customCellItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', background: 'var(--surface2)', borderRadius: '6px', padding: '6px 10px' },

  footer: {
    position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px',
    background: 'linear-gradient(to top, var(--bg) 80%, transparent)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  loading: { color: 'var(--text-muted)', fontSize: '13px' },
  warn: { color: '#ffb400', fontSize: '13px', margin: 0 },
  startBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #00c3ff)', color: '#fff',
    borderRadius: '50px', padding: '14px 40px', fontSize: '16px', fontWeight: 700,
    boxShadow: '0 4px 20px #7c3aed55',
  },
};
