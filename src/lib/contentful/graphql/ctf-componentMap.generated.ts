import type * as Types from '../generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ComponentReferenceFields_ComponentCta_Fragment = { __typename: 'ComponentCta', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentDuplex_Fragment = { __typename: 'ComponentDuplex', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentHeroBanner_Fragment = { __typename: 'ComponentHeroBanner', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentInfoBlock_Fragment = { __typename: 'ComponentInfoBlock', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentProductTable_Fragment = { __typename: 'ComponentProductTable', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentQuote_Fragment = { __typename: 'ComponentQuote', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_ComponentTextBlock_Fragment = { __typename: 'ComponentTextBlock', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_FooterColumn_Fragment = { __typename: 'FooterColumn', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_FooterMenu_Fragment = { __typename: 'FooterMenu', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_GlobalSettings_Fragment = { __typename: 'GlobalSettings', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_MenuGroup_Fragment = { __typename: 'MenuGroup', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_NavigationColumn_Fragment = { __typename: 'NavigationColumn', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_NavigationLink_Fragment = { __typename: 'NavigationLink', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_NavigationMenu_Fragment = { __typename: 'NavigationMenu', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_NavigationSection_Fragment = { __typename: 'NavigationSection', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_Page_Fragment = { __typename: 'Page', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_Seo_Fragment = { __typename: 'Seo', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_TopicBusinessInfo_Fragment = { __typename: 'TopicBusinessInfo', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_TopicPerson_Fragment = { __typename: 'TopicPerson', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_TopicProduct_Fragment = { __typename: 'TopicProduct', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFields_TopicProductFeature_Fragment = { __typename: 'TopicProductFeature', sys: { __typename?: 'Sys', id: string } };

export type ComponentReferenceFieldsFragment =
  | ComponentReferenceFields_ComponentCta_Fragment
  | ComponentReferenceFields_ComponentDuplex_Fragment
  | ComponentReferenceFields_ComponentHeroBanner_Fragment
  | ComponentReferenceFields_ComponentInfoBlock_Fragment
  | ComponentReferenceFields_ComponentProductTable_Fragment
  | ComponentReferenceFields_ComponentQuote_Fragment
  | ComponentReferenceFields_ComponentTextBlock_Fragment
  | ComponentReferenceFields_FooterColumn_Fragment
  | ComponentReferenceFields_FooterMenu_Fragment
  | ComponentReferenceFields_GlobalSettings_Fragment
  | ComponentReferenceFields_MenuGroup_Fragment
  | ComponentReferenceFields_NavigationColumn_Fragment
  | ComponentReferenceFields_NavigationLink_Fragment
  | ComponentReferenceFields_NavigationMenu_Fragment
  | ComponentReferenceFields_NavigationSection_Fragment
  | ComponentReferenceFields_Page_Fragment
  | ComponentReferenceFields_Seo_Fragment
  | ComponentReferenceFields_TopicBusinessInfo_Fragment
  | ComponentReferenceFields_TopicPerson_Fragment
  | ComponentReferenceFields_TopicProduct_Fragment
  | ComponentReferenceFields_TopicProductFeature_Fragment
;

export const ComponentReferenceFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ComponentReferenceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Entry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"sys"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ComponentReferenceFieldsFragment, unknown>;