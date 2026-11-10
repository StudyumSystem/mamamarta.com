// The one place the two Collaborate forms send from (MM-C06).
// Sent through Web3Forms (free): every submission arrives as an email in Marta's inbox.
// The access key comes from web3forms.com (Marta types her email there, the key arrives by email).
// It is a public key, made to sit in website code, not a password.
// Until it is set the preview shows the success screen after a short wait, so the flow can be reviewed.
// BEFORE LAUNCH: WEB3FORMS_KEY must be set, otherwise visitors would see "sent" while nothing is saved.

export const WEB3FORMS_KEY = "ee2f7258-9626-488c-b98e-65b49b21d9eb";
const ENDPOINT = "https://api.web3forms.com/submit";

const SUBJECTS = {
  suggest_game: "Game idea",
  custom_brand_experience: "Brand request",
  contact: "Message",
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
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `${SUBJECTS[type] || SUBJECTS.contact}: ${who}${short ? ` · "${short}"` : ""}`,
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
