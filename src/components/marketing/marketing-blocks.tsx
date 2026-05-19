'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

import { ContentfulInspector } from '@/components/contentful/contentful-inspector';
import { TimelineLocalePageLink as LocalePageLink } from '@/components/contentful/timeline-locale-link';
import { HeroBannerView } from '@/components/marketing/hero-banner-view';
import { RichTextField, type RichTextFieldProps } from '@/components/marketing/richtext';
import type { Locale } from '@/lib/i18n/config';
import type { ProductTableFieldsFragment } from '@/lib/contentful/graphql/ctf-product-table.generated';
import type { ResolvedMarketingEntry, RichTextEmbeddings } from '@/lib/contentful/resolve-entry';
import { paletteSlugFromContentful, type PaletteSlug } from '@/lib/theme/palette';

type Props = {
  entry: ResolvedMarketingEntry;
  locale: Locale;
};

function SectionShell({
  children,
  className,
  narrow,
  ...rest
}: ComponentPropsWithoutRef<'div'> & { narrow?: boolean }) {
  const max = narrow ? 'max-w-[77rem]' : 'max-w-[126.2rem]';
  return (
    <div className={clsx('mx-auto w-full px-6 md:px-12', max, className)} {...rest}>
      {children}
    </div>
  );
}

function PaletteSection({
  paletteKey,
  slug,
  children,
  className,
}: {
  /** Raw Contentful `colorPalette` value — translated to a slug internally. */
  paletteKey?: string | null;
  /** Force a specific palette slug (overrides paletteKey). */
  slug?: PaletteSlug;
  children: React.ReactNode;
  className?: string;
}) {
  const resolved = slug ?? paletteSlugFromContentful(paletteKey);
  return (
    <section
      data-section-palette={resolved}
      className={clsx('w-full bg-[var(--section-bg)] text-[var(--section-fg)]', className)}
    >
      {children}
    </section>
  );
}

const HEADLINE_CLS = 'text-[var(--section-headline)]';
const TEXT_CLS = 'text-[var(--section-fg)]';
const BUTTON_CLS =
  'inline-block rounded-[9px] px-6 py-3 text-[2.1rem] font-medium border bg-[var(--section-button-bg)] text-[var(--section-button-fg)] border-[var(--section-button-border)] transition hover:-translate-y-1 hover:shadow-md';

function cfSrc(url: string, w: number) {
  return `${url}?w=${w}&fm=webp&q=80`;
}

export function MarketingEntryView({ entry, locale }: Props) {
  switch (entry.__typename) {
    case 'ComponentHeroBanner': {
      return <HeroBannerView entry={entry} locale={locale} />;
    }

    case 'ComponentDuplex': {
      const imageRight = Boolean(entry.containerLayout);
      const imgUrl = entry.image?.url ? cfSrc(entry.image.url, 1600) : undefined;

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-12 md:py-20">
          <SectionShell>
            <div
              className={clsx(
                'grid gap-10 md:grid-cols-2 md:gap-16',
                imageRight ? 'md:[&>*:first-child]:order-2' : '',
              )}
            >
              <div className="my-auto flex flex-col">
                {entry.headline && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
                    {attrs => (
                      <h2
                        {...attrs}
                        className={clsx(
                          'max-w-[60.4rem] text-[3rem] font-bold leading-snug xl:text-[3.5rem]',
                          HEADLINE_CLS,
                        )}
                      >
                        {entry.headline}
                      </h2>
                    )}
                  </ContentfulInspector>
                )}
                {entry.bodyText?.json && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="bodyText">
                    {attrs => (
                      <div
                        {...attrs}
                        className={clsx(
                          'mt-7 text-[1.8rem] leading-relaxed md:text-[2.5rem] md:[&_p]:text-[1.8rem] xl:[&_p]:text-[1.8rem]',
                          TEXT_CLS,
                        )}
                      >
                        <RichTextField json={entry.bodyText!.json} locale={locale} />
                      </div>
                    )}
                  </ContentfulInspector>
                )}
                {entry.targetPage && entry.ctaText && (
                  <div className="mt-8">
                    <ContentfulInspector entryId={entry.sys.id} fieldId="ctaText">
                      {attrs => (
                        <span {...attrs} className="inline-block">
                          <LocalePageLink
                            locale={locale}
                            slug={entry.targetPage!.slug}
                            className={BUTTON_CLS}
                          >
                            {entry.ctaText}
                          </LocalePageLink>
                        </span>
                      )}
                    </ContentfulInspector>
                  </div>
                )}
              </div>
              {imgUrl && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="image">
                  {attrs => (
                    <div {...attrs} className="flex items-center justify-center">
                      <div className="rounded-2xl shadow-[0_13px_27px_-5px_rgba(25,37,50,0.15)]">
                        <Image
                          src={imgUrl}
                          alt={entry.image?.title ?? ''}
                          width={900}
                          height={700}
                          className="h-auto w-full rounded-2xl object-cover"
                        />
                      </div>
                    </div>
                  )}
                </ContentfulInspector>
              )}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentCta': {
      const buttons = [
        {
          text: entry.ctaText,
          page: entry.targetPage,
          params: entry.urlParameters,
          fieldId: 'ctaText',
        },
        {
          text: entry.ctaText2,
          page: entry.targetPage2,
          params: entry.urlParameters2,
          fieldId: 'ctaText2',
        },
        {
          text: entry.ctaText3,
          page: entry.targetPage3,
          params: entry.urlParameters3,
          fieldId: 'ctaText3',
        },
        {
          text: entry.ctaText4,
          page: entry.targetPage4,
          params: entry.urlParameters4,
          fieldId: 'ctaText4',
        },
      ].filter(
        (
          b,
        ): b is {
          text: string;
          page: NonNullable<typeof b.page>;
          params: string | null | undefined;
          fieldId: string;
        } => Boolean(b.text && b.page),
      );

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell className="text-center">
            {entry.headline && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
                {attrs => (
                  <h2 {...attrs} className={clsx('text-[3rem] font-semibold', HEADLINE_CLS)}>
                    {entry.headline}
                  </h2>
                )}
              </ContentfulInspector>
            )}
            {entry.subline?.json && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="subline">
                {attrs => (
                  <div
                    {...attrs}
                    className={clsx('mx-auto mt-6 max-w-3xl text-[1.8rem]', TEXT_CLS)}
                  >
                    <RichTextField json={entry.subline!.json} locale={locale} />
                  </div>
                )}
              </ContentfulInspector>
            )}
            {buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {buttons.map((btn, idx) => (
                  <ContentfulInspector key={idx} entryId={entry.sys.id} fieldId={btn.fieldId}>
                    {attrs => (
                      <span {...attrs} className="inline-block">
                        <LocalePageLink
                          locale={locale}
                          slug={btn.page.slug}
                          urlParameters={btn.params}
                          className={clsx(BUTTON_CLS, 'px-8 py-3')}
                        >
                          {btn.text}
                        </LocalePageLink>
                      </span>
                    )}
                  </ContentfulInspector>
                ))}
              </div>
            )}
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentInfoBlock': {
      const blocks = [
        {
          img: entry.block1Image,
          json: entry.block1Body,
          imageFieldId: 'block1Image',
          bodyFieldId: 'block1Body',
        },
        {
          img: entry.block2Image,
          json: entry.block2Body,
          imageFieldId: 'block2Image',
          bodyFieldId: 'block2Body',
        },
        {
          img: entry.block3Image,
          json: entry.block3Body,
          imageFieldId: 'block3Image',
          bodyFieldId: 'block3Body',
        },
      ];

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell>
            {(entry.headline || entry.subline) && (
              <div className="mb-12 text-center">
                {entry.headline && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
                    {attrs => (
                      <h2 {...attrs} className={clsx('text-[3rem] font-semibold', HEADLINE_CLS)}>
                        {entry.headline}
                      </h2>
                    )}
                  </ContentfulInspector>
                )}
                {entry.subline && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="subline">
                    {attrs => (
                      <p {...attrs} className={clsx('mt-4 text-[2rem]', TEXT_CLS)}>
                        {entry.subline}
                      </p>
                    )}
                  </ContentfulInspector>
                )}
              </div>
            )}
            <div className="grid gap-12 md:grid-cols-3">
              {blocks.map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  {b.img?.url && (
                    <ContentfulInspector entryId={entry.sys.id} fieldId={b.imageFieldId}>
                      {attrs => (
                        <div {...attrs} className="mb-6 w-full max-w-xs">
                          <Image
                            src={cfSrc(b.img!.url!, 600)}
                            alt={b.img!.title ?? ''}
                            width={320}
                            height={240}
                            className="h-auto w-full rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </ContentfulInspector>
                  )}
                  {b.json?.json && (
                    <ContentfulInspector entryId={entry.sys.id} fieldId={b.bodyFieldId}>
                      {attrs => (
                        <div {...attrs}>
                          <RichTextField
                            json={b.json!.json}
                            locale={locale}
                            richTextEmbeddings={undefined}
                          />
                        </div>
                      )}
                    </ContentfulInspector>
                  )}
                </div>
              ))}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentQuote': {
      const embed = (entry as { richTextEmbeddings?: RichTextEmbeddings }).richTextEmbeddings;
      const imgRight = Boolean(entry.imagePosition);

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell narrow>
            <div
              className={clsx(
                'flex flex-col gap-10 md:flex-row md:items-center',
                imgRight ? 'md:flex-row-reverse' : '',
              )}
            >
              {entry.image?.url && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="image">
                  {attrs => (
                    <div {...attrs} className="md:w-1/3">
                      <Image
                        src={cfSrc(entry.image!.url!, 900)}
                        alt={entry.image!.title ?? ''}
                        width={400}
                        height={400}
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                </ContentfulInspector>
              )}
              {entry.quote?.json && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="quote">
                  {attrs => (
                    <blockquote
                      {...attrs}
                      className={clsx(
                        'flex-1 text-[2.4rem] italic leading-snug md:text-[3rem]',
                        HEADLINE_CLS,
                        entry.quoteAlignment === true ? 'text-center' : '',
                      )}
                    >
                      <RichTextField
                        json={entry.quote!.json}
                        links={entry.quote!.links as RichTextFieldProps['links']}
                        richTextEmbeddings={embed}
                        locale={locale}
                      />
                    </blockquote>
                  )}
                </ContentfulInspector>
              )}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentTextBlock': {
      const embed = (entry as { richTextEmbeddings?: RichTextEmbeddings }).richTextEmbeddings;

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell>
            {entry.headline && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
                {attrs => (
                  <h2
                    {...attrs}
                    className={clsx('mb-6 text-center text-[3rem] font-semibold', HEADLINE_CLS)}
                  >
                    {entry.headline}
                  </h2>
                )}
              </ContentfulInspector>
            )}
            {entry.subline && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="subline">
                {attrs => (
                  <p {...attrs} className={clsx('mb-10 text-center text-[2rem]', TEXT_CLS)}>
                    {entry.subline}
                  </p>
                )}
              </ContentfulInspector>
            )}
            {entry.body?.json && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="body">
                {attrs => (
                  <div {...attrs}>
                    <RichTextField
                      json={entry.body!.json}
                      links={entry.body!.links as RichTextFieldProps['links']}
                      richTextEmbeddings={embed}
                      locale={locale}
                    />
                  </div>
                )}
              </ContentfulInspector>
            )}
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'TopicPerson': {
      const card = Boolean(entry.cardStyle);
      return (
        <SectionShell className="py-12">
          <div
            data-section-palette={card ? 'subtle' : 'default'}
            className={clsx(
              'flex flex-col gap-8 rounded-2xl p-8 md:flex-row md:items-start',
              'bg-[var(--section-bg)] text-[var(--section-fg)]',
              card ? 'shadow-[0_8px_16px_-8px_rgba(0,0,0,0.2)]' : '',
            )}
          >
            {entry.avatar?.url && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="avatar">
                {attrs => (
                  <div {...attrs} className="h-48 w-48 shrink-0 rounded-full">
                    <Image
                      src={cfSrc(entry.avatar!.url!, 400)}
                      alt={entry.name ?? ''}
                      width={200}
                      height={200}
                      className="h-48 w-48 rounded-full object-cover"
                    />
                  </div>
                )}
              </ContentfulInspector>
            )}
            <div>
              {entry.name && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="name">
                  {attrs => (
                    <h3 {...attrs} className={clsx('text-[2.8rem] font-bold', HEADLINE_CLS)}>
                      {entry.name}
                    </h3>
                  )}
                </ContentfulInspector>
              )}
              {(entry.location || entry.website) && (
                <p className={clsx('mt-2 text-[1.8rem] opacity-80', TEXT_CLS)}>
                  {entry.location && (
                    <ContentfulInspector entryId={entry.sys.id} fieldId="location">
                      {attrs => <span {...attrs}>{entry.location}</span>}
                    </ContentfulInspector>
                  )}
                  {entry.location && entry.website ? ' · ' : null}
                  {entry.website && (
                    <ContentfulInspector entryId={entry.sys.id} fieldId="website">
                      {attrs => <span {...attrs}>{entry.website}</span>}
                    </ContentfulInspector>
                  )}
                </p>
              )}
              {entry.bio?.json && (
                <div className="mt-6">
                  <ContentfulInspector entryId={entry.sys.id} fieldId="bio">
                    {attrs => (
                      <div {...attrs}>
                        <RichTextField json={entry.bio!.json} locale={locale} />
                      </div>
                    )}
                  </ContentfulInspector>
                </div>
              )}
            </div>
          </div>
        </SectionShell>
      );
    }

    case 'TopicProduct': {
      const fmt = new Intl.NumberFormat(locale.replace('_', '-'), {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });

      return (
        <PaletteSection slug="default" className="py-16">
          <SectionShell className="grid gap-12 md:grid-cols-2">
            <div>
              {entry.featuredImage?.url && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="featuredImage">
                  {attrs => (
                    <div {...attrs} className="w-full rounded-2xl shadow-lg">
                      <Image
                        src={cfSrc(entry.featuredImage!.url!, 1200)}
                        alt={entry.name ?? ''}
                        width={800}
                        height={600}
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-auto w-full rounded-2xl object-cover"
                      />
                    </div>
                  )}
                </ContentfulInspector>
              )}
            </div>
            <div>
              {entry.name && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="name">
                  {attrs => (
                    <h1 {...attrs} className={clsx('text-[3.6rem] font-bold', HEADLINE_CLS)}>
                      {entry.name}
                    </h1>
                  )}
                </ContentfulInspector>
              )}
              {entry.price != null && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="price">
                  {attrs => (
                    <p
                      {...attrs}
                      className={clsx('mt-4 text-[2.8rem] font-semibold', HEADLINE_CLS)}
                    >
                      {fmt.format(entry.price!)}
                    </p>
                  )}
                </ContentfulInspector>
              )}
              {entry.description?.json && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="description">
                  {attrs => (
                    <div {...attrs} className={clsx('mt-8 text-[1.8rem]', TEXT_CLS)}>
                      <RichTextField json={entry.description!.json} locale={locale} />
                    </div>
                  )}
                </ContentfulInspector>
              )}
              {entry.featuresCollection?.items?.length ? (
                <ul className="mt-10 space-y-10">
                  {entry.featuresCollection.items.filter(Boolean).map((f, idx) => (
                    <li
                      key={f!.sys.id ?? idx}
                      className="border-t border-[var(--section-border)] pt-8 first:border-0 first:pt-0"
                    >
                      {f!.name && (
                        <ContentfulInspector entryId={f!.sys.id} fieldId="name">
                          {attrs => (
                            <h4
                              {...attrs}
                              className={clsx('text-[2rem] font-semibold', HEADLINE_CLS)}
                            >
                              {f!.name}
                            </h4>
                          )}
                        </ContentfulInspector>
                      )}
                      {f!.shortDescription?.json && (
                        <ContentfulInspector entryId={f!.sys.id} fieldId="shortDescription">
                          {attrs => (
                            <div {...attrs} className={clsx('mt-3 text-[1.8rem]', TEXT_CLS)}>
                              <RichTextField json={f!.shortDescription!.json} locale={locale} />
                            </div>
                          )}
                        </ContentfulInspector>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentProductTable': {
      const items = entry.productsCollection?.items?.filter(Boolean) ?? [];

      return (
        <PaletteSection slug="subtle" className="py-16 md:py-24">
          <SectionShell>
            {(entry.headline || entry.subline) && (
              <div className="mb-12 text-center">
                {entry.headline && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="headline">
                    {attrs => (
                      <h2 {...attrs} className={clsx('text-[3rem] font-semibold', HEADLINE_CLS)}>
                        {entry.headline}
                      </h2>
                    )}
                  </ContentfulInspector>
                )}
                {entry.subline && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="subline">
                    {attrs => (
                      <p {...attrs} className={clsx('mt-4 text-[2rem]', TEXT_CLS)}>
                        {entry.subline}
                      </p>
                    )}
                  </ContentfulInspector>
                )}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-10">
              {items.map((p, idx) =>
                p ? (
                  <div
                    key={p.sys.id}
                    data-columns-count={items.length}
                    className="flex w-full max-w-[40.5rem] flex-shrink-0 flex-col md:w-[35rem] xl:w-[40.5rem]"
                  >
                    <ProductColumn product={p} locale={locale} emphasize={idx === 1} />
                  </div>
                ) : null,
              )}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'TopicBusinessInfo': {
      const embed = (entry as { richTextEmbeddings?: RichTextEmbeddings }).richTextEmbeddings;
      const heroUrl = entry.featuredImage?.url ? cfSrc(entry.featuredImage.url, 1920) : undefined;

      return (
        <PaletteSection slug="default" className="pb-24 pt-0">
          {(entry.name || entry.shortDescription) && (
            <div
              data-section-palette="inverse"
              className="relative mb-16 min-h-[59rem] bg-[var(--section-bg)]"
            >
              {heroUrl && (
                <ContentfulInspector entryId={entry.sys.id} fieldId="featuredImage">
                  {attrs => (
                    <div
                      {...attrs}
                      className="absolute inset-0 bg-cover bg-center opacity-90"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${heroUrl})`,
                      }}
                    />
                  )}
                </ContentfulInspector>
              )}
              <SectionShell
                narrow
                className={clsx(
                  'relative z-[1] flex min-h-[36rem] flex-col items-center justify-center px-6 py-16 text-center md:py-24',
                  HEADLINE_CLS,
                )}
              >
                {entry.name && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="name">
                    {attrs => (
                      <h1 {...attrs} className="max-w-xl text-[4.5rem] font-bold">
                        {entry.name}
                      </h1>
                    )}
                  </ContentfulInspector>
                )}
                {entry.shortDescription && (
                  <ContentfulInspector entryId={entry.sys.id} fieldId="shortDescription">
                    {attrs => (
                      <p {...attrs} className="mt-4 max-w-2xl text-[2.5rem]">
                        {entry.shortDescription}
                      </p>
                    )}
                  </ContentfulInspector>
                )}
              </SectionShell>
            </div>
          )}
          <SectionShell narrow>
            {entry.body?.json && (
              <ContentfulInspector entryId={entry.sys.id} fieldId="body">
                {attrs => (
                  <div {...attrs}>
                    <RichTextField
                      json={entry.body!.json}
                      links={entry.body!.links as RichTextFieldProps['links']}
                      richTextEmbeddings={embed}
                      locale={locale}
                    />
                  </div>
                )}
              </ContentfulInspector>
            )}
          </SectionShell>
        </PaletteSection>
      );
    }

    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn('[marketing] Unknown entry', (entry as { __typename?: string }).__typename);
      }
      return null;
  }
}

function ProductColumn({
  product,
  locale,
  emphasize,
}: {
  product: NonNullable<
    NonNullable<ProductTableFieldsFragment['productsCollection']>['items']
  >[number];
  locale: Locale;
  emphasize?: boolean;
}) {
  if (!product) return null;
  const fmt = new Intl.NumberFormat(locale.replace('_', '-'), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div
      data-section-palette="default"
      className={clsx(
        'flex flex-col rounded-2xl border p-8 shadow-sm',
        'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--section-fg)]',
        emphasize ? 'ring-2 ring-[var(--site-text)]' : '',
      )}
    >
      {product.featuredImage?.url && (
        <ContentfulInspector entryId={product.sys.id} fieldId="featuredImage">
          {attrs => (
            <div {...attrs} className="mb-8 w-full">
              <Image
                src={cfSrc(product.featuredImage!.url!, 800)}
                alt={product.name ?? ''}
                width={600}
                height={400}
                className="h-auto w-full rounded-xl object-cover"
              />
            </div>
          )}
        </ContentfulInspector>
      )}
      {product.name && (
        <ContentfulInspector entryId={product.sys.id} fieldId="name">
          {attrs => (
            <h3 {...attrs} className={clsx('text-[2rem] font-medium', HEADLINE_CLS)}>
              {product.name}
            </h3>
          )}
        </ContentfulInspector>
      )}
      {product.price != null && (
        <ContentfulInspector entryId={product.sys.id} fieldId="price">
          {attrs => (
            <p {...attrs} className={clsx('mt-4 text-[2.4rem] font-semibold', HEADLINE_CLS)}>
              {fmt.format(product.price!)}
            </p>
          )}
        </ContentfulInspector>
      )}
      {product.description?.json && (
        <ContentfulInspector entryId={product.sys.id} fieldId="description">
          {attrs => (
            <div {...attrs} className={clsx('mt-8 flex-1 text-[1.8rem] leading-relaxed', TEXT_CLS)}>
              <RichTextField json={product.description!.json} locale={locale} />
            </div>
          )}
        </ContentfulInspector>
      )}
    </div>
  );
}
