import Image from 'next/image';

import { LocaleLink } from '@/components/marketing/locale-link';
import type { Locale } from '@/lib/i18n/config';
import type { CtfFooterQuery } from '@/lib/contentful/graphql/ctf-footer.generated';
import { hrefForPageSlug } from '@/lib/routing';

export function SiteFooter({
  locale,
  footer,
}: {
  locale: Locale;
  footer: CtfFooterQuery['footerMenuCollection'];
}) {
  const menu = footer?.items?.[0];
  if (!menu) return null;

  const columns = menu.menuItemsCollection?.items?.filter(Boolean) ?? [];
  const legal = menu.legalLinks?.featuredPagesCollection?.items?.filter(Boolean) ?? [];

  return (
    <>
      <footer className="bg-[#F4F4F4] pb-8 pt-12 sm:pb-12 sm:pt-24">
        <div className="mx-auto flex max-w-[126rem] flex-wrap px-6 md:px-12">
          <div className="flex flex-1 flex-wrap gap-y-8">
            {columns.map(col =>
              col ? (
                <div key={col.sys.id} className="min-w-[17.2rem] pl-6 md:pl-10">
                  <p className="mb-4 text-[1.8rem] font-normal leading-snug text-[#1B273A] md:mb-8">
                    {col.groupName}
                  </p>
                  <ul className="list-none space-y-4 p-0 md:space-y-8">
                    {col.featuredPagesCollection?.items?.map(p =>
                      p ? (
                        <li key={p.sys.id}>
                          <LocaleLink
                            locale={locale}
                            href={hrefForPageSlug(p.slug)}
                            className="inline-block border-b border-transparent text-[1.8rem] text-[#414D63] transition hover:border-[#7C7C7C]"
                          >
                            {p.pageName}
                          </LocaleLink>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              ) : null,
            )}
          </div>

          <div className="mt-10 flex flex-col gap-4 md:ml-auto md:mt-0">
            <p className="text-[1.8rem] font-semibold text-[#1B273A]">Find us on</p>
            <ul className="flex list-none gap-4 p-0">
              {menu.twitterLink ? (
                <li>
                  <a href={menu.twitterLink} className="text-[#1B273A]" aria-label="Twitter">
                    𝕏
                  </a>
                </li>
              ) : null}
              {menu.facebookLink ? (
                <li>
                  <a href={menu.facebookLink} className="text-[#1B273A]" aria-label="Facebook">
                    f
                  </a>
                </li>
              ) : null}
              {menu.linkedinLink ? (
                <li>
                  <a href={menu.linkedinLink} className="text-[#1B273A]" aria-label="LinkedIn">
                    in
                  </a>
                </li>
              ) : null}
              {menu.instagramLink ? (
                <li>
                  <a href={menu.instagramLink} className="text-[#1B273A]" aria-label="Instagram">
                    ◎
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </footer>

      <div className="bg-[#212121] px-6 py-12 text-white md:px-12">
        <div className="mx-auto flex max-w-[126rem] flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <LocaleLink locale={locale} href="/" className="inline-block">
            <Image
              src="/logo-tagline.svg"
              alt="Logo"
              width={113}
              height={48}
              className="h-auto w-[113px]"
            />
          </LocaleLink>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-8 gap-y-4">
            {legal.map(p =>
              p ? (
                <LocaleLink
                  key={p.sys.id}
                  locale={locale}
                  href={hrefForPageSlug(p.slug)}
                  className="text-[1.8rem] text-[#bbb] underline-offset-4 hover:underline"
                >
                  {p.pageName}
                </LocaleLink>
              ) : null,
            )}
          </nav>
          <p className="text-[1.8rem] text-[#bbb]">
            © Copyright {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
