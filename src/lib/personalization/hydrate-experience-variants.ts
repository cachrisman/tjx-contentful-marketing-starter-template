import 'server-only';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';

import {
  resolveMarketingEntry,
  type EntryRef,
  type ResolvedMarketingEntry,
} from '@/lib/contentful/resolve-entry';

type HydratedVariant = ResolvedMarketingEntry & { id: string };
type ExperienceComponent = ExperienceConfiguration['components'][number];

const REF_ONLY_KEYS = new Set(['id', '__typename', 'sys', 'hidden']);

function componentTargetsBaseline(component: ExperienceComponent, baselineId: string): boolean {
  const baseline = component.baseline as { id?: unknown } | undefined;
  return (
    typeof baseline?.id === 'string' &&
    baseline.id === baselineId &&
    Array.isArray(component.variants)
  );
}

function variantId(variant: unknown): string | null {
  if (!variant || typeof variant !== 'object') return null;
  const id = (variant as { id?: unknown }).id;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

function variantTypename(variant: unknown, fallbackTypename: string): string {
  if (!variant || typeof variant !== 'object') return fallbackTypename;
  const typename = (variant as { __typename?: unknown }).__typename;
  return typeof typename === 'string' && typename.trim() ? typename.trim() : fallbackTypename;
}

function hasRenderableFields(variant: unknown): boolean {
  if (!variant || typeof variant !== 'object') return false;
  return Object.keys(variant).some(key => !REF_ONLY_KEYS.has(key));
}

function isHydratedVariant(variant: unknown): variant is HydratedVariant {
  if (!variant || typeof variant !== 'object') return false;
  const rec = variant as { id?: unknown; __typename?: unknown; sys?: { id?: unknown } };
  return (
    typeof rec.id === 'string' &&
    typeof rec.__typename === 'string' &&
    typeof rec.sys?.id === 'string' &&
    hasRenderableFields(variant)
  );
}

function variantKey(ref: EntryRef): string {
  return `${ref.__typename}:${ref.sys.id}`;
}

/**
 * The space-wide preview catalog keeps variants as lightweight refs. Rendering a
 * selected replacement requires the full Contentful entry, so hydrate only the
 * variants attached to this component's baseline entry.
 */
export async function hydrateExperienceVariants({
  experiences,
  baselineEntry,
  locale,
  preview,
}: {
  experiences: ExperienceConfiguration[];
  baselineEntry: EntryRef;
  locale: string;
  preview: boolean;
}): Promise<ExperienceConfiguration[]> {
  const baselineId = baselineEntry.sys.id;
  const refsToHydrate = new Map<string, EntryRef>();

  for (const experience of experiences) {
    for (const component of experience.components) {
      if (!componentTargetsBaseline(component, baselineId)) continue;
      for (const variant of component.variants) {
        if (isHydratedVariant(variant)) continue;
        const id = variantId(variant);
        if (!id) continue;
        const ref: EntryRef = {
          __typename: variantTypename(variant, baselineEntry.__typename),
          sys: { id },
        };
        refsToHydrate.set(variantKey(ref), ref);
      }
    }
  }

  if (refsToHydrate.size === 0) {
    return experiences;
  }

  const hydrated = new Map<string, HydratedVariant>();
  await Promise.all(
    [...refsToHydrate.values()].map(async ref => {
      const entry = await resolveMarketingEntry(ref, locale, preview);
      if (entry?.sys.id) {
        hydrated.set(variantKey(ref), { ...entry, id: entry.sys.id });
      }
    }),
  );

  if (hydrated.size === 0) {
    return experiences;
  }

  return experiences.map(experience => {
    let changed = false;
    const components = experience.components.map(component => {
      if (!componentTargetsBaseline(component, baselineId)) return component;

      let componentChanged = false;
      const variants = component.variants.map(variant => {
        const id = variantId(variant);
        if (!id) return variant;
        const ref: EntryRef = {
          __typename: variantTypename(variant, baselineEntry.__typename),
          sys: { id },
        };
        const replacement = hydrated.get(variantKey(ref));
        if (!replacement) return variant;
        componentChanged = true;
        return replacement as typeof variant;
      });

      if (!componentChanged) return component;
      changed = true;
      return { ...component, variants };
    });

    return changed ? ({ ...experience, components } as ExperienceConfiguration) : experience;
  });
}
