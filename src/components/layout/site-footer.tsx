import { LocaleLink } from '@/components/marketing/locale-link';
import { PublicSvgImage } from '@/components/ui/public-svg-image';
import type { CtfFooterQuery } from '@/lib/contentful/graphql/ctf-footer.generated';
import type { Locale } from '@/lib/i18n/config';
import { resolveColumnTitleLinkRow } from '@/lib/navigation/column-title-link';
import { hrefForPageSlug, pagePath } from '@/lib/routing';

const footerMainClass =
  'bg-[color-mix(in_srgb,var(--site-text)_8%,var(--site-bg))] pb-8 pt-12 text-[var(--site-text)] sm:pb-12 sm:pt-24';

const footerLegalClass =
  'bg-[color-mix(in_srgb,var(--site-text)_88%,var(--site-bg))] px-6 py-12 text-[color-mix(in_srgb,var(--site-bg)_82%,var(--site-text))] md:px-12';

const linkSubtleClass =
  'inline-block border-b border-transparent text-[1.8rem] text-[color-mix(in_srgb,var(--site-text)_78%,var(--site-bg))] transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]';

export function SiteFooter({
  locale,
  footer,
}: {
  locale: Locale;
  footer: CtfFooterQuery['footerMenuCollection'];
}) {
  const menu = footer?.items?.[0];
  if (!menu) return null;

  const columns = menu.footerColumnsCollection?.items?.filter(Boolean) ?? [];
  const legal = menu.legalLinks?.featuredPagesCollection?.items?.filter(Boolean) ?? [];

  return (
    <>
      <footer className={footerMainClass}>
        <div className="mx-auto flex max-w-[126rem] flex-wrap px-6 md:px-12">
          <div className="flex flex-1 flex-wrap gap-y-8">
            {columns.map(col =>
              col ? (
                <div key={col.sys.id} className="min-w-[17.2rem] pl-6 md:pl-10">
                  <p className="mb-2 text-[1.8rem] font-semibold leading-snug md:mb-4">{col.heading}</p>
                  {(() => {
                    const row = resolveColumnTitleLinkRow(col.columnTitleLink ?? null);
                    return row ? (
                      <LocaleLink
                        locale={locale}
                        href={hrefForPageSlug(row.slug)}
                        className="mb-4 block text-[1.6rem] font-normal underline decoration-[var(--site-accent)] underline-offset-4 transition-colors hover:text-[var(--site-accent)]"
                      >
                        {row.label}
                      </LocaleLink>
                    ) : null;
                  })()}
                  <ul className="list-none space-y-4 p-0 md:space-y-8">
                    {col.linksCollection?.items?.map(
                      p =>
                        p &&
                        p.slug && (
                          <li key={p.sys.id}>
                            <LocaleLink locale={locale} href={hrefForPageSlug(p.slug)} className={linkSubtleClass}>
                              {p.pageName}
                            </LocaleLink>
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              ) : null,
            )}
          </div>

          <div className="mt-10 flex flex-col gap-4 md:ml-auto md:mt-0">
            <p className="text-[1.8rem] font-semibold">Find us on</p>
            <ul className="flex list-none gap-4 p-0">
              {menu.twitterLink ? (
                <li>
                  <a href={menu.twitterLink} className="text-[var(--site-text)]" aria-label="Twitter">
                    𝕏
                  </a>
                </li>
              ) : null}
              {menu.facebookLink ? (
                <li>
                  <a href={menu.facebookLink} className="text-[var(--site-text)]" aria-label="Facebook">
                    f
                  </a>
                </li>
              ) : null}
              {menu.linkedinLink ? (
                <li>
                  <a href={menu.linkedinLink} className="text-[var(--site-text)]" aria-label="LinkedIn">
                    in
                  </a>
                </li>
              ) : null}
              {menu.instagramLink ? (
                <li>
                  <a href={menu.instagramLink} className="text-[var(--site-text)]" aria-label="Instagram">
                    ◎
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </footer>

      <div className={footerLegalClass}>
        <div className="mx-auto flex max-w-[126rem] flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <LocaleLink locale={locale} href={pagePath(locale)} className="inline-block brightness-[1.15]">
            <PublicSvgImage
              src="/logo-tagline.svg"
              alt="Logo"
              width={113}
              height={48}
              className="max-w-full"
              style={{ width: '113px', height: 'auto' }}
            />
          </LocaleLink>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-8 gap-y-4">
            {legal.map(p =>
              p && p.slug ? (
                <LocaleLink
                  key={p.sys.id}
                  locale={locale}
                  href={hrefForPageSlug(p.slug)}
                  className="text-[1.8rem] text-[color-mix(in_srgb,var(--site-bg)_70%,var(--site-text))] underline-offset-4 hover:underline"
                >
                  {p.pageName}
                </LocaleLink>
              ) : null,
            )}
          </nav>
          <p className="text-[1.8rem] text-[color-mix(in_srgb,var(--site-bg)_65%,var(--site-text))]">
            © Copyright {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
