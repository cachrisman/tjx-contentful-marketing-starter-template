import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { MarketingSection } from '@/components/marketing/marketing-section';
import { loadPageBySlug } from '@/lib/contentful/load-page';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/lib/site-config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  const { isEnabled } = await draftMode();
  const data = await loadPageBySlug('home', loc, isEnabled);
  const page = data?.page;
  const seo = page?.seo;
  const title = seo?.title ?? page?.pageName ?? siteConfig.meta.title;
  const description = seo?.description ?? siteConfig.meta.description;
  const robots =
    seo?.noIndex || seo?.noFollow
      ? {
          index: seo.noIndex ? false : true,
          follow: seo.noFollow ? false : true,
        }
      : undefined;

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      images: seo?.image?.url ? [{ url: seo.image.url }] : [{ url: siteConfig.meta.image }],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const { isEnabled } = await draftMode();
  const data = await loadPageBySlug('home', locale, isEnabled);
  if (!data) notFound();

  return (
    <>
      {data.topSection.map(
        (entry, i) =>
          entry && (
            <MarketingSection key={`top-${entry.sys.id}-${i}`} entry={entry} locale={locale} />
          ),
      )}
      {data.pageContent && (
        <MarketingSection entry={data.pageContent} locale={locale} />
      )}
      {data.extraSection.map(
        (entry, i) =>
          entry && (
            <MarketingSection key={`extra-${entry.sys.id}-${i}`} entry={entry} locale={locale} />
          ),
      )}
    </>
  );
}
