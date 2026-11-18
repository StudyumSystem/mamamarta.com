import React, { useCallback, useEffect, useRef, useState } from "react";
import { WHATSAPP_URL, STARS_PER_HOUR, totalStars, savedStars } from "./games/shared.js";

// The paid call with MM Stars (Marta, 17 Nov 16:25, voice: her five approved mockups, straight on the live site;
// every "Straight to Marta" and "Let's talk" leads here, one round WhatsApp button stays at the side).
// Her mockups (sites/mamamarta-call-mockups/dist, call-1…5): her grey #F0F0F0 popup over the page blurred under
// black 50%, Inter, pink #F600A9. Phone: 350 wide, 20 px in from the sides and 28 from the top and bottom, one
// column. Computer: 1400 wide, 30 from the top and bottom, two halves.
// The call is $100 for 30 min; 1 MM✦ = $0.10, Stars take at most $75 off (750 MM✦), so it never costs under $25.
// 1 Book a call (enough Stars) / 2 Not enough Stars, 3 Payment (PayPal), 4 Pick a time (Cal.com), 5 Booked.
// Until the payment server is connected (Milos has her PayPal keys), PAYPAL_READY is false: the PayPal and card
// buttons open WhatsApp with the call, her Stars and the price already written, so no request is lost.
// Steps 4 and 5 come after a real payment only.
export const PAYPAL_READY = false;
export const CAL_URL = "https://cal.com/mamamarta/30min"; // her Cal.com "30 min" event (17 Nov)
export const CALL_PRICE = 100;
export const CALL_MAX_OFF = 75;
const STARS_FOR_MAX = CALL_MAX_OFF * 10;
export const CALL_HASH = "#book-call";

export function openCall() {
  if (typeof window !== "undefined") {
    window.gtag?.("event", "call_open");
    window.dispatchEvent(new CustomEvent("mm-call"));
  }
}

const fmt = (n) => Number(n).toLocaleString("en-US");

const StarBadge = () => (
  <span className="mmc-badge" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path fill="#fff" d="M12 0c.9 6.4 5.1 10.9 12 12-6.9 1.1-11.1 5.6-12 12-.9-6.4-5.1-10.9-12-12C6.9 10.9 11.1 6.4 12 0z" /></svg>
  </span>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>
);
const Controller = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 7h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-3a4 4 0 0 1 4-4z" /><path d="M7 10v3M5.5 11.5h3" /><path d="M16 11h.01M18 12.5h.01" />
  </svg>
);
const Trophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4" /><path d="M16 6h3a3 3 0 0 1-3 4" /><path d="M12 13v4" /><path d="M8.5 20h7" /><path d="M10 17h4v3h-4z" />
  </svg>
);
const CardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="1.5" /><path d="M2.5 10h19" /></svg>
);

// Her mockups' styles (mm.css), kept to their numbers; .mmc- so nothing else on the site is touched.
const CSS = `
.mmc-root { position: fixed; inset: 0; z-index: 60; font-family: "Inter", sans-serif; color: #000; -webkit-font-smoothing: antialiased; }
.mmc-veil { position: absolute; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); touch-action: none; }
.mmc-panel { position: absolute; left: 20px; right: 20px; top: max(28px, env(safe-area-inset-top)); bottom: max(28px, env(safe-area-inset-bottom));
  background: #F0F0F0; display: flex; flex-direction: column; align-items: center; padding: 56px 28px 24px; text-align: center;
  overflow-y: auto; overscroll-behavior: contain; outline: none; }
.mmc-panel p { margin: 0; }
.mmc-top { position: absolute; top: 18px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; line-height: 20px; letter-spacing: -0.04em; color: rgba(0,0,0,.6); }
.mmc-step { text-transform: uppercase; }
.mmc-close { width: 20px; height: 20px; padding: 0; border: 0; background: none; cursor: pointer; display: inline-flex; }
.mmc-close svg { width: 100%; height: 100%; }
.mmc-eyebrow { display: inline-flex; gap: 8px; align-items: center; font-size: 14px; line-height: 31px; letter-spacing: -0.04em; color: rgba(0,0,0,.69); }
.mmc-sub { font-size: 12px; line-height: 20px; letter-spacing: -0.04em; color: rgba(0,0,0,.6); }
.mmc-big { font-weight: 500; font-size: 60px; line-height: 73px; letter-spacing: -0.11em; margin-top: 12px !important; white-space: nowrap; }
.mmc-big s { color: rgba(0,0,0,.3); font-size: 34px; letter-spacing: -0.06em; margin-right: 10px; text-decoration-thickness: 2px; }
.mmc-h2 { font-weight: 500; font-size: 32px; line-height: 36px; letter-spacing: -0.06em; }
.mmc-stars { display: inline-flex; align-items: center; gap: 12px; font-size: 18px; line-height: 31px; letter-spacing: -0.04em; white-space: nowrap; }
.mmc-badge { width: 24px; height: 24px; border-radius: 50%; background: #F600A9; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mmc-badge svg { width: 70%; height: 70%; }
.mmc-bar { position: relative; width: 100%; height: 2px; background: rgba(0,0,0,.17); }
.mmc-bar i { position: absolute; left: 0; top: 0; bottom: 0; background: #F600A9; }
.mmc-rows { width: 100%; text-align: left; }
.mmc-row { display: flex; justify-content: space-between; align-items: baseline; padding: 11px 0; border-bottom: 1px solid rgba(0,0,0,.1);
  font-size: 14px; line-height: 20px; letter-spacing: -0.04em; color: rgba(0,0,0,.7); }
.mmc-row b { font-weight: 400; color: #000; }
.mmc-row.pink b { color: #F600A9; }
.mmc-row.total { border-bottom: 0; color: #000; font-weight: 500; font-size: 16px; }
.mmc-row.total b { font-weight: 500; font-size: 22px; letter-spacing: -0.06em; }
.mmc-field { width: 100%; height: 46px; border: 1px solid rgba(0,0,0,.15); background: #fff; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; font-size: 14px; letter-spacing: -0.02em; gap: 10px; }
.mmc-field:focus-within { border-color: #F600A9; }
.mmc-field input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; font: inherit; color: #000; padding: 0; }
.mmc-field input::placeholder { color: rgba(0,0,0,.4); }
.mmc-ok { font-size: 12px; color: #F600A9; display: inline-flex; gap: 6px; align-items: center; white-space: nowrap; }
.mmc-label { width: 100%; text-align: left; font-size: 12px; line-height: 20px; letter-spacing: -0.04em; color: rgba(0,0,0,.6); margin-bottom: 6px !important; text-transform: uppercase; }
.mmc-btns { width: 100%; display: flex; flex-direction: column; gap: 15px; }
.mmc-btn { height: 46px; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 12px; font-weight: 600; font-size: 16px;
  letter-spacing: -0.023em; border: 1px solid #000; background-color: transparent; color: #000; cursor: pointer; text-decoration: none; font-family: inherit; }
.mmc-btn:not(.grad):not(.pp):not(.card):hover { background: #000; color: #fff; }
.mmc-btn.grad { border: 0; color: #fff; }
.mmc-btn.pp { border: 0; background: #FFC439; color: #003087; font-size: 20px; font-weight: 600; font-style: italic; letter-spacing: -0.03em; border-radius: 4px; gap: 0; }
.mmc-btn.pp span { color: #009cde; }
.mmc-btn.card { border: 0; background: #2C2E2F; color: #fff; border-radius: 4px; font-size: 15px; }
.mmc-btn svg { width: 18px; height: 18px; }
.mmc-back { font-size: 14px; line-height: 20px; letter-spacing: -0.04em; color: rgba(0,0,0,.6); text-decoration: underline; background: none; border: 0; cursor: pointer; font-family: inherit; padding: 0; }
.mmc-back:hover { color: #000; }
.mmc-note { font-size: 11px; line-height: 16px; letter-spacing: -0.02em; color: rgba(0,0,0,.5); }
.mmc-spacer { flex: 1; }
.mmc-cal { width: 100%; background: #fff; border: 0; display: block; height: 520px; }
@media (min-width: 1024px) {
  .mmc-panel { left: 0; right: 0; margin: 0 auto; top: 30px; bottom: 30px; width: min(1400px, calc(100vw - 64px)); padding: 0;
    flex-direction: row; align-items: stretch; text-align: left; }
  .mmc-top { top: 34px; left: 48px; right: 48px; font-size: 16px; }
  .mmc-close { width: 24px; height: 24px; }
  .mmc-side { width: 50%; display: flex; flex-direction: column; justify-content: center; padding: 0 min(110px, 5.73vw) 0 min(120px, 6.25vw); }
  .mmc-side.left { align-items: flex-start; border-right: 1px solid rgba(0,0,0,.08); }
  .mmc-side.right { align-items: stretch; }
  .mmc-eyebrow { font-size: 16px; }
  .mmc-sub { font-size: 16px; line-height: 22px; color: rgba(0,0,0,.69); }
  .mmc-big { font-size: 88px; line-height: 107px; letter-spacing: -0.09em; }
  .mmc-big s { font-size: 48px; }
  .mmc-h2 { font-size: 56px; line-height: 60px; }
  .mmc-stars { font-size: 30px; line-height: 38px; }
  .mmc-badge { width: 38px; height: 38px; }
  .mmc-row { font-size: 16px; line-height: 22px; padding: 14px 0; }
  .mmc-row.total { font-size: 18px; }
  .mmc-row.total b { font-size: 30px; }
  .mmc-field { height: 60px; font-size: 18px; padding: 0 22px; }
  .mmc-ok { font-size: 14px; }
  .mmc-label { font-size: 13px; }
  .mmc-btns { flex-direction: row; gap: 18px; }
  .mmc-btns.col { flex-direction: column; }
  .mmc-btn { height: 64px; font-size: 20px; }
  .mmc-btn svg { width: 22px; height: 22px; }
  .mmc-btn.pp { font-size: 26px; }
  .mmc-btn.card { font-size: 18px; }
  .mmc-back { font-size: 16px; }
  .mmc-note { font-size: 13px; line-height: 19px; }
  .mmc-cal { height: min(620px, calc(100vh - 260px)); }
  .mmc-ph { display: none; }
}
@media (max-width: 1023px) { .mmc-side { display: contents; } }
`;

export default function CallBooking() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("book"); // book | pay | time | booked
  const [stars, setStars] = useState(0);
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [paid, setPaid] = useState(null); // after a real payment: { price, used }
  const [booking, setBooking] = useState(null); // { when } from Cal.com
  const panelRef = useRef(null);
  const returnFocus = useRef(null);

  const show = useCallback(() => {
    const s = savedStars();
    setStars(totalStars());
    setSavedEmail(s?.email || "");
    setEmail((cur) => cur || s?.email || "");
    setStep("book");
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === CALL_HASH) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  // Any link to #book-call on any page opens it (Straight to Marta, Let's talk, Ask Marta), and openCall().
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.(`a[href="${CALL_HASH}"]`);
      if (!a) return;
      e.preventDefault();
      show();
    };
    // the payment server, once on, says the call is paid: { price, used } → step 4, pick a time
    const onPaid = (e) => { setPaid(e.detail || null); setStep("time"); setOpen(true); };
    document.addEventListener("click", onClick);
    window.addEventListener("mm-call", show);
    window.addEventListener("mm-call-paid", onPaid);
    if (window.location.hash === CALL_HASH) show();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("mm-call", show);
      window.removeEventListener("mm-call-paid", onPaid);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    document.documentElement.classList.add("mm-call-open");
    panelRef.current?.focus();
    // caught before a game's own keys (it may be open under this one), so Escape closes only this
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Tab") e.stopPropagation();
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll('button, a[href], input, iframe');
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.documentElement.classList.remove("mm-call-open");
      returnFocus.current?.focus?.();
    };
  }, [open, close]);

  // Cal.com tells the page when the time is booked (step 4 → 5).
  useEffect(() => {
    if (!open || step !== "time") return;
    const onMsg = (e) => {
      let host = "";
      try { host = new URL(e.origin).hostname; } catch { return; }
      if (!/(^|\.)cal\.com$/.test(host)) return;
      const text = typeof e.data === "string" ? e.data : JSON.stringify(e.data || {});
      if (!/bookingSuccessful/i.test(text)) return;
      const start = e.data?.data?.startTime || e.data?.data?.booking?.startTime || null;
      setBooking({ when: start ? new Date(start) : null });
      setStep("booked");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [open, step]);

  if (!open) return null;

  const used = Math.min(stars, STARS_FOR_MAX);
  const off = Math.floor(used / 10);
  const price = CALL_PRICE - off;
  const enough = stars >= STARS_FOR_MAX;
  const missing = STARS_FOR_MAX - used;
  const minutes = Math.max(1, Math.ceil((missing * 60) / STARS_PER_HOUR));
  const mail = email.trim();
  const waText = `Hi Marta, I'd like to book the 30-min call. My MM Stars: ${fmt(stars)}, price $${price}.${mail ? ` My email: ${mail}.` : ""}`;
  const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(waText)}`;

  const playMore = () => {
    close();
    // over a game (its Let's talk): the game's own Play again is right there
    if (document.documentElement.classList.contains("mm-modal-open")) return;
    const games = document.getElementById("my-system");
    if (games) games.scrollIntoView({ behavior: "smooth" });
    else window.location.href = "/#my-system";
  };

  const Top = ({ label }) => (
    <div className="mmc-top">
      <span className="mmc-step">{label}</span>
      <button type="button" className="mmc-close" onClick={close} aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeOpacity=".6" strokeWidth="1.6"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </button>
    </div>
  );
  const PriceRows = ({ totalLabel }) => (
    <>
      <div className="mmc-row"><span>Intro call, 30 min</span><b>${CALL_PRICE}</b></div>
      {off > 0 && <div className="mmc-row pink"><span>{fmt(used)} MM✦STARS</span><b>−${off}</b></div>}
      <div className="mmc-row total"><span>{totalLabel}</span><b>${price}</b></div>
    </>
  );

  let body;
  if (step === "book") {
    body = (
      <>
        <Top label="Book a call · 1 of 4" />
        <div className="mmc-side left">
          <p className="mmc-eyebrow">Intro call with Marta · 30 min</p>
          <p className="mmc-big">{off > 0 && <s>${CALL_PRICE}</s>}${price}</p>
          <p className="mmc-sub">{off > 0 ? `Your MM✦STARS take $${off} off.` : `Your MM✦STARS can take up to $${CALL_MAX_OFF} off.`}</p>
          <div style={{ width: "100%", maxWidth: 300, marginTop: 34 }}>
            <p className="mmc-stars" style={{ margin: "0 auto" }}>{fmt(used)} / {fmt(STARS_FOR_MAX)} MM✦STARS <StarBadge /></p>
            <div className="mmc-bar" style={{ marginTop: 14 }}><i style={{ width: `${(used / STARS_FOR_MAX) * 100}%` }} /></div>
            {!enough && (
              <p className="mmc-sub" style={{ marginTop: 12 }}>
                {fmt(missing)} more Stars for the full ${CALL_MAX_OFF} off.<br />About {minutes} minute{minutes === 1 ? "" : "s"} of play.
              </p>
            )}
          </div>
        </div>
        <div className="mmc-side right">
          {enough ? (
            <>
              <div style={{ width: "100%", marginTop: 34 }}>
                <label className="mmc-label" htmlFor="mmc-email" style={{ display: "block" }}>Email with your saved Stars</label>
                <div className="mmc-field">
                  <input id="mmc-email" type="email" autoComplete="email" placeholder="you@startup.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  {stars > 0 && <span className="mmc-ok">✓ {fmt(used)} found</span>}
                </div>
              </div>
              <div className="mmc-rows" style={{ marginTop: 18 }}><PriceRows totalLabel="To pay" /></div>
              <div className="mmc-spacer mmc-ph" />
              <div className="mmc-btns" style={{ marginTop: 28 }}>
                <button type="button" className="mmc-btn grad mm-gradient" onClick={() => setStep("pay")}>Pay ${price} <Arrow /></button>
              </div>
              <p className="mmc-note" style={{ marginTop: 14 }}>1 MM✦ = $0.10. Stars can take up to ${CALL_MAX_OFF} off, once per person.</p>
            </>
          ) : (
            <>
              <div className="mmc-rows" style={{ marginTop: 26 }}><PriceRows totalLabel="To pay now" /></div>
              <div className="mmc-spacer mmc-ph" />
              <div className="mmc-btns col" style={{ marginTop: 28 }}>
                <button type="button" className="mmc-btn grad mm-gradient" onClick={playMore}>Play to earn more <Controller /></button>
                <button type="button" className="mmc-btn" onClick={() => setStep("pay")}>Pay ${price} now <Arrow /></button>
              </div>
              <p className="mmc-note" style={{ marginTop: 14 }}>
                {savedEmail ? `Your Stars stay saved to ${savedEmail}. Come back when you have more.` : "Your Stars stay on this device. Come back when you have more."}
              </p>
            </>
          )}
        </div>
      </>
    );
  } else if (step === "pay") {
    // Until the payment server is on, both buttons open WhatsApp with the call, the Stars and the price written.
    const payProps = PAYPAL_READY ? {} : { href: waLink, target: "_blank", rel: "noreferrer", onClick: () => window.gtag?.("event", "call_pay_click", { value: price, currency: "USD" }) };
    body = (
      <>
        <Top label="Payment · 2 of 4" />
        <div className="mmc-side left">
          <p className="mmc-eyebrow">Secure payment</p>
          <p className="mmc-big">${price}</p>
          <p className="mmc-sub">
            Intro call with Marta, 30 min.<br />
            {PAYPAL_READY ? "You pick the time right after paying." : "Marta confirms the time with you on WhatsApp."}
          </p>
          <div className="mmc-rows" style={{ marginTop: 30, maxWidth: 420 }}><PriceRows totalLabel="Total" /></div>
        </div>
        <div className="mmc-side right">
          <p className="mmc-label" style={{ marginTop: 30 }}>Pay with</p>
          <div className="mmc-btns col">
            <a className="mmc-btn pp" {...payProps}>Pay<span>Pal</span></a>
            <a className="mmc-btn card" {...payProps}><CardIcon />Debit or credit card</a>
          </div>
          <p className="mmc-note" style={{ marginTop: 16 }}>
            {PAYPAL_READY
              ? "Paid through PayPal. A card works without a PayPal account."
              : "For now the payment opens in WhatsApp. Marta sends you the PayPal link; a card works without a PayPal account."}
          </p>
          <div className="mmc-spacer mmc-ph" />
          <p style={{ marginTop: 28, textAlign: "center" }}><button type="button" className="mmc-back" onClick={() => setStep("book")}>Back</button></p>
        </div>
      </>
    );
  } else if (step === "time") {
    body = (
      <>
        <Top label="Pick a time · 3 of 4" />
        <div className="mmc-side left">
          <p className="mmc-eyebrow" style={{ color: "#F600A9" }}>✓ Payment received · ${paid?.price ?? price}</p>
          <p className="mmc-h2" style={{ marginTop: 6 }}>Pick a time</p>
          <p className="mmc-sub" style={{ marginTop: 6 }}>30 min video call. Times are in your time zone.</p>
        </div>
        <div className="mmc-side right">
          {CAL_URL && (
            <iframe className="mmc-cal" style={{ marginTop: 16 }} title="Pick a time" src={`${CAL_URL}?embed=true${mail ? `&email=${encodeURIComponent(mail)}` : ""}`} />
          )}
          <p className="mmc-note" style={{ marginTop: 10, textAlign: "center" }}>Booking by Cal.com, with Marta's calendar.</p>
        </div>
      </>
    );
  } else {
    const when = booking?.when;
    body = (
      <>
        <Top label="Booked · 4 of 4" />
        <div className="mmc-side left">
          <p className="mmc-eyebrow"><Trophy />You're booked</p>
          <p className="mmc-big" style={{ marginTop: 4 }}>{when ? when.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }) : "Booked"}</p>
          <p className="mmc-sub">
            {when ? `${when.toLocaleDateString("en-GB", { month: "long" })} · ${when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ` : ""}30 min video call
          </p>
          <p className="mmc-sub" style={{ marginTop: 20 }}>The invite and the video link are in your email{mail ? "," : "."}{mail && <><br />{mail}.</>}</p>
        </div>
        <div className="mmc-side right">
          <div style={{ width: "100%", marginTop: 56 }}>
            <p className="mmc-stars">0 / 20,000 MM✦STARS <StarBadge /></p>
            <p className="mmc-sub" style={{ marginTop: 6 }}>{fmt(paid?.used ?? used)} Stars paid for this call. The Stars you earn from now on unlock up to $2,000 off a design project.</p>
            <div className="mmc-bar" style={{ marginTop: 18 }}><i style={{ width: 0 }} /></div>
          </div>
          <div className="mmc-spacer mmc-ph" />
          <div className="mmc-btns col" style={{ marginTop: 34 }}>
            <button type="button" className="mmc-btn grad mm-gradient" onClick={playMore}>Play to earn more <Controller /></button>
            <button type="button" className="mmc-btn" onClick={close}>Back to the site</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mmc-root mm-fade-in" role="dialog" aria-modal="true" aria-label="Book a call with Marta">
      <style>{CSS}</style>
      <div className="mmc-veil" onClick={close} aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1} className="mmc-panel">{body}</div>
    </div>
  );
}
