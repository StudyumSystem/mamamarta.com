import React, { useCallback, useEffect, useRef, useState } from "react";
import GameModal from "../games/GameModal.jsx";
import { submitForm } from "./submitForm.js";

// The two Collaborate forms (Marta's MM-C06 frames + spec 10): Flow A "Suggest a game" and
// Flow B "Create for my brand". They open as modals over the Homepage on the window event
// "mm-open-form" {flow: "suggest" | "brand"} (slider entry 06). Copy = desktop Figma, word for word.

const FLOWS = {
  suggest: {
    type: "suggest_game",
    label: "Suggest a game",
    title: "Your idea. Our playground.",
    intro: "Have a game in mind? Share it with us. Selected ideas may come to life as part of the Mamamarta game collection.",
    question: "What kind of game do you imagine?*",
    options: ["Puzzle & problem-solving", "Memory & matching", "Words & discovery", "Strategy & logic", "Arcade & reflexes"],
    placeholder: "Describe your game idea, or tell us how you'd like it to work.",
    successTitle: "Your idea has landed.",
    successText: ["Thank you for sharing your game idea.", "We'll review it for the Mamamarta collection. If selected, we'll contact you before bringing it to life."],
  },
  brand: {
    type: "custom_brand_experience",
    label: "Create for my brand",
    title: "Your brand. A new experience.",
    intro: "Let's create an interactive experience shaped around your brand, your audience, and your goals.",
    question: "What would you like your game to achieve? *",
    options: ["Engage customers", "Showcase our brand", "Create an internal team experience", "Launch a product", "Explore an idea"],
    placeholder: "Tell us about your brand, your idea, or the experience you'd like to create.",
    successTitle: "Let's make something memorable.",
    successText: ["Thank you for reaching out.", "We'll review your request and get back to you to explore how we can bring your brand experience to life."],
  },
};

const PRIVACY = (
  <>We use your details only to reply to you and keep them private. We never sell them. To have them deleted, write to{" "}
    <a href="mailto:mymamamarta@icloud.com" className="underline underline-offset-2">mymamamarta@icloud.com</a>.</>
);
const FAILED = "Something went wrong. Please try submitting again.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Phone sizes from her MM-C06 phone frames (1200:1745, kept copy, 13 Nov): labels Inter 12/15 black 69%, fields
// 310 x 41 five px under their label, 12 apart, placeholder 16/19 black 40%, boxes 18 x 18. The computer keeps its own.
const labelCls = "block text-[12px] lg:text-[clamp(12px,0.68vw,13px)] font-normal leading-[15px] lg:leading-[1.3] lg:tracking-[-0.04em] text-black/[0.69]";
const inputCls =
  "mt-[5px] lg:mt-[4px] block w-full h-[41px] lg:h-[clamp(44px,2.76vw,53px)] border border-black/20 bg-white px-[12px] lg:px-[clamp(14px,1.15vw,22px)] " +
  "text-[16px] lg:text-[clamp(15px,1.1vw,21px)] font-normal lg:tracking-[-0.04em] text-black placeholder:text-black/40 outline-none transition-colors focus:border-black";
const errorCls = "mt-1 text-[12px] lg:text-[clamp(12px,0.73vw,14px)] text-[#c2006f]";
// Checked boxes are filled with the pink glow from the frames.
const boxCls =
  "peer h-[18px] w-[18px] lg:h-[clamp(18px,1.25vw,24px)] lg:w-[clamp(18px,1.25vw,24px)] shrink-0 appearance-none border border-black/70 bg-white " +
  "checked:border-black checked:bg-[radial-gradient(circle,#ff2fbf_0%,#b0007a_45%,#2b0019_100%)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-black/40";

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
  </svg>
);

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} className={inputCls} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && <p id={`${id}-err`} className={errorCls}>{error}</p>}
    </div>
  );
}

function Form({ flow, onDone }) {
  const f = FLOWS[flow];
  const [values, setValues] = useState({ name: "", email: "", company: "", idea: "", marketing: false });
  const [picked, setPicked] = useState([]);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submissionId = useRef(newId());
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const toggle = (o) => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = "Please enter your name.";
    if (!values.email.trim()) e.email = "Please enter your email.";
    else if (!EMAIL_RE.test(values.email.trim())) e.email = "Please enter a valid email address.";
    if (!values.company.trim()) e.company = "Please tell us where you work.";
    if (!picked.length) e.options = "Please select at least one option.";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    const e = validate();
    setErrors(e);
    setFailed(false);
    if (Object.keys(e).length) {
      // Pick the field from the new errors (React hasn't marked the inputs yet).
      const form = ev.currentTarget;
      const k = ["name", "email", "company", "options"].find((x) => e[x]);
      (k === "options" ? form.querySelector('input[type="checkbox"]') : form.querySelector(`#${flow}-${k}`))?.focus();
      return;
    }
    setSending(true);
    try {
      await submitForm(f.type, {
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        choices: picked,
        idea: values.idea.trim(),
        marketingOptIn: values.marketing,
      }, submissionId.current);
      onDone();
    } catch {
      setFailed(true);
      setSending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="lg:max-w-[42.4vw]">
      {/* phone (her frame): Name 22 under the intro; the question 40 under Company, 12/17 black 60%; options in
          44 px rows 16 under it, 16/19 black 69%; the idea field 24 below (160 tall), the consent row (44, 12/15)
          17 below it, Submit 310 x 46 with 16 px type 24 below that */}
      <div className="mt-[22px] grid gap-[18px] lg:mt-[3.05vw] lg:grid-cols-[18.75vw_1fr] lg:gap-x-[4.1vw] lg:gap-y-0">
        <div className="flex flex-col gap-[12px] lg:gap-[clamp(14px,1.15vw,22px)]">
          <Field id={`${flow}-name`} label="Name *" placeholder="Your Name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
          <Field id={`${flow}-email`} label="Email *" type="email" inputMode="email" placeholder="Your Email Address" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
          <Field id={`${flow}-company`} label="Company *" placeholder="Where you work" autoComplete="organization" value={values.company} onChange={set("company")} error={errors.company} />
        </div>
        <fieldset className="mt-[22px] lg:mt-0" aria-describedby={errors.options ? `${flow}-opt-err` : undefined}>
          <legend className={`${labelCls} max-lg:leading-[17px] max-lg:text-black/60`}>{f.question}<br />(Select all that apply)</legend>
          <div className="mt-[16px] flex flex-col gap-0 lg:mt-[clamp(14px,1.4vw,26px)] lg:gap-[clamp(12px,1.08vw,21px)]">
            {f.options.map((o, i) => (
              <label key={o} className="flex min-h-[44px] cursor-pointer items-center gap-[14px] lg:min-h-0 lg:gap-[clamp(10px,0.83vw,16px)]">
                <input
                  type="checkbox"
                  className={boxCls}
                  checked={picked.includes(o)}
                  onChange={() => toggle(o)}
                  data-invalid={i === 0 && errors.options ? "true" : undefined}
                />
                <span className="text-[16px] lg:text-[clamp(15px,1.04vw,20px)] font-normal leading-[19px] lg:leading-[1.2] lg:tracking-[-0.04em] text-black/[0.69]">{o}</span>
              </label>
            ))}
          </div>
          {errors.options && <p id={`${flow}-opt-err`} className={errorCls}>{errors.options}</p>}
        </fieldset>
      </div>

      <div className="mt-[24px] lg:mt-[clamp(24px,2.85vw,55px)]">
        <label htmlFor={`${flow}-idea`} className={labelCls}>Your idea (optional)</label>
        <textarea
          id={`${flow}-idea`}
          rows={5}
          placeholder={f.placeholder}
          value={values.idea}
          onChange={set("idea")}
          className={`${inputCls} h-[160px] lg:h-[clamp(130px,9.3vw,178px)] resize-none py-[10px] lg:py-[clamp(10px,1vw,20px)] leading-[19px] lg:leading-[1.3]`}
        />
      </div>

      <div className="mt-[17px] flex flex-col gap-[24px] lg:mt-[clamp(20px,1.72vw,33px)] lg:flex-row lg:items-center lg:justify-between lg:gap-[2vw]">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-[14px] lg:min-h-0 lg:gap-[clamp(8px,0.6vw,12px)]">
          <input type="checkbox" className={`${boxCls} rounded-full`} checked={values.marketing} onChange={set("marketing")} />
          <span className="text-[12px] lg:text-[clamp(12px,0.7vw,13.5px)] lg:whitespace-nowrap font-normal leading-[15px] lg:leading-[1.35] lg:tracking-[-0.04em] text-black/[0.69]">
            I'd like to receive occasional updates and creative insights from Mamamarta.
          </span>
        </label>
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          className="mm-gradient inline-flex h-[46px] w-full shrink-0 items-center justify-center gap-2 text-[16px] font-semibold text-white disabled:opacity-70 lg:h-[clamp(52px,3.54vw,68px)] lg:w-[13.3vw] lg:min-w-[200px] lg:text-[clamp(16px,1.146vw,22px)]"
        >
          {sending ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Sending" /> : <>Submit <ArrowRight /></>}
        </button>
      </div>

      {failed && <p className={`${errorCls} mt-4 text-[14px] lg:text-right`} role="alert">{FAILED}</p>}
      <p className="mt-[20px] text-[11px] lg:mt-[clamp(16px,1.25vw,24px)] lg:text-[clamp(11px,0.63vw,12px)] font-light leading-[1.45] text-black/50">{PRIVACY}</p>
    </form>
  );
}

function Success({ flow, onExplore }) {
  const f = FLOWS[flow];
  return (
    <div className="mm-fade-in" role="status">
      {/* phone, her MM-C06 sent frames (13 Nov): title 24/29, text 12/20 black 60% 8 below, both -0.04em in a 293
          column; Explore the games 300 x 46 with 16 px type, 22 below */}
      <h2 className="max-lg:mx-auto max-lg:max-w-[293px] text-[24px] lg:mt-[1.3vw] lg:text-[clamp(32px,2.4vw,46px)] font-normal leading-[29px] lg:leading-[1.15] tracking-[-0.01em] max-lg:tracking-[-0.04em] text-black">{f.successTitle}</h2>
      <p className="mt-[8px] lg:mt-[clamp(14px,1.5vw,28px)] max-lg:mx-auto max-lg:max-w-[293px] lg:max-w-[29.5vw] text-[12px] lg:text-[clamp(15px,1.04vw,20px)] font-normal leading-[20px] lg:leading-[1.5] tracking-[-0.04em] text-black/60 lg:text-black/[.69]">
        {f.successText[0]}<br />{f.successText[1]}
      </p>
      <button
        type="button"
        onClick={onExplore}
        className="mm-gradient mt-[22px] inline-flex h-[46px] w-[calc(100%-10px)] items-center justify-center gap-2 text-[16px] font-semibold text-white lg:mt-[clamp(28px,2.6vw,50px)] lg:h-[clamp(52px,3.54vw,68px)] lg:w-[17.7vw] lg:min-w-[260px] lg:text-[clamp(16px,1.146vw,22px)]"
      >
        Explore the games <ArrowRight />
      </button>
    </div>
  );
}

// initialFlow / initialSent: only for the test pages that open a form (or its success screen) straight away.
export default function CollaborateForms({ initialFlow = null, initialSent = false }) {
  const [flow, setFlow] = useState(initialFlow);
  const [sent, setSent] = useState(initialSent);

  useEffect(() => {
    const onOpen = (e) => {
      const next = e.detail?.flow;
      if (!FLOWS[next]) return;
      setSent(false);
      setFlow(next);
    };
    window.addEventListener("mm-open-form", onOpen);
    return () => window.removeEventListener("mm-open-form", onOpen);
  }, []);

  // Back (from the form or the success screen): close; the slider stays on 06 and unsent data is dropped.
  const close = useCallback(() => { setFlow(null); setSent(false); }, []);
  // "Explore the games →": close and move the slider to Game 01, without a reload.
  const explore = useCallback(() => {
    close();
    window.dispatchEvent(new CustomEvent("mm-slider-go", { detail: { index: 0 } }));
    document.getElementById("my-system")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [close]);

  if (!flow) return null;
  const f = FLOWS[flow];

  return (
    <GameModal open onClose={close} label={f.label}>
      <div className={`flex flex-1 flex-col px-[20px] pb-[10px] lg:block lg:px-0 lg:pl-[16.4vw] lg:pr-[6vw] lg:pb-[4vw] ${sent ? "justify-center text-center lg:text-left" : ""}`}>
        {sent ? (
          <Success flow={flow} onExplore={explore} />
        ) : (
          <>
            {/* phone (her MM-C06 phone frames): title 24/29 at -0.04em on one line, intro 12/17 black 60% 8 below in a
                293 column */}
            <h2 className="text-[24px] lg:mt-[1.3vw] lg:text-[clamp(32px,2.4vw,46px)] font-normal leading-[29px] lg:leading-[1.15] tracking-[-0.01em] max-lg:tracking-[-0.04em] text-black">{f.title}</h2>
            <p className="mt-[8px] lg:mt-[clamp(14px,1.5vw,28px)] max-lg:max-w-[293px] lg:max-w-[31.5vw] text-[12px] lg:text-[clamp(15px,1.04vw,20px)] font-normal leading-[17px] lg:leading-[1.5] lg:tracking-[-0.04em] text-black/60 lg:text-black/[.69]">{f.intro}</p>
            <Form key={flow} flow={flow} onDone={() => setSent(true)} />
          </>
        )}
      </div>
    </GameModal>
  );
}
