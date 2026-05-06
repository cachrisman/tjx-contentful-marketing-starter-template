import { CtfPageDocument } from '@/lib/contentful/graphql/ctf-page.generated';
import type { CtfPageFieldsFragment } from '@/lib/contentful/graphql/ctf-page.generated';
import { contentfulGraphqlSafe } from '@/lib/contentful/graphql-request';
import { normalizeSlug } from '@/lib/slug-normalize';
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
  const slugQuery = normalizeSlug(slug);
  if (slugQuery == null) {
    return null;
  }
  const data = await contentfulGraphqlSafe(CtfPageDocument, { slug: slugQuery, locale, preview }, { preview });
  if (!data) {
    return null;
  }

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
