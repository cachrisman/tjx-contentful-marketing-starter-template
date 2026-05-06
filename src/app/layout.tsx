import type { Metadata } from 'next';
import { Red_Hat_Display } from 'next/font/google';

import { siteConfig } from '@/lib/site-config';

import './globals.css';

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
    <html lang="en" className={redHat.variable}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
