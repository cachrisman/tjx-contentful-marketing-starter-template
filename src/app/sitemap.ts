import type { MetadataRoute } from 'next';

import { contentfulGraphql } from '@/lib/contentful/graphql-request';
import { AllPageSlugsDocument } from '@/lib/contentful/graphql/all-pages.generated';
import { locales } from '@/lib/i18n/config';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
    });

    try {
      const data = await contentfulGraphql(
        AllPageSlugsDocument,
        { locale, preview: false },
        { preview: false },
      );
      const items = data.pageCollection?.items?.filter(Boolean) ?? [];
      for (const p of items) {
        if (!p?.slug || p.slug === 'home') continue;
        entries.push({
          url: `${base}/${locale}/${p.slug}`,
          lastModified: new Date(),
        });
      }
    } catch {
      /* ignore when env missing */
    }
  }

  return entries;
}
