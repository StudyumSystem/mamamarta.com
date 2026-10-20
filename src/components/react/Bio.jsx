import React, { useState } from "react";
import MenuEyeIcon from "./MenuEyeIcon";

export default function Bio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { href: "/", label: "Library" },
    { href: "/#typography", label: "My System" },
    { href: "/#what-is", label: "What is" },
    { href: "/#mindset", label: "The Mindset" },
    { href: "/bio", label: "Bio" },
    { href: "/#contact", label: "Contact" },
  ];
  return (
    <div>
      <div className="sm:hidden">
        <div className="flex flex-col items-center justify-center text-center pt-18">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div
              className="flex-col items-center justify-center text-center"
            >
              <MenuEyeIcon isMenuOpen={isMenuOpen} color={isMenuOpen ? "white" : "black"} />
              <span className={`mt-1 text-sm ${isMenuOpen ? "text-white" : "text-black"}`}>Menu</span>
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 flex flex-col items-center backdrop-blur-xs  pt-18"
            style={{
              background: "linear-gradient(17.88deg, rgba(0, 0, 0, 0.375) 5.86%, rgba(0, 0, 0, 0.75) 73.1%)"
            }}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div
                className="flex-col items-center justify-center text-center"
              >
                <MenuEyeIcon isMenuOpen={isMenuOpen} color={isMenuOpen ? "white" : "black"} />
                <span className={`mt-1 text-sm ${isMenuOpen ? "text-white" : "text-black"}`}>Menu</span>
              </div>
            </button>
            <div>
              <nav className="flex flex-col items-center gap-6 text-center mt-24">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-3xl font-light text-white transition-all duration-300 hover:font-bold"
                    style={{ fontWeight: link.label === 'Bio' ? 'bold' : 'normal' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

        )}
      </div>

      <div className="relative z-10 flex flex-col backdrop-blur-sm">
        <nav className="hidden md:flex justify-center rounded-lg items-end relative z-10 py-12">
          <div className="absolute left-28 sm:text-[1.5vw] transition-all duration-300 hover:font-bold hover:text-pink-500 font-light text-gray-400">
            <a href="/">Back</a>
          </div>
          <ul className="flex flex-wrap justify-center font-extralight text-gray-400 gap-x-6 sm:text-[1.5vw]">
            <div>
              <a href="/" className="transition-all duration-300 hover:font-bold hover:text-pink-500">Library</a>
            </div>
            <div>
              <a href="#typography" className="transition-all duration-300 hover:font-bold hover:text-pink-500">My System</a>
            </div>
            <div>
              <a href="#what-is" className="transition-all duration-300 hover:font-bold hover:text-pink-500">What is</a>
            </div>
            <div>
              <a href="#mindset" className="transition-all duration-300 hover:font-bold hover:text-pink-500">The Mindset</a>
            </div>
            <div>
              <a href="/bio" className="transition-all duration-300 font-bold text-pink-500">Bio</a>
            </div>
            <div>
              <a href="#contact" className="transition-all duration-300 hover:font-bold hover:text-pink-500">Contact</a>
            </div>
          </ul>
        </nav>

        {/* Main Content */}
        <main>
          <div className="flex flex-col sm:flex-row sm:pl-28 w-full justify-between p-6 sm:p-0 mt-8">
            {/* Left Column */}
            <div className="flex flex-2 flex-col mb-6 sm:mb-0">
              <div className="sm:w-[50vw] sm:pr-28">
                <h1 className="text-[14vw] sm:text-[7.5vw] font-semibold mb-4 ">M's Lens</h1>
                <p className="text-[4vw] sm:text-[1.5vw]">
                  A dark room. Her mother switches on an old projector, and a square of light appears on
                  the wall. It felt like <span className="font-bold" >light </span>itself could tell <span className="font-bold">stories</span>.
                </p>
                <br />
                <p className="text-[4vw] sm:text-[1.5vw]">
                  She grew up in Lviv, in a family of artists. Painting, photography, composition, these were words she heard before she could read. Balance, proportion, color, these were never a course she took. They are the language she thinks in.
                </p>
                <br />

                <p className="text-[4vw] sm:text-[1.5vw]">
                  Dyslexia shaped how she processes the world. Instead of long blocks of text, she learned to think in images, compress complexity into clarity, and find shape where others see chaos. What was long mistaken for a difficulty became one of her sharpest skills.
                </p>
                <br />
                <p className="text-[4vw] sm:text-[1.5vw]">
                  Today she pairs that artistic foundation with modern tools, AI included, moving fast without losing originality or strategy.
                </p>
                <div className="py-18">
                  <div className="text-[4vw] sm:text-[1.5vw]">Her <span className="font-bold">Philosophy is simple.</span></div>
                  <br />
                  <div className="text-[4vw] sm:text-[1.5vw]">Design is not a deliverable, frozen the moment it ships. It's the projector that keeps running, casting new light as the company grows, a living system, not a single shot.</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/assets/marta.png"
                alt="Marta with textured wall"
                className="object-contain"
              />
            </div>
          </div>
        </main>
      </div>
      <main className="flex flex-col w-full justify-beween">
        <div className="flex flex-col sm:flex-row justify-between sm:mt-8 items-start flex-1 sm:mb-24">
          <div className="flex flex-row flex-1">
            <div>
              <img
                src="/assets/bio-2.png"
                alt="Marta with textured wall"
                className="object-contain"
              />
            </div>
            <div className="p-4"></div>
            <div>
              <img
                src="/assets/bio-3.png"
                alt="Marta with textured wall"
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col sm:w-[50vw] p-6 sm:px-24 sm:p-0">
            <p className="text-[4vw] sm:text-[1.5vw]">
              The strongest brands in the world already think this way. Their design systems evolve while their identity stays intact. That's the thinking Marta brings into every partnership. She works best with ambitious startups, universities, investment funds, founders, and high-net-worth individuals who need more than something beautiful. They need clarity, trust, and a story people can follow.
            </p>
            <br />
            <p className="text-[4vw] sm:text-[1.5vw]">
              She has a particular affinity for women founders and women-led ventures, builders reshaping their industries who need a visual language as bold as the work itself.
            </p>
            <div className="flex flex-col w-full justify-beween h-auto sm:my-12 ">
              <div className="text-[5vw] mb-4 sm:text-[1.5vw]">MAMAMARTA is built on one idea. <span className="font-bold" >Care.</span></div>
              <div className="text-[4vw] sm:text-[1.5vw]">A space where ideas are understood before they're shaped, where the light goes on before anyone reaches for a pen.</div>
            </div>
          </div>
        </div>
      </main>
      <div className="text-[4vw] sm:text-[1.5vw] w-full items-center justify-center flex underline text-gray-400 sm:hidden sm:mb-0 mb-32 mt-12">
        <a href="/">Back</a>
      </div>
    </div>
  );
}
