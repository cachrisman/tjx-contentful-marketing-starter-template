'use client';

import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';

export function ContentfulPreviewProvider({
  locale,
  preview,
  children,
}: {
  locale: string;
  preview: boolean;
  children: React.ReactNode;
}) {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '';

  return (
    <ContentfulLivePreviewProvider
      locale={locale}
      space={space}
      enableInspectorMode={preview}
      enableLiveUpdates={preview}
      debugMode={false}
      targetOrigin={['https://app.contentful.com', 'https://app.eu.contentful.com']}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
