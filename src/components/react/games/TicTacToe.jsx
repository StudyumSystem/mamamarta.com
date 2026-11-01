import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion } from "./GameModal.jsx";
import { takeQuote } from "./shared.js";

// MM-GAME-03 Tic-Tac-Toe (Marta's spec): player is the fur X and always starts, the computer is the black Apple.
// Balanced opponent: takes a win, usually blocks, sometimes plays loosely. Same completion screen for win, loss and draw.
const INSTRUCTIONS = "You're the X. The computer is Apple. Take turns placing your symbols. Get three in a row to win.";
const X_SRC = "/assets/games/ttt-x.png";
const APPLE_SRC = "/assets/games/ttt-apple.png";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { who: board[a], line };
  }
  return null;
}

function completing(board, who) {
  for (const [a, b, c] of LINES) {
    const cells = [a, b, c];
    const mine = cells.filter((i) => board[i] === who).length;
    const empty = cells.filter((i) => !board[i]);
    if (mine === 2 && empty.length === 1) return empty[0];
  }
  return -1;
}

function computerMove(board) {
  const free = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const win = completing(board, "O");
  if (win >= 0) return win;
  const block = completing(board, "X");
  if (block >= 0 && Math.random() < 0.85) return block;
  if (Math.random() < 0.3) return free[Math.floor(Math.random() * free.length)];
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return free[Math.floor(Math.random() * free.length)];
}

const Symbol = ({ who }) => (
  <img
    src={who === "X" ? X_SRC : APPLE_SRC}
    alt={who === "X" ? "X" : "Apple"}
    className="mm-symbol h-[78%] w-[78%] object-contain"
    style={{ clipPath: "inset(5%)" }}
    draggable="false"
  />
);

export default function TicTacToe({ open, onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [line, setLine] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setBoard(Array(9).fill(null));
    setLine(null);
    setQuote(null);
    setBusy(false);
  }, []);

  // Back or close resets an unfinished round; reopening starts with an empty board.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const finish = (b) => {
    const w = winner(b);
    if (w) { setLine(w.line); setBusy(true); later(() => setQuote(takeQuote("tic-tac-toe")), 1100); return true; }
    if (b.every(Boolean)) { setBusy(true); later(() => setQuote(takeQuote("tic-tac-toe")), 700); return true; }
    return false;
  };

  const play = (i) => {
    if (busy || board[i] || quote) return;
    const b = board.slice();
    b[i] = "X";
    setBoard(b);
    if (finish(b)) return;
    setBusy(true); // board locked while the computer "thinks"
    later(() => {
      const c = b.slice();
      c[computerMove(c)] = "O";
      setBoard(c);
      if (!finish(c)) setBusy(false);
    }, 550 + Math.random() * 300);
  };

  return (
    <GameModal open={open} onClose={onClose} label="Tic-Tac-Toe" instructions={quote ? null : INSTRUCTIONS}>
      {quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : (
        <div className="flex flex-1 items-center justify-center px-[15px] py-8 lg:items-start lg:pb-[3vw] lg:pt-[6.5vw]">
          {/* MM-G03-01: single 1 px grey lines */}
          <div className="grid w-[92.8%] max-w-[420px] grid-cols-3 gap-px border border-[#9b9b9b] bg-[#9b9b9b] lg:w-[27.4vw] lg:max-w-none" role="grid" aria-label="Tic-Tac-Toe board">
            {board.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => play(i)}
                disabled={!!v || busy}
                aria-label={v ? (v === "X" ? "X" : "Apple") : `Empty square ${i + 1}`}
                className={`flex aspect-square items-center justify-center transition-colors duration-300 ${
                  line?.includes(i) ? "bg-pink-50" : "bg-white"
                } ${!v && !busy ? "cursor-pointer hover:bg-black/[0.02]" : "cursor-default"}`}
              >
                {v && <Symbol who={v} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameModal>
  );
}
