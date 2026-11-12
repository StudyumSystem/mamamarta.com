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

// A short burst of filtered noise: paper, wood, a soft swish (no file, made in the browser).
let noiseBuf = null;
function noise(ac, { freq = 2000, q = 1, type = "bandpass", start = 0, dur = 0.08, gain = 0.1 }) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = ac.currentTime + start;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t0);
  f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

// Each game has its own sound world (Marta, 11 Nov 19:52 and again 12 Nov 01:51: "the sounds must be different
// for every game"; the first sets were all soft pure tones and sounded alike). Each game now has its own
// material: Memory Match paper cards, Word Hunt a marimba, Tic-Tac-Toe wood, Connect the Path water drops,
// The Art of Moving retro coins. flip = a move lands, back = a wrong try, win = the end of a round.
const SETS = {
  // Memory Match: the swish of a paper card turning, a small music-box chord (C E G C)
  "memory-match": {
    flip: (ac) => noise(ac, { freq: 3200, q: 0.8, dur: 0.07, gain: 0.12 }),
    back: (ac) => { noise(ac, { freq: 1800, q: 0.8, dur: 0.06, gain: 0.09 }); noise(ac, { freq: 1500, q: 0.8, start: 0.08, dur: 0.06, gain: 0.07 }); },
    win: (ac) => [1046.5, 1318.5, 1567.98, 2093].forEach((freq, i) => tone(ac, { freq, start: i * 0.11, dur: 0.5, gain: 0.05 })),
  },
  // Word Hunt: a wooden marimba (a low note with its bright overtone), a dull thud for a miss, a marimba run
  "word-hunt": {
    flip: (ac) => { tone(ac, { freq: 523.25, dur: 0.22, gain: 0.09 }); tone(ac, { freq: 2093, dur: 0.05, gain: 0.03 }); },
    back: (ac) => { tone(ac, { freq: 140, to: 110, dur: 0.16, gain: 0.12 }); noise(ac, { freq: 300, q: 0.7, type: "lowpass", dur: 0.08, gain: 0.08 }); },
    win: (ac) => [392, 440, 523.25, 587.33, 659.25, 783.99].forEach((freq, i) => { tone(ac, { freq, start: i * 0.08, dur: 0.25, gain: 0.08 }); tone(ac, { freq: freq * 4, start: i * 0.08, dur: 0.04, gain: 0.02 }); }),
  },
  // Tic-Tac-Toe: a hollow wooden knock for each move, a low falling "boo" when Apple wins, a wooden fanfare
  "tic-tac-toe": {
    flip: (ac) => { noise(ac, { freq: 900, q: 6, dur: 0.06, gain: 0.25 }); tone(ac, { freq: 180, to: 120, dur: 0.07, gain: 0.12 }); },
    back: (ac) => { tone(ac, { freq: 300, to: 150, type: "sawtooth", dur: 0.5, gain: 0.03 }); },
    win: (ac) => [0, 0.12, 0.24, 0.42].forEach((start, i) => noise(ac, { freq: [900, 1100, 1300, 1600][i], q: 6, start, dur: 0.07, gain: 0.25 })),
  },
  // Connect the Path: a water drop for each dot (a quick rising bloop), a soft drip back, a little bubbling run
  "connect-the-path": {
    flip: (ac) => tone(ac, { freq: 500, to: 1400, dur: 0.09, gain: 0.08 }),
    back: (ac) => tone(ac, { freq: 900, to: 350, dur: 0.12, gain: 0.06 }),
    win: (ac) => Array.from({ length: 7 }, (_, i) => tone(ac, { freq: 450 + i * 120, to: 1300 + i * 180, start: i * 0.07, dur: 0.09, gain: 0.07 })),
  },
  // The Art of Moving: a retro game coin (two square-wave notes), a short buzz for a fall, a retro jingle
  "art-of-moving": {
    flip: (ac) => { tone(ac, { freq: 987.77, type: "square", dur: 0.06, gain: 0.03 }); tone(ac, { freq: 1318.5, type: "square", start: 0.06, dur: 0.18, gain: 0.03 }); },
    back: (ac) => tone(ac, { freq: 220, to: 90, type: "square", dur: 0.35, gain: 0.03 }),
    win: (ac) => [659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => tone(ac, { freq, type: "square", start: i * 0.1, dur: 0.14, gain: 0.03 })),
  },
};

// Marta, 11 Nov 19:56: "also a sound for found elements in the games, and for the coins being credited".
// match = a pair / a word found (its own per game); coin = a coin taken in The Art of Moving;
// coins = MM✦ credited (a small sparkle, the same in every game); count = the MM✦STARS counted on the score screen.
SETS["memory-match"].match = (ac) => { tone(ac, { freq: 1567.98, dur: 0.3, gain: 0.05 }); tone(ac, { freq: 2093, start: 0.09, dur: 0.35, gain: 0.05 }); };
SETS["word-hunt"].match = (ac) => [523.25, 659.25, 783.99].forEach((freq, i) => { tone(ac, { freq, start: i * 0.07, dur: 0.22, gain: 0.08 }); tone(ac, { freq: freq * 4, start: i * 0.07, dur: 0.04, gain: 0.02 }); });
SETS["art-of-moving"].coin = SETS["art-of-moving"].flip;
const SHARED = {
  coins: (ac) => [1567.98, 2093, 2637].forEach((freq, i) => tone(ac, { freq, type: "triangle", start: i * 0.045, dur: 0.08, gain: 0.03 })),
  count: (ac) => Array.from({ length: 8 }, (_, i) => tone(ac, { freq: 1200 + i * 110, type: "triangle", start: i * 0.075, dur: 0.05, gain: 0.03 })),
};

export function play(name, game = "memory-match") {
  if (!soundOn()) return;
  const ac = audio();
  if (!ac) return;
  try { ((SETS[game] || SETS["memory-match"])[name] || SHARED[name])?.(ac); } catch { /* never let a sound break a game */ }
}
