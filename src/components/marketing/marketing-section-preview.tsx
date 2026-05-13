'use client';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';

import { LiveMarketingSection } from '@/components/contentful/live-marketing-section';
import { HeroBannerPersonalized } from '@/components/marketing/hero-banner-personalized';
import { MarketingEntryView } from '@/components/marketing/marketing-blocks';
import type { CtfHeroBannerQuery } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import type { Locale } from '@/lib/i18n/config';
import type { ResolvedMarketingEntry } from '@/lib/contentful/resolve-entry';

/**
 * Client-only wrapper so `LiveMarketingSection`'s render-prop `children` is
 * created in the browser — Server Components cannot pass functions into Client
 * Components (Next.js RSC serialization).
 */
export function MarketingSectionPreviewHero({
  entry,
  locale,
  experiences,
  ninetailedConfigured,
}: {
  entry: ResolvedMarketingEntry;
  locale: Locale;
  experiences: ExperienceConfiguration[];
  ninetailedConfigured: boolean;
}) {
  return (
    <LiveMarketingSection entry={entry}>
      {live => (
        <HeroBannerPersonalized
          entry={live as NonNullable<CtfHeroBannerQuery['componentHeroBanner']>}
          locale={locale}
          experiences={experiences}
          ninetailedConfigured={ninetailedConfigured}
        />
      )}
    </LiveMarketingSection>
  );
}

export function MarketingSectionPreviewEntry({
  entry,
  locale,
}: {
  entry: ResolvedMarketingEntry;
  locale: Locale;
}) {
  return (
    <LiveMarketingSection entry={entry}>
      {live => <MarketingEntryView entry={live as ResolvedMarketingEntry} locale={locale} />}
    </LiveMarketingSection>
  );
}
