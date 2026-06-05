import { NextResponse } from 'next/server';
import { createOpenAIClient } from '@/lib/openai/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  calculateEstimate,
  createHeuristicAnalysis,
} from '@/lib/pricing/estimate';
import { projectAnalysisSchema } from '@/lib/pricing/schema';
import { allowedFeatureKeys } from '@/lib/pricing/config';
import {
  getClientIp,
  getRateLimitHeaders,
  rateLimit,
} from '@/lib/security/rate-limit';

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'project_type',
    'complexity',
    'features',
    'detected_feature_keys',
    'summary',
    'questions',
  ],
  properties: {
    project_type: {
      type: 'string',
      enum: [
        'landing_page',
        'company_profile',
        'portfolio',
        'web_app',
        'mobile_app',
        'ai_chatbot',
      ],
    },
    complexity: {
      type: 'string',
      enum: ['simple', 'medium', 'complex'],
    },
    features: {
      type: 'array',
      items: { type: 'string' },
    },
    detected_feature_keys: {
      type: 'array',
      items: {
        type: 'string',
        enum: allowedFeatureKeys,
      },
    },
    summary: { type: 'string' },
    questions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

const PORTFOLIO_ASSISTANT_INSTRUCTIONS = `
Kamu adalah AI Portfolio Assistant milik Tegar Sang Putra.

Tujuan utama:
- Menjawab dengan gaya percakapan natural, mirip ChatGPT, tetapi tetap relevan dengan website portfolio Tegar.
- Jika user bertanya umum, jawab pertanyaan umum itu secara normal.
- Jika user bertanya teknologi, jelaskan sesuai konteks pertanyaannya. Jangan langsung memaksa ke estimasi harga.
- Jika user membahas project, bantu terjemahkan kebutuhan user ke bahasa yang mudah dipahami.
- Jika user masih awam, jelaskan sederhana dan hindari istilah teknis berlebihan.
- Jika user bertanya harga atau meminta dibuatkan project, beri estimasi awal yang realistis.

Profil Tegar:
- Tegar adalah Web Developer, UI/UX Designer, dan Mobile App Developer.
- Layanan yang relevan: website portfolio, landing page, company profile, website bisnis, web app/admin dashboard, mobile app sederhana-menengah, UI/UX design, redesign UI, integrasi API, database, CRUD, dan deployment.
- Tech stack yang boleh dijelaskan: HTML, CSS, JavaScript, React, Next.js, PHP, Laravel, Node.js, Python, Kotlin, React Native, MySQL, PostgreSQL, Figma, Git, Docker, hosting/deployment.

Aturan percakapan:
- Jawab sesuai pertanyaan terakhir dan riwayat percakapan.
- Jangan mengarang fitur yang tidak diminta user.
- Jangan menyimpulkan user butuh login, admin panel, database, payment, multi-role, AI, atau export PDF kecuali user menyebutnya langsung atau konteksnya jelas.
- Jangan semua jawaban diarahkan ke order. Boleh menjelaskan konsep dulu.
- Untuk pertanyaan umum, jawab umum. Setelah itu baru hubungkan ke project jika relevan.
- Untuk pertanyaan teknologi, jelaskan pilihan dan alasan praktisnya.
- Jika user bertanya tidak jelas, tanya maksimal 3 pertanyaan klarifikasi.
- Jawaban ringkas-menengah. Panjang hanya jika user meminta detail.

Aturan harga mahasiswa:
- Jika konteksnya mahasiswa, tugas kuliah, skripsi, tugas akhir, atau project kampus, gunakan harga khusus mahasiswa.
- Range khusus mahasiswa: Rp400.000 - Rp1.200.000 sesuai kompleksitas.
- Project mahasiswa sederhana: Rp400.000 - Rp700.000.
- Project mahasiswa menengah: Rp700.000 - Rp950.000.
- Project mahasiswa cukup kompleks: Rp950.000 - Rp1.200.000.
- Jika scope terlalu besar, sarankan penyederhanaan fitur agar tetap masuk maksimal Rp1.200.000.
- Jangan memberi estimasi puluhan juta untuk konteks mahasiswa/tugas kuliah.
`;

const PRICE_ANALYSIS_INSTRUCTIONS = `
Kamu adalah analis kebutuhan proyek digital untuk website portfolio milik Tegar Sang Putra.

Tugasmu hanya mengubah kebutuhan user menjadi JSON sesuai schema.
Jangan menentukan harga di JSON.
Jangan menambah fitur yang tidak disebutkan user.
Jangan melebih-lebihkan kompleksitas.
Jika user menyebut mahasiswa, tugas kuliah, skripsi, tugas akhir, project kampus, atau aplikasi kuliah, klasifikasikan scope secara konservatif.
Jika user mengurangi fitur atau menjelaskan scope lebih sederhana, complexity harus turun atau tetap, bukan naik.
Gunakan detected_feature_keys hanya dari enum yang tersedia.
`;

type ChatRole = 'user' | 'assistant';

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  message?: string;
  messages?: IncomingMessage[];
};

type ResponseSource = 'openai' | 'local';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit({
    key: `chat:${ip}`,
    limit: 12,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak request chatbot. Coba lagi sebentar.' },
      { status: 429, headers: getRateLimitHeaders(limit) },
    );
  }

  try {
    const rawBody = (await request.json()) as ChatRequestBody;
    const body = normalizeRequestBody(rawBody);

    const latestMessage = getLatestUserMessage(body);
    const conversationText = buildConversationText(body);
    const userOnlyConversationText = buildUserOnlyConversationText(body);
    

    if (!latestMessage || latestMessage.trim().length < 3) {
      return NextResponse.json(
        { error: 'Pesan terlalu pendek.' },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }

    if (latestMessage.length > 2_000) {
      return NextResponse.json(
        { error: 'Pesan maksimal 2000 karakter.' },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }
function removeLatestUserMessage(
  userOnlyConversationText: string,
  latestMessage: string,
) {
  const lines = userOnlyConversationText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const latestLine = `User: ${latestMessage.trim()}`;

  return lines.filter((line) => line !== latestLine).join('\n');
}

function hasStudentProjectServiceContext(text: string) {
  return (
    hasStudentTerms(text) &&
    /(tugas|project|proyek|skripsi|tugas akhir|kampus|kuliah|dosen|website|web|aplikasi|mobile app|sistem)/i.test(
      text,
    )
  );
}
    const client = createOpenAIClient();
    const pricingIntent = shouldUsePricingMode(
      latestMessage,
      userOnlyConversationText,
    );
    const studentPricingContext = isStudentPricingContext(
      latestMessage,
      userOnlyConversationText,
    );

    if (!pricingIntent) {
      const { reply, source } = await createConversationalReply({
        client,
        latestMessage,
        conversationText,
      });

      await saveChatLog({
        request,
        ip,
        userMessage: latestMessage,
        reply,
        estimate: null,
      });

      return NextResponse.json(
        {
          reply,
          estimate: null,
          source,
        },
        { headers: getRateLimitHeaders(limit) },
      );
    }

    const { analysis, source } = await createPricingAnalysis({
      client,
      userOnlyConversationText,
    });

    const rawEstimate = calculateEstimate(analysis);
    const estimate = applyPricingGuards(
      rawEstimate,
      analysis,
      studentPricingContext,
    );
    const reply = formatPortfolioEstimateReply(
      estimate,
      analysis,
      studentPricingContext,
      latestMessage,
    );

    await saveChatLog({
      request,
      ip,
      userMessage: latestMessage,
      reply,
      estimate,
    });

    return NextResponse.json(
      {
        reply,
        estimate,
        source,
      },
      { headers: getRateLimitHeaders(limit) },
    );
  } catch (error) {
    console.error('Chatbot route failed:', error);

    return NextResponse.json(
      {
        error:
          'Chatbot gagal memproses pesan karena request tidak valid atau server error.',
      },
      { status: 500, headers: getRateLimitHeaders(limit) },
    );
  }
}

function normalizeRequestBody(body: ChatRequestBody): ChatRequestBody {
  const messages = body.messages
    ?.filter((message) => {
      if (message.role !== 'user' && message.role !== 'assistant') return false;
      if (!message.content?.trim()) return false;

      const content = message.content.trim();
      const isOldInitialAssistantMessage =
        message.role === 'assistant' &&
        /jelaskan project yang ingin dibuat|saya akan bantu analisis kompleksitas|halo, saya asisten ai portfolio tegar/i.test(
          content,
        );

      return !isOldInitialAssistantMessage;
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

  return {
    message: body.message?.trim(),
    messages,
  };
}

function getLatestUserMessage(body: ChatRequestBody) {
  if (body.message?.trim()) {
    return body.message.trim();
  }

  const latestUserMessage = body.messages
    ?.filter((message) => message.role === 'user')
    .at(-1);

  return latestUserMessage?.content?.trim() ?? '';
}

function buildConversationText(body: ChatRequestBody) {
  if (body.messages?.length) {
    return body.messages
      .filter(
        (message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          message.content?.trim(),
      )
      .slice(-10)
      .map((message) => {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${message.content.trim()}`;
      })
      .join('\n');
  }

  return body.message?.trim() ?? '';
}

function buildUserOnlyConversationText(body: ChatRequestBody) {
  if (body.messages?.length) {
    return body.messages
      .filter((message) => message.role === 'user' && message.content?.trim())
      .slice(-10)
      .map((message) => `User: ${message.content.trim()}`)
      .join('\n');
  }

  return body.message?.trim() ?? '';
}

function hasPricingIntent(text: string) {
  if (/berapa\s+(lama|hari|minggu|bulan)|durasi|timeline/i.test(text)) {
    return /harga|biaya|budget|estimasi harga|rate|tarif|juta|ribu|mahal|murah|nego|paket harga/i.test(
      text,
    );
  }

  return /harga|biaya|budget|estimasi harga|estimasi|rate|tarif|juta|ribu|mahal|murah|nego|paket harga|berapa\s+(harga|biaya|budget|tarif|rate)|kena\s+berapa|habis\s+berapa|bayar\s+berapa/i.test(
    text,
  );
}

function hasProjectBuildIntent(text: string) {
  return /(mau|ingin|pengen|butuh|order|pesan|buatkan|bikinkan|pembuatan|membuat|bikin|buat|minta dibuatkan|butuh dibuatkan)\b[\s\S]{0,120}\b(website|web|aplikasi|mobile app|landing page|company profile|portfolio|portofolio|dashboard|admin|chatbot|ui\/ux|ui|ux|desain|sistem|project|proyek)/i.test(
    text,
  );
}

function hasStudentTerms(text: string) {
  return /mahasiswa|tugas kuliah|skripsi|tugas akhir|project kampus|proyek kampus|aplikasi kuliah|website kuliah|mobile app kuliah|kampus|dosen/i.test(
    text,
  );
}

function hasNonStudentProjectTerms(text: string) {
  return /bisnis|usaha|umkm|restoran|toko|company profile|perusahaan|startup|klien|client|komersial|produk jualan|landing page bisnis|website bisnis|admin kantor|operasional/i.test(
    text,
  );
}

function isNewProjectSignal(text: string) {
  return /project baru|proyek baru|beda project|beda proyek|kalau untuk|untuk bisnis|untuk usaha|untuk klien|untuk perusahaan|untuk toko|untuk restoran|saya mau bikin|aku mau bikin|mau bikin/i.test(
    text,
  );
}

function isTechnologyQuestion(text: string) {
  return /tech stack|stack|framework|bahasa pemrograman|tools|library|teknologi apa|pakai teknologi apa|teknologi yang cocok|lebih baik pakai|awam.*teknologi|teknologi.*awam|belum paham.*teknologi|apa itu/i.test(
    text,
  );
}

function isContinuationMessage(text: string) {
  return /kalau|kalo|jika|apabila|misal|misalnya|terus|lanjut|ditambah|tambah|dikurangi|ubah|pakai|menggunakan|dengan|fiturnya|yang tadi|aplikasi itu|website itu|project itu|proyek itu|berarti|jadi/i.test(
    text,
  );
}

function hasFeatureAdditionIntent(text: string) {
  return /export|pdf|excel|laporan|login|admin|database|crud|dashboard|payment|pembayaran|notifikasi|upload|api|integrasi|halaman|screen|fitur|role|user|data/i.test(
    text,
  );
}
function removeLatestUserMessage(
  userOnlyConversationText: string,
  latestMessage: string,
) {
  const lines = userOnlyConversationText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const latestLine = `User: ${latestMessage.trim()}`;

  return lines.filter((line) => line !== latestLine).join('\n');
}

function hasStudentProjectServiceContext(text: string) {
  return (
    hasStudentTerms(text) &&
    /(tugas|project|proyek|skripsi|tugas akhir|kampus|kuliah|dosen|website|web|aplikasi|mobile app|sistem)/i.test(
      text,
    )
  );
}

function isPricingContinuation(
  latestMessage: string,
  userOnlyConversationText: string,
) {
  const previousContext = removeLatestUserMessage(
    userOnlyConversationText,
    latestMessage,
  );

  const hasPreviousPricingOrProjectContext =
    hasPricingIntent(previousContext) ||
    hasStudentTerms(previousContext) ||
    hasServiceOrPricingIntent(previousContext);

  return (
    (isContinuationMessage(latestMessage) ||
      hasFeatureAdditionIntent(latestMessage)) &&
    hasPreviousPricingOrProjectContext
  );
}

function shouldUsePricingMode(
  latestMessage: string,
  userOnlyConversationText: string,
) {
  const learningIntent = hasLearningIntent(latestMessage);
  const technologyQuestion = isTechnologyQuestion(latestMessage);
  const explicitPricingIntent = hasPricingIntent(latestMessage);
  const serviceOrPricingIntent = hasServiceOrPricingIntent(latestMessage);
  const projectBuildIntent = hasProjectBuildIntent(latestMessage);
  const studentProjectServiceContext =
    hasStudentProjectServiceContext(latestMessage);

  /**
   * Guard utama:
   * Jika user sedang belajar, masih awam, atau bertanya "mulai dari mana",
   * jangan masuk estimator kecuali dia eksplisit bertanya harga/jasa/order.
   */
  if (
    learningIntent &&
    !explicitPricingIntent &&
    !serviceOrPricingIntent &&
    !studentProjectServiceContext
  ) {
    return false;
  }

  /**
   * Pertanyaan teknologi umum tidak boleh masuk estimator.
   * Contoh:
   * "aku masih awam teknologi, mulai dari mana?"
   * "kalau mau bikin website belajar apa dulu?"
   */
  if (
    technologyQuestion &&
    !explicitPricingIntent &&
    !serviceOrPricingIntent &&
    !studentProjectServiceContext
  ) {
    return false;
  }

  /**
   * Kalau user jelas bertanya harga/biaya/budget/estimasi,
   * langsung masuk estimator.
   */
  if (explicitPricingIntent) {
    return true;
  }

  /**
   * Follow-up hanya masuk estimator kalau sebelumnya memang sudah ada
   * konteks harga/jasa/project mahasiswa.
   */
  if (isPricingContinuation(latestMessage, userOnlyConversationText)) {
    return true;
  }

  /**
   * "Mau bikin website" atau sejenisnya hanya masuk estimator kalau
   * ada konteks service/pricing yang jelas.
   */
  if (projectBuildIntent) {
    if (serviceOrPricingIntent) {
      return true;
    }

    if (studentProjectServiceContext) {
      return true;
    }

    return false;
  }

  return false;
}

function isStudentPricingContext(
  latestMessage: string,
  userOnlyConversationText: string,
) {
  if (
    hasNonStudentProjectTerms(latestMessage) &&
    isNewProjectSignal(latestMessage)
  ) {
    return false;
  }

  if (hasStudentTerms(latestMessage)) {
    return true;
  }

  if (
    (isContinuationMessage(latestMessage) ||
      hasFeatureAdditionIntent(latestMessage)) &&
    hasStudentTerms(userOnlyConversationText)
  ) {
    return true;
  }

  return false;
}

async function createConversationalReply({
  client,
  latestMessage,
  conversationText,
}: {
  client: ReturnType<typeof createOpenAIClient>;
  latestMessage: string;
  conversationText: string;
}): Promise<{ reply: string; source: ResponseSource }> {
  let reply = createLocalPortfolioReply(latestMessage);
  let source: ResponseSource = 'local';

  if (client) {
    try {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
        instructions: PORTFOLIO_ASSISTANT_INSTRUCTIONS,
        input: conversationText,
      });

      if (response.output_text?.trim()) {
        reply = response.output_text.trim();
        source = 'openai';
      }
    } catch (openAiError) {
      console.warn(
        'OpenAI unavailable. Using local assistant fallback.',
        openAiError,
      );
    }
  }

  return { reply, source };
}

async function createPricingAnalysis({
  client,
  userOnlyConversationText,
}: {
  client: ReturnType<typeof createOpenAIClient>;
  userOnlyConversationText: string;
}) {
  let analysis = createHeuristicAnalysis(userOnlyConversationText);
  let source: ResponseSource = 'local';

  if (client) {
    try {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
        instructions: PRICE_ANALYSIS_INSTRUCTIONS,
        input: userOnlyConversationText,
        text: {
          format: {
            type: 'json_schema',
            name: 'project_estimate_analysis',
            strict: true,
            schema: responseSchema,
          },
        },
      });

      const parsedJson = JSON.parse(response.output_text);
      const parsed = projectAnalysisSchema.safeParse(parsedJson);

      if (parsed.success) {
        analysis = parsed.data;
        source = 'openai';
      } else {
        console.warn(
          'OpenAI response schema invalid. Using local fallback.',
          parsed.error,
        );
      }
    } catch (openAiError) {
      console.warn(
        'OpenAI unavailable. Using local pricing fallback.',
        openAiError,
      );
    }
  }

  return { analysis, source };
}

function applyPricingGuards(
  estimate: any,
  analysis: any,
  studentPricingContext: boolean,
) {
  if (studentPricingContext) {
    const studentRange = getStudentPriceRange(analysis);

    return {
      ...estimate,
      price_min: studentRange.min,
      price_max: studentRange.max,
      pricing_category: 'student',
      pricing_note:
        'Harga khusus mahasiswa/tugas kuliah. Scope bisa disederhanakan agar tetap masuk budget maksimal Rp1.200.000.',
    };
  }

  const cap = getGeneralPriceCap(analysis);
  const currentMin = Number(estimate.price_min ?? 0);
  const currentMax = Number(estimate.price_max ?? 0);

  if (currentMax > cap) {
    const guardedMax = cap;
    const guardedMin = Math.min(
      currentMin,
      Math.max(Math.round(guardedMax * 0.55), 800_000),
    );

    return {
      ...estimate,
      price_min: guardedMin,
      price_max: guardedMax,
      pricing_category: 'guarded',
      pricing_note:
        'Estimasi dibatasi agar tetap realistis untuk scope yang disebutkan.',
    };
  }

  return {
    ...estimate,
    pricing_category: 'general',
  };
}

function getStudentPriceRange(analysis: any) {
  const complexity = analysis.complexity;
  const projectType = analysis.project_type;
  const featureKeys = Array.isArray(analysis.detected_feature_keys)
    ? analysis.detected_feature_keys
    : [];

  const hasCoreSystemFeatures = featureKeys.some((key: string) =>
    ['authentication', 'database', 'admin_panel', 'report_export'].includes(key),
  );

  if (complexity === 'simple' && !hasCoreSystemFeatures) {
    if (projectType === 'mobile_app') return { min: 700_000, max: 950_000 };
    return { min: 400_000, max: 700_000 };
  }

  if (complexity === 'medium' || hasCoreSystemFeatures) {
    if (featureKeys.length >= 4) return { min: 950_000, max: 1_200_000 };
    return { min: 700_000, max: 950_000 };
  }

  return { min: 950_000, max: 1_200_000 };
}

function getGeneralPriceCap(analysis: any) {
  const projectType = analysis.project_type;
  const complexity = analysis.complexity;

  if (projectType === 'portfolio') {
    return 2_500_000;
  }

  if (projectType === 'landing_page') {
    return 3_000_000;
  }

  if (projectType === 'company_profile') {
    return 4_500_000;
  }

  if (projectType === 'mobile_app') {
    if (complexity === 'simple') return 8_000_000;
    if (complexity === 'medium') return 18_000_000;
    return 30_000_000;
  }

  if (projectType === 'web_app') {
    if (complexity === 'simple') return 8_000_000;
    if (complexity === 'medium') return 15_000_000;
    return 30_000_000;
  }

  if (projectType === 'ai_chatbot') {
    if (complexity === 'simple') return 8_000_000;
    if (complexity === 'medium') return 15_000_000;
    return 25_000_000;
  }

  return 30_000_000;
}

function formatPortfolioEstimateReply(
  estimate: any,
  analysis: any,
  studentPricingContext: boolean,
  latestMessage: string,
) {
  const projectTypeLabel = getProjectTypeLabel(analysis.project_type);
  const complexityLabel = getComplexityLabel(analysis.complexity);
  const features =
    Array.isArray(analysis.features) && analysis.features.length > 0
      ? analysis.features.slice(0, 5)
      : [];
  const questions = getContextualQuestions(analysis, latestMessage).slice(0, 3);
  const lines: string[] = [];

  lines.push(
    `Dari kebutuhan yang kamu jelaskan, ini masuk kategori ${projectTypeLabel} dengan kompleksitas ${complexityLabel}.`,
  );

  if (studentPricingContext) {
    lines.push(
      `Karena konteksnya mahasiswa/tugas kuliah, estimasi awalnya saya batasi di range khusus mahasiswa: ${formatRupiah(
        estimate.price_min,
      )} - ${formatRupiah(estimate.price_max)}.`,
    );

    lines.push(
      'Patokan maksimalnya Rp1.200.000. Kalau fiturnya melebar, scope perlu dirapikan supaya tetap masuk budget mahasiswa.',
    );
  } else {
    lines.push(
      `Estimasi awalnya sekitar ${formatRupiah(
        estimate.price_min,
      )} - ${formatRupiah(estimate.price_max)}.`,
    );
  }

  if (features.length > 0) {
    lines.push(`Fitur yang saya tangkap: ${features.join(', ')}.`);
  } else {
    lines.push(
      'Fitur yang saya tangkap masih umum, jadi estimasinya masih perlu dikunci dari detail halaman dan alur fitur.',
    );
  }

  if (/export|pdf/i.test(latestMessage)) {
    lines.push(
      'Untuk export PDF, scope-nya masih masuk akal selama format laporan dan sumber datanya jelas. Kalau hanya download laporan sederhana, biayanya tidak perlu melonjak jauh.',
    );
  }

  lines.push(
    'Harga final tetap bergantung pada jumlah halaman/screen, deadline, revisi, kebutuhan database, deployment, dan detail alur user.',
  );

  if (questions.length > 0) {
    lines.push('Supaya estimasinya lebih presisi, perlu dikonfirmasi:');
    questions.forEach((question, index) => {
      lines.push(`${index + 1}. ${question}`);
    });
  }

  return lines.join('\n\n');
}

function getContextualQuestions(analysis: any, latestMessage: string) {
  const questions: string[] = [];
  const projectType = analysis.project_type;

  if (projectType === 'mobile_app') {
    questions.push('Aplikasinya hanya Android, atau perlu Android dan iOS?');
  } else {
    questions.push('Berapa jumlah halaman atau screen yang dibutuhkan?');
  }

  if (!/login|admin|dashboard/i.test(latestMessage)) {
    questions.push('Perlu login/admin panel, atau cukup tampilan biasa?');
  }

  if (/export|pdf|laporan/i.test(latestMessage)) {
    questions.push('PDF-nya berisi data apa dan datanya diambil dari mana?');
  } else {
    questions.push('Apakah perlu database, CRUD data, atau laporan?');
  }

  questions.push('Deadline pengerjaannya kapan?');

  return questions;
}

function createLocalPortfolioReply(message: string) {
  if (/halo|hai|hello|hi|pagi|siang|sore|malam/i.test(message)) {
    return 'Halo. Saya bisa bantu jawab pertanyaan tentang layanan Tegar, teknologi, UI/UX, website, mobile app, atau estimasi project. Ceritakan saja kebutuhan atau pertanyaanmu.';
  }

  if (/awam|pemula|gaptek|belum paham|tidak paham|kurang paham|baru belajar|gak ngerti|ga ngerti|engga ngerti|enggak ngerti|ngga ngerti|nggak ngerti|ga paham|gak paham|engga paham|enggak paham|ngga paham|nggak paham/i.test(message)) {
    return [
      'Tidak masalah kalau masih awam. Penjelasan sederhananya begini:',
      '',
      'Website atau aplikasi bisa dibayangkan seperti tempat kerja digital. Ada bagian tampilan yang dilihat pengguna, lalu ada sistem di belakangnya untuk menyimpan data, mengatur konten, atau menjalankan fitur tertentu.',
      '',
      'Kamu tidak perlu langsung paham istilah teknis. Cukup jelaskan:',
      '1. Mau dibuat untuk apa?',
      '2. Siapa yang akan memakai?',
      '3. Fitur utamanya apa?',
      '4. Perlu login, database, laporan, atau admin panel tidak?',
      '',
      'Dari jawaban itu, kebutuhan teknisnya bisa diterjemahkan pelan-pelan.',
    ].join('\n');
  }

  if (/proses|alur|pengerjaan|workflow/i.test(message)) {
    return [
      'Alur pengerjaan biasanya dimulai dari diskusi kebutuhan, analisis fitur, desain UI/UX, development, testing, revisi, deployment, lalu maintenance jika dibutuhkan.',
      '',
      'Untuk project kecil seperti portfolio atau landing page, prosesnya lebih sederhana. Untuk web app atau mobile app, perlu analisis fitur lebih detail supaya database, role user, dan alur aplikasinya rapi.',
    ].join('\n');
  }

  if (/tech stack|stack|framework|bahasa pemrograman|tools|teknologi apa|pakai teknologi apa|teknologi yang cocok|lebih baik pakai/i.test(message)) {
    return [
      'Pemilihan teknologi tergantung jenis project dan targetnya.',
      '',
      '- Website modern: React atau Next.js.',
      '- Backend/API: Laravel, Node.js, atau Python.',
      '- Mobile app: Kotlin untuk Android native, atau React Native untuk Android dan iOS.',
      '- Database: MySQL atau PostgreSQL.',
      '- Desain: Figma.',
      '',
      'Kalau project-nya sederhana atau tugas kuliah, jangan pilih stack yang terlalu berat. Lebih aman pakai teknologi yang mudah dikerjakan, mudah dijelaskan, dan sesuai deadline.',
    ].join('\n');
  }

  if (/ui|ux|desain|figma|redesign/i.test(message)) {
    return [
      'Untuk UI/UX, fokusnya bukan hanya tampilan bagus, tapi membuat alur sistem mudah dipahami user.',
      '',
      'Prosesnya bisa dimulai dari analisis masalah, wireframe, mockup di Figma, prototype, lalu revisi berdasarkan kebutuhan pengguna.',
    ].join('\n');
  }

  if (/berapa\s+(lama|hari|minggu|bulan)|durasi|timeline/i.test(message)) {
    return [
      'Estimasi durasi tergantung jenis project dan jumlah fitur.',
      '',
      '- Portfolio atau landing page sederhana: sekitar 2-5 hari kerja.',
      '- Company profile: sekitar 5-10 hari kerja.',
      '- Web app atau mobile app sederhana: sekitar 1-3 minggu.',
      '',
      'Durasi final perlu melihat jumlah halaman/screen, fitur login, database, dashboard admin, revisi, dan kebutuhan deployment.',
    ].join('\n');
  }

  return [
    'Saya paham. Bisa dijelaskan sedikit konteksnya?',
    '',
    'Kalau ini tentang project, sebutkan jenis project dan fitur utamanya. Kalau ini pertanyaan umum atau teknologi, tanyakan langsung saja. Saya akan jawab sesuai konteks, bukan langsung memaksa ke estimasi harga.',
  ].join('\n');
}

function hasLearningIntent(text: string) {
  return /awam|pemula|baru belajar|belum paham|tidak paham|gaptek|mulai dari mana|belajar|roadmap|alur belajar|cara bikin|cara membuat|harus belajar apa|dari nol|step by step/i.test(
    text,
  );
}

function hasServiceOrPricingIntent(text: string) {
  return /harga|estimasi|budget|biaya|tarif|jasa|order|pesan|buatkan|dibikinkan|minta dibuatkan|deadline|berapa kalau|berapa biaya|range harga|penawaran|quotation|invoice/i.test(
    text,
  );
}

function getProjectTypeLabel(value: string) {
  const labels: Record<string, string> = {
    landing_page: 'landing page',
    company_profile: 'company profile website',
    portfolio: 'portfolio website',
    web_app: 'web app / sistem berbasis web',
    mobile_app: 'mobile app',
    ai_chatbot: 'AI chatbot',
  };

  return labels[value] ?? 'project digital';
}

function getComplexityLabel(value: string) {
  const labels: Record<string, string> = {
    simple: 'sederhana',
    medium: 'menengah',
    complex: 'cukup kompleks',
  };

  return labels[value] ?? 'belum jelas';
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

async function saveChatLog({
  request,
  ip,
  userMessage,
  reply,
  estimate,
}: {
  request: Request;
  ip: string;
  userMessage: string;
  reply: string;
  estimate: any | null;
}) {
  try {
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { error: logError } = await supabase.from('chat_logs').insert({
        user_message: userMessage,
        ai_response: reply,
        estimated_price_min: estimate?.price_min ?? null,
        estimated_price_max: estimate?.price_max ?? null,
        complexity_level: estimate?.complexity ?? null,
        project_type: estimate?.project_type ?? null,
        detected_features: estimate?.detected_feature_keys ?? [],
        multiplier_total: estimate?.multiplier_total ?? null,
        user_agent: request.headers.get('user-agent'),
        ip_hash: ip === 'unknown' ? null : await hashIp(ip),
      });

      if (logError) {
        console.warn('Failed to save chat log:', logError);
      }
    }
  } catch (logError) {
    console.warn('Chat log skipped:', logError);
  }
}

async function hashIp(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    `${value}:${process.env.ANALYTICS_SALT ?? 'local-dev'}`,
  );
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
