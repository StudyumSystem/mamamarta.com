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

const SOUNDS = {
  // a card turns over / a move lands: a short bright tick that rises
  flip: (ac) => tone(ac, { freq: 760, to: 1180, type: "triangle", dur: 0.08, gain: 0.07 }),
  // a card turns back / a wrong try: a soft falling tick
  back: (ac) => tone(ac, { freq: 520, to: 300, type: "triangle", dur: 0.13, gain: 0.06 }),
  // the end of a round: a small rising chord (C E G C)
  win: (ac) => [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(ac, { freq, start: i * 0.09, dur: 0.42, gain: 0.07 })),
};

export function play(name) {
  if (!soundOn()) return;
  const ac = audio();
  if (!ac) return;
  try { SOUNDS[name]?.(ac); } catch { /* never let a sound break a game */ }
}
