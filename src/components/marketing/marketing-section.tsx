import { HeroBannerPersonalized } from '@/components/marketing/hero-banner-personalized';
import {
  MarketingSectionPreviewEntry,
  MarketingSectionPreviewHero,
} from '@/components/marketing/marketing-section-preview';
import { MarketingEntryView } from '@/components/marketing/marketing-blocks';
import type { CtfHeroBannerQuery } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import type { Locale } from '@/lib/i18n/config';
import { loadHeroExperiencesFromEnv } from '@/lib/personalization/hero-experiences-from-env';
import { hydrateExperienceVariants } from '@/lib/personalization/hydrate-experience-variants';
import { loadPreviewPluginDataFromContentfulCached } from '@/lib/personalization/preview-plugin-catalog-cache';
import {
  loadPreviewExperiencesFromEnv,
  mergePreviewExperiencesForPlugin,
} from '@/lib/personalization/preview-plugin-data';
import type { ResolvedMarketingEntry } from '@/lib/contentful/resolve-entry';

export async function MarketingSection({
  entry,
  locale,
  preview,
}: {
  entry: ResolvedMarketingEntry;
  locale: Locale;
  preview: boolean;
}) {
  if (entry.__typename === 'ComponentHeroBanner') {
    const hero = entry as NonNullable<CtfHeroBannerQuery['componentHeroBanner']>;
    const envHero = loadHeroExperiencesFromEnv(hero.sys.id);
    const catalogExperiences = preview
      ? (await loadPreviewPluginDataFromContentfulCached(locale)).experiences
      : [];
    const rawExperiences = preview
      ? mergePreviewExperiencesForPlugin(
          mergePreviewExperiencesForPlugin(catalogExperiences, loadPreviewExperiencesFromEnv()),
          envHero,
        )
      : envHero;
    const experiences = preview
      ? await hydrateExperienceVariants({
          experiences: rawExperiences,
          baselineEntry: hero,
          locale,
          preview,
        })
      : rawExperiences;
    const ninetailedConfigured = Boolean(process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID?.trim());
    if (!preview) {
      return (
        <HeroBannerPersonalized
          entry={hero}
          locale={locale}
          experiences={experiences}
          ninetailedConfigured={ninetailedConfigured}
        />
      );
    }
    return (
      <MarketingSectionPreviewHero
        entry={entry}
        locale={locale}
        experiences={experiences}
        ninetailedConfigured={ninetailedConfigured}
      />
    );
  }

  if (!preview) {
    return <MarketingEntryView entry={entry} locale={locale} />;
  }
  return <MarketingSectionPreviewEntry entry={entry} locale={locale} />;
}
