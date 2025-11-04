import en from '../locales/en.json';
import he from '../locales/he.json';

export type Locale = 'en' | 'he';

type Translations = Record<string, string>;

const translations: Record<Locale, Translations> = {
  en,
  he,
};

export function t(key: string, locale: Locale): string {
  return translations[locale][key] ?? key;
}
