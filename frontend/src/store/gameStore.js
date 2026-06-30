/**
 * Store Zustand — état global du jeu TTMC.
 * Une seule source de vérité. Jamais de state UI dispersé dans les composants.
 */
import { create } from 'zustand';

import { BOARD_LAYOUT } from '../data/boardLayout.js';

export const CATS = ['Scolaire', 'Plaisir', 'Mature', 'Improbable'];

export const CAT_COLORS = {
  Scolaire:   { stroke: '#00c3ff', fill: '#093347', text: '#00c3ff' },
  Plaisir:    { stroke: '#ffb400', fill: '#3d2c00', text: '#ffb400' },
  Mature:     { stroke: '#ff1a6b', fill: '#3d0022', text: '#ff1a6b' },
  Improbable: { stroke: '#00e87a', fill: '#003d20', text: '#00e87a' },
};

export const PION_COLORS = [
  '#7c3aed', '#f97316', '#06b6d4', '#22c55e',
  '#f43f5e', '#3b82f6', '#d946ef', '#84cc16',
];

// Cases spéciales (indices 0-based, déduits de BOARD_LAYOUT)
export const SPECIAL_CELLS = {
  bonus:     [10, 24, 36],
  malus:     [4,  16, 27],
  challenge: [7,  18, 31],
  finale:    [40],
};

// ─── Board layout ─────────────────────────────────────────────────────────────
export function buildCells() {
  return BOARD_LAYOUT.map(cell => ({
    cat: cell.cat || CATS[0],
    type: cell.type,
  }));
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

function drawFromDeck(deck, full) {
  if (deck.length === 0) deck = makeDeck(full);
  return { card: deck[0], remaining: deck.slice(1), newFull: full };
}

// ─── Initialisation équipes ───────────────────────────────────────────────────
function buildTeams(configs) {
  return configs.map((cfg, i) => ({
    id: i,
    name: cfg.name || `Équipe ${i + 1}`,
    players: cfg.players || [],
    color: PION_COLORS[i % PION_COLORS.length],
    position: 0,
    score: 0,
  }));
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  // Données questions chargées depuis l'API
  questionsData: null,   // { Scolaire: [{theme, questions}], ... }
  finaleData: null,      // [{ q, a, choices? }]
  debutData: null,       // ["string", ...]

  // Decks actifs (arrays qui se vident au fil du jeu)
  themeDecks: {},        // { "Scolaire:0": [idx restants...], ... }
  finaleDecK: [],
  debutDeck: [],

  // Config → Game
  teamConfigs: [],       // [{ name, players: [] }]
  teams: [],             // état des équipes pendant la partie
  currentTeamIdx: 0,

  // Phase de jeu
  phase: 'config',       // 'config' | 'game' | 'victory'

  // Tour en cours
  currentCell: null,     // { cx, cy, cat }
  currentQuestion: null, // { q, a, choices?, isFinale, theme, level }
  modalOpen: false,
  modalState: 'question', // 'question' | 'judging' | 'mcq-result'
  chosenAnswer: null,
  isCorrect: null,
  pendingMove: 0,        // cases à avancer si correct

  // ─── Actions ──────────────────────────────────────────────────────────────

  setQuestionsData(questionsData, finaleData, debutData) {
    // Initialiser les decks thèmes
    const themeDecks = {};
    for (const [cat, themes] of Object.entries(questionsData)) {
      themes.forEach((theme, ti) => {
        const indices = theme.questions.map((_, qi) => qi);
        themeDecks[`${cat}:${ti}`] = makeDeck(indices);
      });
    }
    set({
      questionsData,
      finaleData,
      debutData,
      themeDecks,
      finaleDecK: makeDeck(finaleData.map((_, i) => i)),
      debutDeck: makeDeck(debutData.map((_, i) => i)),
    });
  },

  addTeamConfig() {
    set(s => ({
      teamConfigs: [...s.teamConfigs, { name: '', players: [''] }],
    }));
  },

  removeTeamConfig(idx) {
    set(s => ({
      teamConfigs: s.teamConfigs.filter((_, i) => i !== idx),
    }));
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
      configs[teamIdx] = {
        ...configs[teamIdx],
        players: [...configs[teamIdx].players, ''],
      };
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

  startGame() {
    const { teamConfigs, debutData, debutDeck } = get();
    const teams = buildTeams(teamConfigs);

    // Tirer la carte "Hésite pas à débuter" pour déterminer qui commence
    let debutQuestion = null;
    let newDebutDeck = debutDeck;
    if (debutData && debutData.length > 0) {
      const fullDebut = debutData.map((_, i) => i);
      const { card: dIdx, remaining } = drawFromDeck(newDebutDeck, fullDebut);
      debutQuestion = { q: debutData[dIdx], a: null, isDebut: true, theme: 'Hésite pas à débuter' };
      newDebutDeck = remaining;
    }

    set({
      teams,
      currentTeamIdx: 0,
      phase: 'game',
      debutDeck: newDebutDeck,
      modalOpen: !!debutQuestion,
      currentQuestion: debutQuestion,
      modalState: 'question',
      chosenAnswer: null,
      isCorrect: null,
    });
  },

  // Quand une équipe arrive sur une case : on tire la question
  landOnCell(cellIdx) {
    const { questionsData, finaleData, debutData, themeDecks, finaleDecK, debutDeck } = get();

    // Données pas encore chargées — ne rien faire
    if (!questionsData || !finaleData || !debutData) return;

    const cells = buildCells();
    const cell = cells[cellIdx];

    if (SPECIAL_CELLS.finale.includes(cellIdx)) {
      const fullFinale = finaleData.map((_, i) => i);
      const { card: qIdx, remaining } = drawFromDeck(finaleDecK, fullFinale);
      const qa = finaleData[qIdx];
      set({
        finaleDecK: remaining,
        currentQuestion: { ...qa, isFinale: true, level: null, theme: "N'hésite pas à gagner" },
        modalOpen: true,
        modalState: 'question',
        chosenAnswer: null,
        isCorrect: null,
        pendingMove: 0,
      });
      return;
    }

    // Cases spéciales non-finale : bonus / malus / challenge
    // bonus → avance de 3, malus → recule de 3 (pas de question)
    if (SPECIAL_CELLS.bonus.includes(cellIdx)) {
      set({
        currentQuestion: { q: "C'est superbe ! Avancez de 3 cases.", a: null, isBonusMalus: true, isBonus: true, theme: "C'est superbe !", isDebut: false, isFinale: false },
        modalOpen: true, modalState: 'question', chosenAnswer: null, isCorrect: null, pendingMove: 3,
      });
      return;
    }
    if (SPECIAL_CELLS.malus.includes(cellIdx)) {
      set({
        currentQuestion: { q: 'Ça va pas du tout ! Reculez de 3 cases.', a: null, isBonusMalus: true, isMalus: true, theme: 'Ça va pas du tout !', isDebut: false, isFinale: false },
        modalOpen: true, modalState: 'question', chosenAnswer: null, isCorrect: null, pendingMove: -3,
      });
      return;
    }
    // Challenge → question d'une catégorie aléatoire au niveau max
    const challengeCat = CATS[Math.floor(Math.random() * CATS.length)];
    const challengeCellCat = SPECIAL_CELLS.challenge.includes(cellIdx) ? challengeCat : cell.cat;

    // Case normale — catégorie de la case
    const cat = challengeCellCat || cell.cat;
    const themes = questionsData[cat];
    // Tirer un thème aléatoirement dans les thèmes disponibles
    const themeIdx = Math.floor(Math.random() * themes.length);
    const deckKey = `${cat}:${themeIdx}`;
    const fullTheme = themes[themeIdx].questions.map((_, qi) => qi);

    const currentDeck = themeDecks[deckKey] || makeDeck(fullTheme);
    const { card: qIdx, remaining } = drawFromDeck(currentDeck, fullTheme);

    const qa = themes[themeIdx].questions[qIdx];
    const themeName = themes[themeIdx].theme.replace(/\s*\(niche\)/i, '').replace(/\s*\(.*\)$/, '').trim();

    set(s => ({
      themeDecks: { ...s.themeDecks, [deckKey]: remaining },
      currentQuestion: {
        q: qa.q,
        a: qa.a,
        choices: qa.choices || null,
        isFinale: false,
        isDebut: false,
        level: qa.level,
        theme: themeName,
        cat,
      },
      modalOpen: true,
      modalState: 'question',
      chosenAnswer: null,
      isCorrect: null,
      pendingMove: 0,
    }));
  },

  // Joueur a choisi son niveau (1-10) → on lui pose la question
  confirmLevel(level) {
    // Le niveau est déjà connu dans currentQuestion, rien à faire côté data.
    // On reste en état 'question' et on affiche selon le level mémorisé.
    set({ pendingMove: level });
  },

  // Pour les QCM : le joueur clique sur un choix
  selectChoice(choice) {
    const { currentQuestion } = get();
    const correct = choice === currentQuestion.a;
    set({ chosenAnswer: choice, isCorrect: correct, modalState: 'mcq-result' });
  },

  // Valider la réponse (jugée par les autres joueurs) - questions ouvertes
  judgeAnswer(correct) {
    set({ isCorrect: correct, modalState: 'judging' });
  },

  // Fermer modal et appliquer résultat
  closeModal(correct) {
    const { teams, currentTeamIdx, pendingMove, currentQuestion } = get();
    const newTeams = [...teams];
    const team = { ...newTeams[currentTeamIdx] };
    const cells = buildCells();
    const totalCells = cells.length;

    if (currentQuestion?.isBonusMalus) {
      // Appliquer bonus/malus sans question
      const move = pendingMove;
      const newPos = Math.max(0, Math.min(team.position + move, totalCells - 1));
      team.position = newPos;
      if (move > 0) team.score += move;
    } else if (correct && !currentQuestion?.isDebut) {
      const move = pendingMove || 1;
      const newPos = Math.min(team.position + move, totalCells - 1);
      team.position = newPos;
      team.score += move;
    }

    newTeams[currentTeamIdx] = team;

    // Vérifier victoire (dernière case)
    const hasWon = team.position >= totalCells - 1;

    set({
      teams: newTeams,
      currentTeamIdx: hasWon ? currentTeamIdx : (currentTeamIdx + 1) % newTeams.length,
      modalOpen: false,
      currentQuestion: null,
      phase: hasWon ? 'victory' : 'game',
    });
  },

  resetGame() {
    const { questionsData, finaleData, debutData } = get();
    // Re-init decks
    const themeDecks = {};
    for (const [cat, themes] of Object.entries(questionsData)) {
      themes.forEach((theme, ti) => {
        const indices = theme.questions.map((_, qi) => qi);
        themeDecks[`${cat}:${ti}`] = makeDeck(indices);
      });
    }
    set({
      themeDecks,
      finaleDecK: makeDeck(finaleData.map((_, i) => i)),
      debutDeck: makeDeck(debutData.map((_, i) => i)),
      teams: [],
      teamConfigs: [],
      currentTeamIdx: 0,
      phase: 'config',
      modalOpen: false,
      currentQuestion: null,
    });
  },
}));
