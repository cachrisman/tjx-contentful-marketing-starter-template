import 'server-only';

import { cache } from 'react';

import { loadPreviewPluginDataFromContentful } from '@/lib/personalization/preview-plugin-from-contentful';

/**
 * One catalog fetch per request per locale (layout + marketing blocks share it).
 */
export const loadPreviewPluginDataFromContentfulCached = cache(loadPreviewPluginDataFromContentful);
