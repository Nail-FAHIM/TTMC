/**
 * Effets sonores générés à la volée via l'API Web Audio.
 * 100% procéduraux → aucun fichier audio, aucune licence tierce, aucun réseau.
 * (voir CREDITS_AUDIO.md à la racine du projet)
 */
let ctx = null;
let muted = false;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted() { return muted; }
export function setMuted(v) { muted = v; }
export function toggleMuted() { muted = !muted; return muted; }

// Joue une note simple (fréquence, durée, forme d'onde, volume)
function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function play(seq) {
  if (muted) return;
  seq.forEach(([f, s, d, type, gain]) => tone(f, s, d, type, gain));
}

// Accord montant joyeux
export const playCorrect = () => play([[523, 0, 0.15], [659, 0.08, 0.16], [784, 0.16, 0.22]]);
// Buzz descendant
export const playWrong = () => play([[196, 0, 0.28, 'sawtooth', 0.14], [155, 0.12, 0.3, 'sawtooth', 0.12]]);
// Arpège de victoire
export const playVictory = () => play([[523, 0, 0.18], [659, 0.12, 0.18], [784, 0.24, 0.18], [1046, 0.36, 0.4]]);
// Descente sombre de défaite
export const playDefeat = () => play([[392, 0, 0.3, 'sawtooth', 0.16], [311, 0.18, 0.3, 'sawtooth', 0.15], [233, 0.36, 0.5, 'sawtooth', 0.14]]);
// Petit "pop" de clic / tirage
export const playClick = () => play([[660, 0, 0.06, 'triangle', 0.12]]);
// Fanfare bonus
export const playBonus = () => play([[784, 0, 0.12], [988, 0.1, 0.14], [1319, 0.22, 0.24]]);
