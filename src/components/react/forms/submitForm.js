// The one place the two Collaborate forms send from (MM-C06). The backend (storage + emails) is Milos's;
// when it is ready, set FORM_ENDPOINT and nothing else changes.
// Until then the preview shows the success screen after a short wait, so the flow can be reviewed.
// BEFORE LAUNCH: FORM_ENDPOINT must be set, otherwise visitors would see "sent" while nothing is saved.

export const FORM_ENDPOINT = "";

// type: "suggest_game" | "custom_brand_experience"
// Resolves only when the backend confirms it saved the submission; throws otherwise.
export async function submitForm(type, data, submissionId) {
  if (!FORM_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, preview: true };
  }
  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // submissionId lets the backend ignore a repeated send (double click, retry): one confirmation per submission.
    body: JSON.stringify({ type, submissionId, ...data }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}
