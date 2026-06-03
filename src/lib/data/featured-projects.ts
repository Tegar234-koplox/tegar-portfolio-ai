import type { FeaturedProject } from '@/types/featured-project';

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'ai-portfolio',
    title: 'AI Portfolio Website',
    category: 'Full Stack Web App',
    year: '2026',
    status: 'Completed',
    role: 'Full Stack Developer & UI/UX Designer',
    shortDescription:
      'Portfolio dinamis dengan admin dashboard, chatbot estimator harga, contact notification, upload foto, analytics sederhana, dan deployment production.',
    problem:
      'Portfolio statis sulit dikelola, tidak punya alur lead/contact yang rapi, dan tidak membantu calon klien memahami estimasi harga project.',
    solution:
      'Membangun portfolio berbasis Next.js dan Supabase dengan dashboard admin, chatbot estimator, contact form, email notification, upload foto, dan analytics.',
    techStack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Supabase',
      'OpenAI API',
      'Resend',
      'Vercel',
    ],
    features: [
      'Admin-only content management',
      'Skills and experience update',
      'AI/local pricing estimator',
      'Contact form with email notification',
      'Simple traffic analytics',
      'Image upload via Supabase Storage',
    ],
    coverImage: '/projects/ai-portfolio/cover.png',
    screenshots: [
      {
        title: 'Homepage',
        imageUrl: '/projects/ai-portfolio/homepage.png',
      },
      {
        title: 'Admin Dashboard',
        imageUrl: '/projects/ai-portfolio/admin-dashboard.png',
      },
      {
        title: 'AI Chatbot',
        imageUrl: '/projects/ai-portfolio/chatbot.png',
      },
      {
        title: 'Contact Form',
        imageUrl: '/projects/ai-portfolio/contact-form.png',
      },
    ],
    pdfUrl: '/projects/ai-portfolio/overview.pdf',
    githubUrl: 'https://github.com/Tegar234-koplox/tegar-portfolio-ai',
  },
  {
    id: 'stock-redesign',
    title: 'Stock Management UI Redesign',
    category: 'UI/UX Case Study',
    year: '2025',
    status: 'Completed',
    role: 'UI/UX Designer',
    shortDescription:
      'Redesign UI sistem pengelolaan stok resto agar alur input, monitoring, dan riwayat stok lebih sistematis.',
    problem:
      'Pengelolaan stok berbasis spreadsheet rawan tidak konsisten, kurang efisien, dan sulit digunakan untuk operasional harian.',
    solution:
      'Merancang ulang UI menggunakan pendekatan User-Centered Design agar alur kerja stok lebih jelas, terstruktur, dan mudah dipahami pengguna.',
    techStack: ['Figma', 'User-Centered Design', 'SUS Testing', 'Wireframe', 'Prototype'],
    features: [
      'Dashboard stok',
      'Input stok masuk dan keluar',
      'Riwayat stok',
      'User guide',
      'Usability testing',
    ],
    coverImage: '/projects/stock-redesign/cover.png',
    screenshots: [
      {
        title: 'Dashboard',
        imageUrl: '/projects/stock-redesign/dashboard.png',
      },
      {
        title: 'Input Stock',
        imageUrl: '/projects/stock-redesign/input-stock.png',
      },
      {
        title: 'Stock History',
        imageUrl: '/projects/stock-redesign/stock-history.png',
      },
    ],
    pdfUrl: '/projects/stock-redesign/overview.pdf',
  },
];
