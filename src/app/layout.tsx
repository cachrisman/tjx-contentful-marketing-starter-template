import type { Metadata } from 'next';
import { Red_Hat_Display } from 'next/font/google';
import Script from 'next/script';

import { VercelObservability } from '@/components/layout/vercel-observability';
import { SITE_COLOR_SCHEME_STORAGE_KEY } from '@/lib/theme/site-theme';
import { siteConfig } from '@/lib/site-config';

import './globals.css';

const SITE_COLOR_SCHEME_BOOTSTRAP = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(SITE_COLOR_SCHEME_STORAGE_KEY)});
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    document.documentElement.dataset.colorScheme = mode;
  } catch (e) {
    document.documentElement.dataset.colorScheme = 'light';
  }
})();
`;

const redHat = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-red-hat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url || 'http://localhost:3000'),
  title: { default: siteConfig.meta.title, template: '%s' },
  description: siteConfig.meta.description,
  openGraph: {
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [{ url: siteConfig.meta.image }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={redHat.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <Script id="site-color-scheme-bootstrap" strategy="beforeInteractive">
          {SITE_COLOR_SCHEME_BOOTSTRAP}
        </Script>
        {children}
        <VercelObservability />
      </body>
    </html>
  );
}
