'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import type { ReactNode } from 'react';

import { LIVE_PREVIEW_QUERY_BY_TYPENAME } from '@/components/contentful/live-preview-query-by-typename';

export function LiveMarketingSection<T extends Record<string, unknown>>({
  entry,
  children,
}: {
  entry: T;
  children: (live: T) => ReactNode;
}) {
  const typename =
    entry && typeof entry === 'object' && '__typename' in entry && typeof entry.__typename === 'string'
      ? entry.__typename
      : '';
  const query = LIVE_PREVIEW_QUERY_BY_TYPENAME[typename];
  const live = useContentfulLiveUpdates(entry, query ? { query } : undefined);
  const data = (live ?? entry) as T;
  return <>{children(data)}</>;
}
