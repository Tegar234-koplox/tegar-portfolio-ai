import { z } from 'zod';
import { allowedFeatureKeys, type ComplexityLevel, type ProjectType } from './config';

export const projectTypeSchema = z.enum([
  'landing_page',
  'company_profile',
  'portfolio',
  'web_app',
  'mobile_app',
  'ai_chatbot',
]);

export const complexitySchema = z.enum(['simple', 'medium', 'complex']);

export const projectAnalysisSchema = z.object({
  project_type: projectTypeSchema,
  complexity: complexitySchema,
  features: z.array(z.string()).default([]),
  detected_feature_keys: z.array(z.enum(allowedFeatureKeys)).default([]),
  summary: z.string(),
  questions: z.array(z.string()).default([]),
});

export type ProjectAnalysis = z.infer<typeof projectAnalysisSchema> & {
  project_type: ProjectType;
  complexity: ComplexityLevel;
};

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120, 'Nama maksimal 120 karakter.'),
  email: z.string().trim().email('Email tidak valid.').max(180, 'Email terlalu panjang.'),
  subject: z.string().trim().min(3, 'Subject minimal 3 karakter.').max(160, 'Subject maksimal 160 karakter.'),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter.').max(3000, 'Pesan maksimal 3000 karakter.'),
});

export type ContactPayload = z.infer<typeof contactSchema>;
