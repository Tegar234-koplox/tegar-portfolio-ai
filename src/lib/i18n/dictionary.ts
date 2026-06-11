export const dictionary = {
  id: {
    navbar: {
      brand: 'Portfolio',
      about: 'About',
      skills: 'Skills',
      experience: 'Pengalaman',
      projects: 'Proyek',
      chatbot: 'AI Chatbot',
      contact: 'Contact',
      admin: 'Admin',
    },
    languageToggle: {
      label: 'Ganti bahasa',
      id: 'ID',
      en: 'EN',
    },
    hero: {
      availability: 'Available for web, UI/UX, and Mobile App',
      title: 'Where design meets function.',
      contactButton: 'Contact Me',
      aiButton: 'Ask AI Estimator',
    },
    about: {
      eyebrow: 'About Me',
      title: 'Developer dengan sudut pandang operasional bisnis.',
    },
    skills: {
      eyebrow: 'Skills',
      title: 'Skill teknis yang relevan untuk delivery project.',
    },
    experience: {
      eyebrow: 'Pengalaman',
      title: 'Pengalaman kerja, magang, dan project.',
      present: 'Sekarang',
    },
    projects: {
      eyebrow: 'Proyek Unggulan',
      title: 'Project yang menunjukkan proses, solusi, dan hasil.',
      description:
        'Beberapa project pilihan yang menampilkan problem, solusi, role, tech stack, screenshot halaman, dan project overview dalam bentuk PDF.',
      role: 'Role',
      problem: 'Problem',
      solution: 'Solution',
      techStack: 'Tech Stack',
      screenshotPreview: 'Screenshot Preview',
      liveDemo: 'Live Demo',
      projectOverview: 'Project Overview',
    },
    chatbotSection: {
      eyebrow: 'AI Consultant',
      title: 'Chatbot Estimasi Project',
      description:
        'Tanyakan kebutuhan website, web app, chatbot AI, atau aplikasi mobile. AI akan menganalisis kompleksitas dan sistem akan menghitung estimasi harga awal dalam Rupiah.',
    },
    chatbot: {
      quickPromptTitle: 'Coba prompt cepat',
      initialAssistantMessage: 'Halo, saya asisten AI Tegar.',
      starterPrompts: [
        'Saya mau bikin website profil sederhana tanpa ada login multi-role',
        'Untuk pengembangan aplikasi seluler dengan kompleksitas menengah keatas, berapa kira-kira estimasinya?',
        'Saya masih awam tentang teknologi, kalau mau bikin website harus mulai dari mana?',
      ],
      placeholder: 'Tulis pertanyaan atau kebutuhan project kamu...',
      loadingButton: 'Menganalisa...',
      sendButton: 'Kirim',
      requestError: 'Chatbot gagal memproses pesan.',
      fallbackReply: 'Maaf, terjadi kesalahan saat memproses pesan.',
      connectionError: 'Koneksi gagal atau server sedang bermasalah. Coba ulangi beberapa saat lagi.',
    },
    contactSection: {
      eyebrow: 'Contact Me',
      title: 'Diskusikan project secara jelas.',
      description:
        'Jelaskan tujuan bisnis, fitur utama, deadline, dan referensi desain. Scope yang jelas membuat estimasi biaya lebih akurat.',
    },
    contactForm: {
      name: 'Nama',
      email: 'Email',
      subject: 'Subject (minimal 10 karakter)',
      message: 'Ceritakan kebutuhan project kamu... (minimal 10 karakter)',
      loadingButton: 'Mengirim...',
      sendButton: 'Kirim Pesan',
      success: 'Pesan berhasil dikirim.',
      requestFailed: 'Request gagal dengan status',
      connectionError: 'Koneksi gagal. Pastikan server aktif.',
    },
    footer: {
      rights: 'All rights reserved.',
      builtWith: 'Built with Next.js, Supabase, and AI pricing engine.',
    },
  },
  en: {
    navbar: {
      brand: 'Portfolio',
      about: 'About',
      skills: 'Skills',
      experience: 'Experience',
      projects: 'Projects',
      chatbot: 'AI Chatbot',
      contact: 'Contact',
      admin: 'Admin',
    },
    languageToggle: {
      label: 'Switch language',
      id: 'ID',
      en: 'EN',
    },
    hero: {
      availability: 'Available for web, UI/UX, and mobile app projects',
      title: 'Where design meets function.',
      contactButton: 'Contact Me',
      aiButton: 'Ask AI Estimator',
    },
    about: {
      eyebrow: 'About Me',
      title: 'A developer with a business-operations perspective.',
    },
    skills: {
      eyebrow: 'Skills',
      title: 'Technical skills relevant to project delivery.',
    },
    experience: {
      eyebrow: 'Experience',
      title: 'Work experience, internships, and projects.',
      present: 'Present',
    },
    projects: {
      eyebrow: 'Featured Projects',
      title: 'Projects that show process, solutions, and results.',
      description:
        'Selected projects covering problems, solutions, roles, tech stacks, page screenshots, and project overviews in PDF format.',
      role: 'Role',
      problem: 'Problem',
      solution: 'Solution',
      techStack: 'Tech Stack',
      screenshotPreview: 'Screenshot Preview',
      liveDemo: 'Live Demo',
      projectOverview: 'Project Overview',
    },
    chatbotSection: {
      eyebrow: 'AI Consultant',
      title: 'Project Estimation Chatbot',
      description:
        'Ask about website, web app, AI chatbot, or mobile app requirements. The AI will analyze complexity and calculate an initial price estimate in Indonesian Rupiah.',
    },
    chatbot: {
      quickPromptTitle: 'Try a quick prompt',
      initialAssistantMessage: "Hello, I am Tegar's AI assistant.",
      starterPrompts: [
        'I want to build a simple profile website without multi-role login',
        'For a medium-to-advanced mobile app, what is the estimated cost?',
        'I am new to technology. Where should I start if I want to build a website?',
      ],
      placeholder: 'Write your question or project requirements...',
      loadingButton: 'Analyzing...',
      sendButton: 'Send',
      requestError: 'The chatbot failed to process the message.',
      fallbackReply: 'Sorry, an error occurred while processing the message.',
      connectionError: 'Connection failed or the server is having issues. Try again later.',
    },
    contactSection: {
      eyebrow: 'Contact Me',
      title: 'Discuss your project clearly.',
      description:
        'Describe your business goals, core features, deadline, and design references. A clear scope makes the cost estimate more accurate.',
    },
    contactForm: {
      name: 'Name',
      email: 'Email',
      subject: 'Subject (minimum 10 characters)',
      message: 'Describe your project requirements... (minimum 10 characters)',
      loadingButton: 'Sending...',
      sendButton: 'Send Message',
      success: 'Message sent successfully.',
      requestFailed: 'Request failed with status',
      connectionError: 'Connection failed. Make sure the server is active.',
    },
    footer: {
      rights: 'All rights reserved.',
      builtWith: 'Built with Next.js, Supabase, and AI pricing engine.',
    },
  },
} as const;
