// The one place the two Collaborate forms send from (MM-C06).
// Sent through Web3Forms (free): every submission arrives as an email in Marta's inbox.
// The access key comes from web3forms.com (Marta types her email there, the key arrives by email).
// It is a public key, made to sit in website code, not a password.
// Until it is set the preview shows the success screen after a short wait, so the flow can be reviewed.
// BEFORE LAUNCH: WEB3FORMS_KEY must be set, otherwise visitors would see "sent" while nothing is saved.

export const WEB3FORMS_KEY = "ee2f7258-9626-488c-b98e-65b49b21d9eb";
const ENDPOINT = "https://api.web3forms.com/submit";

const SUBJECTS = {
  suggest_game: "New game idea from mamamarta.com",
  custom_brand_experience: "New brand request from mamamarta.com",
  contact: "New message from mamamarta.com",
};

// type: "suggest_game" | "custom_brand_experience" | "contact"
// Resolves only when Web3Forms confirms it took the submission; throws otherwise.
export async function submitForm(type, data, submissionId) {
  if (!WEB3FORMS_KEY) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }
  // Lists (checked options) read better in the email as one line.
  const fields = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v])
  );
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: SUBJECTS[type] || "New message from mamamarta.com",
      from_name: "mamamarta.com",
      form: type,
      // submissionId shows in the email, so a repeated send (double click, retry) is easy to spot.
      submission_id: submissionId,
      ...fields,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success) throw new Error(body.message || `HTTP ${res.status}`);
  return { ok: true };
}
