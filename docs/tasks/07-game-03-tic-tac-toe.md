# 07 — Game 03: Tic-Tac-Toe (MM-GAME-03)

Figma PNGs: MM-G03-00 Homepage Entry, MM-G03-01 Desktop Default, MM-G03-02 Desktop Active, MM-G03-03 Desktop Completed. Symbols: fur X and black apple (**separate exports needed**, MM-G03-07). Slider visual: black leather apple (public/assets/apple.mp4).
Missing in Figma (to be made from existing design): MM-G03-05 Mobile Active, MM-G03-06 Mobile Completed. Mobile Default MM-G03-04 = from-phone/Default.png (instructions at the top, 3 × 3 board centred, Back at the bottom).
Status: Old draft (X vs "Mama O") must be rebuilt to this spec.

## Screen
- Opens straight to the board. Instructions: "You're the X. The computer is Apple. Take turns placing your symbols. Get three in a row to win."
- Empty 3 × 3 grid; no timer, score or counter. Player always starts.

## Logic
- [ ] Player places X; board locks; short natural pause; computer places Apple on a free square.
- [ ] Win check after every move (rows, columns, diagonals); draw when full.
- [ ] Balanced AI: takes an immediate win, usually blocks, sometimes plays a weaker move; never random, never unbeatable; never moves after the end.
- [ ] Symbols appear with a subtle fade/scale; winning line highlighted briefly; draw without highlight; smooth transition to the completed screen.

## Completed screen (same for win, loss, draw)
- Quote 1: "Nothing is a mistake. There's no win and no fail. There's only make." — Corita Kent (+3 more, **missing**; never repeat the first as a stand-in).
- Play again (new board, player first) · Let's talk (WhatsApp).
- Back: closes, returns to slider position 03, unfinished round reset.

## Acceptance
- [ ] Opens from slider item 03. [ ] X first, Apple for the computer. [ ] Balanced AI. [ ] All wins and draws detected. [ ] Occupied squares blocked. [ ] One completion layout. [ ] Quotes rotate regardless of outcome. [ ] Back keeps slider position. [ ] Desktop and mobile.
