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
};

/**
 * Draft/preview-only: JSON array of Contentful-shaped NtExperience payloads.
 * Each item is validated with `ExperienceMapper.isExperienceEntry` then mapped.
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
 * Draft/preview-only: JSON array of `{ "id", "name", "description"? }` objects
 * for the preview plugin audience list.
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
