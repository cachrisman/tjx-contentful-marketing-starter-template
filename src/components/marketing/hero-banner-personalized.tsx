'use client';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import { selectExperienceBaselineWithVariants } from '@ninetailed/experience.js';
import { Experience, ESRLoadingComponent } from '@ninetailed/experience.js-react';
import { forwardRef, useEffect, type RefAttributes } from 'react';

import type { Locale } from '@/lib/i18n/config';

import { useLiveMarketingEntry } from '@/components/contentful/use-live-marketing-entry';
import { HeroBannerView, type HeroBannerEntry } from '@/components/marketing/hero-banner-view';

type HeroExpProps = {
  id: string;
  /** Baseline hero from `<Experience entry={…} />` — kept in passthrough for variant fallbacks. */
  baselineEntry: HeroBannerEntry;
  /** Present for baseline / loading; variant rows may omit this when the SDK passes the entry flat. */
  entry?: HeroBannerEntry;
  locale: Locale;
  ctaTracking: boolean;
};

function isHeroPreviewDebug(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  if (process.env.NEXT_PUBLIC_NINETAILED_PREVIEW_DEBUG === '1') return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('nt_preview_debug') === '1';
  } catch {
    return false;
  }
}

function heroEntryFromExperienceProps(props: Record<string, unknown>): HeroBannerEntry {
  const entry = props.entry as HeroBannerEntry | undefined;
  if (entry) return entry;
  const data = props.data as HeroBannerEntry | undefined;
  if (data?.__typename === 'ComponentHeroBanner' && data.sys?.id) return data;
  const baselineEntry = props.baselineEntry as HeroBannerEntry | undefined;
  const {
    locale: _l,
    ctaTracking: _t,
    id: _i,
    ninetailed: _n,
    entry: _e,
    baselineEntry: _b,
    ...variantLike
  } = props;
  if (
    variantLike &&
    typeof variantLike === 'object' &&
    (variantLike as { __typename?: string }).__typename === 'ComponentHeroBanner' &&
    (variantLike as { sys?: { id?: string } }).sys?.id
  ) {
    return variantLike as HeroBannerEntry;
  }
  if (!baselineEntry) {
    throw new Error('HeroExperienceBody: expected baselineEntry in passthroughProps');
  }
  return baselineEntry;
}

/**
 * Preview-plugin selection middleware picks the first catalog experience whose id
 * appears in `experienceVariantIndexes`. The Contentful catalog is space-wide, so
 * another experience can win first; it then fails the hero `baseline.id` pin and
 * the UI stays on baseline. Only pass experiences that actually replace this hero.
 */
function experiencesForHeroBaseline(
  experiences: ExperienceConfiguration[],
  entry: HeroBannerEntry,
): ExperienceConfiguration[] {
  const baseline = { id: entry.sys.id, entry };
  return experiences.filter(exp => selectExperienceBaselineWithVariants(exp, baseline) !== null);
}

const HeroExperienceBody = forwardRef<HTMLElement, HeroExpProps & Record<string, unknown>>(
  function HeroExperienceBody(props, ref) {
    const locale = props.locale as Locale;
    const ctaTracking = props.ctaTracking as boolean;
    const heroEntry = heroEntryFromExperienceProps(props as Record<string, unknown>);
    const liveHeroEntry = useLiveMarketingEntry(
      heroEntry as HeroBannerEntry & Record<string, unknown>,
    ) as HeroBannerEntry;
    useEffect(() => {
      if (!isHeroPreviewDebug()) return;
      const baselineEntry = props.baselineEntry as HeroBannerEntry | undefined;
      console.info('[Ninetailed Preview]', 'hero render', {
        selectedVariantPropId: props.id,
        renderedHeroId: liveHeroEntry.sys.id,
        baselineHeroId: baselineEntry?.sys.id,
        source: props.entry
          ? 'entry-prop'
          : props.data
            ? 'data-prop'
            : liveHeroEntry.sys.id === baselineEntry?.sys.id
              ? 'baseline-fallback'
              : 'flat-variant',
        ninetailed: props.ninetailed,
      });
    }, [
      liveHeroEntry.sys.id,
      props.baselineEntry,
      props.data,
      props.entry,
      props.id,
      props.ninetailed,
    ]);
    return (
      <HeroBannerView ref={ref} entry={liveHeroEntry} locale={locale} ctaTracking={ctaTracking} />
    );
  },
);

export function HeroBannerPersonalized({
  entry,
  locale,
  experiences,
  ninetailedConfigured,
}: {
  entry: HeroBannerEntry;
  locale: Locale;
  experiences: ExperienceConfiguration[];
  ninetailedConfigured: boolean;
}) {
  const heroExperiences = experiencesForHeroBaseline(experiences, entry);
  if (!ninetailedConfigured || !heroExperiences.length) {
    return <HeroBannerView entry={entry} locale={locale} ctaTracking={ninetailedConfigured} />;
  }

  return (
    <Experience
      id={entry.sys.id}
      entry={entry}
      experiences={
        heroExperiences as unknown as ExperienceConfiguration<
          HeroExpProps & RefAttributes<HTMLElement>
        >[]
      }
      passthroughProps={{ locale, ctaTracking: true, baselineEntry: entry }}
      component={HeroExperienceBody}
      loadingComponent={ESRLoadingComponent}
    />
  );
}
