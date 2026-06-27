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
    shortDescription_en:
      'A dynamic portfolio with an admin dashboard, pricing estimator chatbot, contact notifications, photo upload, simple analytics, and production deployment.',
    problem:
      'Portfolio statis sulit dikelola, tidak punya alur lead/contact yang rapi, dan tidak membantu calon klien memahami estimasi harga project.',
    problem_en:
      'A static portfolio is difficult to manage, lacks a clear lead/contact flow, and does not help potential clients understand project price estimates.',
    solution:
      'Membangun portfolio berbasis Next.js dan Supabase dengan dashboard admin, chatbot estimator, contact form, email notification, upload foto, dan analytics.',
    solution_en:
      'Built a Next.js and Supabase-based portfolio with an admin dashboard, estimator chatbot, contact form, email notifications, photo upload, and analytics.',
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
    shortDescription_en:
      'A UI redesign for a restaurant stock management system to make input flows, monitoring, and stock history more systematic.',
    problem:
      'Pengelolaan stok berbasis spreadsheet rawan tidak konsisten, kurang efisien, dan sulit digunakan untuk operasional harian.',
    problem_en:
      'Spreadsheet-based stock management is prone to inconsistency, inefficient, and difficult to use for daily operations.',
    solution:
      'Merancang ulang UI menggunakan pendekatan User-Centered Design agar alur kerja stok lebih jelas, terstruktur, dan mudah dipahami pengguna.',
    solution_en:
      'Redesigned the UI using a User-Centered Design approach so stock workflows become clearer, more structured, and easier for users to understand.',
    techStack: ['Figma', 'User-Centered Design', 'SUS Testing', 'Wireframe', 'Prototype'],
    features: [
      'Dashboard stok',
      'Input stok masuk dan keluar',
      'Riwayat stok',
      'User guide',
      'Usability testing',
    ],
    features_en: [
      'Stock dashboard',
      'Incoming and outgoing stock input',
      'Stock history',
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
    githubUrl: 'https://github.com/Tegar234-koplox/pwa-stok',
  },

  {
    id: 'wedding-web',
    title: 'Digital Wedding Invitattion',
    category: 'Web',
    year: '2026',
    status: 'Development',
    role: 'Full Stack Developer',
    shortDescription:
      'Wedding Web / Niskala Digital Wedding Invitation adalah platform undangan pernikahan digital bilingual untuk pasangan dan vendor wedding yang membutuhkan alur produksi undangan yang rapi, personal, dan siap operasional. Project ini bukan hanya landing page, tetapi sistem full-stack yang mengelola katalog tema dan paket, render undangan berbasis data, RSVP tamu, prakiraan cuaca BMKG, dashboard client, dashboard staff, order pipeline, audit trail, media, dan pembayaran yang siap diintegrasikan dengan Midtrans.',
    shortDescription_en:
      'Wedding Web / Niskala Digital Wedding Invitation is a bilingual digital wedding invitation platform for couples and wedding vendors who need a neat, personalized, and operational invitation production process. This project is not just a landing page, but a full-stack system that manages theme and package catalogs, data-driven invitation rendering, guest RSVPs, BMKG weather forecasts, client dashboards, staff dashboards, order pipelines, audit trails, media, and payments that are ready to be integrated with Midtrans.',
    problem:
      'Undangan digital berhenti di sisi visual: tema cantik, halaman publik, dan form sederhana. Masalah operasional acak: revisi via chat, status order tidak terpusat, data tamu sulit dilacak, konten undangan tidak tervalidasi, media bercampur dengan data bisnis, serta kebutuhan client dan staff berada di tempat berbeda.',
    problem_en:
      'Digital invitations stop at the visual side: beautiful themes, public pages, and simple forms. Operational issues arise: chat revisions, non-centralized order status, difficult to track guest data, unvalidated invitation content, mixed media with business data, and client and staff needs being in different locations.',
    solution:
      'Project ini menyelesaikan masalah tersebut dengan platform terstruktur: frontend Next.js untuk pengalaman publik dan dashboard, backend Django REST API untuk data bisnis dan permissions, PostgreSQL sebagai source of truth, Redis/Celery untuk cache dan pekerjaan async, Cloudinary untuk media, BMKG untuk prakiraan cuaca, serta model role-based untuk staff dan client. Arsitekturnya jelas memisahkan public API, staff API, client API, dan payment API sehingga produk bisa berkembang dari katalog undangan menjadi workflow produksi invitation yang lebih profesional.',
    solution_en:
      'This project solves these problems with a structured platform: a Next.js frontend for the public experience and dashboard, a Django REST API backend for business data and permissions, PostgreSQL as the source of truth, Redis/Celery for caching and async jobs, Cloudinary for media, BMKG for weather forecasts, and a role-based model for staff and clients. The architecture clearly separates the public API, staff API, client API, and payment API so the product can evolve from an invitation catalog to a more professional invitation production workflow.',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'Zod', 'Sentry', 'Django 5.2', 'Django REST Framework', 'drf-spectacular/OpenAPI', 'PostgreSQL', 'Redis', 'Celery', 'Cloudinary', 'Midtrans', 'BMKG API'],
    features: [
      'Website publik bilingual Indonesia/English dengan halaman home, tema, paket, preview tema, dan CTA WhatsApp',
      'Renderer undangan berbasis registry dan versioning, sehingga tema bisa dikembangkan tanpa merusak undangan lama',
      'Halaman undangan publik via publicSlug, berisi nama pasangan, informasi acara, lokasi, cerita,  backsound, dan cuaca',
      'Integrasi prakiraan cuaca BMKG berbasis lokasi administrasi tingkat IV; BMKG menyediakan data prakiraan 3 hari, format JSON, dan wajib dicantumkan sebagai sumber data (Sumber: data.bmkg.go.id)',
      'RSVP publik untuk tamu',
      'Dashboard client untuk review draft, update konten, submit revisi, approve publish, dan export tamu',
      'Dashboard staff untuk order queue, leads, metrics, assignment staff, audit trail, katalog tema/paket, media, dan publishing workflow',
      'Payment model Midtrans-ready dengan invoice, status pembayaran, idempotency key, webhook event, dan audit state. Midtrans menyediakan payment API, checkout, payment link, dan invoicing untuk web/app (Sumber: docs.midtrans.com)',
      'Security defaults: permission default authenticated, serializer publik dipisah, CSRF/session auth, throttling, CSP, secrets via environment, Cloudinary signing server-side, dan audit event untuk mutasi sensitif',
    ],
    features_en: [
      'A bilingual Indonesian/English public website with a homepage, themes, packages, theme previews, and WhatsApp CTAs',
      'Registry-based and versioned invitation renderer, allowing themes to be developed without breaking existing invitations',
      'Public invitation page via publicSlug, containing the couples name, event information, location, story, background music, and weather',
      'Integration of BMKG weather forecasts based on location-based level IV administration; BMKG provides 3-day forecast data in JSON format, and must be listed as a data source (Source: data.bmkg.go.id)',
      'Public RSVP for guests',
      'Client dashboard for reviewing drafts, updating content, submitting revisions, approving publishing, and exporting guest posts',
      'Staff dashboard for order queue, leads, metrics, staff assignments, audit trail, theme/package catalogue, media, and publishing workflow',
      'Midtrans payment model is ready with invoices, payment status, idempotency keys, webhook events, and audit state. Midtrans provides payment APIs, checkout, payment links, and invoicing for web/apps (Source: docs.midtrans.com)',
      'Security defaults: permission default authenticated, public serializer separated, CSRF/session auth, throttling, CSP, secrets via environment, Cloudinary server-side signing, and event auditing for sensitive transactions',
    ],
    coverImage: '/projects/wedding-web/cover.png',
    screenshots: [
      {
        title: 'Themes',
        imageUrl: '/projects/wedding-web/theme.png',
      },
      {
        title: 'Packages',
        imageUrl: '/projects/wedding-web/packages.png',
      },
      {
        title: 'Staff Dashboard',
        imageUrl: '/projects/wedding-web/staff-dashboard.png ',
      },
    ],
    pdfUrl: ' ',
    githubUrl: 'https://github.com/Tegar234-koplox/wedding-web',
  },
  
];
