import type { PortfolioData } from '@/types/portfolio';

export const fallbackPortfolioData: PortfolioData = {
  profile: {
    id: 'fallback-profile',
    name: 'Tegar Sang Putra',
    headline: 'Web/App Mobile Developer',
    about:
      'Saya membangun website, aplikasi berbasis web, dan antarmuka digital yang rapi, responsif, serta berorientasi pada kebutuhan bisnis. Fokus saya adalah menggabungkan pemahaman operasional, desain, dan engineering agar solusi yang dibuat bukan hanya menarik, tetapi juga berguna.',
    photo_url: '/avatar.png',
    cv_url: null,
  },
  skills: [
    { id: '1', name: 'HTML', category: 'Frontend', level: 90, icon: null, sort_order: 1 },
    { id: '2', name: 'CSS', category: 'Frontend', level: 88, icon: null, sort_order: 2 },
    { id: '3', name: 'JavaScript', category: 'Frontend', level: 82, icon: null, sort_order: 3 },
    { id: '4', name: 'TypeScript', category: 'Frontend', level: 75, icon: null, sort_order: 4 },
    { id: '5', name: 'React', category: 'Frontend', level: 78, icon: null, sort_order: 5 },
    { id: '6', name: 'Next.js', category: 'Full Stack', level: 76, icon: null, sort_order: 6 },
    { id: '7', name: 'PHP', category: 'Backend', level: 78, icon: null, sort_order: 7 },
    { id: '8', name: 'Laravel', category: 'Backend', level: 74, icon: null, sort_order: 8 },
  ],
  experiences: [
    {
      id: '1',
      title: 'Full Stack Web Developer',
      company: 'Project Portfolio',
      type: 'Project',
      start_date: '2024-01-01',
      end_date: null,
      description:
        'Membangun sistem inventory dan cost control untuk kebutuhan restoran, mencakup pengelolaan stok, transfer barang antar cabang, riwayat transaksi, dan dashboard operasional.',
      tech_stack: ['PHP', 'MySQL', 'JavaScript', 'Bootstrap'],
      sort_order: 1,
    },
    {
      id: '2',
      title: 'Frontend Developer & UI/UX Designer',
      company: 'PT Imersa Solusi Teknologi',
      type: 'Internship',
      start_date: '2025-01-01',
      end_date: '2025-06-01',
      description:
        'Merancang dan mengimplementasikan website company profile menggunakan pendekatan UI/UX yang rapi, responsif, dan mudah dipahami pengguna.',
      tech_stack: ['Laravel', 'Blade', 'Bootstrap', 'Figma'],
      sort_order: 2,
    },
  ],
};
