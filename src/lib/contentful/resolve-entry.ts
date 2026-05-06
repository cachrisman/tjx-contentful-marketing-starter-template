import { CtfBusinessInfoDocument } from '@/lib/contentful/graphql/business-info.generated';
import { CtfCtaDocument } from '@/lib/contentful/graphql/ctf-cta.generated';
import { CtfDuplexDocument } from '@/lib/contentful/graphql/ctf-duplex.generated';
import { CtfFooterDocument } from '@/lib/contentful/graphql/ctf-footer.generated';
import { CtfHeroBannerDocument } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import { CtfInfoBlockDocument } from '@/lib/contentful/graphql/ctf-info-block.generated';
import { CtfNavigationDocument } from '@/lib/contentful/graphql/ctf-navigation.generated';
import { CtfPersonDocument } from '@/lib/contentful/graphql/ctf-person.generated';
import { CtfProductTableDocument } from '@/lib/contentful/graphql/ctf-product-table.generated';
import { CtfProductDocument } from '@/lib/contentful/graphql/ctf-product.generated';
import { CtfQuoteDocument } from '@/lib/contentful/graphql/ctf-quote.generated';
import { CtfTextBlockDocument } from '@/lib/contentful/graphql/ctf-text-block.generated';
import type { CtfBusinessInfoQuery } from '@/lib/contentful/graphql/business-info.generated';
import type { CtfCtaQuery } from '@/lib/contentful/graphql/ctf-cta.generated';
import type { CtfDuplexQuery } from '@/lib/contentful/graphql/ctf-duplex.generated';
import type { CtfHeroBannerQuery } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import type { CtfInfoBlockQuery } from '@/lib/contentful/graphql/ctf-info-block.generated';
import type { CtfPersonQuery } from '@/lib/contentful/graphql/ctf-person.generated';
import type { CtfProductTableQuery } from '@/lib/contentful/graphql/ctf-product-table.generated';
import type { CtfProductQuery } from '@/lib/contentful/graphql/ctf-product.generated';
import type { CtfQuoteQuery } from '@/lib/contentful/graphql/ctf-quote.generated';
import type { CtfTextBlockQuery } from '@/lib/contentful/graphql/ctf-text-block.generated';
import { contentfulGraphql } from '@/lib/contentful/graphql-request';

export type EntryRef = {
  __typename: string;
  sys: { id: string };
};

export type ResolvedMarketingEntry =
  | NonNullable<CtfHeroBannerQuery['componentHeroBanner']>
  | NonNullable<CtfDuplexQuery['componentDuplex']>
  | NonNullable<CtfCtaQuery['componentCta']>
  | NonNullable<CtfInfoBlockQuery['componentInfoBlock']>
  | NonNullable<CtfQuoteQuery['componentQuote']>
  | NonNullable<CtfTextBlockQuery['componentTextBlock']>
  | NonNullable<CtfPersonQuery['topicPerson']>
  | NonNullable<CtfProductQuery['topicProduct']>
  | NonNullable<CtfProductTableQuery['componentProductTable']>
  | NonNullable<CtfBusinessInfoQuery['topicBusinessInfo']>;

export type RichTextEmbeddings = Record<string, ResolvedMarketingEntry>;

const baseVars = (id: string, locale: string | undefined, preview: boolean) => ({
  id,
  locale,
  preview,
});

async function resolveRichTextEmbeddings(
  links:
    | {
        entries?: { block?: Array<EntryRef | null> | null } | null;
      }
    | null
    | undefined,
  locale: string | undefined,
  preview: boolean,
): Promise<RichTextEmbeddings> {
  const blocks = links?.entries?.block?.filter(Boolean) as EntryRef[] | undefined;
  if (!blocks?.length) {
    return {};
  }

  const out: RichTextEmbeddings = {};
  await Promise.all(
    blocks.map(async ref => {
      const resolved = await resolveMarketingEntry(ref, locale, preview);
      if (resolved) {
        out[ref.sys.id] = resolved;
      }
    }),
  );
  return out;
}

export async function resolveMarketingEntry(
  ref: EntryRef | null | undefined,
  locale: string | undefined,
  preview: boolean,
): Promise<ResolvedMarketingEntry | null> {
  if (!ref?.__typename || !ref.sys?.id) {
    return null;
  }

  const v = baseVars(ref.sys.id, locale, preview);

  switch (ref.__typename) {
    case 'ComponentHeroBanner': {
      const d = await contentfulGraphql(CtfHeroBannerDocument, v, { preview });
      return d.componentHeroBanner ?? null;
    }
    case 'ComponentDuplex': {
      const d = await contentfulGraphql(CtfDuplexDocument, v, { preview });
      return d.componentDuplex ?? null;
    }
    case 'ComponentCta': {
      const d = await contentfulGraphql(CtfCtaDocument, v, { preview });
      return d.componentCta ?? null;
    }
    case 'ComponentInfoBlock': {
      const d = await contentfulGraphql(CtfInfoBlockDocument, v, { preview });
      return d.componentInfoBlock ?? null;
    }
    case 'ComponentQuote': {
      const d = await contentfulGraphql(CtfQuoteDocument, v, { preview });
      const q = d.componentQuote;
      if (!q) return null;
      const richTextEmbeddings = await resolveRichTextEmbeddings(q.quote?.links, locale, preview);
      return { ...q, richTextEmbeddings } as ResolvedMarketingEntry;
    }
    case 'ComponentTextBlock': {
      const d = await contentfulGraphql(CtfTextBlockDocument, v, { preview });
      const t = d.componentTextBlock;
      if (!t) return null;
      const richTextEmbeddings = await resolveRichTextEmbeddings(t.body?.links, locale, preview);
      return { ...t, richTextEmbeddings } as ResolvedMarketingEntry;
    }
    case 'TopicPerson': {
      const d = await contentfulGraphql(CtfPersonDocument, v, { preview });
      return d.topicPerson ?? null;
    }
    case 'TopicProduct': {
      const d = await contentfulGraphql(CtfProductDocument, v, { preview });
      return d.topicProduct ?? null;
    }
    case 'ComponentProductTable': {
      const d = await contentfulGraphql(CtfProductTableDocument, v, { preview });
      return d.componentProductTable ?? null;
    }
    case 'TopicBusinessInfo': {
      const d = await contentfulGraphql(CtfBusinessInfoDocument, v, { preview });
      const b = d.topicBusinessInfo;
      if (!b) return null;
      const richTextEmbeddings = await resolveRichTextEmbeddings(b.body?.links, locale, preview);
      return { ...b, richTextEmbeddings } as ResolvedMarketingEntry;
    }
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[contentful] No resolver for marketing entry __typename="${ref.__typename}" id=${ref.sys.id}`,
        );
      }
      return null;
  }
}

export async function resolveMarketingEntries(
  refs: Array<EntryRef | null | undefined>,
  locale: string | undefined,
  preview: boolean,
): Promise<Array<ResolvedMarketingEntry | null>> {
  return Promise.all(refs.map(r => resolveMarketingEntry(r, locale, preview)));
}

export async function loadNavigation(locale: string | undefined, preview: boolean) {
  const data = await contentfulGraphql(CtfNavigationDocument, { locale, preview }, { preview });
  return data.navigationMenuCollection;
}

export async function loadFooter(locale: string | undefined, preview: boolean) {
  const data = await contentfulGraphql(CtfFooterDocument, { locale, preview }, { preview });
  return data.footerMenuCollection;
}
