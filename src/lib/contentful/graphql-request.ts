import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const graphqlEndpoint = () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  if (!spaceId) {
    throw new Error('CONTENTFUL_SPACE_ID is required');
  }
  return `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;
};

export type GraphqlRequestOptions = {
  preview: boolean;
};

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

  const res = await fetch(graphqlEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: print(document), variables }),
    cache: opts.preview ? 'no-store' : 'force-cache',
    next: opts.preview ? undefined : { revalidate: 60 },
  });

  const json = (await res.json()) as {
    data?: TResult;
    errors?: { message: string }[];
  };

  if (!res.ok) {
    throw new Error(`Contentful GraphQL HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map(e => e.message).join('; '));
  }

  if (json.data === undefined) {
    throw new Error('Contentful GraphQL returned no data');
  }

  return json.data;
}
