/**
 * Store Zustand — état global du jeu TTMC.
 * Une seule source de vérité. Jamais de state UI dispersé dans les composants.
 */
import { create } from 'zustand';

import { BOARD_LAYOUT } from '../data/boardLayout.js';
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

    // BONUS / MALUS (case standard ou custom) — sauf si désactivée en config
    if (cell.type === 'bonus' && (cell.custom || config.specialCells.bonus.enabled)) {
      const move = cell.custom ? Math.abs(cell.move) : config.specialCells.bonus.move;
      openBonusMalus(true, Math.abs(move), cell.custom ? `${cell.name} !` : "C'est superbe !");
      return;
    }
    if (cell.type === 'malus' && (cell.custom || config.specialCells.malus.enabled)) {
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
    const { questionsData, pendingCat, pendingThemeIdx, config, themeDecks } = get();
    const cat = pendingCat;
    const targetDifficulty = mapDifficulty(note, config);

    const themeIdx = pendingThemeIdx;
    const deckKey = `${cat}:${themeIdx}`;
    const themeObj = questionsData[cat][themeIdx];
    const fullTheme = themeObj.questions.map((_, qi) => qi);

    // Tirer en respectant le deck (épuisement / répétitions)
    let deck = themeDecks[deckKey] || makeDeck(fullTheme);
    if (deck.length === 0) deck = makeDeck(fullTheme);

    // Choisir, parmi les cartes encore dans le deck, celle la plus proche de la difficulté
    const candidateQuestions = deck.map(qi => themeObj.questions[qi]);
    const localPick = pickByDifficulty(candidateQuestions, targetDifficulty);
    const qIdx = deck[localPick];
    const remaining = config.allowRepeat ? deck : deck.filter((_, i) => i !== localPick);

    const qa = themeObj.questions[qIdx];
    const themeName = themeObj.theme.replace(/\s*\(niche\)/i, '').replace(/\s*\(.*\)$/, '').trim();

    set(s => ({
      themeDecks: { ...s.themeDecks, [deckKey]: remaining },
      needsLevel: false,
      pendingMove: note,
      currentQuestion: {
        ...s.currentQuestion,
        q: qa.q, a: qa.a, choices: qa.choices || null,
        level: qa.level, theme: themeName, cat,
      },
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
