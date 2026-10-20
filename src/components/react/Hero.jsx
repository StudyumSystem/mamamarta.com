import React, { useState } from "react";
import MenuEyeIcon from "./MenuEyeIcon";

export default function Hero() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Library" },
    { href: "#typography", label: "My System" },
    { href: "#what-is", label: "What is" },
    { href: "#mindset", label: "The Mindset" },
    { href: "/bio", label: "Bio" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <section id="hero" className="relative max-h-screen overflow-hidden bg-slate-950 text-white">
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center px-6 backdrop-blur-md"
          style={{
            background: "linear-gradient(17.88deg, rgba(0, 0, 0, 0.375) 5.86%, rgba(0, 0, 0, 0.75) 73.1%)"
          }}
        >
          <div className="z-50 flex flex-col items-center justify-center text-center pt-18">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div
                className="flex-col items-center justify-center text-center"
              >
                <MenuEyeIcon isMenuOpen={isMenuOpen} color={"white"} />
                <span className={`mt-1 text-sm text-white`}>Menu</span>
              </div>
            </button>
          </div>
          <div

          >
            <nav className="flex flex-col items-center gap-4 text-center mt-18">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-2xl font-light text-white transition-all duration-300 hover:font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

      )}

      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={'/assets/hero-bg.mp4'} alt="Hero background"
      ></video>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col">

        <div className="z-50 flex flex-col items-center justify-center text-center pt-18 sm:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div
              className="flex-col items-center justify-center text-center"
            >
              <MenuEyeIcon isMenuOpen={isMenuOpen} color={"white"} />
              <span className={`mt-1 text-sm text-white`}>Menu</span>
            </div>
          </button>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-center rounded-lg h-[10vh] items-end">
          <ul className="flex flex-wrap justify-center font-light text-white gap-x-6">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a className="sm:text-lg transition-all duration-300 hover:font-bold hover:text-white" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-1 flex-col items-center text-center justify-center lg:justify-between rounded-lg lg:py-[5rem] max-h-screen py-[5em]">

          <div className="items-center justify-center flex flex-col">
            <img
              className="w-[80vw] lg:w-[80%] h-auto object-contain"
              src={'/assets/mamamarta.png'}
              alt="MAMA MARTA"
            />

            <p className="lg:mt-[1.5rem] mt-6 text-[1.6rem] font-light tracking-wide lg:text-[1.75rem] text-white">
              Design house for digital products.
            </p>
          </div>

          <div className="w-full max-w-2xl p-[5em] lg:h-[40vh]">
            <p className="font-light tracking-wide text-white mx-auto text-[4.5vw] lg:text-[1.35rem] lg:w-[50vw] lg:max-w-[320px]">
              "Marta's method makes a whole lot of a difference" – ChatGPT
            </p>

            <div className="flex flex-wrap justify-center mt-10 lg:mt-[1.5rem]">
              <a
                href="#book"
                className="px-4 py-3 lg:px-4 lg:py-2 group flex items-center rounded-xs border border-white/20 font-medium backdrop-blur-md transition-all duration-300"
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

      <a
        href="https://wa.me/+380932630205"
        className="whatsapp-button fixed bottom-[5vh] right-[2.5vw] z-20 grid h-12 w-12 place-items-center rounded-full border border-white/20 text-white shadow-lg shadow-black/30 backdrop-blur-md transition"
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
      </a>

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
