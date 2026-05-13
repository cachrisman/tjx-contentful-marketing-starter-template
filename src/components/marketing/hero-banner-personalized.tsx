'use client';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import { Experience, ESRLoadingComponent } from '@ninetailed/experience.js-react';
import { forwardRef, type RefAttributes } from 'react';

import type { Locale } from '@/lib/i18n/config';

import { HeroBannerView, type HeroBannerEntry } from '@/components/marketing/hero-banner-view';

type HeroExpProps = { id: string; entry: HeroBannerEntry; locale: Locale; ctaTracking: boolean };

const HeroExperienceBody = forwardRef<HTMLElement, HeroExpProps>(function HeroExperienceBody(
  { id: _id, entry, locale, ctaTracking },
  ref,
) {
  return <HeroBannerView ref={ref} entry={entry} locale={locale} ctaTracking={ctaTracking} />;
});

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
  if (!ninetailedConfigured || !experiences.length) {
    return <HeroBannerView entry={entry} locale={locale} ctaTracking={ninetailedConfigured} />;
  }

  return (
    <Experience
      id={entry.sys.id}
      entry={entry}
      experiences={
        experiences as unknown as ExperienceConfiguration<
          HeroExpProps & RefAttributes<HTMLElement>
        >[]
      }
      passthroughProps={{ locale, ctaTracking: true }}
      component={HeroExperienceBody}
      loadingComponent={ESRLoadingComponent}
    />
  );
}
