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
const FORM_NAMES = {
  suggest_game: "Suggest a game",
  custom_brand_experience: "Create for my brand",
  contact: "Contact form",
};

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
