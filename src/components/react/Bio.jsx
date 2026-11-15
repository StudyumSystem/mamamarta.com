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
    A dark room. Her mother switches on an old projector,<br className="md:hidden" /> and a square<br className="hidden md:inline" /> of light appears on<br className="md:hidden" /> the wall. It felt like light itself could tell stories.
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
  // 15 Nov: her MM-BIO-01 gives "recognizable." its own paragraph
  "The strongest brands evolve without losing what makes them recognizable.",
  "Marta brings that same thinking into every partnership. She works with people who value clarity, trust, and a visual language that can grow with their ambitions.",
  "She has a particular affinity for women founders and women-led ventures, especially those challenging established ways of thinking.",
];

// MM-BIO: 22/34 at 1920 and 14/20 on the phone; 15 Nov, her numbers exactly: black 70% on the phone and 69% on the
// computer, -0.04em on both (the computer was -0.01em)
const body = "text-[14px] leading-[20px] tracking-[-0.04em] text-black/70 md:text-black/[.69] md:text-[length:calc(var(--u)*22)] md:leading-[calc(var(--u)*34)]";

function Paragraphs({ items }) {
  return (
    // 15 Nov 17:22 (her MM-BIO-01): the text is 682 wide, 15 in from the photo's left and 15 past its right
    <div className="flex flex-col gap-[20px] md:gap-[calc(var(--u)*34)] mr-[8px] md:ml-[calc(var(--u)*15)] md:mr-[calc(var(--u)*-15)]">
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

      {/* Phone, her MM-BIO-02 | Mobile (917:274, kept copy, 13 Nov): a 350 column 20 px in; photo 350 x 500 at 86;
          label 14/20 black 60% 23 below it; title 32/39 30 below; subtitle 12/20 black 60% 8 below; story 26 below,
          342 wide; photos 168 and 160 x 271 with 22 between, 34 below; then 34 / 34 / 34 to the partner text, the
          Care line and the last text; every line at -0.04em. The computer keeps its own. */}
      {/* 15 Nov 17:22, her MM-BIO-01 changed: the column is 682 (the photo 682 x 971 at 126 from the top); label
          35 under the photo, line 21; title 67 under it, 50/59; subtitle 14 under, 18/34; story 50 under; the two
          photos 328 x 622 with 26.45 between, 80 above and below; the Care block 102 under the partner text; the
          last Back 132 under it and 126 above the page's end. */}
      <main className="mx-auto w-[calc(100%-40px)] max-w-[710px] md:max-w-[calc(var(--u)*682)] pt-[86px] md:pt-[calc(var(--u)*126)] pb-[40px] md:pb-[calc(var(--u)*126)]">
        <img
          src="/assets/brand/image 46.webp"
          width="710"
          height="1011"
          alt="Marta in front of a white wall with arched niches"
          className="w-full aspect-[350/500] md:aspect-[682/971] object-cover"
        />

        <p className="mt-[23px] md:mt-[calc(var(--u)*35)] text-center uppercase text-[14px] max-md:leading-[20px] md:text-[length:calc(var(--u)*22)] md:leading-[calc(var(--u)*21)] tracking-[-0.04em] md:tracking-[-0.017em] text-black/60 md:text-black/50">
          Mamamarta — The person behind
        </p>

        <h1 className="mt-[30px] md:mt-[calc(var(--u)*67)] text-center text-[32px] md:text-[length:calc(var(--u)*50)] leading-[39px] md:leading-[calc(var(--u)*59)] tracking-[-0.04em] font-normal text-black">
          M’s Lens
        </h1>
        <p className="mt-[8px] md:mt-[calc(var(--u)*14)] text-center text-[12px] max-md:leading-[20px] md:leading-[calc(var(--u)*34)] tracking-[-0.04em] md:text-[length:calc(var(--u)*18)] text-black/60 md:text-black/[.69]">
          A story shaped by light, art, and intuition.
        </p>

        <div className="mt-[26px] md:mt-[calc(var(--u)*50)]">
          <Paragraphs items={story} />
        </div>

        <div className="mt-[34px] md:mt-[calc(var(--u)*80)] grid grid-cols-[168fr_160fr] md:grid-cols-2 gap-[22px] md:gap-[calc(var(--u)*26.45)]">
          <img
            src="/assets/brand/image 47.webp"
            width="341"
            height="648"
            alt="Marta behind a camera in the studio"
            className="w-full aspect-[168/271] md:aspect-[328/622] object-cover"
          />
          <img
            src="/assets/brand/image 48.webp"
            width="341"
            height="648"
            alt="Marta drawing a circle in a sketchbook"
            className="w-full aspect-[160/271] md:aspect-[328/622] object-cover"
          />
        </div>

        <div className="mt-[34px] md:mt-[calc(var(--u)*80)]">
          <Paragraphs items={partners} />
        </div>

        <div className="mt-[34px] md:mt-[calc(var(--u)*102)] md:ml-[calc(var(--u)*15)] md:mr-[calc(var(--u)*-15)]">
          {/* Her phone frame: 17/20 black 70%. 15 Nov, her MM-BIO-01: on the computer this line is Inter Light 300
              30/44 in full black at -0.017em ("Care." in Light Italic), the text below 32 under it */}
          <p className="text-[17px] leading-[20px] tracking-[-0.04em] text-black/70 md:text-[length:calc(var(--u)*30)] md:leading-[calc(var(--u)*44)] md:font-light md:tracking-[-0.017em] md:text-black">
            {/* "Care." in italic on the computer only, as in her two frames */}
            MAMAMARTA is built on one idea. <span className="md:italic">Care.</span>
          </p>
          <p className={`mt-[34px] md:mt-[calc(var(--u)*32)] ${body}`}>
            A space where ideas are understood before they’re shaped. Where the light goes on before anyone reaches for a pen.
          </p>
        </div>

        <div className="mt-[60px] md:mt-[calc(var(--u)*132)] md:leading-[0] text-center">
          <BottomBack className="md:inline-block md:leading-[calc(var(--bu)*21)]" />
        </div>
      </main>
    </div>
  );
}
