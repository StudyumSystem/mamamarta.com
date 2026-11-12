import React, { useRef, useState } from "react";
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
const labelCls = "block text-[11px] md:text-[0.729vw] font-normal leading-[1.3] md:leading-[0.882vw] md:tracking-[-0.04em] text-black/80 md:text-black/70";
const inputCls =
  "mt-[6px] md:mt-[0.26vw] block w-full border border-black/20 bg-white px-[12px] md:px-[1.094vw] " +
  "text-[15px] md:text-[1.146vw] md:tracking-[-0.04em] font-light md:font-normal text-black placeholder:text-black/45 md:placeholder:text-black/40 outline-none transition-colors focus:border-black";
const errorCls = "mt-1 text-[12px] md:text-[clamp(12px,0.73vw,14px)] text-[#c2006f]";

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
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
      <div className="px-[calc(var(--q)*20)] pt-[calc(var(--q)*18)] pb-[calc(var(--q)*60)] md:grid md:grid-cols-[44.17vw_35.78vw] md:items-start md:px-0 md:pl-[8.49vw] md:pt-[4.06vw] md:pb-[5.05vw]">
        <h2 className="-ml-[calc(var(--q)*4)] text-[length:calc(var(--q)*69)] font-normal leading-[calc(var(--q)*65)] tracking-[-0.06em] md:ml-0 md:text-[7.8125vw] md:leading-[7.344vw] md:tracking-[-0.06em]">
          {/* Marta's advisor, 10 Nov 23:36 (replaces his 23:13 word): keep it, and follow it at once with who it is for */}
          We are
          <br />
          not for
          <br />
          everyone.
        </h2>

        <div className="mt-[calc(var(--q)*22)] md:mt-[0.99vw]">
          {/* who it is for, 18/34 -0.04em black 69% on the computer, 14/20 on the phone */}
          <p className="w-[calc(var(--q)*330)] text-[length:calc(var(--q)*14)] font-normal leading-[calc(var(--q)*20)] text-black/70 md:w-auto md:text-[0.9375vw] md:leading-[1.77vw] md:tracking-[-0.04em]">
            We work with funded founders who would rather be understood than liked.
          </p>

          {sent ? (
            <p className="mm-fade-in mt-[calc(var(--q)*36)] text-[22px] font-normal leading-[1.15] tracking-[-0.01em] md:mt-[1.04vw] md:text-[clamp(24px,1.9vw,36px)]" role="status">
              Thank you for reaching out.
            </p>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative mt-[calc(var(--q)*36)] md:mt-[1.04vw]">
              <label htmlFor="contact-email" className={labelCls}>Email *</label>
              <input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "contact-email-err" : undefined}
                className={`${inputCls} h-[40px] md:h-[2.76vw] md:min-h-[40px]`}
              />
              {error && <p id="contact-email-err" className={errorCls}>{error}</p>}

              <label htmlFor="contact-message" className={`${labelCls} mt-[12px] md:mt-[0.729vw]`}>Your message</label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="What are you building?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} h-[159px] resize-none py-[10px] leading-[1.3] md:h-[7.86vw] md:py-[0.573vw] md:leading-[1.615vw]`}
              />

              <button
                type="submit"
                disabled={sending}
                aria-busy={sending}
                className="mm-gradient group mt-[12px] inline-flex h-[46px] w-full items-center justify-center gap-[0.3em] text-[18px] font-semibold text-white disabled:opacity-70 md:mt-[1.04vw] md:h-[3.54vw] md:min-h-[44px] md:text-[1.146vw] md:tracking-[-0.017em]"
              >
                {sending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Sending" />
                ) : (
                  <>See if we click <ArrowIcon className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>

              {failed && <p className={`${errorCls} mt-3`} role="alert">Something went wrong. Please try submitting again.</p>}
              {/* Not in her frame: the privacy line approved on 28 Oct, kept in the space under the button so her layout is unchanged */}
              <p className="mt-[14px] text-[11px] font-light leading-[1.45] text-black/50 md:absolute md:left-0 md:right-0 md:top-full md:mt-[0.9vw] md:text-[clamp(10px,0.63vw,12px)]">
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
