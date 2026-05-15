'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';

import { LIVE_PREVIEW_QUERY_BY_TYPENAME } from '@/components/contentful/live-preview-query-by-typename';
import { useContentfulPreviewEnabled } from '@/components/contentful/contentful-preview-provider';

type LivePreviewEntry = Record<string, unknown> & {
  __typename?: string | null;
};

/**
 * Central live-preview resolution for Contentful marketing entries. This is used
 * both for page-rendered entries and Ninetailed-selected replacement variants.
 */
export function useLiveMarketingEntry<T extends LivePreviewEntry | null | undefined>(entry: T): T {
  const preview = useContentfulPreviewEnabled();
  const typename = entry?.__typename ?? '';
  const query = typename ? LIVE_PREVIEW_QUERY_BY_TYPENAME[typename] : undefined;
  const live = useContentfulLiveUpdates(
    entry,
    query
      ? {
          query,
          skip: !preview,
        }
      : {
          skip: !preview,
        },
  );
  return (live ?? entry) as T;
}
