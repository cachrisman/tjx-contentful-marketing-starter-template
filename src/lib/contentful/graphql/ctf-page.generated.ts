import type * as Types from '../generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type PageTopSectionFields_ComponentCta_Fragment = { __typename: 'ComponentCta' };

export type PageTopSectionFields_ComponentDuplex_Fragment = { __typename: 'ComponentDuplex' };

export type PageTopSectionFields_ComponentHeroBanner_Fragment = { __typename: 'ComponentHeroBanner' };

export type PageTopSectionFields_ComponentInfoBlock_Fragment = { __typename: 'ComponentInfoBlock' };

export type PageTopSectionFields_ComponentQuote_Fragment = { __typename: 'ComponentQuote' };

export type PageTopSectionFields_ComponentTextBlock_Fragment = { __typename: 'ComponentTextBlock' };

export type PageTopSectionFieldsFragment =
  | PageTopSectionFields_ComponentCta_Fragment
  | PageTopSectionFields_ComponentDuplex_Fragment
  | PageTopSectionFields_ComponentHeroBanner_Fragment
  | PageTopSectionFields_ComponentInfoBlock_Fragment
  | PageTopSectionFields_ComponentQuote_Fragment
  | PageTopSectionFields_ComponentTextBlock_Fragment
;

export type PageContentFields_ComponentProductTable_Fragment = { __typename: 'ComponentProductTable' };

export type PageContentFields_TopicBusinessInfo_Fragment = { __typename: 'TopicBusinessInfo' };

export type PageContentFields_TopicProduct_Fragment = { __typename: 'TopicProduct' };

export type PageContentFieldsFragment =
  | PageContentFields_ComponentProductTable_Fragment
  | PageContentFields_TopicBusinessInfo_Fragment
  | PageContentFields_TopicProduct_Fragment
;

export type PageExtraSectionItemFields_ComponentCta_Fragment = { __typename: 'ComponentCta' };

export type PageExtraSectionItemFields_ComponentDuplex_Fragment = { __typename: 'ComponentDuplex' };

export type PageExtraSectionItemFields_ComponentHeroBanner_Fragment = { __typename: 'ComponentHeroBanner' };

export type PageExtraSectionItemFields_ComponentInfoBlock_Fragment = { __typename: 'ComponentInfoBlock' };

export type PageExtraSectionItemFields_ComponentQuote_Fragment = { __typename: 'ComponentQuote' };

export type PageExtraSectionItemFields_ComponentTextBlock_Fragment = { __typename: 'ComponentTextBlock' };

export type PageExtraSectionItemFieldsFragment =
  | PageExtraSectionItemFields_ComponentCta_Fragment
  | PageExtraSectionItemFields_ComponentDuplex_Fragment
  | PageExtraSectionItemFields_ComponentHeroBanner_Fragment
  | PageExtraSectionItemFields_ComponentInfoBlock_Fragment
  | PageExtraSectionItemFields_ComponentQuote_Fragment
  | PageExtraSectionItemFields_ComponentTextBlock_Fragment
;

export type CtfPageFieldsFragment = { __typename: 'Page', pageName?: string | null, slug?: string | null, internalName?: string | null, sys: { __typename?: 'Sys', id: string }, seo?: { __typename: 'Seo', title?: string | null, description?: string | null, noIndex?: boolean | null, noFollow?: boolean | null, image?: { __typename: 'Asset', contentType?: string | null, title?: string | null, description?: string | null, width?: number | null, height?: number | null, url?: string | null, sys: { __typename?: 'Sys', id: string } } | null } | null, topSectionCollection?: { __typename?: 'PageTopSectionCollection', items: Array<
      | { __typename: 'ComponentCta', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentDuplex', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentHeroBanner', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentInfoBlock', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentQuote', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentTextBlock', sys: { __typename?: 'Sys', id: string } }
     | null> } | null, pageContent?:
    | { __typename: 'ComponentProductTable', sys: { __typename?: 'Sys', id: string } }
    | { __typename: 'TopicBusinessInfo', sys: { __typename?: 'Sys', id: string } }
    | { __typename: 'TopicProduct', sys: { __typename?: 'Sys', id: string } }
   | null, extraSectionCollection?: { __typename?: 'PageExtraSectionCollection', items: Array<
      | { __typename: 'ComponentCta', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentDuplex', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentHeroBanner', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentInfoBlock', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentQuote', sys: { __typename?: 'Sys', id: string } }
      | { __typename: 'ComponentTextBlock', sys: { __typename?: 'Sys', id: string } }
     | null> } | null };

export type CtfPageQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  locale?: Types.InputMaybe<Types.Scalars['String']['input']>;
  preview?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type CtfPageQuery = { __typename?: 'Query', pageCollection?: { __typename?: 'PageCollection', items: Array<{ __typename: 'Page', pageName?: string | null, slug?: string | null, internalName?: string | null, sys: { __typename?: 'Sys', id: string }, seo?: { __typename: 'Seo', title?: string | null, description?: string | null, noIndex?: boolean | null, noFollow?: boolean | null, image?: { __typename: 'Asset', contentType?: string | null, title?: string | null, description?: string | null, width?: number | null, height?: number | null, url?: string | null, sys: { __typename?: 'Sys', id: string } } | null } | null, topSectionCollection?: { __typename?: 'PageTopSectionCollection', items: Array<
          | { __typename: 'ComponentCta', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentDuplex', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentHeroBanner', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentInfoBlock', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentQuote', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentTextBlock', sys: { __typename?: 'Sys', id: string } }
         | null> } | null, pageContent?:
        | { __typename: 'ComponentProductTable', sys: { __typename?: 'Sys', id: string } }
        | { __typename: 'TopicBusinessInfo', sys: { __typename?: 'Sys', id: string } }
        | { __typename: 'TopicProduct', sys: { __typename?: 'Sys', id: string } }
       | null, extraSectionCollection?: { __typename?: 'PageExtraSectionCollection', items: Array<
          | { __typename: 'ComponentCta', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentDuplex', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentHeroBanner', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentInfoBlock', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentQuote', sys: { __typename?: 'Sys', id: string } }
          | { __typename: 'ComponentTextBlock', sys: { __typename?: 'Sys', id: string } }
         | null> } | null } | null> } | null };

export const PageTopSectionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageTopSectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageTopSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<PageTopSectionFieldsFragment, unknown>;
export const PageContentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PagePageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<PageContentFieldsFragment, unknown>;
export const PageExtraSectionItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageExtraSectionItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageExtraSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<PageExtraSectionItemFieldsFragment, unknown>;
export const CtfPageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CtfPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Page"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageName"}},{"kind":"Field","alias":{"kind":"Name","value":"internalName"},"name":{"kind":"Name","value":"pageName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"seo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeoMetadataFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topSectionCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageTopSectionFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageContentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extraSectionCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageExtraSectionItemFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AssetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeoMetadataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Seo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AssetFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"noIndex"}},{"kind":"Field","name":{"kind":"Name","value":"noFollow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageTopSectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageTopSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PagePageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageExtraSectionItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageExtraSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]} as unknown as DocumentNode<CtfPageFieldsFragment, unknown>;
export const CtfPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CtfPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"preview"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"contentSourceMaps"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}},{"kind":"Argument","name":{"kind":"Name","value":"preview"},"value":{"kind":"Variable","name":{"kind":"Name","value":"preview"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CtfPageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AssetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Asset"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contentType"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SeoMetadataFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Seo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AssetFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"noIndex"}},{"kind":"Field","name":{"kind":"Name","value":"noFollow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageTopSectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageTopSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageContentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PagePageContent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageExtraSectionItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageExtraSectionItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CtfPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Page"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageName"}},{"kind":"Field","alias":{"kind":"Name","value":"internalName"},"name":{"kind":"Name","value":"pageName"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"seo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SeoMetadataFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topSectionCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageTopSectionFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageContentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"extraSectionCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageExtraSectionItemFields"}}]}}]}}]}}]} as unknown as DocumentNode<CtfPageQuery, CtfPageQueryVariables>;