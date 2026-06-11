'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <LanguageProvider>{children}</LanguageProvider>;
}