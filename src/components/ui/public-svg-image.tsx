/* eslint-disable @next/next/no-img-element -- Local SVGs from `/public`; `next/image` adds little value and emits sizing warnings with Tailwind. */
import type { ImgHTMLAttributes } from 'react';

export type PublicSvgImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> & {
  src: string;
  width: number;
  height: number;
  /** Same idea as `next/image` `priority` — hints LCP for above-the-fold SVGs. */
  priority?: boolean;
};

/**
 * SVGs served from `/public`. Prefer this over `next/image` for local SVGs: the image
 * optimizer targets rasters, and `next/image` often warns when Tailwind constrains one axis.
 */
export function PublicSvgImage({
  src,
  width,
  height,
  alt = '',
  priority,
  ...rest
}: PublicSvgImageProps) {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      {...rest}
    />
  );
}
