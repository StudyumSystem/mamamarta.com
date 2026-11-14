// Game sounds (11 Nov plan, part 2): three tiny tones made in the browser with the Web Audio API,
// so there are no sound files to download or license (nothing is recorded; the tones are ours, free to use).
// On unless the visitor turned it off with the music button (Marta, 12 Nov, her iPhone: "no sounds"; it used to
// be off until turned on); the choice is remembered on this device.
// iPhone: Web Audio is silent until it is started inside a tap, and the ring/silent switch mutes it as "ambient"
// sound. So the page asks for "playback" audio (navigator.audioSession, Safari 16.4+) before the context is made,
// and the visitor's first tap anywhere starts the context and plays one silent sample, which unlocks it.
// 14 Nov (Marta, her iPhone, again: "no sound in any of the games"). What was missing:
// - navigator.audioSession exists only in Safari 16.4 and later, and not in every app's built-in browser (a link
//   opened inside Telegram), so there the ring/silent switch still muted the tones. The one way that works
//   everywhere on iPhone: inside a tap, also start a looping, truly silent <audio> clip (at normal volume; a
//   muted or volume-0 one doesn't count). While a media element plays, iPhone treats the page's sound as playback,
//   and Web Audio is heard with the switch on silent too. It runs only while a game is open and the page is in
//   view, and stops when the sound is turned off.
// - the taps listened to stopped once the first one had unlocked sound, so when iPhone later paused the sound
//   (the page in the background, a call, the screen locked: the "interrupted" state), nothing could start it
//   again: resume() outside a tap is refused. Every tap now checks and restarts it, and coming back to the page
//   tries too.
// - pointerdown from a finger is not a tap iPhone accepts for sound; touchend, click and keys are.
const KEY = "mm-sound";
let ctx = null;
let tag = null; // the silent <audio>
let inGame = false; // a game's window is open (GameModal's "mm-modal")

export function soundOn() {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

export function setSound(on) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode: lasts this visit */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mm-sound", { detail: { on } }));
  if (on) unlock(); // the click that turns it on also unlocks audio on iPhone
  else tag?.pause();
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch { /* older browsers */ }
    try { ctx = new AC(); } catch { return null; }
  }
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  return ctx;
}

// Half a second of silence as a WAV (8 kHz, 16-bit, every sample 0), made here: no file to load.
function silentWav() {
  const n = 4000, b = new DataView(new ArrayBuffer(44 + n * 2));
  const s = (o, t) => { for (let i = 0; i < t.length; i++) b.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); b.setUint32(4, 36 + n * 2, true); s(8, "WAVEfmt "); b.setUint32(16, 16, true);
  b.setUint16(20, 1, true); b.setUint16(22, 1, true); b.setUint32(24, 8000, true); b.setUint32(28, 16000, true);
  b.setUint16(32, 2, true); b.setUint16(34, 16, true); s(36, "data"); b.setUint32(40, n * 2, true);
  let bin = "";
  const u = new Uint8Array(b.buffer);
  for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

// The silent clip playing (inside a tap only; outside one iPhone refuses, which is harmless).
function holdPlayback() {
  if (!inGame || document.hidden || !soundOn()) return;
  try {
    if (!tag) {
      tag = document.createElement("audio");
      tag.setAttribute("playsinline", "");
      tag.setAttribute("x-webkit-airplay", "deny");
      tag.loop = true;
      tag.preload = "auto";
      tag.src = silentWav();
    }
    if (tag.paused) tag.play().catch(() => {});
  } catch { /* never let a sound break the page */ }
}

// Inside a tap: the silent clip, the context started (or restarted after iPhone paused it) and one silent sample
// played through it, which is what iPhone needs to let Web Audio out.
function unlock() {
  if (!soundOn()) return;
  holdPlayback();
  const ac = audio();
  if (!ac) return;
  try {
    const src = ac.createBufferSource();
    src.buffer = ac.createBuffer(1, 1, ac.sampleRate);
    src.connect(ac.destination);
    src.start(0);
  } catch { /* never let a sound break the page */ }
}

if (typeof window !== "undefined") {
  // window, capture: the first to hear every tap, before any game's own handler
  for (const t of ["touchend", "click", "keydown"]) window.addEventListener(t, unlock, { capture: true, passive: true });
  window.addEventListener("mm-modal", (e) => {
    inGame = !!e.detail?.open;
    if (inGame) holdPlayback(); else tag?.pause();
  });
  const back = () => {
    if (document.hidden) { tag?.pause(); return; }
    holdPlayback();
    if (ctx && ctx.state !== "running" && soundOn()) ctx.resume().catch(() => {});
  };
  document.addEventListener("visibilitychange", back);
  window.addEventListener("pageshow", back);
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

// A kalimba note: the tone with a quieter overtone at 2.76 x that fades first, like a metal tine.
function kalimba(ac, freq, start = 0, gain = 0.07, dur = 0.6) {
  tone(ac, { freq, start, dur, gain });
  tone(ac, { freq: freq * 2.76, start, dur: dur * 0.25, gain: gain * 0.3 });
}

// A playing card flicked over: a crisp, very short paper snap and a soft tap of the card on the table.
function card(ac, level = 1) {
  noise(ac, { freq: 3800, q: 1.4, dur: 0.035, gain: 0.07 * level });
  noise(ac, { freq: 1600, q: 1.2, start: 0.012, dur: 0.05, gain: 0.05 * level });
  tone(ac, { freq: 210, to: 160, start: 0.02, dur: 0.05, gain: 0.04 * level });
}

// Each game has its own sound world (Marta, 11 Nov 19:52 and again 12 Nov 01:51: "the sounds must be different
// for every game"; the first sets were all soft pure tones and sounded alike). Each game now has its own
// material: Memory Match playing cards, Word Hunt a marimba, Tic-Tac-Toe soft pops, Connect the Path water drops,
// The Art of Moving retro coins. flip = a move lands, back = a wrong try, win = the end of a round.
const SETS = {
  // Memory Match (Marta, 12 Nov: "like shuffling cards"; a pair found = a short success, a miss = a short fail,
  // pairs in a row build up "as if you're about to win"): a card flick for every card, a quieter flick when two
  // turn back, two soft falling notes for a miss, a kalimba "yes" that climbs with the run (match, below).
  "memory-match": {
    flip: (ac) => card(ac),
    turn: (ac) => card(ac, 0.6),
    back: (ac) => { tone(ac, { freq: 392, to: 370, dur: 0.14, gain: 0.07 }); tone(ac, { freq: 311.13, to: 294, start: 0.12, dur: 0.22, gain: 0.07 }); },
    win: (ac) => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => kalimba(ac, freq, i * 0.12, 0.06, 0.9)),
  },
  // Word Hunt: a wooden marimba (a low note with its bright overtone), a dull thud for a miss, a marimba run
  "word-hunt": {
    flip: (ac) => { tone(ac, { freq: 523.25, dur: 0.22, gain: 0.09 }); tone(ac, { freq: 2093, dur: 0.05, gain: 0.03 }); },
    back: (ac) => { tone(ac, { freq: 140, to: 110, dur: 0.16, gain: 0.12 }); noise(ac, { freq: 300, q: 0.7, type: "lowpass", dur: 0.08, gain: 0.08 }); },
    win: (ac) => [392, 440, 523.25, 587.33, 659.25, 783.99].forEach((freq, i) => { tone(ac, { freq, start: i * 0.08, dur: 0.25, gain: 0.08 }); tone(ac, { freq: freq * 4, start: i * 0.08, dur: 0.04, gain: 0.02 }); }),
  },
  // Tic-Tac-Toe (Marta, 12 Nov: the harp was "very bad", "more pleasant, or at least back to what it was"):
  // a soft round "pop" of a piece set on the board, two gentle falling notes when Apple wins or it's a draw,
  // a light rising chime for a win
  "tic-tac-toe": {
    flip: (ac) => { tone(ac, { freq: 740, to: 560, dur: 0.09, gain: 0.09 }); tone(ac, { freq: 280, dur: 0.06, gain: 0.05 }); },
    back: (ac) => { tone(ac, { freq: 587.33, dur: 0.22, gain: 0.07 }); tone(ac, { freq: 440, start: 0.16, dur: 0.35, gain: 0.07 }); },
    win: (ac) => [587.33, 739.99, 880, 1174.66].forEach((freq, i) => { tone(ac, { freq, start: i * 0.09, dur: 0.4, gain: 0.06 }); tone(ac, { freq: freq * 2, start: i * 0.09, dur: 0.12, gain: 0.015 }); }),
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
// Memory Match: each pair in a row starts a step higher (C, D, E, G, A, C…); from the second in a row on, a
// third note and a sparkle on top, so a run sounds like it's building to the win.
const RUN = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
SETS["memory-match"].match = (ac, run = 1) => {
  const base = RUN[Math.min(run, RUN.length) - 1];
  kalimba(ac, base, 0, 0.06);
  kalimba(ac, base * 1.5, 0.09, 0.06);
  if (run >= 2) {
    kalimba(ac, base * 2, 0.18, 0.05);
    [2.5, 3, 4].forEach((k, i) => tone(ac, { freq: base * k, type: "triangle", start: 0.26 + i * 0.04, dur: 0.08, gain: 0.02 }));
  }
};
SETS["word-hunt"].match = (ac) => [523.25, 659.25, 783.99].forEach((freq, i) => { tone(ac, { freq, start: i * 0.07, dur: 0.22, gain: 0.08 }); tone(ac, { freq: freq * 4, start: i * 0.07, dur: 0.04, gain: 0.02 }); });
SETS["art-of-moving"].coin = SETS["art-of-moving"].flip;
const SHARED = {
  coins: (ac) => [1567.98, 2093, 2637].forEach((freq, i) => tone(ac, { freq, type: "triangle", start: i * 0.045, dur: 0.08, gain: 0.03 })),
  count: (ac) => Array.from({ length: 8 }, (_, i) => tone(ac, { freq: 1200 + i * 110, type: "triangle", start: i * 0.075, dur: 0.05, gain: 0.03 })),
};

export function play(name, game = "memory-match", level) {
  if (!soundOn()) return;
  const ac = audio();
  if (!ac) return;
  try { ((SETS[game] || SETS["memory-match"])[name] || SHARED[name])?.(ac, level); } catch { /* never let a sound break a game */ }
}
