import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentfulPreviewProvider } from '@/components/contentful/contentful-preview-provider';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteThemeStyle } from '@/components/theme/site-theme-style';
import {
  footerFromGlobalSettings,
  loadGlobalSettings,
  navigationFromGlobalSettings,
  pickGlobalSettingsEntry,
} from '@/lib/contentful/global-settings';
import { isContentfulPreview } from '@/lib/contentful/preview-request';
import { loadFooter, loadNavigation } from '@/lib/contentful/resolve-entry';
import { siteConfig } from '@/lib/site-config';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { siteThemeFromGlobalSettings } from '@/lib/theme/site-theme';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    return {};
  }
  const locale = loc as Locale;
  const preview = await isContentfulPreview();
  const globalCollection = await loadGlobalSettings(locale, preview);
  const gs = pickGlobalSettingsEntry(globalCollection);
  const title = gs?.siteTitle?.trim() || siteConfig.meta.title;
  const description = gs?.siteDescription?.trim() || siteConfig.meta.description;
  const brand = gs?.siteName?.trim() || siteConfig.meta.title.split('|').pop()?.trim() || 'Site';
  return {
    title: { default: title, template: `%s | ${brand}` },
    description,
    openGraph: {
      title,
      description,
      images: [{ url: siteConfig.meta.image }],
    },
  };
}

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
  const preview = await isContentfulPreview();
  const contentfulEnvironment = process.env.CONTENTFUL_ENVIRONMENT?.trim() || undefined;

  const globalCollection = await loadGlobalSettings(locale, preview);
  const gs = pickGlobalSettingsEntry(globalCollection);
  const themeColors = siteThemeFromGlobalSettings(gs);

  const [navigationFallback, footerFallback] = await Promise.all([
    loadNavigation(locale, preview),
    loadFooter(locale, preview),
  ]);

  const navigation = navigationFromGlobalSettings(globalCollection) ?? navigationFallback;
  const footer = footerFromGlobalSettings(globalCollection) ?? footerFallback;

  return (
    <ContentfulPreviewProvider locale={locale} preview={preview} environment={contentfulEnvironment}>
      <SiteThemeStyle colors={themeColors} />
      <SiteHeader locale={locale} navigation={navigation} logo={gs?.logo} logoTarget={gs?.logoTarget} />
      <main className="flex w-full flex-1 flex-col items-stretch">{children}</main>
      <SiteFooter locale={locale} footer={footer} />
    </ContentfulPreviewProvider>
  );
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
