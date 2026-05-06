import { splitEncoding } from '@contentful/content-source-maps';

/**
 * Live Preview + `@contentSourceMaps` embed metadata via invisible Unicode (see Contentful “Content Source Maps”).
 * Plain-text fields like slugs are encoded too — strip before URLs, GraphQL variables, or comparisons.
 */
export function stripContentSourceMapEncoding(input: string): string {
  return splitEncoding(input).cleaned;
}

/** Decode `%E2%80%8B`-style sequences (possibly nested) before Unicode normalization. */
function decodeURIComponentRepeated(raw: string): string {
  let cur = raw;
  for (let i = 0; i < 8; i++) {
    try {
      const next = decodeURIComponent(cur);
      if (next === cur) break;
      cur = next;
    } catch {
      break;
    }
  }
  return cur;
}

/**
 * Residual format chars (Unicode Cf): soft hyphen, exotic marks, or pasted debris not handled by source maps.
 */
const FORMAT_CHARS = /\p{Cf}/gu;

/** Normalize a CMS or URL path segment for comparisons and links. */
export function normalizeSlug(input: string | null | undefined): string | null {
  if (input == null) return null;
  const decoded = decodeURIComponentRepeated(input.trim());
  const withoutMaps = stripContentSourceMapEncoding(decoded);
  const trimmed = withoutMaps.normalize('NFC').replace(FORMAT_CHARS, '').trim();
  return trimmed === '' ? null : trimmed;
}

/** Strip preview encoding and format chars from a hyperlink URI (path or absolute URL). */
export function sanitizeHyperlinkUri(uri: string): string {
  const decoded = decodeURIComponentRepeated(uri);
  return stripContentSourceMapEncoding(decoded).replace(FORMAT_CHARS, '');
}
