export type Profile = {
  id: string;
  name: string;
  headline: string;
  about: string;
  photo_url: string | null;
  cv_url: string | null;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  sort_order: number;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  type: string;
  start_date: string;
  end_date: string | null;
  description: string;
  tech_stack: string[];
  sort_order: number;
};

export type PortfolioData = {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
};
