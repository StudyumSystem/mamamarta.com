# 06 — Game 02: Memory Match (MM-GAME-02)

Figma PNGs: MM-G02-00_Homepage Entry, MM-G02-01_Desktop Default, MM-G02-02_Desktop Active, MM-G02-03_Desktop Completed, MM-G02-04_Mobile Default. Card fronts: 1.png–10.png (queen, ice cream, balloon dog, heart, lipstick, lollipop, asterisk, cherries, dice, knotted bag). Card back: pink fur texture (**separate export needed**).
Missing in Figma (to be made from existing design): MM-G02-05 Mobile Active, MM-G02-06 Mobile Completed.
Status: Old draft (5 pairs) must be rebuilt to this spec.

## Screen
- Play opens the game straight away (no intro, no Start). Modal over the blurred Homepage.
- Instructions: "Find the matching pairs. Flip two cards at a time and remember what you see. Match all 10 pairs to complete the game."
- 20 cards: 5 × 4 on desktop, 4 × 5 on mobile; all face down; counter 0/10 top right; no timer.

## Logic
- [ ] 10 images × 2, shuffled every round.
- [ ] 3D flip ~250–350 ms; max two face up; match stays up (subtle confirm), counter +1; mismatch flips back after ~900 ms; input locked meanwhile; clicks on revealed or matched cards ignored.
- [ ] Complete at 10/10: show all 20 briefly, fade to the completed screen.
- [ ] Back or close resets; reopening starts at 0/10.
- [ ] Play again: same 10 images, new shuffle, 0/10, straight to the grid.

## Completed screen
- Quote 1: "I need my memories. They are my documents." — Louise Bourgeois (+3 more, **missing**).
- Play again · Let's talk (WhatsApp) · Back.

## Acceptance
- [ ] Opens from slider item 02 (second segment pink). [ ] No intro. [ ] 10 pairs, shuffled. [ ] Max two revealed. [ ] ~900 ms flip back. [ ] Counter to 10/10. [ ] Quotes rotate. [ ] Back resets, slider and scroll kept. [ ] Desktop and mobile match Figma.
