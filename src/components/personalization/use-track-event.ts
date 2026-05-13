'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import type { JsonObject } from '@ninetailed/experience.js-shared';
import { useCallback } from 'react';

import { useConsent } from '@/components/personalization/consent-context';
import type { NtMetricName } from '@/components/personalization/metrics-events';

/**
 * Safe `track()` wrapper for POC metrics.
 *
 * - Returns a stable callback regardless of provider presence — if the
 *   Ninetailed client is missing (no `NEXT_PUBLIC_NINETAILED_CLIENT_ID`),
 *   the callback is a no-op.
 * - Defers to the Privacy plugin's post-consent allowlist (`['page', 'track',
 *   'component']`) — calling pre-consent is allowed but will be dropped by
 *   the plugin. We still guard on `consent` for clarity and to avoid wasted
 *   queue entries when consent is known to be denied.
 *
 * The `eventName` MUST match the Metric registered by SE / marketing in the
 * Personalization web app, otherwise Insights cannot attribute conversions.
 */
export function useTrackEvent() {
  const ninetailed = useNinetailed();
  const { consent } = useConsent();

  return useCallback(
    (eventName: NtMetricName, properties?: JsonObject) => {
      if (!ninetailed || !consent) return;
      void ninetailed.track(eventName, properties).catch(() => {
        /* swallow — Privacy plugin can abort by design */
      });
    },
    [ninetailed, consent],
  );
}
