import React, { useEffect, useRef } from "react";
import { WHATSAPP_URL } from "./shared.js";

// Shared modal for the five games and the two forms (Marta's spec, MM-GAME-01…05, MM-C06).
// Desktop: white panel over the blurred, dimmed Homepage, Back top-left, instructions top-centre, counter top-right.
// Mobile: inset panel, instructions on top, Back at the bottom.
// Opening tells the Homepage slider to pause; closing tells it to resume.

export function emitModal(open) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("mm-modal", { detail: { open } }));
}

function BackLink({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[17px] lg:text-[clamp(16px,1.15vw,22px)] font-light text-black/55 underline underline-offset-[6px] decoration-1 transition-colors hover:text-black ${className}`}
    >
      Back
    </button>
  );
}

const RepeatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </svg>
);
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h16v12H8l-4 4z" />
  </svg>
);

// Completion screen shared by all games: quote, author, Play again (outlined) and Let's talk (gradient → WhatsApp).
export function Completion({ quote, onPlayAgain }) {
  return (
    <div className="mm-fade-in flex flex-1 flex-col items-center justify-center px-6 text-center" role="status">
      <p className="max-w-[560px] text-[22px] leading-[1.45] lg:text-[clamp(22px,1.67vw,32px)] lg:leading-[1.65] text-black">
        "{quote.text}"
      </p>
      <p className="mt-6 lg:mt-[clamp(20px,2.2vw,42px)] text-[17px] lg:text-[clamp(16px,1.15vw,22px)] font-light text-black/70">{quote.author}</p>
      <div className="mt-8 lg:mt-[clamp(24px,2.2vw,42px)] flex w-full max-w-[460px] flex-col gap-4 sm:flex-row sm:justify-center sm:gap-[clamp(14px,1.15vw,22px)]">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex h-[60px] lg:h-[clamp(54px,3.54vw,68px)] flex-1 items-center justify-center gap-3 border border-black bg-white text-[18px] lg:text-[clamp(16px,1.146vw,22px)] font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          Play again <RepeatIcon />
        </button>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="mm-gradient inline-flex h-[60px] lg:h-[clamp(54px,3.54vw,68px)] flex-1 items-center justify-center gap-3 text-[18px] lg:text-[clamp(16px,1.146vw,22px)] font-semibold text-white"
        >
          Let's talk <ChatIcon />
        </a>
      </div>
    </div>
  );
}

// phoneCounter: spacing class for the counter on phones, or false where her phone frame shows none.
export default function GameModal({ open, onClose, instructions, counter, label, children, phoneCounter = "mt-3" }) {
  const panelRef = useRef(null);
  const returnFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("mm-modal-open");
    emitModal(true);
    panelRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("mm-modal-open");
      emitModal(false);
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mm-fade-in fixed inset-0 z-50 font-[Inter]" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-[20px] top-[28px] bottom-[28px] flex flex-col overflow-y-auto bg-white outline-none lg:inset-x-[13.5%] lg:top-0 lg:bottom-0"
      >
        {/* top row: Back (desktop), instructions, counter */}
        <div className="flex items-start gap-6 px-[15px] pt-[22px] lg:px-[3.2vw] lg:pt-[3.1vw]">
          {/* measured on the 2x frames (MM-G01…G05 Default): text from 615 px, Inter 400 ~20.5/31 px, lines break as in the frames */}
          <BackLink onClick={onClose} className="hidden lg:block lg:w-[14.1vw] shrink-0 text-left" />
          <p className="flex-1 text-[15px] leading-[20px] tracking-[-0.02em] lg:tracking-normal lg:leading-[1.5] lg:max-w-[35.8vw] lg:whitespace-pre-wrap lg:text-[clamp(15px,1.06vw,21px)] font-normal text-black/70">
            {instructions}
          </p>
          <span className="hidden lg:block lg:w-[10vw] lg:ml-auto shrink-0 text-right text-[clamp(15px,1.06vw,21px)] font-normal text-black/70" aria-live="polite">
            {counter}
          </span>
        </div>
        {counter != null && phoneCounter && (
          <span className={`${phoneCounter} self-end px-[15px] text-[16px] leading-[20px] font-normal text-black/70 lg:hidden`} aria-live="polite">{counter}</span>
        )}
        <div className="flex flex-1 flex-col">{children}</div>
        <div className="flex justify-center pb-[20px] pt-6 lg:hidden">
          <BackLink onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
