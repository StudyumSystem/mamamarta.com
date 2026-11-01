# 05 — Game 01: Word Hunt (MM-GAME-01)

Figma PNGs: MM-G01-00_Homepage Entry, MM-G01-01_Desktop Default, MM-G01-02_Mobile Default, MM-G01-03_Desktop Active, MM-G01-05_Desktop Completed, MM-G01-06_Mobile Completed. Slider visual: letter M (Letter M_Mamamarta_animation.mp4).
Status: Old draft (9x9, 8 words) must be rebuilt to this spec.

## Screen
- Modal over the blurred, dimmed Homepage; slider item and scroll kept; no global navigation.
- Instructions: "Find the hidden art-inspired words. Swipe across letters horizontally or vertically. Find them all to complete the game."
- 10 × 10 grid, counter "0/10" (Figma shows "01 / 10" style at top right), no timer, no progress bar.

## Logic
- [ ] Each round: 10 different words from the pool, placed horizontally or vertically, rest random letters; validated before showing.
- [ ] Pool (20): PAPER, PENCIL, PAINT, BRUSH, INK, CANVAS, COLOR, FRAME, PHOTO, SHAPE, LINE, LIGHT, ART, DESIGN, FORM, CLAY, DRAW, PRINT, SKETCH, MUSE.
- [ ] Drag (mouse) / swipe (touch) along a straight row or column, either direction.
- [ ] Selecting turns letters pink; correct word stays pink, counter +1 (once per word); wrong selection fades back.
- [ ] Page does not scroll while selecting on mobile.
- [ ] Complete only at 10/10: show the full grid briefly, then fade to the completed screen.
- [ ] Play again: new grid, a different set of 10 (not the exact previous set), counter 0/10.

## Completed screen
- Quote 1: "Everything we see hides another thing." — René Magritte (+3 more, **missing**).
- Play again (outlined) · Let's talk (gradient → WhatsApp) · Back (closes, returns to the Founder's Challenge, slider and scroll kept).

## Acceptance
- [ ] Opens from slider item 01. [ ] Modal, no page change. [ ] Exactly 10 findable words. [ ] No timer. [ ] Counter 0/10 → 10/10 only for new words. [ ] Smooth completion. [ ] Play again resets. [ ] Let's talk opens WhatsApp. [ ] Back restores the Homepage. [ ] Desktop and mobile.
