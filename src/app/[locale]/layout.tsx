import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { ContentfulPreviewProvider } from '@/components/contentful/contentful-preview-provider';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { loadFooter, loadNavigation } from '@/lib/contentful/resolve-entry';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const { isEnabled } = await draftMode();

  const [navigation, footer] = await Promise.all([
    loadNavigation(locale, isEnabled),
    loadFooter(locale, isEnabled),
  ]);

  return (
    <ContentfulPreviewProvider locale={locale} preview={isEnabled}>
      <SiteHeader locale={locale} navigation={navigation} />
      <main className="flex w-full flex-1 flex-col items-stretch">{children}</main>
      <SiteFooter locale={locale} footer={footer} />
    </ContentfulPreviewProvider>
  );
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
