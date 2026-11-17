// Shared data for the five games (Marta's spec, 28 Oct 2026; quotes in docs/tasks/quotes.md).

export const WHATSAPP_URL = "https://wa.me/380954171943";

export const QUOTES = {
  "word-hunt": [
    ["Everything we see hides another thing.", "René Magritte"],
    ["There is no exquisite beauty without some strangeness in the proportion.", "Edgar Allan Poe (after Francis Bacon)"],
    ["A word after a word after a word is power.", "Margaret Atwood"],
    ["The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", "Marcel Proust"],
  ],
  "memory-match": [
    ["I need my memories. They are my documents.", "Louise Bourgeois"],
    ["Memory is a kind of accomplishment, a sort of renewal even an initiation.", "William Carlos Williams"],
    ["Nothing is ever really lost to us as long as we remember it.", "L. M. Montgomery"],
    ["The past is never dead. It's not even past.", "William Faulkner"],
  ],
  "tic-tac-toe": [
    ["Nothing is a mistake. There's no win and no fail. There's only make.", "Corita Kent"],
    ["Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.", "Samuel Beckett"],
    ["Less is more.", "Ludwig Mies van der Rohe"],
    ["To create is to live twice.", "Albert Camus"],
  ],
  "art-of-moving": [
    ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
    ["A line is a dot that went for a walk.", "Paul Klee"],
    ["Art is the only way to run away without leaving home.", "Twyla Tharp"],
    ["Art is not a thing; it is a way.", "Elbert Hubbard"],
  ],
  "connect-the-path": [
    ["You can't connect the dots looking forward; you can only connect them looking backwards.", "Steve Jobs"],
    ["Only connect!", "E. M. Forster"],
    ["To paint well means only this: to put the right colors in the right spot.", "Paul Klee"],
    ["A painting is not a picture of an experience; it is an experience.", "Mark Rothko"],
  ],
};

// Each game has its own rotation, kept for the visitor's session.
// Call once per COMPLETED round; returns the quote to show and advances the sequence.
const memoryRotation = {};
export function takeQuote(gameId) {
  const list = QUOTES[gameId];
  const key = `mm-quote-${gameId}`;
  let i = 0;
  try {
    i = Number(sessionStorage.getItem(key) || 0);
  } catch {
    i = memoryRotation[key] || 0;
  }
  const quote = list[i % list.length];
  const next = (i + 1) % list.length;
  try {
    sessionStorage.setItem(key, String(next));
  } catch {
    memoryRotation[key] = next;
  }
  return { text: quote[0], author: quote[1] };
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Two-digit counter style used in the Figma frames ("01 / 10").
export const pad2 = (n) => String(n).padStart(2, "0");

// MM✦STARS (her 11 Nov frames): "Play all 5 games to earn MM✦STARS. Save them with your email and unlock a design discount."
// A round is worth at most 150 (every score frame shows 150). Kept on this device until saved with an email.
// 17 Nov (Marta: the call discount in under half an hour of play, the full design discount in about a week):
// every round now adds to the total (before, each game kept only its best round, 750 in all). Play earns about
// 2,000 MM✦ an hour: the first round counts in full, after that the room for stars refills at that pace, never
// holding more than one round, so 750 MM✦ ($75 off the call) take about 20 min. A day adds at most 3,000 MM✦,
// so 20,000 MM✦ ($2,000 off design) take a week.
export const ROUND_STARS = 150;
export const STARS_PER_HOUR = 2000;
export const DAILY_STARS = 3000;
const STARS_KEY = "mm-stars";
const SAVED_KEY = "mm-stars-saved";
const PACE_KEY = "mm-stars-pace";
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: lasts this visit */ }
};

export function recordStars(gameId, n, now = Date.now()) {
  const want = Math.max(0, Math.round(Number(n) || 0));
  const day = new Date(now).toDateString(); // the visitor's own day
  const pace = read(PACE_KEY, null) || { day, today: 0, room: ROUND_STARS, at: now };
  const today = pace.day === day ? Number(pace.today) || 0 : 0;
  const waited = Math.max(0, now - (Number(pace.at) || now));
  const room = Math.min(ROUND_STARS, (Number(pace.room) || 0) + (waited * STARS_PER_HOUR) / 3600000);
  const add = Math.max(0, Math.min(want, Math.floor(room), DAILY_STARS - today));
  write(PACE_KEY, { day, today: today + add, room: room - add, at: now });
  if (add) {
    const all = read(STARS_KEY, {});
    all[gameId] = (Number(all[gameId]) || 0) + add;
    write(STARS_KEY, all);
  }
  return totalStars();
}
export function totalStars() {
  return Object.values(read(STARS_KEY, {})).reduce((a, b) => a + (Number(b) || 0), 0);
}
export function savedStars() {
  return read(SAVED_KEY, null);
}
export function markStarsSaved(email, total) {
  write(SAVED_KEY, { email, total });
}
// Stars that would be lost on leaving: some earned and not yet saved (or more than last saved).
export function unsavedStars() {
  const total = totalStars();
  const saved = savedStars();
  return total > 0 && (!saved || total > saved.total);
}
