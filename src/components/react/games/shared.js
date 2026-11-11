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
// A round is worth at most 150 (every score frame shows 150). Each game keeps its best round, so the total
// grows by playing all five, not by replaying one. Kept on this device until saved with an email.
export const ROUND_STARS = 150;
const STARS_KEY = "mm-stars";
const SAVED_KEY = "mm-stars-saved";
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: lasts this visit */ }
};

export function recordStars(gameId, n) {
  const all = read(STARS_KEY, {});
  if (!(all[gameId] >= n)) all[gameId] = n;
  write(STARS_KEY, all);
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
