type ContactSpamPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
  formStartedAt?: unknown;
};

export type SpamCheckResult = {
  isSpam: boolean;
  score: number;
  reasons: string[];
};

const suspiciousTerms = [
  'casino',
  'slot gacor',
  'judol',
  'crypto giveaway',
  'free money',
  'pinjaman cepat',
  'seo backlink',
];

function countUrls(text: string) {
  return (text.match(/https?:\/\//gi) ?? []).length;
}

function hasExcessiveRepeatedChars(text: string) {
  return /(.)\1{8,}/.test(text);
}

export function checkContactSpam(payload: ContactSpamPayload): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;

  const name = String(payload.name ?? '');
  const subject = String(payload.subject ?? '');
  const message = String(payload.message ?? '');
  const email = String(payload.email ?? '');
  const combined = `${name} ${email} ${subject} ${message}`.toLowerCase();
  const honeypot = String(payload.company ?? '').trim();
  const formStartedAt = Number(payload.formStartedAt ?? 0);
  const elapsedMs = Date.now() - formStartedAt;

  if (honeypot.length > 0) {
    score += 100;
    reasons.push('Honeypot terisi.');
  }

  if (!formStartedAt || Number.isNaN(formStartedAt)) {
    score += 25;
    reasons.push('Timestamp form tidak valid.');
  } else if (elapsedMs < 2_500) {
    score += 35;
    reasons.push('Form dikirim terlalu cepat.');
  } else if (elapsedMs > 1000 * 60 * 60 * 24) {
    score += 15;
    reasons.push('Timestamp form terlalu lama.');
  }

  const urlCount = countUrls(message);
  if (urlCount >= 3) {
    score += 30;
    reasons.push('Terlalu banyak URL.');
  }

  if (hasExcessiveRepeatedChars(combined)) {
    score += 20;
    reasons.push('Karakter berulang berlebihan.');
  }

  const matchedTerms = suspiciousTerms.filter((term) => combined.includes(term));
  if (matchedTerms.length > 0) {
    score += matchedTerms.length * 20;
    reasons.push('Mengandung kata yang sering muncul pada spam.');
  }

  if (message.length > 3_000) {
    score += 15;
    reasons.push('Pesan terlalu panjang.');
  }

  return {
    isSpam: score >= 40,
    score,
    reasons,
  };
}
