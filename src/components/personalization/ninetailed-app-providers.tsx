'use client';

import {
  ESRProvider,
  NinetailedProvider,
  useNinetailed,
  useProfile,
} from '@ninetailed/experience.js-react';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-plugin-insights';
import { NinetailedPrivacyPlugin } from '@ninetailed/experience.js-plugin-privacy';
import type { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { NINETAILED_ANONYMOUS_ID_COOKIE } from '@ninetailed/experience.js-shared';
import type { EventType, Locale as NtLocale } from '@ninetailed/experience.js-shared';
import { useEffect, useMemo, useRef, useState, type ReactNode, Suspense } from 'react';

import type { ExperienceConfiguration } from '@ninetailed/experience.js';

import { useSetContentfulInspectorSuppressed } from '@/components/contentful/contentful-preview-provider';
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
 * deferral of the provider tree). In **Contentful preview**, the layout passes an
 * empty map so `ESRLoadingComponent` does not pin the hero to a signed server
 * variant while the Ninetailed Preview widget controls selection.
 *
 * **Preview + `key` on `NinetailedProvider`:** upstream `NinetailedProvider`
 * freezes `plugins` in a `useMemo` with an empty dependency array, so async
 * `import()` of `NinetailedPreviewPlugin` does not attach to an already-mounted
 * provider. We intentionally bump `key` only in draft/preview when the ctor
 * appears (`…:pv:0` → `…:pv:1`) so the provider and `Experience` hooks recreate
 * with the preview plugin middleware installed.
 *
 * Preview plugin uses `ui.opener.hide: true` so Ninetailed’s default edge tab
 * stays hidden; `SiteHeader` always shows `PreviewGearMenu`, which can open
 * `window.ninetailed.plugins.preview.open()` in a server preview session.
 * Experiences and audiences are
 * loaded server-side: all `NtExperience` / `NtAudience` entries from Contentful
 * (published + preview API, merged so draft wins on id overlap), then mapped
 * with `ExperienceMapper`. Optional `NINETAILED_PREVIEW_*_JSON` env arrays only
 * add entries missing by `id` — see Contentful preview-plugin docs.
 *
 * `onOpenAudienceEditor` / `onOpenExperienceEditor` open the matching Contentful
 * entries when `contentfulEntryId` is present on catalog rows (requires
 * `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` and `NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT`).
 *
 * **Contentful preview:** `useSDKEvaluation={preview}` so variant resolution can use
 * the SDK + profile when the Experience API returns no `selectedExperiences` row
 * for this component (common in draft/preview); the preview plugin middleware
 * still applies widget overrides on top.
 *
 * **Debug:** `next dev` logs automatically. Else set `NEXT_PUBLIC_NINETAILED_PREVIEW_DEBUG=1`
 * (rebuild) **or** `localStorage.setItem('nt_preview_debug','1')` + reload. Logs diff
 * `experienceVariantIndexes` + `activeAudiences` on `window.ninetailed.plugins.preview`
 * (the plugin’s public `windowApi` — not `audienceOverwrites`, which is internal).
 * Hooks + 350ms polling back `onChangesChange` gaps when `profile.changes` is empty.
 */
const PRE_CONSENT_ALLOWED: EventType[] = ['page', 'component'];
const POST_CONSENT_ALLOWED: EventType[] = [
  'page',
  'track',
  'component',
  'component_click',
  'component_hover',
];

function readAnonymousIdFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${NINETAILED_ANONYMOUS_ID_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) || undefined : undefined;
}

const NT_PREVIEW_LOG = '[Ninetailed Preview]';

function isNinetailedPreviewDebug(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  if (process.env.NEXT_PUBLIC_NINETAILED_PREVIEW_DEBUG === '1') return true;
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem('nt_preview_debug') === '1';
    } catch {
      /* private mode / blocked storage */
    }
  }
  return false;
}

function ntPreviewDebug(...args: unknown[]): void {
  if (!isNinetailedPreviewDebug()) return;
  console.info(NT_PREVIEW_LOG, ...args);
}

type PreviewPluginCtor = new (opts: {
  experiences: ExperienceConfiguration[];
  audiences: NinetailedPreviewAudience[];
  ui?: { opener?: { hide: boolean } };
  onOpenAudienceEditor?: (audience: NinetailedPreviewAudience) => void;
  onOpenExperienceEditor?: (experience: ExperienceConfiguration) => void;
}) => NinetailedPlugin;

type WithContentfulEntryId = { contentfulEntryId?: string };

function openContentfulEntryInStudio(entryId: string | undefined): void {
  if (typeof window === 'undefined' || !entryId?.trim()) return;
  const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID?.trim();
  const env = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT?.trim() || 'master';
  if (!space) return;
  const url = `https://app.contentful.com/spaces/${encodeURIComponent(space)}/environments/${encodeURIComponent(env)}/entries/${encodeURIComponent(entryId.trim())}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openAudienceInContentful(audience: NinetailedPreviewAudience): void {
  openContentfulEntryInStudio((audience as WithContentfulEntryId).contentfulEntryId);
}

function openExperienceInContentful(experience: ExperienceConfiguration): void {
  openContentfulEntryInStudio((experience as WithContentfulEntryId).contentfulEntryId);
}

type PreviewPluginsWindowApi = {
  version?: string;
  isOpen?: boolean;
  open?: () => void;
  close?: () => void;
  toggle?: () => void;
  /** Merged API + widget override indexes (this is what updates when you pick a variant). */
  experienceVariantIndexes?: Record<string, number>;
  /** Effective audience ids after API profile + widget toggles. */
  activeAudiences?: string[];
  __ntPanelStatePatched?: true;
  __ntPanelStatePublish?: (forcedOpen?: boolean) => void;
};

type PreviewPluginProfileSync = NinetailedPlugin & {
  onProfileChange?: (profile: unknown, changes?: unknown[]) => void;
};

const NT_PREVIEW_WIDGET_SELECTOR = '.nt-preview-widget-container';

function readPreviewPluginsWindowApi(): PreviewPluginsWindowApi | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as Window & { ninetailed?: { plugins?: { preview?: PreviewPluginsWindowApi } } })
      .ninetailed?.plugins?.preview ?? null
  );
}

/**
 * Reads `window.ninetailed.plugins.preview` as exposed by `@ninetailed/experience.js-plugin-preview`
 * (`windowApi`). That object does **not** include `audienceOverwrites` / `experienceVariantIndexOverwrites`
 * (those exist only on the internal `pluginApi` for the React bridge).
 */
function readPreviewPluginsWindowSnapshot(): {
  version?: string;
  isOpen?: boolean;
  experienceVariantIndexes: Record<string, number>;
  activeAudiences: string[];
} | null {
  const p = readPreviewPluginsWindowApi();
  if (!p) return null;
  const raw = p.experienceVariantIndexes;
  const experienceVariantIndexes =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...(raw as Record<string, number>) }
      : {};
  const activeAudiences = Array.isArray(p.activeAudiences) ? [...p.activeAudiences] : [];
  return {
    version: p.version,
    isOpen: p.isOpen,
    experienceVariantIndexes,
    activeAudiences,
  };
}

function readNinetailedPreviewPanelOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const widget = document.querySelector<HTMLElement>(NT_PREVIEW_WIDGET_SELECTOR);
  if (!widget) return false;
  return (
    widget.style.transform === 'translate(0px, 0px)' ||
    widget.style.height === '100vh' ||
    widget.style.bottom === '0px'
  );
}

function afterPreviewPanelApiCall(publish: (forcedOpen?: boolean) => void): void {
  window.setTimeout(() => publish(), 0);
  window.setTimeout(() => publish(), 750);
}

function patchNinetailedPreviewPanelWindowApi(publish: (forcedOpen?: boolean) => void): void {
  const api = readPreviewPluginsWindowApi();
  if (!api) return;
  api.__ntPanelStatePublish = publish;
  if (api.__ntPanelStatePatched) return;

  const open = api.open?.bind(api);
  const close = api.close?.bind(api);
  const toggle = api.toggle?.bind(api);

  if (open) {
    api.open = () => {
      api.__ntPanelStatePublish?.(true);
      open();
      if (api.__ntPanelStatePublish) {
        afterPreviewPanelApiCall(api.__ntPanelStatePublish);
      }
    };
  }
  if (close) {
    api.close = () => {
      api.__ntPanelStatePublish?.(false);
      close();
      if (api.__ntPanelStatePublish) {
        afterPreviewPanelApiCall(api.__ntPanelStatePublish);
      }
    };
  }
  if (toggle) {
    api.toggle = () => {
      api.__ntPanelStatePublish?.(!readNinetailedPreviewPanelOpen());
      toggle();
      if (api.__ntPanelStatePublish) {
        afterPreviewPanelApiCall(api.__ntPanelStatePublish);
      }
    };
  }
  api.__ntPanelStatePatched = true;
}

function normalizeAudienceIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => (typeof id === 'string' ? id.trim() : '')).filter(Boolean);
}

function canonicalizePreviewAudienceIds(
  ids: unknown,
  previewAudiences: NinetailedPreviewAudience[],
): string[] {
  const canonical = new Map<string, string>();
  for (const audience of previewAudiences) {
    const id = audience.id.trim();
    if (!id) continue;
    canonical.set(id, id);
    if (audience.contentfulEntryId?.trim()) {
      canonical.set(audience.contentfulEntryId.trim(), id);
    }
  }
  return normalizeAudienceIds(ids).map(id => canonical.get(id) ?? id);
}

/**
 * The Contentful editor draws inspector outlines in the parent frame from the
 * rectangles reported by this iframe. While Ninetailed's preview panel is open,
 * remove inspector attributes from the page so those parent-frame rectangles
 * cannot sit on top of the personalization UI.
 */
function NinetailedPreviewPanelStateBridge({ preview }: { preview: boolean }) {
  const setInspectorSuppressed = useSetContentfulInspectorSuppressed();
  const lastOpenRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!preview || typeof window === 'undefined') {
      setInspectorSuppressed(false);
      return;
    }

    let widgetObserver: MutationObserver | null = null;
    let observedWidget: HTMLElement | null = null;

    const publish = (forcedOpen?: boolean) => {
      const isOpen =
        typeof forcedOpen === 'boolean' ? forcedOpen : readNinetailedPreviewPanelOpen();
      if (lastOpenRef.current === isOpen) return;
      lastOpenRef.current = isOpen;
      document.documentElement.toggleAttribute('data-nt-preview-panel-open', isOpen);
      setInspectorSuppressed(isOpen);
      ntPreviewDebug('personalization preview panel state', { open: isOpen });
    };

    const attachWidgetObserver = () => {
      patchNinetailedPreviewPanelWindowApi(publish);
      const widget = document.querySelector<HTMLElement>(NT_PREVIEW_WIDGET_SELECTOR);
      if (widget !== observedWidget) {
        widgetObserver?.disconnect();
        observedWidget = widget;
        if (widget) {
          widgetObserver = new MutationObserver(() => publish());
          widgetObserver.observe(widget, {
            attributes: true,
            attributeFilter: ['class', 'style'],
          });
        }
      }
      publish();
    };

    const bodyObserver = new MutationObserver(attachWidgetObserver);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    const pollId = window.setInterval(attachWidgetObserver, 500);
    attachWidgetObserver();

    return () => {
      const api = readPreviewPluginsWindowApi();
      if (api?.__ntPanelStatePublish === publish) {
        delete api.__ntPanelStatePublish;
      }
      window.clearInterval(pollId);
      bodyObserver.disconnect();
      widgetObserver?.disconnect();
      observedWidget = null;
      lastOpenRef.current = null;
      document.documentElement.removeAttribute('data-nt-preview-panel-open');
      setInspectorSuppressed(false);
    };
  }, [preview, setInspectorSuppressed]);

  return null;
}

/**
 * The preview plugin's green "current visitor audience" marker is fed by
 * `pluginApi.apiAudiences`, which comes from the SDK profile, not from manual
 * audience overrides. The plugin is loaded dynamically, so trigger one preview-
 * only page refresh after its window API exists to guarantee it sees the latest
 * `profile.audiences` payload.
 */
function NinetailedPreviewAudienceProfileBridge({
  preview,
  previewPluginReady,
  previewPlugin,
  previewAudiences,
}: {
  preview: boolean;
  previewPluginReady: boolean;
  previewPlugin: NinetailedPlugin | null;
  previewAudiences: NinetailedPreviewAudience[];
}) {
  const ninetailed = useNinetailed();
  const { profile } = useProfile();
  const refreshedRef = useRef(false);
  const debugSigRef = useRef<string | null>(null);
  const syncedSigRef = useRef<string | null>(null);

  useEffect(() => {
    if (!preview || !previewPluginReady || refreshedRef.current || typeof window === 'undefined')
      return;
    let cancelled = false;
    let pollId: number | null = null;

    const refreshWhenPluginMounted = () => {
      if (cancelled || refreshedRef.current) return;
      if (!readPreviewPluginsWindowSnapshot()) return;
      refreshedRef.current = true;
      if (pollId !== null) {
        window.clearInterval(pollId);
        pollId = null;
      }
      ntPreviewDebug(
        'refreshing profile after preview plugin mount for natural audience indicators',
      );
      void ninetailed.page().catch(err => {
        ntPreviewDebug('profile refresh after preview plugin mount failed', err);
      });
    };

    pollId = window.setInterval(refreshWhenPluginMounted, 100);
    refreshWhenPluginMounted();

    return () => {
      cancelled = true;
      if (pollId !== null) window.clearInterval(pollId);
    };
  }, [preview, previewPluginReady, ninetailed]);

  useEffect(() => {
    if (!preview || !previewPluginReady || !previewPlugin || !profile) return;
    const profileAudienceIds = canonicalizePreviewAudienceIds(profile.audiences, previewAudiences);
    const sig = JSON.stringify({
      profile: [...profileAudienceIds].sort(),
      pluginReady: previewPluginReady,
    });
    if (sig === syncedSigRef.current) return;
    syncedSigRef.current = sig;

    const plugin = previewPlugin as PreviewPluginProfileSync;
    if (typeof plugin.onProfileChange === 'function') {
      plugin.onProfileChange({ ...profile, audiences: profileAudienceIds }, []);
    }
  }, [preview, previewPluginReady, previewPlugin, profile, previewAudiences]);

  useEffect(() => {
    if (!preview || !isNinetailedPreviewDebug()) return;
    const profileAudienceIds = normalizeAudienceIds(profile?.audiences);
    const canonicalProfileAudienceIds = canonicalizePreviewAudienceIds(
      profile?.audiences,
      previewAudiences,
    );
    const catalogAudienceIds = previewAudiences
      .map(a => a.id.trim())
      .filter(Boolean)
      .sort();
    const catalogSet = new Set(catalogAudienceIds);
    const matchedCatalogAudienceIds = canonicalProfileAudienceIds
      .filter(id => catalogSet.has(id))
      .sort();
    const profileAudienceIdsMissingFromCatalog = canonicalProfileAudienceIds
      .filter(id => !catalogSet.has(id))
      .sort();
    const sig = JSON.stringify({
      p: [...profileAudienceIds].sort(),
      cp: [...canonicalProfileAudienceIds].sort(),
      c: catalogAudienceIds,
    });
    if (sig === debugSigRef.current) return;
    debugSigRef.current = sig;
    ntPreviewDebug('profile audiences for preview plugin', {
      profileAudienceIds,
      canonicalProfileAudienceIds,
      matchedCatalogAudienceIds,
      profileAudienceIdsMissingFromCatalog,
      catalogAudienceIds,
    });
  }, [preview, profile?.audiences, previewAudiences]);

  return null;
}

/**
 * Logs when `window.ninetailed.plugins.preview` **effective** selection changes
 * (`experienceVariantIndexes`, `activeAudiences`). Uses SDK hooks plus polling
 * because `onChangesChange` often skips when `profile.changes` is empty.
 */
function NinetailedPreviewDebugBridge({ preview }: { preview: boolean }) {
  const ninetailed = useNinetailed();
  const apiReadyLogged = useRef(false);
  const missingLogged = useRef(false);
  const prevSig = useRef<string | null>(null);

  useEffect(() => {
    if (!preview || !isNinetailedPreviewDebug()) return;
    apiReadyLogged.current = false;
    missingLogged.current = false;
    prevSig.current = null;

    const flush = () => {
      const snap = readPreviewPluginsWindowSnapshot();
      if (!snap) {
        if (!missingLogged.current) {
          missingLogged.current = true;
          ntPreviewDebug(
            'no `window.ninetailed.plugins.preview` yet — personalization preview only mounts in Contentful draft/preview (`isContentfulPreview`).',
          );
        }
        return;
      }
      if (!apiReadyLogged.current) {
        apiReadyLogged.current = true;
        const p = (window as Window & { ninetailed?: { plugins?: { preview?: object } } })
          .ninetailed?.plugins?.preview;
        ntPreviewDebug('plugins.preview API ready', {
          version: snap.version,
          isOpen: snap.isOpen,
          windowApiKeys: p && typeof p === 'object' ? Object.keys(p) : [],
        });
      }
      const sig = JSON.stringify({
        v: snap.experienceVariantIndexes,
        a: [...snap.activeAudiences].sort(),
      });
      if (prevSig.current === sig) return;
      const wasPrimed = prevSig.current !== null;
      prevSig.current = sig;
      if (!wasPrimed) {
        ntPreviewDebug('preview plugin state (initial)', snap);
        return;
      }
      ntPreviewDebug('preview plugin state (changed)', snap);
    };

    const unsubChanges = ninetailed.onChangesChange(() => {
      flush();
    });
    const unsubProfile = ninetailed.onProfileChange(() => {
      flush();
    });
    const pollMs = 350;
    const pollId = window.setInterval(flush, pollMs);
    queueMicrotask(flush);

    return () => {
      unsubChanges();
      unsubProfile();
      window.clearInterval(pollId);
      apiReadyLogged.current = false;
      missingLogged.current = false;
      prevSig.current = null;
    };
  }, [preview, ninetailed]);

  return null;
}

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
  const lastCatalogSig = useRef<string>('');

  useEffect(() => {
    if (!preview || !clientId || previewPluginCtor) return;
    let cancelled = false;
    ntPreviewDebug('starting dynamic import of preview plugin');
    void import('@ninetailed/experience.js-plugin-preview')
      .then(mod => {
        if (cancelled) return;
        ntPreviewDebug('dynamic import finished; registering NinetailedPreviewPlugin ctor');
        setPreviewPluginCtor(() => mod.NinetailedPreviewPlugin as unknown as PreviewPluginCtor);
      })
      .catch(err => {
        if (cancelled) return;
        ntPreviewDebug('dynamic import failed — preview panel unavailable', err);
      });
    return () => {
      cancelled = true;
    };
  }, [preview, clientId, previewPluginCtor]);

  useEffect(() => {
    if (!preview) return;
    const sig = JSON.stringify({
      e: previewExperiences.map(x => x.id),
      a: previewAudiences.map(x => x.id),
      esr: experienceVariantsMap,
    });
    if (sig === lastCatalogSig.current) return;
    lastCatalogSig.current = sig;
    ntPreviewDebug('server props → preview plugin catalog', {
      experienceCount: previewExperiences.length,
      audienceCount: previewAudiences.length,
      experienceIds: previewExperiences.map(e => e.id),
      audienceIds: previewAudiences.map(a => a.id),
      experienceSummaries: previewExperiences.map(e => ({ id: e.id, name: e.name, type: e.type })),
      audienceSummaries: previewAudiences.map(a => ({ id: a.id, name: a.name })),
      experienceVariantsMap,
    });
  }, [preview, previewExperiences, previewAudiences, experienceVariantsMap]);

  const previewPlugin = useMemo<NinetailedPlugin | null>(() => {
    if (!preview || !previewPluginCtor) return null;
    ntPreviewDebug('constructing NinetailedPreviewPlugin instance', {
      experiences: previewExperiences.length,
      audiences: previewAudiences.length,
    });
    return new previewPluginCtor({
      experiences: previewExperiences,
      audiences: previewAudiences,
      ui: { opener: { hide: true } },
      onOpenAudienceEditor: openAudienceInContentful,
      onOpenExperienceEditor: openExperienceInContentful,
    });
  }, [preview, previewPluginCtor, previewExperiences, previewAudiences]);

  const plugins = useMemo<NinetailedPlugin[]>(() => {
    const list: NinetailedPlugin[] = [
      new NinetailedInsightsPlugin(),
      new NinetailedPrivacyPlugin(
        { allowedEvents: PRE_CONSENT_ALLOWED },
        { allowedEvents: POST_CONSENT_ALLOWED },
      ),
    ];
    if (previewPlugin) {
      list.push(previewPlugin);
    }
    return list;
  }, [previewPlugin]);

  const privacyPlugin =
    plugins.find((p): p is NinetailedPrivacyPlugin => p instanceof NinetailedPrivacyPlugin) ?? null;

  if (!clientId) {
    return <>{children}</>;
  }

  const providerKey = `${clientId}:${preview ? 'pv' : 'pd'}:${preview ? Number(Boolean(previewPluginCtor)) : 0}`;

  return (
    <ESRProvider experienceVariantsMap={experienceVariantsMap}>
      <NinetailedProvider
        key={providerKey}
        clientId={clientId}
        environment={environment}
        locale={locale as NtLocale | undefined}
        preview={preview}
        plugins={plugins}
        useSDKEvaluation={preview}
        onInitProfileId={profileIdFromSdk => readAnonymousIdFromCookie() ?? profileIdFromSdk}
      >
        {preview ? <NinetailedPreviewPanelStateBridge preview={preview} /> : null}
        {preview ? (
          <NinetailedPreviewAudienceProfileBridge
            preview={preview}
            previewPluginReady={Boolean(previewPluginCtor)}
            previewPlugin={previewPlugin}
            previewAudiences={previewAudiences}
          />
        ) : null}
        {preview && isNinetailedPreviewDebug() ? (
          <NinetailedPreviewDebugBridge preview={preview} />
        ) : null}
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
  const personalizationActive = Boolean(readPublicClientId());
  return (
    <ConsentProvider personalizationActive={personalizationActive} contentfulPreview={preview}>
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
