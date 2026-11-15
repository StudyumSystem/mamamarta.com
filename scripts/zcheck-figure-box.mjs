// Temporary check (not committed): sizes of the videos and where the figure sits in each walking clip.
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

function info(f) {
  const r = spawnSync(ffmpeg, ["-i", f], { encoding: "utf8" });
  const m = r.stderr.match(/Stream.*Video.*?, (\d{2,5})x(\d{2,5})/);
  const d = r.stderr.match(/Duration: ([\d:.]+)/);
  return (m ? m[1] + "x" + m[2] : "?") + " " + (d ? d[1] : "");
}
function bbox(f, t) {
  const w = 200;
  const r = spawnSync(ffmpeg, ["-v", "error", "-ss", String(t), "-i", f, "-frames:v", "1", "-vf", `scale=${w}:-2`, "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1"], { maxBuffer: 1 << 26 });
  const d = r.stdout;
  const h = d.length / w;
  let x0 = w, x1 = 0, y0 = h, y1 = 0, minE = 255;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = d[y * w + x];
      if (x == 0 || y == 0 || x == w - 1 || y == h - 1) minE = Math.min(minE, v);
      if (v < 200) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
  const p = (a, b) => ((a / b) * 100).toFixed(0);
  return `t${t}: x ${p(x0, w)}-${p(x1, w)}% y ${p(y0, h)}-${p(y1, h)}% edgeMin ${minE}`;
}
const A = "public/assets/";
for (const f of ["human-walking-phone.mp4", "games/jump-phone.mp4", "games/stumble-phone.mp4", "human-walking.mp4", "apple.mp4", "google.mp4", "games/plus-key.mp4", "apple-phone.mp4", "google-phone.mp4", "games/plus-key-phone.mp4"]) {
  console.log(f, info(A + f));
  if (/walking|jump|stumble/.test(f)) for (const t of [0.3, 1.5, 2.5, 3.5, 4.5]) console.log("  ", bbox(A + f, t));
}
