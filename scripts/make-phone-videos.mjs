// Phone copies of the videos whose own background is off-white / light grey (Marta, 12 Nov, her iPhone: "the
// background is grey"). On the computer those videos are whitened in the browser (mix-blend-mode: multiply and a
// filter), which iPhone Safari doesn't apply to a <video>. These copies have pure white baked into the pixels:
// every colour channel is stretched so the clip's own background level becomes 255 (dark parts stay dark), and
// the light end of the luma is lifted a little above video white so the encoder's rounding can't bring it back
// under 255 after decoding. H.264 yuv420p, at most 720 wide, no sound, +faststart. A pure white poster (WebP)
// from the first frame, made the same way. Run: node scripts/make-phone-videos.mjs [measure|build|check]
// (uses the local ffmpeg-static devDependency; the site itself never loads it).
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const A = "public/assets/";
// Each copy is whitened the way the computer whitens it in the browser, so it looks the same, now in the pixels
// (a lutrgb expression per channel): LIFT = CSS brightness(b) contrast(c), v -> c*(b*v - 0.5) + 0.5 (her slider
// videos 1.04 / 1.08, the leap and the stumble 1.18 / 1.25); TTT = the Tic-Tac-Toe symbols' filter (x 1.12, then
// gamma 1.6); WHITE = a clip shown with no filter (its background is 249-253): only that level stretched to 255.
const LIFT = (b, c) => `clip(255*(${c}*(${b}*val/255-0.5)+0.5),0,255)`;
const TTT = "clip(255*pow(min(1,val*1.12/255),1.6),0,255)";
const WHITE = "clip(val*255/249,0,255)";
const CLIPS = [
  { src: "m.mp4", w: 720, fx: LIFT(1.04, 1.08) },
  { src: "apple.mp4", w: 720, fx: LIFT(1.04, 1.08) },
  { src: "google.mp4", w: 720, fx: LIFT(1.04, 1.08) },
  { src: "games/plus-key.mp4", w: 640, fx: LIFT(1.04, 1.08) },
  { src: "human-walking.mp4", w: 540, fx: WHITE },
  { src: "games/jump.mp4", w: 540, fx: LIFT(1.18, 1.25) },
  { src: "games/stumble.mp4", w: 540, fx: LIFT(1.18, 1.25) },
  { src: "games/ttt-x.mp4", w: 540, fx: TTT },
  { src: "apple.mp4", as: "games/ttt-apple.mp4", w: 540, fx: TTT },
  { src: "moving-objects-loop.mp4", w: 720, fx: WHITE },
];

const out = (c, ext) => A + (c.as || c.src).replace(/\.mp4$/, ext);

// one frame as raw RGB
function frame(file, t = 0.5, w = 240) {
  const r = spawnSync(ffmpeg, ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", `scale=${w}:-2`, "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  const data = r.stdout;
  const h = data.length / 3 / w;
  return { data, w, h };
}

// the background: the pixels of the frame's outer band (5% on every side)
function border({ data, w, h }) {
  const vals = [];
  const b = Math.max(2, Math.round(Math.min(w, h) * 0.05));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (x >= b && x < w - b && y >= b && y < h - b) continue;
      const i = (y * w + x) * 3;
      vals.push([data[i], data[i + 1], data[i + 2]]);
    }
  return vals;
}
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor((s.length - 1) * p)]; };

function measure(file) {
  const res = {};
  for (const t of [0.2, 1.5, 3]) {
    const px = border(frame(file, t));
    for (const [c, k] of [["r", 0], ["g", 1], ["b", 2]]) {
      const ch = px.map((p) => p[k]);
      (res[c] ??= []).push(pct(ch, 0.05), pct(ch, 0.5));
    }
  }
  return res;
}

// whiten in RGB, then back to video range; luma above 225 is lifted (235 -> 240) so the encoder's rounding can't
// bring white under 255 after decoding (anything above 235 decodes to 255)
function filters(c) {
  const e = c.fx.replace(/,/g, "\\,");
  return [
    `scale=${c.w}:-2:flags=lanczos`,
    "format=rgb24",
    `lutrgb=r='${e}':g='${e}':b='${e}'`,
    "scale=out_color_matrix=bt709:out_range=tv",
    "format=yuv420p",
    "lutyuv=y='if(gt(val\\,225)\\,min(255\\,val+(val-225)*0.5)\\,val)'",
  ].join(",");
}

function build(c) {
  const file = A + c.src;
  const vf = filters(c);
  const mp4 = out(c, "-phone.mp4");
  const r = spawnSync(ffmpeg, ["-v", "error", "-y", "-i", file, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", mp4]);
  if (r.status !== 0) throw new Error(r.stderr.toString());
  // the poster: the copy's own first frame, decoded, as WebP
  const p = spawnSync(ffmpeg, ["-v", "error", "-i", mp4, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 1 << 28 });
  return sharp(p.stdout).webp({ quality: 82 }).toFile(out(c, "-phone-poster.webp")).then(() => ({ out: mp4, kb: Math.round(statSync(mp4).size / 1024) }));
}

async function check(c) {
  const mp4 = out(c, "-phone.mp4");
  const rows = [];
  for (const t of [0.1, 1, 2.5, 4]) {
    const f = frame(mp4, t, c.w);
    const px = border(f);
    const white = px.filter((p) => p.every((v) => v >= 254)).length / px.length;
    // anywhere in the frame: light grey that is not white (a background that didn't become white would be here)
    let pale = 0;
    for (let i = 0; i < f.data.length; i += 3) { const m = Math.min(f.data[i], f.data[i + 1], f.data[i + 2]); if (m >= 225 && m < 254) pale++; }
    rows.push(`${t}s edge white ${(white * 100).toFixed(1)}% pale ${((pale * 300) / f.data.length).toFixed(2)}%`);
  }
  const { data, info } = await sharp(out(c, "-phone-poster.webp")).raw().toBuffer({ resolveWithObject: true });
  const pb = border({ data: info.channels === 3 ? data : Buffer.from(data.filter((_, i) => i % info.channels < 3)), w: info.width, h: info.height });
  const pw = pb.filter((p) => p.every((v) => v >= 254)).length / pb.length;
  rows.push(`poster ${info.width}x${info.height} white ${(pw * 100).toFixed(1)}%`);
  return `${c.as || c.src} (${Math.round(statSync(mp4).size / 1024)} KB): ${rows.join(" | ")}`;
}

const mode = process.argv[2] || "build";
const only = process.argv[3];
for (const c of CLIPS.filter((c) => !only || (c.as || c.src).includes(only))) {
  if (mode === "measure") console.log(c.src, JSON.stringify(measure(A + c.src)));
  else if (mode === "build") console.log(JSON.stringify(await build(c)));
  else console.log(await check(c));
}
