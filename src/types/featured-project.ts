export type ProjectScreenshot = {
  title: string;
  title_en?: string;
  imageUrl: string;
};

export type FeaturedProject = {
  id: string;
  title: string;
  title_en?: string;
  category: string;
  category_en?: string;
  year: string;
  status: string;
  status_en?: string;
  role: string;
  role_en?: string;
  shortDescription: string;
  shortDescription_en?: string;
  problem: string;
  problem_en?: string;
  solution: string;
  solution_en?: string;
  techStack: string[];
  features: string[];
  features_en?: string[];
  coverImage: string;
  screenshots: ProjectScreenshot[];
  liveDemoUrl?: string;
  githubUrl?: string;
  pdfUrl?: string;
};
