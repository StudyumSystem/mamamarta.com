import React from "react";
import { WHATSAPP_URL } from "./games/shared";

// Footer to Marta's MM-HOME-001 / 002 (Desktop - 38, 1920x540): her darkened fur, the big white MAMA / MARTA
// logo on the left, copy + Book a Discovery Call on the right, icons and © MamaMarta 2026 on the bottom row.
// Desktop sizes in vw from the 1920 frame: logo 180-852 px, right column 1010-1634 px, 108 px top, 106 px bottom.
const buttonOff = "linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)";
const buttonOn = "linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)";

const icons = [
  { href: "https://www.linkedin.com/company/mamamarta/", src: "/assets/linkedin.png", alt: "LinkedIn" },
  { href: "https://www.instagram.com/mymamamarta/", src: "/assets/instagram.png", alt: "Instagram" },
  { href: "mailto:mymamamarta@icloud.com", src: "/assets/email.png", alt: "Email" },
];

export default function BrandSection() {
  return (
    <section id="contact" className="relative w-full overflow-hidden bg-[#5b1336] text-white">
      <div id="book" className="absolute top-0" aria-hidden="true"></div>
      {/* Her fur picture (preloaded in the page head, so it is there by the time the visitor scrolls down). */}
      <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: "url(/assets/brand/footer-mobile.png)" }} aria-hidden="true" />
      <div className="absolute inset-0 hidden bg-cover bg-center md:block" style={{ backgroundImage: "url(/assets/brand/footer-desktop.png)" }} aria-hidden="true" />

      <div className="relative z-10 flex flex-col px-6 pt-14 pb-10 md:grid md:grid-cols-[35vw_1fr] md:gap-x-[8.23vw] md:pl-[9.375vw] md:pr-[14.9vw] md:py-[5.6vw]">
        <h2 className="select-none md:self-start">
          <img src="/assets/brand/footer-logo-mobile.png" alt="MAMA MARTA" className="block h-auto w-[78vw] md:hidden" />
          <img src="/assets/brand/footer-logo.png" alt="MAMA MARTA" className="hidden h-auto w-full md:block" />
        </h2>

        <div className="mt-8 flex flex-col md:mt-0">
          <p className="text-[15px] leading-[1.41] md:text-[clamp(14px,1.146vw,22px)]">
            Design house for digital products.
            <br />
            Crafted to shape systems, interactions, and digital identity.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex w-fit items-center justify-center gap-1.5 rounded-xs border border-white/20 px-4 py-3 text-[15px] font-semibold backdrop-blur-md transition-all duration-300 md:mt-[2.3vw] md:min-h-[clamp(44px,3.54vw,68px)] md:min-w-[clamp(200px,15.4vw,296px)] md:px-6 md:py-0 md:text-[clamp(14px,1.146vw,22px)]"
            onMouseEnter={(e) => (e.currentTarget.style.background = buttonOn)}
            onMouseLeave={(e) => (e.currentTarget.style.background = buttonOff)}
            style={{ background: buttonOff }}
          >
            Book a Discovery Call <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>

          <div className="mt-10 flex flex-col gap-6 md:mt-auto md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4 md:gap-[1.35vw]">
              {icons.map((icon) => (
                <a key={icon.alt} href={icon.href} target={icon.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="-m-2 inline-flex p-2 transition-opacity hover:opacity-70">
                  <img src={icon.src} alt={icon.alt} className="h-6 w-6 md:h-[clamp(24px,1.6vw,32px)] md:w-[clamp(24px,1.6vw,32px)]" />
                </a>
              ))}
            </div>
            <p className="text-[13px] opacity-[0.84] md:text-[clamp(12px,0.94vw,18px)]">© MamaMarta 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
