'use client';

import { ContentfulLivePreviewProvider } from '@contentful/live-preview/react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { TimelineContextProvider } from '@/components/contentful/timeline-context';
import type { TimelineContext } from '@/lib/contentful/timeline-shared';
import { hasTimelineContext } from '@/lib/contentful/timeline-shared';

type ContentfulPreviewContextValue = {
  preview: boolean;
  inspectorSuppressed: boolean;
  setInspectorSuppressed: Dispatch<SetStateAction<boolean>>;
};

const ContentfulPreviewContext = createContext<ContentfulPreviewContextValue>({
  preview: false,
  inspectorSuppressed: false,
  setInspectorSuppressed: () => {},
});

export function useContentfulPreviewEnabled(): boolean {
  return useContext(ContentfulPreviewContext).preview;
}

/**
 * `true` when the page is rendered in Contentful Live Preview. Components use this to skip
 * preview-only UI when inspector overlays would otherwise conflict with it. Whether overlays are
 * actually shown is controlled by the editor’s own eye toggle, which the SDK handles internally via
 * `INSPECTOR_MODE_CHANGED` → `InspectorMode.init()` / `cleanup()` — we do not need to mirror that
 * state ourselves.
 */
export function useContentfulInspectorEnabled(): boolean {
  const { preview, inspectorSuppressed } = useContext(ContentfulPreviewContext);
  return preview && !inspectorSuppressed;
}

export function useSetContentfulInspectorSuppressed(): Dispatch<SetStateAction<boolean>> {
  return useContext(ContentfulPreviewContext).setInspectorSuppressed;
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
      if (
        typeof first === 'string' &&
        first.includes('Received an update for an unknown subscription')
      ) {
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
  timelineContext = null,
  children,
}: {
  locale: string;
  preview: boolean;
  /** Contentful environment id (e.g. `master`). Must match GraphQL `CONTENTFUL_ENVIRONMENT`. */
  environment?: string;
  timelineContext?: TimelineContext | null;
  children: ReactNode;
}) {
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '';
  const [inspectorSuppressed, setInspectorSuppressed] = useState(false);
  const contextValue = useMemo(
    () => ({
      preview,
      inspectorSuppressed,
      setInspectorSuppressed,
    }),
    [preview, inspectorSuppressed],
  );

  useSilenceUnknownSubscriptionWarning(preview);

  const timelineActive = hasTimelineContext(timelineContext);

  return (
    <ContentfulPreviewContext.Provider value={contextValue}>
      <TimelineContextProvider value={timelineContext}>
        <ContentfulLivePreviewProvider
          locale={locale}
          space={space}
          environment={environment}
          enableInspectorMode={preview}
          enableLiveUpdates={preview && !timelineActive}
          debugMode={process.env.NEXT_PUBLIC_CONTENTFUL_LIVE_PREVIEW_DEBUG === '1'}
          targetOrigin={['https://app.contentful.com', 'https://app.eu.contentful.com']}
          experimental={
            preview
              ? {
                  hideCoveredElementOutlines: true,
                }
              : undefined
          }
        >
          {children}
        </ContentfulLivePreviewProvider>
      </TimelineContextProvider>
    </ContentfulPreviewContext.Provider>
  );
}
