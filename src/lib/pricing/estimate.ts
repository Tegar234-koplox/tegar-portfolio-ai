import {
  allowedFeatureKeys,
  basePrices,
  featureRules,
  pricingValidationRules,
  validatePricingMatrix,
  type ComplexityLevel,
  type FeatureKey,
  type ProjectType,
} from './config';
import type { ProjectAnalysis } from './schema';
import { formatRupiah } from '@/lib/utils';

const featureKeywordMap: Array<{ key: FeatureKey; keywords: string[] }> = [
  { key: 'admin_panel', keywords: ['admin', 'dashboard admin', 'cms', 'kelola data', 'manage content'] },
  { key: 'authentication', keywords: ['login', 'register', 'auth', 'akun', 'password'] },
  { key: 'database', keywords: ['database', 'data', 'crud', 'stok', 'inventory', 'postgres', 'mysql'] },
  { key: 'payment_gateway', keywords: ['payment', 'pembayaran', 'midtrans', 'xendit', 'checkout', 'transaksi'] },
  { key: 'multi_role', keywords: ['multi role', 'role', 'owner', 'admin', 'staff', 'super admin'] },
  { key: 'ai_integration', keywords: ['ai', 'chatbot', 'openai', 'machine learning', 'llm', 'gpt'] },
  { key: 'dashboard', keywords: ['dashboard', 'grafik', 'chart', 'laporan visual', 'analytics'] },
  { key: 'notification', keywords: ['notifikasi', 'email otomatis', 'whatsapp', 'resend', 'otp'] },
  { key: 'file_upload', keywords: ['upload', 'gambar', 'file', 'pdf', 'storage'] },
  { key: 'api_integration', keywords: ['api', 'integrasi', 'third party', 'pihak ketiga', 'webhook'] },
  { key: 'urgent_deadline', keywords: ['cepat', 'urgent', 'deadline', 'minggu ini', 'besok'] },
  { key: 'cms', keywords: ['cms', 'editor', 'ubah konten', 'blog', 'artikel'] },
  { key: 'search_filter', keywords: ['search', 'filter', 'pencarian', 'sortir'] },
  { key: 'report_export', keywords: ['export', 'excel', 'pdf', 'download laporan'] },
  { key: 'responsive_ui', keywords: ['responsive', 'mobile friendly', 'tablet', 'semua device'] },
  { key: 'deployment_setup', keywords: ['deploy', 'deployment', 'hosting', 'domain', 'vercel'] },
];

export type PriceEstimate = ProjectAnalysis & {
  price_min: number;
  price_max: number;
  multiplier_total: number;
  complexity_points: number;
  applied_rules: Array<{ key: FeatureKey; label: string; multiplier: number; min_price_impact: number }>;
  formatted_price: string;
  matrix_valid: boolean;
  matrix_errors: string[];
};

function isFeatureKey(value: string): value is FeatureKey {
  return (allowedFeatureKeys as readonly string[]).includes(value);
}

function normalizeFeatureKeys(keys: string[]) {
  return Array.from(new Set(keys.filter(isFeatureKey)));
}

export function detectProjectType(message: string): ProjectType {
  const text = message.toLowerCase();

  if (text.includes('android') || text.includes('ios') || text.includes('mobile') || text.includes('aplikasi seluler')) {
    return 'mobile_app';
  }

  if (text.includes('chatbot') || text.includes('ai')) {
    return 'ai_chatbot';
  }

  if (text.includes('company profile') || text.includes('profil perusahaan')) {
    return 'company_profile';
  }

  if (text.includes('portfolio') || text.includes('portofolio')) {
    return 'portfolio';
  }

  if (text.includes('landing')) {
    return 'landing_page';
  }

  return 'web_app';
}

export function detectFeatureKeys(message: string): FeatureKey[] {
  const text = message.toLowerCase();

  return featureKeywordMap
    .filter((item) => item.keywords.some((keyword) => text.includes(keyword)))
    .map((item) => item.key);
}

export function detectComplexity(featureKeys: string[], message: string): ComplexityLevel {
  const keys = normalizeFeatureKeys(featureKeys);
  const points = keys.reduce((total, key) => total + featureRules[key].complexityPoints, 0);
  const text = message.toLowerCase();

  if (
    text.includes('enterprise') ||
    text.includes('multi cabang') ||
    text.includes('real time') ||
    points > pricingValidationRules.complexityThresholds.mediumMaxPoints
  ) {
    return 'complex';
  }

  if (points > pricingValidationRules.complexityThresholds.simpleMaxPoints) {
    return 'medium';
  }

  return 'simple';
}

export function createHeuristicAnalysis(message: string): ProjectAnalysis {
  const projectType = detectProjectType(message);
  const detectedFeatureKeys = detectFeatureKeys(message);
  const complexity = detectComplexity(detectedFeatureKeys, message);

  return {
    project_type: projectType,
    complexity,
    features: detectedFeatureKeys.map((feature) => featureRules[feature].label),
    detected_feature_keys: detectedFeatureKeys,
    summary: 'Estimasi dibuat dari jenis proyek, fitur yang disebutkan, dan indikasi kompleksitas pada pesan pengguna.',
    questions: [
      'Apakah sudah ada desain UI di Figma?',
      'Berapa jumlah halaman/screen yang dibutuhkan?',
      'Apakah membutuhkan login multi-role?',
      'Apakah ada deadline spesifik?',
    ],
  };
}

function roundToNearest(value: number, nearest = 100_000) {
  return Math.round(value / nearest) * nearest;
}

export function calculateEstimate(analysis: ProjectAnalysis): PriceEstimate {
  const matrixValidation = validatePricingMatrix();
  const detectedFeatureKeys = normalizeFeatureKeys(analysis.detected_feature_keys);
  const complexity = detectComplexity(detectedFeatureKeys, `${analysis.summary} ${analysis.features.join(' ')}`);
  const requestedComplexity = analysis.complexity as ComplexityLevel;
  const safeComplexity: ComplexityLevel = complexity === 'simple' && requestedComplexity !== 'simple' ? requestedComplexity : complexity;
  const projectType = analysis.project_type as ProjectType;
  const [baseMin, baseMax] = basePrices[projectType][safeComplexity];

  const appliedRules: PriceEstimate['applied_rules'] = detectedFeatureKeys.map((key) => ({
    key,
    label: featureRules[key].label,
    multiplier: featureRules[key].multiplier,
    min_price_impact: featureRules[key].minPriceImpact,
  }));

  const multiplierTotal = appliedRules.reduce((total, rule) => total + rule.multiplier, 0);
  const complexityPoints = detectedFeatureKeys.reduce((total, key) => total + featureRules[key].complexityPoints, 0);
  const additiveMinImpact = appliedRules.reduce((total, rule) => total + Math.round(rule.min_price_impact * 0.7), 0);
  const additiveMaxImpact = appliedRules.reduce((total, rule) => total + rule.min_price_impact, 0);

  const priceMin = roundToNearest(baseMin * (1 + multiplierTotal) + additiveMinImpact);
  const priceMax = roundToNearest(baseMax * (1 + multiplierTotal) + additiveMaxImpact);

  return {
    ...analysis,
    project_type: projectType,
    complexity: safeComplexity,
    detected_feature_keys: detectedFeatureKeys,
    features: detectedFeatureKeys.length > 0 ? detectedFeatureKeys.map((key) => featureRules[key].label) : analysis.features,
    price_min: priceMin,
    price_max: Math.max(priceMax, priceMin + 500_000),
    multiplier_total: Number(multiplierTotal.toFixed(2)),
    complexity_points: complexityPoints,
    applied_rules: appliedRules,
    formatted_price: `${formatRupiah(priceMin)} - ${formatRupiah(Math.max(priceMax, priceMin + 500_000))}`,
    matrix_valid: matrixValidation.valid,
    matrix_errors: matrixValidation.errors,
  };
}

export function formatEstimateReply(estimate: PriceEstimate) {
  const featureList = estimate.applied_rules.length > 0 ? estimate.applied_rules.map((rule: PriceEstimate['applied_rules'][number]) => rule.label).join(', ') : 'fitur dasar';
  const questions = estimate.questions.map((question: string) => `- ${question}`).join('\n');
  const matrixWarning = estimate.matrix_valid
    ? ''
    : `\nCatatan internal: pricing matrix belum valid: ${estimate.matrix_errors.join('; ')}`;

  return [
    `Estimasi awal: ${estimate.formatted_price}`,
    `Jenis proyek: ${estimate.project_type.replaceAll('_', ' ')}`,
    `Kompleksitas: ${estimate.complexity}`,
    `Skor kompleksitas: ${estimate.complexity_points}`,
    `Fitur terdeteksi: ${featureList}`,
    '',
    'Catatan: angka ini estimasi awal. Harga final harus dikunci setelah scope, deadline, jumlah halaman, alur user, integrasi teknis, dan revisi desain jelas.',
    matrixWarning,
    '',
    'Pertanyaan lanjutan:',
    questions,
  ].join('\n');
}
