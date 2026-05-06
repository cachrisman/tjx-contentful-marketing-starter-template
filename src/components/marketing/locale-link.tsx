import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { pagePath, withLocalePath } from '@/lib/routing';

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
  className,
  children,
  ...rest
}: {
  locale: Locale;
  slug?: string | null;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link href={pagePath(locale, slug)} className={className} {...rest}>
      {children}
    </Link>
  );
}
