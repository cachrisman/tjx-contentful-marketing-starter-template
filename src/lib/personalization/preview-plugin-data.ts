import 'server-only';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import { ExperienceMapper } from '@ninetailed/experience.js-utils';

/**
 * Shape expected by `NinetailedPreviewPlugin` `audiences` (see Contentful
 * Personalization preview-plugin docs — `id` / `name` / optional `description`).
 */
export type NinetailedPreviewAudience = {
  id: string;
  name: string;
  description?: string;
  /** Contentful `NtAudience` entry `sys.id` — used by preview plugin CMS callbacks. */
  contentfulEntryId?: string;
};

/**
 * Unique audiences referenced on mapped experiences (`audience` on each
 * {@link ExperienceConfiguration}). `name` falls back to `id` when missing
 * (required by the preview plugin list UI).
 */
export function collectPreviewAudiencesFromExperiences(
  experiences: ExperienceConfiguration[],
): NinetailedPreviewAudience[] {
  const byId = new Map<string, NinetailedPreviewAudience>();
  for (const exp of experiences) {
    const aud = exp.audience;
    if (!aud?.id?.trim()) continue;
    const id = aud.id.trim();
    const name = aud.name?.trim() || id;
    const description = aud.description?.trim();
    byId.set(id, description ? { id, name, description } : { id, name });
  }
  return [...byId.values()];
}

/**
 * Merges {@link collectPreviewAudiencesFromExperiences} with optional env extras
 * (`NINETAILED_PREVIEW_AUDIENCES_JSON`), de-duplicated by `id` (experiences win).
 */
export function buildPreviewAudiences(experiences: ExperienceConfiguration[]): NinetailedPreviewAudience[] {
  const fromExperiences = collectPreviewAudiencesFromExperiences(experiences);
  const fromEnv = loadPreviewAudiencesFromEnv();
  if (fromEnv.length === 0) return fromExperiences;
  const byId = new Map<string, NinetailedPreviewAudience>();
  for (const a of fromExperiences) byId.set(a.id, a);
  for (const a of fromEnv) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }
  return [...byId.values()];
}

/** NtExperience entry `sys.id` on mapped {@link ExperienceConfiguration} (preview plugin + dedupe). */
type ExperienceWithCfEntry = ExperienceConfiguration & { contentfulEntryId?: string };

/**
 * Collapse duplicate NtExperience rows when `nt_experience_id` and `sys.id`
 * were used as different merge keys, and when env JSON reuses another id shape.
 */
export function dedupePreviewExperiencesForPlugin(
  experiences: ExperienceConfiguration[],
): ExperienceConfiguration[] {
  const out = new Map<string, ExperienceConfiguration>();
  for (const e of experiences) {
    const ex = e as ExperienceWithCfEntry;
    const cf = ex.contentfulEntryId?.trim();
    const key = cf ? `cf:${cf}` : `id:${ex.id.trim()}`;
    const cur = out.get(key);
    if (!cur) {
      out.set(key, e);
      continue;
    }
    const prefersBusinessId = (x: ExperienceConfiguration) => {
      const x2 = x as ExperienceWithCfEntry;
      return Boolean(x2.contentfulEntryId?.trim() && x2.id.trim() !== x2.contentfulEntryId.trim());
    };
    const next =
      prefersBusinessId(e) && !prefersBusinessId(cur)
        ? e
        : !prefersBusinessId(e) && prefersBusinessId(cur)
          ? cur
          : e.id.length <= cur.id.length
            ? e
            : cur;
    out.set(key, next);
  }
  return [...out.values()];
}

/** Prefer Contentful catalog; env JSON only adds experiences missing by `id`. */
export function mergePreviewExperiencesForPlugin(
  fromContentful: ExperienceConfiguration[],
  fromEnv: ExperienceConfiguration[],
): ExperienceConfiguration[] {
  const cfSysIds = new Set(
    fromContentful
      .map(c => (c as ExperienceWithCfEntry).contentfulEntryId?.trim())
      .filter((x): x is string => Boolean(x)),
  );
  const envExtras = fromEnv.filter(
    e => !cfSysIds.has(e.id.trim()) && !fromContentful.some(c => c.id.trim() === e.id.trim()),
  );
  return dedupePreviewExperiencesForPlugin([...fromContentful, ...envExtras]);
}

/**
 * Union audiences: Contentful catalog first, then optional env extras (keyed by
 * `id`). When the catalog is non-empty we **do not** merge audiences inferred
 * from experiences — those often use a different id shape (`sys.id` vs
 * `ntAudienceId`) and duplicate the same audience in the preview UI.
 */
export function mergePreviewAudiencesForPlugin(
  fromContentful: NinetailedPreviewAudience[],
  _experiences: ExperienceConfiguration[],
  fromEnv: NinetailedPreviewAudience[],
): NinetailedPreviewAudience[] {
  const byId = new Map<string, NinetailedPreviewAudience>();
  for (const a of fromContentful) byId.set(a.id, a);
  if (fromContentful.length === 0) {
    for (const a of collectPreviewAudiencesFromExperiences(_experiences)) {
      if (!byId.has(a.id)) byId.set(a.id, a);
    }
  }
  for (const a of fromEnv) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }
  return [...byId.values()];
}

/**
 * Draft/preview-only: optional JSON array of Contentful-shaped NtExperience
 * payloads merged **after** the Contentful catalog (same `id` is kept from
 * Contentful). Each item is validated with `ExperienceMapper.isExperienceEntry`
 * then mapped.
 *
 * @see https://www.contentful.com/developers/docs/personalization/preview-plugin/
 */
export function loadPreviewExperiencesFromEnv(): ExperienceConfiguration[] {
  const raw = process.env.NINETAILED_PREVIEW_EXPERIENCES_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const configs: ExperienceConfiguration[] = [];
    for (const item of parsed) {
      if (ExperienceMapper.isExperienceEntry(item)) {
        configs.push(ExperienceMapper.mapExperience(item));
      }
    }
    return configs;
  } catch {
    return [];
  }
}

/**
 * Optional supplemental audiences for the preview plugin: merged **after** the
 * Contentful catalog and audiences inferred from mapped experiences (same
 * `id` kept from earlier sources).
 */
export function loadPreviewAudiencesFromEnv(): NinetailedPreviewAudience[] {
  const raw = process.env.NINETAILED_PREVIEW_AUDIENCES_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: NinetailedPreviewAudience[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const id = typeof rec.id === 'string' ? rec.id.trim() : '';
      const name = typeof rec.name === 'string' ? rec.name.trim() : '';
      if (!id || !name) continue;
      const description = typeof rec.description === 'string' ? rec.description.trim() : undefined;
      out.push(description ? { id, name, description } : { id, name });
    }
    return out;
  } catch {
    return [];
  }
}
