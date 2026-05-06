'use client';

import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { createContext, useContext, type ReactNode } from 'react';

const ContentfulInspectorEnabledContext = createContext(false);

/** Mirrors draft/preview mode so client blocks can skip Contentful inspector hooks during static prerender. */
export function useContentfulInspectorEnabled(): boolean {
  return useContext(ContentfulInspectorEnabledContext);
}

export function ContentfulPreviewProvider({
  locale,
  preview,
  environment,
  children,
}: {
  locale: string;
  preview: boolean;
  /** Contentful environment id (e.g. `master`). Must match GraphQL `CONTENTFUL_ENVIRONMENT`. */
  environment?: string;
  children: ReactNode;
}) {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '';

  return (
    <ContentfulInspectorEnabledContext.Provider value={preview}>
      <ContentfulLivePreviewProvider
        locale={locale}
        space={space}
        environment={environment}
        enableInspectorMode={preview}
        enableLiveUpdates={preview}
        debugMode={process.env.NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW_DEBUG === '1'}
        targetOrigin={['https://app.contentful.com', 'https://app.eu.contentful.com']}
        experimental={
          preview
            ? {
                // Hide inspector outlines for fields covered by overlays (e.g. mega menu over page body).
                hideCoveredElementOutlines: true,
              }
            : undefined
        }
      >
        {children}
      </ContentfulLivePreviewProvider>
    </ContentfulInspectorEnabledContext.Provider>
  );
}
