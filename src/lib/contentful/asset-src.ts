/** Normalize Contentful image URLs (often protocol-relative) for Next/Image and `<img>`. */
export function contentfulAssetUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

export function contentfulImageSrc(url: string | null | undefined, width: number): string | undefined {
  const absolute = contentfulAssetUrl(url);
  if (!absolute) return undefined;
  return `${absolute}?w=${width}&fm=webp&q=80`;
}

const NON_RASTER_IMAGE = /\bimage\/svg|\.svg(\?|$)/i;

/** True when the asset is suitable for Next/Image + Contentful img params (raster only). */
export function isRasterImageAsset(contentType: string | null | undefined, url?: string | null): boolean {
  const ct = contentType?.trim() ?? '';
  if (ct && NON_RASTER_IMAGE.test(ct)) return false;
  const u = url?.trim() ?? '';
  if (u && /\.svg(\?|$)/i.test(u)) return false;
  if (!ct && !u) return false;
  return true;
}
