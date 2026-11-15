// Temporary check (not committed): per side, the outer 4 rows/columns of each picture and of each phone video's
// frames: how many pixels are near-white (245-254, background not pure) and how many darker (<245, content or a line).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const only = process.argv[2];
function sides(data, W, H, c) {
  const px = (x, y) => { const i = (y * W + x) * c; return Math.min(data[i], data[i + 1], data[i + 2]); };
  const out = {};
  const run = (name, len, get) => {
    const rows = [];
    for (let d = 0; d < 4; d++) {
      let near = 0, dark = 0, min = 255;
      for (let k = 0; k < len; k++) { const v = get(k, d); if (v < 255) min = Math.min(min, v); if (v >= 245 && v < 255) near++; else if (v < 245) dark++; }
      rows.push(`${d}:n${near}/d${dark}/m${min}`);
    }
    out[name] = rows.join(" ");
  };
  run("top", W, (k, d) => px(k, d));
  run("bot", W, (k, d) => px(k, H - 1 - d));
  run("left", H, (k, d) => px(d, k));
  run("right", H, (k, d) => px(W - 1 - d, k));
  return out;
}
const files = [];
for (const d of ["public/assets", "public/assets/games"])
  for (const f of fs.readdirSync(d)) if (/\.(png|webp|jpe?g)$/.test(f)) files.push(path.join(d, f));
const vids = [];
for (const d of ["public/assets", "public/assets/games"])
  for (const f of fs.readdirSync(d)) if (/-phone\.mp4$/.test(f)) vids.push(path.join(d, f));

for (const f of files.filter((f) => !only || f.includes(only))) {
  const { data, info } = await sharp(f).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const s = sides(data, info.width, info.height, info.channels);
  const bad = Object.values(s).some((r) => /n[1-9]/.test(r));
  if (bad || only) console.log(f, `${info.width}x${info.height}`, JSON.stringify(s));
}
for (const f of vids.filter((f) => !only || f.includes(only))) {
  for (const t of [0, 0.5, 1.5, 3]) {
    const r = spawnSync(ffmpeg, ["-v", "error", "-ss", String(t), "-i", f, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], { maxBuffer: 1 << 28 });
    if (!r.stdout.length) { console.log(f, t, "no frame"); continue; }
    const p = spawnSync(ffmpeg, ["-i", f], { encoding: "utf8" });
    const m = p.stderr.match(/, (\d{2,5})x(\d{2,5})/);
    const W = +m[1], H = +m[2];
    console.log(f, `t${t}`, `${W}x${H}`, JSON.stringify(sides(r.stdout, W, H, 3)));
  }
}
