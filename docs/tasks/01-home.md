# 01 — Homepage (MM-HOME) + Mobile Navigation

Figma PNGs: MM-HOME-001 Homepage _ Desktop.png, MM-HOME-002 Homepage_Mobile.png, 04 — Mobile Navigation.png, game entry frames MM-G01-00 … MM-G05-00, MM-C06 _Entry.png.
Status: Partly built (hero and closing block sized to Figma, commit 6afced5). Slider, sections and mobile still to do.

## Desktop
- Hero: updated smaller logo; quote from Figma: "Don't think about making art, just get it done. Let everyone else decide if it's good or bad..." — Andy Warhol; layout and "Book a Discovery Call →" as approved (destination still missing).
- The Founder's Challenge: two columns. Left: "M's Interface System", "The founder's challenge", "5 small games. Each one is built on a principle Marta uses in every product. Play first. Talk later.", entry label + text, 6-segment progress line, CTA. Right: carousel with 6 entries and a progressive blur/fade on its left edge.
  - 01 Word Hunt (letter M) · 02 Memory Match (card 01) · 03 Tic-Tac-Toe (black apple) · 04 The Art of Moving (walking model card) · 05 Connect the Path (glove G) · 06 Collaborate (black plus key, two CTAs).
  - Entry texts: from the MM-GXX-00 frames (e.g. "01 / WORD HUNT · 60 SEC — Think you can spot what others miss? Hidden words are waiting in plain sight. How many can you uncover?").
- What is an amazing experience: approved layout; "Wanna dive deeper? →" opens The Method.
- Platform Mind_set: no changes.
- Footer: static image (not video), darkened as in Figma.

## Slider behaviour
- [ ] 6 clickable segments; hover highlights without switching; click switches.
- [ ] Autoplay every 5 s, infinite loop (06 → 01).
- [ ] Pauses while the cursor is over the slider, resumes on leave; pauses while a modal is open.
- [ ] Image, text, progress and CTA stay in sync; smooth transitions; each entry its own animation.
- [ ] 01–05 Play opens the matching game modal; 06 "Suggest a game" opens Flow A, "Create for my brand" opens Flow B (modals, no page change).

## Mobile
- [ ] Follows MM-HOME-002; updated logo and quote.
- [ ] Founder's Challenge: all 6 entries stacked vertically, no carousel or autoplay, each animation runs, each has its own CTA; entry 06 has the two CTAs stacked.
- [ ] Footer: darkened static image.

## Mobile navigation (Homepage only)
- [ ] Eye icon + "menu" opens a full-screen overlay over the blurred, darkened Homepage; centred list; WhatsApp button hidden while open.
- [ ] Library → page · My System → Founder's Challenge · What is → What is section · The Mindset → Platform Mind_set · Bio → page · Contact → footer.
- [ ] Tap icon to open/close; tap outside the list closes; regular weight default, bold for the active item (one at a time); no hover state.
- [ ] Background does not scroll while open. Section links close the menu and scroll.
- [ ] Homepage scroll position saved when opening an inner page and restored on Back. No main navigation on inner pages.

## Responsive
- [ ] Intermediate widths adapted; no overlap or horizontal overflow; hierarchy and order kept.

## Acceptance
- [ ] Desktop and mobile match Figma. [ ] 6 slider entries. [ ] Hover highlights, click selects. [ ] Autoplay 5 s, loops, pauses on hover. [ ] Content and CTA in sync. [ ] Games 01–05 open the right game. [ ] Entry 06 CTAs open the right forms. [ ] Mobile entries vertical. [ ] Smooth animations. [ ] The Method link works. [ ] Darkened static footer image. [ ] No overflow. [ ] Keyboard navigation and reduced motion supported.
