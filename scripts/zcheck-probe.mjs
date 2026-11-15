// Temporary check (not committed): her clips' sizes and frame rates.
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
for (const f of ["public/assets/human-walking.mp4", "public/assets/games/jump.mp4", "public/assets/games/stumble.mp4"]) {
  const r = spawnSync(ffmpeg, ["-i", f], { encoding: "utf8" });
  console.log(f, (r.stderr.match(/Duration: [^,]+/) || [""])[0], (r.stderr.match(/Stream.*Video.*/) || [""])[0].slice(0, 220));
}
const e = spawnSync(ffmpeg, ["-hide_banner", "-encoders"], { encoding: "utf8" });
console.log(e.stdout.split("\n").filter((l) => /webp|png/i.test(l)).join("\n"));
const sharp = (await import("sharp")).default;
console.log("sharp", sharp.versions);
