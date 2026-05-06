'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { LocaleLink } from '@/components/marketing/locale-link';
import type { Locale } from '@/lib/i18n/config';
import type { CtfNavigationQuery } from '@/lib/contentful/graphql/ctf-navigation.generated';
import { hrefForPageSlug, pagePath } from '@/lib/routing';

export function SiteHeader({
  locale,
  navigation,
}: {
  locale: Locale;
  navigation: CtfNavigationQuery['navigationMenuCollection'];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const navRoot = navigation?.items?.[0];
  const groups = navRoot?.menuItemsCollection?.items?.filter(Boolean) ?? [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-[0_2px_6px_#00000021]">
        <div className="mx-auto flex h-20 max-w-[126rem] items-center justify-between px-6 md:h-[9rem] md:px-12">
          <LocaleLink locale={locale} href="/" title="Homepage" className="block w-[113px] shrink-0">
            <Image
              src="/colorful-coin-logo.svg"
              alt=""
              width={113}
              height={48}
              className="h-auto w-full"
              priority
            />
          </LocaleLink>

          <nav className="hidden md:block" aria-label="Primary">
            <ul className="m-0 flex list-none items-center p-0">
              {groups.map(g =>
                g ? (
                  <li
                    key={g.sys.id}
                    className="group relative mr-16 flex h-[9rem] items-center text-[1.7rem] font-normal last:mr-0 lg:mr-24"
                  >
                    {!g.link ? (
                      <span>{g.groupName}</span>
                    ) : (
                      <LocaleLink
                        locale={locale}
                        href={hrefForPageSlug(g.link.slug)}
                        className="inline-block transition-transform duration-200 ease-in-out group-hover:-translate-y-1"
                      >
                        {g.groupName}
                      </LocaleLink>
                    )}
                    {!g.link && g.children?.items && g.children.items.length > 0 && (
                      <ul className="pointer-events-none absolute left-0 top-[calc(100%-2rem)] z-20 min-w-[18rem] translate-y-[20%] rounded-[14px] bg-white py-4 pl-10 pr-10 opacity-0 shadow-[0_3px_6px_#00000029] transition-all duration-300 ease-in-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                        {g.children.items.map(
                          p =>
                            p && (
                              <li key={p.sys.id} className="my-2">
                                <LocaleLink
                                  locale={locale}
                                  href={hrefForPageSlug(p.slug)}
                                  className="inline-block transition-transform duration-200 ease-in-out hover:-translate-y-1"
                                >
                                  {p.pageName}
                                </LocaleLink>
                              </li>
                            ),
                        )}
                      </ul>
                    )}
                  </li>
                ) : null,
              )}
            </ul>
          </nav>

          <button
            type="button"
            className="inline-flex md:hidden"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            title="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <dialog open className="fixed inset-0 z-50 m-0 flex max-h-none max-w-none flex-col bg-white p-0">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <LocaleLink locale={locale} href="/" onClick={() => setOpen(false)}>
              <Image src="/colorful-coin-logo.svg" alt="" width={113} height={48} />
            </LocaleLink>
            <button type="button" className="text-[2rem]" onClick={() => setOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-8" id="mobile-menu" aria-label="Mobile">
            <ul className="space-y-6 text-[2rem]">
              {groups.map(g =>
                g ? (
                  <li key={g.sys.id}>
                    {g.link ? (
                      <LocaleLink
                        locale={locale}
                        href={hrefForPageSlug(g.link.slug)}
                        onClick={() => setOpen(false)}
                      >
                        {g.groupName}
                      </LocaleLink>
                    ) : (
                      <span className="font-semibold">{g.groupName}</span>
                    )}
                    {g.children?.items && (
                      <ul className="mt-4 space-y-3 pl-4 text-[1.8rem]">
                        {g.children.items.map(
                          p =>
                            p && (
                              <li key={p.sys.id}>
                                <LocaleLink
                                  locale={locale}
                                  href={hrefForPageSlug(p.slug)}
                                  onClick={() => setOpen(false)}
                                >
                                  {p.pageName}
                                </LocaleLink>
                              </li>
                            ),
                        )}
                      </ul>
                    )}
                  </li>
                ) : null,
              )}
              <li>
                <LocaleLink locale={locale} href={pagePath(locale)} onClick={() => setOpen(false)}>
                  Home
                </LocaleLink>
              </li>
            </ul>
          </nav>
        </dialog>
      )}
    </>
  );
}
