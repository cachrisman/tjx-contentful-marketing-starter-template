'use client';

import { ESRProvider, NinetailedProvider } from '@ninetailed/experience.js-react';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-plugin-insights';
import { NinetailedPrivacyPlugin } from '@ninetailed/experience.js-plugin-privacy';
import type { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { NINETAILED_ANONYMOUS_ID_COOKIE } from '@ninetailed/experience.js-shared';
import type { EventType, Locale as NtLocale } from '@ninetailed/experience.js-shared';
import { useEffect, useMemo, useState, type ReactNode, Suspense } from 'react';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';

import { ConsentProvider, useConsent } from '@/components/personalization/consent-context';
import { NinetailedTrackPages } from '@/components/personalization/ninetailed-track-pages';
import type { NinetailedPreviewAudience } from '@/lib/personalization/preview-plugin-data';
import { readPublicClientId, readPublicEnvironment } from '@/lib/personalization/config';

/**
 * Phase 1 client shell.
 *
 * Missing-env baseline (Phase 1.C): when `NEXT_PUBLIC_NINETAILED_CLIENT_ID` is
 * unset, render `children` only — no SDK hooks outside this tree.
 *
 * Hybrid ESR: `ESRProvider` + `NinetailedProvider` mount on the **server** so
 * `experienceVariantsMap` from RSC is available for first HTML (no client-only
 * deferral of the provider tree).
 *
 * **Preview + `key` on `NinetailedProvider`:** upstream `NinetailedProvider`
 * freezes `plugins` in a `useMemo` with an empty dependency array, so async
 * `import()` of `NinetailedPreviewPlugin` would never attach without a remount.
 * We intentionally bump `key` only in draft/preview when the ctor appears
 * (`…:pv:0` → `…:pv:1`). Cost: full provider remount (profile in-memory state
 * resets; `onInitProfileId` + cookie should restore). Do not remove the key
 * without fixing upstream or accepting missing Preview overlays.
 *
 * Preview plugin uses `ui.opener.hide: true` so Ninetailed’s default edge tab
 * stays hidden; the gear lives in `SiteHeader` when `preview` is true and calls
 * `window.ninetailed.plugins.preview.open()`. Experiences and audiences come from
 * server props (`NINETAILED_PREVIEW_*_JSON`), mapped with `ExperienceMapper` /
 * validated shapes — see Contentful preview-plugin docs.
 */
const PRE_CONSENT_ALLOWED: EventType[] = ['page', 'component'];
const POST_CONSENT_ALLOWED: EventType[] = ['page', 'track', 'component'];

function readAnonymousIdFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${NINETAILED_ANONYMOUS_ID_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) || undefined : undefined;
}

type PreviewPluginCtor = new (opts: {
  experiences: ExperienceConfiguration[];
  audiences: NinetailedPreviewAudience[];
  ui?: { opener?: { hide: boolean } };
}) => NinetailedPlugin;

const PRIVACY_CONSENT_MAX_ATTEMPTS = 10;
const PRIVACY_CONSENT_RETRY_MS = 80;

/**
 * Applies Privacy consent via **`privacyPlugin.methods.consent`** (typed public
 * surface on `NinetailedPrivacyPlugin`) when ready; falls back to
 * `window.ninetailed.consent` with retries so registration order vs. other
 * plugins does not silently drop consent.
 */
function NinetailedPrivacyConsentBridge({
  consent,
  privacyPlugin,
}: {
  consent: boolean;
  privacyPlugin: NinetailedPrivacyPlugin | null;
}) {
  useEffect(() => {
    if (typeof window === 'undefined' || !privacyPlugin) return;
    let cancelled = false;
    let attempt = 0;

    const tryWindow = (): boolean => {
      const win = window as Window & { ninetailed?: { consent?: (accepted: boolean) => void } };
      if (typeof win.ninetailed?.consent === 'function') {
        win.ninetailed.consent(consent);
        return true;
      }
      return false;
    };

    const tick = () => {
      if (cancelled) return;
      try {
        privacyPlugin.methods.consent(consent);
        return;
      } catch {
        /* `methods` not ready until plugin `initialize` completes */
      }
      if (tryWindow()) return;
      attempt += 1;
      if (attempt < PRIVACY_CONSENT_MAX_ATTEMPTS) {
        window.setTimeout(tick, PRIVACY_CONSENT_RETRY_MS);
      }
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [consent, privacyPlugin]);

  return null;
}

function NinetailedAppProvidersInner({
  preview,
  locale,
  experienceVariantsMap,
  previewExperiences,
  previewAudiences,
  children,
}: {
  preview: boolean;
  locale?: string;
  experienceVariantsMap: Record<string, number>;
  /** Mapped `ExperienceConfiguration[]` for `NinetailedPreviewPlugin` (draft/preview only). */
  previewExperiences: ExperienceConfiguration[];
  /** Audience definitions for `NinetailedPreviewPlugin` (draft/preview only). */
  previewAudiences: NinetailedPreviewAudience[];
  children: ReactNode;
}) {
  const clientId = readPublicClientId();
  const environment = readPublicEnvironment();
  const { consent } = useConsent();

  const [previewPluginCtor, setPreviewPluginCtor] = useState<PreviewPluginCtor | null>(null);

  useEffect(() => {
    if (!preview || !clientId || previewPluginCtor) return;
    let cancelled = false;
    void import('@ninetailed/experience.js-plugin-preview')
      .then(mod => {
        if (cancelled) return;
        setPreviewPluginCtor(() => mod.NinetailedPreviewPlugin as unknown as PreviewPluginCtor);
      })
      .catch(() => {
        /* preview plugin missing — preview overlays disabled, baseline still works */
      });
    return () => {
      cancelled = true;
    };
  }, [preview, clientId, previewPluginCtor]);

  const plugins = useMemo<NinetailedPlugin[]>(() => {
    const list: NinetailedPlugin[] = [
      new NinetailedInsightsPlugin(),
      new NinetailedPrivacyPlugin(
        { allowedEvents: PRE_CONSENT_ALLOWED },
        { allowedEvents: POST_CONSENT_ALLOWED },
      ),
    ];
    if (preview && previewPluginCtor) {
      list.push(
        new previewPluginCtor({
          experiences: previewExperiences,
          audiences: previewAudiences,
          ui: { opener: { hide: true } },
        }),
      );
    }
    return list;
  }, [preview, previewPluginCtor, previewExperiences, previewAudiences]);

  const privacyPlugin =
    plugins.find((p): p is NinetailedPrivacyPlugin => p instanceof NinetailedPrivacyPlugin) ?? null;

  if (!clientId) {
    return <>{children}</>;
  }

  const providerKey = `${clientId}:${preview ? 'pv' : 'pd'}:${preview ? Number(Boolean(previewPluginCtor)) : 0}`;

  return (
    <ESRProvider experienceVariantsMap={experienceVariantsMap}>
      {/*
        Intentional `key`: see module comment — required so Preview plugin can
        attach after dynamic import (upstream freezes plugins at first mount).
      */}
      <NinetailedProvider
        key={providerKey}
        clientId={clientId}
        environment={environment}
        locale={locale as NtLocale | undefined}
        preview={preview}
        plugins={plugins}
        onInitProfileId={profileIdFromSdk => readAnonymousIdFromCookie() ?? profileIdFromSdk}
      >
        <NinetailedPrivacyConsentBridge consent={consent} privacyPlugin={privacyPlugin} />
        <Suspense fallback={null}>
          <NinetailedTrackPages />
        </Suspense>
        {children}
      </NinetailedProvider>
    </ESRProvider>
  );
}

export function NinetailedAppProviders({
  preview,
  locale,
  experienceVariantsMap,
  previewExperiences,
  previewAudiences,
  children,
}: {
  preview: boolean;
  locale?: string;
  experienceVariantsMap: Record<string, number>;
  previewExperiences: ExperienceConfiguration[];
  previewAudiences: NinetailedPreviewAudience[];
  children: ReactNode;
}) {
  return (
    <ConsentProvider>
      <NinetailedAppProvidersInner
        preview={preview}
        locale={locale}
        experienceVariantsMap={experienceVariantsMap}
        previewExperiences={previewExperiences}
        previewAudiences={previewAudiences}
      >
        {children}
      </NinetailedAppProvidersInner>
    </ConsentProvider>
  );
}
