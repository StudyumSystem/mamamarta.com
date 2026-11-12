import React from "react";
import InnerNav, { PhoneBack } from "./InnerNav";

// The method page (/what-is), from Marta's frames "MM-METHOD / Desktop" (1920 wide) and "MM-METHOD / Mobile"
// (390 wide). 11 Nov 19:31, Marta: "this page is still gigantic, it must be smaller, as in my design". It was
// built in fixed px of her 1920 frame, so on a laptop everything came out a third too big. Now the computer
// sizes are her 1920 px drawn in vw (px / 19.2), like the home page, so every screen width keeps her
// proportions; the phone keeps her 390 px sizes. Texts are her current Figma wording (11 Nov), and the text
// wraps by itself in a column the width of hers. Spacing: [phone px, computer px of the 1920 frame].

const vw = (n) => `${+(n / 19.2).toFixed(4)}vw`;

const stages = [
  {
    img: { src: "/assets/charcoal.png", w: 1406, h: 1802, size: [320, 703], alt: "A stick of black MAMAMARTA charcoal" },
    gap: [0, 0, 29, 3],
    label: "01 — CHARCOAL / DISCOVERY",
    title: "The First Spark",
    subtitle: "Raw potential. Light and shadow. The beginning of form.",
    paragraphs: [
      "Every idea begins with possibility, not certainty. Like charcoal on a blank surface, the first marks are exploratory. They reveal what might be worth pursuing.",
      "This is where Marta listens, questions assumptions, and looks beyond the obvious. Before there is structure, there must be understanding.",
    ],
  },
  {
    img: { src: "/assets/palette-knife.png", w: 1406, h: 1772, size: [319, 703], alt: "A MAMAMARTA palette knife" },
    gap: [82.4, 112.5, 6, 0],
    label: "02 — PALETTE KNIFE / STRUCTURE",
    title: "Shaping the Form",
    subtitle: "From possibility to intention.",
    paragraphs: [
      "An idea needs more than inspiration. It needs direction. Like a palette knife, design builds, removes, and reshapes. Every movement is deliberate.",
      "This is where possibilities become decisions. Structure emerges, hierarchy takes shape, and every element earns its place.",
    ],
  },
  {
    img: { src: "/assets/brush.png", w: 1254, h: 1488, size: [361, 627], alt: "A black MAMAMARTA paint brush" },
    gap: [73.7, 112.5, 30.4, 33],
    label: "03 — BRUSH / REFINEMENT",
    title: "The Paint Is Almost Dry",
    subtitle: "The art of knowing what matters.",
    paragraphs: [
      "The smallest details can change the entire experience. Like the final strokes of a brush, refinement brings precision and character to what has already taken shape.",
      "This is where interactions, details, and visual language come together. Nothing is added without a reason. Nothing remains simply because it was there.",
    ],
  },
  {
    img: { src: "/assets/sphere.png", w: 1176, h: 1492, size: [351, 588], alt: "A pink sphere inside a glass cube" },
    gap: [71.7, 113, 16.5, 21],
    label: "04 — THE REVEAL / RELEASE & EVOLUTION",
    title: "A Form of Its Own",
    subtitle: "From creation to presence.",
    paragraphs: [
      "A creation reaches a point where it no longer needs its maker to explain it. Like an object in a gallery, it stands on its own. Its form, purpose, and character speak for themselves.",
      "The work enters the world with an identity of its own. Clear enough to be understood. Distinct enough to be remembered. Flexible enough to evolve.",
    ],
  },
];

const foundation = [
  "Four seasons. Four elements. Four directions.",
  "Across nature and cultures, four has long represented balance and structure.",
  "Marta sees her work in much the same way. Four stages, each with its own material, rhythm, and purpose. Each shaping what comes next.",
];

// margin-top: px on the phone, vw (from her 1920 px) on the computer
const gapClass = "mt-[var(--m)] md:mt-[var(--d)]";
const gap = (m, d) => ({ "--m": `${m}px`, "--d": vw(d) });

// Both her frames set the type 4% tighter than the font's own spacing (measured side by side, 28 Oct).
function Stage({ img, gap: g, label, title, subtitle, paragraphs }) {
  return (
    <section className="px-[20px] text-center tracking-[-0.04em]">
      <img
        src={img.src}
        width={img.w}
        height={img.h}
        alt={img.alt}
        className={`mx-auto block h-auto max-w-none w-[var(--w)] md:w-[var(--wd)] ${gapClass}`}
        style={{ ...gap(g[0], g[1]), "--w": `${img.size[0]}px`, "--wd": vw(img.size[1]) }}
      />
      <p className={`uppercase leading-none text-[14px] md:text-[1.1458vw] md:tracking-[-0.02em] text-[#5e5e5e] md:text-[#7f7f7f] ${gapClass}`} style={gap(g[2], g[3])}>
        {label}
      </p>
      <h2 className={`font-normal leading-none text-black text-[32px] tracking-[-0.05em] md:tracking-[-0.04em] md:text-[2.6042vw] ${gapClass}`} style={gap(50.5, 70.7)}>
        {title}
      </h2>
      <p className={`leading-none text-[#6b6b6b] md:text-[#4f4f4f] text-[12px] tracking-[-0.03em] md:tracking-[-0.04em] md:text-[0.9375vw] ${gapClass}`} style={gap(15.8, 26.85)}>
        {subtitle}
      </p>
      <div
        className={`mx-auto flex max-w-[296px] flex-col gap-[20px] text-[14px] leading-[20px] text-[#4f4f4f] md:max-w-[28.2vw] md:gap-[1.7708vw] md:text-[1.1458vw] md:leading-[1.7708vw] ${gapClass}`}
        style={gap(30.2, 57.95)}
      >
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </section>
  );
}

export default function MethodPage() {
  return (
    <div className="relative overflow-hidden font-sans bg-white">
      <InnerNav active="What is" />
      <div className="absolute left-[21px] top-[24px] z-10 md:hidden">
        <PhoneBack />
      </div>

      <main>
        {stages.map((stage) => (
          <Stage key={stage.label} {...stage} />
        ))}

        <section
          className={`bg-black px-[20px] text-center tracking-[-0.04em] pt-[109.2px] pb-[43.9px] md:pt-[13.078vw] md:pb-[13.396vw] ${gapClass}`}
          style={gap(60.4, 208.5)}
        >
          {/* Both frames: regular weight, very tight, "Four stages." on one line */}
          <h2 className="font-normal tracking-[-0.075em] text-white text-[64px] leading-[64px] md:text-[7.8125vw] md:leading-[8.5938vw]">
            <span className="whitespace-nowrap">Four stages.</span>
            <br />
            <em>One</em>
            <br />
            foundation.
          </h2>
          <div className="mx-auto mt-[28.4px] flex max-w-[296px] flex-col gap-[20px] text-[14px] leading-[20px] text-[#cfcfcf] md:mt-[4.38vw] md:max-w-[36.4vw] md:gap-[2.0833vw] md:text-[1.4583vw] md:leading-[2.0833vw] md:text-[#b0b0b0]">
            {foundation.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          <p className="mt-[39.7px] font-bold text-white text-[20px] leading-[28px] md:mt-[3.4167vw] md:text-[1.5625vw] md:leading-[2.2917vw]">
            Everything that follows stands <br className="md:hidden" />
            on four.
          </p>
          <div className="mt-[100.8px] leading-none md:hidden">
            <PhoneBack light />
          </div>
        </section>
      </main>
    </div>
  );
}
