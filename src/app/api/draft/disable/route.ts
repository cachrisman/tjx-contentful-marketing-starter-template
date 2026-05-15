import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { normalizeSlug } from '@/lib/slug-normalize';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') ?? 'en-US';
  const slugRaw = url.searchParams.get('slug');
  const slugNorm = slugRaw ? normalizeSlug(slugRaw) : null;
  const slugKey = !slugNorm || slugNorm === 'home' ? 'home' : slugNorm;

  const draft = await draftMode();
  draft.disable();

  const path = slugKey === 'home' ? `/${locale}` : `/${locale}/${slugKey}`;
  return NextResponse.redirect(new URL(path, url.origin));
}
