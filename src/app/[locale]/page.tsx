import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarketingSection } from '@/components/marketing/marketing-section';
import { pickGlobalSettingsEntry, loadGlobalSettings } from '@/lib/contentful/global-settings';
import { loadPageBySlug } from '@/lib/contentful/load-page';
import { metadataForPage } from '@/lib/contentful/page-metadata';
import { isContentfulPreview } from '@/lib/contentful/preview-request';
import { isLocale, type Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  const preview = await isContentfulPreview();
  const [data, globalCollection] = await Promise.all([
    loadPageBySlug('home', loc, preview),
    loadGlobalSettings(loc, preview),
  ]);
  const gs = pickGlobalSettingsEntry(globalCollection);
  return metadataForPage(data?.page, gs);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const preview = await isContentfulPreview();
  const data = await loadPageBySlug('home', locale, preview);
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
