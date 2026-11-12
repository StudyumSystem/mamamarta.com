import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal, { Completion, ScoreScreen, PINK } from "./GameModal.jsx";
import { takeQuote, recordStars, ROUND_STARS } from "./shared.js";
import { play as sound } from "./sound.js";

// 11 Nov (her MM-G03-02 / -04 frames): grey #969696 lines on the light grey panel, a played square turns white,
// a three-in-a-row gets a thin pink line across it; the round ends on the score screen ("Well played",
// "Round completed", "YOU WON"). Her frames only show the win: the loss and draw wording and Stars are
// placeholders until Marta answers (questions in the progress log, 11 Nov part 2).
const RESULT = {
  X: { value: "YOU WON", stars: ROUND_STARS },
  O: { value: "APPLE WON", stars: 50 },
  draw: { value: "DRAW", stars: 100 },
};

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

// Marta, 11 Nov 19:50: the symbols are her animations (her Letter X video, the apple video of the home slider),
// and they sit straight on the grey board: no white square behind them. The videos' white melts into the
// grey (multiply); the still picture shows until the video has loaded.
const X_VIDEO = "/assets/games/ttt-x.mp4";
const APPLE_VIDEO = "/assets/apple.mp4";
const Symbol = ({ who }) => (
  <video
    src={who === "X" ? X_VIDEO : APPLE_VIDEO}
    poster={who === "X" ? X_SRC : APPLE_SRC}
    aria-label={who === "X" ? "X" : "Apple"}
    muted
    autoPlay
    loop
    playsInline
    className={`mm-symbol object-contain mix-blend-multiply brightness-[1.04] contrast-[1.08] ${who === "X" ? "h-[80%] w-[80%]" : "h-full w-full"}`}
    style={{ clipPath: "inset(3%)" }}
  />
);

// The pink line across a three-in-a-row, in board units (each square 1 x 1), a little past the outer centres.
function lineEnds(line) {
  const at = (i) => [(i % 3) + 0.5, Math.floor(i / 3) + 0.5];
  const [a, b] = [at(line[0]), at(line[2])];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const k = 0.32 / len;
  return [a[0] - dx * k, a[1] - dy * k, b[0] + dx * k, b[1] + dy * k];
}

export default function TicTacToe({ open, onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [line, setLine] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("play"); // play | score | done
  const [outcome, setOutcome] = useState(null); // X | O | draw
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const reset = useCallback(() => {
    clearTimers();
    setBoard(Array(9).fill(null));
    setLine(null);
    setQuote(null);
    setBusy(false);
    setPhase("play");
    setOutcome(null);
  }, []);

  // Back or close resets an unfinished round; reopening starts with an empty board.
  useEffect(() => { if (open) reset(); return clearTimers; }, [open, reset]);

  const end = (who, ms) => {
    setBusy(true);
    setOutcome(who);
    recordStars("tic-tac-toe", RESULT[who].stars);
    if (who === "X") sound("win"); else sound("back");
    later(() => setPhase("score"), ms);
  };

  const finish = (b) => {
    const w = winner(b);
    if (w) { setLine(w.line); end(w.who, 1300); return true; }
    if (b.every(Boolean)) { end("draw", 800); return true; }
    return false;
  };

  const play = (i) => {
    if (busy || board[i] || phase !== "play") return;
    const b = board.slice();
    b[i] = "X";
    setBoard(b);
    sound("flip");
    if (finish(b)) return;
    setBusy(true); // board locked while the computer "thinks"
    later(() => {
      const c = b.slice();
      c[computerMove(c)] = "O";
      setBoard(c);
      if (!finish(c)) { setBusy(false); sound("flip"); }
    }, 550 + Math.random() * 300);
  };

  const toQuote = useCallback(() => { setQuote(takeQuote("tic-tac-toe")); setPhase("done"); }, []);
  const ended = phase !== "play";
  const ends = line && lineEnds(line);

  return (
    <GameModal
      open={open}
      onClose={onClose}
      onBack={phase === "done" ? () => setPhase("score") : null}
      label="Tic-Tac-Toe"
      game
      instructions={ended ? null : INSTRUCTIONS}
      stars={ended ? null : outcome ? RESULT[outcome].stars : 0}
      hud={!ended}
      confirm={ended ? "completed" : board.some(Boolean) && !outcome ? "game" : null}
    >
      {phase === "done" && quote ? (
        <Completion quote={quote} onPlayAgain={reset} />
      ) : phase === "score" ? (
        <ScoreScreen badge="Well played" label="Round completed" value={RESULT[outcome].value} stars={RESULT[outcome].stars} onDone={toQuote} />
      ) : (
        <div className="flex flex-1 items-center justify-center px-[15px] py-8 lg:items-start lg:pb-[3vw] lg:pt-[4.6vw]">
          {/* MM-G03-02 (11 Nov): 175 px squares at 1920, 1 px #969696 lines; played squares stay grey (Marta, 11 Nov 19:50) */}
          <div className="relative grid w-[92.8%] max-w-[420px] grid-cols-3 gap-px border border-[#969696] bg-[#969696] lg:w-[27.4vw] lg:max-w-none" role="grid" aria-label="Tic-Tac-Toe board">
            {board.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => play(i)}
                disabled={!!v || busy}
                aria-label={v ? (v === "X" ? "X" : "Apple") : `Empty square ${i + 1}`}
                className={`flex aspect-square items-center justify-center overflow-hidden bg-[#F0F0F0] transition-colors duration-300 ${
                  !v && !busy ? "cursor-pointer hover:bg-white/60" : "cursor-default"
                }`}
              >
                {v && <Symbol who={v} />}
              </button>
            ))}
            {ends && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 3 3" aria-hidden="true">
                <line
                  x1={ends[0]} y1={ends[1]} x2={ends[2]} y2={ends[3]}
                  stroke={PINK} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"
                  className="mm-draw-line" pathLength="1"
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </GameModal>
  );
}
