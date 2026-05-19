'use client';

import { TimelineLocalePageLink as LocalePageLink } from '@/components/contentful/timeline-locale-link';
import { NT_METRIC_HERO_CTA_CLICK } from '@/components/personalization/metrics-events';
import { useTrackEvent } from '@/components/personalization/use-track-event';
import type { Locale } from '@/lib/i18n/config';

/**
 * Renders the hero CTA only under `NinetailedProvider` — must never be mounted
 * when `NEXT_PUBLIC_NINETAILED_CLIENT_ID` is unset (baseline layout has no provider).
 */
export function HeroCtaNinetailedTrack({
  locale,
  slug,
  ctaText,
  heroEntryId,
  className,
}: {
  locale: Locale;
  slug: string;
  ctaText: string;
  heroEntryId: string;
  className: string;
}) {
  const trackEvent = useTrackEvent();
  return (
    <LocalePageLink
      locale={locale}
      slug={slug}
      className={className}
      onClick={() =>
        trackEvent(NT_METRIC_HERO_CTA_CLICK, {
          hero_entry_id: heroEntryId,
          target_slug: slug,
          cta_text: ctaText,
        })
      }
    >
      {ctaText}
    </LocalePageLink>
  );
}
