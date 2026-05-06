import { cache } from 'react';

import { CtfGlobalSettingsDocument } from '@/lib/contentful/graphql/ctf-global-settings.generated';
import type { CtfGlobalSettingsQuery } from '@/lib/contentful/graphql/ctf-global-settings.generated';
import type { CtfFooterQuery } from '@/lib/contentful/graphql/ctf-footer.generated';
import type { CtfNavigationQuery } from '@/lib/contentful/graphql/ctf-navigation.generated';
import { contentfulGraphqlSafe } from '@/lib/contentful/graphql-request';

async function fetchGlobalSettings(locale: string | undefined, preview: boolean) {
  const data = await contentfulGraphqlSafe(CtfGlobalSettingsDocument, { locale, preview }, { preview });
  return data?.globalSettingsCollection ?? null;
}

/** Dedupes repeated reads in the same request (layout + metadata). */
export const loadGlobalSettings = cache(fetchGlobalSettings);

export type GlobalSettingsCollection = CtfGlobalSettingsQuery['globalSettingsCollection'];

export function pickGlobalSettingsEntry(collection: GlobalSettingsCollection | null | undefined) {
  return collection?.items?.[0] ?? null;
}

export function navigationFromGlobalSettings(
  collection: GlobalSettingsCollection | null | undefined,
): CtfNavigationQuery['navigationMenuCollection'] | null {
  const menu = pickGlobalSettingsEntry(collection)?.headerMenu;
  if (!menu) return null;
  return {
    __typename: 'NavigationMenuCollection',
    items: [menu],
  };
}

export function footerFromGlobalSettings(
  collection: GlobalSettingsCollection | null | undefined,
): CtfFooterQuery['footerMenuCollection'] | null {
  const menu = pickGlobalSettingsEntry(collection)?.siteFooterMenu;
  if (!menu) return null;
  return {
    __typename: 'FooterMenuCollection',
    items: [menu],
  };
}
