# 10 — Collaborate: forms and emails (MM-C06)

Figma PNGs: MM-C06 _Entry.png (slider 06), MM-C06 _Suggest a game_Decktop / _Mobile, _Suggest a game_Success_Decktop / _Mob, _Create for my brand_Decktop / _Mob, _Create for my brand_Success_Decktop / _Mob, Email_Letter_Suggest a game_Decktop / _Mob, Email_Letter_Create for my brand_Decktop / _Mob.
Status: To do. Front end can be built now; sending needs the backend (open item).

## Slider entry 06
- "WHAT IF YOUR BRAND HAD ITS OWN GAME?" / "Turn your idea into something people can play with. Suggest a game for Mamamarta or create a custom interactive experience for your brand."
- CTA 1 "Suggest a game" (white, black outline, gamepad icon) → Flow A. CTA 2 "Create for my brand" (gradient, briefcase icon) → Flow B. Keep the short label.
- Visual: black glossy plus key (static image approved; animation only if Marta supplies one). Mobile: visual above text, CTAs stacked.

## Modals
- Desktop: white modal, blurred Homepage, Back top-left, two-column form. Mobile: single column, Back at the bottom, scrolls, inputs stay visible with the keyboard.
- Back from a form: close, slider stays on 06, unsent data cleared. Back from success: close, slider on 06. "Explore the games →": close, slider to Game 01, no reload.
- Focus moves into the modal, stays inside, returns to the trigger; no background scroll; reduced motion.

## Flow A — Suggest a game
- "Your idea. Our playground." / "Have a game in mind? Share it with us. Selected ideas may come to life as part of the Mamamarta game collection."
- Name*, Email*, Company* ("Where you work"); "What kind of game do you imagine?* (Select all that apply)": Puzzle & problem-solving, Memory & matching, Words & discovery, Strategy & logic, Arcade & reflexes (at least one); Your idea (optional); marketing opt-in (unchecked, optional); Submit → (gradient).
- Success: heading **to confirm** (Figma "Your idea has landed." / spec "Your idea is in."); "Thank you for sharing your game idea. We'll review it for the Mamamarta collection. If selected, we'll contact you before bringing it to life."; "Explore the games →".
- Stored as `suggest_game`.

## Flow B — Create for my brand
- "Your brand. A new experience." / "Let's create an interactive experience shaped around your brand, your audience, and your goals."
- Same fields; "What would you like your game to achieve? * (Select all that apply)": Engage customers, Showcase our brand, Create an internal team experience, Launch a product, Explore an idea.
- Success: "Let's make something memorable." + text **to confirm** (Figma vs spec wording differ); "Explore the games →".
- Stored as `custom_brand_experience`.

## Submission
- [ ] Validate required fields, email format, at least one checkbox; inline errors; keep entered values.
- [ ] Submit disabled while sending, restrained loader; success only after the backend confirms it saved.
- [ ] Failure: "Something went wrong. Please try submitting again." — values kept.

## Emails (backend only, never from the browser)
- Internal notification to mymamamarta@icloud.com: "New Game Suggestion | {{company}}" / "New Brand Experience Inquiry | {{company}}", all fields, "Not provided" for an empty idea, visitor's email as reply-to.
- Visitor confirmation, sender name "Mamamarta", Reply-To mymamamarta@icloud.com, sent from a verified mamamarta.com address:
  - A: subject "Good ideas deserve to be played with! | Mamamarta"
  - B: subject "Something interesting starts here. | Mamamarta"
  - Copy exactly as in the spec and Email_Letter PNGs; "Hi {{first_name}}!" or "Hi there!"; signature "With care / Mamamarta / Digital Design House for Digital Products"; "Explore Mamamarta →" to https://mamamarta.com (Founder's Challenge).
  - Responsive HTML, 600 px, fur banner + white logo (hosted https images, alt text), gradient button with fallback.
- [ ] One confirmation per submission (no duplicates on double click or retry); delivery status logged; retries; submissions kept if email fails.
- [ ] Server-side validation, escaping, spam protection, rate limits; keys never in the front end; marketing opt-in never decides the confirmation.

## Needed before launch (open)
1. Backend endpoint + storage + email service (e.g. Resend) with a verified mamamarta.com sender (DNS on GoDaddy) — Milos.
2. Privacy notice text for the forms.
3. Email assets: fur banner and white logo as separate files.
