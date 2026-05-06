export type ColorPaletteConfig = {
  headlineColor: string;
  textColor: string;
  backgroundColor: string;
  buttonVariant: 'dark' | 'light';
};

const colorConfigs: Record<string, ColorPaletteConfig> = {
  'palette-1. White (#FFFFFF)': {
    headlineColor: '#1B273A',
    textColor: '#414D63',
    backgroundColor: '#fff',
    buttonVariant: 'dark',
  },
  'palette-7. Black (#000000)': {
    headlineColor: '#fff',
    textColor: '#bbb',
    backgroundColor: '#000',
    buttonVariant: 'light',
  },
  'palette-2. White Smoke (#FCFCFC)': {
    headlineColor: '#1B273A',
    textColor: '#414D63',
    backgroundColor: '#fcfcfc',
    buttonVariant: 'dark',
  },
  'palette-3. Light Gray (#F4F4F4)': {
    headlineColor: '#000',
    textColor: '#000',
    backgroundColor: '#f4f4f4',
    buttonVariant: 'dark',
  },
  'palette-4. Gray (#EAEAEA)': {
    headlineColor: '#000',
    textColor: '#000',
    backgroundColor: '#eaeaea',
    buttonVariant: 'dark',
  },
  'palette-5. Steel Gray (#BBBBBB)': {
    headlineColor: '#000',
    textColor: '#000',
    backgroundColor: '#bbbbbb',
    buttonVariant: 'dark',
  },
  'palette-6. Dark Gray (#797979)': {
    headlineColor: '#fff',
    textColor: '#fff',
    backgroundColor: '#797979',
    buttonVariant: 'light',
  },
};

export function getColorConfigFromPalette(palette?: string | null): ColorPaletteConfig {
  if (!palette) {
    return colorConfigs['palette-1. White (#FFFFFF)']!;
  }
  const key = `palette-${palette}`;
  return colorConfigs[key] ?? colorConfigs['palette-1. White (#FFFFFF)']!;
}

export const CONTAINER_WIDTH_PX = 1260;
export const HEADER_HEIGHT = '9rem';
export const HEADER_HEIGHT_MD = '8rem';
