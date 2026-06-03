export type FeaturedProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  status: 'Completed' | 'Ongoing' | 'Prototype';
  role: string;
  shortDescription: string;
  problem: string;
  solution: string;
  techStack: string[];
  features: string[];
  coverImage: string;
  screenshots: {
    title: string;
    imageUrl: string;
  }[];
  pdfUrl?: string;
  liveDemoUrl?: string;
  githubUrl?: string;
};
