'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { SITE_COLOR_SCHEME_STORAGE_KEY } from '@/lib/theme/site-theme';

type Scheme = 'light' | 'dark';

function readResolvedScheme(): Scheme {
  if (typeof document === 'undefined') return 'light';
  const stored = localStorage.getItem(SITE_COLOR_SCHEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function SunGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93ZM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121Zm2.121-14.85 1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121ZM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121ZM21 11v2h-3v-2h3ZM4 11v2H1v-2h3Z"
      />
    </svg>
  );
}

function MoonGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 7a7 7 0 0 0 10.906 7.323A8 8 0 1 1 10 7Zm2 1.045a6 6 0 1 0 7.813 7.909 8.028 8.028 0 0 1-7.813-7.909Z"
      />
    </svg>
  );
}

export function SiteThemeToggle({ className }: { className?: string }) {
  const [scheme, setScheme] = useState<Scheme>('light');

  useEffect(() => {
    queueMicrotask(() => setScheme(readResolvedScheme()));
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const stored = localStorage.getItem(SITE_COLOR_SCHEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return;
      document.documentElement.dataset.colorScheme = mq.matches ? 'dark' : 'light';
      setScheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Scheme = scheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(SITE_COLOR_SCHEME_STORAGE_KEY, next);
    document.documentElement.dataset.colorScheme = next;
    setScheme(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={scheme === 'dark'}
      aria-label={scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
      className={clsx(
        'relative inline-flex h-[3rem] w-[5.8rem] shrink-0 cursor-pointer rounded-full border border-[color-mix(in_srgb,var(--site-text)_20%,transparent)] bg-[color-mix(in_srgb,var(--site-text)_8%,transparent)] text-[var(--site-text)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] transition-[border-color,background-color] hover:border-[color-mix(in_srgb,var(--site-text)_32%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--site-text)_45%,transparent)]',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[9px] opacity-[0.36]" aria-hidden>
        <SunGlyph />
        <MoonGlyph />
      </span>
      <span
        aria-hidden
        className={clsx(
          'absolute top-[3px] z-[1] flex h-[2.4rem] w-[2.4rem] items-center justify-center rounded-full bg-[var(--site-bg)] text-[var(--site-text)] shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-[left] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]',
          scheme === 'light' ? 'left-[3px]' : 'left-[calc(100%-2.4rem-3px)]',
        )}
      >
        {scheme === 'light' ? <SunGlyph className="opacity-95" /> : <MoonGlyph className="opacity-95" />}
      </span>
    </button>
  );
}
