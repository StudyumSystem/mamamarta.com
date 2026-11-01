import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion } from "./GameModal.jsx";
import { pad2, shuffle, takeQuote } from "./shared.js";

// MM-GAME-02 Memory Match (Marta's spec): 20 cards, 10 pairs, no timer, counter 0/10,
// mismatch flips back after ~900 ms, max two cards up, quote rotation on completion.
const IMAGES = [
  ["1", "Chess queen"], ["2", "Ice cream"], ["3", "Balloon dog"], ["4", "Heart"], ["5", "Lipstick"],
  ["6", "Lollipop"], ["7", "Asterisk-shaped object"], ["8", "Cherries"], ["9", "Dice"], ["10", "Knotted bag"],
];
const CARD_BACK = "/assets/games/card-back.png";
const cardSrc = (n) => `/assets/games/cards/${n}.png`;

const INSTRUCTIONS =
  "Find the matching pairs.  Flip two cards at a time and remember what you see.  Match all 10 pairs to complete the game."; // double spaces as in MM-G02-01

const newDeck = () => shuffle(IMAGES.flatMap(([n, alt]) => [{ n, alt }, { n, alt }])).map((c, i) => ({ ...c, key: `${c.n}-${i}` }));

export default function MemoryMatch({ open, onClose }) {
  const [deck, setDeck] = useState(newDeck);
  const [up, setUp] = useState([]); // indices currently face up (unmatched)
  const [matched, setMatched] = useState(() => new Set());
  const [pulse, setPulse] = useState(null);
  const [quote, setQuote] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const lock = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    lock.current = false;
    setDeck(newDeck());
    setUp([]);
    setMatched(new Set());
    setQuote(null);
    setShowAll(false);
  }, []);

  // Closing or reopening always starts a fresh round at 0/10.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const pairs = matched.size / 2;

  const flip = (i) => {
    if (lock.current || quote || matched.has(i) || up.includes(i)) return;
    const next = [...up, i];
    if (next.length < 2) { setUp(next); return; }
    const [a, b] = next;
    if (deck[a].n === deck[b].n) {
      const m = new Set(matched); m.add(a); m.add(b);
      setMatched(m);
      setUp([]);
      setPulse(deck[a].n);
      later(() => setPulse(null), 450);
      if (m.size === deck.length) {
        lock.current = true;
        setShowAll(true);
        later(() => setQuote(takeQuote("memory-match")), 1100);
      }
    } else {
      setUp(next);
      lock.current = true;
      later(() => { setUp([]); lock.current = false; }, 900);
    }
  };

  const counter = quote ? null : pairs === 0 ? "0 / 10" : `${pad2(pairs)} / 10`;

  return (
    <GameModal open={open} onClose={onClose} label="Memory Match" instructions={quote ? null : INSTRUCTIONS} counter={counter} phoneCounter={false}>
      {quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : (
        <div className={`flex flex-1 items-start justify-center px-[15px] pb-8 pt-[56px] lg:pb-[3vw] lg:pt-[3.96vw] transition-opacity duration-500 ${showAll ? "opacity-90" : ""}`}>
          <div className="grid w-full max-w-[640px] grid-cols-4 gap-[6px] lg:w-[36vw] lg:max-w-none lg:grid-cols-5 lg:gap-x-[0.9vw] lg:gap-y-[1.15vw]">
            {deck.map((card, i) => {
              const faceUp = showAll || matched.has(i) || up.includes(i);
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => flip(i)}
                  aria-label={faceUp ? card.alt : "Hidden card"}
                  className={`relative aspect-[130/165] w-full [perspective:900px] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${pulse === card.n && matched.has(i) ? "mm-match" : ""}`}
                >
                  <span
                    className="absolute inset-0 block transition-transform duration-300 ease-out [transform-style:preserve-3d] motion-reduce:transition-none"
                    style={{ transform: faceUp ? "rotateY(180deg)" : "none" }}
                  >
                    <span
                      className="absolute inset-0 block overflow-hidden rounded-[10px] bg-pink-400 bg-cover bg-center [backface-visibility:hidden]"
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
          </div>
        </div>
      )}
    </GameModal>
  );
}
