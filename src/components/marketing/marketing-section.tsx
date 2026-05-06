'use client';

import { LiveMarketingSection } from '@/components/contentful/live-marketing-section';
import { MarketingEntryView } from '@/components/marketing/marketing-blocks';
import type { Locale } from '@/lib/i18n/config';
import type { ResolvedMarketingEntry } from '@/lib/contentful/resolve-entry';

export function MarketingSection({
  entry,
  locale,
  preview,
}: {
  entry: ResolvedMarketingEntry;
  locale: Locale;
  preview: boolean;
}) {
  if (!preview) {
    return <MarketingEntryView entry={entry} locale={locale} />;
  }
  return (
    <LiveMarketingSection entry={entry}>
      {live => <MarketingEntryView entry={live} locale={locale} />}
    </LiveMarketingSection>
  );
}
