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

Peran utama:
- Menjawab pertanyaan pengunjung tentang profil, skill, layanan, proses kerja, project, tech stack, UI/UX, web development, mobile development, estimasi harga, dan pertanyaan umum.
- Jawaban harus natural seperti asisten website portfolio profesional.
- Gunakan bahasa Indonesia yang jelas, ringan, dan tidak kaku.
- Jangan terlalu panjang kecuali user meminta detail.
- Jangan mengarang pengalaman atau klaim berlebihan.
- Jangan memaksa user langsung order. Bantu user memahami dulu.

Profil Tegar:
- Tegar adalah Web Developer, UI/UX Designer, dan Mobile App Developer.
- Fokus layanan:
  1. Website portfolio
  2. Landing page
  3. Company profile
  4. Website bisnis
  5. Web app / admin dashboard
  6. Mobile app sederhana sampai menengah
  7. UI/UX design
  8. Redesign UI
  9. Integrasi API
  10. Database dan sistem CRUD

Tech stack yang boleh dijelaskan:
- Frontend: HTML, CSS, JavaScript, React, Next.js
- Backend: PHP, Laravel, Node.js, Python
- Mobile: Kotlin, React Native
- Database: MySQL, PostgreSQL
- Tools: Figma, Git, Docker, hosting/deployment

Aturan harga:
- Jika user bertanya harga, beri estimasi awal yang masuk akal.
- Jangan memberi angka ekstrem.
- Jangan pernah memberi harga puluhan juta untuk tugas kuliah, website sederhana, portfolio, landing page, company profile sederhana, atau CRUD kecil.
- Jika user menyebut mahasiswa, tugas kuliah, skripsi, tugas akhir, project kampus, atau aplikasi kuliah, harga maksimal Rp1.200.000.
- Untuk mahasiswa:
  - Website sederhana: Rp300.000 - Rp600.000
  - Website CRUD sederhana: Rp600.000 - Rp900.000
  - Mobile app sederhana: Rp700.000 - Rp1.200.000
  - Web/mobile dengan login, database, CRUD, laporan sederhana: Rp900.000 - Rp1.200.000
- Jika scope terlalu besar untuk budget mahasiswa, sarankan penyederhanaan fitur agar tetap masuk maksimal Rp1.200.000.
- Jangan menyebut harga seperti Rp53.500.000.
- Jika kebutuhan belum jelas, beri range aman dan tanyakan maksimal 3 pertanyaan penting.

Aturan proses kerja:
Jika user bertanya proses pengerjaan, jelaskan alur:
1. Diskusi kebutuhan
2. Analisis fitur
3. Desain UI/UX
4. Development
5. Testing
6. Revisi
7. Deployment
8. Maintenance opsional

Aturan gaya:
- Jawab langsung ke inti.
- Gunakan format Markdown yang rapi.
- Gunakan list angka atau bullet jika membantu.
- Hindari istilah teknis berlebihan.
- Jika user awam, jelaskan dengan bahasa sederhana.
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
    const body = (await request.json()) as ChatRequestBody;

    const latestMessage = getLatestUserMessage(body);
    const conversationText = buildConversationText(body);

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

    const client = createOpenAIClient();

    const pricingIntent =
      hasPricingIntent(latestMessage) ||
      hasProjectBuildIntent(latestMessage) ||
      isPricingContinuation(latestMessage, conversationText);

    const studentPricingContext = isStudentPricingContext(
      latestMessage,
      conversationText,
    );

    /**
     * Mode 1: Portfolio assistant.
     * Dipakai untuk pertanyaan umum, tech stack, proses kerja, project,
     * layanan, pengalaman, atau pertanyaan non-harga.
     */
    if (!pricingIntent) {
      let reply = createLocalPortfolioReply(latestMessage);
      let responseSource: 'openai' | 'local' = 'local';

      if (client) {
        try {
          const response = await client.responses.create({
            model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
            instructions: PORTFOLIO_ASSISTANT_INSTRUCTIONS,
            input: conversationText,
          });

          if (response.output_text?.trim()) {
            reply = response.output_text.trim();
            responseSource = 'openai';
          }
        } catch (openAiError) {
          console.warn(
            'OpenAI unavailable. Using local assistant fallback.',
            openAiError,
          );
        }
      }

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
          source: responseSource,
        },
        { headers: getRateLimitHeaders(limit) },
      );
    }

    /**
     * Mode 2: Pricing estimator.
     * Tetap memakai sistem estimasi lama, tetapi sekarang diberi guard
     * supaya tidak keluar harga absurd.
     */
    let analysis = createHeuristicAnalysis(conversationText);
    let analysisSource: 'openai' | 'local' = 'local';

    if (client) {
      try {
        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
          instructions: PRICE_ANALYSIS_INSTRUCTIONS,
          input: conversationText,
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
          analysisSource = 'openai';
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
        source: analysisSource,
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
      .slice(-8)
      .map((message) => {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${message.content.trim()}`;
      })
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

  return /harga|biaya|budget|estimasi harga|rate|tarif|juta|ribu|mahal|murah|nego|paket harga|berapa\s+(harga|biaya|budget|tarif|rate)|kena\s+berapa|habis\s+berapa|bayar\s+berapa/i.test(
    text,
  );
}

function hasProjectBuildIntent(text: string) {
  return /(mau|ingin|pengen|butuh|order|pesan|buatkan|bikinkan|pembuatan|membuat|bikin).*(website|web|aplikasi|mobile app|landing page|company profile|portfolio|dashboard|admin|chatbot|ui|ux|desain)/i.test(
    text,
  );
}

function hasStudentTerms(text: string) {
  return /mahasiswa|tugas kuliah|skripsi|tugas akhir|project kampus|proyek kampus|aplikasi kuliah|website kuliah|mobile app kuliah/i.test(
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

function isContinuationMessage(text: string) {
  return /kalau ditambah|kalau cuma|fiturnya|yang tadi|aplikasi itu|website itu|project itu|proyek itu|berarti|jadi kalau|terus kalau|misalnya ditambah|ditambah|dikurangi|ubah fiturnya|fitur tambahannya/i.test(
    text,
  );
}

function isPricingContinuation(latestMessage: string, conversationText: string) {
  return (
    isContinuationMessage(latestMessage) &&
    (hasPricingIntent(conversationText) || hasStudentTerms(conversationText))
  );
}

function isStudentPricingContext(
  latestMessage: string,
  conversationText: string,
) {
  /**
   * Kalau pesan terbaru jelas membahas project non-mahasiswa,
   * jangan pakai harga mahasiswa meskipun history sebelumnya ada kata mahasiswa.
   */
  if (
    hasNonStudentProjectTerms(latestMessage) &&
    isNewProjectSignal(latestMessage)
  ) {
    return false;
  }

  /**
   * Kalau pesan terbaru menyebut mahasiswa/tugas kuliah,
   * aktifkan harga mahasiswa.
   */
  if (hasStudentTerms(latestMessage)) {
    return true;
  }

  /**
   * Kalau pesan terbaru adalah lanjutan dari pembahasan sebelumnya,
   * dan history sebelumnya membahas mahasiswa, konteks mahasiswa tetap dipakai.
   */
  if (isContinuationMessage(latestMessage) && hasStudentTerms(conversationText)) {
    return true;
  }

  return false;
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
  const projectType = analysis.project_type;
  const complexity = analysis.complexity;

  if (projectType === 'mobile_app') {
    if (complexity === 'simple') {
      return { min: 700_000, max: 1_000_000 };
    }

    return { min: 900_000, max: 1_200_000 };
  }

  if (projectType === 'web_app') {
    if (complexity === 'simple') {
      return { min: 600_000, max: 900_000 };
    }

    return { min: 900_000, max: 1_200_000 };
  }

  if (complexity === 'simple') {
    return { min: 300_000, max: 600_000 };
  }

  if (complexity === 'medium') {
    return { min: 600_000, max: 900_000 };
  }

  return { min: 900_000, max: 1_200_000 };
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
) {
  const studentProject = studentPricingContext;
  const projectTypeLabel = getProjectTypeLabel(analysis.project_type);
  const complexityLabel = getComplexityLabel(analysis.complexity);

  const features =
    Array.isArray(analysis.features) && analysis.features.length > 0
      ? analysis.features.slice(0, 5)
      : [];

  const questions =
    Array.isArray(analysis.questions) && analysis.questions.length > 0
      ? analysis.questions.slice(0, 3)
      : [];

  const lines: string[] = [];

  lines.push(
    `Dari kebutuhan yang kamu jelaskan, ini masuk kategori ${projectTypeLabel} dengan kompleksitas ${complexityLabel}.`,
  );

  if (studentProject) {
    lines.push(
      `Karena ini konteksnya mahasiswa/tugas kuliah, estimasi saya batasi di range khusus mahasiswa: ${formatRupiah(
        estimate.price_min,
      )} - ${formatRupiah(estimate.price_max)}.`,
    );

    lines.push(
      'Batas maksimalnya Rp1.200.000. Kalau fiturnya mulai terlalu banyak, lebih aman scope-nya disederhanakan supaya tetap masuk budget mahasiswa.',
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
  }

  lines.push(
    'Harga final tetap tergantung detail fitur, jumlah halaman/screen, deadline, revisi, dan kebutuhan deployment.',
  );

  if (questions.length > 0) {
    lines.push('Supaya estimasinya lebih presisi, perlu dikonfirmasi:');
    questions.forEach((question: string, index: number) => {
      lines.push(`${index + 1}. ${question}`);
    });
  }

  return lines.join('\n\n');
}

function createLocalPortfolioReply(message: string) {
  if (/proses|alur|pengerjaan|workflow/i.test(message)) {
    return [
      'Alur pengerjaan biasanya dimulai dari diskusi kebutuhan, lalu analisis fitur, desain UI/UX, development, testing, revisi, deployment, dan maintenance jika dibutuhkan.',
      '',
      'Untuk project kecil seperti portfolio atau landing page, prosesnya lebih sederhana. Untuk web app atau mobile app, perlu analisis fitur lebih detail supaya struktur database, role user, dan flow aplikasinya tidak berantakan.',
    ].join('\n');
  }

  if (/tech|stack|teknologi|framework|bahasa/i.test(message)) {
    return [
      'Tech stack yang bisa digunakan tergantung jenis project.',
      '',
      'Untuk website modern bisa memakai React atau Next.js. Untuk backend bisa memakai Laravel, Node.js, atau Python. Untuk mobile app bisa memakai Kotlin atau React Native. Untuk database bisa memakai MySQL atau PostgreSQL.',
      '',
      'Pemilihan stack sebaiknya mengikuti kebutuhan project, bukan sekadar mengikuti teknologi yang sedang ramai.',
    ].join('\n');
  }

  if (/ui|ux|desain|figma|redesign/i.test(message)) {
    return [
      'Untuk UI/UX, fokusnya bukan hanya membuat tampilan bagus, tapi membuat alur sistem lebih mudah dipahami user.',
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
    'Saya bisa bantu menjelaskan layanan Tegar terkait pembuatan website, mobile app, UI/UX design, redesign tampilan, integrasi API, database, sampai estimasi harga project.',
    '',
    'Ceritakan kebutuhan project-nya, misalnya jenis aplikasi, fitur utama, target user, dan apakah ini untuk bisnis, portfolio, atau tugas kuliah.',
  ].join('\n');
}

function getProjectTypeLabel(value: string) {
  const labels: Record<string, string> = {
    landing_page: 'landing page',
    company_profile: 'company profile website',
    portfolio: 'portfolio website',
    web_app: 'web app / admin dashboard',
    mobile_app: 'mobile app',
    ai_chatbot: 'AI chatbot',
  };

  return labels[value] ?? 'project digital';
}

function getComplexityLabel(value: string) {
  const labels: Record<string, string> = {
    simple: 'sederhana',
    medium: 'menengah',
    complex: 'kompleks',
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
