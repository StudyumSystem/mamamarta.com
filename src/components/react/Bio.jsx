import React from "react";
import { TopBack, BottomBack } from "./InnerNav";

// Bio page, rebuilt from Marta's Figma frames "Bio" and "iPhone Bio" (26 Oct 2026): one centred column
// (710px wide at 1920), photo, caption, title, story, two photos, closing lines.
// Computer sizes are her 2x frame halved (1920 wide) and written in --u (global.css, .mm-u), so the whole
// page shrinks with the screen: on a 1440 laptop it is 3/4 of the 1920 size, exactly like her frame
// scaled to that screen (Marta, 28 Oct 16:45: "everything giant"). Phone sizes stay in px.

const story = [
  // Line breaks marked md:hidden are the ones in her phone frame (MM-BIO-02)
  <>
    A dark room. Her mother switches on an old projector,<br className="md:hidden" /> and a square of light appears on<br className="md:hidden" /> the wall. It felt like light itself could tell stories.
  </>,
  // The break with "hidden md:inline" is the one in her computer frame (MM-BIO-01)
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

// Texts and sizes from her current frames MM-BIO-01 / MM-BIO-02 (Figma node 1053:359, 12 Nov)
const partners = [
  "The strongest brands evolve without losing what makes them recognizable. Marta brings that same thinking into every partnership. She works with people who value clarity, trust, and a visual language that can grow with their ambitions.",
  "She has a particular affinity for women founders and women-led ventures, especially those challenging established ways of thinking.",
];

// MM-BIO: 22/34 at 1920 and 14/20 on the phone, black at 69-70 percent (#4f4f4f); the phone set
// tighter than the font's own spacing, so its lines break where hers do (28 Oct).
const body = "text-[14px] leading-[20px] tracking-[-0.04em] text-[#4f4f4f] md:text-[length:calc(var(--u)*22)] md:leading-[calc(var(--u)*34)] md:tracking-[-0.01em]";

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
      {/* The same Back as The Method, same place (12 Nov) */}
      <TopBack />

      {/* phone: 88 px = the photo where it was under the Back that used to sit in the flow (24 + 21 + 43) */}
      <main className="mx-auto w-[calc(100%-42px)] max-w-[710px] md:max-w-[calc(var(--u)*710)] pt-[88px] md:pt-[calc(var(--u)*125)] pb-[40px] md:pb-[calc(var(--u)*150)]">
        <img
          src="/assets/brand/image 46.webp"
          width="710"
          height="1011"
          alt="Marta in front of a white wall with arched niches"
          className="w-full aspect-[348/499] md:aspect-[709/1010] object-cover"
        />

        <p className="mt-[26px] md:mt-[calc(var(--u)*52)] text-center uppercase text-[14px] md:text-[length:calc(var(--u)*22)] tracking-[0.02em] text-[#666] md:text-[#808080]">
          Mamamarta — The person behind
        </p>

        <h1 className="mt-[28px] md:mt-[calc(var(--u)*66)] text-center text-[32px] md:text-[length:calc(var(--u)*50)] leading-none font-normal text-black">
          M’s Lens
        </h1>
        <p className="mt-[16px] md:mt-[calc(var(--u)*30)] text-center text-[12px] md:text-[length:calc(var(--u)*18)] text-[#666] md:text-[#4f4f4f]">
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
          {/* MM-BIO-01 sets this line like the text below it (22/34); her phone frame at 17 px */}
          <p className="text-[17px] leading-[20px] md:leading-[calc(var(--u)*34)] text-[#4d4d4d] md:text-[length:calc(var(--u)*22)] md:text-[#4f4f4f]">
            {/* "Care." in italic on the computer only, as in her two frames */}
            MAMAMARTA is built on one idea. <span className="md:italic">Care.</span>
          </p>
          <p className={`mt-[32px] md:mt-[calc(var(--u)*35)] ${body}`}>
            A space where ideas are understood before they’re shaped. Where the light goes on before anyone reaches for a pen.
          </p>
        </div>

        <div className="mt-[60px] md:mt-[calc(var(--u)*125)] text-center">
          <BottomBack />
        </div>
      </main>
    </div>
  );
}
