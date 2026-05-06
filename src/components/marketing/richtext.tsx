'use client';

import dynamic from 'next/dynamic';
import { documentToReactComponents, type Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import type { ResolvedMarketingEntry } from '@/lib/contentful/resolve-entry';
import type { AssetFieldsFragment } from '@/lib/contentful/graphql/ctf-asset.generated';
import { LocalePageLink } from '@/components/marketing/locale-link';

const MarketingEntryView = dynamic(
  () => import('./marketing-blocks').then(m => ({ default: m.MarketingEntryView })),
  { ssr: true },
);

type BlocksMap = Record<string, ResolvedMarketingEntry>;

export type RichTextFieldProps = {
  json: unknown;
  links?: {
    entries?: { block?: Array<{ __typename: string; sys: { id: string } } | null> | null };
    assets?: { block?: AssetFieldsFragment[] | null } | null;
  } | null;
  richTextEmbeddings?: BlocksMap;
  locale: Locale;
  className?: string;
};

function EmbeddedAsset({
  asset,
  className,
}: {
  asset: AssetFieldsFragment;
  className?: string;
}) {
  if (!asset.url) return null;
  const w = asset.width ?? 1200;
  const h = asset.height ?? 800;
  if (asset.contentType?.startsWith('image/')) {
    return (
      <div className={clsx('my-6', className)}>
        <Image
          src={asset.url}
          alt={asset.title ?? ''}
          width={Math.min(w, 1200)}
          height={Math.min(h, 900)}
          className="h-auto max-w-full rounded-md"
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>
    );
  }
  return (
    <a href={asset.url} className={clsx('my-6 inline-block underline', className)}>
      {asset.title ?? asset.url}
    </a>
  );
}

function EntryHyperlink({
  node,
  locale,
  children,
}: {
  node: { data?: { target?: { sys?: { id?: string } } }; content?: unknown[] };
  locale: Locale;
  children?: React.ReactNode;
}) {
  const id = node.data?.target?.sys?.id;
  const [page, setPage] = useState<{ slug?: string | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(
        `/api/contentful/page-link?id=${encodeURIComponent(id)}&locale=${encodeURIComponent(locale)}`,
      );
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { page?: typeof page };
      if (!cancelled) setPage(data.page ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  if (!page?.slug) {
    return <span className="underline decoration-dotted">{children}</span>;
  }

  return (
    <LocalePageLink locale={locale} slug={page.slug} className="underline hover:opacity-80">
      {children}
    </LocalePageLink>
  );
}

export function RichTextField(props: RichTextFieldProps) {
  const { json, links, richTextEmbeddings, locale, className } = props;

  const entryBlocks = useMemo(() => {
    const raw = links?.entries?.block?.filter(Boolean) ?? [];
    const merged: Array<{ __typename: string; sys: { id: string } }> = [];
    for (const e of raw) {
      if (!e) continue;
      const full = richTextEmbeddings?.[e.sys.id];
      if (full) {
        merged.push(full as { __typename: string; sys: { id: string } });
      } else {
        merged.push(e as { __typename: string; sys: { id: string } });
      }
    }
    return merged;
  }, [links, richTextEmbeddings]);

  const assetBlocks = useMemo(
    () => (links?.assets?.block?.filter(Boolean) as AssetFieldsFragment[]) ?? [],
    [links],
  );

  const options: Options = useMemo(() => {
    const renderNode: Options['renderNode'] = {
      [INLINES.EMBEDDED_ENTRY]: () => null,
      [BLOCKS.EMBEDDED_ENTRY]: node => {
        const id = (node.data as { target?: { sys?: { id?: string } } })?.target?.sys?.id;
        if (!id) return null;
        const entry = entryBlocks.find(b => b.sys.id === id);
        if (!entry) return null;
        const data = richTextEmbeddings?.[id] ?? (entry as unknown as ResolvedMarketingEntry);
        return (
          <div className="my-8">
            <MarketingEntryView entry={data} locale={locale} />
          </div>
        );
      },
      [BLOCKS.EMBEDDED_ASSET]: node => {
        const id = (node.data as { target?: { sys?: { id?: string } } })?.target?.sys?.id;
        if (!id) return null;
        const asset = assetBlocks.find(a => a.sys.id === id);
        if (!asset) return null;
        return <EmbeddedAsset asset={asset} />;
      },
      [INLINES.ENTRY_HYPERLINK]: (node, children) => (
        <EntryHyperlink node={node as never} locale={locale}>
          {children}
        </EntryHyperlink>
      ),
      [BLOCKS.PARAGRAPH]: (_n, children) => (
        <p className="mb-6 text-[1.8rem] leading-relaxed text-[#414D63] last:mb-0">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_n, children) => (
        <h2 className="mb-7 mt-10 text-[3rem] font-semibold">{children}</h2>
      ),
      [BLOCKS.HEADING_2]: (_n, children) => (
        <h2 className="mb-7 mt-10 text-[2.6rem] font-semibold">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_n, children) => (
        <h3 className="mb-6 mt-8 text-[2.2rem] font-semibold">{children}</h3>
      ),
      [BLOCKS.UL_LIST]: (_n, children) => (
        <ul className="my-6 list-disc pl-8 text-[1.8rem] text-[#414D63]">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_n, children) => (
        <ol className="my-6 list-decimal pl-8 text-[1.8rem] text-[#414D63]">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_n, children) => <li className="my-1">{children}</li>,
      [BLOCKS.QUOTE]: (_n, children) => (
        <blockquote className="my-6 border-l-4 border-black pl-8 italic">{children}</blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-10 ml-0 w-1/2 border-t border-[#797979]" />,
      [BLOCKS.TABLE]: (_n, children) => (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[1.8rem]">{children}</table>
        </div>
      ),
    };

    return { renderNode };
  }, [assetBlocks, entryBlocks, locale, richTextEmbeddings]);

  if (!json) return null;

  return (
    <div className={clsx('prose-marketing max-w-none [&_a]:text-inherit', className)}>
      {documentToReactComponents(json as Parameters<typeof documentToReactComponents>[0], options)}
    </div>
  );
}
