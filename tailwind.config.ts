import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0f172a',
        muted: '#64748b',
        panel: 'rgba(255, 255, 255, 0.72)',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
