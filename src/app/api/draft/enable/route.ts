import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { signPreviewToken } from '@/lib/contentful/preview-token';
import { normalizeSlug } from '@/lib/slug-normalize';

/**
 * Enables Next.js Draft Mode and redirects to the requested page (optionally with signed `cf_pt`
 * when `CONTENTFUL_PREVIEW_SECRET` is set — used by `src/proxy.ts` for iframe preview).
 *
 * **Security:** By default requires `?secret=` matching `CONTENTFUL_PREVIEW_SECRET` (Contentful
 * preview URL). Set `CONTENTFUL_POC_PREVIEW_TOGGLE=1` to allow unauthenticated enable for demos
 * (gear menu); keep off in production.
 */
function allowUnsealedDraftEnable(): boolean {
  return process.env.CONTENTFUL_POC_PREVIEW_TOGGLE === '1';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const locale = searchParams.get('locale') ?? 'en-US';

  const expected = process.env.CONTENTFUL_PREVIEW_SECRET;
  const secretOk = expected != null && expected !== '' && secret === expected;
  if (!secretOk && !allowUnsealedDraftEnable()) {
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
