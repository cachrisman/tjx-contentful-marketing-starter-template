'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

import {
  ContentfulInspector,
  type ContentfulInspectorAttributes,
} from '@/components/contentful/contentful-inspector';
import { TimelineLocalePageLink as LocalePageLink } from '@/components/contentful/timeline-locale-link';
import { HeroCtaNinetailedTrack } from '@/components/personalization/hero-cta-ninetailed-track';
import { RichTextField } from '@/components/marketing/richtext';
import type { Locale } from '@/lib/i18n/config';
import type { CtfHeroBannerQuery } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import { paletteSlugFromContentful, type PaletteSlug } from '@/lib/theme/palette';

export type HeroBannerEntry = NonNullable<CtfHeroBannerQuery['componentHeroBanner']>;

const HEADLINE_CLS = 'text-[var(--section-headline)]';
const TEXT_CLS = 'text-[var(--section-fg)]';
const BUTTON_CLS =
  'inline-block rounded-[9px] px-6 py-3 text-[2.1rem] font-medium border bg-[var(--section-button-bg)] text-[var(--section-button-fg)] border-[var(--section-button-border)] transition hover:-translate-y-1 hover:shadow-md';

function cfSrc(url: string, w: number) {
  return `${url}?w=${w}&fm=webp&q=80`;
}

function SectionShell({
  children,
  className,
  narrow,
  ...rest
}: React.ComponentPropsWithoutRef<'div'> & { narrow?: boolean }) {
  const max = narrow ? 'max-w-[77rem]' : 'max-w-[126.2rem]';
  return (
    <div className={clsx('mx-auto w-full px-6 md:px-12', max, className)} {...rest}>
      {children}
    </div>
  );
}

export const HeroBannerView = forwardRef<
  HTMLElement,
  { entry: HeroBannerEntry; locale: Locale; ctaTracking?: boolean }
>(function HeroBannerView({ entry, locale, ctaTracking = false }, ref) {
  const imageStyle = entry.imageStyle ? 'partial' : 'full';
  const heroFull = entry.heroSize !== false;
  const bgUrl = entry.image?.url
    ? cfSrc(entry.image.url, imageStyle === 'partial' ? 1534 : 2400)
    : undefined;
  const fullBleedImage = imageStyle === 'full' && Boolean(bgUrl);
  const paletteSlug: PaletteSlug | undefined = fullBleedImage
    ? 'inverse'
    : paletteSlugFromContentful(entry.colorPalette);

  const section = (imageAttrs: ContentfulInspectorAttributes) => (
    <section
      ref={ref as React.Ref<HTMLDivElement>}
      {...(fullBleedImage ? imageAttrs : {})}
      data-section-palette={paletteSlug}
      className={clsx(
        'relative flex w-full overflow-hidden bg-cover bg-center',
        'bg-[var(--section-bg)] text-[var(--section-fg)]',
        heroFull ? 'min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-9rem)]' : 'py-24',
      )}
      style={fullBleedImage ? { backgroundImage: `url(${bgUrl})` } : undefined}
    >
      {imageStyle === 'partial' && bgUrl && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 max-w-[192rem] md:block">
          <ContentfulInspector entryId={entry.sys.id} fieldId="image">
            {attrs => (
              <div
                {...attrs}
                className="absolute inset-y-0 right-0 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${bgUrl})` }}
              />
            )}
          </ContentfulInspector>
        </div>
      )}
      <SectionShell className="relative z-[1] flex max-w-[125.8rem] flex-col py-24 md:py-32">
        {entry.headline && (
          <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
            {attrs => (
              <h1
                {...attrs}
                className={clsx(
                  'max-w-[44rem] text-[3rem] font-extrabold leading-[1.08] xl:text-[3.8rem]',
                  HEADLINE_CLS,
                )}
              >
                {entry.headline}
              </h1>
            )}
          </ContentfulInspector>
        )}
        {entry.bodyText?.json && (
          <ContentfulInspector entryId={entry.sys.id} fieldId="bodyText">
            {attrs => (
              <div {...attrs} className={clsx('mt-6 max-w-[46.9rem]', TEXT_CLS)}>
                <RichTextField
                  json={entry.bodyText!.json}
                  locale={locale}
                  className="[&_p]:text-[2.5rem]"
                />
              </div>
            )}
          </ContentfulInspector>
        )}
        {entry.targetPage && entry.ctaText && (
          <div className="mt-6">
            <ContentfulInspector entryId={entry.sys.id} fieldId="ctaText">
              {attrs => (
                <span {...attrs} className="inline-block">
                  {ctaTracking ? (
                    <HeroCtaNinetailedTrack
                      locale={locale}
                      slug={entry.targetPage!.slug!}
                      ctaText={entry.ctaText!}
                      heroEntryId={entry.sys.id}
                      className={BUTTON_CLS}
                    />
                  ) : (
                    <LocalePageLink
                      locale={locale}
                      slug={entry.targetPage!.slug}
                      className={BUTTON_CLS}
                    >
                      {entry.ctaText}
                    </LocalePageLink>
                  )}
                </span>
              )}
            </ContentfulInspector>
          </div>
        )}
      </SectionShell>
    </section>
  );

  if (!fullBleedImage) {
    return section({});
  }

  return (
    <ContentfulInspector entryId={entry.sys.id} fieldId="image">
      {attrs => section(attrs)}
    </ContentfulInspector>
  );
});
