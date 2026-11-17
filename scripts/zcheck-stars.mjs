// Simulates play with the new MM Stars counting (17 Nov): time to 750, a day's cap, a week to 20,000.
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
const { recordStars, totalStars } = await import("../src/components/react/games/shared.js");

const start = new Date(2026, 10, 17, 9, 0).getTime();
const games = [["word-hunt", 150, 180], ["memory-match", 150, 90], ["tic-tac-toe", 150, 30], ["connect-the-path", 150, 60], ["art-of-moving", 120, 60]];
let t = start, i = 0, at750 = null;
// fast play: one round after another, a game's typical length each
while (t < start + 3 * 3600e3) {
  const [g, n, sec] = games[i++ % games.length];
  t += sec * 1000;
  recordStars(g, n, t);
  if (at750 === null && totalStars() >= 750) at750 = (t - start) / 60000;
}
console.log("750 reached after min:", at750?.toFixed(1), "| after 3 h of play:", totalStars());
// tic-tac-toe spam: a round every 20 s for an hour on a new day
store.clear(); t = start;
for (let k = 0; k < 180; k++) { t += 20000; recordStars("tic-tac-toe", 150, t); }
console.log("1 h of 20-s rounds:", totalStars());
// a week: 2 h a day
store.clear();
let day = 0, days = null;
for (day = 0; day < 10 && days === null; day++) {
  t = start + day * 86400e3;
  for (let k = 0; k < 120; k++) { t += 60000; recordStars("memory-match", 150, t); if (days === null && totalStars() >= 20000) days = day + 1; }
}
console.log("20,000 reached on day:", days, "total", totalStars());
// first round counts in full; coming back after a break holds at most one round
store.clear(); recordStars("word-hunt", 150, start); recordStars("word-hunt", 150, start + 10 * 3600e3);
console.log("first round + one after 10 h:", totalStars());
