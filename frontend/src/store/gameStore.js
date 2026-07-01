/**
 * Store Zustand — état global du jeu TTMC.
 * Une seule source de vérité. Jamais de state UI dispersé dans les composants.
 */
import { create } from 'zustand';

import { BOARD_LAYOUT } from '../data/boardLayout.js';
import { BONUS_CARDS } from '../data/bonusCards.js';
import { CATS, CAT_COLORS, PION_COLORS } from '../constants/categories.js';

// Ré-exports pour compat (anciens imports depuis le store)
export { CATS, CAT_COLORS, PION_COLORS };

// Cases spéciales par défaut (indices 0-based, déduits de BOARD_LAYOUT).
// Conservé pour rétro-compat ; la logique se base désormais sur cell.type.
export const SPECIAL_CELLS = {
  bonus:     [9,  24, 38],
  malus:     [3,  17, 32],
  challenge: [6,  21, 36],
  finale:    [40],
};

// ─── Config par défaut ─────────────────────────────────────────────────────────
export function makeDefaultConfig() {
  return {
    // A1 — thèmes activés : { "Scolaire:0": true, ... } rempli au chargement
    enabledThemes: {},
    minThemes: 4,            // nb minimum de thèmes pour pouvoir lancer

    // A2 — difficulté
    difficultyMode: 'standard',   // 'standard' | 'custom'
    maxDifficulty: 10,            // plafond en mode custom
    excludedLevels: [],           // niveaux exclus (custom)
    difficultyMap: Object.fromEntries(             // note (1-10) → difficulté
      Array.from({ length: 10 }, (_, i) => [i + 1, i + 1])
    ),

    // A3 — deck
    allowRepeat: false,      // autoriser qu'une question ressorte
    autoReshuffle: true,     // re-mélanger quand le deck est épuisé

    // A4 — nombre de questions
    questionLimit: null,     // null = illimité

    // Timer par question
    timer: { enabled: false, seconds: 30 },

    // A5 — cases spéciales
    specialCells: {
      bonus:     { enabled: true, move: 3 },
      malus:     { enabled: true, move: -3 },
      challenge: { enabled: true },
    },
    customCells: [],         // [{ id, name, type:'bonus'|'malus', move, index }]

    // A6 — équipe qui commence
    startMode: 'card',       // 'card' | 'manual' | 'random'
    startTeamIdx: 0,
  };
}

// ─── Board layout (avec overrides custom) ──────────────────────────────────────
export function buildCells(customCells = []) {
  const cells = BOARD_LAYOUT.map(cell => ({
    cat: cell.cat || CATS[0],
    type: cell.type,
  }));
  // Appliquer les cases custom : elles remplacent une case existante à leur index
  for (const cc of customCells) {
    if (cc.index >= 0 && cc.index < cells.length) {
      cells[cc.index] = { type: cc.type, custom: true, name: cc.name, move: cc.move };
    }
  }
  return cells;
}

// Index de la prochaine case spéciale (bonus/malus/challenge/finale) après `from`
function nextSpecialIndex(cells, from) {
  for (let i = from + 1; i < cells.length; i++) {
    if (['bonus', 'malus', 'challenge', 'finale'].includes(cells[i].type)) return i;
  }
  return cells.length - 1;
}

// Meilleure autre équipe ('best' = position max) ou celle juste derrière ('behind')
function bestOtherIdx(teams, selfIdx, mode) {
  let res = null;
  teams.forEach((t, i) => {
    if (i === selfIdx) return;
    if (mode === 'best') {
      if (res == null || t.position > teams[res].position) res = i;
    } else { // 'behind' : position la plus haute strictement < à la mienne
      if (t.position < teams[selfIdx].position && (res == null || t.position > teams[res].position)) res = i;
    }
  });
  return res;
}

// Prochaine équipe active en sautant celles qui doivent passer leur tour (skipNext)
function nextActiveTeamIdx(teams, from) {
  const t = teams.map(x => ({ ...x, buffs: { ...x.buffs } }));
  let idx = from;
  for (let guard = 0; guard < t.length; guard++) {
    idx = (idx + 1) % t.length;
    if (t[idx].buffs?.skipNext) { t[idx].buffs.skipNext = false; continue; }
    break;
  }
  return { idx, teams: t };
}

// ─── Utilitaires deck ────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(arr) {
  return shuffle([...arr]);
}

// drawFromDeck respecte allowRepeat / autoReshuffle
function drawFromDeck(deck, full, { allowRepeat = false, autoReshuffle = true } = {}) {
  let d = deck;
  if (d.length === 0) {
    if (autoReshuffle || allowRepeat) d = makeDeck(full);
    else d = makeDeck(full); // fallback : on évite un crash, on re-mélange quand même
  }
  const card = d[0];
  const remaining = allowRepeat ? d : d.slice(1);
  return { card, remaining };
}

// ─── Initialisation équipes ───────────────────────────────────────────────────
function buildTeams(configs) {
  return configs.map((cfg, i) => ({
    id: i,
    name: cfg.name || `Équipe ${i + 1}`,
    players: cfg.players || [],
    color: PION_COLORS[i % PION_COLORS.length],
    banner: cfg.banner || null,
    position: 0,
    score: 0,
    buffs: { shield: false, antiMalus: 0, secondChance: false, skipNext: false },
  }));
}

// Liste des thèmes activés pour une catégorie → indices de thèmes
function enabledThemeIndices(questionsData, enabledThemes, cat) {
  const themes = questionsData[cat] || [];
  const idxs = themes
    .map((_, ti) => ti)
    .filter(ti => enabledThemes[`${cat}:${ti}`] !== false);
  return idxs.length ? idxs : themes.map((_, ti) => ti); // sécurité : jamais vide
}

// Choisir l'index de question le plus proche de la difficulté voulue
function pickByDifficulty(questions, targetLevel) {
  if (targetLevel == null) {
    return Math.floor(Math.random() * questions.length);
  }
  // Grouper par distance de niveau, choisir le plus proche (aléatoire en cas d'égalité)
  let best = [];
  let bestDist = Infinity;
  questions.forEach((q, i) => {
    const lvl = q.level || 5;
    const d = Math.abs(lvl - targetLevel);
    if (d < bestDist) { bestDist = d; best = [i]; }
    else if (d === bestDist) best.push(i);
  });
  return best[Math.floor(Math.random() * best.length)];
}

// Mapper une note (1-10) vers une difficulté effective selon la config
function mapDifficulty(note, config) {
  if (config.difficultyMode !== 'custom') return note;
  let d = config.difficultyMap?.[note] ?? note;
  d = Math.min(d, config.maxDifficulty ?? 10);
  // Si le niveau est exclu, on descend au plus proche non-exclu
  if (config.excludedLevels?.includes(d)) {
    for (let delta = 1; delta <= 10; delta++) {
      if (!config.excludedLevels.includes(d - delta) && d - delta >= 1) { d = d - delta; break; }
      if (!config.excludedLevels.includes(d + delta) && d + delta <= 10) { d = d + delta; break; }
    }
  }
  return d;
}

// Tire une question d'une catégorie à une difficulté cible, en évitant des thèmes
// déjà utilisés (usedThemeKeys). Renvoie la question + les decks mis à jour.
function drawQuestion(state, cat, targetDifficulty, usedThemeKeys = []) {
  const { questionsData, config, themeDecks } = state;
  let themeIdxs = enabledThemeIndices(questionsData, config.enabledThemes, cat)
    .filter(ti => !usedThemeKeys.includes(`${cat}:${ti}`));
  if (!themeIdxs.length) themeIdxs = enabledThemeIndices(questionsData, config.enabledThemes, cat);

  const themeIdx = themeIdxs[Math.floor(Math.random() * themeIdxs.length)];
  const deckKey = `${cat}:${themeIdx}`;
  const themeObj = questionsData[cat][themeIdx];
  const fullTheme = themeObj.questions.map((_, qi) => qi);

  let deck = themeDecks[deckKey] || makeDeck(fullTheme);
  if (deck.length === 0) deck = makeDeck(fullTheme);

  const candidateQuestions = deck.map(qi => themeObj.questions[qi]);
  const localPick = pickByDifficulty(candidateQuestions, targetDifficulty);
  const qIdx = deck[localPick];
  const remaining = config.allowRepeat ? deck : deck.filter((_, i) => i !== localPick);

  const qa = themeObj.questions[qIdx];
  const themeName = themeObj.theme.replace(/\s*\(niche\)/i, '').replace(/\s*\(.*\)$/, '').trim();

  return {
    question: {
      q: qa.q, a: qa.a, choices: qa.choices || null,
      level: qa.level, theme: themeName, cat,
    },
    themeDecks: { ...themeDecks, [deckKey]: remaining },
    themeKey: deckKey,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  // Données questions
  questionsData: null,
  finaleData: null,
  debutData: null,

  // Decks actifs
  themeDecks: {},
  finaleDecK: [],
  debutDeck: [],

  // Config → Game
  teamConfigs: [],
  teams: [],
  currentTeamIdx: 0,
  config: makeDefaultConfig(),

  // Phase de jeu
  phase: 'config',       // 'config' | 'game' | 'victory'

  // Tour en cours
  currentCell: null,
  currentQuestion: null,
  pendingCat: null,      // catégorie en attente (avant choix du niveau)
  pendingThemeIdx: null, // thème précis fixé à l'atterrissage
  needsLevel: false,     // true tant que le joueur n'a pas misé
  questionId: 0,         // incrémenté à chaque nouvelle invite (reset Modal)
  modalOpen: false,
  modalState: 'question',
  chosenAnswer: null,
  isCorrect: null,
  pendingMove: 0,

  // A4 — comptage des questions
  questionsPlayed: 0,

  // B8 — historique pour annuler le dernier coup
  history: [],

  // Deck + session des cartes bonus « C'est superbe »
  bonusDeck: [],
  bonusSession: null,

  // ─── Config actions ─────────────────────────────────────────────────────────
  setConfig(patch) {
    set(s => ({ config: { ...s.config, ...patch } }));
  },

  toggleTheme(cat, themeIdx) {
    set(s => {
      const key = `${cat}:${themeIdx}`;
      const cur = s.config.enabledThemes[key] !== false;
      return { config: { ...s.config, enabledThemes: { ...s.config.enabledThemes, [key]: !cur } } };
    });
  },

  setCategoryThemes(cat, value) {
    const { questionsData } = get();
    if (!questionsData) return;
    set(s => {
      const next = { ...s.config.enabledThemes };
      (questionsData[cat] || []).forEach((_, ti) => { next[`${cat}:${ti}`] = value; });
      return { config: { ...s.config, enabledThemes: next } };
    });
  },

  setDifficultyLevel(note, difficulty) {
    set(s => ({
      config: { ...s.config, difficultyMap: { ...s.config.difficultyMap, [note]: difficulty } },
    }));
  },

  toggleExcludedLevel(level) {
    set(s => {
      const ex = s.config.excludedLevels.includes(level)
        ? s.config.excludedLevels.filter(l => l !== level)
        : [...s.config.excludedLevels, level];
      return { config: { ...s.config, excludedLevels: ex } };
    });
  },

  setSpecialCell(type, patch) {
    set(s => ({
      config: {
        ...s.config,
        specialCells: { ...s.config.specialCells, [type]: { ...s.config.specialCells[type], ...patch } },
      },
    }));
  },

  addCustomCell(cell) {
    set(s => ({
      config: { ...s.config, customCells: [...s.config.customCells, { id: Date.now(), ...cell }] },
    }));
  },

  removeCustomCell(id) {
    set(s => ({ config: { ...s.config, customCells: s.config.customCells.filter(c => c.id !== id) } }));
  },

  // ─── Data ─────────────────────────────────────────────────────────────────
  setQuestionsData(questionsData, finaleData, debutData) {
    const themeDecks = {};
    const enabledThemes = {};
    for (const [cat, themes] of Object.entries(questionsData)) {
      themes.forEach((theme, ti) => {
        const indices = theme.questions.map((_, qi) => qi);
        themeDecks[`${cat}:${ti}`] = makeDeck(indices);
        enabledThemes[`${cat}:${ti}`] = true;   // tous activés par défaut
      });
    }
    set(s => ({
      questionsData,
      finaleData,
      debutData,
      themeDecks,
      finaleDecK: makeDeck(finaleData.map((_, i) => i)),
      debutDeck: makeDeck(debutData.map((_, i) => i)),
      config: { ...s.config, enabledThemes },
    }));
  },

  // ─── Équipes (config) ───────────────────────────────────────────────────────
  addTeamConfig() {
    set(s => ({ teamConfigs: [...s.teamConfigs, { name: '', players: [''], banner: null }] }));
  },
  removeTeamConfig(idx) {
    set(s => ({ teamConfigs: s.teamConfigs.filter((_, i) => i !== idx) }));
  },
  updateTeamConfig(idx, field, value) {
    set(s => {
      const configs = [...s.teamConfigs];
      configs[idx] = { ...configs[idx], [field]: value };
      return { teamConfigs: configs };
    });
  },
  updatePlayerName(teamIdx, playerIdx, name) {
    set(s => {
      const configs = [...s.teamConfigs];
      const players = [...configs[teamIdx].players];
      players[playerIdx] = name;
      configs[teamIdx] = { ...configs[teamIdx], players };
      return { teamConfigs: configs };
    });
  },
  addPlayer(teamIdx) {
    set(s => {
      const configs = [...s.teamConfigs];
      configs[teamIdx] = { ...configs[teamIdx], players: [...configs[teamIdx].players, ''] };
      return { teamConfigs: configs };
    });
  },
  removePlayer(teamIdx, playerIdx) {
    set(s => {
      const configs = [...s.teamConfigs];
      const players = configs[teamIdx].players.filter((_, i) => i !== playerIdx);
      configs[teamIdx] = { ...configs[teamIdx], players };
      return { teamConfigs: configs };
    });
  },

  // ─── Démarrage ──────────────────────────────────────────────────────────────
  startGame() {
    const { teamConfigs, debutData, debutDeck, config } = get();
    const teams = buildTeams(teamConfigs);

    // A6 — déterminer l'équipe qui commence
    let startIdx = 0;
    let debutQuestion = null;
    let newDebutDeck = debutDeck;

    if (config.startMode === 'manual') {
      startIdx = Math.min(config.startTeamIdx || 0, teams.length - 1);
    } else if (config.startMode === 'random') {
      startIdx = Math.floor(Math.random() * teams.length);
    } else {
      // 'card' — tirer la carte "Hésite pas à débuter" ; l'équipe qui commence
      // sera CHOISIE manuellement après lecture de la carte (pas de tirage).
      startIdx = 0;
      if (debutData && debutData.length > 0) {
        const fullDebut = debutData.map((_, i) => i);
        const { card: dIdx, remaining } = drawFromDeck(newDebutDeck, fullDebut, config);
        debutQuestion = {
          q: debutData[dIdx], a: null, isDebut: true, pickStart: true,
          theme: 'Hésite pas à débuter',
        };
        newDebutDeck = remaining;
      }
    }

    set(s => ({
      teams,
      currentTeamIdx: startIdx,
      phase: 'game',
      debutDeck: newDebutDeck,
      modalOpen: !!debutQuestion,
      currentQuestion: debutQuestion,
      modalState: 'question',
      needsLevel: false,
      questionId: s.questionId + 1,
      chosenAnswer: null,
      isCorrect: null,
      questionsPlayed: 0,
      history: [],
      bonusDeck: makeDeck(BONUS_CARDS.map((_, i) => i)),
      bonusSession: null,
    }));
  },

  // A6 — après la carte « Hésite pas à débuter », choisir l'équipe qui commence
  chooseStartTeam(idx) {
    set({
      currentTeamIdx: idx,
      modalOpen: false,
      currentQuestion: null,
    });
  },

  // ─── Snapshot pour undo ───────────────────────────────────────────────────
  pushHistory() {
    const { teams, currentTeamIdx, questionsPlayed, themeDecks, finaleDecK } = get();
    set(s => ({
      history: [
        ...s.history,
        {
          teams: teams.map(t => ({ ...t })),
          currentTeamIdx,
          questionsPlayed,
          themeDecks: { ...themeDecks },
          finaleDecK: [...finaleDecK],
        },
      ].slice(-20),
    }));
  },

  undoLastMove() {
    const { history } = get();
    if (!history.length) return;
    const prev = history[history.length - 1];
    set({
      teams: prev.teams,
      currentTeamIdx: prev.currentTeamIdx,
      questionsPlayed: prev.questionsPlayed,
      themeDecks: prev.themeDecks,
      finaleDecK: prev.finaleDecK,
      history: history.slice(0, -1),
      modalOpen: false,
      currentQuestion: null,
      phase: 'game',
    });
  },

  // ─── Atterrissage sur une case ────────────────────────────────────────────
  landOnCell(cellIdx) {
    const { questionsData, finaleData, debutData, finaleDecK, config } = get();
    if (!questionsData || !finaleData || !debutData) return;

    const cells = buildCells(config.customCells);
    const cell = cells[cellIdx];

    const openBonusMalus = (isBonus, move, theme) => {
      set(s => ({
        currentQuestion: {
          q: isBonus ? `${theme} Avancez de ${Math.abs(move)} cases.` : `${theme} Reculez de ${Math.abs(move)} cases.`,
          a: null, isBonusMalus: true, isBonus, isMalus: !isBonus, theme,
          isDebut: false, isFinale: false,
        },
        modalOpen: true, modalState: 'question', needsLevel: false,
        questionId: s.questionId + 1, chosenAnswer: null, isCorrect: null, pendingMove: move,
      }));
    };

    // FINALE
    if (cell.type === 'finale') {
      const fullFinale = finaleData.map((_, i) => i);
      const { card: qIdx, remaining } = drawFromDeck(finaleDecK, fullFinale, config);
      const qa = finaleData[qIdx];
      set(s => ({
        finaleDecK: remaining,
        currentQuestion: { ...qa, isFinale: true, level: null, theme: "N'hésite pas à gagner" },
        modalOpen: true, modalState: 'question', needsLevel: false,
        questionId: s.questionId + 1, chosenAnswer: null, isCorrect: null, pendingMove: 0,
      }));
      return;
    }

    // BONUS « C'est superbe » → carte bonus (sauf case custom = effet simple)
    if (cell.type === 'bonus' && (cell.custom || config.specialCells.bonus.enabled)) {
      if (cell.custom) {
        openBonusMalus(true, Math.abs(cell.move), `${cell.name} !`);
      } else {
        get().startBonusCard();
      }
      return;
    }

    // MALUS « Ça va pas du tout » → bouclier / anti-malus consommés si présents
    if (cell.type === 'malus' && (cell.custom || config.specialCells.malus.enabled)) {
      const team = get().teams[get().currentTeamIdx];
      const buffs = team?.buffs || {};
      if (buffs.shield) {
        get().consumeBuff('shield');
        openBonusMalus(true, 0, '🛡️ Bouclier — malus ignoré !');
        return;
      }
      if (buffs.antiMalus) {
        const gain = buffs.antiMalus;
        get().consumeBuff('antiMalus');
        openBonusMalus(true, gain, `« Ça va pas du tout, mais si ! » — avancez de ${gain} !`);
        return;
      }
      const move = cell.custom ? -Math.abs(cell.move) : config.specialCells.malus.move;
      openBonusMalus(false, -Math.abs(move), cell.custom ? `${cell.name} !` : 'Ça va pas du tout !');
      return;
    }

    // CHALLENGE actif → catégorie aléatoire ; CAT → catégorie de la case ;
    // case spéciale désactivée → question normale catégorie aléatoire
    const challengeActive = cell.type === 'challenge' && config.specialCells.challenge.enabled;
    const cat = (challengeActive || cell.type !== 'cat')
      ? CATS[Math.floor(Math.random() * CATS.length)]
      : cell.cat;

    // On fixe le thème précis dès maintenant (affiché pendant le choix du niveau).
    // La question elle-même est tirée de ce thème après la mise, selon la difficulté.
    const themeIdxs = enabledThemeIndices(questionsData, config.enabledThemes, cat);
    const themeIdx = themeIdxs[Math.floor(Math.random() * themeIdxs.length)];
    const themeName = questionsData[cat][themeIdx].theme
      .replace(/\s*\(niche\)/i, '').replace(/\s*\(.*\)$/, '').trim();

    set(s => ({
      pendingCat: cat,
      pendingThemeIdx: themeIdx,
      needsLevel: true,
      currentQuestion: {
        q: null, a: null, cat, theme: themeName,
        isFinale: false, isDebut: false,
        isChallenge: cell.type === 'challenge',
      },
      modalOpen: true, modalState: 'question',
      questionId: s.questionId + 1,
      chosenAnswer: null, isCorrect: null, pendingMove: 0,
    }));
  },

  // Le joueur a misé (note 1-10) → on tire la question à la difficulté voulue
  confirmLevel(note) {
    const s0 = get();
    const cat = s0.pendingCat;
    const targetDifficulty = mapDifficulty(note, s0.config);
    // On force le thème déjà annoncé (pendingThemeIdx) pour la cohérence d'affichage
    const forcedKey = `${cat}:${s0.pendingThemeIdx}`;
    const usedExcept = enabledThemeIndices(s0.questionsData, s0.config.enabledThemes, cat)
      .map(ti => `${cat}:${ti}`).filter(k => k !== forcedKey);
    const drawn = drawQuestion(s0, cat, targetDifficulty, usedExcept);

    set(s => ({
      themeDecks: drawn.themeDecks,
      needsLevel: false,
      pendingMove: note,
      currentQuestion: { ...s.currentQuestion, ...drawn.question },
    }));
  },

  // ─── Cartes bonus « C'est superbe » ────────────────────────────────────────
  consumeBuff(name) {
    set(s => {
      const teams = s.teams.map((t, i) =>
        i === s.currentTeamIdx ? { ...t, buffs: { ...t.buffs, [name]: name === 'antiMalus' ? 0 : false } } : t);
      return { teams };
    });
  },

  startBonusCard() {
    const s = get();
    const full = BONUS_CARDS.map((_, i) => i);
    const { card: cardIdx, remaining } = drawFromDeck(s.bonusDeck, full, { allowRepeat: false, autoReshuffle: true });
    const card = BONUS_CARDS[cardIdx];
    get().pushHistory();

    // Carte à effet différé (bouclier / anti-malus / seconde chance) → buff immédiat
    if (!card.q) {
      set(st => {
        const teams = st.teams.map((t, i) => {
          if (i !== st.currentTeamIdx) return t;
          const buffs = { ...t.buffs };
          if (card.defer === 'shield') buffs.shield = true;
          if (card.defer === 'antiMalus') buffs.antiMalus = card.deferValue || 3;
          if (card.defer === 'secondChance') buffs.secondChance = true;
          return { ...t, buffs };
        });
        return {
          teams, bonusDeck: remaining,
          bonusSession: { card, phase: 'result', success: true, resultText: 'Carte conservée.' },
          modalOpen: false,
        };
      });
      return;
    }

    const cells = buildCells(s.config.customCells);
    const cellCat = cells[s.teams[s.currentTeamIdx].position]?.cat || CATS[0];
    const players = s.teams[s.currentTeamIdx].players || [];
    const totalRounds = card.q.count === 'members' ? Math.max(1, players.length) : card.q.count;

    set({
      bonusDeck: remaining,
      bonusSession: {
        card, cellCat, totalRounds, roundIdx: 0, rounds: [],
        question: null, imposedCat: null, choose3: null, usedThemeKeys: [],
        targetIdx: null, phase: 'intro', success: null, resultText: '',
      },
    });
  },

  // Passe de l'intro au premier round (ou au round suivant)
  bonusBegin() { get()._bonusSetupRound(); },

  _bonusSetupRound() {
    const s = get();
    const bs = s.bonusSession;
    const card = bs.card;
    const q = card.q;
    const idx = bs.roundIdx;

    const categoryMode = q.category === 'chooseOther' ? 'chooseOther'
      : q.adversaryCategory ? 'adversary'
      : q.category === 'improbable' ? 'improbable' : 'random';
    const needsCategory = (categoryMode === 'chooseOther' || categoryMode === 'adversary') && !bs.imposedCat;

    if (needsCategory) { set({ bonusSession: { ...bs, phase: 'category', categoryMode } }); return; }

    // Difficulté
    if (q.diffMode === 'choose3') {
      const opts = [];
      while (opts.length < 3) { const d = 1 + Math.floor(Math.random() * 10); if (!opts.includes(d)) opts.push(d); }
      set({ bonusSession: { ...bs, phase: 'choose3', choose3: opts } });
      return;
    }
    const pickModes = ['range', 'chooseMin', 'choose', 'bet', 'adversary'];
    if (pickModes.includes(q.diffMode)) {
      const bounds = q.diffMode === 'range' || q.diffMode === 'adversary' ? [q.min, q.max]
        : q.diffMode === 'chooseMin' ? [q.min, 10] : [1, 10];
      set({ bonusSession: { ...bs, phase: 'level', levelBounds: bounds, isBet: q.diffMode === 'bet', isAdversary: q.diffMode === 'adversary' } });
      return;
    }
    // fixed / chain → niveau imposé, on tire directement
    const level = q.diffMode === 'chain' ? q.values[Math.min(idx, q.values.length - 1)] : q.value;
    get()._bonusDraw(level);
  },

  bonusPickCategory(cat) {
    const bs = get().bonusSession;
    set({ bonusSession: { ...bs, imposedCat: cat } });
    get()._bonusSetupRound();
  },

  bonusPickLevel(level) { get()._bonusDraw(level); },

  _bonusDraw(level) {
    const s = get();
    const bs = s.bonusSession;
    const q = bs.card.q;
    const catMode = q.category === 'chooseOther' ? bs.imposedCat
      : q.adversaryCategory ? bs.imposedCat
      : q.category === 'improbable' ? 'Improbable'
      : CATS[Math.floor(Math.random() * CATS.length)];
    const cat = catMode || CATS[Math.floor(Math.random() * CATS.length)];
    const target = mapDifficulty(level, s.config);
    const drawn = drawQuestion(s, cat, target, bs.usedThemeKeys);
    set({
      themeDecks: drawn.themeDecks,
      bonusSession: {
        ...bs, phase: 'question', question: drawn.question,
        chosenLevel: level,
        usedThemeKeys: [...bs.usedThemeKeys, drawn.themeKey],
      },
    });
  },

  // Jugement d'un round bonus
  bonusJudge(correct) {
    const s = get();
    const bs = s.bonusSession;
    const rounds = [...bs.rounds, { level: bs.chosenLevel ?? bs.question?.level, cat: bs.question?.cat, correct }];
    const nextIdx = bs.roundIdx + 1;

    // Round suivant ?
    if (nextIdx < bs.totalRounds) {
      set({ bonusSession: { ...bs, rounds, roundIdx: nextIdx, imposedCat: null, question: null, phase: 'between' } });
      return;
    }

    // Dernier round → succès ?
    const needAll = bs.card.q.needAll;
    const success = needAll ? rounds.every(r => r.correct) : rounds[rounds.length - 1].correct;

    // Cible à choisir (swap) sur succès ?
    if (success && bs.card.target === 'choose') {
      set({ bonusSession: { ...bs, rounds, success, phase: 'target' } });
      return;
    }
    get()._applyBonus({ ...bs, rounds, success });
  },

  bonusPickTarget(idx) {
    const bs = get().bonusSession;
    get()._applyBonus({ ...bs, targetIdx: idx });
  },

  _applyBonus(bs) {
    const s = get();
    const card = bs.card;
    const cells = buildCells(s.config.customCells);
    const total = cells.length;
    const clamp = p => Math.max(0, Math.min(p, total - 1));
    const teams = s.teams.map(t => ({ ...t, buffs: { ...t.buffs } }));
    const me = s.currentTeamIdx;
    const success = bs.success;
    const lastLevel = bs.rounds[bs.rounds.length - 1]?.level || 1;
    const sumLevels = bs.rounds.filter(r => r.correct).reduce((a, r) => a + r.level, 0);
    let text = '';
    let victory = false;

    const advance = n => { teams[me].position = clamp(teams[me].position + n); teams[me].score += Math.max(0, n); };

    if (success) {
      switch (card.effect) {
        case 'advanceFixed':        advance(card.value); text = `Avancé de ${card.value} cases.`; break;
        case 'advanceDiff':         advance(lastLevel); text = `Avancé de ${lastLevel} cases.`; break;
        case 'advanceDoubleDiff':   advance(lastLevel * 2); text = `Avancé de ${lastLevel * 2} cases.`; break;
        case 'advanceSumDiff':      advance(sumLevels); text = `Avancé de ${sumLevels} cases (somme des difficultés).`; break;
        case 'advanceDiffTimes': {
          const g = Math.ceil((card.factor || 1) * lastLevel); advance(g); text = `Avancé de ${g} cases.`; break;
        }
        case 'advanceDiffAndOthersBack': {
          advance(lastLevel);
          teams.forEach((t, i) => { if (i !== me) t.position = clamp(t.position - (card.othersBack || 2)); });
          text = `Avancé de ${lastLevel} ; les autres reculent de ${card.othersBack || 2}.`; break;
        }
        case 'advanceDiffAndDomino': {
          advance(lastLevel);
          const behind = bestOtherIdx(teams, me, 'behind');
          if (behind != null) { const g = Math.floor(lastLevel / 2); teams[behind].position = clamp(teams[behind].position + g); text = `Avancé de ${lastLevel} ; l'équipe derrière avance de ${g}.`; }
          else text = `Avancé de ${lastLevel} cases.`;
          break;
        }
        case 'toNextSpecial': {
          const ns = nextSpecialIndex(cells, teams[me].position);
          teams[me].position = ns; text = `Avancé jusqu'à la prochaine case spéciale (case ${ns + 1}).`; break;
        }
        case 'stealFromBest': {
          const best = bestOtherIdx(teams, me, 'best');
          const n = card.value || 4;
          advance(n);
          if (best != null) teams[best].position = clamp(teams[best].position - n);
          text = `Volé ${n} cases à l'équipe la mieux placée.`; break;
        }
        case 'swapWithChosen': {
          const ti = bs.targetIdx;
          if (ti != null && ti !== me) { const tmp = teams[me].position; teams[me].position = teams[ti].position; teams[ti].position = tmp; text = `Position échangée avec ${teams[ti].name}.`; }
          break;
        }
        case 'victory': victory = true; text = 'Victoire immédiate !'; break;
        default: text = 'Effet appliqué.';
      }
    } else {
      switch (card.fail) {
        case 'retreat': teams[me].position = clamp(teams[me].position - (card.failValue || 3)); text = `Raté : reculé de ${card.failValue || 3} cases.`; break;
        case 'skipTurn': teams[me].buffs.skipNext = true; text = 'Raté : vous passez votre prochain tour.'; break;
        default: text = 'Raté : aucun effet.';
      }
    }

    if (teams[me].position >= total - 1) victory = true;

    set({
      teams,
      bonusSession: { ...bs, phase: 'result', resultText: text, success },
      phase: victory ? 'victory' : 'game',
      currentTeamIdx: victory ? me : s.currentTeamIdx,
    });
  },

  // Ferme la carte bonus et passe la main (sauf victoire)
  closeBonus() {
    const s = get();
    if (s.phase === 'victory') { set({ bonusSession: null, modalOpen: false }); return; }
    const nextIdx = nextActiveTeamIdx(s.teams, s.currentTeamIdx);
    set(st => ({
      teams: nextIdx.teams,
      currentTeamIdx: nextIdx.idx,
      bonusSession: null,
      modalOpen: false,
    }));
  },

  selectChoice(choice) {
    const { currentQuestion } = get();
    const correct = choice === currentQuestion.a;
    set({ chosenAnswer: choice, isCorrect: correct, modalState: 'mcq-result' });
  },

  judgeAnswer(correct) {
    set({ isCorrect: correct, modalState: 'judging' });
  },

  closeModal(correct) {
    // La carte « débuter » ne consomme pas de tour et ne fait pas avancer :
    // elle est fermée sans changer d'équipe (le choix passe par chooseStartTeam).
    if (get().currentQuestion?.isDebut) {
      set({ modalOpen: false, currentQuestion: null });
      return;
    }

    // Carte « Deuxième chance » : question normale ratée → on retente une
    // question plus facile (difficulté -2) au lieu d'échouer. Buff consommé.
    {
      const st = get();
      const cq = st.currentQuestion;
      const isNormal = cq && !cq.isBonusMalus && !cq.isFinale && !cq.isDebut && !cq.retry;
      const team0 = st.teams[st.currentTeamIdx];
      if (!correct && isNormal && team0?.buffs?.secondChance) {
        get().consumeBuff('secondChance');
        const cat = cq.cat || CATS[Math.floor(Math.random() * CATS.length)];
        const retryLevel = Math.max(1, (st.pendingMove || 2) - 2);
        const drawn = drawQuestion(get(), cat, retryLevel, []);
        set(s => ({
          themeDecks: drawn.themeDecks,
          pendingMove: retryLevel,
          needsLevel: false,
          currentQuestion: { ...drawn.question, retry: true, cat },
          questionId: s.questionId + 1,
          modalOpen: true,
        }));
        return;
      }
    }

    get().pushHistory();
    const { teams, currentTeamIdx, pendingMove, currentQuestion, config, questionsPlayed } = get();
    const newTeams = [...teams];
    const team = { ...newTeams[currentTeamIdx] };
    const cells = buildCells(config.customCells);
    const totalCells = cells.length;

    let countsAsQuestion = false;

    if (currentQuestion?.isBonusMalus) {
      const move = pendingMove;
      team.position = Math.max(0, Math.min(team.position + move, totalCells - 1));
      if (move > 0) team.score += move;
    } else if (currentQuestion?.isDebut) {
      // rien : juste désigner l'équipe qui commence
    } else if (correct) {
      const move = pendingMove || 1;
      team.position = Math.min(team.position + move, totalCells - 1);
      team.score += move;
      countsAsQuestion = true;
    } else {
      countsAsQuestion = true; // une question ratée compte aussi
    }

    newTeams[currentTeamIdx] = team;

    const newQuestionsPlayed = questionsPlayed + (countsAsQuestion ? 1 : 0);

    // Victoire : dernière case atteinte
    let hasWon = team.position >= totalCells - 1;

    // A4 — limite de questions atteinte → fin de partie, l'équipe la plus avancée gagne
    let limitReached = false;
    if (config.questionLimit && newQuestionsPlayed >= config.questionLimit) {
      limitReached = true;
    }

    let winnerIdx = currentTeamIdx;
    if (limitReached && !hasWon) {
      // équipe la plus avancée (départage : meilleur score)
      let best = newTeams[0], bi = 0;
      newTeams.forEach((t, i) => {
        if (t.position > best.position || (t.position === best.position && t.score > best.score)) {
          best = t; bi = i;
        }
      });
      winnerIdx = bi;
    }

    const gameOver = hasWon || limitReached;

    set({
      teams: newTeams,
      currentTeamIdx: gameOver ? winnerIdx : (currentTeamIdx + 1) % newTeams.length,
      modalOpen: false,
      currentQuestion: null,
      needsLevel: false,
      questionsPlayed: newQuestionsPlayed,
      phase: gameOver ? 'victory' : 'game',
    });
  },

  // A3 — réinitialiser les decks (questions déjà posées)
  resetDecks() {
    const { questionsData, finaleData, debutData } = get();
    if (!questionsData) return;
    const themeDecks = {};
    for (const [cat, themes] of Object.entries(questionsData)) {
      themes.forEach((theme, ti) => {
        themeDecks[`${cat}:${ti}`] = makeDeck(theme.questions.map((_, qi) => qi));
      });
    }
    set({
      themeDecks,
      finaleDecK: makeDeck(finaleData.map((_, i) => i)),
      debutDeck: makeDeck(debutData.map((_, i) => i)),
    });
  },

  resetGame() {
    get().resetDecks();
    set({
      teams: [],
      teamConfigs: [],
      currentTeamIdx: 0,
      phase: 'config',
      modalOpen: false,
      currentQuestion: null,
      needsLevel: false,
      questionsPlayed: 0,
      history: [],
    });
  },
}));

