/**
 * Séquence des 41 cases du plateau TTMC.
 * Index 0 = DÉPART (bas droite), index 40 = FINALE (haut gauche).
 * Layout : 3 rangées × 11 cases + 2 virages × 4 cases = 41 cases.
 *
 *  Row 0 (idx  0-10) : droite → gauche   (DÉPART à l'index 0, côté droit)
 *  Arc L (idx 11-14) : virage gauche
 *  Row 1 (idx 15-25) : gauche → droite
 *  Arc R (idx 26-29) : virage droit
 *  Row 2 (idx 30-40) : droite → gauche   (FINALE à l'index 40, côté gauche)
 */
export const BOARD_LAYOUT = [
  // ── Row 0 : droite → gauche (DÉPART à droite) ────────────────────────────
  { type: 'cat',   cat: 'Mature'      },  // 0  DÉPART
  { type: 'cat',   cat: 'Scolaire'    },  // 1
  { type: 'cat',   cat: 'Plaisir'     },  // 2
  { type: 'malus'                      },  // 3  Ça va pas du tout
  { type: 'cat',   cat: 'Insolite'    },  // 4
  { type: 'cat',   cat: 'Scolaire'    },  // 5
  { type: 'challenge'                  },  // 6  Challenge
  { type: 'cat',   cat: 'Mature'      },  // 7
  { type: 'cat',   cat: 'Plaisir'     },  // 8
  { type: 'bonus'                      },  // 9  C'est superbe
  { type: 'cat',   cat: 'Insolite'    },  // 10
  // ── Arc gauche ────────────────────────────────────────────────────────────
  { type: 'cat',   cat: 'Scolaire'    },  // 11
  { type: 'cat',   cat: 'Mature'      },  // 12
  { type: 'cat',   cat: 'Plaisir'     },  // 13
  { type: 'cat',   cat: 'Insolite'    },  // 14
  // ── Row 1 : gauche → droite ───────────────────────────────────────────────
  { type: 'cat',   cat: 'Scolaire'    },  // 15
  { type: 'cat',   cat: 'Mature'      },  // 16
  { type: 'malus'                      },  // 17  Ça va pas du tout
  { type: 'cat',   cat: 'Insolite'    },  // 18
  { type: 'cat',   cat: 'Plaisir'     },  // 19
  { type: 'cat',   cat: 'Scolaire'    },  // 20
  { type: 'challenge'                  },  // 21  Challenge
  { type: 'cat',   cat: 'Mature'      },  // 22
  { type: 'cat',   cat: 'Insolite'    },  // 23
  { type: 'bonus'                      },  // 24  C'est superbe
  { type: 'cat',   cat: 'Plaisir'     },  // 25
  // ── Arc droit ─────────────────────────────────────────────────────────────
  { type: 'cat',   cat: 'Scolaire'    },  // 26
  { type: 'cat',   cat: 'Mature'      },  // 27
  { type: 'cat',   cat: 'Insolite'    },  // 28
  { type: 'cat',   cat: 'Plaisir'     },  // 29
  // ── Row 2 : droite → gauche (FINALE à gauche) ────────────────────────────
  { type: 'cat',   cat: 'Scolaire'    },  // 30
  { type: 'cat',   cat: 'Mature'      },  // 31
  { type: 'malus'                      },  // 32  Ça va pas du tout
  { type: 'cat',   cat: 'Insolite'    },  // 33
  { type: 'cat',   cat: 'Plaisir'     },  // 34
  { type: 'cat',   cat: 'Scolaire'    },  // 35
  { type: 'challenge'                  },  // 36  Challenge
  { type: 'cat',   cat: 'Mature'      },  // 37
  { type: 'bonus'                      },  // 38  C'est superbe
  { type: 'cat',   cat: 'Insolite'    },  // 39
  { type: 'finale'                     },  // 40  FINALE
];
