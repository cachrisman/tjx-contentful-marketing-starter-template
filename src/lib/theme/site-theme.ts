import type { CtfGlobalSettingsQuery } from '@/lib/contentful/graphql/ctf-global-settings.generated';

export const SITE_COLOR_SCHEME_STORAGE_KEY = 'site-color-scheme';

export type SiteThemeColors = {
  lightText: string;
  lightBg: string;
  lightAccent: string;
  darkText: string;
  darkBg: string;
  darkAccent: string;
};

export const defaultSiteThemeColors: SiteThemeColors = {
  lightText: '#1B273A',
  lightBg: '#FFFFFF',
  lightAccent: '#C40018',
  darkText: '#F4F4F4',
  darkBg: '#121212',
  darkAccent: '#FF6B4A',
};

/** Leading hex match only — Live Preview / Content Source Maps can append invisible chars to scalars. Order longest-first so `#cda9f9` is not read as `#cda`. */
const HEX_LEAD = /^#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/;

export function normalizeCssColor(value: string | null | undefined, fallback: string): string {
  if (!value?.trim()) return fallback;
  const v = value.trim();
  const hex = v.match(HEX_LEAD);
  if (hex) return hex[0];
  const func = v.match(/^(?:rgb|hsl)a?\([^)]*\)/i);
  if (func) return func[0];
  return fallback;
}

export type GlobalSettingsItem = NonNullable<
  NonNullable<NonNullable<CtfGlobalSettingsQuery['globalSettingsCollection']>['items']>[number]
>;

export function siteThemeFromGlobalSettings(item: GlobalSettingsItem | null | undefined): SiteThemeColors {
  const d = defaultSiteThemeColors;
  if (!item) return d;
  return {
    lightText: normalizeCssColor(item.lightThemeTextColor, d.lightText),
    lightBg: normalizeCssColor(item.lightThemeBackgroundColor, d.lightBg),
    lightAccent: normalizeCssColor(item.lightThemeAccentColor, d.lightAccent),
    darkText: normalizeCssColor(item.darkThemeTextColor, d.darkText),
    darkBg: normalizeCssColor(item.darkThemeBackgroundColor, d.darkBg),
    darkAccent: normalizeCssColor(item.darkThemeAccentColor, d.darkAccent),
  };
}
