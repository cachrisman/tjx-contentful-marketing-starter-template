import { NextResponse } from 'next/server';

import { contentfulGraphql } from '@/lib/contentful/graphql-request';
import { isContentfulPreview } from '@/lib/contentful/preview-request';
import { CtfRichTextHyperlinkDocument } from '@/lib/contentful/graphql/ctf-richtext.generated';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const locale = url.searchParams.get('locale') ?? undefined;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const preview = await isContentfulPreview();

  try {
    const data = await contentfulGraphql(
      CtfRichTextHyperlinkDocument,
      { id, locale, preview },
      { preview },
    );
    return NextResponse.json({ page: data.page ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'GraphQL error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
