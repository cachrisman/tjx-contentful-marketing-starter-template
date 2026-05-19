# Contentful Marketing Starter (Next.js App Router)

Greenfield rebuild of the [Contentful Marketing starter template](https://github.com/contentful/template-marketing-webapp-nextjs) using **Next.js 16**, the **App Router**, **React Server Components**, **Tailwind CSS v4**, and the **Contentful GraphQL Content API**.

## Requirements

- Node.js 20+
- A Contentful space with the Marketing starter content model

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in values:

| Variable | Purpose |
| -------- | ------- |
| `CONTENTFUL_SPACE_ID` | Contentful space ID |
| `CONTENTFUL_DELIVERY_TOKEN` | CDA token (published content) |
| `CONTENTFUL_PREVIEW_TOKEN` | CPA token (drafts / preview API) |
| `CONTENTFUL_PREVIEW_SECRET` | Shared secret for `/api/draft/enable` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap, OG URLs) |

**Never commit `.env.local`.** Tokens stay on your machine or in your host’s secret store.

3. Generate GraphQL types (optional after schema changes):

```bash
npm run codegen
```

4. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` — middleware redirects `/` to `/en-US`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` | Prettier |
| `npm run codegen` | GraphQL codegen against Contentful |

## Preview & live preview

### Draft Mode (preview API)

1. Set `CONTENTFUL_PREVIEW_SECRET` in `.env.local`.
2. Visit:

```
/api/draft/enable?secret=YOUR_SECRET&slug=pricing&locale=en-US
```

3. You are redirected to `/{locale}/{slug}` with **Draft Mode** enabled. The app uses `CONTENTFUL_PREVIEW_TOKEN` for GraphQL requests.
4. Disable Draft Mode:

```
/api/draft/disable?locale=en-US
```

### Contentful Live Preview

When Draft Mode is **on**, the layout wraps the tree with `ContentfulLivePreviewProvider` (`enableInspectorMode` + `enableLiveUpdates`). Section entries use `useContentfulLiveUpdates` so inline edits sync without a full reload where the SDK supports it.

GraphQL queries include `sys.id` and `__typename` so updates and inspector mode can resolve entries.

### Contentful Timeline preview

Editors can preview future **Timeline releases** from the Contentful web app. Configure the preview platform URL:

```
{YOUR_SITE}/api/draft/enable?secret={CONTENTFUL_PREVIEW_SECRET}&slug={entry.fields.slug}&locale={entry.fields.locale}&timeline={timeline}
```

- Timeline trust is minted only on `/api/draft/enable` (requires `CONTENTFUL_PREVIEW_SECRET`). The signed `ctf_tl` cookie (`HttpOnly; Secure; SameSite=None; Path=/`) is authoritative for ~15 minutes (same horizon as the `cf_pt` first-hop token). Draft Mode itself can outlive that cookie; when it expires, the site falls back to current draft preview and strips stale display params on the next navigation.
- URL params `ctf_release` and `ctf_timestamp` are **app-owned display affordances** only — never trusted outside the signed cookie session. The proxy reconciles them on GET HTML navigations.
- **Sharing:** send the `/api/draft/enable?…&timeline=…` URL, not the post-redirect page URL. Each teammate must enter through enable to mint their own cookie.
- **Exit timeline** (keep draft mode): `/api/draft/timeline/clear?slug=…&locale=…` or `timeline=current` on enable.
- **Exit preview entirely:** `/api/draft/disable?slug=…&locale=…`
- **Local HTTPS:** `SameSite=None; Secure` cookies are not sent over plain HTTP. Use `next dev --experimental-https`, a tunnel, or test Timeline end-to-end on an HTTPS preview deploy.
- With an active Timeline context, live content updates are disabled (`enableLiveUpdates=false`) so editor mutations do not corrupt the future-release preview; inspector overlays remain on.

### Preview iframe / CSP

Security headers intentionally **omit** `X-Frame-Options` so Contentful Preview can embed the site. `Content-Security-Policy` uses:

`frame-ancestors 'self' https://app.contentful.com https://app.eu.contentful.com`

## Localization

Routes are prefixed with locale: `/en-US`, `/de-DE`. Default locale is `en-US`. Content is requested from Contentful with the matching `locale` variable.

## Deployment

- Set the same environment variables in your host (Vercel, etc.).
- Ensure `NEXT_PUBLIC_SITE_URL` matches the production URL for accurate metadata and `sitemap.xml`.

## Implementation notes (vs. original template)

- **Pages Router → App Router**: All routing lives under `src/app`; no `pages/` directory.
- **Data loading**: Server Components fetch via a small GraphQL client (`src/lib/contentful/graphql-request.ts`). React Query was removed in favor of RSC + `fetch` caching (`revalidate: 60` for published content, `no-store` when Draft Mode is active).
- **Styling**: MUI replaced by Tailwind CSS; typography aims to match the original (root `font-size: 62.5%`, Red Hat Display).
- **Boolean CMS fields**: In this space, fields such as `containerLayout`, `imagePosition`, `quoteAlignment`, and `cardStyle` are modeled as **booleans** in GraphQL; UI maps them to layout/styles accordingly (see `marketing-blocks.tsx`).
- **Unknown components**: Unresolved `__typename` values log a development warning and render nothing.

## Project layout

- `src/app` — App Router routes, `sitemap.ts`, `robots.ts`, Draft Mode API routes
- `src/lib/contentful` — GraphQL documents, generated types, fetch helpers, entry resolution
- `src/components/marketing` — Presentational blocks and rich text
- `src/components/layout` — Header / footer
- `src/components/contentful` — Live preview helpers

## License

MIT
