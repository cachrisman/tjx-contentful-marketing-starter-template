'use client';

import {
  LocaleLink,
  LocalePageLink,
} from '@/components/marketing/locale-link';
import { useTimelineContext } from '@/components/contentful/timeline-context';
import { timelineDisplayParams } from '@/lib/contentful/timeline-shared';
import type { ComponentProps } from 'react';

type LocaleLinkProps = ComponentProps<typeof LocaleLink>;
type LocalePageLinkProps = ComponentProps<typeof LocalePageLink>;

export function TimelineLocaleLink(props: LocaleLinkProps) {
  const timelineParams = timelineDisplayParams(useTimelineContext());
  return <LocaleLink {...props} timelineDisplayParams={timelineParams} />;
}

export function TimelineLocalePageLink(props: LocalePageLinkProps) {
  const timelineParams = timelineDisplayParams(useTimelineContext());
  return <LocalePageLink {...props} timelineDisplayParams={timelineParams} />;
}
