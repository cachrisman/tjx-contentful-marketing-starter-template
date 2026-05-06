# Changelog

## 1.0.0 — 2026-05-06

### Added

- Complete greenfield rebuild on **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, **TypeScript**.
- Contentful integration via **GraphQL Content API** with typed operations (`graphql-codegen`: `typescript`, `typescript-operations`, `typed-document-node`).
- Content access layer under `src/lib/contentful/` (fetch helper, `resolveMarketingEntry`, `loadPageBySlug`).
- Marketing UI parity for template content types: Page (home + slug routes), Hero Banner, Duplex, CTA, Info Block, Quote, Text Block, Topic Person, Topic Product, Product Table, Topic Business Info; navigation and footer from singleton collections.
- **Draft Mode** routes: `/api/draft/enable`, `/api/draft/disable`.
- **Contentful Live Preview** (`ContentfulLivePreviewProvider`, `useContentfulLiveUpdates` per section).
- **Middleware**: redirect `/` → `/en-US`; prefix paths without locale when needed.
- **`sitemap.xml`** and **`robots.txt`** driven by Contentful page slugs.
- Security headers: **no** `X-Frame-Options`; CSP **frame-ancestors** allows Contentful web app hosts for embedded preview.
- Developer scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `codegen`.

### Changed

- **Version** bumped from `0.0.1` to **`1.0.0`** for this App Router architecture.

### Removed

- Legacy **Pages Router**, **MUI**, **React Query**, **next-i18next** App Router–incompatible stack from the previous template implementation.
