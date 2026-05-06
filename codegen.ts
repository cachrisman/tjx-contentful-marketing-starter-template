import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const token = process.env.CONTENTFUL_DELIVERY_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN;

const schemaUrl = spaceId
  ? `https://graphql.contentful.com/content/v1/spaces/${spaceId}`
  : 'https://graphql.contentful.com/content/v1/spaces/placeholder';

const config: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  schema: [
    {
      [schemaUrl]: {
        headers: {
          Authorization: `Bearer ${token ?? 'placeholder'}`,
          'Content-Type': 'application/json',
        },
      },
    },
  ],
  documents: ['src/lib/contentful/graphql/**/*.graphql'],
  generates: {
    'src/lib/contentful/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, unknown>',
          HexColor: 'string',
        },
      },
    },
    'src/lib/contentful/generated/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: '../generated/types.ts',
      },
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        useTypeImports: true,
        skipTypename: false,
        dedupeFragments: true,
        preResolveTypes: true,
      },
    },
  },
};

export default config;
