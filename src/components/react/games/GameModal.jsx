import React, { useCallback, useEffect, useRef, useState } from "react";
import { WHATSAPP_URL, prefersReducedMotion, totalStars, savedStars, markStarsSaved, unsavedStars } from "./shared.js";
import { soundOn, setSound, play as playSound } from "./sound.js";
import { sendStars } from "../forms/submitForm.js";

// Shared modal for the five games and the two forms (Marta's spec, MM-GAME-01…05, MM-C06).
// Desktop: panel over the blurred, dimmed Homepage, Back top-left, instructions top-centre, counter top-right.
// Mobile: inset panel, instructions on top, Back at the bottom.
// Opening tells the Homepage slider to pause; closing tells it to resume.
// 11 Nov (her updated game frames MM-G01…G05, MM-confirmation_dialog): the game panel is light grey #F0F0F0,
// with the music button (sound on/off) and the MM✦ count on the right; Back during a round asks
// "Leave the game?"; every round ends on a score screen with a timer line, then the quote screen with MM✦STARS.
// 13 Nov 22:30 (Marta, voice: "every game was in a pop-up window of a greyish colour... recreate everything as it
// is in my Figma"): the game panel is her light grey #F0F0F0 popup again, on the computer and on the phone. Her
// frames: computer MM-G0x Desktop 1400 x 1019 over the home dimmed 50% black and blurred; phone MM-G0x Mobile and
// MM_Mobile _Confirmation 350 x 791, 20 px in from the sides and 28 px from the top and bottom, over the same dimmed
// home. Inside it the white is hers only: the Word Hunt board, The Art of Moving card, played Tic-Tac-Toe squares
// and Memory Match faces; the empty Tic-Tac-Toe squares are the panel's grey. The music button has her 1 px pink
// edge. "Leave the game?" covers the panel only, with her white 78% veil. The phone panel never scrolls: the play
// area takes the height left between the top rows and Back. (Before: 12-13 Nov the panel was made pure white, then
// the whole phone screen; that is what she saw as not her design.)

export const PINK = "#F600A9";

// 12 Nov (Marta, two screens of ours next to her frames 26087402 and 26087591: the board and the game card came
// out smaller than hers): the game panel was always 72.9% of the screen's width (her 1400 of 1920), while the play
// areas follow the screen's height (--mm-u). On a window wider than her frame's shape the panel kept growing
// sideways and everything in it looked small. On the computer the game panel is now her frame's shape: 1400 x 1019
// scaled to the screen's height, never wider than 72.9%, centred; the blurred Homepage shows a little more on the
// sides. The forms keep their panel.
const GAME_PANEL_X = "lg:inset-x-0 lg:mx-auto lg:w-[min(72.917vw,calc(100vh*1400/1019))]";

export function emitModal(open) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mm-modal", { detail: { open } }));
}

function BackLink({ onClick, className = "", game = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${game ? "text-[14px] font-normal text-black/60" : "text-[17px] font-light text-black/55"} lg:text-[clamp(16px,1.15vw,22px)] lg:font-light lg:text-black/55 underline underline-offset-[6px] decoration-1 transition-colors hover:text-black ${className}`}
    >
      Back
    </button>
  );
}

const RepeatIcon = () => (
  <svg className="h-[18px] w-[18px] lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </svg>
);
const ChatIcon = () => (
  <svg className="h-[18px] w-[18px] lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h16v12H8l-4 4z" />
  </svg>
);
const BackArrowIcon = () => (
  <svg className="h-[18px] w-[18px] lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 12H5" /><path d="M11 5l-7 7 7 7" />
  </svg>
);
const ControllerIcon = () => (
  <svg className="h-[18px] w-[18px] lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 7h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-3a4 4 0 0 1 4-4z" /><path d="M7 10v3M5.5 11.5h3" /><path d="M16 11h.01M18 12.5h.01" />
  </svg>
);
const TrophyIcon = ({ className = "h-[18px] w-[18px] lg:h-6 lg:w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4" /><path d="M16 6h3a3 3 0 0 1-3 4" />
    <path d="M12 13v4" /><path d="M8.5 20h7" /><path d="M10 17h4v3h-4z" />
  </svg>
);
// Her four-point star (Star 2), black on the Save button, white inside the pink badge.
export const StarIcon = ({ className = "", fill = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill={fill} d="M12 0c.9 6.4 5.1 10.9 12 12-6.9 1.1-11.1 5.6-12 12-.9-6.4-5.1-10.9-12-12C6.9 10.9 11.1 6.4 12 0z" />
  </svg>
);
// The pink round badge with the white star (Group 84: Ellipse 17 #F600A9 + Star 2).
export const StarBadge = ({ className = "" }) => (
  <span className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`} style={{ background: PINK }} aria-hidden="true">
    <StarIcon className="h-[70%] w-[70%]" fill="#fff" />
  </span>
);

// The music button (her griddy music icon on #FEF6FB): sound on/off, off until turned on, remembered.
const NoteIcon = ({ off }) => (
  <svg className="h-[18px] w-[18px] lg:h-[clamp(18px,1.25vw,24px)] lg:w-[clamp(18px,1.25vw,24px)]" viewBox="0 0 24 24" aria-hidden="true">
    <path fill={PINK} d="M20 2.5v13.2a3.3 3.3 0 1 1-2-3V7.1L9.5 8.6v9.1a3.3 3.3 0 1 1-2-3V4.6z" opacity={off ? 0.45 : 1} />
    {off && <path d="M3 3l18 18" stroke={PINK} strokeWidth="2" strokeLinecap="round" />}
  </svg>
);
// It starts as on (sound is on unless the visitor turned it off), so it never shows "off" for a moment first.
export function SoundButton({ className = "" }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(soundOn());
    const sync = (e) => setOn(!!e.detail?.on);
    window.addEventListener("mm-sound", sync);
    return () => window.removeEventListener("mm-sound", sync);
  }, []);
  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label={on ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      title={on ? "Sound on" : "Sound off"}
      className={`inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[1px] border border-[#F600A9] bg-[#FEF6FB] transition-colors hover:bg-[#fde3f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F600A9] lg:h-[clamp(40px,2.6vw,50px)] lg:w-[clamp(40px,2.6vw,50px)] ${className}`}
    >
      <NoteIcon off={!on} />
    </button>
  );
}

const btnBase =
  "inline-flex h-[46px] w-full items-center justify-center gap-3 text-[16px] font-semibold lg:h-[clamp(54px,3.54vw,68px)] lg:text-[clamp(16px,1.146vw,22px)]";
const btnOutline = `${btnBase} border border-black bg-transparent text-black transition-colors hover:bg-black hover:text-white`;
const btnGradient = `${btnBase} mm-gradient text-white`;

// "Leave the game?" / "Leave without saving?" (her MM-confirmation_dialog and MM-G01-05 variant):
// a white veil over the panel, the question, the safe choice on the right in the gradient.
// 11 Nov 19:34 (Marta: "blur the background more, as in my design"): the veil also blurs what is behind it
// strongly, so nothing of the screen underneath competes with the question.
function LeaveDialog({ kind, onLeave, onStay }) {
  const stars = kind === "stars";
  const stayRef = useRef(null);
  useEffect(() => { stayRef.current?.focus(); }, []);
  return (
    <div
      className={`mm-fade-in fixed inset-x-[20px] top-[max(28px,env(safe-area-inset-top))] bottom-[max(28px,env(safe-area-inset-bottom))] z-20 flex items-center justify-center bg-white/[0.78] px-[25px] max-lg:pt-[57px] lg:top-0 lg:bottom-0 ${GAME_PANEL_X}`}
      style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      role="alertdialog" aria-modal="true" aria-labelledby="mm-leave-title"
    >
      <div className="flex w-full max-w-[300px] flex-col items-center text-center lg:max-w-[clamp(420px,26.25vw,504px)]">
        <p id="mm-leave-title" className="text-[24px] leading-[29px] text-black lg:text-[clamp(26px,1.77vw,34px)] lg:leading-[1.5]">
          {stars ? "Leave without saving?" : "Leave the game?"}
        </p>
        <p className="mt-[8px] text-[12px] leading-[20px] text-black/60 lg:text-[clamp(16px,1.146vw,22px)] lg:leading-[1.41] lg:text-black/[0.69]">
          {stars ? "Your MMStars haven't been saved yet." : "Your progress will be lost."}
        </p>
        {/* phone, her MM_Mobile _Confirmation (1071:2552, 13 Nov): the buttons 78 under the subtitle (were 30) */}
        <div className="mt-[78px] flex w-full flex-col gap-[15px] lg:mt-[clamp(28px,2.4vw,46px)] lg:w-[clamp(360px,22.8vw,437px)] lg:flex-row lg:gap-[clamp(14px,1.1vw,21px)]">
          <button type="button" onClick={onLeave} className={btnOutline}>
            {stars ? "Leave anyway" : "Leave game"} <BackArrowIcon />
          </button>
          <button ref={stayRef} type="button" onClick={onStay} className={btnGradient}>
            {stars ? "Save my Stars" : "Keep playing"} {stars ? <StarIcon className="h-[18px] w-[18px] lg:h-6 lg:w-6" /> : <ControllerIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Score screen (her MM-G0x Desktop_Score / Mobile_Score): trophy line, what was done, the big result,
// the round's MM✦STARS, and a grey line that fills pink; when it is full the quote screen follows by itself.
// With reduced motion the line is shown full and the switch still comes after the same few seconds.
// 8 s (Marta, 11 Nov 19:34: at 4.2 s "the result went by too fast, I couldn't read it all")
export const SCORE_MS = 8000;
export function ScoreScreen({ badge, label, value, stars, onDone, ms = SCORE_MS }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current?.(), ms);
    // the round's MM✦STARS are counted in with a short run of ticks (Marta, 11 Nov 19:56)
    const c = setTimeout(() => playSound("count"), 450);
    const skip = () => done.current?.(); // "Save my Stars" from the leave question: straight to the email field
    window.addEventListener("mm-stars-save", skip);
    return () => { clearTimeout(t); clearTimeout(c); window.removeEventListener("mm-stars-save", skip); };
  }, [ms]);
  const still = prefersReducedMotion();
  // 12 Nov (Marta, her frame "Frame 26087403" next to ours: ours sat lower and its small type was bigger): on the
  // computer the score screen is now her frame scaled, like the play areas: every size in her frame's px times
  // --mm-u (see GameModal), and the block placed 280 px from the panel's top, not centred under the Back row.
  // Before, sizes were in vw with px minimums, so on a laptop the small lines and the bar stopped shrinking
  // while the rest did, and the block was centred in the space below the top row (about 60 px low).
  // Her measures (MM-G02 Desktop_Score): trophy row 31, label 16/19 at 41, result 88/107 at 89, MM✦STARS line
  // 38 tall at 299 in a 271 column, its text 16/20 at 354, the 485 line at 440. Her letter spacing: -4% on the
// small lines, -9% on the 88 px result (-3% on the phone); without it "YOU WON" ran 16% wider than hers.
// The game passes stage here too.
// Phone (14 Nov, her MM-G02-06 Mobile_Score 1071:1988): trophy 12 from the word, label 9 under the trophy row,
// result 20 under the label, the MM✦STARS line 88 under the result, its star 12 from the text.
  const u = (n) => `calc(${n}*var(--mm-u))`;
  return (
    <div className="mm-fade-in flex flex-1 flex-col items-center justify-center px-[25px] pb-[16px] text-center lg:pb-0 lg:pointer-events-none lg:absolute lg:inset-0 lg:justify-start lg:px-0 lg:pt-[var(--mm-score-top)]" style={{ "--mm-score-top": u(280) }} role="status">
      <div className="flex w-full max-w-[300px] flex-col items-center lg:w-[var(--w)] lg:max-w-none" style={{ "--w": u(504) }}>
        {badge && (
          <p className="inline-flex items-center gap-[12px] text-[14px] leading-[31px] text-black/[0.69] tracking-[-0.04em] lg:gap-[var(--g)] lg:text-[length:var(--t)] lg:leading-[var(--l)]" style={{ "--g": u(8), "--t": u(16), "--l": u(31), "--i": u(24) }}>
            <TrophyIcon className="h-[18px] w-[18px] lg:h-[var(--i)] lg:w-[var(--i)]" /> {badge}
          </p>
        )}
        <p className="mt-[9px] text-[12px] leading-[20px] text-black/60 tracking-[-0.04em] lg:mt-[var(--m)] lg:text-[length:var(--t)] lg:leading-[var(--l)] lg:text-black/[0.69]" style={{ "--m": u(10), "--t": u(16), "--l": u(19) }}>{label}</p>
        <p className="mt-[20px] whitespace-nowrap text-[60px] font-medium leading-[73px] tracking-[-0.03em] text-black lg:mt-[var(--m)] lg:text-[length:var(--t)] lg:leading-[var(--l)] lg:tracking-[-0.09em]" style={{ "--m": u(29), "--t": u(88), "--l": u(107) }}>{value}</p>
      </div>
      <div className="mt-[88px] w-full max-w-[229px] lg:mt-[var(--m)] lg:w-[var(--w)] lg:max-w-none" style={{ "--m": u(103), "--w": u(485) }}>
        {/* 12 Nov 13:34 (Marta: "Great work" must sit on the centre line, ours was left-aligned and the composition
            looked uneven): the MM✦STARS line and its text are centred, in every game */}
        <div className="mx-auto w-fit text-center lg:w-[var(--w)]" style={{ "--w": u(271) }}>
          <p className="inline-flex items-center gap-[12px] whitespace-nowrap text-[18px] leading-[31px] tracking-[-0.04em] text-black lg:gap-[var(--g)] lg:text-[length:var(--t)] lg:leading-[var(--l)]" style={{ "--g": u(12), "--t": u(30), "--l": u(38), "--i": u(38) }}>
            {stars} MM✦STARS <StarBadge className="h-[24px] w-[24px] lg:h-[var(--i)] lg:w-[var(--i)]" />
          </p>
          {/* her text box is 271 x 40 at 16/20, two lines; its width in em so it wraps as hers on every screen */}
          <p className="mt-[4px] max-w-[229px] text-[12px] leading-[20px] text-black/60 tracking-[-0.04em] lg:mt-[var(--m)] lg:w-[17em] lg:max-w-none lg:text-[length:var(--t)] lg:leading-[var(--l)] lg:text-black/[0.69]" style={{ "--m": u(17), "--t": u(16), "--l": u(20) }}>
            Great work! Your Stars can unlock a discount on your next design project.
          </p>
        </div>
        <div className="relative mt-[22px] h-[2px] w-full bg-black/[0.17] lg:mt-[var(--m)]" style={{ "--m": u(46) }} aria-hidden="true">
          <span
            className="absolute inset-y-0 left-0 block"
            style={{ background: PINK, width: still ? "100%" : 0, animation: still ? "none" : `mm-entry-timer ${ms}ms linear forwards` }}
          />
        </div>
      </div>
    </div>
  );
}

// The MM✦STARS part of the quote screen: total + "Save my Stars" → email → saved.
function StarsBlock() {
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState("idle"); // idle | email | sending | saved
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = totalStars();
    setTotal(t);
    const s = savedStars();
    if (s && s.total >= t) { setStep("saved"); setEmail(s.email || ""); }
    else if (s?.email) setEmail(s.email);
    const open = () => { window.__mmStarsSave = false; setStep((cur) => (cur === "saved" ? cur : "email")); };
    if (window.__mmStarsSave) open();
    window.addEventListener("mm-stars-save", open);
    return () => window.removeEventListener("mm-stars-save", open);
  }, []);
  useEffect(() => { if (step === "email") inputRef.current?.focus(); }, [step]);

  const submit = async (e) => {
    e?.preventDefault();
    if (step === "idle") { setStep("email"); return; }
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError("Please enter a valid email."); inputRef.current?.focus(); return; }
    setError("");
    setStep("sending");
    try {
      await sendStars(v, total);
      markStarsSaved(v, total);
      setStep("saved");
    } catch {
      setStep("email");
      setError("Something went wrong. Please try again.");
    }
  };

  const badge = "h-[24px] w-[24px] lg:h-[clamp(30px,1.98vw,38px)] lg:w-[clamp(30px,1.98vw,38px)]";
  const text = "text-[12px] leading-[18px] text-black/60 lg:text-[clamp(14px,0.833vw,16px)] lg:leading-[1.5625] lg:text-black/[0.69]";

  if (step === "saved") {
    return (
      <div className="mm-fade-in flex w-full max-w-[300px] items-center justify-between gap-4 text-left lg:max-w-[clamp(420px,27.4vw,526px)]" role="status">
        <p className={`${text} max-w-[203px] lg:max-w-[23.5em]`}>Your Stars are saved. Keep playing to collect more and unlock your design discount.</p>
        <p className="inline-flex shrink-0 items-center gap-[8px] text-[18px] leading-[31px] text-black lg:gap-[clamp(8px,0.6vw,12px)] lg:text-[clamp(22px,1.5625vw,30px)]">{total} <StarBadge className={badge} /></p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-[300px] flex-col items-stretch gap-[16px] lg:max-w-[clamp(420px,27.4vw,526px)] lg:gap-[clamp(20px,2.71vw,52px)]">
      {step === "idle" ? (
        <div className="flex items-center justify-between gap-4 text-left">
          {/* her text box is 342 x 50 at 16/25 (two lines); width in em so it wraps as hers on every screen */}
          <p className={`${text} max-w-[220px] lg:max-w-[23.5em]`}>Play all 5 games to earn MM✦STARS. Save them with your email and unlock a design discount.</p>
          <p className="inline-flex shrink-0 items-center gap-[8px] text-[18px] leading-[31px] text-black lg:gap-[clamp(8px,0.6vw,12px)] lg:text-[clamp(22px,1.5625vw,30px)]">{total} <StarBadge className={badge} /></p>
        </div>
      ) : (
        <div>
          <label htmlFor="mm-stars-email" className="sr-only">Email</label>
          <input
            ref={inputRef}
            id="mm-stars-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
            placeholder="Enter your email to save your MM Stars."
            aria-invalid={!!error}
            aria-describedby={error ? "mm-stars-error" : undefined}
            className="h-[46px] w-full border border-black/15 bg-white px-[16px] text-[14px] text-black placeholder:text-black/40 focus:border-[#F600A9] focus:outline-none lg:h-[clamp(54px,3.54vw,68px)] lg:px-[clamp(16px,1.25vw,24px)] lg:text-[clamp(16px,1.146vw,22px)]"
          />
          {error && <p id="mm-stars-error" className="mt-2 text-left text-[13px] text-[#c4007f] lg:text-[clamp(13px,0.78vw,15px)]">{error}</p>}
        </div>
      )}
      <button type="submit" disabled={step === "sending"} className={step === "idle" ? btnOutline : `${btnGradient} disabled:opacity-80`}>
        {step === "sending" ? "Saving…" : "Save my Stars"} <StarIcon className="h-[18px] w-[18px] lg:h-6 lg:w-6" />
      </button>
    </form>
  );
}

// Quote screen shared by all games: quote, author, Play again (outlined) and Let's talk (gradient → WhatsApp),
// then MM✦STARS with "Save my Stars" (her MM-G0x Desktop / Completed).
export function Completion({ quote, onPlayAgain }) {
  return (
    <div className="mm-fade-in flex flex-1 flex-col items-center justify-center px-[25px] py-8 text-center" role="status">
      <div className="flex w-full max-w-[300px] flex-col items-center lg:max-w-[clamp(440px,29.9vw,574px)]">
        <p className="text-[24px] leading-[29px] text-black lg:text-[clamp(24px,1.77vw,34px)] lg:leading-[1.5]">"{quote.text}"</p>
        <p className="mt-[8px] text-[12px] leading-[20px] text-black/60 lg:mt-[clamp(12px,1.04vw,20px)] lg:text-[clamp(16px,1.146vw,22px)] lg:leading-[1.41] lg:text-black/[0.69]">{quote.author}</p>
        <div className="mt-[20px] flex w-full flex-col gap-[15px] lg:mt-[clamp(28px,2.4vw,46px)] lg:w-[clamp(360px,22.8vw,437px)] lg:flex-row lg:gap-[clamp(14px,1.1vw,21px)]">
          <button type="button" onClick={onPlayAgain} className={btnOutline}>
            Play again <RepeatIcon />
          </button>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={btnGradient}>
            Let's talk <ChatIcon />
          </a>
        </div>
      </div>
      <div className="mt-[44px] flex w-full justify-center lg:mt-[clamp(70px,6.6vw,127px)]">
        <StarsBlock />
      </div>
    </div>
  );
}

// game: the light grey game panel with the music button and MM✦ (her 11 Nov frames); the forms keep the white panel.
// stars: the round's MM✦ so far (null hides it); confirm: "game" asks before leaving a round,
// "completed" asks only when MM✦STARS are not saved yet.
// stage (12 Nov, Marta: "the game's height doesn't match the screen, it's smaller than in my designs"): her game
// frames are 1920 x 1019 with the panel 1400 x 1019, the whole height of the screen. Sizing the play area by the
// width alone (vw) left it small on any screen less wide than hers (a laptop: 1440 x 900 drew the board at 394 of
// 900 px, hers is 525 of 1019). On the computer the panel now carries --mm-u, one of her frame's px measured
// against the screen's height (100vh / 1019), held back by the width (100vw / 1280) so a tall, narrow screen
// can't push the play area into the text or the sides. A game that passes stage draws its play area at her
// frame's place: absolute in the panel, its top and size in --mm-u (Tic-Tac-Toe 525 at 247, Word Hunt 739 at 178,
// ...). So on every screen it takes the share of the height her frame gives it; the text row above stays in vw.
export const STAGE_UNIT = "min(100vh / 1019, 100vw / 1280)";

// The phone's music row (music button, MM✦, counter), phone only.
export function PhoneHud({ stars = null, counter = null, className = "" }) {
  return (
    <div className={`${className} flex w-full items-center justify-between lg:hidden`}>
      <SoundButton className="max-lg:h-[36px] max-lg:w-[36px]" />
      <span className="text-[18px] leading-[22px]" style={{ color: PINK }}>{stars == null ? null : `${stars} MM✦`}</span>
      <span className="min-w-[36px] text-right text-[14px] leading-[20px] text-black/60" aria-live="polite">{counter}</span>
    </div>
  );
}
export default function GameModal({
  open, onClose, instructions, counter, label, children, phoneCounter = "mt-3",
  game = false, stars = null, hud = true, confirm = null, onBack = null, stage = false,
  textBox = [356, 608], phoneTextW = 305, phoneHud = true,
}) {
  const panelRef = useRef(null);
  const returnFocus = useRef(null);
  const [asking, setAsking] = useState(null); // null | "game" | "stars"

  // onBack: Back goes one screen back instead of leaving (Marta, 11 Nov 19:34: from the quote screen,
  // Back returns to the score screen).
  const requestClose = useCallback(() => {
    if (onBack) { onBack(); return; }
    if (confirm === "game") { setAsking("game"); return; }
    if (confirm === "completed" && unsavedStars()) { setAsking("stars"); return; }
    onClose();
  }, [confirm, onClose, onBack]);

  useEffect(() => { if (!open) setAsking(null); }, [open]);

  // No game may scroll (Marta, 11 Nov 19:36: "they fit the screen perfectly"). Her frames are 1920 x 1019
  // and the panel is drawn in vw, so on a wide, short screen (a laptop with the browser's bars) it grew taller
  // than the screen. On the computer the panel's content is zoomed down by how much shorter the screen is than
  // her frame's shape (1060 tall leaves a little air), so the whole game always fits; phones are unchanged.
  // The top row of a game is zoomed exactly as its panel shrinks (1019, her frame's height), so the Back, the text
  // and the music button keep their places in her frame when the panel follows the height.
  const [fit, setFit] = useState(1);
  const [fitTop, setFitTop] = useState(1);
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setFit(w >= 1024 ? Math.min(1, (h / 1060) / (w / 1920)) : 1);
      setFitTop(w >= 1024 ? Math.min(1, (h / (game ? 1019 : 1060)) / (w / 1920)) : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, game]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("mm-modal-open");
    emitModal(true);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("mm-modal-open");
      emitModal(false);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (asking) setAsking(null);
        else requestClose();
      }
      if (e.key === "Tab" && panelRef.current) {
        const scope = panelRef.current.querySelector('[role="alertdialog"]') || panelRef.current;
        const items = scope.querySelectorAll('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, asking, requestClose]);

  if (!open) return null;

  const showHud = game && hud;
  const starsText = stars == null ? null : `${stars} MM✦`;

  return (
    <div className="mm-fade-in fixed inset-0 z-50 font-[Inter]" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md [touch-action:none]" onClick={requestClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        // a game: her #F0F0F0 popup (see the top of this file), on the phone 20 px in from the sides and 28 px from
        // the top and bottom (more where the iPhone's notch or bar needs it), never scrolling while playing
        className={`absolute flex flex-col overscroll-none outline-none lg:top-0 lg:bottom-0 ${game ? `inset-x-[20px] top-[max(28px,env(safe-area-inset-top))] bottom-[max(28px,env(safe-area-inset-bottom))] bg-[#F0F0F0] max-lg:overflow-hidden lg:overflow-y-auto ${GAME_PANEL_X}` : "inset-x-[20px] top-[28px] bottom-[28px] overflow-y-auto bg-white lg:inset-x-[13.542%]"}`}
        style={{ "--mm-u": STAGE_UNIT, "--mm-p": "min(100vw / 1920, 100vh / 1019)" }}
      >
        {/* A game's text on the computer (12 Nov 13:35, Marta: the top text "looks uneven" against the board, in
            every game). In her frames it starts at the play area's left edge: Word Hunt and Memory Match 333 px from
            the panel's left, Tic-Tac-Toe, The Art of Moving and Connect the Path 356; 608 px wide (Tic-Tac-Toe
            689), 22/31, -4%, 63 px down like Back. The board is drawn around the panel's middle in --mm-u, so the
            text is too: its left is the middle minus (700 - x) in --mm-u and its type in --mm-u, so it keeps its
            place over the board and its two lines on every screen. Its top follows Back (--mm-p, the panel's scale). */}
        {game && instructions && (
          <p
            className="pointer-events-none absolute hidden whitespace-pre-wrap font-normal text-black/[0.69] lg:block lg:left-[var(--tx)] lg:top-[var(--ty)] lg:w-[var(--tw)] lg:text-[length:var(--tt)] lg:leading-[var(--tl)] lg:tracking-[-0.04em]"
            style={{
              "--tx": `calc(50% - ${700 - textBox[0]}*var(--mm-u))`,
              "--ty": "calc(63*var(--mm-p))",
              "--tw": `calc(${textBox[1]}*var(--mm-u))`,
              "--tt": "calc(22*var(--mm-u))",
              "--tl": "calc(31*var(--mm-u))",
            }}
          >
            {instructions}
          </p>
        )}
        {/* top row: Back (desktop), instructions, counter */}
        <div className={`relative flex items-start gap-6 px-[15px] pt-[22px] lg:px-[3.2vw] ${game ? "lg:gap-0 lg:pt-[3.28vw]" : "lg:pt-[3.1vw]"}`} style={fitTop < 1 ? { zoom: fitTop } : undefined}>
          {/* measured on the 2x frames (MM-G01…G05 Default): text from 615 px, Inter 400 ~20.5/31 px, lines break as in the frames.
              11 Nov 20:10, Marta: "take the design from my Figma". Her current game frames (kept Figma copy): the text box is
              608 x 62 at 22/31 with letter spacing -0.88 px (-0.04em), two lines, in every game. We had normal spacing, so
              the text ran wider and broke into three lines. Now her spacing, and the width in em of its own type
              (608/22 = 27.6em), so it breaks as hers on every screen, not by the window width.
              12 Nov (Marta: "the text everywhere stands unevenly; in all games the text has a set width and only 2 lines"):
              one place and one width for every game, from her frames MM-G03…G05: the box starts 355 px from the panel's
              left and 63 px from its top, 608 px wide (27.64em of its 22 px type), so it always breaks into the same two
              lines. It was 333 px in (her two older frames) and only capped at its width, not set to it. */}
          {/* her Back: 22 px type in a 21 px line from 63 px down (her line is tighter than ours, so the word sat 6 px low) */}
          <BackLink onClick={requestClose} className={`hidden lg:block ${game ? "lg:w-[15.31vw] lg:leading-[0.955]" : "lg:w-[14.1vw]"} shrink-0 text-left`} />
          {/* on the computer a game's text is drawn below, against the board (textBox).
              Phone (13 Nov, her MM-G01…G05 Mobile frames): the text box is 15 px in and 22 px down in the 350 panel,
              Inter 14/20, -0.56 px (-0.04em), black 60%, 305 wide (Word Hunt 320); we had -0.02em across the whole
              320, so lines broke later than hers. With her spacing and widths the lines break as in her frames. */}
          <p
            className={`${game ? "w-[var(--pw)] max-w-full text-[14px] tracking-[-0.04em] text-black/60 lg:hidden" : "flex-1 text-[15px] tracking-[-0.02em] text-black/70 lg:max-w-[35.8vw] lg:text-[clamp(15px,1.06vw,21px)] lg:leading-[1.5] lg:text-black/70 lg:tracking-normal"} leading-[20px] lg:whitespace-pre-wrap font-normal`}
            style={game ? { "--pw": `${phoneTextW}px` } : undefined}
          >
            {instructions}
          </p>
          {showHud ? (
            <>
              {/* her MM-G0x Active at 1920: counter ends 329 px from the panel's right, the music button 61 px, MM✦ under it */}
              <span className="hidden lg:block lg:absolute lg:right-[17.14vw] lg:top-[3.1vw] whitespace-nowrap text-right text-[clamp(15px,1.146vw,22px)] font-normal leading-[1.41] text-black/[0.69]" aria-live="polite">
                {counter}
              </span>
              <div className="hidden lg:flex lg:absolute lg:right-[3.2vw] lg:top-[3.1vw] flex-col items-end">
                <SoundButton />
                {starsText && <span className="mt-[clamp(50px,4.2vw,80px)] whitespace-nowrap text-[clamp(15px,1.146vw,22px)] leading-[1.41]" style={{ color: PINK }}>{starsText}</span>}
              </div>
            </>
          ) : (
            <span className="hidden lg:block lg:w-[10vw] lg:ml-auto shrink-0 text-right text-[clamp(15px,1.06vw,21px)] font-normal text-black/70" aria-live="polite">
              {counter}
            </span>
          )}
        </div>
        {showHud ? (
          /* phone (her MM-G0x Mobile): music button left, MM✦ in the middle, counter right; 13 Nov from her
             MM-G01 Mobile frame: the button 36 x 36, MM✦ Inter 18/22 pink, the counter 14/20 black 60%.
             phoneHud={false}: the game draws this row itself next to its board (PhoneHud, Tic-Tac-Toe). */
          phoneHud && <PhoneHud className="mt-[18px] px-[15px]" stars={stars} counter={counter} />
        ) : (
          counter != null && phoneCounter && (
            <span className={`${phoneCounter} self-end px-[15px] text-[16px] leading-[20px] font-normal text-black/70 lg:hidden`} aria-live="polite">{counter}</span>
          )
        )}
        {/* a stage game sizes its play area by --mm-u itself, so only the other screens are zoomed down.
            Phone (14 Nov, Marta: "many games don't fit the full screen ... there must be no scrolling while you play
            a game"): this part takes exactly the height the screen leaves between the top rows and Back, and is the
            box the games measure (100cqh = its height): each board is sized to fit it whole, so the panel never
            scrolls. Type keeps its sizes; only the board grows or shrinks with the screen.
            Games only (14 Nov 23:46, Marta's iPhone screenshot of Suggest a game: Back over the form): a form scrolls,
            and a size container doesn't grow with what's in it, so the form ran past it and Back sat mid-form. */}
        <div className={`flex flex-1 flex-col ${game ? "max-lg:min-h-0 max-lg:[container-type:size]" : ""}`} style={fit < 1 && !stage ? { zoom: fit } : undefined}>{children}</div>
        <div className="flex justify-center pb-[20px] pt-6 lg:hidden">
          <BackLink onClick={requestClose} game={game} />
        </div>
        {asking && (
          <LeaveDialog
            kind={asking}
            onLeave={() => { setAsking(null); onClose(); }}
            onStay={() => {
              const k = asking;
              setAsking(null);
              if (k === "stars") {
                // asked on the score screen, the quote screen (with the email field) comes first
                window.__mmStarsSave = true;
                window.dispatchEvent(new CustomEvent("mm-stars-save"));
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
