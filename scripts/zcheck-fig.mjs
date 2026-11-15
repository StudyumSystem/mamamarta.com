// temporary: print a Figma node's layer tree from the kept copy (relative to the frame's top left)
import { readFileSync } from "node:fs";
const doc = JSON.parse(readFileSync(new URL("../../../figma/cache/Pc2G2suH2aQvXj0BuFkYWS.json", import.meta.url), "utf8"));
const want = process.argv[2].replace("-", ":");
const maxDepth = Number(process.argv[3] || 6);
function find(n) {
  if (n.id === want) return n;
  for (const c of n.children || []) { const f = find(c); if (f) return f; }
  return null;
}
const root = doc.document ? find(doc.document) : find(doc);
if (!root) { console.log("not found", Object.keys(doc)); process.exit(1); }
const o = root.absoluteBoundingBox;
const col = (p) => {
  if (!p || p.visible === false) return "";
  if (p.type === "SOLID") { const c = p.color; const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0"); return `#${h(c.r)}${h(c.g)}${h(c.b)}${p.opacity != null && p.opacity < 1 ? "@" + p.opacity.toFixed(2) : ""}`; }
  return p.type;
};
function walk(n, d) {
  if (d > maxDepth) return;
  const b = n.absoluteBoundingBox;
  const pos = b ? `${Math.round((b.x - o.x) * 10) / 10},${Math.round((b.y - o.y) * 10) / 10} ${Math.round(b.width * 10) / 10}x${Math.round(b.height * 10) / 10}` : "";
  const fills = (n.fills || []).map(col).filter(Boolean).join("+");
  const strokes = (n.strokes || []).map(col).filter(Boolean).join("+");
  let extra = "";
  if (n.type === "TEXT") { const s = n.style || {}; extra = ` "${(n.characters || "").replace(/\n/g, "\\n").slice(0, 90)}" ${s.fontFamily} ${s.fontWeight} ${s.fontSize}/${Math.round((s.lineHeightPx || 0) * 10) / 10} ls${s.letterSpacing ?? ""} ${s.textAlignHorizontal || ""}`; }
  const fx = (n.effects || []).filter((e) => e.visible !== false).map((e) => `${e.type}${e.radius ? ":" + e.radius : ""}`).join(",");
  console.log(`${"  ".repeat(d)}${n.id} ${n.type} [${n.name}] ${pos}${fills ? " fill " + fills : ""}${strokes ? " stroke " + strokes + (n.strokeWeight ? "/" + n.strokeWeight : "") : ""}${n.cornerRadius ? " r" + n.cornerRadius : ""}${n.opacity != null && n.opacity < 1 ? " op" + n.opacity : ""}${fx ? " fx " + fx : ""}${n.visible === false ? " HIDDEN" : ""}${extra}`);
  for (const c of n.children || []) walk(c, d + 1);
}
walk(root, 0);
