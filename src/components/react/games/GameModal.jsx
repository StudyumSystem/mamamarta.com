import React, { useCallback, useEffect, useRef, useState } from "react";
import { WHATSAPP_URL, prefersReducedMotion, totalStars, savedStars, markStarsSaved, unsavedStars } from "./shared.js";
import { soundOn, setSound } from "./sound.js";
import { sendStars } from "../forms/submitForm.js";

// Shared modal for the five games and the two forms (Marta's spec, MM-GAME-01…05, MM-C06).
// Desktop: panel over the blurred, dimmed Homepage, Back top-left, instructions top-centre, counter top-right.
// Mobile: inset panel, instructions on top, Back at the bottom.
// Opening tells the Homepage slider to pause; closing tells it to resume.
// 11 Nov (her updated game frames MM-G01…G05, MM-confirmation_dialog): the game panel is light grey #F0F0F0,
// with the music button (sound on/off) and the MM✦ count on the right; Back during a round asks
// "Leave the game?"; every round ends on a score screen with a timer line, then the quote screen with MM✦STARS.

export const PINK = "#F600A9";

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
const TrophyIcon = () => (
  <svg className="h-[18px] w-[18px] lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
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
export function SoundButton({ className = "" }) {
  const [on, setOn] = useState(false);
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
      className={`inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[1px] bg-[#FEF6FB] transition-colors hover:bg-[#fde3f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F600A9] lg:h-[clamp(40px,2.6vw,50px)] lg:w-[clamp(40px,2.6vw,50px)] ${className}`}
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
      className="mm-fade-in fixed inset-x-[20px] top-[28px] bottom-[28px] z-20 flex items-center justify-center bg-white/[0.78] px-[25px] lg:inset-x-[13.5%] lg:top-0 lg:bottom-0"
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
        <div className="mt-[30px] flex w-full flex-col gap-[15px] lg:mt-[clamp(28px,2.4vw,46px)] lg:w-[clamp(360px,22.8vw,437px)] lg:flex-row lg:gap-[clamp(14px,1.1vw,21px)]">
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
    const skip = () => done.current?.(); // "Save my Stars" from the leave question: straight to the email field
    window.addEventListener("mm-stars-save", skip);
    return () => { clearTimeout(t); window.removeEventListener("mm-stars-save", skip); };
  }, [ms]);
  const still = prefersReducedMotion();
  return (
    <div className="mm-fade-in flex flex-1 flex-col items-center justify-center px-[25px] text-center" role="status">
      <div className="flex w-full max-w-[300px] flex-col items-center lg:max-w-[clamp(400px,26.25vw,504px)]">
        {badge && (
          <p className="inline-flex items-center gap-[6px] text-[14px] leading-[31px] text-black/[0.69] lg:text-[clamp(14px,0.833vw,16px)]">
            <TrophyIcon /> {badge}
          </p>
        )}
        <p className="mt-[6px] text-[12px] leading-[20px] text-black/60 lg:mt-[clamp(6px,0.52vw,10px)] lg:text-[clamp(14px,0.833vw,16px)] lg:leading-[1.2] lg:text-black/[0.69]">{label}</p>
        <p className="mt-[4px] whitespace-nowrap text-[60px] font-medium leading-[73px] text-black lg:mt-[clamp(18px,1.6vw,30px)] lg:text-[clamp(60px,4.58vw,88px)] lg:leading-[1.22]">{value}</p>
      </div>
      <div className="mt-[52px] w-full max-w-[229px] lg:mt-[clamp(60px,5.5vw,105px)] lg:max-w-[clamp(380px,25.26vw,485px)]">
        <div className="mx-auto w-fit text-left">
          <p className="inline-flex items-center gap-[10px] whitespace-nowrap text-[18px] leading-[31px] text-black lg:gap-[clamp(8px,0.6vw,12px)] lg:text-[clamp(22px,1.5625vw,30px)]">
            {stars} MM✦STARS <StarBadge className="h-[24px] w-[24px] lg:h-[clamp(30px,1.98vw,38px)] lg:w-[clamp(30px,1.98vw,38px)]" />
          </p>
          {/* her Desktop_Score: this text sits in the 271 px column of the MM✦STARS line at 16/20, two lines. Its
              width is now in em (271 / 16), so it wraps exactly as hers on every screen; in px it hit its minimum
              before the type did and broke into three lines (Marta, 11 Nov 19:46) */}
          <p className="mt-[4px] max-w-[229px] text-[12px] leading-[20px] text-black/60 lg:mt-[clamp(10px,1vw,20px)] lg:max-w-[18.2em] lg:text-[clamp(14px,0.833vw,16px)] lg:leading-[1.25] lg:tracking-[-0.01em] lg:text-black/[0.69]">
            Great work! Your Stars can unlock a discount on your next design project.
          </p>
        </div>
        <div className="relative mt-[22px] h-[2px] w-full bg-black/[0.17] lg:mt-[clamp(28px,2.4vw,46px)]" aria-hidden="true">
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
    <form onSubmit={submit} noValidate className="flex w-full max-w-[300px] flex-col items-stretch gap-[16px] lg:max-w-[clamp(420px,27.4vw,526px)] lg:gap-[clamp(20px,1.67vw,32px)]">
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
export default function GameModal({
  open, onClose, instructions, counter, label, children, phoneCounter = "mt-3",
  game = false, stars = null, hud = true, confirm = null, onBack = null,
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
  const [fit, setFit] = useState(1);
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const w = window.innerWidth, h = window.innerHeight;
      setFit(w >= 1024 ? Math.min(1, (h / 1060) / (w / 1920)) : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={requestClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute inset-x-[20px] top-[28px] bottom-[28px] flex flex-col overflow-y-auto outline-none lg:inset-x-[13.5%] lg:top-0 lg:bottom-0 ${game ? "bg-[#F0F0F0]" : "bg-white"}`}
      >
        {/* top row: Back (desktop), instructions, counter */}
        <div className="relative flex items-start gap-6 px-[15px] pt-[22px] lg:px-[3.2vw] lg:pt-[3.1vw]" style={fit < 1 ? { zoom: fit } : undefined}>
          {/* measured on the 2x frames (MM-G01…G05 Default): text from 615 px, Inter 400 ~20.5/31 px, lines break as in the frames */}
          <BackLink onClick={requestClose} className={`hidden lg:block ${game ? "lg:w-[12.9vw]" : "lg:w-[14.1vw]"} shrink-0 text-left`} />
          <p className={`flex-1 ${game ? "text-[14px] text-black/60 lg:max-w-[33.6vw] lg:text-[clamp(15px,1.146vw,22px)] lg:leading-[1.41] lg:text-black/[0.69]" : "text-[15px] text-black/70 lg:max-w-[35.8vw] lg:text-[clamp(15px,1.06vw,21px)] lg:leading-[1.5] lg:text-black/70"} leading-[20px] tracking-[-0.02em] lg:tracking-normal lg:whitespace-pre-wrap font-normal`}>
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
          /* phone (her MM-G0x Mobile): music button left, MM✦ in the middle, counter right */
          <div className="mt-[18px] flex items-center justify-between px-[15px] lg:hidden">
            <SoundButton />
            <span className="text-[16px] leading-[22px]" style={{ color: PINK }}>{starsText}</span>
            <span className="min-w-[38px] text-right text-[16px] leading-[20px] text-black/60" aria-live="polite">{counter}</span>
          </div>
        ) : (
          counter != null && phoneCounter && (
            <span className={`${phoneCounter} self-end px-[15px] text-[16px] leading-[20px] font-normal text-black/70 lg:hidden`} aria-live="polite">{counter}</span>
          )
        )}
        <div className="flex flex-1 flex-col" style={fit < 1 ? { zoom: fit } : undefined}>{children}</div>
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
