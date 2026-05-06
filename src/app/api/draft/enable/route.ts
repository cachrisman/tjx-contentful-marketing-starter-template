import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { signPreviewToken } from '@/lib/contentful/preview-token';
import { normalizeSlug } from '@/lib/slug-normalize';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const locale = searchParams.get('locale') ?? 'en-US';

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response('Invalid secret', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const previewSecret = process.env.CONTENTFUL_PREVIEW_SECRET;
  const slugNorm = slug ? normalizeSlug(slug) : null;
  const slugKey = !slugNorm || slugNorm === 'home' ? 'home' : slugNorm;
  const path =
    slugKey === 'home' ? `/${locale}` : `/${locale}/${slugKey}`;
  const withToken =
    previewSecret != null && previewSecret !== ''
      ? `${path}?cf_pt=${encodeURIComponent(
          signPreviewToken(
            {
              locale,
              slug: slugKey,
              exp: Date.now() + 15 * 60 * 1000,
            },
            previewSecret,
          ),
        )}`
      : path;

  return NextResponse.redirect(new URL(withToken, url.origin));
}
