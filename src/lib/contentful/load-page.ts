import { CtfPageDocument } from '@/lib/contentful/graphql/ctf-page.generated';
import type { CtfPageFieldsFragment } from '@/lib/contentful/graphql/ctf-page.generated';
import { contentfulGraphql } from '@/lib/contentful/graphql-request';
import {
  resolveMarketingEntries,
  resolveMarketingEntry,
  type EntryRef,
  type ResolvedMarketingEntry,
} from '@/lib/contentful/resolve-entry';

export type LoadedPage = {
  page: CtfPageFieldsFragment;
  topSection: Array<ResolvedMarketingEntry | null>;
  pageContent: ResolvedMarketingEntry | null;
  extraSection: Array<ResolvedMarketingEntry | null>;
};

export async function loadPageBySlug(
  slug: string,
  locale: string | undefined,
  preview: boolean,
): Promise<LoadedPage | null> {
  const data = await contentfulGraphql(
    CtfPageDocument,
    { slug, locale, preview },
    { preview },
  );

  const page = data.pageCollection?.items?.[0];
  if (!page) {
    return null;
  }

  const topRefs = (page.topSectionCollection?.items ?? []).filter(Boolean) as EntryRef[];
  const extraRefs = (page.extraSectionCollection?.items ?? []).filter(Boolean) as EntryRef[];

  const [topSection, pageContent, extraSection] = await Promise.all([
    resolveMarketingEntries(topRefs, locale, preview),
    resolveMarketingEntry(page.pageContent as EntryRef | null, locale, preview),
    resolveMarketingEntries(extraRefs, locale, preview),
  ]);

  return {
    page,
    topSection,
    pageContent,
    extraSection,
  };
}
