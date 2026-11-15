import React, { useEffect, useRef, useState } from "react";
import ArrowIcon from "./ArrowIcon";
import { submitForm } from "./forms/submitForm";

// "We are not for everyone." to Marta's new home frames of 9 Nov (Desktop (2) and Mobile (2)): the contact block
// between Platform Mind_set and the footer. Desktop (1920 frame): the heading on the left from 165 px, the form on
// the right 1011-1698 px (same edge as the footer logo); field sizes as the Collaborate forms. Phone (390 frame, --q):
// heading 69/65 from 16 px, the form 350 px wide, button 46 px, 60 px to the footer.
// The privacy line is the one Marta approved for the Collaborate forms (28 Oct); the sent state uses her Flow B line.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Computer, her current Figma (kept copy, 12 Nov, frame 1920 x 598): labels 14/17 -0.04em black 69%, fields 5 px
// under them, email 53 tall, message 151, text 22/31 from 21 px in, placeholders black 40%, button 68 tall.
// Phone, her frame: labels 12/15 -0.04em black 69%, fields 5 px under them, email 41 tall, message 160, text 16/19
// -0.04em (16 px also keeps iPhone Safari from zooming in when a field is tapped), placeholders black 40%.
// 14 Nov, tablet (768): labels were 5-6 px and the text 7-9 px; px floors below about 1150 wide, laptop and desktop unchanged.
const labelCls = "block text-[12px] md:text-[max(0.729vw,10px)] font-normal leading-[15px] md:leading-[max(0.882vw,12px)] tracking-[-0.04em] md:tracking-[-0.04em] text-black/[.69]";
const inputCls =
  "mt-[5px] md:mt-[0.26vw] block w-full border border-[#D4D4D4] md:border-black/20 bg-white px-[12px] md:px-[1.094vw] " +
  "text-[16px] md:text-[max(1.146vw,13px)] tracking-[-0.04em] md:tracking-[-0.04em] font-normal md:font-normal text-black placeholder:text-black/40 md:placeholder:text-black/40 outline-none transition-colors focus:border-black";
const errorCls = "mt-1 text-[12px] md:text-[clamp(12px,0.73vw,14px)] text-[#c2006f]";

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  // 14 Nov: her phone frame's email placeholder is "Your Email Address", her desktop frame's "Your email"
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const submissionId = useRef(newId());

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    const e = !email.trim() ? "Please enter your email." : !EMAIL_RE.test(email.trim()) ? "Please enter a valid email address." : "";
    setError(e);
    setFailed(false);
    if (e) {
      ev.currentTarget.querySelector("#contact-email")?.focus();
      return;
    }
    setSending(true);
    try {
      await submitForm("contact", { email: email.trim(), message: message.trim() }, submissionId.current);
      setSent(true);
    } catch {
      setFailed(true);
      setSending(false);
    }
  };

  return (
    <section id="contact" className="mm-phone-w bg-white font-[Inter] text-black">
      {/* Computer: heading 150/141 -0.06em at 163, 78; the form column 687 wide at 1011, its line at 97; 97 px under the button */}
      {/* Phone, MM-HOME-002 (iPhone 16 & 17 Pro - 7, 13 Nov; measured against her frame 14 Nov): heading 64/60 at 14, 40;
          text 292 wide at 20, 254; the form at 331 with 11 px between the fields and 24 above the button; 48 px under
          the last line (the privacy line, which her frame doesn't have) */}
      <div className="px-[calc(var(--q)*20)] pt-[calc(var(--q)*40)] pb-[calc(var(--q)*48)] md:grid md:grid-cols-[44.17vw_35.78vw] md:items-start md:px-0 md:pl-[8.49vw] md:pt-[4.06vw] md:pb-[max(5.05vw,64px)]">
        <h2 className="-ml-[calc(var(--q)*6)] text-[length:calc(var(--q)*64)] font-normal leading-[calc(var(--q)*60)] tracking-[-0.06em] md:ml-0 md:text-[7.8125vw] md:leading-[7.344vw] md:tracking-[-0.06em]">
          {/* Marta's advisor, 10 Nov 23:36 (replaces his 23:13 word): keep it, and follow it at once with who it is for */}
          We are
          <br />
          not for
          <br />
          everyone.
        </h2>

        <div className="mt-[calc(var(--q)*34)] md:mt-[0.99vw]">
          {/* who it is for, 18/34 -0.04em black 69% on the computer, 14/20 -0.04em black 60% on the phone */}
          {/* 14 Nov (her rule: her newest frame is the spec): the phone says her MM-HOME-002 line, 238 wide; the computer keeps hers */}
          <p className="w-[calc(var(--q)*238)] text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] tracking-[-0.04em] text-black/60 md:hidden">
            We work with people who value thoughtful design and bold decisions.
          </p>
          <p className="hidden font-normal text-black/[.69] md:block md:text-[max(0.9375vw,12px)] md:leading-[max(1.77vw,18px)] md:tracking-[-0.04em]">
            We work with funded founders who would rather be understood than liked.
          </p>

          {sent ? (
            <p className="mm-fade-in mt-[calc(var(--q)*36)] text-[22px] font-normal leading-[1.15] tracking-[-0.01em] md:mt-[1.04vw] md:text-[clamp(24px,1.9vw,36px)]" role="status">
              Thank you for reaching out.
            </p>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative mt-[calc(var(--q)*37)] md:mt-[1.04vw]">
              <label htmlFor="contact-email" className={labelCls}>Email *</label>
              <input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={phone ? "Your Email Address" : "Your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "contact-email-err" : undefined}
                className={`${inputCls} h-[41px] md:h-[2.76vw] md:min-h-[40px]`}
              />
              {error && <p id="contact-email-err" className={errorCls}>{error}</p>}

              <label htmlFor="contact-message" className={`${labelCls} mt-[11px] md:mt-[0.729vw]`}>Your message</label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="What are you building?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} h-[160px] resize-none py-[10px] leading-[19px] md:h-[max(7.86vw,84px)] md:py-[0.573vw] md:leading-[max(1.615vw,18px)]`}
              />

              <button
                type="submit"
                disabled={sending}
                aria-busy={sending}
                className="mm-gradient group mt-[24px] inline-flex h-[46px] w-full items-center justify-center gap-[0.3em] text-[16px] font-semibold tracking-[-0.023em] text-white disabled:opacity-70 md:mt-[1.04vw] md:h-[3.54vw] md:min-h-[44px] md:text-[max(1.146vw,13px)] md:tracking-[-0.017em]"
              >
                {sending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Sending" />
                ) : (
                  <>See if we click <ArrowIcon className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>

              {failed && <p className={`${errorCls} mt-3`} role="alert">Something went wrong. Please try submitting again.</p>}
              {/* Not in her frame: the privacy line approved on 28 Oct, kept in the space under the button so her layout is
                  unchanged on the computer; 14 Nov, not on the phone (her MM-HOME-002 has none, and it pushed the footer 63 px down) */}
              <p className="mt-[14px] text-[11px] max-md:hidden font-light leading-[1.45] text-black/50 md:absolute md:left-0 md:right-0 md:top-full md:mt-[0.9vw] md:text-[clamp(10px,0.63vw,12px)]">
                We use your details only to reply to you and keep them private. We never sell them. To have them deleted, write to{" "}
                <a href="mailto:mymamamarta@icloud.com" className="underline underline-offset-2">mymamamarta@icloud.com</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
