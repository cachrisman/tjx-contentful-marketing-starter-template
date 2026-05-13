'use client';

import { useCallback, useEffect, useRef } from 'react';

type NinetailedWindow = Window & {
  ninetailed?: {
    plugins?: {
      preview?: {
        open?: () => void;
      };
    };
  };
};

function tryOpenPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const open = (window as NinetailedWindow).ninetailed?.plugins?.preview?.open;
  if (typeof open === 'function') {
    open();
    return true;
  }
  return false;
}

/**
 * Fixed gear control shown only in Contentful draft / preview. The Ninetailed
 * Preview plugin keeps its default edge tab hidden (`ui.opener.hide`); this
 * button calls `window.ninetailed.plugins.preview.open()` after the plugin
 * finishes async init (brief retries cover the dynamic-import + remount gap).
 */
export function NinetailedPreviewGearButton() {
  const pollRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    },
    [],
  );

  const onClick = useCallback(() => {
    if (tryOpenPreview()) return;
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    let attempt = 0;
    const max = 40;
    pollRef.current = window.setInterval(() => {
      attempt += 1;
      if (tryOpenPreview() || attempt >= max) {
        if (pollRef.current !== null) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 80);
  }, []);

  return (
    <button
      type="button"
      className="nt-preview-gear inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--site-text)_22%,transparent)] bg-[color-mix(in_srgb,var(--site-text)_6%,var(--site-bg))] text-(--site-text) shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-[border-color,background-color,transform] hover:border-[color-mix(in_srgb,var(--site-text)_34%,transparent)] hover:bg-[color-mix(in_srgb,var(--site-text)_10%,var(--site-bg))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--site-text)_45%,transparent)] active:scale-[0.97]"
      aria-label="Open personalization preview"
      title="Personalization preview"
      onClick={onClick}
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
  );
}
