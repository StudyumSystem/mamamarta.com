import React, { useEffect, useState } from "react";
import MenuEyeIcon from "./MenuEyeIcon";
import { WHATSAPP_URL } from "./games/shared";

const navLinks = [
  { href: "/library", label: "Library" },
  { href: "#my-system", label: "My System" },
  { href: "#what-is", label: "What is" },
  { href: "#mindset", label: "The Mindset" },
  { href: "/bio", label: "Bio" },
  { href: "#contact", label: "Contact" },
];

// The homepage section the visitor is looking at, so the menu shows it in bold (04 Mobile Navigation).
function sectionInView() {
  let current = null;
  if (typeof document === "undefined") return current;
  for (const id of ["my-system", "what-is", "mindset", "contact"]) {
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
    <section id="hero" className="relative max-h-screen overflow-hidden bg-slate-950 text-white">
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

        <div className="z-50 flex flex-col items-center justify-center text-center pt-18 md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="flex flex-col items-center text-white"
          >
            <MenuEyeIcon isMenuOpen={false} color={"white"} />
            <span className="mt-1 text-[18px] font-medium">menu</span>
          </button>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-center rounded-lg h-[10vh] lg:h-[13.7vh] items-end">
          <ul className="flex flex-wrap justify-center font-light lg:font-normal text-white gap-x-6 lg:gap-x-[clamp(20px,1.4vw,27px)]">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a className="sm:text-lg lg:text-[clamp(16px,1.146vw,22px)] transition-all duration-300 hover:font-bold hover:text-white" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop positions from MM-HOME-001 (1920x1080): logo top 307 px, tagline at 470, quote at 623, button at 804. */}
        <div className="flex flex-1 flex-col items-center text-center justify-center lg:justify-start rounded-lg lg:py-0 lg:pt-[14.7vh] max-h-screen py-[5em]">

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

            <p className="lg:mt-[3vh] mt-4 text-[18px] font-light tracking-[-0.01em] lg:font-light lg:tracking-[-0.015em] lg:text-[clamp(28px,2.24vw,43px)] lg:leading-[1.28] text-white">
              Design house for digital products.
            </p>
          </div>

          <div className="w-full max-w-2xl p-[5em] lg:p-0 lg:mt-[9vh] lg:max-w-none">
            <p className="font-light text-white mx-auto w-[56vw] text-[11.5px] leading-[1.4] lg:tracking-normal lg:text-[clamp(20px,1.67vw,32px)] lg:leading-[1.28] lg:w-[29.4vw] lg:max-w-[565px]">
              "Don't think about making art, just get it done. Let everyone else decide if it's good or bad..." — Andy Warhol
            </p>

            <div className="flex flex-wrap justify-center mt-10 lg:mt-[5.5vh]">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 lg:px-6 lg:py-0 lg:justify-center lg:min-w-[clamp(220px,15.4vw,296px)] lg:min-h-[clamp(50px,3.54vw,68px)] lg:text-[clamp(16px,1.146vw,22px)] lg:font-semibold group flex items-center rounded-xs border border-white/20 font-medium backdrop-blur-md transition-all duration-300"
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)'}
                style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
              >
                Book a Discovery Call <span className="transition-transform group-hover:translate-x-1 ml-1">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {!isMenuOpen && <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-button fixed bottom-[5vh] right-[2.5vw] z-20 grid h-12 w-12 lg:h-[clamp(48px,3.54vw,68px)] lg:w-[clamp(48px,3.54vw,68px)] place-items-center rounded-full border border-white/20 text-white shadow-lg shadow-black/30 backdrop-blur-md transition"
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
          className="h-5 w-5"
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
