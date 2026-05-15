'use client';

import { useEffect, useRef } from 'react';

import { useConsent } from '@/components/personalization/consent-context';

/**
 * First-visit consent for Contentful Personalization + Privacy plugin.
 *
 * Uses the native `<dialog>` API (`showModal`) for an accessible modal:
 * top layer, focus trap, and `aria-modal` without extra dependencies.
 * Escape does not dismiss the dialog — users choose Accept or Decline
 * (common pattern when consent must be explicit).
 */
export function NinetailedConsentDialog() {
  const { consentUiReady, showConsentDialog, setConsent } = useConsent();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!consentUiReady || !el) return;
    if (showConsentDialog) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [consentUiReady, showConsentDialog]);

  if (!consentUiReady) {
    return null;
  }

  return (
    <dialog
      ref={ref}
      className="fixed inset-0 m-auto w-[calc(100%-2.4rem)] max-w-3xl rounded-xl border border-[color-mix(in_srgb,var(--site-text)_18%,transparent)] bg-(--site-bg) p-[2.4rem] text-[1.6rem] leading-snug text-(--site-text) shadow-2xl backdrop:bg-black/45"
      aria-labelledby="nt-consent-title"
      aria-describedby="nt-consent-desc"
      onCancel={event => {
        event.preventDefault();
      }}
    >
      <h2 id="nt-consent-title" className="text-[2rem] font-semibold tracking-tight">
        Analytics & personalization
      </h2>
      <p id="nt-consent-desc" className="mt-[1.2rem] text-[color-mix(in_srgb,var(--site-text)_88%,transparent)]">
        We use Contentful Personalization to tailor content and measure performance. You can accept
        optional analytics and personalization events, or continue with essential functionality only.
      </p>
      <div className="mt-[2.4rem] flex flex-wrap justify-end gap-4">
        <button
          type="button"
          className="min-h-[4.4rem] rounded-lg border border-[color-mix(in_srgb,var(--site-text)_22%,transparent)] bg-transparent px-[1.6rem] py-4 text-[1.5rem] font-medium text-(--site-text) hover:bg-[color-mix(in_srgb,var(--site-text)_6%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-accent)"
          onClick={() => {
            setConsent(false);
          }}
        >
          Essential only
        </button>
        <button
          type="button"
          className="min-h-[4.4rem] rounded-lg bg-(--site-accent) px-[1.6rem] py-4 text-[1.5rem] font-semibold text-(--site-bg) hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--site-text)"
          onClick={() => {
            setConsent(true);
          }}
        >
          Accept
        </button>
      </div>
    </dialog>
  );
}
