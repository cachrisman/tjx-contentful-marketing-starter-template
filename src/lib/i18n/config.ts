export const locales = ['en-US', 'de-DE'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en-US';

export function isLocale(s: string): s is Locale {
  return (locales as readonly string[]).includes(s);
}
