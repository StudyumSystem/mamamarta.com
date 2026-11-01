# 08 — Game 04: The Art of Moving (MM-GAME-04)

Figma PNGs: MM-G04-00 Homepage Slider Position 04, MM-G04-01 Desktop Default, MM-G04-02 Desktop Countdown, MM-G04-02 Mobile Countdown, MM-G04-03 Desktop Gameplay, MM-G04-04 Desktop Result, MM-G04-05 Desktop Completion. Character: Walking_Mamamarta_animation.mp4 (walk only).
Missing mobile screens (to be made from the mobile reference): Default, Gameplay, Result, Completion.
Status: Old draft ("Mario", arrows, lives, flag) must be rebuilt to this spec.

## Flow
Homepage → Play → Default → Start → Countdown 3, 2, 1, GO → Gameplay → Fall → Result (~2.5 s, automatic) → Completion → Play again (back to Default) / Let's talk. Back at any state closes the overlay; slider stays on 04; run reset; best score kept.

## Screens
- Instruction above the frame: "Keep moving. Jump between platforms and collect pink coins. One fall ends the run."
- Default inside the frame: "Find your rhythm. / Press Space to jump." (mobile: "Tap anywhere to jump.") + "Start →".
- Countdown: pink numbers over the character on the first platform, ~1 s each, subtle fade/scale.
- Gameplay: white background, black rounded platforms, the model, pink coins, coin counter (Figma: "3 coins" top right; spec: "COINS 00" in the frame — **to confirm**).
- Result: "YOUR RUN", score, "COINS"; trophy + "New personal best" only when beating the stored best (localStorage). No buttons.
- Completion: quote 1 "Great things are done by a series of small things brought together." — Vincent van Gogh (+3 more, **missing**); Play again · Let's talk.

## Controls and logic
- [ ] Automatic forward movement; one input = one fixed-height jump (Space or click on desktop, tap on mobile); only when grounded; no input during countdown, fall or transitions.
- [ ] Platforms and coins random each run, always reachable given speed and jump time; no impossible gaps.
- [ ] Coins +1 with a quick scale/fade; score updates at once.
- [ ] Speed and spacing increase gradually and fairly; ~15 coins in a typical good run, no maximum.
- [ ] Fall: input off, short drop and fade, record score, go to Result (also with 0 coins).
- [ ] Mobile taps don't scroll the page; Back below the game area.

## Character (open item)
Needs idle, run, jump, land, fall. The video has the walk only. Proposal: idle = first frame; jump and land = a held frame moved on a natural arc; fall = the figure dropping and fading; shadow removed; feet aligned to platforms. Waiting for Marta's OK or her jump/fall poses.

## Acceptance
- [ ] Slider 04 opens the game in an overlay. [ ] Start launches the countdown. [ ] Same one-action jump on desktop and mobile. [ ] Reachable random routes. [ ] Accurate coins. [ ] Gradual difficulty. [ ] Fall ends the run. [ ] Result, then Completion automatically. [ ] Quotes rotate. [ ] Play again = new route. [ ] Let's talk = WhatsApp. [ ] Personal best kept. [ ] All mobile screens built.
