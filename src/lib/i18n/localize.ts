import type { Language } from '@/lib/i18n/LanguageProvider';

export function getLocalizedText<T extends object>(
  item: T,
  key: string,
  language: Language,
) {
  const source = item as Record<string, unknown>;
  const englishValue = source[`${key}_en`];
  const defaultValue = source[key];

  if (language === 'en' && typeof englishValue === 'string' && englishValue.trim()) {
    return englishValue;
  }

  return typeof defaultValue === 'string' ? defaultValue : '';
}
