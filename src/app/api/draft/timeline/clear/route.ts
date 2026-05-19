import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { deleteTimelineCookie } from '@/lib/contentful/timeline';
import { normalizeSlug } from '@/lib/slug-normalize';

export async function GET(request: Request) {
  const draft = await draftMode();
  if (!draft.isEnabled) {
    return new Response('Draft mode is not enabled', { status: 401 });
  }

  const url = new URL(request.url);
  const localeParam = url.searchParams.get('locale');
  const locale =
    localeParam != null && isLocale(localeParam) ? localeParam : defaultLocale;
  const slugRaw = url.searchParams.get('slug');
  const slugNorm = slugRaw ? normalizeSlug(slugRaw) : null;
  const slugKey = !slugNorm || slugNorm === 'home' ? 'home' : slugNorm;

  const path = slugKey === 'home' ? `/${locale}` : `/${locale}/${slugKey}`;
  const res = NextResponse.redirect(new URL(path, url.origin));
  deleteTimelineCookie(res);
  return res;
}
