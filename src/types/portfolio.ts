export type Profile = {
  id: string;
  name: string;
  headline: string;
  headline_en?: string | null;
  about: string;
  about_en?: string | null;
  photo_url: string | null;
  cv_url: string | null;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  category_en?: string | null;
  level: number;
  icon: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  title: string;
  title_en?: string | null;
  company: string;
  type: string;
  type_en?: string | null;
  start_date: string;
  end_date: string | null;
  description: string;
  description_en?: string | null;
  tech_stack: string[];
  sort_order: number;
};

export type PortfolioData = {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
};
