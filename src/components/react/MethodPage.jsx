import React from "react";
import InnerNav, { PhoneBack } from "./InnerNav";

// The method page (/what-is), from Marta's frames "The method" (1920 wide) and "iPhone The method"
// (390 wide), 26 Oct 2026. Texts are the desktop wording (her rule, 26 Oct: when the two differ,
// the desktop one counts). On the computer every line breaks where her frame breaks it; on the
// phone the text wraps by itself. Spacing comes from her frames: [phone, computer] in px.

const stages = [
  {
    img: { src: "/assets/charcoal.png", w: 1406, h: 1802, size: [320, 703], alt: "A stick of black MAMAMARTA charcoal" },
    gap: [0, 0, 29, 3],
    label: "01 — CHARCOAL / DISCOVERY",
    title: "The First Spark",
    subtitle: "Raw potential. Light and shadow. The beginning of form.",
    paragraphs: [
      [
        "Every idea begins as raw potential.",
        "Charcoal is fragile, instinctive, and full of",
        "possibility. It moves between light and shadow,",
        "from the faintest trace to the deepest black.",
      ],
      [
        "This is where Marta explores what could be.",
        "Before structure, before certainty, there is",
        "curiosity. And the first spark of something new.",
      ],
    ],
    // On the phone she kept the desktop line breaks here
    phoneLines: [
      [
        "Every idea begins as raw potential.",
        "Charcoal is fragile, instinctive, and full of",
        "possibility. It moves between light and shadow,",
        "from the faintest trace to the deepest black.",
      ],
      [
        "This is where Marta explores what could be.",
        "Before structure, before certainty, there is",
        "curiosity. And the first spark of something new.",
      ],
    ],
  },
  {
    img: { src: "/assets/palette-knife.png", w: 1406, h: 1772, size: [319, 703], alt: "A MAMAMARTA palette knife" },
    gap: [82.4, 112.5, 6, 0],
    label: "02 — PALETTE KNIFE / STRUCTURE",
    title: "Shaping the Form",
    subtitle: "From possibility to intention.",
    paragraphs: [
      [
        "An idea needs more than inspiration. It needs direction.",
        "The palette knife builds, removes, and reshapes material.",
        "Every movement is deliberate. Every layer gives the",
        "work greater definition.",
      ],
      [
        "This is where possibilities become decisions. She",
        "establishes structure, creates hierarchy, and gives every",
        "element a reason to exist.",
      ],
    ],
  },
  {
    img: { src: "/assets/brush.png", w: 1254, h: 1488, size: [361, 627], alt: "A black MAMAMARTA paint brush" },
    gap: [73.7, 112.5, 30.4, 33],
    label: "03 — BRUSH / REFINEMENT",
    title: "The Paint Is Almost Dry",
    subtitle: "The art of knowing what matters.",
    paragraphs: [
      [
        "The smallest details can change the entire experience.",
        "A brush brings precision, character, and intention to",
        "every surface. Each stroke refines what has already",
        "taken shape.",
      ],
      [
        "This is where the system finds its voice. Interactions,",
        "details, and visual language come together, bringing",
        "the product closer to its final form.",
      ],
    ],
  },
  {
    img: { src: "/assets/sphere.png", w: 1176, h: 1492, size: [351, 588], alt: "A pink sphere inside a glass cube" },
    gap: [71.7, 113, 16.5, 21],
    label: "04 — THE REVEAL / RELEASE & EVOLUTION",
    title: "A Form of Its Own",
    subtitle: "From creation to presence.",
    paragraphs: [
      [
        "A creation reaches a point where it no longer needs its",
        "maker to explain it. Like an object in a gallery, it stands on its",
        "own. Its form, purpose, and character speak for themselves.",
      ],
      [
        "This is where the work enters the world. Ready",
        "to be experienced, understood, and remembered.",
        "Complete in its identity, yet open to evolution.",
      ],
    ],
    phoneLines: [
      [
        "A creation reaches a point where it no longer",
        "needs its maker to explain it. Like an object in",
        "a gallery, it stands on its own. Its form, purpose,",
        "and character speak for themselves.",
      ],
      [
        "This is where the work enters the world.",
        "Ready to be experienced, understood, and",
        "remembered. Complete in its identity, yet",
        "open to evolution.",
      ],
    ],
  },
];

const foundation = [
  ["Four seasons. Four elements. Four directions."],
  [
    "Across nature and ancient cultures, four has long been a",
    "symbol of balance, harmony, and the rhythm of life.",
  ],
  ["Marta sees her work in much the same way."],
  [
    "Four stages, each with its own material, rhythm, and",
    "purpose. From the first spark of an idea to a creation that",
    "stands on its own. Each stage leaves something in the",
    "next, shaping what the work ultimately becomes.",
  ],
];

// margin-top for the phone and the computer
const gapClass = "mt-[var(--m)] md:mt-[var(--d)]";
const gap = (m, d) => ({ "--m": `${m}px`, "--d": `${d}px` });

// The frame's own line breaks, on the computer only
function Lines({ lines }) {
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && (
        <>
          {" "}
          <br className="hidden md:inline" />
        </>
      )}
      {line}
    </React.Fragment>
  ));
}

// Both her frames set the type 4% tighter than the font's own spacing (measured side by side, 28 Oct).
function Stage({ img, gap: g, label, title, subtitle, paragraphs, phoneLines }) {
  return (
    <section className="px-[20px] text-center tracking-[-0.04em]">
      <img
        src={img.src}
        width={img.w}
        height={img.h}
        alt={img.alt}
        className={`mx-auto block h-auto max-w-none w-[var(--w)] md:w-[var(--wd)] ${gapClass}`}
        style={{ ...gap(g[0], g[1]), "--w": `${img.size[0]}px`, "--wd": `${img.size[1]}px` }}
      />
      <p className={`uppercase leading-none text-[14px] md:text-[22px] md:tracking-[-0.02em] text-[#5e5e5e] md:text-[#7f7f7f] ${gapClass}`} style={gap(g[2], g[3])}>
        {label}
      </p>
      <h2 className={`font-normal leading-none text-black text-[32px] tracking-[-0.05em] md:tracking-[-0.04em] md:text-[50px] ${gapClass}`} style={gap(50.5, 70.7)}>
        {title}
      </h2>
      <p className={`leading-none text-[#6b6b6b] md:text-[#4f4f4f] text-[12px] tracking-[-0.03em] md:tracking-[-0.04em] md:text-[18px] ${gapClass}`} style={gap(15.8, 26.85)}>
        {subtitle}
      </p>
      <div
        className={`mx-auto flex max-w-[296px] flex-col gap-[20px] text-[14px] leading-[20px] text-[#4f4f4f] md:max-w-none md:gap-[34px] md:text-[22px] md:leading-[34px] ${gapClass}`}
        style={gap(30.2, 57.95)}
      >
        {paragraphs.map((lines, i) => (
          <p key={i}>
            {phoneLines ? (
              <>
                <span className="md:hidden"><PhoneLines lines={phoneLines[i]} /></span>
                <span className="hidden md:inline"><Lines lines={lines} /></span>
              </>
            ) : (
              <Lines lines={lines} />
            )}
          </p>
        ))}
      </div>
    </section>
  );
}

// Her phone frame's own line breaks, for the stages where she set them by hand
function PhoneLines({ lines }) {
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
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
          className={`bg-black px-[20px] text-center tracking-[-0.04em] pt-[109.2px] pb-[43.9px] md:pt-[251.1px] md:pb-[257.2px] ${gapClass}`}
          style={gap(60.4, 208.5)}
        >
          {/* Both frames: regular weight, very tight, "Four stages." on one line */}
          <h2 className="font-normal tracking-[-0.075em] text-white text-[64px] leading-[64px] md:text-[150px] md:leading-[165px]">
            <span className="whitespace-nowrap">Four stages.</span>
            <br />
            <em>One</em>
            <br />
            foundation.
          </h2>
          <div
            className="mx-auto mt-[28.4px] flex max-w-[296px] flex-col gap-[20px] text-[14px] leading-[20px] text-[#cfcfcf] md:text-[#b0b0b0] md:mt-[84.1px] md:max-w-none md:gap-[40px] md:text-[28px] md:leading-[40px]"
          >
            {foundation.map((lines, i) => (
              <p key={i}>
                <Lines lines={lines} />
              </p>
            ))}
          </div>
          <p className="mt-[39.7px] font-semibold text-white text-[20px] leading-[28px] md:mt-[65.6px] md:text-[31px] md:leading-none">
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
