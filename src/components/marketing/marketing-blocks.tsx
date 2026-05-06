'use client';

import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import clsx from 'clsx';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

import { useContentfulInspectorEnabled } from '@/components/contentful/contentful-preview-provider';
import { LocalePageLink } from '@/components/marketing/locale-link';
import { RichTextField, type RichTextFieldProps } from '@/components/marketing/richtext';
import type { Locale } from '@/lib/i18n/config';
import type { ProductTableFieldsFragment } from '@/lib/contentful/graphql/ctf-product-table.generated';
import type { ResolvedMarketingEntry, RichTextEmbeddings } from '@/lib/contentful/resolve-entry';
import { getColorConfigFromPalette } from '@/lib/theme/palette';

type Props = {
  entry: ResolvedMarketingEntry;
  locale: Locale;
};

function InspectSpan({
  entryId,
  fieldId,
  children,
  className,
  style,
}: {
  entryId: string;
  fieldId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const inspectorEnabled = useContentfulInspectorEnabled();
  if (!inspectorEnabled) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <InspectSpanLive entryId={entryId} fieldId={fieldId} className={className} style={style}>
      {children}
    </InspectSpanLive>
  );
}

function InspectSpanLive({
  entryId,
  fieldId,
  children,
  className,
  style,
}: {
  entryId: string;
  fieldId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const inspector = useContentfulInspectorMode({ entryId });
  const attrs = inspector({ fieldId }) ?? {};
  return (
    <span className={className} style={style} {...attrs}>
      {children}
    </span>
  );
}

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
  children,
  className,
}: {
  paletteKey?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const cfg = getColorConfigFromPalette(paletteKey);
  return (
    <section className={clsx('w-full', className)} style={{ backgroundColor: cfg.backgroundColor }}>
      {children}
    </section>
  );
}

function cfSrc(url: string, w: number) {
  return `${url}?w=${w}&fm=webp&q=80`;
}

export function MarketingEntryView({ entry, locale }: Props) {
  switch (entry.__typename) {
    case 'ComponentHeroBanner': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
      const imageStyle = entry.imageStyle ? 'partial' : 'full';
      const heroFull = entry.heroSize !== false;
      const bgUrl = entry.image?.url
        ? cfSrc(entry.image.url, imageStyle === 'partial' ? 1534 : 2400)
        : undefined;

      return (
        <section
          className={clsx(
            'relative flex w-full overflow-hidden bg-cover bg-center',
            heroFull ? 'min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-9rem)]' : 'py-24',
          )}
          style={{
            backgroundImage: imageStyle === 'full' && bgUrl ? `url(${bgUrl})` : undefined,
            backgroundColor: cfg.backgroundColor,
          }}
        >
          {imageStyle === 'partial' && bgUrl && (
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 max-w-[192rem] md:block">
              <div
                className="absolute inset-y-0 right-0 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${bgUrl})` }}
              />
            </div>
          )}
          <SectionShell className="relative z-[1] flex max-w-[125.8rem] flex-col py-24 md:py-32">
            {entry.headline && (
              <InspectSpan entryId={entry.sys.id} fieldId="headline">
                <h1
                  className="max-w-[44rem] text-[3rem] font-extrabold leading-[1.08] xl:text-[3.8rem]"
                  style={{ color: cfg.headlineColor }}
                >
                  {entry.headline}
                </h1>
              </InspectSpan>
            )}
            {entry.bodyText?.json && (
              <div className="mt-6 max-w-[46.9rem]" style={{ color: cfg.textColor }}>
                <InspectSpan entryId={entry.sys.id} fieldId="bodyText">
                  <RichTextField json={entry.bodyText.json} locale={locale} className="[&_p]:text-[2.5rem]" />
                </InspectSpan>
              </div>
            )}
            {entry.targetPage && entry.ctaText && (
              <div className="mt-6">
                <LocalePageLink
                  locale={locale}
                  slug={entry.targetPage.slug}
                  className={clsx(
                    'inline-block rounded-[9px] px-6 py-3 text-[2.1rem] font-medium transition hover:-translate-y-1 hover:shadow-md',
                    cfg.buttonVariant === 'dark'
                      ? 'bg-black text-white shadow-none'
                      : 'bg-white text-black shadow-none',
                  )}
                >
                  {entry.ctaText}
                </LocalePageLink>
              </div>
            )}
          </SectionShell>
        </section>
      );
    }

    case 'ComponentDuplex': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
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
                  <h2
                    className="max-w-[60.4rem] text-[3rem] font-bold leading-snug xl:text-[3.5rem]"
                    style={{ color: cfg.headlineColor }}
                  >
                    {entry.headline}
                  </h2>
                )}
                {entry.bodyText?.json && (
                  <div className="mt-7 text-[1.8rem] leading-relaxed text-[#414D63] md:text-[2.5rem] md:[&_p]:text-[1.8rem] xl:[&_p]:text-[1.8rem]">
                    <RichTextField json={entry.bodyText.json} locale={locale} />
                  </div>
                )}
                {entry.targetPage && entry.ctaText && (
                  <div className="mt-8">
                    <LocalePageLink
                      locale={locale}
                      slug={entry.targetPage.slug}
                      className="inline-block rounded-[9px] bg-black px-6 py-3 text-[2.1rem] font-medium text-white transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {entry.ctaText}
                    </LocalePageLink>
                  </div>
                )}
              </div>
              {imgUrl && (
                <div className="flex items-center justify-center rounded-2xl shadow-[0_13px_27px_-5px_rgba(25,37,50,0.15)]">
                  <Image
                    src={imgUrl}
                    alt={entry.image?.title ?? ''}
                    width={900}
                    height={700}
                    className="h-auto w-full rounded-2xl object-cover"
                  />
                </div>
              )}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentCta': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell className="text-center">
            {entry.headline && (
              <h2 className="text-[3rem] font-semibold" style={{ color: cfg.headlineColor }}>
                {entry.headline}
              </h2>
            )}
            {entry.subline?.json && (
              <div className="mx-auto mt-6 max-w-3xl text-[1.8rem]" style={{ color: cfg.textColor }}>
                <RichTextField json={entry.subline.json} locale={locale} />
              </div>
            )}
            {entry.targetPage && entry.ctaText && (
              <div className="mt-8 flex justify-center">
                <LocalePageLink
                  locale={locale}
                  slug={entry.targetPage.slug}
                  className={clsx(
                    'rounded-[9px] px-8 py-3 text-[2.1rem] font-medium transition hover:-translate-y-1 hover:shadow-md',
                    cfg.buttonVariant === 'dark' ? 'bg-black text-white' : 'bg-white text-black border border-black',
                  )}
                >
                  {entry.ctaText}
                </LocalePageLink>
              </div>
            )}
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentInfoBlock': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
      const blocks = [
        { img: entry.block1Image, json: entry.block1Body },
        { img: entry.block2Image, json: entry.block2Body },
        { img: entry.block3Image, json: entry.block3Body },
      ];

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell>
            {(entry.headline || entry.subline) && (
              <div className="mb-12 text-center">
                {entry.headline && (
                  <h2 className="text-[3rem] font-semibold" style={{ color: cfg.headlineColor }}>
                    {entry.headline}
                  </h2>
                )}
                {entry.subline && (
                  <p className="mt-4 text-[2rem] text-[#414D63]" style={{ color: cfg.textColor }}>
                    {entry.subline}
                  </p>
                )}
              </div>
            )}
            <div className="grid gap-12 md:grid-cols-3">
              {blocks.map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  {b.img?.url && (
                    <Image
                      src={cfSrc(b.img.url, 600)}
                      alt={b.img.title ?? ''}
                      width={320}
                      height={240}
                      className="mb-6 h-auto w-full max-w-xs rounded-lg object-cover"
                    />
                  )}
                  {b.json?.json && (
                    <RichTextField json={b.json.json} locale={locale} richTextEmbeddings={undefined} />
                  )}
                </div>
              ))}
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentQuote': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
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
                <div className="md:w-1/3">
                  <Image
                    src={cfSrc(entry.image.url, 900)}
                    alt={entry.image.title ?? ''}
                    width={400}
                    height={400}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <blockquote
                className={clsx(
                  'flex-1 text-[2.4rem] italic leading-snug md:text-[3rem]',
                  entry.quoteAlignment === true ? 'text-center' : '',
                )}
                style={{ color: cfg.headlineColor }}
              >
                {entry.quote?.json && (
                  <RichTextField
                    json={entry.quote.json}
                    links={entry.quote.links as RichTextFieldProps['links']}
                    richTextEmbeddings={embed}
                    locale={locale}
                  />
                )}
              </blockquote>
            </div>
          </SectionShell>
        </PaletteSection>
      );
    }

    case 'ComponentTextBlock': {
      const cfg = getColorConfigFromPalette(entry.colorPalette);
      const embed = (entry as { richTextEmbeddings?: RichTextEmbeddings }).richTextEmbeddings;

      return (
        <PaletteSection paletteKey={entry.colorPalette} className="py-16 md:py-24">
          <SectionShell>
            {entry.headline && (
              <h2 className="mb-6 text-center text-[3rem] font-semibold" style={{ color: cfg.headlineColor }}>
                {entry.headline}
              </h2>
            )}
            {entry.subline && (
              <p className="mb-10 text-center text-[2rem] text-[#414D63]">{entry.subline}</p>
            )}
            {entry.body?.json && (
              <RichTextField
                json={entry.body.json}
                links={entry.body.links as RichTextFieldProps['links']}
                richTextEmbeddings={embed}
                locale={locale}
              />
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
            className={clsx(
              'flex flex-col gap-8 rounded-2xl p-8 md:flex-row md:items-start',
              card ? 'bg-white shadow-[0_8px_16px_-8px_rgba(25,37,50,0.2)]' : '',
            )}
          >
            {entry.avatar?.url && (
              <Image
                src={cfSrc(entry.avatar.url, 400)}
                alt={entry.name ?? ''}
                width={200}
                height={200}
                className="h-48 w-48 rounded-full object-cover"
              />
            )}
            <div>
              {entry.name && <h3 className="text-[2.8rem] font-bold">{entry.name}</h3>}
              {(entry.location || entry.website) && (
                <p className="mt-2 text-[1.8rem] text-[#414D63]">
                  {[entry.location, entry.website].filter(Boolean).join(' · ')}
                </p>
              )}
              {entry.bio?.json && (
                <div className="mt-6">
                  <RichTextField json={entry.bio.json} locale={locale} />
                </div>
              )}
            </div>
          </div>
        </SectionShell>
      );
    }

    case 'TopicProduct': {
      const cfg = getColorConfigFromPalette('1. White (#FFFFFF)');
      const fmt = new Intl.NumberFormat(locale.replace('_', '-'), {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });

      return (
        <section className="w-full py-16" style={{ backgroundColor: cfg.backgroundColor }}>
          <SectionShell className="grid gap-12 md:grid-cols-2">
            <div>
              {entry.featuredImage?.url && (
                <Image
                  src={cfSrc(entry.featuredImage.url, 1200)}
                  alt={entry.name ?? ''}
                  width={800}
                  height={600}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full rounded-2xl object-cover shadow-lg"
                  style={{ height: 'auto' }}
                />
              )}
            </div>
            <div>
              {entry.name && <h1 className="text-[3.6rem] font-bold text-[#1B273A]">{entry.name}</h1>}
              {entry.price != null && (
                <p className="mt-4 text-[2.8rem] font-semibold">{fmt.format(entry.price)}</p>
              )}
              {entry.description?.json && (
                <div className="mt-8 text-[1.8rem] text-[#414D63]">
                  <RichTextField
                    json={entry.description.json}
                    locale={locale}
                  />
                </div>
              )}
              {entry.featuresCollection?.items?.length ? (
                <ul className="mt-10 space-y-10">
                  {entry.featuresCollection.items.filter(Boolean).map((f, idx) => (
                    <li key={f!.sys.id ?? idx} className="border-t border-[#eaeaea] pt-8 first:border-0 first:pt-0">
                      <h4 className="text-[2rem] font-semibold">{f!.name}</h4>
                      {f!.shortDescription?.json && (
                        <div className="mt-3 text-[1.8rem] text-[#414D63]">
                          <RichTextField json={f!.shortDescription.json} locale={locale} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </SectionShell>
        </section>
      );
    }

    case 'ComponentProductTable': {
      const items = entry.productsCollection?.items?.filter(Boolean) ?? [];

      return (
        <section className="w-full bg-[#FCFCFC] py-16 md:py-24">
          <SectionShell>
            {(entry.headline || entry.subline) && (
              <div className="mb-12 text-center">
                {entry.headline && (
                  <h2 className="text-[3rem] font-semibold text-[#1B273A]">{entry.headline}</h2>
                )}
                {entry.subline && <p className="mt-4 text-[2rem] text-[#414D63]">{entry.subline}</p>}
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
        </section>
      );
    }

    case 'TopicBusinessInfo': {
      const embed = (entry as { richTextEmbeddings?: RichTextEmbeddings }).richTextEmbeddings;
      const heroUrl = entry.featuredImage?.url ? cfSrc(entry.featuredImage.url, 1920) : undefined;

      return (
        <section className="w-full pb-24 pt-0">
          {(entry.name || entry.shortDescription) && (
            <div className="relative mb-16 min-h-[59rem] bg-black">
              {heroUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${heroUrl})` }}
                />
              )}
              <SectionShell narrow className="relative z-[1] flex min-h-[36rem] flex-col items-center justify-center px-6 py-16 text-center text-white md:py-24">
                {entry.name && <h1 className="max-w-xl text-[4.5rem] font-bold">{entry.name}</h1>}
                {entry.shortDescription && (
                  <p className="mt-4 max-w-2xl text-[2.5rem]">{entry.shortDescription}</p>
                )}
              </SectionShell>
            </div>
          )}
          <SectionShell narrow>
            {entry.body?.json && (
              <RichTextField
                json={entry.body.json}
                links={entry.body.links as RichTextFieldProps['links']}
                richTextEmbeddings={embed}
                locale={locale}
              />
            )}
          </SectionShell>
        </section>
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
      className={clsx(
        'flex flex-col rounded-2xl border border-[#eaeaea] bg-white p-8 shadow-sm',
        emphasize ? 'ring-2 ring-black' : '',
      )}
    >
      {product.featuredImage?.url && (
        <Image
          src={cfSrc(product.featuredImage.url, 800)}
          alt={product.name ?? ''}
          width={600}
          height={400}
          className="mb-8 h-auto w-full rounded-xl object-cover"
        />
      )}
      <h3 className="text-[2rem] font-medium text-[#1B273A]">{product.name}</h3>
      {product.price != null && (
        <p className="mt-4 text-[2.4rem] font-semibold">{fmt.format(product.price)}</p>
      )}
      {product.description?.json && (
        <div className="mt-8 flex-1 text-[1.8rem] leading-relaxed text-[#414D63]">
          <RichTextField json={product.description.json} locale={locale} />
        </div>
      )}
    </div>
  );
}
