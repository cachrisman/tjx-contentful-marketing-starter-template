import type { DocumentNode } from 'graphql';

import { CtfBusinessInfoDocument } from '@/lib/contentful/graphql/business-info.generated';
import { CtfCtaDocument } from '@/lib/contentful/graphql/ctf-cta.generated';
import { CtfDuplexDocument } from '@/lib/contentful/graphql/ctf-duplex.generated';
import { CtfHeroBannerDocument } from '@/lib/contentful/graphql/ctf-hero-banner.generated';
import { CtfInfoBlockDocument } from '@/lib/contentful/graphql/ctf-info-block.generated';
import { CtfPersonDocument } from '@/lib/contentful/graphql/ctf-person.generated';
import { CtfProductTableDocument } from '@/lib/contentful/graphql/ctf-product-table.generated';
import { CtfProductDocument } from '@/lib/contentful/graphql/ctf-product.generated';
import { CtfQuoteDocument } from '@/lib/contentful/graphql/ctf-quote.generated';
import { CtfTextBlockDocument } from '@/lib/contentful/graphql/ctf-text-block.generated';

/** GraphQL operations used when fetching each marketing entry — required for Live Preview subscriptions + source maps. */
export const LIVE_PREVIEW_QUERY_BY_TYPENAME: Record<string, DocumentNode> = {
  ComponentHeroBanner: CtfHeroBannerDocument,
  ComponentDuplex: CtfDuplexDocument,
  ComponentCta: CtfCtaDocument,
  ComponentInfoBlock: CtfInfoBlockDocument,
  ComponentQuote: CtfQuoteDocument,
  ComponentTextBlock: CtfTextBlockDocument,
  TopicPerson: CtfPersonDocument,
  TopicProduct: CtfProductDocument,
  ComponentProductTable: CtfProductTableDocument,
  TopicBusinessInfo: CtfBusinessInfoDocument,
};
