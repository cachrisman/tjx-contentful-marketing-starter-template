import { encodeGraphQLResponse } from '@contentful/live-preview';
import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

import { injectTimelineDirective } from '@/lib/contentful/timeline-directive';
import { getTimelineContext } from '@/lib/contentful/timeline';
import { hasTimelineContext } from '@/lib/contentful/timeline-shared';

/** Contentful counts whitespace toward the ~8KB POST body limit; codegen emits verbose queries. */
function compactGraphqlQuery(source: string): string {
  return source.replace(/\s+/g, ' ').trim();
}

const graphqlEndpoint = () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  if (!spaceId) {
    throw new Error('CONTENTFUL_SPACE_ID is required');
  }
  const env = process.env.CONTENTFUL_ENVIRONMENT?.trim() || 'master';
  const base = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;
  return env === 'master' ? base : `${base}/environments/${env}`;
};

export type GraphqlRequestOptions = {
  preview: boolean;
  allowGraphqlErrors?: boolean;
};

type ContentfulGraphqlError = {
  message: string;
};

function formatGraphqlErrors(errors: ContentfulGraphqlError[] | undefined): string {
  return errors?.map(e => e.message).join('; ') ?? '';
}

export async function contentfulGraphql<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
  opts: GraphqlRequestOptions,
): Promise<TResult> {
  const delivery = process.env.CONTENTFUL_DELIVERY_TOKEN ?? process.env.CONTENTFUL_ACCESS_TOKEN;
  const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN ?? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

  const token = opts.preview ? previewToken : delivery;
  if (!token) {
    throw new Error(
      opts.preview
        ? 'CONTENTFUL_PREVIEW_TOKEN is required for preview requests'
        : 'CONTENTFUL_DELIVERY_TOKEN is required',
    );
  }

  let documentToPrint = document;
  if (opts.preview) {
    const timelineCtx = await getTimelineContext({ trustProxyHeaders: true });
    if (hasTimelineContext(timelineCtx)) {
      documentToPrint = injectTimelineDirective(document, timelineCtx) as typeof document;
    }
  }

  const res = await fetch(graphqlEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: compactGraphqlQuery(print(documentToPrint)),
      variables,
    }),
    cache: opts.preview ? 'no-store' : 'force-cache',
    next: opts.preview ? undefined : { revalidate: 60 },
  });

  const json = (await res.json()) as {
    data?: TResult;
    errors?: ContentfulGraphqlError[];
    extensions?: unknown;
    message?: string;
  };

  if (!res.ok) {
    const hint =
      formatGraphqlErrors(json.errors) ||
      (typeof json.message === 'string' ? json.message : JSON.stringify(json).slice(0, 500));
    throw new Error(`Contentful GraphQL HTTP ${res.status}${hint ? `: ${hint}` : ''}`);
  }

  if (json.errors?.length) {
    const message = formatGraphqlErrors(json.errors);
    if (!opts.allowGraphqlErrors || json.data === undefined) {
      throw new Error(message);
    }
    console.warn(`[contentful] GraphQL request returned partial data: ${message}`);
  }

  if (json.data === undefined) {
    throw new Error('Contentful GraphQL returned no data');
  }

  /**
   * Content Source Maps (Premium): GraphQL returns mappings in `extensions`. `encodeGraphQLResponse` merges
   * invisible metadata into string fields for Live Preview inspector mode (see Contentful docs). Use
   * `stripContentSourceMapEncoding` / `normalizeSlug` before URLs, API vars, or analytics — not “CMS garbage”.
   */
  if (
    opts.preview &&
    json.extensions !== undefined &&
    json.extensions !== null &&
    typeof json.extensions === 'object'
  ) {
    try {
      const encoded = encodeGraphQLResponse({
        data: json.data,
        extensions: json.extensions,
      });
      return encoded.data as TResult;
    } catch {
      /* Non–Premium spaces or API quirks: proceed without embedded source maps */
    }
  }

  return json.data;
}

/**
 * Same as {@link contentfulGraphql}, but tolerates Contentful field-level GraphQL
 * errors when usable partial data is present. This keeps one broken reference from
 * turning an otherwise renderable page or component into a 404.
 */
export async function contentfulGraphqlSafe<TResult, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
  opts: GraphqlRequestOptions,
): Promise<TResult | null> {
  try {
    return await contentfulGraphql(document, variables, { ...opts, allowGraphqlErrors: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[contentful] GraphQL request failed: ${msg}`);
    return null;
  }
}
