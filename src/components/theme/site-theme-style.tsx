import type { SiteThemeColors } from '@/lib/theme/site-theme';

/** Injects Contentful-driven light/dark palette as CSS custom properties (resolved per active color scheme in globals.css). */
export function SiteThemeStyle({ colors }: { colors: SiteThemeColors }) {
  const css = `:root {
  --site-theme-light-text: ${colors.lightText};
  --site-theme-light-bg: ${colors.lightBg};
  --site-theme-light-accent: ${colors.lightAccent};
  --site-theme-dark-text: ${colors.darkText};
  --site-theme-dark-bg: ${colors.darkBg};
  --site-theme-dark-accent: ${colors.darkAccent};
}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
