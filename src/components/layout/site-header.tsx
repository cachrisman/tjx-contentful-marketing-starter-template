'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ContentfulInspector } from '@/components/contentful/contentful-inspector';
import { LocaleLink } from '@/components/marketing/locale-link';
import { PreviewGearMenu } from '@/components/personalization/preview-gear-menu';
import { PublicSvgImage } from '@/components/ui/public-svg-image';
import { SiteThemeToggle } from '@/components/theme/site-theme-toggle';
import type { AssetFieldsFragment } from '@/lib/contentful/graphql/ctf-asset.generated';
import type { CtfGlobalSettingsQuery } from '@/lib/contentful/graphql/ctf-global-settings.generated';
import type {
  CtfNavigationQuery,
  NavigationSectionFieldsFragment,
} from '@/lib/contentful/graphql/ctf-navigation.generated';
import {
  contentfulAssetUrl,
  contentfulImageSrc,
  isRasterImageAsset,
} from '@/lib/contentful/asset-src';
import type { Locale } from '@/lib/i18n/config';
import { resolveColumnTitleLinkRow } from '@/lib/navigation/column-title-link';
import { hrefForPageSlug, pagePath } from '@/lib/routing';

type LogoTarget = NonNullable<
  NonNullable<NonNullable<CtfGlobalSettingsQuery['globalSettingsCollection']>['items']>[number]
>['logoTarget'];

type NavColumn = NonNullable<
  NonNullable<NonNullable<NavigationSectionFieldsFragment['columnsCollection']>['items']>[number]
>;

type NavRasterAsset = NonNullable<NavigationSectionFieldsFragment['featuredImage']>;

const LEAVE_DELAY_MS = 160;

function firstRasterFromFeaturedPage(
  link: NavigationSectionFieldsFragment['featuredLink'],
): NavRasterAsset | null {
  const items = link?.topSectionCollection?.items ?? [];
  for (const item of items) {
    if (!item) continue;
    if (item.__typename !== 'ComponentHeroBanner' && item.__typename !== 'ComponentDuplex')
      continue;
    const image = item.image;
    if (image?.url && isRasterImageAsset(image.contentType, image.url)) return image;
  }
  return null;
}

/** Prefer explicit mega-menu asset, then SEO OG image, then first hero/duplex image on the featured page. */
function resolveFeaturedVisual(section: NavigationSectionFieldsFragment): {
  raster: NavRasterAsset | null;
  vectorFallback: NavRasterAsset | null;
} {
  const explicit = section.featuredImage;
  if (explicit?.url && isRasterImageAsset(explicit.contentType, explicit.url)) {
    return { raster: explicit, vectorFallback: null };
  }

  const link = section.featuredLink;
  const seoImage = link?.seo?.image;
  if (seoImage?.url && isRasterImageAsset(seoImage.contentType, seoImage.url)) {
    return { raster: seoImage, vectorFallback: null };
  }

  const fromPage = firstRasterFromFeaturedPage(link);
  if (fromPage) return { raster: fromPage, vectorFallback: null };

  if (explicit?.url && !isRasterImageAsset(explicit.contentType, explicit.url)) {
    return { raster: null, vectorFallback: explicit };
  }

  return { raster: null, vectorFallback: null };
}

function MegaMenuColumn({ locale, column }: { locale: Locale; column: NavColumn }) {
  if (!column) return null;
  const viewAll = resolveColumnTitleLinkRow(column.columnTitleLink ?? null);
  const viewAllEntryId =
    column.columnTitleLink?.__typename === 'NavigationLink'
      ? column.columnTitleLink.sys.id
      : undefined;
  const links = column.linksCollection?.items?.filter(Boolean) ?? [];

  return (
    <div className="min-w-0 max-w-[17rem]">
      <ContentfulInspector entryId={column.sys.id} fieldId="heading">
        {attrs => (
          <p
            {...attrs}
            className="mb-2.5 break-words text-[1.1rem] font-bold uppercase leading-snug tracking-[0.07em] text-[color-mix(in_srgb,var(--site-text)_78%,var(--site-bg))]"
          >
            {column.heading}
          </p>
        )}
      </ContentfulInspector>
      {viewAll ? (
        <ContentfulInspector entryId={viewAllEntryId} fieldId="linkText">
          {attrs => (
            <LocaleLink
              locale={locale}
              href={hrefForPageSlug(viewAll.slug)}
              className="mb-3 block break-words text-[1.35rem] font-semibold underline decoration-[var(--site-accent)] decoration-2 underline-offset-[5px] transition-colors hover:text-[var(--site-accent)]"
              {...attrs}
            >
              {viewAll.label}
            </LocaleLink>
          )}
        </ContentfulInspector>
      ) : null}
      <ul className="m-0 list-none space-y-1.5 p-0">
        {links.map(
          page =>
            page &&
            page.slug && (
              <li key={page.sys.id}>
                <ContentfulInspector entryId={page.sys.id} fieldId="pageName">
                  {attrs => (
                    <LocaleLink
                      locale={locale}
                      href={hrefForPageSlug(page.slug)}
                      className="inline-block break-words text-[1.4rem] font-normal text-[var(--site-text)] transition-[color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:text-[var(--site-accent)]"
                      {...attrs}
                    >
                      {page.pageName}
                    </LocaleLink>
                  )}
                </ContentfulInspector>
              </li>
            ),
        )}
      </ul>
    </div>
  );
}

function FeaturedPromo({
  locale,
  section,
}: {
  locale: Locale;
  section: NavigationSectionFieldsFragment;
}) {
  const link = section.featuredLink;
  const { raster, vectorFallback } = resolveFeaturedVisual(section);

  if (!link?.slug && !raster?.url && !vectorFallback?.url) return null;

  const href = link?.slug ? hrefForPageSlug(link.slug) : null;
  const rasterSrc = raster?.url ? contentfulImageSrc(raster.url, 560) : null;
  const vectorSrc = vectorFallback?.url ? contentfulAssetUrl(vectorFallback.url) : null;
  const displayAsset = raster ?? vectorFallback;
  const alt = displayAsset?.title?.trim() ?? link?.pageName ?? '';

  if (!rasterSrc && !vectorSrc && href && link?.pageName) {
    return (
      <ContentfulInspector entryId={link.sys.id} fieldId="pageName">
        {attrs => (
          <LocaleLink
            locale={locale}
            href={href}
            className="mt-1 block text-[1.45rem] font-semibold text-[var(--site-accent)] underline decoration-[var(--site-accent)] underline-offset-4"
            {...attrs}
          >
            {link.pageName}
          </LocaleLink>
        )}
      </ContentfulInspector>
    );
  }

  const body = (
    <>
      <p className="mb-2 text-[1.05rem] font-bold uppercase tracking-[0.08em] text-[color-mix(in_srgb,var(--site-text)_72%,var(--site-bg))]">
        Featured
      </p>
      {rasterSrc ? (
        <ContentfulInspector
          entryId={raster === section.featuredImage ? section.sys.id : undefined}
          assetId={raster === section.featuredImage ? undefined : raster?.sys.id}
          fieldId={raster === section.featuredImage ? 'featuredImage' : 'file'}
        >
          {attrs => (
            <div
              {...attrs}
              className="aspect-[4/3] w-full overflow-hidden rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.1)] ring-1 ring-[color-mix(in_srgb,var(--site-accent)_28%,transparent)]"
            >
              <Image
                src={rasterSrc}
                alt={alt}
                width={raster?.width ?? 360}
                height={raster?.height ?? 240}
                className="h-full w-full object-cover"
                sizes="(min-width: 1280px) 320px, 260px"
              />
            </div>
          )}
        </ContentfulInspector>
      ) : vectorSrc ? (
        <ContentfulInspector entryId={section.sys.id} fieldId="featuredImage">
          {attrs => (
            <div
              {...attrs}
              className="h-auto w-full rounded-lg object-contain object-left shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG / non-raster featured overrides */}
              <img
                src={vectorSrc}
                alt={alt}
                width={vectorFallback?.width ?? 320}
                height={vectorFallback?.height ?? 220}
                className="h-auto w-full rounded-lg object-contain object-left"
              />
            </div>
          )}
        </ContentfulInspector>
      ) : null}
      {link?.pageName ? (
        <ContentfulInspector entryId={link.sys.id} fieldId="pageName">
          {attrs => (
            <p
              {...attrs}
              className="mt-3 text-[1.45rem] font-semibold leading-snug text-[var(--site-text)]"
            >
              {link.pageName}
            </p>
          )}
        </ContentfulInspector>
      ) : null}
    </>
  );

  if (href) {
    return (
      <LocaleLink
        locale={locale}
        href={href}
        className="block w-full transition-opacity hover:opacity-95"
      >
        {body}
      </LocaleLink>
    );
  }

  return <div className="w-full">{body}</div>;
}

function SectionTabLabel({
  locale,
  section,
  isActive,
}: {
  locale: Locale;
  section: NavigationSectionFieldsFragment;
  isActive: boolean;
}) {
  const slug = section.sectionTitleLink?.slug;
  const label = section.label ?? '';

  const className = clsx(
    'inline-block transition-[color,transform] duration-200 ease-out',
    isActive
      ? 'font-semibold text-[var(--site-accent)]'
      : 'font-normal text-[var(--site-text)] hover:text-[color-mix(in_srgb,var(--site-accent)_72%,var(--site-text))] hover:-translate-y-0.5',
  );

  if (slug) {
    return (
      <ContentfulInspector entryId={section.sys.id} fieldId="label">
        {attrs => (
          <LocaleLink locale={locale} href={hrefForPageSlug(slug)} className={className} {...attrs}>
            {label}
          </LocaleLink>
        )}
      </ContentfulInspector>
    );
  }

  return (
    <ContentfulInspector entryId={section.sys.id} fieldId="label">
      {attrs => (
        <span {...attrs} className={className}>
          {label}
        </span>
      )}
    </ContentfulInspector>
  );
}

export function SiteHeader({
  locale,
  navigation,
  logo,
  logoTarget,
  preview = false,
  pocPreviewToggle = false,
}: {
  locale: Locale;
  navigation: CtfNavigationQuery['navigationMenuCollection'] | null;
  logo?: AssetFieldsFragment | null;
  logoTarget?: LogoTarget | null;
  /** Contentful draft / preview — drives preview tools and draft data in the gear menu. */
  preview?: boolean;
  /** When true, `/api/draft/enable` accepts requests without `secret` (POC / demos only). */
  pocPreviewToggle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [megaTop, setMegaTop] = useState(0);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  useEffect(
    () => () => {
      if (leaveTimerRef.current != null) window.clearTimeout(leaveTimerRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncTop = () => {
      setMegaTop(el.getBoundingClientRect().bottom);
    };

    syncTop();
    const ro = new ResizeObserver(syncTop);
    ro.observe(el);
    window.addEventListener('scroll', syncTop, true);
    window.addEventListener('resize', syncTop);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', syncTop, true);
      window.removeEventListener('resize', syncTop);
    };
  }, []);

  const enterSection = (id: string) => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredSectionId(id);
  };

  const scheduleLeave = () => {
    if (leaveTimerRef.current != null) window.clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = window.setTimeout(() => {
      setHoveredSectionId(null);
      leaveTimerRef.current = null;
    }, LEAVE_DELAY_MS);
  };

  const navRoot = navigation?.items?.[0];
  const sections = navRoot?.sectionsCollection?.items?.filter(Boolean) ?? [];
  const activeSection = sections.find(s => s && s.sys.id === hoveredSectionId) ?? null;

  const logoHref = logoTarget?.slug ? hrefForPageSlug(logoTarget.slug) : '/';
  const logoSrc = contentfulImageSrc(logo?.url ?? null, 226);
  const logoAlt = logo?.title?.trim() || '';

  const megaMaxHeight =
    megaTop > 0
      ? `min(72vh, calc(100vh - ${Math.ceil(megaTop)}px - 12px))`
      : 'min(72vh, calc(100vh - 10rem))';

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-[var(--site-bg)] text-[var(--site-text)] shadow-[0_2px_6px_rgba(0,0,0,0.13)]"
      >
        <div className="mx-auto flex h-20 max-w-[126rem] items-center justify-between gap-4 px-6 md:h-[9rem] md:px-12">
          <LocaleLink
            locale={locale}
            href={logoHref}
            title="Homepage"
            className="block w-[113px] shrink-0"
          >
            {logoSrc ? (
              <ContentfulInspector assetId={logo?.sys.id} fieldId="file">
                {attrs => (
                  <span {...attrs} className="block w-full">
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      width={logo?.width ?? 113}
                      height={logo?.height ?? 48}
                      className="h-auto max-h-[4.8rem] w-auto max-w-[113px] object-contain object-left"
                      sizes="113px"
                      priority
                    />
                  </span>
                )}
              </ContentfulInspector>
            ) : (
              <PublicSvgImage
                src="/colorful-coin-logo.svg"
                alt=""
                width={113}
                height={48}
                className="h-auto w-full"
                priority
              />
            )}
          </LocaleLink>

          <nav className="hidden md:flex md:items-start" aria-label="Primary">
            <ul className="m-0 flex list-none items-stretch gap-x-0 p-0 md:gap-x-1 lg:gap-x-2">
              {sections.map(section =>
                section ? (
                  <li
                    key={section.sys.id}
                    className="flex min-w-0 flex-col px-3 text-[1.7rem] md:px-4 lg:px-5"
                    onMouseEnter={() => enterSection(section.sys.id)}
                    onMouseLeave={scheduleLeave}
                  >
                    <div
                      className={clsx(
                        'flex h-[9rem] w-full min-w-0 items-center border-b-[3px] transition-[border-color] duration-200 ease-out',
                        hoveredSectionId === section.sys.id
                          ? 'border-[var(--site-accent)]'
                          : 'border-transparent',
                      )}
                    >
                      <SectionTabLabel
                        locale={locale}
                        section={section}
                        isActive={hoveredSectionId === section.sys.id}
                      />
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
            <div className="ml-6 hidden shrink-0 items-center gap-2 self-center lg:flex">
              <SiteThemeToggle />
              <PreviewGearMenu serverPreview={preview} pocPreviewToggle={pocPreviewToggle} />
            </div>
          </nav>

          <div className="flex items-center gap-4 md:hidden">
            <SiteThemeToggle />
            <PreviewGearMenu serverPreview={preview} pocPreviewToggle={pocPreviewToggle} />
            <button
              type="button"
              className="inline-flex text-[var(--site-text)]"
              aria-controls="mobile-menu"
              aria-expanded={open}
              aria-haspopup="dialog"
              title="Open menu"
              onClick={() => setOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex lg:hidden">
            <SiteThemeToggle />
            <PreviewGearMenu serverPreview={preview} pocPreviewToggle={pocPreviewToggle} />
          </div>
        </div>
      </header>

      {activeSection ? (
        <div
          ref={megaPanelRef}
          id="desktop-mega-menu"
          role="region"
          aria-label={`${activeSection.label ?? 'Menu'} submenu`}
          className="fixed inset-x-0 z-[100] hidden overflow-y-auto overflow-x-hidden border-t-2 border-[var(--site-accent)] bg-[var(--site-bg)] shadow-[0_16px_40px_rgba(0,0,0,0.14)] md:block"
          style={{ top: megaTop > 0 ? megaTop - 1 : undefined, maxHeight: megaMaxHeight }}
          onMouseEnter={() => enterSection(activeSection.sys.id)}
          onMouseLeave={scheduleLeave}
        >
          <div className="mx-auto flex max-w-[126rem] flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row md:items-start md:gap-10 md:px-12 lg:gap-14 lg:py-10">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-7 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {activeSection.columnsCollection?.items?.map(
                col => col && <MegaMenuColumn key={col.sys.id} locale={locale} column={col} />,
              )}
            </div>
            <aside className="w-full shrink-0 border-t border-[color-mix(in_srgb,var(--site-text)_14%,transparent)] pt-6 md:w-[17rem] md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:w-[19rem] xl:w-[21rem]">
              <FeaturedPromo locale={locale} section={activeSection} />
            </aside>
          </div>
        </div>
      ) : null}

      {open && (
        <dialog
          open
          className="fixed inset-0 z-[110] m-0 flex max-h-none max-w-none flex-col bg-[var(--site-bg)] p-0 text-[var(--site-text)]"
        >
          <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--site-text)_18%,transparent)] px-6 py-4">
            <LocaleLink locale={locale} href={logoHref} onClick={() => setOpen(false)}>
              {logoSrc ? (
                <ContentfulInspector assetId={logo?.sys.id} fieldId="file">
                  {attrs => (
                    <span {...attrs} className="block w-[113px]">
                      <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={logo?.width ?? 113}
                        height={logo?.height ?? 48}
                        className="h-auto max-h-[4.8rem] w-[113px] object-contain object-left"
                        sizes="113px"
                      />
                    </span>
                  )}
                </ContentfulInspector>
              ) : (
                <PublicSvgImage
                  src="/colorful-coin-logo.svg"
                  alt=""
                  width={113}
                  height={48}
                  className="h-auto max-w-[113px]"
                />
              )}
            </LocaleLink>
            <button
              type="button"
              className="text-[2rem]"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-6" id="mobile-menu" aria-label="Mobile">
            <ul className="m-0 list-none space-y-2 p-0 text-[1.9rem]">
              {sections.map(section =>
                section ? (
                  <li
                    key={section.sys.id}
                    className="border-b border-[color-mix(in_srgb,var(--site-text)_12%,transparent)] pb-4 pt-2"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {section.sectionTitleLink?.slug ? (
                        <ContentfulInspector entryId={section.sys.id} fieldId="label">
                          {attrs => (
                            <LocaleLink
                              locale={locale}
                              href={hrefForPageSlug(section.sectionTitleLink!.slug)}
                              className="font-semibold text-[var(--site-accent)]"
                              onClick={() => setOpen(false)}
                              {...attrs}
                            >
                              {section.label}
                            </LocaleLink>
                          )}
                        </ContentfulInspector>
                      ) : (
                        <ContentfulInspector entryId={section.sys.id} fieldId="label">
                          {attrs => (
                            <span {...attrs} className="font-semibold text-[var(--site-accent)]">
                              {section.label}
                            </span>
                          )}
                        </ContentfulInspector>
                      )}
                    </div>
                    <FeaturedPromo locale={locale} section={section} />
                    <div className="mt-4 space-y-6 pl-1">
                      {section.columnsCollection?.items?.map(
                        col =>
                          col && (
                            <div key={col.sys.id}>
                              <MegaMenuColumn locale={locale} column={col} />
                            </div>
                          ),
                      )}
                    </div>
                  </li>
                ) : null,
              )}
              <li className="pt-4">
                <LocaleLink locale={locale} href={pagePath(locale)} onClick={() => setOpen(false)}>
                  Home
                </LocaleLink>
              </li>
            </ul>
          </nav>
        </dialog>
      )}
    </>
  );
}
