// Game sounds (11 Nov plan, part 2): three tiny tones made in the browser with the Web Audio API,
// so there are no sound files to download or license (nothing is recorded; the tones are ours, free to use).
// Off until the visitor turns it on with the music button; the choice is remembered on this device.
const KEY = "mm-sound";
let ctx = null;

export function soundOn() {
  try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
}

export function setSound(on) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode: lasts this visit */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mm-sound", { detail: { on } }));
  if (on) audio(); // the click that turns it on also unlocks audio on iPhone
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// One soft tone: quick attack, exponential fade, optional glide.
function tone(ac, { freq, to, type = "sine", start = 0, dur = 0.1, gain = 0.1 }) {
  const t0 = ac.currentTime + start;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

// Each game has its own set (Marta, 11 Nov 19:52: "the sounds must be different for every game"), all soft and
// short. flip = a move lands, back = a wrong try / a step back, win = the end of a round.
const SETS = {
  // Memory Match: card-like ticks that rise and fall, a small rising chord (C E G C)
  "memory-match": {
    flip: (ac) => tone(ac, { freq: 760, to: 1180, type: "triangle", dur: 0.08, gain: 0.07 }),
    back: (ac) => tone(ac, { freq: 520, to: 300, type: "triangle", dur: 0.13, gain: 0.06 }),
    win: (ac) => [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(ac, { freq, start: i * 0.09, dur: 0.42, gain: 0.07 })),
  },
  // Word Hunt: a marimba-like pluck for a found word, a low soft thud for a miss, a pentatonic run
  "word-hunt": {
    flip: (ac) => { tone(ac, { freq: 880, dur: 0.16, gain: 0.07 }); tone(ac, { freq: 1760, dur: 0.07, gain: 0.025 }); },
    back: (ac) => tone(ac, { freq: 220, to: 170, dur: 0.14, gain: 0.08 }),
    win: (ac) => [587.33, 659.25, 783.99, 880, 1174.66].forEach((freq, i) => tone(ac, { freq, start: i * 0.07, dur: 0.3, gain: 0.06 })),
  },
  // Tic-Tac-Toe: a wooden knock for each move, two falling notes when Apple wins, a bell when you win
  "tic-tac-toe": {
    flip: (ac) => { tone(ac, { freq: 330, to: 240, dur: 0.09, gain: 0.1 }); tone(ac, { freq: 990, type: "triangle", dur: 0.03, gain: 0.02 }); },
    back: (ac) => { tone(ac, { freq: 659.25, dur: 0.22, gain: 0.06 }); tone(ac, { freq: 523.25, start: 0.18, dur: 0.34, gain: 0.06 }); },
    win: (ac) => { tone(ac, { freq: 1046.5, dur: 0.9, gain: 0.06 }); tone(ac, { freq: 1318.5, start: 0.06, dur: 0.9, gain: 0.04 }); },
  },
  // Connect the Path: a small water-drop blip for each dot, a soft step back, a rising sweep to a chord
  "connect-the-path": {
    flip: (ac) => tone(ac, { freq: 1200, to: 640, dur: 0.07, gain: 0.06 }),
    back: (ac) => tone(ac, { freq: 600, to: 420, type: "triangle", dur: 0.09, gain: 0.05 }),
    win: (ac) => { tone(ac, { freq: 400, to: 1600, dur: 0.45, gain: 0.04 }); [783.99, 987.77, 1174.66].forEach((freq) => tone(ac, { freq, start: 0.42, dur: 0.6, gain: 0.04 })); },
  },
  // The Art of Moving: a two-step coin chime, and a short three-note phrase when the run ends
  "art-of-moving": {
    flip: (ac) => { tone(ac, { freq: 987.77, type: "triangle", dur: 0.06, gain: 0.05 }); tone(ac, { freq: 1318.5, type: "triangle", start: 0.06, dur: 0.12, gain: 0.05 }); },
    back: (ac) => tone(ac, { freq: 440, to: 330, type: "triangle", dur: 0.12, gain: 0.05 }),
    win: (ac) => [659.25, 587.33, 783.99].forEach((freq, i) => tone(ac, { freq, type: "triangle", start: i * 0.12, dur: 0.35, gain: 0.05 })),
  },
};

export function play(name, game = "memory-match") {
  if (!soundOn()) return;
  const ac = audio();
  if (!ac) return;
  try { (SETS[game] || SETS["memory-match"])[name]?.(ac); } catch { /* never let a sound break a game */ }
}
