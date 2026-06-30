/**
 * Séquence des 41 cases du plateau TTMC.
 * Index 0 = DÉPART (bas droite), index 40 = FINALE (haut).
 * Layout serpentin : 4 rangées de 8 + 3 virages de 3.
 *
 * Rangées (direction de progression) :
 *   Row 0 (indices  0-7)  : droite → gauche
 *   Arc  L (indices  8-10): virage gauche
 *   Row 1 (indices 11-18) : gauche → droite
 *   Arc  R (indices 19-21): virage droit
 *   Row 2 (indices 22-29) : droite → gauche
 *   Arc  L (indices 30-32): virage gauche
 *   Row 3 (indices 33-40) : gauche → droite  (40 = FINALE)
 */

export const BOARD_LAYOUT = [
  // ── Row 0 : droite → gauche ───────────────────────────────────────────────
  { type: 'cat',       cat: 'Mature'     },   // 0  (DÉPART)
  { type: 'cat',       cat: 'Scolaire'   },   // 1
  { type: 'cat',       cat: 'Plaisir'    },   // 2
  { type: 'cat',       cat: 'Improbable' },   // 3
  { type: 'malus'                        },   // 4  "Ça va pas du tout"
  { type: 'cat',       cat: 'Scolaire'   },   // 5
  { type: 'cat',       cat: 'Plaisir'    },   // 6
  { type: 'challenge'                    },   // 7  "Challenge"
  // ── Arc gauche ────────────────────────────────────────────────────────────
  { type: 'cat',       cat: 'Mature'     },   // 8
  { type: 'cat',       cat: 'Improbable' },   // 9
  { type: 'bonus'                        },   // 10 "C'est superbe"
  // ── Row 1 : gauche → droite ───────────────────────────────────────────────
  { type: 'cat',       cat: 'Plaisir'    },   // 11
  { type: 'cat',       cat: 'Scolaire'   },   // 12
  { type: 'cat',       cat: 'Mature'     },   // 13
  { type: 'cat',       cat: 'Improbable' },   // 14
  { type: 'cat',       cat: 'Plaisir'    },   // 15
  { type: 'malus'                        },   // 16 "Ça va pas du tout"
  { type: 'cat',       cat: 'Scolaire'   },   // 17
  { type: 'challenge'                    },   // 18 "Challenge"
  // ── Arc droit ─────────────────────────────────────────────────────────────
  { type: 'cat',       cat: 'Mature'     },   // 19
  { type: 'cat',       cat: 'Improbable' },   // 20
  { type: 'cat',       cat: 'Plaisir'    },   // 21
  // ── Row 2 : droite → gauche ───────────────────────────────────────────────
  { type: 'cat',       cat: 'Scolaire'   },   // 22
  { type: 'cat',       cat: 'Mature'     },   // 23
  { type: 'bonus'                        },   // 24 "C'est superbe"
  { type: 'cat',       cat: 'Improbable' },   // 25
  { type: 'cat',       cat: 'Plaisir'    },   // 26
  { type: 'malus'                        },   // 27 "Ça va pas du tout"
  { type: 'cat',       cat: 'Scolaire'   },   // 28
  { type: 'cat',       cat: 'Mature'     },   // 29
  // ── Arc gauche ────────────────────────────────────────────────────────────
  { type: 'cat',       cat: 'Improbable' },   // 30
  { type: 'challenge'                    },   // 31 "Challenge"
  { type: 'cat',       cat: 'Plaisir'    },   // 32
  // ── Row 3 : gauche → droite ───────────────────────────────────────────────
  { type: 'cat',       cat: 'Scolaire'   },   // 33
  { type: 'cat',       cat: 'Mature'     },   // 34
  { type: 'cat',       cat: 'Improbable' },   // 35
  { type: 'bonus'                        },   // 36 "C'est superbe"
  { type: 'cat',       cat: 'Plaisir'    },   // 37
  { type: 'cat',       cat: 'Scolaire'   },   // 38
  { type: 'cat',       cat: 'Mature'     },   // 39
  { type: 'finale'                       },   // 40 FINALE
];
