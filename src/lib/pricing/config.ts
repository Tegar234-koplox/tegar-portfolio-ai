export type ProjectType =
  | 'landing_page'
  | 'company_profile'
  | 'portfolio'
  | 'web_app'
  | 'mobile_app'
  | 'ai_chatbot';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export type PriceRange = [number, number];

export type FeatureRule = {
  label: string;
  multiplier: number;
  complexityPoints: number;
  minPriceImpact: number;
};

export const allowedFeatureKeys = [
  'admin_panel',
  'authentication',
  'database',
  'payment_gateway',
  'multi_role',
  'ai_integration',
  'dashboard',
  'notification',
  'file_upload',
  'api_integration',
  'urgent_deadline',
  'cms',
  'search_filter',
  'report_export',
  'responsive_ui',
  'deployment_setup',
] as const;

export type FeatureKey = (typeof allowedFeatureKeys)[number];

export const basePrices: Record<ProjectType, Record<ComplexityLevel, PriceRange>> = {
  landing_page: {
    simple: [1_500_000, 3_000_000],
    medium: [3_000_000, 5_500_000],
    complex: [5_500_000, 9_000_000],
  },
  company_profile: {
    simple: [3_000_000, 6_000_000],
    medium: [6_000_000, 10_000_000],
    complex: [10_000_000, 18_000_000],
  },
  portfolio: {
    simple: [2_000_000, 4_000_000],
    medium: [4_000_000, 7_500_000],
    complex: [7_500_000, 12_000_000],
  },
  web_app: {
    simple: [8_000_000, 15_000_000],
    medium: [15_000_000, 35_000_000],
    complex: [35_000_000, 80_000_000],
  },
  mobile_app: {
    simple: [15_000_000, 25_000_000],
    medium: [25_000_000, 60_000_000],
    complex: [60_000_000, 150_000_000],
  },
  ai_chatbot: {
    simple: [4_000_000, 8_000_000],
    medium: [8_000_000, 20_000_000],
    complex: [20_000_000, 50_000_000],
  },
};

export const featureRules: Record<FeatureKey, FeatureRule> = {
  admin_panel: { label: 'Admin panel', multiplier: 0.25, complexityPoints: 2, minPriceImpact: 1_500_000 },
  authentication: { label: 'Login/register', multiplier: 0.2, complexityPoints: 2, minPriceImpact: 1_200_000 },
  database: { label: 'Database dan CRUD', multiplier: 0.18, complexityPoints: 2, minPriceImpact: 1_000_000 },
  payment_gateway: { label: 'Payment gateway', multiplier: 0.35, complexityPoints: 4, minPriceImpact: 2_500_000 },
  multi_role: { label: 'Multi-role user', multiplier: 0.35, complexityPoints: 4, minPriceImpact: 2_500_000 },
  ai_integration: { label: 'Integrasi AI', multiplier: 0.45, complexityPoints: 5, minPriceImpact: 3_000_000 },
  dashboard: { label: 'Dashboard analitik', multiplier: 0.25, complexityPoints: 3, minPriceImpact: 1_800_000 },
  notification: { label: 'Notifikasi email/WA', multiplier: 0.15, complexityPoints: 2, minPriceImpact: 900_000 },
  file_upload: { label: 'Upload file/gambar', multiplier: 0.15, complexityPoints: 2, minPriceImpact: 900_000 },
  api_integration: { label: 'Integrasi API pihak ketiga', multiplier: 0.25, complexityPoints: 3, minPriceImpact: 1_800_000 },
  urgent_deadline: { label: 'Deadline cepat', multiplier: 0.35, complexityPoints: 3, minPriceImpact: 2_000_000 },
  cms: { label: 'CMS/custom content editor', multiplier: 0.2, complexityPoints: 2, minPriceImpact: 1_200_000 },
  search_filter: { label: 'Search dan filter data', multiplier: 0.12, complexityPoints: 1, minPriceImpact: 700_000 },
  report_export: { label: 'Export laporan', multiplier: 0.18, complexityPoints: 2, minPriceImpact: 1_100_000 },
  responsive_ui: { label: 'Responsive UI detail', multiplier: 0.08, complexityPoints: 1, minPriceImpact: 500_000 },
  deployment_setup: { label: 'Setup deployment', multiplier: 0.1, complexityPoints: 1, minPriceImpact: 700_000 },
};

export const pricingValidationRules = {
  maxMultiplier: 2.5,
  minFeatureImpact: 0,
  complexityThresholds: {
    simpleMaxPoints: 3,
    mediumMaxPoints: 9,
  },
};

export function validatePricingMatrix() {
  const errors: string[] = [];

  for (const [projectType, complexityMap] of Object.entries(basePrices)) {
    for (const [complexity, range] of Object.entries(complexityMap)) {
      const [min, max] = range;

      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        errors.push(`${projectType}.${complexity} harus berupa integer.`);
      }

      if (min <= 0 || max <= 0 || min >= max) {
        errors.push(`${projectType}.${complexity} memiliki range harga tidak valid.`);
      }
    }
  }

  for (const key of allowedFeatureKeys) {
    const rule = featureRules[key];

    if (!rule) {
      errors.push(`Feature rule '${key}' belum didefinisikan.`);
      continue;
    }

    if (rule.multiplier < 0 || rule.multiplier > pricingValidationRules.maxMultiplier) {
      errors.push(`Multiplier '${key}' di luar batas aman.`);
    }

    if (rule.complexityPoints < 0 || rule.complexityPoints > 10) {
      errors.push(`Complexity points '${key}' tidak valid.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
