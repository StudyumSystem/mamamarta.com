import React from "react";
import MemoryMatch from "./MemoryMatch.jsx";
import TicTacToe from "./TicTacToe.jsx";
import WordHunt from "./WordHunt.jsx";
import ConnectPath from "./ConnectPath.jsx";
import ArtOfMoving from "./ArtOfMoving.jsx";

// Test pages only (/games/...): open one game straight away so Marta can try it on the preview link.
// On the real site the games open as modals from the Homepage slider.
export const GAMES = {
  "word-hunt": WordHunt,
  "memory-match": MemoryMatch,
  "tic-tac-toe": TicTacToe,
  "art-of-moving": ArtOfMoving,
  "connect-the-path": ConnectPath,
};

export default function GamePreview({ game }) {
  const Game = GAMES[game];
  if (!Game) return null;
  return <Game open onClose={() => { window.location.href = "/"; }} />;
}
