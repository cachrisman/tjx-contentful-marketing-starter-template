import 'server-only';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import { ExperienceMapper } from '@ninetailed/experience.js-utils';

/**
 * Optional JSON array of Ninetailed Experience entries (Contentful-shaped).
 * Replace `__BASELINE_ID__` with the hero entry sys.id at runtime so one template works across heroes.
 *
 * When unset or invalid, returns [] and the UI renders the baseline hero only.
 */
export function loadHeroExperiencesFromEnv(baselineEntryId: string): ExperienceConfiguration[] {
  const raw = process.env.NINETAILED_HERO_EXPERIENCES_JSON?.trim();
  if (!raw) return [];
  try {
    const substituted = raw.replaceAll('__BASELINE_ID__', baselineEntryId);
    const parsed = JSON.parse(substituted) as unknown;
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
