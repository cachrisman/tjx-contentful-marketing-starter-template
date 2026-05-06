import Link from 'next/link';

import { defaultLocale } from '@/lib/i18n/config';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-24 text-center">
      <h1 className="text-[3rem] font-bold">Page not found</h1>
      <p className="text-[1.8rem] text-[#414D63]">
        We could not find the content you were looking for. Check the URL for typos.
      </p>
      <Link
        href={`/${defaultLocale}`}
        className="text-[1.8rem] font-medium text-[#1B273A] underline"
      >
        Back to homepage
      </Link>
    </div>
  );
}
