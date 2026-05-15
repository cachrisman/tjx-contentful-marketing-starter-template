import type * as Types from '../generated/types';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type NtPreviewExperienceFieldsFragment = {
  __typename: 'NtExperience';
  ntExperienceId?: string | null;
  ntName?: string | null;
  ntDescription?: string | null;
  ntType?: string | null;
  ntConfig?: any | null;
  ntMetadata?: any | null;
  sys: { __typename?: 'Sys'; id: string };
  ntAudience?: {
    __typename: 'NtAudience';
    ntAudienceId?: string | null;
    ntName?: string | null;
    ntDescription?: string | null;
    sys: { __typename?: 'Sys'; id: string };
  } | null;
  ntVariantsCollection?: {
    __typename?: 'NtExperienceNt_variantsCollection';
    items: Array<
      | { __typename: 'ComponentCta'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentDuplex'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentHeroBanner'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentInfoBlock'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentProductTable'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentQuote'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ComponentTextBlock'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'FooterColumn'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'FooterMenu'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'GlobalSettings'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'ImageWithFocalPoint'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'MenuGroup'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NavigationColumn'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NavigationLink'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NavigationMenu'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NavigationSection'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NtAudience'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NtExperience'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'NtMergetag'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'Page'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'Seo'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'TopicBusinessInfo'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'TopicPerson'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'TopicProduct'; sys: { __typename?: 'Sys'; id: string } }
      | { __typename: 'TopicProductFeature'; sys: { __typename?: 'Sys'; id: string } }
      | null
    >;
  } | null;
};

export type NtPreviewAudienceFieldsFragment = {
  __typename: 'NtAudience';
  ntAudienceId?: string | null;
  ntName?: string | null;
  ntDescription?: string | null;
  sys: { __typename?: 'Sys'; id: string };
};

export type NtPreviewExperienceCollectionQueryVariables = Types.Exact<{
  locale?: Types.InputMaybe<Types.Scalars['String']['input']>;
  preview: Types.Scalars['Boolean']['input'];
  limit: Types.Scalars['Int']['input'];
  skip: Types.Scalars['Int']['input'];
}>;

export type NtPreviewExperienceCollectionQuery = {
  __typename?: 'Query';
  ntExperienceCollection?: {
    __typename?: 'NtExperienceCollection';
    items: Array<{
      __typename: 'NtExperience';
      ntExperienceId?: string | null;
      ntName?: string | null;
      ntDescription?: string | null;
      ntType?: string | null;
      ntConfig?: any | null;
      ntMetadata?: any | null;
      sys: { __typename?: 'Sys'; id: string };
      ntAudience?: {
        __typename: 'NtAudience';
        ntAudienceId?: string | null;
        ntName?: string | null;
        ntDescription?: string | null;
        sys: { __typename?: 'Sys'; id: string };
      } | null;
      ntVariantsCollection?: {
        __typename?: 'NtExperienceNt_variantsCollection';
        items: Array<
          | { __typename: 'ComponentCta'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentDuplex'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentHeroBanner'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentInfoBlock'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentProductTable'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentQuote'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ComponentTextBlock'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'FooterColumn'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'FooterMenu'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'GlobalSettings'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'ImageWithFocalPoint'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'MenuGroup'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NavigationColumn'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NavigationLink'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NavigationMenu'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NavigationSection'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NtAudience'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NtExperience'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'NtMergetag'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'Page'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'Seo'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'TopicBusinessInfo'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'TopicPerson'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'TopicProduct'; sys: { __typename?: 'Sys'; id: string } }
          | { __typename: 'TopicProductFeature'; sys: { __typename?: 'Sys'; id: string } }
          | null
        >;
      } | null;
    } | null>;
  } | null;
};

export type NtPreviewAudienceCollectionQueryVariables = Types.Exact<{
  locale?: Types.InputMaybe<Types.Scalars['String']['input']>;
  preview: Types.Scalars['Boolean']['input'];
  limit: Types.Scalars['Int']['input'];
  skip: Types.Scalars['Int']['input'];
}>;

export type NtPreviewAudienceCollectionQuery = {
  __typename?: 'Query';
  ntAudienceCollection?: {
    __typename?: 'NtAudienceCollection';
    items: Array<{
      __typename: 'NtAudience';
      ntAudienceId?: string | null;
      ntName?: string | null;
      ntDescription?: string | null;
      sys: { __typename?: 'Sys'; id: string };
    } | null>;
  } | null;
};

export const NtPreviewExperienceFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NtPreviewExperienceFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'NtExperience' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sys' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntExperienceId' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntDescription' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntConfig' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntMetadata' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntAudience' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sys' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntAudienceId' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntName' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntDescription' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntVariantsCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '100' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sys' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NtPreviewExperienceFieldsFragment, unknown>;
export const NtPreviewAudienceFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NtPreviewAudienceFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'NtAudience' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sys' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntAudienceId' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntDescription' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NtPreviewAudienceFieldsFragment, unknown>;
export const NtPreviewExperienceCollectionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'NtPreviewExperienceCollection' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntExperienceCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'NtPreviewExperienceFields' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NtPreviewExperienceFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'NtExperience' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sys' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntExperienceId' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntDescription' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntConfig' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntMetadata' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntAudience' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sys' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntAudienceId' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntName' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'ntDescription' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'locale' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
                    },
                  ],
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntVariantsCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '100' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sys' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  NtPreviewExperienceCollectionQuery,
  NtPreviewExperienceCollectionQueryVariables
>;
export const NtPreviewAudienceCollectionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'NtPreviewAudienceCollection' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntAudienceCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'preview' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'preview' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'NtPreviewAudienceFields' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NtPreviewAudienceFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'NtAudience' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: '__typename' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sys' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntAudienceId' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntName' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ntDescription' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locale' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  NtPreviewAudienceCollectionQuery,
  NtPreviewAudienceCollectionQueryVariables
>;
