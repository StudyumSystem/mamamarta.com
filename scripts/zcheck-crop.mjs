// Check helper (not part of the site): crops parts of Marta's kept phone frame MM-HOME-002 to compare by eye.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const f = "C:/patent-assistant-p0/demo/workspace/figma/Pc2G2suH2aQvXj0BuFkYWS-1050-3.png";
mkdirSync(".zcheck", { recursive: true });
const m = await sharp(f).metadata();
console.log(m.width, m.height);
const parts = { mindset: [5350, 900], aom: [3550, 800], footer: [m.height - 900, 900] };
for (const [k, [top, h]] of Object.entries(parts)) {
  await sharp(f).extract({ left: 0, top, width: m.width, height: h }).toFile(`.zcheck/fig-${k}.png`);
}
