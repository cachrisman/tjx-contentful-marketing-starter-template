/**
 * Section palette = an editor-picked emphasis level for a marketing block.
 *
 * Resolution happens entirely in CSS (`[data-section-palette='…']` selectors in
 * `globals.css`) so each palette adapts to the active light/dark site theme.
 * This module's only job is to translate a Contentful label (current or
 * legacy) into a slug used as the HTML data attribute value.
 */
export const PALETTE_SLUGS = [
  'default',
  'subtle',
  'soft',
  'medium',
  'strong',
  'bold',
  'inverse',
  'accent',
] as const;

export type PaletteSlug = (typeof PALETTE_SLUGS)[number];

const SLUG_BY_LABEL: Record<string, PaletteSlug> = {
  '1. Default': 'default',
  '2. Subtle': 'subtle',
  '3. Soft': 'soft',
  '4. Medium': 'medium',
  '5. Strong': 'strong',
  '6. Bold': 'bold',
  '7. Inverse': 'inverse',
  '8. Accent': 'accent',
  '1. White (#FFFFFF)': 'default',
  '2. White Smoke (#FCFCFC)': 'subtle',
  '3. Light Gray (#F4F4F4)': 'soft',
  '4. Gray (#EAEAEA)': 'medium',
  '5. Steel Gray (#BBBBBB)': 'strong',
  '6. Dark Gray (#797979)': 'bold',
  '7. Black (#000000)': 'inverse',
};

export function paletteSlugFromContentful(palette?: string | null): PaletteSlug {
  if (!palette) return 'default';
  return SLUG_BY_LABEL[palette.trim()] ?? 'default';
}

export const CONTAINER_WIDTH_PX = 1260;
export const HEADER_HEIGHT = '9rem';
export const HEADER_HEIGHT_MD = '8rem';
