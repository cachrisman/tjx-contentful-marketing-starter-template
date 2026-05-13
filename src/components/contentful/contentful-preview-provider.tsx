'use client';

import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

const ContentfulInspectorEnabledContext = createContext(false);

/**
 * `true` when the page is rendered in Contentful Live Preview. Components use this to skip
 * `useContentfulInspectorMode` (and the `data-contentful-*` attributes it emits) entirely on
 * production traffic. Whether overlays are actually shown is controlled by the editor’s own eye
 * toggle, which the SDK handles internally via `INSPECTOR_MODE_CHANGED` → `InspectorMode.init()` /
 * `cleanup()` — we do not need to mirror that state ourselves.
 */
export function useContentfulInspectorEnabled(): boolean {
  return useContext(ContentfulInspectorEnabledContext);
}

/**
 * Silences the Contentful Live Preview SDK's "Received an update for an unknown subscription" warning.
 *
 * Cause: in Next.js dev React Strict Mode + HMR remount the live-update effect, which races against
 * the editor's `postMessage` queue — the editor briefly broadcasts updates against a subscription id
 * the SDK has already cleaned up. Updates still apply via the freshly-mounted subscription, so the
 * message is benign diagnostic noise from `j.error` (only enabled with `debugMode`). Strict Mode does
 * not run in production, so the warning never reaches end users.
 */
function useSilenceUnknownSubscriptionWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV === 'production') {
      return;
    }
    const original = console.error;
    console.error = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === 'string' && first.includes('Received an update for an unknown subscription')) {
        return;
      }
      original.apply(console, args as Parameters<typeof console.error>);
    };
    return () => {
      console.error = original;
    };
  }, [enabled]);
}

/**
 * Wires the Contentful Live Preview SDK in preview mode.
 *
 * We pass `enableInspectorMode` and `enableLiveUpdates` both as `preview` so the SDK fully
 * initializes in the preview iframe. Inspector overlays themselves stay off until the editor
 * (via its eye toggle) sends `INSPECTOR_MODE_CHANGED` with `isInspectorActive: true` — the SDK
 * handles that signal internally and starts/stops the listeners that drive the overlays.
 */
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

  useSilenceUnknownSubscriptionWarning(preview);

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
