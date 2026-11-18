// The one place the two Collaborate forms send from (MM-C06).
// Sent through Web3Forms (free): every submission arrives as an email in Marta's inbox.
// The access key comes from web3forms.com (Marta types her email there, the key arrives by email).
// It is a public key, made to sit in website code, not a password.
// Until it is set the preview shows the success screen after a short wait, so the flow can be reviewed.
// BEFORE LAUNCH: WEB3FORMS_KEY must be set, otherwise visitors would see "sent" while nothing is saved.

export const WEB3FORMS_KEY = "ee2f7258-9626-488c-b98e-65b49b21d9eb";
const ENDPOINT = "https://api.web3forms.com/submit";

// EmailJS (Marta's account, 10 Nov): public ids, made to sit in website code.
const EMAILJS = { service: "service_za6er8h", template: "template_wpz3ua3", publicKey: "89f8-P89SrmdrMwAL" };
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

const SUBJECTS = {
  suggest_game: "Game idea",
  custom_brand_experience: "Brand request",
  contact: "",
};
// The letter the visitor gets back (EmailJS Auto-Reply, Marta's frame Email_Letter_Suggest a game, 10 Nov):
// one template, the heading, the paragraphs and the subject come from here. The game letter is her text; the
// other two are placeholders in her tone until she sends hers.
const REPLIES = {
  suggest_game: {
    subject: "Good ideas deserve to be played with!",
    heading: "Good ideas deserve<br>to be played with!",
    body: [
      "Every great experience starts with an idea. Sometimes, the most unexpected ones turn out to be the most interesting.",
      "Your game suggestion has reached us. We'll give it a thoughtful look, and if we see an opportunity to bring it into our collection, you'll hear from us.",
      "In the meantime, there's always another game to play.",
    ],
  },
  custom_brand_experience: {
    subject: "Your brand request reached Marta",
    heading: "Your brand request<br>reached Marta.",
    body: [
      "Thank you for telling us about your brand. Marta reads every request herself.",
      "We'll look at what you're building and come back to you with the next step.",
      "In the meantime, there's always another game to play.",
    ],
  },
  contact: {
    subject: "Your message reached Marta",
    heading: "Your message<br>reached Marta.",
    body: [
      "Thank you for writing. Marta reads every message herself, and you'll hear back from her soon.",
      "In the meantime, there's always another game to play.",
    ],
  },
};
const P = 'style="margin:0 0 24px;font-size:17px;line-height:1.5;color:#555555;"';
const FORM_NAMES = {
  suggest_game: "Suggest a game",
  custom_brand_experience: "Create for my brand",
  contact: "Contact form",
};

// "Save my Stars" (games' end screen, 11 Nov): the visitor's email and their MM✦STARS reach Marta's inbox
// through Web3Forms only, so no auto-reply letter goes out (none is written for Stars yet).
export async function sendStars(email, total, games) {
  if (typeof window !== "undefined") window.gtag?.("event", "stars_saved", { value: total });
  if (!WEB3FORMS_KEY) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `MM Stars saved: ${total} — ${email}`,
      from_name: email,
      replyto: email,
      email,
      stars: String(total),
      games: games || "",
      form: "Save my Stars",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body.message || `HTTP ${res.status}`);
  return { ok: true };
}

// type: "suggest_game" | "custom_brand_experience" | "contact"
// Resolves only when Web3Forms confirms it took the submission; throws otherwise.
export async function submitForm(type, data, submissionId) {
  if (!WEB3FORMS_KEY) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }
  // Marta, 10 Nov: in her inbox she should see at once who wrote and what. So the sender's name (or email)
  // is the sender line, the subject carries the first words of the message, and the email lists the message
  // first, then who wrote; the form's name and the ref (to spot a double send) go last.
  const list = (v) => (Array.isArray(v) ? v.join(", ") : v);
  const who = data.name || data.email || "Someone";
  const gist = String(data.message || data.idea || list(data.choices) || "").replace(/\s+/g, " ").trim();
  const short = gist.length > 70 ? `${gist.slice(0, 67).trimEnd()}…` : gist;
  const fields = {
    message: data.message,
    idea: data.idea,
    name: data.name,
    email: data.email,
    company: data.company,
    interested_in: list(data.choices),
    marketing_emails: data.marketingOptIn === undefined ? undefined : data.marketingOptIn ? "yes" : "no",
  };
  // message first, then who (Marta, 10 Nov 15:28): "Can we talk on Friday?" — anna@studio.com
  const subject = `${SUBJECTS[type] ? `${SUBJECTS[type]}: ` : ""}${short ? `"${short}" — ` : ""}${who}`;

  // Marta, 10 Nov 21:59: EmailJS first, so the whole email is hers (message on top, then who wrote, nothing
  // else). Her template: Subject {{subject}}, Reply To {{email}}, body {{message}} — {{who}}, {{email}}.
  // The other forms' extra fields go under the message. Web3Forms stays behind it, so nothing is lost if
  // EmailJS refuses (e.g. its 200 a month are used up).
  const extras = [
    data.message && data.idea ? `Idea: ${data.idea}` : "",
    data.company ? `Company: ${data.company}` : "",
    fields.interested_in ? `Interested in: ${fields.interested_in}` : "",
    fields.marketing_emails ? `Marketing emails: ${fields.marketing_emails}` : "",
  ].filter(Boolean);
  const text = String(data.message || data.idea || "").trim();
  try {
    const ej = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS.service,
        template_id: EMAILJS.template,
        user_id: EMAILJS.publicKey,
        template_params: {
          subject,
          message: [text, ...(extras.length ? ["", ...extras] : [])].join("\n"),
          who: data.name || data.email || "Someone",
          email: data.email || "",
          // the names EmailJS's own Contact Us template uses (Marta kept it, 10 Nov 22:52: "A message by has been received")
          name: data.name || data.email || "Someone",
          title: short || SUBJECTS[type] || "New message",
          // for the Auto-Reply letter
          greeting: data.name ? `Hi ${String(data.name).trim().split(/\s+/)[0]}!` : "Hi!",
          reply_subject: (REPLIES[type] || REPLIES.contact).subject,
          reply_heading: (REPLIES[type] || REPLIES.contact).heading,
          reply_body: (REPLIES[type] || REPLIES.contact).body.map((t) => `<p ${P}>${t}</p>`).join(""),
          // 14 Nov (Marta: the fur banner didn't load in her Gmail, mamamarta.com isn't live yet): the letter's
          // banner comes from the site the form was sent from (the preview now, mamamarta.com after the launch)
          banner_desktop: `${location.origin}/assets/email/banner-desktop.png`,
          banner_mobile: `${location.origin}/assets/email/banner-mobile.png`,
        },
      }),
    });
    if (ej.ok) return { ok: true };
  } catch {
    // falls through to Web3Forms
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: who,
      replyto: data.email,
      ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== "")),
      form: FORM_NAMES[type] || type,
      ref: submissionId,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body.message || `HTTP ${res.status}`);
  return { ok: true };
}
