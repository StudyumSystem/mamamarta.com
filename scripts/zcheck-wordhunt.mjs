// Temporary check (not committed): Word Hunt's swipe helpers from WordHunt.jsx (steady, pickWord) on real rounds.
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/components/react/games/WordHunt.jsx", import.meta.url), "utf8");
const body = src.slice(src.indexOf("const SIZE"), src.indexOf("export default function"))
  .replace(/function Firework\(\) \{[\s\S]*?\n\}\n/, "");
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const H = new Function("shuffle", body + "\nreturn { SIZE, POOL, DEAD, straight, steady, pickWord, tryPlace, newRound };")(shuffle);
const { SIZE, DEAD, straight, steady, pickWord, newRound } = H;

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; if (fails < 30) console.log("FAIL", msg); } };

// 1. steady: dead 0 is exactly the old floor (the mouse), 0.3 is a dead zone with hysteresis
for (let n = 0; n < 20000; n++) {
  const f = Math.random() * 12 - 1, cur = Math.floor(Math.random() * SIZE);
  ok(steady(f, cur, 0) === Math.min(SIZE - 1, Math.max(0, Math.floor(f))), `dead 0 f=${f} cur=${cur}`);
}
const T = [
  [3, 4.2, 3], [3, 4.29, 3], [3, 4.31, 4], [3, 4.9, 4], [3, 5.1, 4], [3, 5.31, 5], [3, 2.75, 3], [3, 2.71, 3], [3, 2.69, 2],
  [4, 3.8, 4], [4, 3.71, 4], [4, 3.69, 3], [4, 1.5, 1], [4, 1.75, 2], [9, 11, 9], [0, -2, 0], [3, 3.5, 3],
];
for (const [cur, f, want] of T) ok(steady(f, cur, DEAD) === want, `steady(${f}, ${cur}) = ${steady(f, cur, DEAD)}, want ${want}`);
// a finger that wobbles around a border never flickers: from cell 4 (entered), wobbling 4.95..5.25 stays 4
{ let c = 4; const seen = new Set(); for (const f of [4.6, 4.95, 5.2, 5.05, 5.25, 4.98, 5.1]) { c = steady(f, c, DEAD); seen.add(c); } ok(seen.size === 1 && c === 4, `wobble ${[...seen]}`); }
// a fingertip rolling 0.25 of a letter on as it lifts, after resting in the middle of the last letter: same end
{ let c = 2; for (const f of [3.5, 4.5, 5.5, 6.5, 6.75]) c = steady(f, c, DEAD); ok(c === 6, `roll on lift ${c}`); }

// 2. pickWord on real rounds, every straight swipe of the grid, against the old exact rule
const old = (sel, round, found) => {
  const word = sel.map((i) => round.grid[i]).join("");
  const back = [...word].reverse().join("");
  return round.placed.find((p) => !found.includes(p.word) && sel.length === p.word.length && (p.word === word || p.word === back)) || null;
};
let oldHits = 0, newHits = 0, extraHits = 0;
const kinds = { exact: 0, endOver: 0, startEarly: 0, both: 0 };
for (let n = 0; n < 60; n++) {
  const round = newRound();
  // some words already found in half the rounds
  const found = n % 2 ? round.placed.slice(0, 3).map((p) => p.word) : [];
  for (let a = 0; a < SIZE * SIZE; a++)
    for (let b = 0; b < SIZE * SIZE; b++) {
      const ar = Math.floor(a / SIZE), ac = a % SIZE, br = Math.floor(b / SIZE), bc = b % SIZE;
      if (ar !== br && ac !== bc) continue;
      const sel = straight(a, b);
      const o = old(sel, round, found), w = pickWord(sel, round.placed, found);
      if (o) { oldHits++; ok(w === o, `exact swipe ${o.word} gave ${w && w.word}`); }
      if (!w) {
        // nothing missed: no unfound word sits inside with at most one extra at each end
        for (const p of round.placed) {
          if (found.includes(p.word)) continue;
          const at = p.cells.map((i) => sel.indexOf(i));
          ok(at.includes(-1) || Math.min(...at) > 1 || sel.length - 1 - Math.max(...at) > 1, `missed ${p.word}`);
        }
        continue;
      }
      newHits++;
      ok(!found.includes(w.word), `found word ${w.word} counted again`);
      ok(sel.length >= w.word.length && sel.length <= w.word.length + 2, `${w.word} from ${sel.length} cells`);
      const at = w.cells.map((i) => sel.indexOf(i));
      ok(!at.includes(-1), `${w.word} not inside`);
      const lo = Math.min(...at), extraEnd = sel.length - 1 - Math.max(...at);
      ok(lo <= 1 && extraEnd <= 1, `${w.word} extra ${lo}/${extraEnd}`);
      // the extra letters are swipe cells, never the word's: its found cells are exactly p.cells
      ok(Math.max(...at) - lo === w.word.length - 1, `${w.word} not one run`);
      if (!o) extraHits++;
      const fwd = sel.indexOf(w.cells[0]) <= sel.indexOf(w.cells[w.cells.length - 1]);
      const startX = fwd ? lo : extraEnd, endX = fwd ? extraEnd : lo; // in the word's own reading direction
      kinds[startX && endX ? "both" : startX ? "startEarly" : endX ? "endOver" : "exact"]++;
    }
  // the named cases, per word not found: P-A-T-T-E-R-N-U (one on), one early, one each end, two on, one short, whole line
  for (const p of round.placed) {
    if (found.includes(p.word)) continue;
    const first = p.cells[0], last = p.cells[p.cells.length - 1], step = p.cells[1] - p.cells[0];
    const across = step === 1;
    const pos = (i) => (across ? i % SIZE : Math.floor(i / SIZE));
    const canAfter = (k) => pos(last) + k <= SIZE - 1, canBefore = (k) => pos(first) - k >= 0;
    if (canAfter(1)) {
      ok(pickWord(straight(first, last + step), round.placed, found) === p, `${p.word}+1 at the end`);
      ok(pickWord(straight(last + step, first), round.placed, found) === p, `${p.word}+1 at the end, swiped backwards`);
    }
    if (canBefore(1)) ok(pickWord(straight(first - step, last), round.placed, found) === p, `${p.word} one early`);
    if (canAfter(1) && canBefore(1)) ok(pickWord(straight(first - step, last + step), round.placed, found) === p, `${p.word} one each end`);
    if (canAfter(2)) { const w = pickWord(straight(first, last + 2 * step), round.placed, found); ok(w !== p, `${p.word}+2 counted`); }
    if (canBefore(2)) { const w = pickWord(straight(first - 2 * step, last), round.placed, found); ok(w !== p, `${p.word} two early counted`); }
    ok(pickWord(straight(first, last - step), round.placed, found) !== p, `${p.word} one short counted`);
    ok(pickWord(straight(first + step, last), round.placed, found) !== p, `${p.word} missing its first letter counted`);
    const lineStart = across ? first - pos(first) : first % SIZE, lineEnd = across ? lineStart + SIZE - 1 : lineStart + (SIZE - 1) * SIZE;
    if (p.word.length + 2 < SIZE) ok(pickWord(straight(lineStart, lineEnd), round.placed, found) !== p, `${p.word} whole line counted`);
    ok(pickWord(straight(first, last), round.placed, [...found, p.word]) !== p, `${p.word} counted twice`);
  }
}
// 3. two words fitting one swipe: the longer one (made up, the real grid never has two)
{
  const placed = [{ word: "TONE", cells: [2, 3, 4, 5] }, { word: "PAINT", cells: [1, 2, 3, 4, 5] }];
  ok(pickWord(straight(1, 6), placed, [])?.word === "PAINT", "longest of two");
  ok(pickWord(straight(6, 1), placed, [])?.word === "PAINT", "longest of two, backwards");
  ok(pickWord(straight(2, 6), placed, [])?.word === "TONE", "the one that fits");
  ok(pickWord(straight(1, 6), placed, ["PAINT"])?.word === "TONE", "the found one skipped");
  ok(pickWord(straight(0, 7), placed, ["PAINT"]) === null, "TONE with two extra at each end");
}
console.log(`${checks} checks, ${fails} failed; over 60 rounds: ${oldHits} exact swipes hit before and now, ${newHits} hits now, ${extraHits} of them only with the forgiving rule`, kinds);
process.exit(fails ? 1 : 0);
