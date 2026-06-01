import { NextResponse } from 'next/server';
import { createOpenAIClient } from '@/lib/openai/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  calculateEstimate,
  createHeuristicAnalysis,
  formatEstimateReply,
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
    const { message } = (await request.json()) as { message?: string };

    if (!message || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Pesan terlalu pendek.' },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }

    if (message.length > 2_000) {
      return NextResponse.json(
        { error: 'Pesan maksimal 2000 karakter.' },
        { status: 400, headers: getRateLimitHeaders(limit) },
      );
    }

    /**
     * Fallback utama.
     * Ini harus selalu tersedia, bahkan jika OpenAI error, quota habis,
     * billing belum aktif, atau output AI gagal diparse.
     */
    let analysis = createHeuristicAnalysis(message);
    let analysisSource: 'openai' | 'local' = 'local';

    const client = createOpenAIClient();

    if (client) {
      try {
        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
          instructions:
            'Kamu adalah AI estimator proyek digital. Analisis kebutuhan user secara objektif. Jangan menentukan harga. Keluarkan JSON sesuai schema. Gunakan detected_feature_keys hanya dari enum yang tersedia. Jangan melebih-lebihkan scope jika user belum menyebutkannya.',
          input: message,
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
          console.warn('OpenAI response schema invalid. Using local fallback.', parsed.error);
        }
      } catch (openAiError) {
        console.warn('OpenAI unavailable. Using local pricing fallback.', openAiError);
      }
    }

    const estimate = calculateEstimate(analysis);
    const reply = formatEstimateReply(estimate);

    /**
     * Chat log tidak boleh membuat chatbot gagal.
     * Kalau Supabase/chat_logs error, user tetap harus dapat estimasi.
     */ 
    try {
      const supabase = createServerSupabaseClient();

      if (supabase) {
        const { error: logError } = await supabase.from('chat_logs').insert({
          user_message: message,
          ai_response: reply,
          estimated_price_min: estimate.price_min,
          estimated_price_max: estimate.price_max,
          complexity_level: estimate.complexity,
          project_type: estimate.project_type,
          detected_features: estimate.detected_feature_keys,
          multiplier_total: estimate.multiplier_total,
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