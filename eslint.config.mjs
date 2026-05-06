import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    ignores: [
      'src/lib/contentful/graphql/*.generated.ts',
      'src/lib/contentful/generated/**',
    ],
  },
];

export default config;
