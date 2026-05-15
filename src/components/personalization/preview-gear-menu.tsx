'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { localeSlugKeyFromPathname } from '@/lib/routing';

type NinetailedWindow = Window & {
  ninetailed?: {
    plugins?: {
      preview?: {
        open?: () => void;
      };
    };
  };
};

function draftEnableHref(segments: { locale: string; slugKey: string }): string {
  const q = new URLSearchParams();
  q.set('locale', segments.locale);
  if (segments.slugKey !== 'home') q.set('slug', segments.slugKey);
  return `/api/draft/enable?${q.toString()}`;
}

function draftDisableHref(segments: { locale: string; slugKey: string }): string {
  const q = new URLSearchParams();
  q.set('locale', segments.locale);
  if (segments.slugKey !== 'home') q.set('slug', segments.slugKey);
  return `/api/draft/disable?${q.toString()}`;
}

function tryOpenNinetailedPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const open = (window as NinetailedWindow).ninetailed?.plugins?.preview?.open;
  if (typeof open === 'function') {
    open();
    return true;
  }
  return false;
}

/**
 * POC preview toolbar: always visible. Menu includes:
 * - **Draft (Preview API)** — navigates to `/api/draft/enable` or `/api/draft/disable` for the
 *   current locale/slug when `CONTENTFUL_POC_PREVIEW_TOGGLE=1` (enable without secret) or when
 *   already in draft mode (disable always works).
 * - **Personalization preview** — `window.ninetailed.plugins.preview.open()` when the plugin is mounted.
 */
export function PreviewGearMenu({
  serverPreview,
  pocPreviewToggle,
}: {
  serverPreview: boolean;
  /** Server env `CONTENTFUL_POC_PREVIEW_TOGGLE=1` — allows gear-initiated draft enable without `secret`. */
  pocPreviewToggle: boolean;
}) {
  const menuId = useId();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<number | null>(null);

  const segments = useMemo(() => localeSlugKeyFromPathname(pathname), [pathname]);

  const draftDataHref = useMemo(() => {
    if (!segments) return null;
    return serverPreview ? draftDisableHref(segments) : draftEnableHref(segments);
  }, [segments, serverPreview]);

  const draftDataDisabled =
    !segments || (!serverPreview && !pocPreviewToggle);

  const draftDataTitle = (() => {
    if (!segments) return 'Open a localized page to toggle draft mode.';
    if (!serverPreview && !pocPreviewToggle) {
      return 'Set CONTENTFUL_POC_PREVIEW_TOGGLE=1 for one-click draft from the gear, or enable preview from Contentful with your preview secret.';
    }
    return undefined;
  })();

  useEffect(
    () => () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  const openPersonalizationPreview = useCallback(() => {
    if (tryOpenNinetailedPreview()) return;
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    let attempt = 0;
    const max = 40;
    pollRef.current = window.setInterval(() => {
      attempt += 1;
      if (tryOpenNinetailedPreview() || attempt >= max) {
        if (pollRef.current !== null) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 80);
  }, []);

  const onDraftDataClick = () => {
    if (draftDataDisabled || !draftDataHref) return;
    window.location.assign(draftDataHref);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="nt-preview-gear inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--site-text)_22%,transparent)] bg-[color-mix(in_srgb,var(--site-text)_6%,var(--site-bg))] text-(--site-text) shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-[border-color,background-color,transform] hover:border-[color-mix(in_srgb,var(--site-text)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--site-text)_10%,var(--site-bg))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--site-text)_45%,transparent)] active:scale-[0.97]"
        aria-label="Preview tools"
        title="Preview tools"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen(v => !v)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Preview tools"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[200] min-w-[18.5rem] rounded-xl border border-[color-mix(in_srgb,var(--site-text)_18%,transparent)] bg-[var(--site-bg)] py-1.5 text-[var(--site-text)] shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={draftDataDisabled}
            title={draftDataTitle}
            className="flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left text-[1.35rem] transition-colors enabled:cursor-pointer enabled:hover:bg-[color-mix(in_srgb,var(--site-text)_8%,var(--site-bg))] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              onDraftDataClick();
            }}
          >
            <span className="min-w-0 leading-snug">
              <span className="block font-semibold">Draft content (Preview API)</span>
              <span className="mt-0.5 block text-[1.15rem] font-normal text-[color-mix(in_srgb,var(--site-text)_72%,var(--site-bg))]">
                {serverPreview ? 'Switch to delivery' : 'Load draft for this page'}
              </span>
            </span>
            <span
              className={clsx(
                'shrink-0 rounded-full border px-2.5 py-0.5 text-[1.1rem] font-semibold tabular-nums',
                serverPreview
                  ? 'border-[color-mix(in_srgb,var(--site-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--site-accent)_14%,var(--site-bg))] text-[var(--site-accent)]'
                  : 'border-[color-mix(in_srgb,var(--site-text)_22%,transparent)] bg-[color-mix(in_srgb,var(--site-text)_6%,var(--site-bg))]',
              )}
            >
              {serverPreview ? 'Preview' : 'Delivery'}
            </span>
          </button>

          <div className="mx-3 my-1 h-px bg-[color-mix(in_srgb,var(--site-text)_12%,transparent)]" />

          <button
            type="button"
            role="menuitem"
            disabled={!serverPreview}
            title={
              !serverPreview
                ? 'Personalization preview is available when draft / preview mode is on.'
                : undefined
            }
            className="flex w-full flex-col items-start gap-0.5 px-3.5 py-2.5 text-left text-[1.35rem] transition-colors enabled:cursor-pointer enabled:hover:bg-[color-mix(in_srgb,var(--site-text)_8%,var(--site-bg))] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              if (!serverPreview) return;
              openPersonalizationPreview();
              setOpen(false);
            }}
          >
            <span className="font-semibold leading-snug">Personalization preview</span>
            <span className="text-[1.15rem] font-normal leading-snug text-[color-mix(in_srgb,var(--site-text)_72%,var(--site-bg))]">
              Ninetailed experience panel
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
