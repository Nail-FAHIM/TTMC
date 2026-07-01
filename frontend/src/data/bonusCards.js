/**
 * Cartes bonus « C'est superbe » — tirées sur une case bonus/jaune.
 *
 * Chaque carte décrit :
 *  - id, titre, description (affichés)
 *  - questions : combien de questions et sous quelles contraintes de difficulté/catégorie
 *  - effect : identifiant de l'effet appliqué (résolu dans gameStore → applyBonusEffect)
 *  - target : interaction avec une autre équipe si besoin
 *  - defer  : effet différé (buff conservé jusqu'au prochain malus / prochaine question)
 *
 * Modèle des questions (q) :
 *   count       : nombre de questions à enchaîner (défaut 1 ; 'members' = un par joueur)
 *   diffMode    : 'choose' | 'fixed' | 'range' | 'chooseMin' | 'adversary' | 'bet' | 'choose3' | 'chain'
 *   value/min/max/values : paramètres selon diffMode
 *   category    : null | 'improbable' | 'chooseOther'  (chooseOther = imposer une autre catégorie que la case)
 *   adversaryCategory : true → l'équipe adverse impose aussi la catégorie
 *   needAll     : true → toutes les questions doivent être réussies pour l'effet
 */
export const BONUS_CARDS = [
  // ── Avance simple ──────────────────────────────────────────────────────────
  {
    id: 'plateau-argent',
    titre: 'Sur un plateau d\'argent',
    description: 'Répondez à une question de difficulté ≤ 3. Réussite : avancez du double de la difficulté choisie.',
    q: { count: 1, diffMode: 'range', min: 1, max: 3 },
    effect: 'advanceDoubleDiff',
    fail: 'none',
  },
  {
    id: 'franchement-facile',
    titre: 'Franchement facile',
    description: 'Répondez à une question de difficulté 1 à 4. Bonne réponse = avancez de 5 cases fixes.',
    q: { count: 1, diffMode: 'range', min: 1, max: 4 },
    effect: 'advanceFixed', value: 5,
    fail: 'none',
  },
  {
    id: 'petit-a-petit',
    titre: 'Petit à petit',
    description: 'Répondez à deux questions de difficulté < 5. Les deux réussies : avancez de la somme des deux difficultés.',
    q: { count: 2, diffMode: 'range', min: 1, max: 4, needAll: true },
    effect: 'advanceSumDiff',
    fail: 'none',
  },

  // ── À risque / retour de bâton ──────────────────────────────────────────────
  {
    id: 'retour-flamme',
    titre: 'Le retour de flamme',
    description: 'Choisissez une difficulté X. Réussite : avancez de X cases ET toutes les autres équipes reculent de 2 cases.',
    q: { count: 1, diffMode: 'choose' },
    effect: 'advanceDiffAndOthersBack', othersBack: 2,
    fail: 'none',
  },
  {
    id: 'quitte-ou-double',
    titre: 'Quitte ou double',
    description: 'Question de difficulté ≥ 7. Réussite = avancez du double de la difficulté. Échec = reculez de 3 cases.',
    q: { count: 1, diffMode: 'chooseMin', min: 7 },
    effect: 'advanceDoubleDiff',
    fail: 'retreat', failValue: 3,
  },
  {
    id: 'tout-ou-rien',
    titre: 'Tout ou rien',
    description: 'Question de difficulté 9 ou 10. Réussite = avancez jusqu\'à la prochaine case spéciale. Échec = passez un tour.',
    q: { count: 1, diffMode: 'range', min: 9, max: 10 },
    effect: 'toNextSpecial',
    fail: 'skipTurn',
  },

  // ── Positionnement / interaction ────────────────────────────────────────────
  {
    id: 'chaise-musicale',
    titre: 'Chaise musicale',
    description: 'Deux questions de difficulté > 4. Les deux réussies : échangez votre position avec l\'équipe de votre choix.',
    q: { count: 2, diffMode: 'chooseMin', min: 5, needAll: true },
    effect: 'swapWithChosen', target: 'choose',
    fail: 'none',
  },
  {
    id: 'vol-organise',
    titre: 'Vol organisé',
    description: 'Question de difficulté ≥ 6. Réussite : avancez de 4 cases prises sur l\'équipe la mieux placée (elle recule d\'autant).',
    q: { count: 1, diffMode: 'chooseMin', min: 6 },
    effect: 'stealFromBest', value: 4,
    fail: 'none',
  },
  {
    id: 'effet-domino',
    titre: 'Effet domino',
    description: 'Répondez à une question. Réussite : l\'équipe juste derrière vous avance de la moitié de votre gain (arrondi inférieur).',
    q: { count: 1, diffMode: 'choose' },
    effect: 'advanceDiffAndDomino',
    fail: 'none',
  },

  // ── Annulation / protection (effets différés) ───────────────────────────────
  {
    id: 'malus-mais-si',
    titre: 'Malus annulé !',
    description: 'Si vous tombez sur une case malus au prochain tour, il est annulé et vous avancez de 3 cases à la place.',
    q: null,
    effect: 'defer', defer: 'antiMalus', deferValue: 3,
  },
  {
    id: 'bouclier',
    titre: 'Bouclier',
    description: 'Conservez cette carte : la prochaine case malus sur laquelle vous tombez est ignorée sans condition.',
    q: null,
    effect: 'defer', defer: 'shield',
  },
  {
    id: 'deuxieme-chance',
    titre: 'Deuxième chance',
    description: 'Si vous ratez votre prochaine question, retentez-en immédiatement une de difficulté inférieure d\'au moins 2 points.',
    q: null,
    effect: 'defer', defer: 'secondChance',
  },

  // ── Collectives (équipe entière) ────────────────────────────────────────────
  {
    id: 'unanimite',
    titre: 'L\'unanimité',
    description: 'Chaque membre répond à une question de difficulté ≥ 8, sur des thèmes différents. Tous réussissent : victoire immédiate !',
    q: { count: 'members', diffMode: 'chooseMin', min: 8, distinctThemes: true, needAll: true },
    effect: 'victory',
    fail: 'none',
  },
  {
    id: 'chaine-talents',
    titre: 'Chaîne de talents',
    description: 'Chaque membre répond à une difficulté croissante (3, 5, 7…). Toute la chaîne réussie : avancez de 10 cases.',
    q: { count: 'members', diffMode: 'chain', values: [3, 5, 7, 9, 10], needAll: true },
    effect: 'advanceFixed', value: 10,
    fail: 'none',
  },
  {
    id: 'maillon-faible',
    titre: 'Le maillon faible',
    description: 'Chaque membre répond à une question de son choix. Avancez du total des difficultés réussies, mais un seul échec annule tout.',
    q: { count: 'members', diffMode: 'choose', needAll: true },
    effect: 'advanceSumDiff',
    fail: 'none',
  },

  // ── Catégorie / thème ───────────────────────────────────────────────────────
  {
    id: 'specialiste-impose',
    titre: 'Spécialiste imposé',
    description: 'Choisissez une catégorie autre que celle de votre case. Question de difficulté ≥ 5 : réussite = avancez de 6 cases.',
    q: { count: 1, diffMode: 'chooseMin', min: 5, category: 'chooseOther' },
    effect: 'advanceFixed', value: 6,
    fail: 'none',
  },
  {
    id: 'contre-son-camp',
    titre: 'Contre son camp',
    description: 'L\'équipe adverse choisit la catégorie ET la difficulté (4 à 8) de votre question. Réussite = avancez du double de la difficulté imposée.',
    q: { count: 1, diffMode: 'adversary', min: 4, max: 8, adversaryCategory: true },
    effect: 'advanceDoubleDiff',
    fail: 'none',
  },

  // ── Mise en scène / bluff ───────────────────────────────────────────────────
  {
    id: 'pari-honneur',
    titre: 'Pari sur l\'honneur',
    description: 'Annoncez une difficulté avant de voir la question. Bonne réponse = avancez de la difficulté × 1,5 (arrondi supérieur).',
    q: { count: 1, diffMode: 'bet' },
    effect: 'advanceDiffTimes', factor: 1.5,
    fail: 'none',
  },
  {
    id: 'roulette-russe',
    titre: 'Roulette russe',
    description: 'Trois difficultés différentes vous sont proposées. Choisissez-en une, répondez. Réussite = avancez selon la difficulté choisie.',
    q: { count: 1, diffMode: 'choose3' },
    effect: 'advanceDiff',
    fail: 'none',
  },
  {
    id: 'jackpot-improbable',
    titre: 'Jackpot improbable',
    description: 'Question de la catégorie « Improbable » de difficulté ≥ 7. Réussite = avancez de 8 cases.',
    q: { count: 1, diffMode: 'chooseMin', min: 7, category: 'improbable' },
    effect: 'advanceFixed', value: 8,
    fail: 'none',
  },
];

export const BONUS_BY_ID = Object.fromEntries(BONUS_CARDS.map(c => [c.id, c]));
