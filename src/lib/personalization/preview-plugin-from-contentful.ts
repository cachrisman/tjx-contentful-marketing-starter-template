import 'server-only';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';
import type { ExperienceLike } from '@ninetailed/experience.js-utils';
import { ExperienceMapper } from '@ninetailed/experience.js-utils';

import { contentfulGraphqlSafe } from '@/lib/contentful/graphql-request';
import {
  NtPreviewAudienceCollectionDocument,
  NtPreviewExperienceCollectionDocument,
} from '@/lib/contentful/graphql/nt-preview-plugin-catalog.generated';
import type {
  NtPreviewAudienceCollectionQuery,
  NtPreviewExperienceFieldsFragment,
} from '@/lib/contentful/graphql/nt-preview-plugin-catalog.generated';
import {
  dedupePreviewExperiencesForPlugin,
  type NinetailedPreviewAudience,
} from '@/lib/personalization/preview-plugin-data';
import { stripContentSourceMapEncoding } from '@/lib/slug-normalize';

const FORMAT_CHARS = /\p{Cf}/gu;
const CATALOG_PAGE_LIMIT = 100;
const CATALOG_MAX_PAGES = 50;

function cleanPreviewString(value: string | null | undefined): string {
  if (!value) return '';
  return stripContentSourceMapEncoding(value).replace(FORMAT_CHARS, '').trim();
}

function cleanContentSourceMapsDeep(value: unknown): unknown {
  if (typeof value === 'string') {
    return cleanPreviewString(value);
  }
  if (Array.isArray(value)) {
    return value.map(cleanContentSourceMapsDeep);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        cleanContentSourceMapsDeep(v),
      ]),
    );
  }
  return value;
}

function experienceMergeKey(row: NtPreviewExperienceFieldsFragment): string {
  /** Always `sys.id` so published vs preview API rows for the same entry merge. */
  return row.sys.id;
}

function mergeExperienceRows(
  published: readonly (NtPreviewExperienceFieldsFragment | null)[] | null | undefined,
  draft: readonly (NtPreviewExperienceFieldsFragment | null)[] | null | undefined,
): NtPreviewExperienceFieldsFragment[] {
  const map = new Map<string, NtPreviewExperienceFieldsFragment>();
  for (const row of published ?? []) {
    if (!row) continue;
    map.set(experienceMergeKey(row), row);
  }
  for (const row of draft ?? []) {
    if (!row) continue;
    map.set(experienceMergeKey(row), row);
  }
  return [...map.values()];
}

type NtPreviewAudienceRow = NonNullable<
  NonNullable<
    NonNullable<NtPreviewAudienceCollectionQuery['ntAudienceCollection']>['items']
  >[number]
>;

function audienceMergeKey(row: NtPreviewAudienceRow): string {
  /** Always `sys.id` so published vs preview API rows for the same entry merge. */
  return row.sys.id;
}

function mergeAudienceRows(
  published: readonly (NtPreviewAudienceRow | null)[] | null | undefined,
  draft: readonly (NtPreviewAudienceRow | null)[] | null | undefined,
): NtPreviewAudienceRow[] {
  const map = new Map<string, NtPreviewAudienceRow>();
  for (const row of published ?? []) {
    if (!row) continue;
    map.set(audienceMergeKey(row), row);
  }
  for (const row of draft ?? []) {
    if (!row) continue;
    map.set(audienceMergeKey(row), row);
  }
  return [...map.values()];
}

function graphqlExperienceToExperienceLike(
  row: NtPreviewExperienceFieldsFragment,
): ExperienceLike | null {
  const id = cleanPreviewString(row.ntExperienceId) || row.sys.id;
  const name = cleanPreviewString(row.ntName);
  const type = cleanPreviewString(row.ntType);
  if (!id || !name || (type !== 'nt_experiment' && type !== 'nt_personalization')) {
    return null;
  }
  const config =
    row.ntConfig && typeof row.ntConfig === 'object' && !Array.isArray(row.ntConfig)
      ? (cleanContentSourceMapsDeep(row.ntConfig) as ExperienceLike['config'])
      : undefined;
  if (!config) {
    return null;
  }

  const variants = (row.ntVariantsCollection?.items ?? [])
    .filter((v): v is NonNullable<typeof v> => Boolean(v?.sys?.id))
    .map(v => {
      const id = cleanPreviewString(v.sys.id) || v.sys.id;
      const typename = cleanPreviewString(v.__typename);
      return typename ? { id, __typename: typename, sys: { id } } : { id };
    });

  const aud = row.ntAudience;
  const audienceId = aud ? cleanPreviewString(aud.ntAudienceId) || aud.sys.id : '';
  const audience =
    aud && audienceId
      ? {
          id: audienceId,
          ...(cleanPreviewString(aud.ntName) ? { name: cleanPreviewString(aud.ntName) } : {}),
          ...(cleanPreviewString(aud.ntDescription)
            ? { description: cleanPreviewString(aud.ntDescription) }
            : {}),
        }
      : undefined;

  return {
    id,
    name,
    type: type as ExperienceLike['type'],
    ...(cleanPreviewString(row.ntDescription)
      ? { description: cleanPreviewString(row.ntDescription) }
      : {}),
    config,
    ...(audience ? { audience } : {}),
    variants: variants as ExperienceLike['variants'],
  };
}

function graphqlAudienceToPreviewAudience(
  row: NtPreviewAudienceRow,
): NinetailedPreviewAudience | null {
  const id = cleanPreviewString(row.ntAudienceId) || row.sys.id;
  if (!id) return null;
  const name = cleanPreviewString(row.ntName) || id;
  const description = cleanPreviewString(row.ntDescription);
  const contentfulEntryId = row.sys.id;
  if (description) return { id, name, description, contentfulEntryId };
  return { id, name, contentfulEntryId };
}

/**
 * One NtAudience per Contentful entry. If pub/draft produced different `id`
 * strings (`ntAudienceId` vs `sys.id`), keep the row whose `id` is the
 * Ninetailed business id when it differs from `contentfulEntryId`.
 */
function dedupePreviewAudiences(
  audiences: NinetailedPreviewAudience[],
): NinetailedPreviewAudience[] {
  const out = new Map<string, NinetailedPreviewAudience>();
  for (const a of audiences) {
    const entryId = a.contentfulEntryId?.trim();
    const key = entryId ? `cf:${entryId}` : `id:${a.id.trim()}`;
    const cur = out.get(key);
    if (!cur) {
      out.set(key, a);
      continue;
    }
    const prefersBusinessId = (x: NinetailedPreviewAudience) =>
      Boolean(x.contentfulEntryId?.trim() && x.id.trim() !== x.contentfulEntryId.trim());
    const next =
      prefersBusinessId(a) && !prefersBusinessId(cur)
        ? a
        : !prefersBusinessId(a) && prefersBusinessId(cur)
          ? cur
          : a.id.length <= cur.id.length
            ? a
            : cur;
    out.set(key, next);
  }
  return [...out.values()];
}

/**
 * `NinetailedPreviewPlugin` merges catalog + `experience.audience` via lodash
 * `unionBy(..., 'id')`. If the catalog uses `nt_audience_id` while the mapped
 * experience still has `sys.id`, the widget shows the same audience twice.
 */
export function alignPreviewPluginExperienceAudiences(
  experiences: ExperienceConfiguration[],
  audiences: NinetailedPreviewAudience[],
): void {
  const canonical = new Map<string, string>();
  for (const aud of audiences) {
    const id = aud.id.trim();
    canonical.set(id, id);
    if (aud.contentfulEntryId?.trim()) {
      canonical.set(aud.contentfulEntryId.trim(), id);
    }
  }
  for (const exp of experiences) {
    const aud = exp.audience;
    if (!aud?.id?.trim()) continue;
    const mapped = canonical.get(aud.id.trim());
    if (mapped && mapped !== aud.id.trim()) {
      exp.audience = { ...aud, id: mapped };
    }
  }
}

async function loadExperienceRowsPage(
  locale: string,
  preview: boolean,
  skip: number,
): Promise<NtPreviewExperienceFieldsFragment[]> {
  const data = await contentfulGraphqlSafe(
    NtPreviewExperienceCollectionDocument,
    { locale, preview, limit: CATALOG_PAGE_LIMIT, skip },
    { preview },
  );
  return (data?.ntExperienceCollection?.items ?? []).filter(
    (row): row is NtPreviewExperienceFieldsFragment => Boolean(row),
  );
}

async function loadAudienceRowsPage(
  locale: string,
  preview: boolean,
  skip: number,
): Promise<NtPreviewAudienceRow[]> {
  const data = await contentfulGraphqlSafe(
    NtPreviewAudienceCollectionDocument,
    { locale, preview, limit: CATALOG_PAGE_LIMIT, skip },
    { preview },
  );
  return (data?.ntAudienceCollection?.items ?? []).filter((row): row is NtPreviewAudienceRow =>
    Boolean(row),
  );
}

async function loadAllExperienceRows(
  locale: string,
  preview: boolean,
): Promise<NtPreviewExperienceFieldsFragment[]> {
  const rows: NtPreviewExperienceFieldsFragment[] = [];
  for (let page = 0; page < CATALOG_MAX_PAGES; page += 1) {
    const pageRows = await loadExperienceRowsPage(locale, preview, page * CATALOG_PAGE_LIMIT);
    rows.push(...pageRows);
    if (pageRows.length < CATALOG_PAGE_LIMIT) break;
  }
  return rows;
}

async function loadAllAudienceRows(
  locale: string,
  preview: boolean,
): Promise<NtPreviewAudienceRow[]> {
  const rows: NtPreviewAudienceRow[] = [];
  for (let page = 0; page < CATALOG_MAX_PAGES; page += 1) {
    const pageRows = await loadAudienceRowsPage(locale, preview, page * CATALOG_PAGE_LIMIT);
    rows.push(...pageRows);
    if (pageRows.length < CATALOG_PAGE_LIMIT) break;
  }
  return rows;
}

/**
 * Loads **all** `NtExperience` / `NtAudience` rows from Contentful for both
 * published (`preview: false`) and draft/preview (`preview: true`) API modes,
 * merges experiences by business id (draft wins on overlap). Audiences are merged
 * by Contentful `sys.id` (so preview vs published rows collapse), deduped, then mapped
 * with {@link ExperienceMapper}. Finally `experience.audience.id` is aligned to the
 * canonical catalog audience id so the preview plugin’s `unionBy(..., 'id')` does not
 * list the same audience twice.
 *
 * GraphQL pages through `NtExperience` / `NtAudience` collections in chunks of
 * 100. Variant refs are fetched up to the GraphQL collection limit per
 * experience; hydrate full variant entries later only when rendering a matching
 * baseline component.
 *
 * @see https://www.contentful.com/developers/docs/personalization/preview-plugin/
 */
export async function loadPreviewPluginDataFromContentful(locale: string): Promise<{
  experiences: ExperienceConfiguration[];
  audiences: NinetailedPreviewAudience[];
}> {
  const [expPub, expPrv, audPub, audPrv] = await Promise.all([
    loadAllExperienceRows(locale, false),
    loadAllExperienceRows(locale, true),
    loadAllAudienceRows(locale, false),
    loadAllAudienceRows(locale, true),
  ]);

  const experienceRows = mergeExperienceRows(expPub, expPrv);

  const audienceRows = mergeAudienceRows(audPub, audPrv);
  const audiencesRaw: NinetailedPreviewAudience[] = [];
  for (const row of audienceRows) {
    const a = graphqlAudienceToPreviewAudience(row);
    if (a) audiencesRaw.push(a);
  }
  const audiences = dedupePreviewAudiences(audiencesRaw);

  const experiencesRaw: ExperienceConfiguration[] = [];
  for (const row of experienceRows) {
    const like = graphqlExperienceToExperienceLike(row);
    if (!like || !ExperienceMapper.isExperienceEntry(like)) continue;
    try {
      const mapped = ExperienceMapper.mapExperience(like);
      experiencesRaw.push(
        Object.assign(mapped, { contentfulEntryId: row.sys.id }) as ExperienceConfiguration,
      );
    } catch {
      /* skip invalid rows — schema drift or incomplete nt_config */
    }
  }
  const experiences = dedupePreviewExperiencesForPlugin(experiencesRaw);
  alignPreviewPluginExperienceAudiences(experiences, audiences);

  const previewDebug =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_NINETAILED_PREVIEW_DEBUG === '1';
  if (previewDebug) {
    console.info('[Ninetailed Preview][server]', 'Contentful catalog', {
      locale,
      experienceCount: experiences.length,
      audienceCount: audiences.length,
      experienceIds: experiences.map(e => e.id),
      audienceIds: audiences.map(a => a.id),
    });
  }

  return { experiences, audiences };
}
