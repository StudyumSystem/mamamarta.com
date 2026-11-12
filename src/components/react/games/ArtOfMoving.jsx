import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen, StarIcon } from "./GameModal.jsx";
import { takeQuote, prefersReducedMotion, recordStars, ROUND_STARS } from "./shared.js";
import { play as playSound } from "./sound.js";
import { H0, FH, BODY_U, PLAT_H, COIN_R, FOOT_FRONT, GRACE, V0, Y_START, SPEED0, clamp, newWorld, pressJump, runStep } from "./aomWorld.js";
const sound = (name) => playSound(name, "art-of-moving");

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

const INSTRUCTIONS = "Keep moving. Jump between platforms and collect pink coins. One fall ends the run.";
const PINK = "#F600A9";
const BEST_KEY = "mm-art-of-moving-best";
// 11 Nov (her MM-G04-04 Desktop_Score: 23 coins, 150 MM✦STARS): 10 MM✦ a coin, at most 150 a run (question for Marta).
const COIN_STARS = 10;
const runStars = (n) => Math.min(ROUND_STARS, n * COIN_STARS);
const STAR_RAIN = 28; // pink stars falling over the panel when a run ends (12 Nov)

const MIN_VIEW_W = 560; // on tall phone frames the world is scaled to show at least this much ahead
const SINK = 1; // a sole sits this far into the brick, so no hair of white shows under it on any screen
const PLAT_R = 12;
// Her four-point star (Star 2, the same as in GameModal), drawn in a 24 x 24 box, 70% of the badge across.
const STAR = typeof Path2D !== "undefined" ? new Path2D("M12 0c.9 6.4 5.1 10.9 12 12-6.9 1.1-11.1 5.6-12 12-.9-6.4-5.1-10.9-12-12C6.9 10.9 11.1 6.4 12 0z") : null;
const STAR_K = (COIN_R * 2 * 0.7) / 24;

// Her clips: [file, her standing height as a share of the clip's height, speed it is read at] (measured frame by
// frame, 12 Nov: standing upright she is 90.6% of the leap clip (0.875 s) and, at her tallest step, 88.8% of the
// walk clip (3.7 s): 454 and 453 units here, the same size. The stumble clip is closer: her head is 10.2% of its
// height against 9.3% in the others, so her height there is 0.965 of it, not 0.935.)
const CLIPS = {
  walk: ["/assets/human-walking.mp4", 0.87, 1], // 854 x 1280, 6.6 s, 30 frames a second
  jump: ["/assets/games/jump.mp4", 0.885, 1.5], // 1440 x 1920, 5.17 s, 24 a second: walks, leaps at 2.1 s, lands at 3.25 s
  stumble: ["/assets/games/stumble.mp4", 0.965, 1.5], // 1440 x 1920, 5.17 s: stumbles forward from 1.6 s
};
// Frames n..m (every `step`) of a clip at 24 frames a second, by time (a hair after each frame's own time).
const f24 = (n, m, step = 1) => { const out = []; for (let i = n; i <= m; i += step) out.push(i / 24 + 0.004); return out; };
const WALK_FPS = 30;
// The poses, by time in her clips (s), chosen on her frames:
const POSES = {
  // standing for the first screen and the countdown: upright, feet together (0.875 s)
  stand: ["jump", f24(21, 21)],
  // her first steps out of that stand after GO (0.917 to 1.25 s)
  start: ["jump", f24(22, 30)],
  // a whole stride and a half (two steps, 1.8 s), every frame; 4.9 s meets 3.1 s again, so it loops
  walk: ["walk", Array.from({ length: 54 }, (_, i) => 3.1 + i / WALK_FPS)],
  // push-off (2.0 s), knees tucked, coat flying, the leg reaching down for the brick: taken by where she is on the arc
  air: ["jump", f24(48, 76, 2)],
  // feet down, knees giving: the landing (3.25 to 3.42 s)
  land: ["jump", f24(78, 82)],
  // pitching forward and down when she misses (1.5 to 2.17 s)
  fall: ["stumble", f24(36, 52, 2)],
};
const START_FPS = 24;
const SETTLE = 0.22; // landing (s)
const XFADE = 0.08; // cross-fade between two kinds of move (s)
const CUT_H = 600; // her standing height in a cut frame's pixels (sharp up to about 1.3 times her size on screen)
const LIFT_LO = 55; // darker than this: fully her
const LIFT_HI = 200; // lighter than this: background or floor shadow, cut away
const FEET_HI = 130; // near her soles (the lowest 8% of her) only real darkness counts: no floor shadow under her shoes
const HEAD_K = 0.093; // her head's length in profile as a share of the leap clip's height (9.2 to 9.4%, measured)

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; }
}
function writeBest(n) {
  try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* private mode: best lasts this visit only */ }
}

// One frame of her clip (a video at its time, or a picture) as a cut-out: black with her darkness as opacity,
// cropped to her, with where her sole is (the lowest row with her in it), her middle (her chest) and her feet.
function cutFrame(src, sw, sh, body) {
  const k = CUT_H / (body * sh);
  const W = Math.round(sw * k), H = Math.round(sh * k);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(src, 0, 0, W, H);
  const img = x.getImageData(0, 0, W, H);
  const d = img.data;
  // the leap clips have thin lines at their sides and the bottom row can carry the floor's edge: left out
  const ex = Math.round(W * 0.02), ey = Math.round(H * 0.01);
  const A = new Uint8ClampedArray(W * H);
  const rows = new Uint16Array(H);
  for (let y = 0; y < H - ey; y++) {
    for (let xx = ex; xx < W - ex; xx++) {
      const i = (y * W + xx) * 4;
      const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (L >= LIFT_HI) continue;
      const a = L <= LIFT_LO ? 255 : ((LIFT_HI - L) * 255) / (LIFT_HI - LIFT_LO);
      A[y * W + xx] = a;
      if (a >= 128) rows[y]++;
    }
  }
  let top = -1, sole = -1;
  for (let y = 0; y < H; y++) if (rows[y] >= 3) { if (top < 0) top = y; sole = y; }
  if (sole < 0) return null;
  // under her soles nothing is kept (the floor and her shadow on it); over the lowest 8% of her only real darkness
  const fy = Math.round(sole - (sole - top) * 0.08);
  for (let y = fy; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      const j = y * W + xx;
      if (y > sole) { A[j] = 0; continue; }
      const L = LIFT_HI - (A[j] * (LIFT_HI - LIFT_LO)) / 255;
      A[j] = L >= FEET_HI ? 0 : L <= LIFT_LO ? 255 : ((FEET_HI - L) * 255) / (FEET_HI - LIFT_LO);
    }
  }
  // her sole again, on what is left: the lowest row with her shoe in it (a dark contact shadow is no longer her)
  for (let y = sole, done = false; y >= fy && !done; y--) {
    let n = 0;
    for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) n++;
    if (n >= 3) { sole = y; done = true; }
  }
  let bx0 = W, bx1 = -1, by0 = H, by1 = -1;
  for (let y = 0; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      const j = y * W + xx, a = A[j], i = j * 4;
      d[i] = d[i + 1] = d[i + 2] = 0;
      d[i + 3] = a;
      if (a > 8) { if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx; if (y < by0) by0 = y; if (y > by1) by1 = y; }
    }
  }
  if (bx1 < 0) return null;
  // her middle: the dark between 20% and 40% of her height (chest and shoulders, not the swinging coat or legs)
  let sx = 0, sn = 0;
  const ya = Math.round(top + (sole - top) * 0.2), yb = Math.round(top + (sole - top) * 0.4);
  for (let y = ya; y <= yb; y++) for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) { sx += xx; sn++; }
  // her feet (the lowest 6% of her): front (left in her clip) and back
  let fl = W, fr = -1;
  for (let y = Math.round(sole - (sole - top) * 0.06); y <= sole; y++) for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) { if (xx < fl) fl = xx; if (xx > fr) fr = xx; }
  // her head out of the clip's top (the leap, 2.46 to 3.33 s): the round top of her head put back, half an ellipse
  // her head's length across and half of it high, meeting the cut where it is as wide as her head there
  let cap = null;
  if (top <= 1) {
    let xa = -1, xb = -1;
    for (let xx = ex; xx < W - ex; xx++) if (A[top * W + xx] >= 128) { if (xa < 0) xa = xx; xb = xx; }
    const hw = HEAD_K * H, w0 = xb - xa + 1;
    if (xa >= 0 && w0 < 1.3 * hw) {
      const rx = Math.max(w0, hw) / 2, ry = 0.47 * hw;
      const y0 = ry * Math.sqrt(Math.max(0, 1 - (w0 / (2 * rx)) ** 2));
      cap = { cx: (xa + xb) / 2, cy: top + y0, rx, ry, h: Math.ceil(ry - y0) + 1 };
      bx0 = Math.min(bx0, Math.floor(cap.cx - rx));
      bx1 = Math.max(bx1, Math.ceil(cap.cx + rx));
    }
  }
  x.putImageData(img, 0, 0);
  bx0 = Math.max(0, bx0 - 2); by0 = Math.max(0, by0 - 2);
  const cw = Math.min(W, bx1 + 3) - bx0, ch = Math.min(H, by1 + 3) - by0;
  const pad = cap ? cap.h : 0;
  const out = document.createElement("canvas");
  out.width = cw; out.height = ch + pad;
  const o = out.getContext("2d");
  o.drawImage(c, bx0, by0, cw, ch, 0, pad, cw, ch);
  if (cap) {
    o.save();
    o.beginPath();
    o.rect(0, 0, cw, pad + top - by0);
    o.clip();
    o.fillStyle = "#000";
    o.beginPath();
    o.ellipse(cap.cx - bx0, pad + cap.cy - by0, cap.rx, cap.ry, 0, 0, Math.PI * 2);
    o.fill();
    o.restore();
  }
  c.width = c.height = 0;
  // left: where the crop starts in the clip's frame, so middles of one clip's frames can be compared
  return { img: out, sole: sole + 1 - by0 + pad, cx: (sn ? sx / sn : (bx0 + bx1) / 2) - bx0, left: bx0, fl: fl - bx0, fr: fr - bx0, ht: sole - top + (cap ? cap.ry - (cap.cy - top) : 0), u: BODY_U / CUT_H };
}

// A clip read whole first and seeked in memory (works whatever the server; a streamed video may not seek).
async function openClip(src) {
  // past the browser's cache: while a <video> on the page streams the same file, the cache holds a second reader
  // back (the walk clip is also the site's own video), and the poses would wait for it
  const r = await fetch(src, { cache: "no-store" });
  if (!r.ok) throw new Error(src);
  const url = URL.createObjectURL(await r.blob());
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  const loaded = new Promise((res, rej) => {
    if (v.readyState >= 2) { res(); return; }
    const timer = setTimeout(() => rej(new Error(src)), 10000);
    v.addEventListener("loadeddata", () => { clearTimeout(timer); res(); }, { once: true });
    v.addEventListener("error", () => { clearTimeout(timer); rej(new Error(src)); }, { once: true });
  });
  await v.play().catch(() => {}); // phones load a video's frames only once it is played
  v.pause();
  try { await loaded; } catch (e) { v.removeAttribute("src"); v.load(); URL.revokeObjectURL(url); throw e; }
  return { v, url };
}
function seekTo(v, t) {
  const tt = Math.min(t, v.duration - 0.03);
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error("seek")), 5000);
    v.addEventListener("seeked", () => { clearTimeout(timer); Math.abs(v.currentTime - tt) < 0.05 ? res() : rej(new Error("seek")); }, { once: true });
    v.currentTime = tt;
  });
}
// The poses of one clip: [[name, times]] → { name: [frames] }. Her clip is played through once (at `rate`) and
// each pose taken from the first frame shown at or after its time: one pass of decoding. Seeking frame by frame
// decodes again from the clip's last key frame every time, which took the computer over 40 s. Where the clip
// can't play by itself (no frame callbacks, or a phone that holds videos back), it is seeked frame by frame.
async function cutClip(v, list, body, rate) {
  const targets = list
    .flatMap(([name, times]) => times.map((t) => ({ name, t: Math.min(t, v.duration - 0.05) })))
    .sort((a, b) => a.t - b.t);
  const take = (got, tg, f) => { if (f) (got[tg.name] ||= []).push(f); };
  if (v.requestVideoFrameCallback) {
    const got = {};
    try {
      await seekTo(v, Math.max(0, targets[0].t - 0.04));
      let i = 0;
      await new Promise((res, rej) => {
        const dog = setTimeout(() => rej(new Error("play")), 15000);
        const end = () => { clearTimeout(dog); v.pause(); res(); };
        const onFrame = (_, meta) => {
          if (i < targets.length && meta.mediaTime >= targets[i].t - 0.02) {
            const f = cutFrame(v, v.videoWidth, v.videoHeight, body);
            while (i < targets.length && meta.mediaTime >= targets[i].t - 0.02) take(got, targets[i++], f);
          }
          if (i < targets.length) v.requestVideoFrameCallback(onFrame);
          else v.playbackRate = 16; // the rest of the clip runs out quickly, so its reading ends as a whole
        };
        v.requestVideoFrameCallback(onFrame);
        v.addEventListener("ended", end, { once: true });
        v.playbackRate = rate;
        v.play().catch(rej);
      });
      globalThis.__aomLg?.(`played: ${Object.keys(got).join(",")} i=${i}`);
      if (Object.keys(got).length === list.length) return got;
    } catch (e) { globalThis.__aomLg?.(`play failed ${e}`); /* seeked below */ }
    v.pause();
  }
  const got = {};
  for (const tg of targets) {
    await seekTo(v, tg.t);
    take(got, tg, cutFrame(v, v.videoWidth, v.videoHeight, body));
  }
  return got;
}

const loadImage = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

// All her poses, cut once in the browser and kept for the whole visit; until then (or if her clips can't be read)
// the run waits at the countdown, and as a last resort her walk's poster picture stands in for every pose.
let poses = null;
let posesLoading = null;
function loadPoses() {
  if (poses) return Promise.resolve(poses);
  if (posesLoading || typeof document === "undefined") return posesLoading;
  if (location.search.includes("nocut")) return null;
  const DBG = location.search.includes("dbg");
  const t0 = performance.now();
  const lg = (m) => { (globalThis.__aomLog ||= []).push(`${Math.round(performance.now() - t0)} ${m}`); };
  globalThis.__aomLg = lg;
  if (DBG) { let on = true; const pg = () => on && performance.now() - t0 < 30000 && fetch(`/robots.txt?dbg=${Math.random()}`, { cache: "no-store" }).finally(() => setTimeout(pg, 200)); pg(); globalThis.__aomStop = () => { on = false; }; }
  posesLoading = (async () => {
    const out = {};
    try {
      const byClip = {};
      for (const [name, [clip, times]] of Object.entries(POSES)) (byClip[clip] ||= []).push([name, times]);
      // the leap clip first: her standing frame is in it, for the first screen
      for (const clip of ["jump", "walk", "stumble"]) {
        const [src, body, rate] = CLIPS[clip];
        lg(`${clip} open`);
        const { v, url } = await openClip(src);
        lg(`${clip} opened, cutting`);
        try {
          Object.assign(out, await cutClip(v, byClip[clip], body, rate));
        } finally {
          v.removeAttribute("src"); v.load(); URL.revokeObjectURL(url);
        }
      }
    } catch { /* what was cut is kept; the rest from the poster below */ }
    if (Object.keys(POSES).some((name) => !out[name])) {
      const img = await loadImage("/assets/human-walking-poster.webp").catch(() => null);
      const f = img && cutFrame(img, img.naturalWidth, img.naturalHeight, CLIPS.walk[1]);
      if (!f && !out.walk) return null;
      for (const name of Object.keys(POSES)) if (!out[name]) out[name] = [f || out.walk[0]];
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
    const walk = even(out.walk, true);
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
    poses = { stand: out.stand[0], start, startTo: next(start[start.length - 1]), walk, air: even(out.air, false), land: out.land, landTo: next(out.land[out.land.length - 1]), fall: out.fall };
    const U = (f) => Math.round(f.ht * f.u);
    const span = (l) => { const h = l.map(U); return `${Math.min(...h)}-${Math.max(...h)}`; };
    lg(`done: ${Object.entries(out).map(([k, l]) => `${k} ${l.length}`).join(", ")}; start→walk ${poses.startTo}, land→walk ${poses.landTo}`);
    lg(`her height (units): stand ${U(poses.stand)}, start ${span(start)}, walk ${span(walk)}, air ${span(poses.air)}, land ${span(poses.land)}, fall ${span(poses.fall)}`);
    lg(`soles (px from the crop's top / crop height): stand ${poses.stand.sole}/${poses.stand.img.height}; walk ${walk.map((f) => f.img.height - f.sole).join(" ")}`);
    globalThis.__aomStop?.();
    return poses;
  })()
    .catch((e) => { lg(`error ${e}`); globalThis.__aomStop?.(); return null; })
    .then((p) => { if (!p) posesLoading = null; return p; }); // try again on the next open
  return posesLoading;
}

// The canvas fitted to the frame: v = { s: units → px, offY, viewW: units across, dpr }.
function fitCanvas(canvas, frame, v) {
  const w = frame.clientWidth, h = frame.clientHeight;
  if (!w || !h) return false;
  v.dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * v.dpr);
  canvas.height = Math.round(h * v.dpr);
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
  c.drawImage(f.img, -f.cx, -f.sole);
  c.restore();
}

// The world as it is: her bricks, her coins, her. fig = { f, from, k, off }: her frame, and while one kind of move
// turns into another the frame before it, k of the way (their darkness added up on a small canvas of their own,
// so the cross-fade never shows her paler than she is).
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
  if (!fig || g.fade <= 0) return;
  const X = g.p.x - camX, Y = g.p.y;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";
  if (!fig.from || fig.k >= 1) { putFrame(ctx, fig.f, X, Y, g.fade); ctx.globalAlpha = 1; return; }
  // the box around her (600 x 600 units, her feet 40 from its bottom) on its own canvas
  const BOX = 600, K = v.dpr * v.s, n = Math.ceil(BOX * K);
  const off = fig.off;
  if (off.width !== n) { off.width = n; off.height = n; }
  const o = off.getContext("2d");
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.globalCompositeOperation = "source-over";
  o.globalAlpha = 1;
  o.clearRect(0, 0, n, n);
  o.setTransform(K, 0, 0, K, -(X - BOX / 2) * K, -(Y + 40 - BOX) * K);
  o.imageSmoothingEnabled = true;
  o.imageSmoothingQuality = "medium";
  o.globalCompositeOperation = "lighter";
  putFrame(o, fig.from, X, Y, 1 - fig.k);
  putFrame(o, fig.f, X, Y, fig.k);
  o.globalCompositeOperation = "source-over";
  ctx.globalAlpha = g.fade;
  ctx.drawImage(off, X - BOX / 2, Y + 40 - BOX, BOX, BOX);
  ctx.globalAlpha = 1;
}

function DebugLog() {
  const [, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((n) => n + 1), 200); return () => clearInterval(t); }, []);
  return <pre className="absolute left-1 top-1 z-10 whitespace-pre-wrap text-[10px] leading-tight text-black">{(globalThis.__aomLog || []).slice(-40).join("\n")}</pre>;
}

const coinLabel = (n) => `${n} ${n > 1 ? "coins" : "coin"}`; // Figma: "0 coin", "3 coins"

export default function ArtOfMoving({ open, onClose }) {
  const [phase, setPhase] = useState("default"); // default | countdown | play | result | done
  const [runId, setRunId] = useState(0);
  const [count, setCount] = useState(null);
  const [coins, setCoins] = useState(0);
  const [result, setResult] = useState(null);
  const [quote, setQuote] = useState(null);
  const [finish, setFinish] = useState(null); // null | "fade" | the falling stars
  const [touch, setTouch] = useState(false);
  const [layout, setLayout] = useState({ s: 1, offY: 0 });
  const [ready, setReady] = useState(!!poses);
  const [dbg, setDbg] = useState(false);
  useEffect(() => setDbg(location.search.includes("dbg")), []);
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
    setResult(null);
    setQuote(null);
    setFinish(null);
  }, []);

  // Closing or reopening always comes back to the Default screen; the best score stays.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);
  useEffect(() => { setTouch(window.matchMedia?.("(pointer: coarse)").matches ?? false); }, []);
  // her clips are cut into poses while the Default screen is up
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
    setResult(null);
    setFinish(null);
    setPhase("countdown");
    setRunId((n) => n + 1);
  }, []);

  const endRun = useCallback((n) => {
    const best = readBest();
    const isBest = n > best;
    if (isBest) writeBest(n);
    setResult({ coins: n, isBest });
    recordStars("art-of-moving", runStars(n));
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
  useEffect(() => {
    if (!open || !runId) return;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d");
    const g = newWorld();
    const v = { s: 1, offY: 0, viewW: 660, dpr: 1 };
    const off = document.createElement("canvas");
    const resize = () => { if (fitCanvas(canvas, frame, v)) setLayout({ s: v.s, offY: v.offY }); };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    jumpRef.current = () => pressJump(g);

    // her moves: mode = start (her first steps after GO) | walk | land; ph = where she is in her first steps,
    // walkPh = in her walk (frames); kind/last/from/at = the cross-fade between two kinds of move
    const m = { mode: "start", ph: 0, walkPh: 0, kind: null, last: null, from: null, at: -9, low: null };

    const step = (h) => {
      const { ev, got } = runStep(g, h, v.viewW);
      if (got) { setCoins(g.coinsTaken); sound("coin"); }
      if (ev === "over") endRun(g.coinsTaken);
      if (ev === "land") m.mode = "land";
      // her steps keep pace with the ground: at the starting speed her clips' own pace, faster as she speeds up
      const P = poses;
      if (P && g.mode === "play" && g.p.ground) {
        const rate = g.speed / SPEED0;
        if (m.mode === "start") {
          m.ph += h * START_FPS * Math.max(0.6, rate);
          if (m.ph >= P.start.length) { m.mode = "walk"; m.walkPh = P.startTo; }
        } else if (m.mode === "land") {
          if (g.clock - g.p.landAt >= SETTLE) { m.mode = "walk"; m.walkPh = P.landTo; }
        } else m.walkPh += h * WALK_FPS * rate;
      }
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
    const pose = () => {
      const P = poses;
      if (!P) return null;
      const p = g.p;
      const pick = (list, k) => list[clamp(Math.floor(k * list.length), 0, list.length - 1)];
      if (g.mode === "countdown") return [P.stand, "stand"];
      if (g.mode !== "play" || (!p.ground && p.vy > 0 && p.y > lowTop() + GRACE)) {
        if (m.low == null) m.low = lowTop();
        return [pick(P.fall, (p.y - m.low - GRACE) / 160), "fall"];
      }
      if (!p.ground) return [pick(P.air, p.jumped ? (p.vy + V0) / (2 * V0) : 0.6 + 0.4 * clamp(p.vy / V0, 0, 1)), "air"];
      if (m.mode === "start") return [P.start[Math.min(P.start.length - 1, Math.floor(m.ph))], "start"];
      if (m.mode === "land") return [pick(P.land, (g.clock - p.landAt) / SETTLE), "land"];
      return [P.walk[Math.floor(m.walkPh) % P.walk.length], "walk"];
    };
    const figure = () => {
      const ps = pose();
      if (!ps) return null;
      const [f, kind] = ps;
      if (kind !== m.kind) { if (m.last && m.kind) { m.from = m.last; m.at = g.clock; } m.kind = kind; }
      m.last = f;
      const k = m.from ? (g.clock - m.at) / XFADE : 1;
      if (k >= 1) m.from = null;
      return { f, from: m.from, k, off };
    };

    // Countdown 3, 2, 1, GO (~1 s each); no input until GO. If her poses are still being cut, GO waits for them
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
      drawWorld(ctx, canvas, g, v, figure());
      if (g.mode !== "over") raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearTimers();
      jumpRef.current = () => {};
    };
  }, [open, runId, endRun]);

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
      stars={ended ? null : runStars(coins)}
      hud={!ended}
      confirm={ended ? "completed" : running ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" && result ? (
        <ScoreScreen badge={result.isBest ? "New personal best" : null} label="Coins" value={String(result.coins)} stars={runStars(result.coins)} onDone={toQuote} />
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
            className={`${finish === "fade" ? "mm-fade-out" : ""} relative isolate w-full aspect-[311/584] overflow-hidden rounded-[30px] border border-black bg-white lg:pointer-events-auto lg:w-auto lg:max-w-none lg:rounded-[calc(38*var(--mm-u))] lg:h-[calc(726*var(--mm-u))] lg:aspect-[635/726]`}
          >
            {dbg && <DebugLog />}
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
              <div className="mm-fade-in absolute inset-0 flex flex-col items-center justify-center px-6 pt-[18%] text-center">
                <p className="text-[17px] leading-[1.45] lg:leading-[1.5] lg:text-[clamp(15px,1.07vw,21px)] font-normal text-black/70">
                  {/* her MM-G04-01 (11 Nov): "Press Space to jump. Ready?" */}
                  {touch ? "Tap anywhere to jump. Ready?" : "Press Space to jump. Ready?"}
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="mm-gradient mt-10 inline-flex h-[60px] w-full max-w-[312px] items-center justify-center gap-2 text-[18px] font-semibold text-white lg:mt-[clamp(28px,4.4vw,84px)] lg:h-[clamp(54px,3.7vw,71px)] lg:w-[clamp(240px,16.9vw,325px)] lg:text-[clamp(16px,1.146vw,22px)]"
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

