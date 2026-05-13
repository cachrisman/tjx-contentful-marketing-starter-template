'use client';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { NT_INITIAL_PAGE_HANDLED_COOKIE } from '@/lib/personalization/config';

/** Marketing / attribution params only — avoids `page()` spam from unrelated query toggles. */
const PAGE_ROUTE_QUERY_ALLOWLIST = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
]);

let didConsumeInitialSentinel = false;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function clearSentinelCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${NT_INITIAL_PAGE_HANDLED_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function allowlistedSearch(searchParams: ReturnType<typeof useSearchParams> | null): string {
  if (!searchParams) return '';
  const parts: string[] = [];
  const keys = Array.from(searchParams.keys()).sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    if (!PAGE_ROUTE_QUERY_ALLOWLIST.has(key)) continue;
    const raw = searchParams.get(key);
    if (raw == null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(raw)}`);
  }
  return parts.join('&');
}

/**
 * Calls `ninetailed.page()` on route changes after hydration.
 */
export function NinetailedTrackPages() {
  const ninetailed = useNinetailed();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const search = allowlistedSearch(searchParams);
    const routeKey = `${pathname ?? ''}?${search}`;

    if (lastKeyRef.current === routeKey) {
      return;
    }
    const isInitial = lastKeyRef.current === null;
    lastKeyRef.current = routeKey;

    if (isInitial && !didConsumeInitialSentinel) {
      const hasSentinel = readCookie(NT_INITIAL_PAGE_HANDLED_COOKIE) === '1';
      if (hasSentinel) {
        didConsumeInitialSentinel = true;
        clearSentinelCookie();
        return;
      }
      didConsumeInitialSentinel = true;
    }

    void ninetailed.page().catch(() => {
      /* network / consent block — swallow */
    });
  }, [ninetailed, pathname, searchParams]);

  return null;
}
