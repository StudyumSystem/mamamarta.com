import React from "react";
import InnerNav, { PhoneBack } from "./InnerNav";
import { WHATSAPP_URL } from "./games/shared";

// Library page, from Marta's frames "Library" (1920x1080) and "iPhone Library" (390x844), 26 Oct 2026.
// The brush hangs from the top edge (on the computer its handle runs behind the menu); positions are
// the frames' own, in --u (.mm-fit in global.css): the whole frame is scaled to fit one screen, so the page
// never scrolls, on a 1920 monitor, a 1440 laptop or a phone (Marta, 28 Oct 16:45).
export default function LibraryPage() {
  return (
    <div className="mm-fit relative mx-auto h-[100dvh] overflow-hidden font-sans bg-white text-black">
      {/* MM-LIBRARY-01: Back without the underline */}
      <InnerNav active="Library" underline={false} />

      <img
        src="/assets/brush.png"
        width="1254"
        height="1488"
        alt="A black MAMAMARTA paint brush"
        className="absolute left-1/2 max-w-none -translate-x-1/2 top-[calc(var(--u)*-39)] w-[calc(var(--u)*460)] md:top-[calc(var(--u)*-157.5)] md:w-[calc(var(--u)*647)]"
      />

      <h1 className="absolute inset-x-0 text-center leading-none tracking-[-0.038em] top-[calc(var(--u)*552.6)] text-[length:calc(var(--u)*32)] md:top-[calc(var(--u)*664.2)] md:text-[length:calc(var(--u)*50)]">
        The paint is almost dry.
      </h1>
      <p className="absolute inset-x-0 text-center leading-none tracking-[-0.04em] text-[#7a7a7a] md:text-[#4f4f4f] top-[calc(var(--u)*598.6)] text-[length:calc(var(--u)*14)] md:top-[calc(var(--u)*732.5)] md:text-[length:calc(var(--u)*22)]">
        For private inquiries or early access, contact directly.
      </p>

      {/* "Ask Marta" opens the same WhatsApp chat as the Homepage (spec MM-LIBRARY) */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="mm-gradient group absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-[0.3em] font-semibold text-white top-[calc(var(--u)*655)] h-[calc(var(--u)*46)] w-[calc(var(--u)*148)] text-[length:calc(var(--u)*15)] md:top-[calc(var(--u)*804)] md:h-[calc(var(--u)*68)] md:w-[calc(var(--u)*208)] md:text-[length:calc(var(--u)*22)]"
      >
        {/* Short, heavy arrow as in her frames (the plain → character drew long and thin) */}
        Ask Marta
        <svg className="h-[0.9em] w-[0.9em]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
        </svg>
      </a>

      <div className="absolute inset-x-0 top-[calc(var(--u)*777.5)] text-center md:hidden">
        <PhoneBack />
      </div>
    </div>
  );
}
