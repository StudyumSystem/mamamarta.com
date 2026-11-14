import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen } from "./GameModal.jsx";
import { pad2, shuffle, takeQuote, prefersReducedMotion, recordStars, ROUND_STARS } from "./shared.js";
import { play } from "./sound.js";
import Burst, { PINK_BLACK } from "./Burst.jsx";

// MM-GAME-02 Memory Match (Marta's spec + her 11 Nov frames MM-G02-01…06): 20 cards, 10 pairs, no timer,
// counter 0/10, 10 MM✦ a pair, mismatch flips back after ~900 ms, max two cards up.
// All pairs found: the cards fly apart and a pink and black firework opens (a fade instead with reduced motion),
// then the score screen (timer line), then the quote screen.
const IMAGES = [
  ["1", "Chess queen"], ["2", "Ice cream"], ["3", "Balloon dog"], ["4", "Heart"], ["5", "Lipstick"],
  ["6", "Lollipop"], ["7", "Asterisk-shaped object"], ["8", "Cherries"], ["9", "Dice"], ["10", "Knotted bag"],
];
const CARD_BACK = "/assets/games/card-back.png";
const cardSrc = (n) => `/assets/games/cards/${n}.png`;
const PAIR_STARS = 10;

const INSTRUCTIONS =
  "Find the matching pairs. Flip two cards at a time and remember what you see. Match all 10 pairs to complete the game."; // MM-G02-01 (11 Nov)

const newDeck = () => shuffle(IMAGES.flatMap(([n, alt]) => [{ n, alt }, { n, alt }])).map((c, i) => ({ ...c, key: `${c.n}-${i}` }));

// The firework: two rings of confetti from the middle of the board. 12 Nov (Marta: more confetti): twice as many
// pieces (88, was 44), Mamamarta pink #F600A9 and black, thrown about twice as far (up to half the screen).
function Firework() {
  const reach = useMemo(() => Math.max(320, Math.min(window.innerWidth, window.innerHeight) * 0.5), []);
  return <Burst rings={[{ n: 52, reach, size: 11 }, { n: 36, reach: reach * 0.55, size: 9, delay: 260 }]} colors={PINK_BLACK} />;
}

export default function MemoryMatch({ open, onClose }) {
  const [deck, setDeck] = useState(newDeck);
  const [up, setUp] = useState([]); // indices currently face up (unmatched)
  const [matched, setMatched] = useState(() => new Set());
  const [pulse, setPulse] = useState(null);
  const [phase, setPhase] = useState("play"); // play | burst (or fade, reduced motion) | score | done
  const [fly, setFly] = useState(null); // per-card flight vectors during the burst
  const [quote, setQuote] = useState(null);
  const [moved, setMoved] = useState(false);
  const lock = useRef(false);
  const timers = useRef([]);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const streak = useRef(0); // pairs found in a row, for the rising sound (Marta, 12 Nov)

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    lock.current = false;
    streak.current = 0;
    setDeck(newDeck());
    setUp([]);
    setMatched(new Set());
    setPhase("play");
    setFly(null);
    setQuote(null);
    setMoved(false);
  }, []);

  // Closing or reopening always starts a fresh round at 0/10.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const pairs = matched.size / 2;

  // Every card flies outward from the middle of the board, a little turned.
  const burst = () => {
    const g = gridRef.current?.getBoundingClientRect();
    if (!g) return;
    const cx = g.left + g.width / 2, cy = g.top + g.height / 2;
    const far = Math.max(window.innerWidth, window.innerHeight) * 0.75;
    setFly(cardRefs.current.map((el) => {
      const r = el?.getBoundingClientRect();
      if (!r) return null;
      let dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const d = far * (0.8 + Math.random() * 0.4);
      return { dx: `${dx * d}px`, dy: `${dy * d}px`, rot: `${(Math.random() - 0.5) * 140}deg`, delay: `${Math.random() * 120}ms` };
    }));
  };

  const finish = () => {
    lock.current = true;
    play("win");
    recordStars("memory-match", ROUND_STARS);
    // reduced motion: no flight and no firework, the board simply fades (12 Nov)
    if (prefersReducedMotion()) { later(() => setPhase("fade"), 300); later(() => setPhase("score"), 1100); return; }
    later(() => { setPhase("burst"); burst(); }, 450);
    later(() => setPhase("score"), 450 + 1450);
  };

  const flip = (i) => {
    if (lock.current || phase !== "play" || matched.has(i) || up.includes(i)) return;
    play("flip");
    setMoved(true);
    const next = [...up, i];
    if (next.length < 2) { setUp(next); return; }
    const [a, b] = next;
    if (deck[a].n === deck[b].n) {
      const m = new Set(matched); m.add(a); m.add(b);
      setMatched(m);
      setUp([]);
      setPulse(deck[a].n);
      later(() => setPulse(null), 450);
      // a found pair, then its MM✦ credited (Marta, 11 Nov 19:56). 12 Nov (Marta): pairs in a row build up,
      // each one a step higher, with an extra sparkle from the second in a row on.
      streak.current += 1;
      const run = streak.current;
      if (m.size !== deck.length) { later(() => play("match", "memory-match", run), 120); later(() => play("coins"), 380); }
      if (m.size === deck.length) finish();
    } else {
      setUp(next);
      lock.current = true;
      streak.current = 0;
      // 12 Nov (Marta): a short "miss" as soon as the two cards don't match, then they turn back quietly
      later(() => play("back"), 300);
      later(() => { setUp([]); lock.current = false; play("turn"); }, 900);
    }
  };

  const toQuote = useCallback(() => { setQuote(takeQuote("memory-match")); setPhase("done"); }, []);

  const counter = pairs === 0 ? "0 / 10" : `${pad2(pairs)} / 10`;
  const ended = phase === "score" || phase === "done";

  return (
    <GameModal
      open={open}
      onClose={onClose}
      onBack={phase === "done" ? () => setPhase("score") : null}
      label="Memory Match"
      game
      stage={phase !== "done"}
      textBox={[333, 608]}
      instructions={ended ? null : INSTRUCTIONS}
      counter={ended ? null : counter}
      stars={ended ? null : pairs * PAIR_STARS}
      hud={!ended}
      confirm={ended ? "completed" : moved && phase === "play" ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" ? (
        <ScoreScreen badge="Perfect find" label="All pairs found" value="10 / 10" stars={ROUND_STARS} onDone={toQuote} />
      ) : (
        <div className="flex flex-1 items-start justify-center overflow-hidden px-[15px] pb-8 pt-[18px] lg:pointer-events-none lg:absolute lg:inset-0 lg:p-0 lg:pt-[calc(198*var(--mm-u))]">
          {/* her MM-G02-01 / -02 at 1920 x 1019: five cards of 125 x 159.5 a row, 16 apart, rows 22 apart (689 wide),
              198 from the panel's top; on the computer in her frame's px measured against the screen's height
              (--mm-u, GameModal), so the cards take the share of the height hers do on every screen (12 Nov) */}
          <div ref={gridRef} className={`${phase === "fade" ? "mm-fade-out" : ""} relative grid w-[min(100%,calc((100cqh-74px)/1.6+18px))] max-w-[640px] grid-cols-4 gap-[6px] lg:pointer-events-auto lg:w-[calc(689*var(--mm-u))] lg:max-w-none lg:grid-cols-5 lg:gap-x-[calc(16*var(--mm-u))] lg:gap-y-[calc(22*var(--mm-u))]`}>
            {deck.map((card, i) => {
              const faceUp = phase !== "play" || matched.has(i) || up.includes(i);
              const f = phase === "burst" && fly?.[i];
              return (
                <button
                  key={card.key}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  type="button"
                  onClick={() => flip(i)}
                  aria-label={faceUp ? card.alt : "Hidden card"}
                  className={`relative aspect-[125/160] w-full [perspective:900px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F600A9] ${pulse === card.n && matched.has(i) ? "mm-match" : ""} ${f ? "mm-fly" : ""}`}
                  style={f ? { "--dx": f.dx, "--dy": f.dy, "--rot": f.rot, animationDelay: f.delay } : undefined}
                >
                  <span
                    className="absolute inset-0 block transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:transition-none"
                    style={{ transform: faceUp ? "rotateY(180deg)" : "none" }}
                  >
                    <span
                      className="absolute inset-0 block overflow-hidden rounded-[10px] bg-[#F600A9] bg-cover bg-center [backface-visibility:hidden]"
                      style={{ backgroundImage: `url(${CARD_BACK})` }}
                    />
                    {/* Marta's card fronts already include the white face and the thin rounded frame */}
                    <span className="absolute inset-0 block overflow-hidden rounded-[10px] bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <img src={cardSrc(card.n)} alt="" className="h-full w-full object-cover" draggable="false" />
                    </span>
                  </span>
                </button>
              );
            })}
            {phase === "burst" && <Firework />}
          </div>
        </div>
      )}
    </GameModal>
  );
}
