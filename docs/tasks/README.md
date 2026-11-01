# Mamamarta website — tasks

Source: Marta's spec "Mamamarta web site structure" (PDF + Google Doc, received 28 Oct 2026) and her Figma exports (PNG 2x, received 26–28 Oct 2026).
Work happens on the test copy (branch `figma-build`), shown on the preview link https://studyumsystem.github.io/. The live mamamarta.com changes only after Marta's and Igar's final OK.

## Rules (from the spec)
- Figma = source of truth for look, assets, typography, colours, spacing and copy.
- The spec = source of truth for interactions, navigation, animation and technical behaviour.
- When desktop and mobile texts differ, use the desktop wording (Marta, 26 Oct 2026).
- Nothing invented: no new visuals, animations, copy, quotes or sounds without Marta's OK. Missing items are reported, never silently replaced.
- Every interaction is checked on desktop and mobile before a task is marked done.

## Tasks
| # | File | Spec section | Status |
|---|------|--------------|--------|
| 00 | [00-global.md](00-global.md) | Global rules, gradient button flow, quote rotation | To do |
| 01 | [01-home.md](01-home.md) | MM-HOME + 04 Mobile Navigation | Partly built (hero, footer sizes) |
| 02 | [02-method.md](02-method.md) | MM-METHOD | First version built, re-check vs spec |
| 03 | [03-library.md](03-library.md) | MM-LIBRARY | First version built, re-check vs spec |
| 04 | [04-bio.md](04-bio.md) | MM-BIO | Built, re-check vs MM-BIO-01/02 |
| 05 | [05-game-01-word-hunt.md](05-game-01-word-hunt.md) | MM-GAME-01 | Rebuilt to spec 28 Oct (not committed) |
| 06 | [06-game-02-memory-match.md](06-game-02-memory-match.md) | MM-GAME-02 | Rebuilt to spec 28 Oct (images wait for the copy into public/assets) |
| 07 | [07-game-03-tic-tac-toe.md](07-game-03-tic-tac-toe.md) | MM-GAME-03 | Rebuilt to spec 28 Oct (images wait for the copy into public/assets) |
| 08 | [08-game-04-art-of-moving.md](08-game-04-art-of-moving.md) | MM-GAME-04 | Old draft, rebuild to spec |
| 09 | [09-game-05-connect-the-path.md](09-game-05-connect-the-path.md) | MM-GAME-05 | Rebuilt to spec 28 Oct (not committed) |
| 10 | [10-collaborate-forms-emails.md](10-collaborate-forms-emails.md) | MM-C06 | To do (needs backend) |

## Open items (reported to Marta, 28 Oct 2026)
1. Quotes: received 28 Oct, all 20 in [quotes.md](quotes.md). Four authors flagged to Marta (Poe/Bacon, Welty/W. C. Williams, Matisse, Leonardo); her answer pending.
2. Letter X animation: not used (Marta, 28 Oct 12:42: a stray file, ignore).
3. Game 04 jump and fall: APPROVED (Marta, 12:42): one held frame of her figure on a jump arc; fall = short drop and fade.

## Marta's answers, 28 Oct 12:42
- Copy: follow the DESKTOP Figma texts word for word wherever Figma and the spec differ: "Your idea has landed."; Flow B Figma success text; Connect the Path Figma instructions; "3 coins" counter top right; spelling as written in the desktop frames.
- WhatsApp: +380 95 417 1943 (Marta, 12:45: the old +380 93 263 0205 was wrong). Link https://wa.me/380954171943 for every WhatsApp button, "Let's talk", "Ask Marta" and (by her start, 12:44) "Book a Discovery Call".
- 12:44 "Старт": go to build; also accepts the defaults sent at 12:42: quote swaps (Welty → William Carlos Williams, Poe "(after Francis Bacon)", Matisse → Beckett "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.", Leonardo → E. M. Forster "Only connect!") and the privacy line "We use your details only to reply to you and keep them private. We never sell them. To have them deleted, write to mymamamarta@icloud.com."
- Privacy note: Marta asked me to write it (draft sent for her OK).
- Discovery Call and quote authors: she didn't understand the questions; explained again with a default.
4. Separate exports: received 28 Oct 12:23 in from-phone: Apple_0.png (Tic-Tac-Toe apple), X.png (fur X), Frame 26087403.png (Memory Match card back), Create a game for my brand_Mamamarta.png (plus key, slider 06), Email Banner Decktop.png (808x238) and Email Banner Mob.png (350x238). Apple and X include a light grey rounded frame: clip it in code. Email banners are about 1x: a 2x version would be sharper on phones (asked). Footer received 12:37: Footer_Decktop.png (3840x1080) and Footer_Mob.png (780x1688), already darkened; Footer_Logo.png and Footer_Logo_Mob.png (white MAMA MARTA on transparent). Hero logo received 12:38: Main Logo.png (white on transparent, about 1680x240), replaces the current site logo. Tic-Tac-Toe mobile screen received 12:40 (Default.png = MM-G03-04). All requested assets are in.
5. Copy differences between Figma and the spec (default: Figma, except where noted):
   - Flow A success heading: Figma "Your idea has landed." / spec "Your idea is in."
   - Flow B success text: Figma "We'll review your request and get back to you to explore how we can bring your brand experience to life." / spec "We've received your request and will get back to you to explore what we can create for your brand."
   - Connect the Path instructions: Figma "Connect all the dots in one continuous path. Don't skip a dot. Complete the shape to finish the game." / spec "Start at the pink dot. Connect all 15 dots in one continuous path. Move horizontally or vertically. Don't skip a dot." Recommended: the spec text (tells the player where to start and how to move).
   - Game 04 coin counter: Figma "3 coins" at the top right of the modal / spec "COINS 00" inside the game frame. Default: Figma.
   - Brand spelling: Figma copy has "MamaMarta" in several places; the spec says "Mamamarta".
6. Destinations: "Book a Discovery Call" has no link yet (currently `#book`). WhatsApp: the number on the current site, +380 93 263 0205, used for every "Let's talk" and "Ask Marta" unless Marta says otherwise.
7. Forms and emails: the site is static (GitHub Pages), so the two forms need a small backend, a transactional email service (e.g. Resend) with a verified mamamarta.com sender (DNS on GoDaddy), storage, spam protection and retries. Passed to Milos.
8. Privacy notice for the forms (spec: required before launch): text needed.
9. Sound effects: none (no Sound Effects spec exists).
