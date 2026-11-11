import React, { useEffect, useState } from "react";
import MemoryMatch from "./MemoryMatch.jsx";
import TicTacToe from "./TicTacToe.jsx";
import WordHunt from "./WordHunt.jsx";
import ConnectPath from "./ConnectPath.jsx";
import ArtOfMoving from "./ArtOfMoving.jsx";
import GameModal, { Completion, ScoreScreen } from "./GameModal.jsx";
import { QUOTES } from "./shared.js";

// Test pages only (/games/...): open one game straight away so Marta can try it on the preview link.
// On the real site the games open as modals from the Homepage slider.
export const GAMES = {
  "word-hunt": WordHunt,
  "memory-match": MemoryMatch,
  "tic-tac-toe": TicTacToe,
  "art-of-moving": ArtOfMoving,
  "connect-the-path": ConnectPath,
};

// ?screen=score | done | leave shows one end screen of the game without playing it (for checking her frames).
const SCORE = {
  "word-hunt": { badge: "Perfect find", label: "All words discovered", value: "10 / 10" },
  "memory-match": { badge: "Perfect find", label: "All pairs found", value: "10 / 10" },
  "tic-tac-toe": { badge: "Well played", label: "Round completed", value: "YOU WON" },
  "art-of-moving": { badge: "New personal best", label: "Coins", value: "23" },
  "connect-the-path": { badge: "New personal best", label: "All dots connected", value: "15 / 15" },
};

function EndScreen({ game, screen, onClose }) {
  useEffect(() => {
    if (screen !== "leave") return;
    const t = setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })), 50);
    return () => clearTimeout(t);
  }, [screen]);
  const [text, author] = QUOTES[game][0];
  return (
    <GameModal
      open
      onClose={onClose}
      label="Preview"
      game
      hud={screen === "leave"}
      instructions={screen === "leave" ? "Find the matching pairs. Flip two cards at a time and remember what you see. Match all 10 pairs to complete the game." : null}
      counter={screen === "leave" ? "01 / 10" : null}
      stars={screen === "leave" ? 10 : null}
      confirm={screen === "leave" ? "game" : null}
    >
      {screen === "score" ? (
        <ScoreScreen {...SCORE[game]} stars={150} ms={60000} onDone={() => {}} />
      ) : screen === "done" ? (
        <Completion quote={{ text, author }} onPlayAgain={onClose} />
      ) : null}
    </GameModal>
  );
}

export default function GamePreview({ game }) {
  const [screen, setScreen] = useState(null);
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("screen");
    if (["score", "done", "leave"].includes(s)) setScreen(s);
  }, []);
  const Game = GAMES[game];
  if (!Game) return null;
  const close = () => { window.location.href = "/"; };
  if (screen) return <EndScreen game={game} screen={screen} onClose={close} />;
  return <Game open onClose={close} />;
}
