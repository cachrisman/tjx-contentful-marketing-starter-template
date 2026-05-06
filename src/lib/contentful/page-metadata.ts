import type { Metadata } from 'next';

import type { CtfPageFieldsFragment } from '@/lib/contentful/graphql/ctf-page.generated';
import type { CtfGlobalSettingsQuery } from '@/lib/contentful/graphql/ctf-global-settings.generated';
import { siteConfig } from '@/lib/site-config';

type GlobalSettingsEntry = NonNullable<
  NonNullable<CtfGlobalSettingsQuery['globalSettingsCollection']>['items'][number]
>;

type SeoMetadata = CtfPageFieldsFragment['seo'];

function pickNonEmpty(...values: (string | null | undefined)[]): string | undefined {
  for (const v of values) {
    if (v != null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return undefined;
}

/** Page-linked SEO takes precedence; otherwise Global settings default SEO; then site title/description strings and static fallback. */
export function metadataForPage(
  page: CtfPageFieldsFragment | null | undefined,
  globalEntry: GlobalSettingsEntry | null | undefined,
): Metadata {
  const pageSeo = page?.seo;
  const defaultSeo = globalEntry?.defaultSeo;
  const siteTitle = globalEntry?.siteTitle?.trim();
  const siteDescription = globalEntry?.siteDescription?.trim();

  const title = pickNonEmpty(
    pageSeo?.title,
    defaultSeo?.title,
    page?.pageName ?? undefined,
    siteTitle,
    siteConfig.meta.title,
  );
  const description = pickNonEmpty(
    pageSeo?.description,
    defaultSeo?.description,
    siteDescription,
    siteConfig.meta.description,
  );

  const robotsSource: SeoMetadata = pageSeo ?? defaultSeo;
  const robots =
    robotsSource?.noIndex || robotsSource?.noFollow
      ? {
          index: robotsSource.noIndex ? false : true,
          follow: robotsSource.noFollow ? false : true,
        }
      : undefined;

  const ogImageUrl = pickNonEmpty(pageSeo?.image?.url, defaultSeo?.image?.url) ?? siteConfig.meta.image;

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl }],
    },
  };
}
