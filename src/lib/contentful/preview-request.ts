import { draftMode, headers } from 'next/headers';

/** Set only by src/proxy.ts after validating ?cf_pt= (never trust client-sent values). */
export const CONTENTFUL_PREVIEW_HEADER = 'x-cf-preview-active';

export async function isContentfulPreview(): Promise<boolean> {
  const draft = await draftMode();
  if (draft.isEnabled) {
    return true;
  }
  const h = await headers();
  return h.get(CONTENTFUL_PREVIEW_HEADER) === '1';
}
