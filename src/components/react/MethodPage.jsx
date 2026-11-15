import React from "react";
import { BottomBack, TopBack } from "./InnerNav";

// The method page (/what-is), from Marta's frames "MM-METHOD / Desktop" (1920 wide) and "MM-METHOD / Mobile"
// (390 wide). 11 Nov 19:31, Marta: "this page is still gigantic, it must be smaller, as in my design". It was
// built in fixed px of her 1920 frame, so on a laptop everything came out a third too big. Now the computer
// sizes are her 1920 px drawn in vw (px / 19.2), like the home page, so every screen width keeps her
// proportions; the phone keeps her 390 px sizes. Texts are her current Figma wording (11 Nov), and the text
// wraps by itself in a column the width of hers. Spacing: [phone px, computer px of the 1920 frame].
// 11 Nov 20:56, Marta (screenshot of a wide, short laptop window: the charcoal filled the whole screen and Back
// was out of scale): "the proportions aren't right". The computer sizes followed the width only, and Back
// stayed in fixed px. Now one unit, --u = one pixel of her 1920 x 1080 frame fitted to the screen (the smaller
// of width and height), like the home's first screen: on any window the first screen shows what hers does
// (the charcoal, its label and the title), and Back scales with the page.

const du = (n) => `calc(var(--u) * ${n})`;
// 14 Nov (Marta: "check how it all looks at different sizes"): on a tablet (768 wide) that unit was 0.4 px, so the
// text came out 7-9 px. It never goes below 0.6 px now, as on Bio; her column stays centred and inside the screen.
const unit = { "--u": "max(0.6px, min(calc(100vw / 1920), calc(100dvh / 1080)))" };

const stages = [
  {
    // 12 Nov (Marta changed her frame: "I fixed the first block, the charcoal, do the same"): the charcoal is now
    // drawn 613 px wide (her 703 x 1054 image box shows it at 87%), pushed up so its tip sits right on the label
    // at 557 px, its top cut by the page edge (computer only).
    img: { src: "/assets/charcoal.png", w: 1406, h: 1802, size: [320, 613], alt: "A stick of black MAMAMARTA charcoal" },
    gap: [0, -228.7, 27, 0],
    label: "01 — CHARCOAL / DISCOVERY",
    title: "The First Spark",
    subtitle: "Raw potential. Light and shadow. The beginning of form.",
    // 15 Nov: the four texts are her MM-METHOD wording of 13 Nov (desktop and phone the same); a single line break
    // in her text stays a line break
    paragraphs: [
      "Every product begins as an impression, not a plan. People decide how it feels before they read a single feature.",
      "This stage finds what the product is really for, and who it's for. Charcoal makes the first marks without knowing where they land. Neither do you.",
    ],
  },
  {
    img: { src: "/assets/palette-knife.png", w: 1406, h: 1772, size: [319, 703], alt: "A MAMAMARTA palette knife" },
    gap: [58, 112.5, 8, 0],
    label: "02 — PALETTE KNIFE / STRUCTURE",
    title: "Shaping the Form",
    subtitle: "From possibility to intention.",
    paragraphs: [
      ["Possibility is easy. Direction is not.", "Which of the twelve ideas survives? What does the hierarchy say before a word is read?"],
      "Like a palette knife, structure shapes the mass until the form appears.",
    ],
  },
  {
    img: { src: "/assets/brush.png", w: 1254, h: 1488, size: [361, 627], alt: "A black MAMAMARTA paint brush" },
    gap: [98, 112.5, 24, 33],
    label: "03 — BRUSH / REFINEMENT",
    title: "The Paint Is Almost Dry",
    subtitle: "The art of knowing what matters.",
    paragraphs: [
      "The last 10% is where most work gets abandoned, and where a product starts to feel right.",
      "A brush only makes small strokes, and that is why it decides whether the work looks finished. The spacing that lets text breathe. The transition that makes a click feel like a decision. Nothing is added without a reason. Nothing stays just because it was there.",
    ],
  },
  {
    img: { src: "/assets/sphere.png", w: 1176, h: 1492, size: [351, 588], alt: "A pink sphere inside a glass cube" },
    gap: [45, 113, 21, 21],
    label: "04 — THE REVEAL / RELEASE & EVOLUTION",
    title: "A Form of Its Own",
    subtitle: "From creation to presence.",
    paragraphs: [
      "At some point the work stops needing to be explained. Like an object in a gallery, it stands on its own.",
      "Clear enough to be understood on sight. Distinct enough to be remembered. Solid enough to grow without being rebuilt.",
    ],
  },
];

const foundation = [
  "Four seasons. Four elements. Four directions.",
  "Across nature and cultures, four has long represented balance and structure.",
  "Marta sees her work in much the same way. Four stages, each with its own material, rhythm, and purpose. Each shaping what comes next.",
];

// margin-top: px on the phone, her 1920 px times --u on the computer
const gapClass = "mt-[var(--m)] md:mt-[var(--d)]";
const gap = (m, d) => ({ "--m": `${m}px`, "--d": du(d) });

// Both her frames set the type 4% tighter than the font's own spacing (measured side by side, 28 Oct).
// 15 Nov: that spacing is now set on each text, at its own size. Set once on the section it was worked out on the
// section's 16 px and passed down as -0.64 px: too loose for her 22 px text (-0.88) and too tight for 14 px (-0.56).
// Her text column on the computer is a different width in each stage (532, 454, 531, 446), so her lines break there.
const TEXT_W = [532, 454, 531, 446];
function Stage({ img, gap: g, label, title, subtitle, paragraphs, index }) {
  return (
    <section className="px-[20px] text-center tracking-[-0.04em]">
      <img
        src={img.src}
        width={img.w}
        height={img.h}
        alt={img.alt}
        className={`mx-auto block h-auto max-w-none w-[var(--w)] md:w-[var(--wd)] ${gapClass}`}
        style={{ ...gap(g[0], g[1]), "--w": `${img.size[0]}px`, "--wd": du(img.size[1]) }}
      />
      {/* Phone, her MM-METHOD / Mobile (kept copy, 13 Nov): label 14/20 black 60%, title 32/39, subtitle 12/20
          black 60%, text 14/20 black 70% in a 293 column, all at -0.04em; label to title 44, title to subtitle 8,
          subtitle to text 26 (her boxes, now in her line heights; the computer keeps its own) */}
      <p className={`uppercase leading-[20px] md:leading-none text-[14px] md:text-[length:calc(var(--u)*22)] tracking-[-0.04em] md:tracking-[-0.017em] text-black/60 md:text-black/50 ${gapClass}`} style={gap(g[2], g[3])}>
        {label}
      </p>
      <h2 className={`font-normal leading-[39px] md:leading-none text-black text-[32px] tracking-[-0.04em] md:text-[length:calc(var(--u)*50)] ${gapClass}`} style={gap(44, 70.7)}>
        {title}
      </h2>
      <p className={`leading-[20px] md:leading-none text-black/60 md:text-black/[.69] text-[12px] tracking-[-0.04em] md:text-[length:calc(var(--u)*18)] ${gapClass}`} style={gap(8, 26.85)}>
        {subtitle}
      </p>
      <div
        className={`mx-auto flex max-w-[293px] flex-col gap-[20px] text-[14px] leading-[20px] tracking-[-0.04em] text-black/70 md:text-black/[.69] md:max-w-[var(--tw)] md:gap-[calc(var(--u)*34)] md:text-[length:calc(var(--u)*22)] md:leading-[calc(var(--u)*34)] ${gapClass}`}
        style={{ ...gap(26, 57.95), "--tw": du(TEXT_W[index]) }}
      >
        {paragraphs.map((text, i) => (
          <p key={i}>{Array.isArray(text) ? text.map((line, j) => <React.Fragment key={j}>{j > 0 && <br />}{line}</React.Fragment>) : text}</p>
        ))}
      </div>
    </section>
  );
}

export default function MethodPage() {
  return (
    <div className="relative overflow-hidden font-sans bg-white" style={unit}>
      <TopBack />

      <main>
        {stages.map((stage, i) => (
          <Stage key={stage.label} index={i} {...stage} />
        ))}

        <section
          className={`bg-black px-[20px] text-center tracking-[-0.04em] pt-[109.2px] pb-[43.9px] md:pt-[calc(var(--u)*250)] md:pb-[calc(var(--u)*251)] ${gapClass}`}
          /* 12 Nov, Marta: "a big white gap" after the 4th point. In her frame the stages moved up 357 px (the charcoal
             lift) but the black block stayed at 5914 px, 624 px below the 4th text; before the lift it sat 267 px below
             it (624 - 357), which is the distance kept here. The phone keeps her 390 frame's 60 px.
             15 Nov, her MM-METHOD of 13 Nov: the black block starts 150 px under the 4th text on the computer
             and 80 px under it on the phone. */
          style={gap(80, 150)}
        >
          {/* Her current MM-METHOD (kept Figma copy, 12 Nov, "the font is different, above all the italic"): the words
              are Inter Medium 500 and only "One" is Inter Italic 400, letter spacing -0.06em on both, lines 167 / 65 px
              apart. Ours was all regular at -0.075em, which thinned the words and squeezed the italic. */}
          <h2 className="font-medium tracking-[-0.06em] text-white text-[64px] leading-[65px] md:text-[length:calc(var(--u)*150)] md:leading-[calc(var(--u)*167)]">
            <span className="whitespace-nowrap">Four stages.</span>
            <br />
            <em className="font-normal italic">One</em>
            <br />
            foundation.
          </h2>
          {/* phone: her 293 column, white 81% (#cfcfcf), 27 under the heading; the closing line Inter Semi Bold 600
              20/28 as her MM-METHOD / Mobile (the computer keeps bold 700) */}
          <div className="mx-auto mt-[27px] flex max-w-[293px] flex-col gap-[20px] text-[14px] leading-[20px] tracking-[-0.04em] text-white/[.81] md:mt-[calc(var(--u)*80)] md:max-w-[calc(var(--u)*547)] md:gap-[calc(var(--u)*34)] md:text-[length:calc(var(--u)*22)] md:leading-[calc(var(--u)*34)] md:text-white/[.69]">
            {foundation.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          <p className="mt-[40px] font-semibold md:font-bold text-white text-[20px] leading-[28px] tracking-[-0.04em] md:tracking-[-0.017em] md:mt-[calc(var(--u)*59)] md:text-[length:calc(var(--u)*30)] md:leading-[calc(var(--u)*44)]">
            Everything that follows stands <br className="md:hidden" />
            on four.
          </p>
          {/* 12 Nov 23:34, Marta: "you forgot the Back at the end of the page (on the black block)": on the computer
              too now, the same shared Back, as far below the last line as Bio's bottom Back (125) */}
          <div className="mt-[100.8px] leading-none md:mt-[calc(var(--u)*125)]">
            <BottomBack light />
          </div>
        </section>
      </main>
    </div>
  );
}
