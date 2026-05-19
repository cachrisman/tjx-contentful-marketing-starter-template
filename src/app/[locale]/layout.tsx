import type { Metadata } from 'next';
import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import { notFound } from 'next/navigation';

import { cookies, headers } from 'next/headers';

import { ContentfulPreviewProvider } from '@/components/contentful/contentful-preview-provider';
import { TimelinePreviewBanner } from '@/components/contentful/timeline-preview-banner';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { NinetailedAppProviders } from '@/components/personalization/ninetailed-app-providers';
import { SiteThemeStyle } from '@/components/theme/site-theme-style';
import {
  footerFromGlobalSettings,
  loadGlobalSettings,
  navigationFromGlobalSettings,
  pickGlobalSettingsEntry,
} from '@/lib/contentful/global-settings';
import { isContentfulPreview } from '@/lib/contentful/preview-request';
import { getTimelineContext } from '@/lib/contentful/timeline';
import { timelineDisplayParams } from '@/lib/contentful/timeline-shared';
import { loadFooter, loadNavigation } from '@/lib/contentful/resolve-entry';
import { siteConfig } from '@/lib/site-config';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import {
  NT_PROXY_PATH_COOKIE,
  NT_PROXY_PATH_HEADER,
  NT_SELECTION_COOKIE,
  NT_SELECTION_HEADER,
  readSelectionSecret,
} from '@/lib/personalization/config';
import { verifySelection } from '@/lib/personalization/selection-header';
import { loadPreviewPluginDataFromContentfulCached } from '@/lib/personalization/preview-plugin-catalog-cache';
import { alignPreviewPluginExperienceAudiences } from '@/lib/personalization/preview-plugin-from-contentful';
import { loadHeroExperiencesFromEnvForPreviewCatalog } from '@/lib/personalization/hero-experiences-from-env';
import {
  loadPreviewAudiencesFromEnv,
  loadPreviewExperiencesFromEnv,
  mergePreviewAudiencesForPlugin,
  mergePreviewExperiencesForPlugin,
  type NinetailedPreviewAudience,
} from '@/lib/personalization/preview-plugin-data';
import { siteThemeFromGlobalSettings } from '@/lib/theme/site-theme';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    return {};
  }
  const locale = loc as Locale;
  const preview = await isContentfulPreview();
  const globalCollection = await loadGlobalSettings(locale, preview);
  const gs = pickGlobalSettingsEntry(globalCollection);
  const title = gs?.siteTitle?.trim() || siteConfig.meta.title;
  const description = gs?.siteDescription?.trim() || siteConfig.meta.description;
  const brand = gs?.siteName?.trim() || siteConfig.meta.title.split('|').pop()?.trim() || 'Site';
  return {
    title: { default: title, template: `%s | ${brand}` },
    description,
    openGraph: {
      title,
      description,
      images: [{ url: siteConfig.meta.image }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: loc } = await params;
  if (!isLocale(loc)) {
    notFound();
  }
  const locale = loc as Locale;
  const preview = await isContentfulPreview();
  const timelineContext = preview
    ? await getTimelineContext({ trustProxyHeaders: true })
    : null;
  const timelineParams = timelineDisplayParams(timelineContext);
  const contentfulEnvironment = process.env.CONTENTFUL_ENVIRONMENT?.trim() || undefined;

  const globalCollection = await loadGlobalSettings(locale, preview);
  const gs = pickGlobalSettingsEntry(globalCollection);
  const themeColors = siteThemeFromGlobalSettings(gs);

  const [navigationFallback, footerFallback, previewPluginFromCf] = await Promise.all([
    loadNavigation(locale, preview),
    loadFooter(locale, preview),
    preview
      ? loadPreviewPluginDataFromContentfulCached(locale)
      : Promise.resolve({
          experiences: [] as ExperienceConfiguration[],
          audiences: [] as NinetailedPreviewAudience[],
        }),
  ]);

  const navigation = navigationFromGlobalSettings(globalCollection) ?? navigationFallback;
  const footer = footerFromGlobalSettings(globalCollection) ?? footerFallback;

  // Phase 0 / hybrid: selection for ESR first paint — prefer proxy-forwarded
  // headers on the document request; fall back to HttpOnly cookies on follow-up
  // RSC renders (e.g. client navigations) when headers are absent. Validate POC
  // with `NODE_ENV=production npm run build && npm run start` + view-source for
  // the expected hero variant before hydration.
  const h = await headers();
  const c = await cookies();
  const selectionHeader = h.get(NT_SELECTION_HEADER) ?? c.get(NT_SELECTION_COOKIE)?.value;
  const proxyPathHeader = h.get(NT_PROXY_PATH_HEADER) ?? c.get(NT_PROXY_PATH_COOKIE)?.value;
  const selection = verifySelection(
    selectionHeader,
    readSelectionSecret(),
    proxyPathHeader,
  );
  // In Contentful draft/preview, the Ninetailed Preview plugin drives variant
  // selection on the client. A non-empty ESR map would pin `ESRLoadingComponent`
  // to the signed server index and ignore preview-widget changes — use an
  // empty map so the hero follows the plugin + SDK after hydration.
  const experienceVariantsMap = preview ? {} : (selection?.experienceVariants ?? {});

  const previewExperiences = preview
    ? mergePreviewExperiencesForPlugin(
        mergePreviewExperiencesForPlugin(
          previewPluginFromCf.experiences,
          loadPreviewExperiencesFromEnv(),
        ),
        loadHeroExperiencesFromEnvForPreviewCatalog(),
      )
    : [];
  const previewAudiences = preview
    ? mergePreviewAudiencesForPlugin(
        previewPluginFromCf.audiences,
        previewExperiences,
        loadPreviewAudiencesFromEnv(),
      )
    : [];
  if (preview) {
    alignPreviewPluginExperienceAudiences(previewExperiences, previewAudiences);
  }

  const pocPreviewToggle = process.env.CONTENTFUL_POC_PREVIEW_TOGGLE === '1';

  return (
    <ContentfulPreviewProvider
      locale={locale}
      preview={preview}
      environment={contentfulEnvironment}
      timelineContext={timelineContext}
    >
      <NinetailedAppProviders
        locale={locale}
        preview={preview}
        experienceVariantsMap={experienceVariantsMap}
        previewExperiences={previewExperiences}
        previewAudiences={previewAudiences}
      >
        <SiteThemeStyle colors={themeColors} />
        <SiteHeader
          locale={locale}
          navigation={navigation}
          logo={gs?.logo}
          logoTarget={gs?.logoTarget}
          preview={preview}
          pocPreviewToggle={pocPreviewToggle}
        />
        <main className="flex w-full flex-1 flex-col items-stretch">
          <TimelinePreviewBanner locale={locale} />
          {children}
        </main>
        <SiteFooter locale={locale} footer={footer} timelineDisplayParams={timelineParams} />
      </NinetailedAppProviders>
    </ContentfulPreviewProvider>
  );
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
