import React from "react";
import InnerNav, { PhoneBack, BottomBack } from "./InnerNav";

// Bio page, rebuilt from Marta's Figma frames "Bio" and "iPhone Bio" (26 Oct 2026): one centred column
// (710px wide at 1920), photo, caption, title, story, two photos, closing lines.
// Computer sizes are her 2x frame halved (1920 wide) and written in --u (global.css, .mm-u), so the whole
// page shrinks with the screen: on a 1440 laptop it is 3/4 of the 1920 size, exactly like her frame
// scaled to that screen (Marta, 28 Oct 16:45: "everything giant"). Phone sizes stay in px.

const story = [
  // Line breaks marked md:hidden are the ones in her phone frame (MM-BIO-02)
  <>
    A dark room. Her mother switches on an old projector,<br className="md:hidden" /> and a square<br className="hidden md:inline" /> of light appears on<br className="md:hidden" /> the wall. It felt like light itself could tell stories.
  </>,
  // Breaks with "hidden md:inline" are the ones in her computer frame (MM-BIO-01)
  <>
    She grew up in Lviv, in a family of artists. Painting, photography, composition, these were words she heard before she could read. Balance, proportion, color, these were never a course she took.<br className="hidden md:inline" /> They are the language she thinks in.
  </>,
  "Dyslexia shaped how she processes the world. Instead of long blocks of text, she learned to think in images, compress complexity into clarity, and find shape where others see chaos. What was long mistaken for a difficulty became one of her sharpest skills.",
  "Today she pairs that artistic foundation with modern tools, AI included, moving fast without losing originality or strategy.",
  <>
    {/* On the phone this first sentence stands on its own line */}
    <span className="block mb-[20px] md:inline md:mb-0">Her philosophy is simple. </span>
    Design is not a deliverable, frozen the moment<br className="md:hidden" /> it ships. It's the projector that keeps running, casting new light as the company grows, a living system, not a single shot.
  </>,
];

const partners = [
  "The strongest brands in the world already think this way. Their design systems evolve while their identity stays intact. That's the thinking Marta brings into every partnership. She works best with ambitious startups, universities, investment funds, founders, and high-net-worth individuals who need more than something beautiful. They need clarity, trust, and a story people can follow.",
  "She has a particular affinity for women founders and women-led ventures, builders reshaping their industries who need a visual language as bold as the work itself.",
];

// Measured side by side with her 2x frames (28 Oct): 20.5/34 at 1920 and 14/20 on the phone, both set
// tighter than the font's own spacing, so every line breaks where hers does.
const body = "text-[14px] leading-[20px] tracking-[-0.04em] text-[#4f4f4f] md:text-[length:calc(var(--u)*20.5)] md:leading-[calc(var(--u)*34)] md:tracking-[-0.01em] md:text-[#5c5c5c]";

function Paragraphs({ items }) {
  return (
    <div className="flex flex-col gap-[20px] md:gap-[calc(var(--u)*34)] mr-[7px] md:ml-[calc(var(--u)*30)] md:mr-[calc(var(--u)*-2)]">
      {items.map((text, i) => (
        <p key={i} className={body}>{text}</p>
      ))}
    </div>
  );
}

export default function Bio() {
  return (
    <div className="mm-u relative font-sans">
      <div className="px-[21px] pt-[24px] md:hidden">
        <PhoneBack />
      </div>
      <InnerNav active="Bio" />

      <main className="mx-auto w-[calc(100%-42px)] max-w-[710px] md:max-w-[calc(var(--u)*710)] pt-[43px] md:pt-[calc(var(--u)*125)] pb-[40px] md:pb-[calc(var(--u)*150)]">
        <img
          src="/assets/brand/image 46.webp"
          width="710"
          height="1011"
          alt="Marta in front of a white wall with arched niches"
          className="w-full aspect-[348/499] md:aspect-[709/1010] object-cover"
        />

        <p className="mt-[26px] md:mt-[calc(var(--u)*52)] text-center uppercase text-[12.5px] md:text-[length:calc(var(--u)*20.5)] tracking-[0.02em] text-[#555] md:text-[#7d7d7d]">
          Mamamarta — The person behind
        </p>

        <h1 className="mt-[28px] md:mt-[calc(var(--u)*66)] text-center text-[30px] md:text-[length:calc(var(--u)*45)] leading-none font-normal text-black">
          M’s Lens
        </h1>
        <p className="mt-[16px] md:mt-[calc(var(--u)*30)] text-center text-[11px] md:text-[length:calc(var(--u)*16.5)] text-[#555] md:text-[#444]">
          A story shaped by light, art, and intuition.
        </p>

        <div className="mt-[32px] md:mt-[calc(var(--u)*50)]">
          <Paragraphs items={story} />
        </div>

        <div className="mt-[36px] md:mt-[calc(var(--u)*80)] grid grid-cols-2 gap-[22px] md:gap-[calc(var(--u)*28)]">
          <img
            src="/assets/brand/image 47.webp"
            width="341"
            height="648"
            alt="Marta behind a camera in the studio"
            className="w-full aspect-[160/271] md:aspect-[341/648] object-cover"
          />
          <img
            src="/assets/brand/image 48.webp"
            width="341"
            height="648"
            alt="Marta drawing a circle in a sketchbook"
            className="w-full aspect-[160/271] md:aspect-[341/648] object-cover"
          />
        </div>

        <div className="mt-[25px] md:mt-[calc(var(--u)*82)]">
          <Paragraphs items={partners} />
        </div>

        <div className="mt-[34px] md:mt-[calc(var(--u)*70)] md:ml-[calc(var(--u)*30)]">
          <p className="text-[15.5px] md:text-[length:calc(var(--u)*28)] leading-snug text-[#4f4f4f] md:text-[#222]">
            {/* "Care." in italic on the computer only, as in her two frames */}
            MAMAMARTA is built on one idea. <span className="md:italic">Care.</span>
          </p>
          <p className={`mt-[32px] md:mt-[calc(var(--u)*35)] ${body}`}>
            A space where ideas are understood before they’re shaped, where<br className="hidden md:inline" /> the light goes on before anyone reaches for a pen.
          </p>
        </div>

        <div className="mt-[60px] md:mt-[calc(var(--u)*125)] text-center">
          <BottomBack />
        </div>
      </main>
    </div>
  );
}
