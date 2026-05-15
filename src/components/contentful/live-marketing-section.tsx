'use client';

import type { ReactNode } from 'react';

import { useLiveMarketingEntry } from '@/components/contentful/use-live-marketing-entry';

export function LiveMarketingSection<T extends Record<string, unknown>>({
  entry,
  children,
}: {
  entry: T;
  children: (live: T) => ReactNode;
}) {
  const data = useLiveMarketingEntry(entry);
  return <>{children(data)}</>;
}
