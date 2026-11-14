// The Art of Moving: her figure's poses cut from her own three clips ahead of time (Marta, 14 Nov, her iPhone:
// "the figure isn't there, for a few seconds it freezes, then the figure appears ... why does it blink").
// Until now every visit downloaded the three clips (3.4 MB, past the cache) and played them through in the
// browser to cut each frame; on a phone that took several seconds, the run waited at the countdown without her,
// and a phone can hand a canvas an empty or black frame from a video it plays off screen, which flashed.
// The same cut is made here once, the same way (same frames, thresholds, sole, middle, feet and the round top of
// her head put back), and saved as a few small pictures of her poses (black with her darkness as transparency)
// plus their measures. The game loads only those. Nothing is drawn or invented: every pose is one of her frames.
// Run: node scripts/make-aom-poses.mjs (uses the local ffmpeg-static devDependency and sharp).
import { spawnSync } from "node:child_process";
import { writeFileSync, statSync } from "node:fs";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

// Her clips: [file, her standing height as a share of the clip's height] (measured 12 Nov, see ArtOfMoving.jsx)
const CLIPS = {
  walk: ["public/assets/human-walking.mp4", 0.87],
  jump: ["public/assets/games/jump.mp4", 0.885],
  stumble: ["public/assets/games/stumble.mp4", 0.965],
};
const f24 = (n, m, step = 1) => { const out = []; for (let i = n; i <= m; i += step) out.push(i / 24 + 0.004); return out; };
const WALK_FPS = 30;
// The poses, by time in her clips (s), as chosen on her frames on 12 Nov:
const POSES = {
  stand: ["jump", f24(21, 21)], // standing for the countdown: upright, feet together (0.875 s)
  start: ["jump", f24(22, 30)], // her first steps out of that stand after GO (0.917 to 1.25 s)
  walk: ["walk", Array.from({ length: 54 }, (_, i) => 3.1 + i / WALK_FPS)], // a stride and a half, loops
  air: ["jump", f24(48, 76, 2)], // push-off, tuck, the leg reaching down for the brick
  land: ["jump", f24(78, 82)], // feet down, knees giving (3.25 to 3.42 s)
  fall: ["stumble", f24(36, 52, 2)], // pitching forward when she misses
};
const CUT_H = 600; // her standing height in a cut frame's pixels
const LIFT_LO = 55, LIFT_HI = 200, FEET_HI = 130, HEAD_K = 0.093;
const SHEET = 2048; // each sheet at most 2048 x 2048 (small enough for any phone)
const GAP = 2; // clear pixels between poses, so no neighbour bleeds in when drawn smoothed

function probe(file) {
  const r = spawnSync(ffmpeg, ["-i", file], { encoding: "utf8" });
  const s = r.stderr.match(/Stream.*Video.*?, (\d{2,5})x(\d{2,5})/);
  const f = r.stderr.match(/, ([\d.]+) fps/);
  const d = r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return { w: +s[1], h: +s[2], fps: +f[1], dur: +d[1] * 3600 + +d[2] * 60 + +d[3] };
}

// the frames n of a clip, scaled to W x H, as RGBA
function frames(file, ns, W, H) {
  const sel = ns.map((n) => `eq(n\\,${n})`).join("+");
  const r = spawnSync(ffmpeg, ["-v", "error", "-i", file, "-vf", `select='${sel}',scale=${W}:${H}:flags=bilinear`, "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  const size = W * H * 4;
  if (r.stdout.length !== size * ns.length) throw new Error(`${file}: ${r.stdout.length / size} frames, wanted ${ns.length}`);
  return ns.map((_, i) => r.stdout.subarray(i * size, (i + 1) * size));
}

// cutFrame of ArtOfMoving.jsx (12 Nov), on raw pixels: her darkness as opacity, cropped to her, with her sole,
// her middle (chest), her feet, and the round top of her head where the leap clip cuts it off.
function cut(d, W, H) {
  const ex = Math.round(W * 0.02), ey = Math.round(H * 0.01);
  const A = new Float64Array(W * H);
  const rows = new Uint16Array(H);
  for (let y = 0; y < H - ey; y++) {
    for (let xx = ex; xx < W - ex; xx++) {
      const i = (y * W + xx) * 4;
      const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (L >= LIFT_HI) continue;
      const a = L <= LIFT_LO ? 255 : ((LIFT_HI - L) * 255) / (LIFT_HI - LIFT_LO);
      A[y * W + xx] = Math.round(a);
      if (a >= 128) rows[y]++;
    }
  }
  let top = -1, sole = -1;
  for (let y = 0; y < H; y++) if (rows[y] >= 3) { if (top < 0) top = y; sole = y; }
  if (sole < 0) return null;
  const fy = Math.round(sole - (sole - top) * 0.08);
  for (let y = fy; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      const j = y * W + xx;
      if (y > sole) { A[j] = 0; continue; }
      const L = LIFT_HI - (A[j] * (LIFT_HI - LIFT_LO)) / 255;
      A[j] = Math.round(L >= FEET_HI ? 0 : L <= LIFT_LO ? 255 : ((FEET_HI - L) * 255) / (FEET_HI - LIFT_LO));
    }
  }
  for (let y = sole, done = false; y >= fy && !done; y--) {
    let n = 0;
    for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) n++;
    if (n >= 3) { sole = y; done = true; }
  }
  let bx0 = W, bx1 = -1, by0 = H, by1 = -1;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (A[y * W + xx] > 8) { if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx; if (y < by0) by0 = y; if (y > by1) by1 = y; }
  if (bx1 < 0) return null;
  let sx = 0, sn = 0;
  const ya = Math.round(top + (sole - top) * 0.2), yb = Math.round(top + (sole - top) * 0.4);
  for (let y = ya; y <= yb; y++) for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) { sx += xx; sn++; }
  let fl = W, fr = -1;
  for (let y = Math.round(sole - (sole - top) * 0.06); y <= sole; y++) for (let xx = ex; xx < W - ex; xx++) if (A[y * W + xx] >= 128) { if (xx < fl) fl = xx; if (xx > fr) fr = xx; }
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
  bx0 = Math.max(0, bx0 - 2); by0 = Math.max(0, by0 - 2);
  const cw = Math.min(W, bx1 + 3) - bx0, ch = Math.min(H, by1 + 3) - by0;
  const pad = cap ? cap.h : 0;
  const ah = ch + pad;
  const out = new Uint8Array(cw * ah);
  for (let y = 0; y < ch; y++) for (let xx = 0; xx < cw; xx++) out[(y + pad) * cw + xx] = A[(y + by0) * W + xx + bx0];
  if (cap) {
    // the half ellipse above the cut, black over what is there, its edge smoothed (4 x 4 samples a pixel)
    const ecx = cap.cx - bx0, ecy = pad + cap.cy - by0, lim = pad + top - by0;
    for (let y = 0; y < Math.min(ah, Math.ceil(lim)); y++) {
      for (let xx = 0; xx < cw; xx++) {
        let n = 0;
        for (let sy = 0; sy < 4; sy++) for (let sx2 = 0; sx2 < 4; sx2++) {
          const px = xx + (sx2 + 0.5) / 4, py = y + (sy + 0.5) / 4;
          if (py < lim && ((px - ecx) / cap.rx) ** 2 + ((py - ecy) / cap.ry) ** 2 <= 1) n++;
        }
        if (!n) continue;
        const as = n / 16, j = y * cw + xx;
        out[j] = Math.round(255 * (as + (out[j] / 255) * (1 - as)));
      }
    }
  }
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    a: out, w: cw, h: ah,
    sole: sole + 1 - by0 + pad, cx: r2((sn ? sx / sn : (bx0 + bx1) / 2) - bx0), left: bx0, fl: fl - bx0, fr: fr - bx0,
    ht: r2(sole - top + (cap ? cap.ry - (cap.cy - top) : 0)),
  };
}

// every pose of every clip
const poses = {};
for (const [clip, [file, body]] of Object.entries(CLIPS)) {
  const p = probe(file);
  const k = CUT_H / (body * p.h);
  const W = Math.round(p.w * k), H = Math.round(p.h * k);
  const want = Object.entries(POSES).filter(([, [c]]) => c === clip);
  // a time shows the frame it falls in (as a seek in the browser does)
  const idx = (t) => Math.floor(Math.min(t, p.dur - 0.05) * p.fps + 1e-6);
  const ns = [...new Set(want.flatMap(([, [, ts]]) => ts.map(idx)))].sort((a, b) => a - b);
  const got = frames(file, ns, W, H);
  const byN = new Map(ns.map((n, i) => [n, cut(got[i], W, H)]));
  console.log(`${clip}: ${p.w}x${p.h} ${p.fps} fps ${p.dur}s, cut at ${W}x${H}, frames ${ns[0]}..${ns[ns.length - 1]} (${ns.length})`);
  for (const [name, [, ts]] of want) {
    poses[name] = ts.map(idx).map((n) => byN.get(n)).filter(Boolean);
    if (poses[name].length !== ts.length) console.log(`  ${name}: ${ts.length - poses[name].length} frames without her, left out`);
  }
}

// packed on shelves into sheets of at most SHEET x SHEET
const all = Object.values(poses).flat();
const sheets = [];
let sh = null;
for (const f of [...all].sort((a, b) => b.h - a.h)) {
  if (!sh || (sh.x + f.w > SHEET && sh.y + sh.row + GAP + f.h > SHEET)) { sh = { x: 0, y: 0, row: 0, list: [] }; sheets.push(sh); }
  if (sh.x + f.w > SHEET) { sh.x = 0; sh.y += sh.row + GAP; sh.row = 0; }
  f.s = sheets.length - 1; f.x = sh.x; f.y = sh.y;
  sh.list.push(f);
  sh.x += f.w + GAP; sh.row = Math.max(sh.row, f.h);
}
const meta = { cutH: CUT_H, sheets: [], poses: {} };
let total = 0;
for (const [i, s] of sheets.entries()) {
  const w = Math.max(...s.list.map((f) => f.x + f.w)), h = Math.max(...s.list.map((f) => f.y + f.h));
  const px = Buffer.alloc(w * h * 4); // black, clear
  for (const f of s.list) for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) px[((f.y + y) * w + f.x + x) * 4 + 3] = f.a[y * f.w + x];
  const name = `public/assets/games/aom-poses-${i + 1}.webp`;
  await sharp(px, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 80, alphaQuality: 100, effort: 6 }).toFile(name);
  const kb = Math.round(statSync(name).size / 1024);
  total += kb;
  console.log(`${name}: ${w}x${h}, ${s.list.length} poses, ${kb} KB`);
  meta.sheets.push({ src: name.replace("public", ""), w, h });
}
for (const [name, list] of Object.entries(poses)) meta.poses[name] = list.map(({ s, x, y, w, h, sole, cx, left, fl, fr, ht }) => [s, x, y, w, h, sole, cx, left, fl, fr, ht]);
writeFileSync("src/components/react/games/aomPoses.json", JSON.stringify(meta) + "\n");
console.log(`${all.length} poses, ${total} KB in ${sheets.length} sheets; measures in src/components/react/games/aomPoses.json`);
