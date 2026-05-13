'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, startTransition, type ReactNode } from 'react';

/**
 * Minimal POC consent state.
 *
 * Real production sites should plug in a proper CMP (OneTrust, Cookiebot, etc.)
 * and call `setConsent` from the CMP event handlers. For this POC we accept
 * either `false` (pre-consent — Privacy plugin only allows `page` + `component`)
 * or `true` (post-consent — `page` + `track` + `component`).
 *
 * Default is read from `NEXT_PUBLIC_NINETAILED_DEFAULT_CONSENT` (`'1'` → post-consent
 * pre-grant for dev-only POC) and persisted in `localStorage` so subsequent visits
 * remember the choice. SSR returns the default to avoid a hydration mismatch.
 */
const CONSENT_STORAGE_KEY = '__nt_poc_consent__';

type ConsentContextValue = {
  consent: boolean;
  setConsent: (value: boolean) => void;
};

const ConsentContext = createContext<ConsentContextValue>({
  consent: false,
  setConsent: () => {},
});

function readDefaultConsent(): boolean {
  return process.env.NEXT_PUBLIC_NINETAILED_DEFAULT_CONSENT === '1';
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const defaultConsent = readDefaultConsent();
  const [consent, setConsentState] = useState<boolean>(defaultConsent);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      startTransition(() => {
        if (stored === '1') setConsentState(true);
        else if (stored === '0') setConsentState(false);
      });
    } catch {
      /* ignore — incognito / disabled storage */
    }
  }, []);

  const setConsent = useCallback((value: boolean) => {
    setConsentState(value);
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ consent, setConsent }), [consent, setConsent]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}
