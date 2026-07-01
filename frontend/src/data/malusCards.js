/**
 * Cartes malus « Ça va pas du tout » — tirées sur une case malus/noire.
 *
 * Réutilise le même moteur de session que les cartes bonus (gameStore).
 * Champs de question (q) additionnels par rapport aux bonus :
 *   timer        : secondes de chrono pour chaque question (cartes 4,5,6)
 *   member       : 'random' | 'adversary'  → un seul membre répond (tiré/désigné)
 *   sameTheme    : true → même thème verrouillé sur toutes les questions
 *   chainLevels  : [1,2,3] → niveaux imposés par round sur le thème verrouillé
 *   freeChallenge: texte d'un défi libre (pas une question de la banque)
 *   values       : liste de difficultés proposées (choix parmi ces valeurs)
 *   voteLabel    : true → difficulté « votée » par les autres équipes (label)
 *
 * Champs carte :
 *   immediate : effet sans question (recul, pass, mirror, jalousie, redistribution…)
 *   options   : deux sous-choix (carte 8)
 *   confirm   : true → confirmation explicite avant de lancer (carte 12)
 *   effect / fail : identifiants résolus dans gameStore → _applyMalus
 */
export const MALUS_CARDS = [
  // ── Recul simple ────────────────────────────────────────────────────────────
  {
    id: 'ca-va-pas',
    titre: 'Ça va pas du tout',
    description: 'Reculez de 3 cases, sans condition.',
    immediate: { recoil: 3 },
  },
  {
    id: 'faux-depart',
    titre: 'Faux départ',
    description: 'Passez votre tour, aucune question à jouer.',
    immediate: { pass: 1 },
  },
  {
    id: 'effet-miroir',
    titre: 'Effet miroir',
    description: 'Reculez du même nombre de cases que l\'équipe précédente a avancé à son dernier tour.',
    immediate: { mirror: true },
  },

  // ── Chronométrées ───────────────────────────────────────────────────────────
  {
    id: 'contre-la-montre',
    titre: 'Contre-la-montre',
    description: 'Deux questions, 10 secondes chacune. Chaque échec fait reculer de 2 cases (cumulable).',
    q: { count: 2, diffMode: 'choose', timer: 10 },
    effect: 'perFailRetreat', value: 2,
  },
  {
    id: 'vite-dit',
    titre: 'Vite dit',
    description: 'Citez 10 capitales asiatiques en 20 secondes (défi libre, validé par les autres). Réussite = avancez de 2 cases.',
    q: { count: 1, freeChallenge: 'Citez 10 capitales asiatiques en 20 secondes.', timer: 20 },
    effect: 'advanceOnSuccess', value: 2,
  },
  {
    id: 'course-sablier',
    titre: 'Course contre le sablier',
    description: 'Question de difficulté ≥ 6 en 15 secondes max. Échec = reculez de 4 cases.',
    q: { count: 1, diffMode: 'chooseMin', min: 6, timer: 15 },
    effect: 'retreatOnFail', value: 4,
  },

  // ── Choix / risque calculé ──────────────────────────────────────────────────
  {
    id: 'compromis',
    titre: 'Le compromis',
    description: 'Question de difficulté 6 ou 8. Bonne réponse = avancez de la moitié (arrondi inf). Mauvaise = restez sur place.',
    q: { count: 1, diffMode: 'pickValues', values: [6, 8] },
    effect: 'advanceHalfOnSuccess',
  },
  {
    id: 'petit-ou-grand',
    titre: 'Petit ou grand malheur',
    description: 'Deux options : (a) reculer de 2 sans jouer, ou (b) tenter une question difficulté ≥ 7 — réussite = rien, échec = -5.',
    options: [
      { label: 'Reculer de 2 cases (sans jouer)', immediate: { recoil: 2 } },
      { label: 'Tenter une question difficulté ≥ 7', q: { count: 1, diffMode: 'chooseMin', min: 7 }, effect: 'retreatOnFail', value: 5 },
    ],
  },

  // ── Collectives / membre au hasard ──────────────────────────────────────────
  {
    id: 'roulette-equipe',
    titre: 'La roulette de l\'équipe',
    description: 'Un membre tiré au sort répond à deux questions d\'un thème imposé, difficulté > 4. Les deux réussies = avancez de 4 cases.',
    q: { count: 2, diffMode: 'chooseMin', min: 5, sameTheme: true, needAll: true, member: 'random' },
    effect: 'advanceOnSuccess', value: 4,
  },
  {
    id: 'chacun-fardeau',
    titre: 'Chacun son fardeau',
    description: 'Chaque membre répond à une question de difficulté ≥ 5. Reculez d\'une case par échec.',
    q: { count: 'members', diffMode: 'chooseMin', min: 5 },
    effect: 'perFailRetreat', value: 1,
  },
  {
    id: 'bouc-emissaire',
    titre: 'Le bouc émissaire',
    description: 'L\'équipe adverse désigne un de vos membres. Il répond seul à une question de difficulté 7. Échec = reculez de 5 cases.',
    q: { count: 1, diffMode: 'fixed', value: 7, member: 'adversary' },
    effect: 'retreatOnFail', value: 5,
  },

  // ── Enjeu élevé ─────────────────────────────────────────────────────────────
  {
    id: 'trio-fatidique',
    titre: 'Trio fatidique',
    description: 'Questions 1, 2 et 3 d\'un thème imposé, dans l\'ordre. Une seule erreur = DÉFAITE immédiate. Trois bonnes = avancez d\'une case.',
    confirm: true,
    q: { count: 3, chainLevels: [1, 2, 3], sameTheme: true, needAll: true },
    effect: 'trioFatidique',
  },
  {
    id: 'dernier-avertissement',
    titre: 'Dernier avertissement',
    description: 'Question de difficulté ≥ 8. Échec = reculez jusqu\'à la dernière case bonus franchie (ou au départ).',
    q: { count: 1, diffMode: 'chooseMin', min: 8 },
    effect: 'retreatToLastBonus',
  },
  {
    id: 'pile-double-perte',
    titre: 'Pile ou double perte',
    description: 'Choisissez une difficulté (1 à 10). Échec = reculez du double de la difficulté. Réussite = rien.',
    q: { count: 1, diffMode: 'choose' },
    effect: 'retreatDoubleOnFail',
  },

  // ── Interaction avec les autres équipes ─────────────────────────────────────
  {
    id: 'jalousie-collective',
    titre: 'Jalousie collective',
    description: 'Reculez de 2 cases. L\'équipe la mieux placée recule aussi d\'une case.',
    immediate: { recoil: 2, bestBack: 1 },
  },
  {
    id: 'redistribution',
    titre: 'Redistribution',
    description: 'Reculez de 3 cases ; l\'équipe la moins bien placée avance d\'autant.',
    immediate: { recoil: 3, worstGain: 3 },
  },
  {
    id: 'vote-table',
    titre: 'Vote de la table',
    description: 'Les autres équipes choisissent une difficulté (4 à 9) pour votre question. Échec = reculez de la difficulté imposée.',
    q: { count: 1, diffMode: 'range', min: 4, max: 9, voteLabel: true },
    effect: 'retreatDiffOnFail',
  },

  // ── Catégorie / thème imposé ────────────────────────────────────────────────
  {
    id: 'terrain-inconnu',
    titre: 'Terrain inconnu',
    description: 'Question d\'une catégorie tirée au hasard (≠ votre case), difficulté ≥ 5. Échec = reculez de 3 cases.',
    q: { count: 1, diffMode: 'chooseMin', min: 5, category: 'randomOther' },
    effect: 'retreatOnFail', value: 3,
  },
  {
    id: 'angle-mort',
    titre: 'Angle mort',
    description: 'La catégorie est imposée par l\'équipe juste derrière vous. Échec = reculez de 4 cases.',
    q: { count: 1, diffMode: 'choose', category: 'behindImposes' },
    effect: 'retreatOnFail', value: 4,
  },

  // ── Blocage ─────────────────────────────────────────────────────────────────
  {
    id: 'sur-la-touche',
    titre: 'Sur la touche',
    description: 'Passez votre tour ET le suivant. Vous ne pouvez jouer aucune carte gardée pendant ce temps.',
    immediate: { pass: 2, blockBonus: true },
  },
];

export const MALUS_BY_ID = Object.fromEntries(MALUS_CARDS.map(c => [c.id, c]));
