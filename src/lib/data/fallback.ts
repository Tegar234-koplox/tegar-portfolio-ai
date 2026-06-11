import type { PortfolioData } from '@/types/portfolio';

export const fallbackPortfolioData: PortfolioData = {
  profile: {
    id: 'fallback-profile',
    name: 'Tegar Sang Putra',
    headline: 'Web/App Mobile Developer',
    headline_en: 'Web and Mobile App Developer',
    about:
      'Saya membangun website, aplikasi berbasis web, dan antarmuka digital yang rapi, responsif, serta berorientasi pada kebutuhan bisnis. Fokus saya adalah menggabungkan pemahaman operasional, desain, dan engineering agar solusi yang dibuat bukan hanya menarik, tetapi juga berguna.',
    about_en:
      'I build websites, web-based applications, and clean responsive digital interfaces that focus on business needs. My focus is combining operational understanding, design, and engineering so the solutions are not only visually appealing but also useful.',
    photo_url: '/avatar.png',
    cv_url: null,
  },
  skills: [
    { id: '1', name: 'HTML', category: 'Frontend', category_en: 'Frontend', level: 90, icon: null, sort_order: 1 },
    { id: '2', name: 'CSS', category: 'Frontend', category_en: 'Frontend', level: 88, icon: null, sort_order: 2 },
    { id: '3', name: 'JavaScript', category: 'Frontend', category_en: 'Frontend', level: 82, icon: null, sort_order: 3 },
    { id: '4', name: 'TypeScript', category: 'Frontend', category_en: 'Frontend', level: 75, icon: null, sort_order: 4 },
    { id: '5', name: 'React', category: 'Frontend', category_en: 'Frontend', level: 78, icon: null, sort_order: 5 },
    { id: '6', name: 'Next.js', category: 'Full Stack', category_en: 'Full Stack', level: 76, icon: null, sort_order: 6 },
    { id: '7', name: 'PHP', category: 'Backend', category_en: 'Backend', level: 78, icon: null, sort_order: 7 },
    { id: '8', name: 'Laravel', category: 'Backend', category_en: 'Backend', level: 74, icon: null, sort_order: 8 },
  ],
  experiences: [
    {
      id: '1',
      title: 'Full Stack Web Developer',
      title_en: 'Full Stack Web Developer',
      company: 'Project Portfolio',
      type: 'Project',
      type_en: 'Project',
      start_date: '2024-01-01',
      end_date: null,
      description:
        'Membangun sistem inventory dan cost control untuk kebutuhan restoran, mencakup pengelolaan stok, transfer barang antar cabang, riwayat transaksi, dan dashboard operasional.',
      description_en:
        'Built an inventory and cost control system for restaurant operations, covering stock management, inter-branch item transfers, transaction history, and an operational dashboard.',
      tech_stack: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
      sort_order: 1,
    },
    {
      id: '2',
      title: 'Frontend Developer & UI/UX Designer',
      title_en: 'Frontend Developer & UI/UX Designer',
      company: 'PT Imersa Solusi Teknologi',
      type: 'Internship',
      type_en: 'Internship',
      start_date: '2025-01-01',
      end_date: '2025-06-01',
      description:
        'Merancang dan mengimplementasikan website company profile menggunakan pendekatan UI/UX yang rapi, responsif, dan mudah dipahami pengguna.',
      description_en:
        'Designed and implemented a company profile website using a clean, responsive, and user-friendly UI/UX approach.',
      tech_stack: ['Laravel', 'Blade', 'Bootstrap', 'Figma'],
      sort_order: 2,
    },
  ],
};
