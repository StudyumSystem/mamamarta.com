# 09 — Game 05: Connect the Path (MM-GAME-05)

Figma PNGs: MM-G05-00 Desktop (slider, glove G), MM-G05-01 Desktop Default, MM-G05-01 Mobile Default, MM-G05-02 Desktop Active, MM-G05-03 Desktop Completed. Slider visual: glove G (public/assets/google.mp4).
Missing in Figma (to be made): MM-G05-02 Mobile Active, MM-G05-03 Mobile Completed.
Status: Old draft (tile grid, levels) must be rebuilt to this spec.

Note: the dot layout drawn in the Figma frame is an illustration only (it has three dead ends, so it can't be solved in one path); every real round is generated and checked.

## Screen
- Opens straight to a playable puzzle; no intro, countdown or result screen.
- Instructions (**to confirm**): spec "Start at the pink dot. Connect all 15 dots in one continuous path. Move horizontally or vertically. Don't skip a dot." / Figma "Connect all the dots in one continuous path. Don't skip a dot. Complete the shape to finish the game."
- 15 dots on an invisible grid, one pink start; counter "01 / 15" top right.

## Generation
- [ ] Build a random self-avoiding path of 15 grid cells (adjacent, horizontal/vertical); first cell = pink start; show dots only; validate; avoid repeating the previous layout.

## Controls
- [ ] Drag through neighbours, or click/tap them one by one; both mixable in one round; releasing keeps the path.
- [ ] Valid: from the current end, to an adjacent unvisited dot, horizontal or vertical → thin pink line, dot turns pink, counter +1 (120–180 ms).
- [ ] Invalid (diagonal, non-adjacent, gap, revisit, crossing): ignored, no reset, no popup.
- [ ] Backtrack: selecting the previous dot removes the last link (dot back to black, counter −1), all the way to the start; no auto-reset on dead ends; no Undo button.
- [ ] Fast drags register in order; animations never block input; larger invisible touch targets; no page scroll while dragging.

## Completion
- [ ] At 15/15: input off, show the pink path 600–900 ms, fade to the completed screen.
- Quote 1: "You can't connect the dots looking forward; you can only connect them looking backwards." — Steve Jobs (+3 more, **missing**).
- Play again (new solvable layout, straight to Default) · Let's talk (WhatsApp).
- Back: discards the path, returns to slider position 05, no reload.

## Acceptance
- [ ] Slider 05 shows Connect the Path and the G. [ ] 15 dots, one pink. [ ] Always solvable. [ ] Drag and tap both work and mix. [ ] Only valid moves. [ ] Backtracking step by step. [ ] Counter both ways. [ ] Completion at 15. [ ] Quotes rotate. [ ] Shared components consistent. [ ] Desktop and mobile match Figma.
