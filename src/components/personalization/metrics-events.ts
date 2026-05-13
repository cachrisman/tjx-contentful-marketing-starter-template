/**
 * **POC metric event names.**
 *
 * Engineering emits these through `useNinetailed().track(NAME, properties)`
 * post-consent. Marketing / SE must register a Metric with the SAME `name`
 * in the Personalization web app for Experience Insights to attribute
 * conversions (Phase 1.E).
 *
 * Treat ≥ 4h after the first test `track` as the POC validation window —
 * internal ~2h stories are anecdotal (Phase 1.E latency note).
 */
export const NT_METRIC_HERO_CTA_CLICK = 'marketing_hero_cta_click' as const;

export type NtMetricName = typeof NT_METRIC_HERO_CTA_CLICK;
