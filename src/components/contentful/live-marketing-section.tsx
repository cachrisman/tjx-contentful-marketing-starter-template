'use client';

import { useContentfulLiveUpdates } from '@contentful/live-preview/react';
import type { ReactNode } from 'react';

export function LiveMarketingSection<T extends Record<string, unknown>>({
  entry,
  children,
}: {
  entry: T;
  children: (live: T) => ReactNode;
}) {
  const live = useContentfulLiveUpdates(entry);
  const data = (live ?? entry) as T;
  return <>{children(data)}</>;
}
