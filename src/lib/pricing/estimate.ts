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

type FeaturePattern = {
  key: FeatureKey;
  patterns: RegExp[];
};

const featureKeywordMap: FeaturePattern[] = [
  {
    key: 'admin_panel',
    patterns: [
      /\badmin panel\b/i,
      /\bdashboard admin\b/i,
      /\bcms\b/i,
      /\bkelola data\b/i,
      /\bmanage content\b/i,
    ],
  },
  {
    key: 'authentication',
    patterns: [
      /\blogin\b/i,
      /\bregister\b/i,
      /\bauth\b/i,
      /\bakun\b/i,
      /\bpassword\b/i,
      /\bdaftar akun\b/i,
    ],
  },
  {
    key: 'database',
    patterns: [
      /\bdatabase\b/i,
      /\bcrud\b/i,
      /\bstok\b/i,
      /\binventory\b/i,
      /\bpostgres\b/i,
      /\bmysql\b/i,
      /\bkelola data\b/i,
      /\bsimpan data\b/i,
      /\bdata (user|barang|produk|penghuni|transaksi|mahasiswa|pesanan)\b/i,
    ],
  },
  {
    key: 'payment_gateway',
    patterns: [
      /\bpayment\b/i,
      /\bpembayaran online\b/i,
      /\bpayment gateway\b/i,
      /\bmidtrans\b/i,
      /\bxendit\b/i,
      /\bcheckout\b/i,
      /\btransaksi online\b/i,
    ],
  },
  {
    key: 'multi_role',
    patterns: [
      /\bmulti role\b/i,
      /\brole user\b/i,
      /\brole pengguna\b/i,
      /\bsuper admin\b/i,
      /\b(admin|owner|staff|user)\s+dan\s+(admin|owner|staff|user)\b/i,
    ],
  },
  {
    key: 'ai_integration',
    patterns: [
      /\bai chatbot\b/i,
      /\bchatbot ai\b/i,
      /\bintegrasi ai\b/i,
      /\bopenai\b/i,
      /\bgpt\b/i,
      /\bllm\b/i,
      /\bmachine learning\b/i,
      /\bartificial intelligence\b/i,
    ],
  },
  {
    key: 'dashboard',
    patterns: [
      /\bdashboard\b/i,
      /\bgrafik\b/i,
      /\bchart\b/i,
      /\blaporan visual\b/i,
      /\banalytics\b/i,
    ],
  },
  {
    key: 'notification',
    patterns: [
      /\bnotifikasi\b/i,
      /\bemail otomatis\b/i,
      /\bwhatsapp\b/i,
      /\bwa otomatis\b/i,
      /\bresend\b/i,
      /\botp\b/i,
      /\breminder\b/i,
    ],
  },
  {
    key: 'file_upload',
    patterns: [
      /\bupload\b/i,
      /\bunggah\b/i,
      /\bgambar\b/i,
      /\bfile\b/i,
      /\bstorage\b/i,
    ],
  },
  {
    key: 'api_integration',
    patterns: [
      /\bapi\b/i,
      /\bintegrasi\b/i,
      /\bthird party\b/i,
      /\bpihak ketiga\b/i,
      /\bwebhook\b/i,
    ],
  },
  {
    key: 'urgent_deadline',
    patterns: [
      /\bcepat\b/i,
      /\burgent\b/i,
      /\bdeadline\b/i,
      /\bminggu ini\b/i,
      /\bbesok\b/i,
      /\bsecepatnya\b/i,
    ],
  },
  {
    key: 'cms',
    patterns: [
      /\bcms\b/i,
      /\beditor\b/i,
      /\bubah konten\b/i,
      /\bblog\b/i,
      /\bartikel\b/i,
    ],
  },
  {
    key: 'search_filter',
    patterns: [
      /\bsearch\b/i,
      /\bfilter\b/i,
      /\bpencarian\b/i,
      /\bsortir\b/i,
    ],
  },
  {
    key: 'report_export',
    patterns: [
      /\bexport\b/i,
      /\bexcel\b/i,
      /\bpdf\b/i,
      /\bdownload laporan\b/i,
      /\bcetak laporan\b/i,
    ],
  },
  {
    key: 'responsive_ui',
    patterns: [
      /\bresponsive\b/i,
      /\bmobile friendly\b/i,
      /\btablet\b/i,
      /\bsemua device\b/i,
    ],
  },
  {
    key: 'deployment_setup',
    patterns: [
      /\bdeploy\b/i,
      /\bdeployment\b/i,
      /\bhosting\b/i,
      /\bdomain\b/i,
      /\bvercel\b/i,
    ],
  },
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

  if (/\b(android|ios|mobile app|aplikasi mobile|aplikasi seluler)\b/i.test(text)) {
    return 'mobile_app';
  }

  if (/\b(ai chatbot|chatbot ai|chatbot|openai|gpt|llm|machine learning)\b/i.test(text)) {
    return 'ai_chatbot';
  }

  if (/\b(company profile|profil perusahaan)\b/i.test(text)) {
    return 'company_profile';
  }

  if (/\b(portfolio|portofolio)\b/i.test(text)) {
    return 'portfolio';
  }

  if (/\blanding\b/i.test(text)) {
    return 'landing_page';
  }

  if (/\bwebsite\b|\bweb\b/i.test(text) && /\bsederhana\b|\bsimple\b|\bstatis\b|\btugas\b|\bkuliah\b|\bmahasiswa\b/i.test(text)) {
    return 'company_profile';
  }

  return 'web_app';
}

export function detectFeatureKeys(message: string): FeatureKey[] {
  return featureKeywordMap
    .filter((item) => item.patterns.some((pattern) => pattern.test(message)))
    .map((item) => item.key);
}

export function detectComplexity(featureKeys: string[], message: string): ComplexityLevel {
  const keys = normalizeFeatureKeys(featureKeys);
  const points = keys.reduce((total, key) => total + featureRules[key].complexityPoints, 0);
  const text = message.toLowerCase();

  if (
    /\benterprise\b|\bmulti cabang\b|\breal time\b|\brealtime\b|\bpayment gateway\b/i.test(text) ||
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
    summary: 'Estimasi dibuat dari jenis proyek, fitur yang disebutkan user, dan indikasi kompleksitas pada percakapan.',
    questions: [
      'Berapa jumlah halaman/screen yang dibutuhkan?',
      'Apakah perlu login/admin panel atau cukup tampilan biasa?',
      'Apakah perlu database, CRUD data, laporan, atau export file?',
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
