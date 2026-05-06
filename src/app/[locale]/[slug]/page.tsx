import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarketingSection } from '@/components/marketing/marketing-section';
import { pickGlobalSettingsEntry, loadGlobalSettings } from '@/lib/contentful/global-settings';
import { loadPageBySlug } from '@/lib/contentful/load-page';
import { metadataForPage } from '@/lib/contentful/page-metadata';
import { isContentfulPreview } from '@/lib/contentful/preview-request';
import { contentfulGraphql } from '@/lib/contentful/graphql-request';
import { AllPageSlugsDocument } from '@/lib/contentful/graphql/all-pages.generated';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { normalizeSlug } from '@/lib/slug-normalize';

export async function generateStaticParams() {
  const paths: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    try {
      const data = await contentfulGraphql(
        AllPageSlugsDocument,
        { locale, preview: false },
        { preview: false },
      );
      const items = data.pageCollection?.items?.filter(Boolean) ?? [];
      for (const p of items) {
        const slug = normalizeSlug(p?.slug ?? null);
        if (slug != null && slug !== 'home') {
          paths.push({ locale, slug });
        }
      }
    } catch {
      /* codegen / env missing in CI */
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: loc, slug: rawSlug } = await params;
  if (!isLocale(loc)) return {};
  const slug = normalizeSlug(rawSlug);
  if (slug == null) return { title: 'Not found' };
  const preview = await isContentfulPreview();
  const [data, globalCollection] = await Promise.all([
    loadPageBySlug(slug, loc, preview),
    loadGlobalSettings(loc, preview),
  ]);
  const page = data?.page;
  if (!page) return { title: 'Not found' };
  const gs = pickGlobalSettingsEntry(globalCollection);
  return metadataForPage(page, gs);
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: loc, slug: rawSlug } = await params;
  if (!isLocale(loc)) notFound();
  const slug = normalizeSlug(rawSlug);
  if (slug == null) notFound();
  const locale = loc as Locale;
  const preview = await isContentfulPreview();
  const data = await loadPageBySlug(slug, locale, preview);
  if (!data) notFound();

  return (
    <>
      {data.topSection.map(
        (entry, i) =>
          entry && (
            <MarketingSection key={`top-${entry.sys.id}-${i}`} entry={entry} locale={locale} preview={preview} />
          ),
      )}
      {data.pageContent && (
        <MarketingSection entry={data.pageContent} locale={locale} preview={preview} />
      )}
      {data.extraSection.map(
        (entry, i) =>
          entry && (
            <MarketingSection key={`extra-${entry.sys.id}-${i}`} entry={entry} locale={locale} preview={preview} />
          ),
      )}
    </>
  );
}
