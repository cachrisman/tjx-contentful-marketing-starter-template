'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { TimelineContext } from '@/lib/contentful/timeline-shared';

const TimelineContextValue = createContext<TimelineContext | null>(null);

export function TimelineContextProvider({
  value,
  children,
}: {
  value: TimelineContext | null;
  children: ReactNode;
}) {
  return <TimelineContextValue.Provider value={value}>{children}</TimelineContextValue.Provider>;
}

export function useTimelineContext(): TimelineContext | null {
  return useContext(TimelineContextValue);
}
