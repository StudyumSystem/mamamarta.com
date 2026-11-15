// One contact sheet of frames from her original m.mp4 (to match the coded M to it). Writes scripts/zcheck-mframes.png.
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const file = "public/assets/m.mp4";
const info = spawnSync(ffmpeg, ["-i", file], { encoding: "utf8" }).stderr;
const m = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
const dur = +m[1] * 3600 + +m[2] * 60 + +m[3];
console.log("duration", dur, (info.match(/Stream.*Video.*/) || [""])[0]);
const N = 12, W = 240;
const tiles = [];
for (let k = 0; k < N; k++) {
  const t = (dur * k) / N;
  const r = spawnSync(ffmpeg, ["-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", `scale=${W}:-2`, "-f", "image2pipe", "-vcodec", "png", "pipe:1"], { maxBuffer: 1 << 26 });
  tiles.push({ buf: r.stdout, t });
}
const meta = await sharp(tiles[0].buf).metadata();
const cols = 6, rows = Math.ceil(N / cols);
await sharp({ create: { width: cols * W, height: rows * meta.height, channels: 3, background: "#ffffff" } })
  .composite(tiles.map((x, i) => ({ input: x.buf, left: (i % cols) * W, top: Math.floor(i / cols) * meta.height })))
  .png().toFile("scripts/zcheck-mframes.png");
console.log("times", tiles.map((x) => x.t.toFixed(2)).join(" "));
