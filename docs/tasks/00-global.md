# 00 — Global rules

Spec: GLOBAL IMPLEMENTATION RULES, GLOBAL BUTTON ANIMATION, GLOBAL GAME COMPLETION — QUOTE ROTATION.
Status: To do.

## Gradient button flow (all black-to-pink gradient CTAs, desktop + mobile)
- [ ] One reusable component/class; CSS gradient animation, left to right, 5–7 s loop, seamless, no jump or pause.
- [ ] Exact Figma gradient colours; size, shape, radius, text and icons unchanged and still.
- [ ] Only the background moves: no zoom, pulse, glow, shimmer.
- [ ] Not on outlined, white, black or solid buttons. Existing hover/pressed/focus styles unchanged.
- [ ] Runs on mobile without hover. `prefers-reduced-motion`: static gradient.

## Shared rules
- [ ] Homepage carousel autoplay pauses while any game or form modal is open; slider position restored on close.
- [ ] Reduced motion respected everywhere; site usable without animation.
- [ ] No sound effects.
- [ ] No private keys or submission data in front-end code.
- [ ] Missing assets, destinations or content reported, never replaced silently.

## Quote rotation (all five games)
- [ ] 4 approved quotes per game (1 from the main mockup + 3 placed next to it in Figma), exact wording and author. **3 per game still missing.**
- [ ] First completion shows the mockup quote, then the next, no repeat until all 4 shown, then restart.
- [ ] Each game has its own rotation, kept for the visitor's session (also when switching games).
- [ ] Advances only on a completed round: Word Hunt 10/10 words; Memory Match 10/10 pairs; Tic-Tac-Toe every finished round (win, loss, draw); The Art of Moving every run incl. a fall with 0 coins; Connect the Path 15/15 dots.
- [ ] Not advanced on restart or exit of an unfinished round.
- [ ] Same completion layout for every quote; long quotes wrap.

## Shared game components (reuse across all five games)
Modal container and blurred, dimmed Homepage behind it; instruction typography; Back; completion screen; quote and author typography; Play again (outlined) and Let's talk (gradient, WhatsApp); transition timing.
