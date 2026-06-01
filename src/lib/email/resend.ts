import type { ContactPayload } from '@/lib/pricing/schema';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export type EmailNotificationResult = {
  skipped: boolean;
  ok: boolean;
  error?: string;
};

export async function sendContactNotification(payload: ContactPayload): Promise<EmailNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_TO;
  const from = process.env.CONTACT_NOTIFICATION_FROM ?? 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey || !to) {
    return { skipped: true, ok: true };
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2>Pesan baru dari portfolio</h2>
      <p><strong>Nama:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
      <hr />
      <p>${escapeHtml(payload.message).replaceAll('\n', '<br />')}</p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: payload.email,
      subject: `Portfolio Contact: ${payload.subject}`,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { skipped: false, ok: false, error: errorText };
  }

  return { skipped: false, ok: true };
}
