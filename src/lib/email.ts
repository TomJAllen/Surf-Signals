// Sending email (password reset links) through Resend's HTTP API.
// Needs RESEND_API_KEY in Vercel; EMAIL_FROM is optional. Without a key, email
// is switched off and the app falls back to "contact us".

const DEFAULT_FROM = "Patrol Ready <noreply@patrolready.au>";

export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(email: Email, fetchFn: typeof fetch = fetch): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetchFn("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || DEFAULT_FROM, ...email }),
    });
    if (!res.ok) console.error("Email not sent:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("Email not sent:", err);
    return false;
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function resetEmail(to: string, link: string, minutes: number): Email {
  const text = [
    "Someone (hopefully you) asked to reset your Patrol Ready password.",
    "",
    `Choose a new password here (the link works once, for ${minutes} minutes):`,
    link,
    "",
    "If you didn't ask for this, ignore this email. Your password won't change.",
  ].join("\n");
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.5;color:#1C1917;max-width:480px">
<p style="font-size:22px;font-weight:800;margin:0 0 16px">Patrol Ready</p>
<p>Someone (hopefully you) asked to reset your Patrol Ready password.</p>
<p><a href="${escape(link)}" style="display:inline-block;background:#DA291C;color:#fff;font-weight:700;text-decoration:none;padding:12px 20px;border:2px solid #1C1917;border-radius:6px">Choose a new password</a></p>
<p style="font-size:14px;color:#57534E">The link works once, for ${minutes} minutes. If you didn't ask for this, ignore this email. Your password won't change.</p>
</div>`;
  return { to, subject: "Reset your Patrol Ready password", text, html };
}
