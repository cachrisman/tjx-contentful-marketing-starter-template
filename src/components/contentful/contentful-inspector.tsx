import type { ReactNode } from 'react';

export type ContentfulInspectorAttributes = Record<string, string | undefined>;

export function ContentfulInspector({
  entryId,
  assetId,
  fieldId,
  children,
}: {
  entryId?: string | null;
  assetId?: string | null;
  fieldId: string;
  children: (attrs: ContentfulInspectorAttributes) => ReactNode;
}) {
  const attrs: ContentfulInspectorAttributes =
    entryId || assetId
      ? {
          'data-contentful-field-id': fieldId,
          ...(entryId
            ? { 'data-contentful-entry-id': entryId }
            : { 'data-contentful-asset-id': assetId ?? undefined }),
        }
      : {};
  return <>{children(attrs)}</>;
}
