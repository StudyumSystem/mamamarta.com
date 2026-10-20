import React, { useState } from "react";
import CaseStudyCard from "./CaseStudyCard.jsx";
import CaseStudyDetail from "./CaseStudyDetail.jsx";

const caseStudies = [
  {
    slug: "motion-led-funnel",
    label: "Case Study 01",
    title: "Motion-Led Funnel",
    summary:
      "A split-screen case study concept that uses motion on one side and supporting narrative on the other.",
    previewText:
      "This preview intentionally does not rely on media assets. It uses gradients, contrast, and typography to suggest the direction for a future video-first presentation.",
    theme: "from-pink-500/20 via-white/90 to-white",
    role: "Product design, motion direction, conversion structure",
    services: ["Landing page", "Motion direction", "Copy hierarchy", "CTA system"],
    challenge:
      "The story needs to feel premium immediately, even before a visitor reads a full case study.",
    approach:
      "The homepage preview is built as two vertical halves: a bold visual teaser and a concise explanation of the thinking behind it.",
    outcome:
      "The format scales into a detailed inner page that can explain strategy, structure, and results without redesigning the entire story.",
    stats: [
      { label: "Preview halves", value: "2" },
      { label: "Story layers", value: "3" },
      { label: "Modules", value: "5" },
    ],
    details: [
      {
        title: "Visual teaser",
        description:
          "A strong preview panel creates the impression of motion and depth through gradients, scale, and framing instead of video assets.",
      },
      {
        title: "Reading flow",
        description:
          "The supporting panel keeps the message crisp so the homepage can communicate the case study in under one scroll.",
      },
    ],
  },
  {
    slug: "identity-system",
    label: "Case Study 02",
    title: "Identity System in Motion",
    summary:
      "A visual system case study focused on clarity, editorial pacing, and a stronger brand signature.",
    previewText:
      "This preview leans into structure rather than media, showing how a design system can still feel expressive without relying on assets.",
    theme: "from-pink-500/20 via-white/90 to-white",
    role: "Visual design, design system, art direction",
    services: ["Visual identity", "Design system", "Art direction", "Content layout"],
    challenge:
      "The brand needs a consistent story that works across product, campaign, and case study pages.",
    approach:
      "We use a modular layout and strong type hierarchy so each page can feel distinct while staying part of the same system.",
    outcome:
      "The result is a reusable case-study pattern that can grow with new projects and new media later.",
    stats: [
      { label: "Core modules", value: "6" },
      { label: "Visual states", value: "3" },
      { label: "Page types", value: "2" },
    ],
    details: [
      {
        title: "Editorial pacing",
        description:
          "Whitespace, spacing, and hierarchy create a calm reading experience that still feels premium and deliberate.",
      },
      {
        title: "System first",
        description:
          "Every section is designed as a repeatable block so the page can scale with future projects.",
      },
    ],
  },
];

export default function CaseStudiesSection() {
  const [selectedStudy, setSelectedStudy] = useState(null);

  if (selectedStudy) {
    return <CaseStudyDetail study={selectedStudy} onBack={() => setSelectedStudy(null)} />;
  }

  return (
    <section id="case-studies" className="border-y border-black/10 bg-white text-black xs:min-h-auto sm:min-h-auto md:min-h-auto lg:h-[100svh] lg:overflow-hidden xl:h-[100svh] 2xl:h-[100svh]">
      <div className="grid xs:min-h-auto sm:min-h-auto md:min-h-auto lg:h-full lg:grid-cols-2 xl:h-full xl:grid-cols-2 2xl:h-full 2xl:grid-cols-2">
        {caseStudies.map((study, index) => (
          <CaseStudyCard
            key={study.slug}
            study={study}
            index={index}
            onSelect={() => setSelectedStudy(study)}
          />
        ))}
      </div>
    </section>
  );
}