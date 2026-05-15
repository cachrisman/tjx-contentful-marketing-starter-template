'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from 'react';

import { NinetailedConsentDialog } from '@/components/personalization/ninetailed-consent-dialog';

/**
 * Consent state for the Ninetailed Privacy plugin + optional first-visit dialog.
 *
 * **Production:** Prefer a certified CMP (OneTrust, Cookiebot, etc.) and call
 * `setConsent` from its callbacks instead of (or in addition to) the built-in
 * dialog — keep the same storage key or map CMP categories into boolean consent.
 *
 * **This starter:** `NinetailedConsentDialog` blocks until Accept / Essential only,
 * then persists `__nt_poc_consent__` in `localStorage`. Values:
 * - `false` → pre-consent Privacy allowlist
 * - `true` → post-consent allowlist
 *
 * `NEXT_PUBLIC_NINETAILED_DEFAULT_CONSENT=1` skips the dialog and starts
 * consented (local dev only). Contentful draft/preview (`contentfulPreview`) also
 * starts consented + dismissed so the modal does not flash; `localStorage` can
 * still set essential-only (`0`).
 */
const CONSENT_STORAGE_KEY = '__nt_poc_consent__';

type ConsentContextValue = {
  consent: boolean;
  setConsent: (value: boolean) => void;
  /** Client has finished the initial `localStorage` / dev-skip branch. */
  consentUiReady: boolean;
  /** Show first-visit modal until the visitor calls `setConsent`. */
  showConsentDialog: boolean;
};

const ConsentContext = createContext<ConsentContextValue>({
  consent: false,
  setConsent: () => {},
  consentUiReady: false,
  showConsentDialog: false,
});

function readDefaultConsent(): boolean {
  return process.env.NEXT_PUBLIC_NINETAILED_DEFAULT_CONSENT === '1';
}

type ConsentBootstrap = {
  consent: boolean;
  consentUiReady: boolean;
  consentDialogDismissed: boolean;
};

/** SSR + first client frame before `localStorage` is read in `useEffect`. */
function getConsentBootstrapState(
  personalizationActive: boolean,
  contentfulPreview: boolean,
  defaultConsent: boolean,
): ConsentBootstrap {
  if (!personalizationActive) {
    return {
      consent: defaultConsent,
      consentUiReady: false,
      consentDialogDismissed: true,
    };
  }
  if (contentfulPreview) {
    return {
      consent: true,
      consentUiReady: true,
      consentDialogDismissed: true,
    };
  }
  if (defaultConsent) {
    return {
      consent: true,
      consentUiReady: true,
      consentDialogDismissed: true,
    };
  }
  return {
    consent: false,
    consentUiReady: false,
    consentDialogDismissed: false,
  };
}

export function ConsentProvider({
  children,
  personalizationActive = true,
  contentfulPreview = false,
}: {
  children: ReactNode;
  /** When false (no Ninetailed client id), consent UI is skipped; storage still applies if present. */
  personalizationActive?: boolean;
  /**
   * When true (Contentful draft / live preview), bootstrap as consented + dialog dismissed so
   * authors are not blocked and the modal does not flash before `localStorage` is applied.
   * A stored `__nt_poc_consent__=0` still wins in the effect.
   */
  contentfulPreview?: boolean;
}) {
  const defaultConsent = readDefaultConsent();
  const bootstrap = getConsentBootstrapState(personalizationActive, contentfulPreview, defaultConsent);
  const [consent, setConsentState] = useState(bootstrap.consent);
  const [consentUiReady, setConsentUiReady] = useState(bootstrap.consentUiReady);
  const [consentDialogDismissed, setConsentDialogDismissed] = useState(bootstrap.consentDialogDismissed);

  useEffect(() => {
    const applyInactive = () => {
      setConsentDialogDismissed(true);
    };
    startTransition(() => {
      try {
        const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!personalizationActive) {
          if (stored === '1') setConsentState(true);
          else if (stored === '0') setConsentState(false);
          else setConsentState(defaultConsent);
          applyInactive();
        } else if (stored === '1') {
          setConsentState(true);
          setConsentDialogDismissed(true);
        } else if (stored === '0') {
          setConsentState(false);
          setConsentDialogDismissed(true);
        } else if (defaultConsent) {
          setConsentState(true);
          setConsentDialogDismissed(true);
        } else if (contentfulPreview) {
          setConsentState(true);
          setConsentDialogDismissed(true);
        } else {
          setConsentState(false);
          setConsentDialogDismissed(false);
        }
      } catch {
        /* ignore — incognito / disabled storage */
        if (!personalizationActive) {
          setConsentState(defaultConsent);
          applyInactive();
        } else if (defaultConsent) {
          setConsentState(true);
          setConsentDialogDismissed(true);
        } else if (contentfulPreview) {
          setConsentState(true);
          setConsentDialogDismissed(true);
        } else {
          setConsentState(false);
          setConsentDialogDismissed(false);
        }
      }
      setConsentUiReady(true);
    });
  }, [personalizationActive, contentfulPreview, defaultConsent]);

  const setConsent = useCallback((value: boolean) => {
    setConsentState(value);
    setConsentDialogDismissed(true);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const showConsentDialog = consentUiReady && !consentDialogDismissed;

  const value = useMemo(
    () => ({ consent, setConsent, consentUiReady, showConsentDialog }),
    [consent, setConsent, consentUiReady, showConsentDialog],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <NinetailedConsentDialog />
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}
