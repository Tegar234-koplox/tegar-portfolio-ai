import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fallbackPortfolioData } from '@/lib/data/fallback';
import type { Experience, PortfolioData, Profile, Skill } from '@/types/portfolio';

export async function getPortfolioData(): Promise<PortfolioData> {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return fallbackPortfolioData;
  }

  const [profileResult, skillsResult, experiencesResult] = await Promise.all([
    supabase.from('profiles').select('*').limit(1).maybeSingle(),
    supabase.from('skills').select('*').order('sort_order', { ascending: true }),
    supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
  ]);

  if (profileResult.error || skillsResult.error || experiencesResult.error) {
    return fallbackPortfolioData;
  }

  return {
    profile: (profileResult.data as Profile | null) ?? fallbackPortfolioData.profile,
    skills: (skillsResult.data as Skill[] | null) ?? fallbackPortfolioData.skills,
    experiences: (experiencesResult.data as Experience[] | null) ?? fallbackPortfolioData.experiences,
  };
}
