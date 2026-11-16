import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen, StarIcon } from "./GameModal.jsx";
import { takeQuote, prefersReducedMotion, recordStars, ROUND_STARS } from "./shared.js";
import { play as playSound } from "./sound.js";
import { H0, FH, BODY_U, PLAT_H, COIN_R, FOOT_FRONT, FOOT_BACK, GRACE, V0, G, Y_START, SPEED0, STREAK_BONUS, POP_T, clamp, newWorld, pressJump, runStep } from "./aomWorld.js";
import SHEETS from "./aomPoses.json";
const sound = (name, level) => playSound(name, "art-of-moving", level);

// MM-GAME-04 The Art of Moving (Marta's spec + frames MM-G04-01…05): endless runner.
// Default → Start → countdown 3, 2, 1, GO → automatic run, one input = one fixed jump → one fall ends the run
// → score screen (coins, personal best in localStorage, MM✦STARS, timer line) → Completion with the quote rotation.
// 10 Nov (Marta): the figure walks to the right (her clips mirrored).
// 12 Nov (Marta: "still hangs in the air … she must stand on the brick. At the start she simply stands, then starts
// walking, and all other moves come from the controls … make the game more alive, you can cut or choose from her
// clips"): her three clips (walk, leap, stumble) are cut into frames in the browser when the game opens, each
// frame's sole and middle are measured, and every frame is drawn with its own sole on her brick.
// 12 Nov 13:39 (Marta: "she must stand still, static, like on my screen … landed on the brick … smoother, more
// alive … she walks on air … when I start jumping, I lose straight away"):
// - she stands on her brick from the first screen on, in one still frame of her leap clip (0.875 s: upright, feet
//   together, the narrowest feet of all her frames), until GO; then her own first steps out of that stand
//   (0.917 to 1.25 s of the same clip) lead into her walk at the walk frame that matches them.
// - her walk is every frame of her clip (30 a second, not 15); the leap is her push-off (from 2.0 s), the air and
//   her landing (3.25 to 3.42 s), and a miss is her stumble; a change from one kind of move to another is a short
//   cross-fade (80 ms), not a cut.
// - the leap clip loses the top of her head out of its frame from 2.46 to 3.33 s: its round top is put back.
// - nothing under her soles is kept (her floor and its shadow), and near her soles only real darkness counts, so no
//   grey haze hangs under her shoes over the white.
// - the instant loss: her first brick ends 405 units ahead of her and the first gap was 70 to 114 wide; a first
//   press about a second after GO (her first jump) came down past the brick's end with her front foot short of the
//   next one, and she fell (30 to 80 runs of 100, measured on the check page). Her first five bricks are now level
//   or a small step down with gaps of 64 to 70, a landing a hair late still counts, and a jump that comes down
//   short lands on her back foot: no press there can end the run (aomWorld.js).
// 15 Nov (Marta: "the moves look a little delayed, blurred, there's no plasticity … it looks like it's being
// chopped"; "the game lacks sounds for the jump"; "three coins in a row … extra MM-stars"). What was found and done:
// - her walk was 54 pictures shown 30 a second, but 18 of them repeat the picture before them (her walk clip holds
//   about a third of its frames twice), so she held a pose for 2 or 3 steps of the screen and then jumped two
//   poses: a stutter in every stride. The repeats are now left out and her 36 different poses share the same 1.8 s
//   stride evenly (20 a second at her starting pace), so each pose stays on screen the same time.
// - her leap's pictures begin with her push-off on the floor (2.0 to 2.42 s of the clip, 6 of its 15 pictures);
//   they filled the whole rise, so she went up with her legs still pushing at the floor: the move came late. Now
//   the push-off passes in the first tenth of a second and her flight (from 2.46 s, when her feet are off the
//   floor) fills the arc; coming down, the last pictures are timed to the brick she will land on, so her landing
//   pose meets the brick on a higher or lower brick too, not only on a level one.
// - every change from one kind of move to another (walk to leap, leap to landing, landing to walk) was an 80 ms
//   cross-fade that drew both pictures at once: three short double-exposures in every jump, which read as blur.
//   Now the change is a clean switch, at frames chosen to match (her landing's last pose into the walk's
//   matching pose, as before); the extra canvas drawn for the cross-fade every frame of it is gone too.
// - a landing a few units under a brick's top (her grace) popped her up in one frame; now she eases up in ~0.1 s.
// - the canvas is drawn at up to 3 device pixels per px (was 2): on an iPhone (3) the browser no longer stretches
//   a 2x picture of her by half again, a second blur on top of the first.
// - sounds for her moves: a soft jump, a muted landing, a barely-there footfall; coins in a row climb a step each;
//   every third coin in a row adds 10 MM✦ with a little sparkle and a pink "+10" by her (aomWorld.js, sound.js).

const INSTRUCTIONS = "Keep moving. Jump between platforms and collect pink coins. One fall ends the run.";
const PINK = "#F600A9";
const BEST_KEY = "mm-art-of-moving-best";
// 15 Nov (Marta: after a fall "nothing happens, it freezes"): these two were missing, so the end of every run stopped
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; } };
const writeBest = (n) => { try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* this visit only */ } };
// 11 Nov (her MM-G04-04 Desktop_Score: 23 coins, 150 MM✦STARS): 10 MM✦ a coin, at most 150 a run (question for Marta).
const COIN_STARS = 10;
// 15 Nov (Marta): plus the bonus of her coins in a row (10 MM✦ for every third in a row), under the same cap
const runStars = (n, bonus = 0) => Math.min(ROUND_STARS, n * COIN_STARS + bonus);
const STAR_RAIN = 28; // pink stars falling over the panel when a run ends (12 Nov)

const MIN_VIEW_W = 560; // on tall phone frames the world is scaled to show at least this much ahead
const SINK = 1; // a sole sits this far into the brick, so no hair of white shows under it on any screen
const PLAT_R = 12;
// Her four-point star (Star 2, the same as in GameModal), drawn in a 24 x 24 box, 70% of the badge across.
const STAR = typeof Path2D !== "undefined" ? new Path2D("M12 0c.9 6.4 5.1 10.9 12 12-6.9 1.1-11.1 5.6-12 12-.9-6.4-5.1-10.9-12-12C6.9 10.9 11.1 6.4 12 0z") : null;
const STAR_K = (COIN_R * 2 * 0.7) / 24;

// Her poses, by kind: stand (the countdown), start (her first steps after GO), walk (loops), air, land, fall; which
// of her frames each one is and how they are cut is in scripts/make-aom-poses.mjs (her frames chosen on 12 Nov).
// 14 Nov (Marta, her iPhone: "the figure isn't there. For a few seconds it freezes, then the figure appears. Why
// does it blink? It didn't do that before"): since 12 Nov her three clips (3.4 MB, fetched past the cache on every
// visit) were played through in the browser when the game opened and every frame cut on a canvas. On a phone that
// took several seconds, so the countdown ran with her brick and no her, and GO waited for her; and a phone can hand
// a canvas an empty or black picture from a video it plays off screen, which came out as her missing or a dark
// flash for a frame. Now the same frames are cut ahead of time, the same way, into six small pictures (0.5 MB, kept
// by the browser's cache); each is fully decoded before the game counts down, and only then does she appear.
// 15 Nov (Marta: "it looks like it's being chopped"): her walk is one stride of 1.8 s of her clip (54 pictures at
// 30 a second in scripts/make-aom-poses.mjs), played by its length, not by a picture count, so leaving out the
// pictures that repeat keeps her feet at the ground's pace.
const WALK_LOOP = 1.8;
const START_FPS = 24;
const SETTLE = 0.22; // landing (s)
// 15 Nov (Marta: "delayed"): in her leap's pictures (2.0 to 3.17 s of the clip) her feet leave the floor at 2.46 s,
// this share of the way through them; her push-off before it passes in the first PUSH of a jump's arc (~0.1 s).
const AIR_LIFT = (59 - 48) / (76 - 48);
const PUSH = 0.13;
const LAND_EASE = 0.035; // 15 Nov: a landing under a brick's top eases up (s, time constant)
const STEP_SOUND = true; // 15 Nov: a barely-there tap at each footfall of her walk (false: none)
const POP_PX = 26; // 15 Nov: the "+10" of a bonus, Inter, in world units (about 16 px on a phone, 25 on a computer)

let poses = null;
let posesLoading = null;
const loadSheet = (src) => new Promise((res, rej) => {
  const i = new Image();
  i.onload = () => Promise.resolve(i.decode?.()).catch(() => {}).then(() => res(i));
  i.onerror = rej;
  i.src = src;
});
function loadPoses() {
  if (poses) return Promise.resolve(poses);
  if (posesLoading || typeof document === "undefined") return posesLoading;
  posesLoading = Promise.all(SHEETS.sheets.map((s) => loadSheet(s.src)))
    .then((imgs) => {
      const u = BODY_U / SHEETS.cutH;
      const out = {};
      for (const [name, list] of Object.entries(SHEETS.poses)) {
        out[name] = list.map(([s, sx, sy, w, h, sole, cx, left, fl, fr, ht]) => ({ img: imgs[s], sx, sy, w, h, sole, cx, left, fl, fr, ht, u }));
      }
      // middles evened out between neighbouring frames, in the clip's own frame (each crop starts elsewhere), so
      // she doesn't shiver forward and back; round for the walk, so its loop has no seam
      const even = (list, round) => {
        const n = list.length;
        const r = round ? 2 : 1;
        return list.map((f, i) => {
          let s = 0, m = 0;
          for (let j = -r; j <= r; j++) {
            const o = list[round ? (i + j + n) % n : clamp(i + j, 0, n - 1)];
            s += o.cx + o.left; m++;
          }
          return { ...f, cx: 0.5 * f.cx + 0.5 * (s / m - f.left) };
        });
      };
      // 15 Nov (Marta: "chopped"): a picture that repeats the one before it (the same cut, the same measures) is
      // left out, so no pose is held twice as long as the next; the walk's last picture too if it repeats its first
      const same = (a, b) => a.w === b.w && a.h === b.h && a.sole === b.sole && a.fl === b.fl && a.fr === b.fr && Math.abs(a.cx - b.cx) < 0.1;
      const once = (list, round) => {
        const l = list.filter((f, i) => i === 0 || !same(f, list[i - 1]));
        return round && l.length > 2 && same(l[l.length - 1], l[0]) ? l.slice(0, -1) : l;
      };
      const walk = even(once(out.walk, true), true);
      // her footfalls: the pictures where her feet are furthest apart (the front heel meets the floor), each the
      // widest of its neighbours around the loop, for the step's sound
      const r = Math.max(2, Math.round(walk.length / 8));
      const feet = walk.map((f, i) => {
        for (let j = 1; j <= r; j++) if (walk[(i - j + walk.length) % walk.length].w >= f.w || walk[(i + j) % walk.length].w > f.w) return -1;
        return i;
      }).filter((i) => i >= 0);
      // where her walk takes over: the walk frame whose feet are where they are in the frame before it (front foot
      // and back foot from her middle), and the walk goes on from the frame after that one
      const next = (f) => {
        let best = 0, bd = Infinity;
        walk.forEach((w, i) => {
          const dd = Math.abs(w.cx - w.fl - (f.cx - f.fl)) + Math.abs(w.fr - w.cx - (f.fr - f.cx));
          if (dd < bd) { bd = dd; best = i; }
        });
        return (best + 1) % walk.length;
      };
      const start = even(out.start, false);
      poses = { stand: out.stand[0], start, startTo: next(start[start.length - 1]), walk, feet, air: even(out.air, false), land: out.land, landTo: next(out.land[out.land.length - 1]), fall: out.fall };
      return poses;
    })
    .catch(() => null)
    .then((p) => { if (!p) posesLoading = null; return p; }); // try again on the next open
  return posesLoading;
}


// The canvas fitted to the frame: v = { s: units → px, offY, viewW: units across, dpr }. Its size is set only when
// it changes: setting it empties the canvas, and a phone's toolbar coming and going must not blank her for a frame.
function fitCanvas(canvas, frame, v) {
  const w = frame.clientWidth, h = frame.clientHeight;
  if (!w || !h) return false;
  v.dpr = Math.min(3, window.devicePixelRatio || 1); // 15 Nov: 3, not 2 (an iPhone's screen; see the top)
  const cw = Math.round(w * v.dpr), ch = Math.round(h * v.dpr);
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;
  v.s = Math.min(w / MIN_VIEW_W, h / H0);
  v.viewW = w / v.s;
  v.offY = (h - H0 * v.s) / 2;
  return true;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One of her frames with its own sole on her feet (X, Y: a brick's top when she stands), its middle on hers, mirrored.
function putFrame(c, f, X, Y, a) {
  c.globalAlpha = a;
  c.save();
  c.translate(X, Y + SINK);
  c.scale(-f.u, f.u);
  c.drawImage(f.img, f.sx, f.sy, f.w, f.h, -f.cx, -f.sole, f.w, f.h);
  c.restore();
}

// 15 Nov (Marta): the "+10" of a bonus (every third coin in a row), pink Inter and her star, at the height of the
// coin just in front of her (on the white, never over her); it comes in quickly, stays, rises a little and fades
// out softly (with reduced motion it doesn't rise).
function drawPops(ctx, g, v, X) {
  if (!g.pops.length || !STAR) return;
  const label = `+${STREAK_BONUS}`;
  ctx.font = `400 ${POP_PX}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(label).width, sw = POP_PX * 0.8, gap = POP_PX * 0.2, w = tw + gap + sw;
  ctx.fillStyle = PINK;
  for (const pp of g.pops) {
    const t = (g.clock - pp.at) / POP_T;
    if (t < 0 || t >= 1) continue;
    const ease = (k) => k * k * (3 - 2 * k);
    const a = ease(clamp(t / 0.12, 0, 1)) * (1 - ease(clamp((t - 0.5) / 0.5, 0, 1)));
    const rise = v.still ? 0 : 30 * (1 - (1 - t) * (1 - t));
    const x = clamp(X + 80, 10, v.viewW - 10 - w);
    const y = Math.max(POP_PX, pp.y - rise);
    ctx.globalAlpha = a;
    ctx.fillText(label, x, y);
    ctx.save();
    ctx.translate(x + tw + gap, y - sw / 2);
    ctx.scale(sw / 24, sw / 24);
    ctx.fill(STAR);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// The world as it is: her bricks, her coins, her. fig = { f, dy }: her frame, and how far under her feet's place
// it is drawn just after a landing (15 Nov: the cross-fade between two kinds of move, two of her pictures drawn
// at once, is gone; see the top).
function drawWorld(ctx, canvas, g, v, fig) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(v.dpr * v.s, 0, 0, v.dpr * v.s, 0, v.dpr * v.offY);
  const camX = g.p.x - g.anchor * v.viewW;
  ctx.fillStyle = "#000";
  for (const plat of g.plats) {
    const x = plat.x - camX;
    if (x > v.viewW || x + plat.w < 0) continue;
    roundRect(ctx, x, plat.y, plat.w, PLAT_H, PLAT_R);
    ctx.fill();
  }
  for (const c of g.coins) {
    let r = COIN_R, a = 1;
    if (c.taken) {
      const k = (g.clock - c.taken) / 0.25; // quick scale and fade
      if (k >= 1) continue;
      r *= 1 + 0.6 * k; a = 1 - k;
    }
    const x = c.x - camX;
    if (x < -COIN_R * 2 || x > v.viewW + COIN_R * 2) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.arc(x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
    if (STAR) {
      const k = STAR_K * (r / COIN_R);
      ctx.save();
      ctx.translate(x - 12 * k, c.y - 12 * k);
      ctx.scale(k, k);
      ctx.fillStyle = "#fff";
      ctx.fill(STAR);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  const X = g.p.x - camX;
  if (fig && g.fade > 0) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // 15 Nov: "high", not "medium" (her pictures are scaled down or up to fit)
    putFrame(ctx, fig.f, X, g.p.y + (fig.dy || 0), g.fade);
    ctx.globalAlpha = 1;
  }
  drawPops(ctx, g, v, X);
}

const coinLabel = (n) => `${n} ${n > 1 ? "coins" : "coin"}`; // Figma: "0 coin", "3 coins"

export default function ArtOfMoving({ open, onClose }) {
  const [phase, setPhase] = useState("default"); // default | countdown | play | result | done
  const [runId, setRunId] = useState(0);
  const [count, setCount] = useState(null);
  const [coins, setCoins] = useState(0);
  const [bonus, setBonus] = useState(0); // 15 Nov: MM✦ from her coins in a row
  const [result, setResult] = useState(null);
  const [quote, setQuote] = useState(null);
  const [finish, setFinish] = useState(null); // null | "fade" | the falling stars
  const [touch, setTouch] = useState(false);
  const [layout, setLayout] = useState({ s: 1, offY: 0 });
  const [ready, setReady] = useState(!!poses);
  const [late, setLate] = useState(false); // her pictures didn't come in 8 s after Start: the run goes on without waiting
  const canRun = ready || late;
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const jumpRef = useRef(() => {});
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setPhase("default");
    setRunId(0);
    setCount(null);
    setCoins(0);
    setBonus(0);
    setResult(null);
    setQuote(null);
    setFinish(null);
    setLate(false);
  }, []);

  // Closing or reopening always comes back to the Default screen; the best score stays.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);
  useEffect(() => { setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false); }, []);
  // her poses are loaded while the Default screen is up
  useEffect(() => {
    if (!open || ready) return;
    let live = true;
    loadPoses()?.then((p) => live && p && setReady(true));
    return () => { live = false; };
  }, [open, ready]);

  // The first screen is her MM-G04-01: only the Start card on white (her figure behind it hid "Press Space to
  // jump"). She appears standing still on her brick with the countdown, as in her MM-G04-02 (12 Nov).
  useEffect(() => {
    if (!open || phase !== "default") return;
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }, [open, phase]);

  const start = useCallback(() => {
    clearTimers();
    setCoins(0);
    setBonus(0);
    setResult(null);
    setFinish(null);
    setPhase("countdown");
    setRunId((n) => n + 1);
    if (!poses) {
      loadPoses()?.then((p) => p && setReady(true));
      later(() => setLate(true), 8000);
    }
  }, []);

  const endRun = useCallback((n, b = 0) => {
    const best = readBest();
    const isBest = n > best;
    if (isBest) writeBest(n);
    setResult({ coins: n, bonus: b, isBest }); // 15 Nov: with the bonus of her coins in a row
    recordStars("art-of-moving", runStars(n, b));
    sound("win");
    // 12 Nov (Marta): pink stars rain over the panel, then the score screen (reduced motion: the panel fades)
    if (prefersReducedMotion()) {
      setFinish("fade");
      later(() => setPhase("score"), 800);
      return;
    }
    const f = frameRef.current;
    const w = f?.offsetWidth || 320, h = f?.offsetHeight || 500;
    setFinish(Array.from({ length: STAR_RAIN }, (_, i) => ({
      left: `${((i + Math.random()) / STAR_RAIN) * 100}%`,
      s: w * (0.035 + Math.random() * 0.045),
      fall: `${h * 1.15}px`,
      rot: `${(Math.random() - 0.5) * 240}deg`,
      delay: `${Math.random() * 420}ms`,
      dur: `${820 + Math.random() * 240}ms`,
    })));
    later(() => setPhase("score"), 1500);
  }, []);

  const toQuote = useCallback(() => { setQuote(takeQuote("art-of-moving")); setPhase("done"); }, []);

  // The run itself: one requestAnimationFrame loop per Start. Each frame only moves numbers and draws; React hears
  // of a coin taken and of the end, nothing else.
  // It begins once her poses are in (14 Nov: she is on her brick from the countdown's first frame, never after it);
  // the first frame is drawn before the screen is painted, so there is no empty frame between Start and her.
  useLayoutEffect(() => {
    if (!open || !runId || !canRun) return;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d");
    const g = newWorld();
    const v = { s: 1, offY: 0, viewW: 660, dpr: 1, still: prefersReducedMotion() };
    let lastFig = null;
    const resize = () => {
      if (!fitCanvas(canvas, frame, v)) return;
      drawWorld(ctx, canvas, g, v, lastFig); // straight away, so a new size never shows an empty canvas
      setLayout({ s: v.s, offY: v.offY });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    // her moves: mode = start (her first steps after GO) | walk | land; ph = where she is in her first steps,
    // walkPh = in her walk (pictures); dy = how far under a brick's top she landed (eased away, 15 Nov);
    // jumps = jumps heard; airK/airFor = how far through her flight's pictures she is, never going back (15 Nov)
    const m = { mode: "start", ph: 0, walkPh: 0, low: null, dy: 0, jumps: 0, airK: 0, airFor: -1 };

    // 15 Nov (Marta: "sounds for the jump"): a jump's sound the moment it begins, from a press or from a press
    // remembered for the landing
    const hear = () => { if (g.jumps !== m.jumps) { m.jumps = g.jumps; sound("jump"); } };
    jumpRef.current = () => { pressJump(g); hear(); };

    const step = (h) => {
      const { ev, got, bonus } = runStep(g, h, v.viewW);
      // 15 Nov (Marta): each coin in a row a step higher; every third in a row its bonus, with a sparkle
      if (got) { setCoins(g.coinsTaken); sound("coin", g.streak); }
      if (bonus) { setBonus(g.bonus); sound("bonus"); }
      if (ev === "over") endRun(g.coinsTaken, g.bonus);
      if (ev === "land") {
        m.mode = "land";
        m.dy = g.p.sink || 0;
        if (g.p.ground) sound("land"); // not when a remembered press takes her straight up again
      }
      hear();
      // her steps keep pace with the ground: at the starting speed her clips' own pace, faster as she speeds up
      const P = poses;
      if (P && g.mode === "play" && g.p.ground) {
        const rate = g.speed / SPEED0;
        if (m.mode === "start") {
          m.ph += h * START_FPS * Math.max(0.6, rate);
          if (m.ph >= P.start.length) { m.mode = "walk"; m.walkPh = P.startTo; }
        } else if (m.mode === "land") {
          if (g.clock - g.p.landAt >= SETTLE) { m.mode = "walk"; m.walkPh = P.landTo; }
        } else {
          // 15 Nov: her stride by its length (see WALK_LOOP), and a soft tap at each footfall
          const before = Math.floor(m.walkPh);
          m.walkPh += (h * rate * P.walk.length) / WALK_LOOP;
          if (STEP_SOUND) for (let i = before + 1; i <= Math.floor(m.walkPh); i++) if (P.feet.includes(i % P.walk.length)) sound("step");
        }
      }
    };

    // 15 Nov (Marta: "delayed"): how long until she comes down on a brick from where she is (s), or null over a gap
    const toLand = () => {
      const p = g.p;
      let best = null;
      for (const q of g.plats) {
        const d = q.y - p.y;
        if (d < 0) continue;
        const t = (-p.vy + Math.sqrt(p.vy * p.vy + 2 * G * d)) / G;
        const x = p.x + g.speed * t;
        if (x + FOOT_FRONT >= q.x && x - FOOT_BACK <= q.x + q.w && (best == null || t < best)) best = t;
      }
      return best;
    };
    // coming down, the share of the way from the top of her arc to the brick she will land on (by the clock)
    const downK = () => {
      const t = toLand(), ta = Math.max(0, g.p.vy) / G;
      if (t == null) return null;
      return ta + t > 1e-6 ? ta / (ta + t) : 1;
    };

    // the highest a brick near her lets her stand: below it (and the grace) she has missed
    const lowTop = () => {
      let low = -Infinity;
      for (const q of g.plats) if (q.x < g.p.x + FOOT_FRONT + 200 && q.x + q.w > g.p.x - 200) low = Math.max(low, q.y);
      return low;
    };
    // Her pose for this moment, from her own frames: standing until GO, her first steps, then walking; in the air
    // by where she is on the arc (push-off and tuck rising, the leg reaching for the brick coming down); her
    // landing; her stumble once she has missed.
    // 15 Nov (Marta: "delayed"): a jump's push-off pictures pass in its first PUSH, her flight's fill the rest, and
    // coming down they are timed to the brick she lands on, so the last of them meets the brick (see the top).
    const pose = () => {
      const P = poses;
      if (!P) return null;
      const p = g.p;
      const pick = (list, k) => list[clamp(Math.floor(k * list.length), 0, list.length - 1)];
      if (g.mode === "countdown") return P.stand;
      if (g.mode === "play" && p.ground) { m.low = null; m.airFor = -1; }
      if (g.mode !== "play" || (!p.ground && p.vy > 0 && p.y > lowTop() + GRACE)) {
        if (m.low == null) m.low = lowTop();
        return pick(P.fall, (p.y - m.low - GRACE) / 160);
      }
      if (!p.ground) {
        const flight = g.jumps * 2 + (p.jumped ? 1 : 0);
        if (m.airFor !== flight) { m.airFor = flight; m.airK = 0; }
        if (p.jumped) {
          const dk = p.vy > 0 ? downK() : null;
          m.airK = Math.max(m.airK, dk == null ? (p.vy + V0) / (2 * V0) : 0.5 + 0.5 * dk);
          const n = P.air.length, lift = Math.ceil(AIR_LIFT * (n - 1) - 1e-9), k = m.airK;
          const i = k < PUSH ? (k / PUSH) * lift : lift + ((k - PUSH) / (1 - PUSH)) * (n - lift);
          return P.air[clamp(Math.floor(i), 0, n - 1)];
        }
        // off a brick's edge without a jump: the second half of her flight, as before, timed to the brick ahead
        const dk = downK();
        m.airK = Math.max(m.airK, dk == null ? clamp(p.vy / V0, 0, 1) : dk);
        return pick(P.air, 0.6 + 0.4 * m.airK);
      }
      if (m.mode === "start") return P.start[Math.min(P.start.length - 1, Math.floor(m.ph))];
      if (m.mode === "land") return pick(P.land, (g.clock - p.landAt) / SETTLE);
      return P.walk[Math.floor(m.walkPh) % P.walk.length];
    };
    // 15 Nov: one picture of her, never two at once (the cross-fade is gone); just after a landing under a brick's
    // top she is drawn that little lower and eases up onto it
    const figure = () => {
      const f = pose();
      if (!f) return null;
      const p = g.p;
      const dy = p.ground && m.dy > 0 ? m.dy * Math.exp(-(g.clock - p.landAt) / LAND_EASE) : 0;
      return { f, dy: dy > 0.05 ? dy : 0 };
    };

    // Countdown 3, 2, 1, GO (~1 s each); no input until GO. If her poses are still loading, GO waits for them
    // (at most 12 s more).
    setCount("3");
    later(() => setCount("2"), 1000);
    later(() => setCount("1"), 2000);
    let waited = 0;
    const go = () => {
      if (!poses && waited < 12000) { waited += 100; later(go, 100); return; }
      setCount("GO");
      setPhase("play");
      g.mode = "play";
      later(() => setCount(null), 700);
    };
    later(go, 3000);

    let last = performance.now();
    let raf;
    const tick = (now) => {
      let dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      while (dt > 0) { const h = Math.min(dt, 1 / 120); step(h); dt -= h; }
      lastFig = figure();
      drawWorld(ctx, canvas, g, v, lastFig);
      if (g.mode !== "over") raf = requestAnimationFrame(tick);
    };
    lastFig = figure();
    drawWorld(ctx, canvas, g, v, lastFig);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearTimers();
      jumpRef.current = () => {};
    };
  }, [open, runId, canRun, endRun]);

  // Space jumps (and starts from the Default screen). Buttons keep their own Space.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (e.target instanceof Element && e.target.closest("button, a, input, textarea")) return;
      e.preventDefault();
      if (e.repeat) return;
      if (phase === "default") start();
      else jumpRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, start]);

  const onAreaDown = (e) => {
    if (phase !== "play") return;
    if (e.target instanceof Element && e.target.closest("button, a")) return;
    e.preventDefault();
    jumpRef.current();
  };

  const running = phase === "countdown" || phase === "play";
  const ended = phase === "score" || phase === "done";
  const counter = running ? coinLabel(coins) : null;

  return (
    <GameModal
      open={open}
      onClose={onClose}
      onBack={phase === "done" && result ? () => setPhase("score") : null}
      label="The Art of Moving"
      game
      stage={phase !== "done"}
      instructions={ended ? null : INSTRUCTIONS}
      counter={counter}
      stars={ended ? null : runStars(coins, bonus)}
      hud={!ended}
      confirm={ended ? "completed" : running ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" && result ? (
        <ScoreScreen badge={result.isBest ? "New personal best" : null} label="Coins" value={String(result.coins)} stars={runStars(result.coins, result.bonus)} onDone={toQuote} />
      ) : (
        <div
          onPointerDown={onAreaDown}
          className="flex flex-1 select-none items-start justify-center px-[19px] pt-[16px] lg:pointer-events-none lg:absolute lg:inset-0 lg:p-0 lg:pt-[calc(190*var(--mm-u))] [touch-action:manipulation]"
          style={running ? { touchAction: "none" } : undefined}
        >
          {/* 12 Nov (Marta: "the size of the game doesn't match the design"): her MM-G04-03 card is 635 x 726, 190 px
              from the panel's top, centred; on the computer in her frame's px measured against the screen's height
              (--mm-u, see GameModal), as Tic-Tac-Toe and Word Hunt. The phone keeps her 311 x 584 frame. */}
          <div
            ref={frameRef}
            data-aom={ready ? "ready" : "loading"}
            className={`${finish === "fade" ? "mm-fade-out" : ""} relative isolate w-[min(100%,calc((100cqh-16px)*311/584))] aspect-[311/584] overflow-hidden rounded-[30px] border border-black bg-white lg:pointer-events-auto lg:w-auto lg:max-w-none lg:rounded-[calc(38*var(--mm-u))] lg:h-[calc(726*var(--mm-u))] lg:aspect-[635/726]`}
          >
            {/* her brick and her, standing, from the first screen on (12 Nov) */}
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

            {count && (
              <span
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 font-normal leading-none"
                style={{ top: layout.offY + (Y_START - 0.5 * FH) * layout.s, fontSize: 110 * layout.s, color: PINK }}
                aria-live="assertive"
              >
                <span key={count} className="mm-count block">{count}</span>
              </span>
            )}

            {phase === "default" && (
              <div className="mm-fade-in absolute inset-0 flex flex-col items-center justify-center px-6 pt-[18%] text-center [container-type:inline-size]">
                <p className="text-[17px] leading-[1.45] lg:leading-[1.41] lg:text-[clamp(15px,1.146vw,22px)] font-normal text-black/70">
                  {/* her MM-G04-01 (11 Nov): "Press Space to jump. Ready?"; on the computer two lines at 22 px as her frame (14 Nov) */}
                  {touch ? "Tap anywhere to jump. Ready?" : <>Press Space to jump.<br className="max-lg:hidden" /> Ready?</>}
                </p>
                <button
                  type="button"
                  onClick={start}
                  // phone: her phone buttons are 199 x 46, Inter 600 16 (MM-G04 Mobile, Marta 13 Nov 22:07 "the button is the wrong size");
                  // 15 Nov (Marta, Threads' browser: the card shrank to ~214 wide and the button nearly filled it): on a
                  // smaller card it shrinks with it, 199/311 of the card's width, never more than her 199 x 46
                  className="mm-gradient mt-8 inline-flex aspect-[199/46] w-[min(199px,64cqw)] items-center justify-center gap-2 text-[min(16px,5.15cqw)] font-semibold tracking-[-0.023em] text-white lg:aspect-auto lg:tracking-normal lg:mt-[clamp(28px,4.4vw,84px)] lg:h-[clamp(54px,3.7vw,71px)] lg:w-[clamp(240px,16.9vw,325px)] lg:text-[clamp(16px,1.146vw,22px)]"
                >
                  Start <span aria-hidden="true">→</span>
                </button>
              </div>
            )}

            {Array.isArray(finish) &&
              finish.map((st, i) => (
                <span
                  key={i}
                  className="mm-star-fall pointer-events-none"
                  style={{ left: st.left, width: st.s, height: st.s, marginLeft: -st.s / 2, "--fall": st.fall, "--rot": st.rot, "--delay": st.delay, "--dur": st.dur }}
                  aria-hidden="true"
                >
                  <StarIcon className="block h-full w-full" fill={PINK} />
                </span>
              ))}
          </div>
        </div>
      )}
    </GameModal>
  );
}

