import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen } from "./GameModal.jsx";
import { pad2, shuffle, takeQuote, recordStars, ROUND_STARS } from "./shared.js";
import { play as playSound } from "./sound.js";
const play = (name) => playSound(name, "word-hunt");

// MM-GAME-01 Word Hunt (Marta's spec): 10x10 grid, 10 of the 20 pool words per round,
// placed across or down; swipe a row or column in either direction. No timer, counter 0/10.
const SIZE = 10;
const COUNT = 10;
const POOL = [
  "PAPER", "PENCIL", "PAINT", "BRUSH", "INK", "CANVAS", "COLOR", "FRAME", "PHOTO", "SHAPE",
  "LINE", "LIGHT", "ART", "DESIGN", "FORM", "CLAY", "DRAW", "PRINT", "SKETCH", "MUSE",
];
const LETTERS = "ABCDEFGHIJKLMNOPRSTUVWY";
const INSTRUCTIONS =
  "Find the 10 hidden art-inspired words. Swipe across letters horizontally or vertically. Find them all to complete the game."; // MM-G01-03 (11 Nov)
const WORD_STARS = 10; // her MM-G01-03: one word found = "10 MM✦"

// Every row and column read both ways, to count how often a word can be found.
function lines(grid) {
  const out = [];
  for (let i = 0; i < SIZE; i++) {
    const row = grid.slice(i * SIZE, i * SIZE + SIZE).join("");
    let col = "";
    for (let r = 0; r < SIZE; r++) col += grid[r * SIZE + i];
    out.push(row, col, [...row].reverse().join(""), [...col].reverse().join(""));
  }
  return out;
}
const occurrences = (all, word) =>
  all.reduce((n, line) => { let k = 0, at = line.indexOf(word); while (at >= 0) { k++; at = line.indexOf(word, at + 1); } return n + k; }, 0);

function tryPlace(words) {
  const grid = Array(SIZE * SIZE).fill(null);
  const placed = [];
  // Longest first, so the short ones fill the gaps.
  for (const word of words.slice().sort((a, b) => b.length - a.length)) {
    const spots = [];
    for (const across of [true, false])
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          if ((across ? c : r) + word.length > SIZE) continue;
          const cells = [...word].map((_, k) => (across ? r * SIZE + c + k : (r + k) * SIZE + c));
          if (cells.every((cell, k) => grid[cell] === null || grid[cell] === word[k])) spots.push(cells);
        }
    if (!spots.length) return null;
    const cells = spots[Math.floor(Math.random() * spots.length)];
    cells.forEach((cell, k) => { grid[cell] = word[k]; });
    placed.push({ word, cells });
  }
  for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  // Valid only if each chosen word can be found exactly once and no other pool word shows up by chance.
  const all = lines(grid);
  for (const w of POOL) {
    const n = occurrences(all, w);
    // A palindrome would be counted twice (both directions); none in the pool, but keep the rule honest.
    const want = words.includes(w) ? ([...w].reverse().join("") === w ? 2 : 1) : 0;
    if (n !== want) return null;
  }
  return { grid, placed };
}

let lastSet = "";
function newRound() {
  for (let attempt = 0; attempt < 400; attempt++) {
    const words = shuffle(POOL).slice(0, COUNT);
    const key = words.slice().sort().join(",");
    if (key === lastSet) continue;
    const round = tryPlace(words);
    if (round) { lastSet = key; return round; }
  }
  throw new Error("Word Hunt: could not build a grid");
}

// Cells from a to b, snapped to the row or the column the drag mostly follows.
function straight(a, b) {
  const ar = Math.floor(a / SIZE), ac = a % SIZE, br = Math.floor(b / SIZE), bc = b % SIZE;
  const across = Math.abs(bc - ac) >= Math.abs(br - ar);
  const len = across ? Math.abs(bc - ac) : Math.abs(br - ar);
  const step = across ? Math.sign(bc - ac) : Math.sign(br - ar) * SIZE;
  return Array.from({ length: len + 1 }, (_, k) => a + k * step);
}

export default function WordHunt({ open, onClose }) {
  const [round, setRound] = useState(null);
  const [found, setFound] = useState([]); // words found, in order
  const [sel, setSel] = useState([]);
  const [pop, setPop] = useState(null);
  const [quote, setQuote] = useState(null);
  const [phase, setPhase] = useState("play"); // play | score | done
  const drag = useRef(null);
  const selRef = useRef([]);
  const gridRef = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    drag.current = null;
    setRound(newRound());
    setFound([]);
    setSel([]);
    setPop(null);
    setQuote(null);
    setPhase("play");
  }, []);

  // Closing or reopening always starts a fresh grid at 0/10.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const done = found.length === COUNT;

  const cellAt = (e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * SIZE);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * SIZE);
    return { r: Math.min(SIZE - 1, Math.max(0, r)), c: Math.min(SIZE - 1, Math.max(0, c)), inside: r >= 0 && r < SIZE && c >= 0 && c < SIZE };
  };

  const onDown = (e) => {
    if (done || !round) return;
    const { r, c, inside } = cellAt(e);
    if (!inside) return;
    e.preventDefault();
    gridRef.current.setPointerCapture?.(e.pointerId);
    drag.current = r * SIZE + c;
    selRef.current = [drag.current];
    setSel(selRef.current);
  };

  const onMove = (e) => {
    if (drag.current == null) return;
    e.preventDefault();
    const { r, c } = cellAt(e);
    selRef.current = straight(drag.current, r * SIZE + c);
    setSel(selRef.current);
  };

  const onUp = () => {
    if (drag.current == null) return;
    drag.current = null;
    const sel = selRef.current;
    selRef.current = [];
    const word = sel.map((i) => round.grid[i]).join("");
    const back = [...word].reverse().join("");
    const hit = round.placed.find((p) => !found.includes(p.word) && sel.length === p.word.length && (p.word === word || p.word === back));
    setSel([]); // a wrong selection simply fades back (colour transition on the cells)
    if (!hit) { if (sel.length > 1) play("back"); return; }
    const next = [...found, hit.word];
    setFound(next);
    setPop(hit.word);
    later(() => setPop(null), 450);
    if (next.length === COUNT) {
      play("win");
      recordStars("word-hunt", ROUND_STARS);
      later(() => setPhase("score"), 1100);
    } else {
      // a found word, then its MM✦ credited (Marta, 11 Nov 19:56)
      play("match");
      later(() => play("coins"), 220);
    }
  };

  const toQuote = useCallback(() => { setQuote(takeQuote("word-hunt")); setPhase("done"); }, []);

  const foundCells = new Set();
  const popCells = new Set();
  round?.placed.forEach((p) => {
    if (!found.includes(p.word)) return;
    p.cells.forEach((i) => { foundCells.add(i); if (p.word === pop) popCells.add(i); });
  });
  const selCells = new Set(sel);

  const ended = phase !== "play";
  const counter = ended ? null : found.length === 0 ? `0 / ${COUNT}` : `${pad2(found.length)} / ${COUNT}`;

  return (
    <GameModal
      open={open}
      onClose={onClose}
      onBack={phase === "done" ? () => setPhase("score") : null}
      label="Word Hunt"
      game
      instructions={ended ? null : INSTRUCTIONS}
      counter={counter}
      stars={ended ? null : found.length * WORD_STARS}
      hud={!ended}
      confirm={ended ? "completed" : found.length ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" ? (
        <ScoreScreen badge="Perfect find" label="All words discovered" value={`${COUNT} / ${COUNT}`} stars={ROUND_STARS} onDone={toQuote} />
      ) : (
        <div className="flex flex-1 items-start justify-center px-[15px] pt-[19px] pb-8 lg:pb-[2.4vw] lg:pt-[2.9vw]">
          <div
            ref={gridRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="grid"
            aria-label={`Word Hunt letter grid, ${found.length} of ${COUNT} words found${found.length ? `: ${found.join(", ")}` : ""}`}
            className="grid w-full max-w-[640px] select-none grid-cols-10 gap-px border border-[#d4d4d4] bg-[#d4d4d4] [container-type:inline-size] [touch-action:none] lg:w-[min(38.5vw,calc(100vh_-_200px))] lg:max-w-none"
          >
            {round?.grid.map((ch, i) => {
              const on = selCells.has(i) || foundCells.has(i);
              return (
                <span
                  key={i}
                  role="gridcell"
                  className={`flex aspect-square items-center justify-center text-[7.2cqw] lg:text-[6.7cqw] font-normal leading-none transition-colors duration-300 motion-reduce:transition-none ${
                    on ? "bg-[#fef7fc] text-[#F600A9]" : "bg-white text-black"
                  } ${popCells.has(i) ? "mm-match" : ""}`}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </GameModal>
  );
}
