import React, { useEffect, useState } from "react";
import MenuEyeIcon from "./MenuEyeIcon";
import { WHATSAPP_URL } from "./games/shared";
import ArrowIcon from "./ArrowIcon";

// Marta's new home frames (9 Nov): three items only. The Method is the /what-is page; Contact scrolls to
// "We are not for everyone.".
const navLinks = [
  { href: "/what-is", label: "The Method" },
  { href: "/bio", label: "Bio" },
  { href: "#contact", label: "Contact" },
];

// Marta's reworked home (her Desktop.jpg, 11 Nov): the tagline names the pain, the two lines under it say
// for whom and what, then "Straight to Marta". The phone takes the same copy (her phone frame is older).
const TAGLINE = "Your product works. Nobody remembers it.";
const FOR_WHOM = "Design for funded startups.";
const WHAT = "Brand, product, and the story investors remember.";

// The homepage section the visitor is looking at, so the menu shows it in bold (04 Mobile Navigation).
function sectionInView() {
  let current = null;
  if (typeof document === "undefined") return current;
  for (const id of ["contact"]) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= window.innerHeight / 2) current = `#${id}`;
  }
  return current;
}

// Mobile navigation (Marta's 04 Mobile Navigation): eye icon + "menu" opens a full-screen list over the
// blurred, darkened Homepage. Tap the icon or outside the list to close; section links close and scroll;
// the page behind doesn't scroll and the WhatsApp button is hidden while it is open.
function MobileMenu({ onClose }) {
  const [active] = useState(sectionInView);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="mm-fade-in fixed inset-0 z-40 flex flex-col items-center px-6 backdrop-blur-xl md:hidden"
      style={{ background: "linear-gradient(17.88deg, rgba(0, 0, 0, 0.375) 5.86%, rgba(0, 0, 0, 0.75) 73.1%)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <button type="button" onClick={onClose} aria-label="Close menu" className="flex flex-col items-center pt-18 text-white">
        <MenuEyeIcon isMenuOpen color="white" />
        <span className="mt-1 text-[18px] font-medium">menu</span>
      </button>
      <nav className="mt-[128px] flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`flex h-[54px] items-center px-6 text-[22px] text-white ${active === link.href ? "font-bold" : "font-normal"}`}
            aria-current={active === link.href ? "true" : undefined}
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

// initialMenuOpen: only for the test page that shows the open menu.
export default function Hero({ initialMenuOpen = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(initialMenuOpen);
  const closeMenu = React.useCallback(() => setIsMenuOpen(false), []);

  return (
    // --h = one pixel of her 1920 hero in screen width. Only the GAPS use it (Marta, 11 Nov 19:54: "the spacing
    // is wrong": gaps were in screen height, type in screen width, so on a wide, short window the gaps shrank).
    // The type, logo and button keep their own sizes (Marta, 20:44: "why did you make the text smaller? put it
    // back, only the spacing between the blocks had to change").
    <section id="hero" className="relative max-h-screen overflow-hidden bg-slate-950 text-white" style={{ "--h": "calc(100vw / 1920)" }}>
      {isMenuOpen && <MobileMenu onClose={closeMenu} />}

      {/* Marta, 28 Oct 16:45: the fur looked washed out next to MM-HOME-001; richer, brighter raspberry as in her frame. */}
      <video
        className="absolute inset-0 h-full w-full object-cover object-center [filter:saturate(1.4)_brightness(1.08)_hue-rotate(-8deg)]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={'/assets/hero-bg-poster.webp'}
        src={'/assets/hero-bg.mp4'}
      ></video>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col">

        {/* Phone: one full screen laid out as MM-HOME-002 (390x844, her 2x export halved). Every position and
            size is in --p, one pixel of that frame, so the lines break and sit exactly where hers do on any phone
            (Marta, 2 Nov: "the proportions are off, not identical to my mockup"). */}
        <div className="mm-phone-u relative h-[100dvh] md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="absolute left-1/2 z-50 flex -translate-x-1/2 flex-col items-center text-white top-[calc(var(--p)*77)]"
          >
            <MenuEyeIcon isMenuOpen={false} color={"white"} />
            <span className="mt-1 text-[14px] font-normal leading-[20px]">menu</span>
          </button>
          <h1 className="contents">
            <img
              className="absolute left-1/2 h-auto max-w-none -translate-x-1/2 top-[calc(var(--p)*268)] w-[calc(var(--p)*304)]"
              src={'/assets/brand/main-logo.png'}
              width="832"
              height="123"
              alt="MAMA MARTA"
            />
          </h1>
          {/* Marta, 12 Nov 23:36 (her iPhone): "Design for funded startups…" too small to read. The type was in --p,
              which follows the screen's HEIGHT too, so in Safari (toolbars take ~100 px) the 14 px lines drew ~12 px.
              Now her phone type in plain px: the line under the logo Inter 20/29 (her frame), the two lines Inter
              Medium 16/23 (medium as on the computer), the button text 16 semibold; the blocks follow each other, so
              on a short screen they never overlap.
              14 Nov, her updated MM-HOME-002 (13 Nov): the line under the logo 20/27, the two lines Inter 400 14/20
              breaking after "product," (still plain px, so 14 on her iPhone too), the button the full 350 at 509,
              menu label 14/20 regular. */}
          <div className="absolute inset-x-0 flex flex-col items-center px-5 text-center text-white top-[calc(var(--p)*340)]">
            <p className="text-[20px] font-normal leading-[27px] tracking-[-0.04em]">
              Your product works.
              <br />
              Nobody remembers it.
            </p>
            <p className="mt-[calc(var(--p)*49)] max-w-[280px] text-[14px] font-normal leading-[20px] tracking-[-0.04em]">
              {FOR_WHOM} {WHAT}
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-[calc(var(--p)*26)] flex h-[46px] w-[350px] max-w-full items-center justify-center gap-[0.3em] rounded-xs border border-white/20 text-[16px] font-semibold tracking-[-0.023em] whitespace-nowrap text-white backdrop-blur-md"
              style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
            >
              Straight to Marta <ArrowIcon />
            </a>
          </div>
        </div>


        {/* Desktop Navigation */}
        {/* 14 Nov: her menu words are 22/21, box 126-147 of her 1920 x 1080 (they sat 5 px higher with the default line). */}
        <nav className="hidden md:flex justify-center rounded-lg h-[10vh] lg:h-[calc(var(--h)*147)] items-end">
          <ul className="flex flex-wrap justify-center font-light lg:font-normal lg:leading-[0.955] text-white gap-x-6 lg:gap-x-[calc(var(--h)*27)]">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a className="sm:text-lg lg:text-[clamp(16px,1.146vw,22px)] transition-all duration-300 hover:font-bold hover:text-white" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 12 Nov, from her current Figma hero (kept copy, frame at -12851, 29839): menu text at 126, logo 832 x 123 at
            310, tagline 43/55 at 468, the two lines Inter Medium 28/38 at 581 (676 x 76), button 312 x 68 at 712.
            Gaps between the blocks: 35 / 58 / 55 px of her 1920. Earlier values were measured on an old Desktop.jpg. */}
        <div className="max-md:hidden flex flex-1 flex-col items-center text-center justify-center lg:justify-start rounded-lg lg:py-0 lg:pt-[calc(var(--h)*162)] max-h-screen py-[5em]">

          <div className="items-center justify-center flex flex-col">
            <h1 className="contents">
              <img
                className="w-[80vw] lg:w-[clamp(480px,43.4vw,832px)] h-auto object-contain"
                src={'/assets/brand/main-logo.png'}
                width="832"
                height="123"
                alt="MAMA MARTA"
              />
            </h1>

            <p className="lg:mt-[calc(var(--h)*35.4)] mt-4 text-[18px] font-normal tracking-[-0.01em] lg:text-[clamp(28px,2.24vw,43px)] lg:leading-[1.28] lg:tracking-[-0.04em] text-white">
              {TAGLINE}
            </p>
            <p className="mt-2 lg:mt-[calc(var(--h)*58)] text-[13px] font-normal text-white lg:font-medium lg:text-[clamp(18px,1.458vw,28px)] lg:leading-[1.357] lg:tracking-[-0.0134em]">
              {FOR_WHOM}
              <br />
              {WHAT}
            </p>
          </div>

          <div className="w-full max-w-2xl p-[5em] lg:p-0 lg:mt-[calc(var(--h)*55)] lg:max-w-none">
            <div className="flex flex-wrap justify-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 lg:px-6 lg:py-0 lg:justify-center lg:min-w-[clamp(220px,16.25vw,312px)] lg:min-h-[clamp(50px,3.54vw,68px)] lg:text-[clamp(16px,1.146vw,22px)] lg:font-semibold group flex items-center rounded-xs border border-white/20 font-medium backdrop-blur-md transition-all duration-300"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)'}
                style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
              >
                Straight to Marta <ArrowIcon className="ml-[0.3em] transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {!isMenuOpen && <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-button fixed bottom-[5vh] right-[2.5vw] max-md:bottom-[27px] max-md:right-[32px] max-md:h-[50px] max-md:w-[50px] lg:bottom-[9.35vh] lg:right-[6.98vw] z-20 grid h-12 w-12 lg:h-[clamp(48px,3.54vw,68px)] lg:w-[clamp(48px,3.54vw,68px)] place-items-center rounded-full border border-white/20 text-white shadow-lg shadow-black/30 backdrop-blur-md transition"
        aria-label="WhatsApp"
        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)'}
        style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
      >
        <img
          src={'/assets/call.png'}
          alt="Call icon"
          width="20"
          height="20"
          className="h-5 w-5 max-md:h-[27px] max-md:w-[27px] lg:h-[clamp(20px,1.77vw,34px)] lg:w-[clamp(20px,1.77vw,34px)]"
        />
      </a>}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
