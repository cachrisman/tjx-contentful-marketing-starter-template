import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { pagePathWithUrlParameters, withLocalePath } from '@/lib/routing';

export function LocaleLink({
  locale,
  href,
  className,
  children,
  ...rest
}: {
  locale: Locale;
  href: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  const full = href.startsWith('/')
    ? withLocalePath(locale, href === '/' ? '' : href)
    : withLocalePath(locale, href);

  return (
    <Link href={full} className={className} {...rest}>
      {children}
    </Link>
  );
}

export function LocalePageLink({
  locale,
  slug,
  urlParameters,
  className,
  children,
  ...rest
}: {
  locale: Locale;
  slug?: string | null;
  /** Optional query string from Contentful (e.g. `foo=1` or `?foo=1`). */
  urlParameters?: string | null;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link href={pagePathWithUrlParameters(locale, slug, urlParameters)} className={className} {...rest}>
      {children}
    </Link>
  );
}
