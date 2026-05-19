'use client';

import { usePathname } from 'next/navigation';

import { useTimelineContext } from '@/components/contentful/timeline-context';
import { useContentfulPreviewEnabled } from '@/components/contentful/contentful-preview-provider';
import type { Locale } from '@/lib/i18n/config';
import { localeSlugKeyFromPathname } from '@/lib/routing';

export function TimelinePreviewBanner({ locale }: { locale: Locale }) {
  const preview = useContentfulPreviewEnabled();
  const timelineContext = useTimelineContext();
  const pathname = usePathname();
  const parsed = localeSlugKeyFromPathname(pathname);

  if (!preview || !timelineContext || (!timelineContext.release && !timelineContext.timestamp)) {
    return null;
  }

  const slugKey = parsed?.slugKey ?? 'home';
  const q = new URLSearchParams({ locale, slug: slugKey });
  const clearHref = `/api/draft/timeline/clear?${q.toString()}`;
  const disableHref = `/api/draft/disable?${q.toString()}`;

  const labelParts: string[] = [];
  if (timelineContext.release) {
    labelParts.push(`release ${timelineContext.release}`);
  }
  if (timelineContext.timestamp) {
    labelParts.push(timelineContext.timestamp);
  }

  return (
    <div
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100"
      role="status"
    >
      <span className="font-medium">Timeline preview</span>
      {labelParts.length > 0 ? (
        <span className="text-amber-900/80 dark:text-amber-100/80"> — {labelParts.join(' · ')}</span>
      ) : null}
      <span className="mx-2 text-amber-700/60 dark:text-amber-200/50">|</span>
      <a href={clearHref} className="underline underline-offset-2 hover:no-underline">
        Exit timeline
      </a>
      <span className="mx-2 text-amber-700/60 dark:text-amber-200/50">|</span>
      <a href={disableHref} className="underline underline-offset-2 hover:no-underline">
        Exit preview
      </a>
    </div>
  );
}
