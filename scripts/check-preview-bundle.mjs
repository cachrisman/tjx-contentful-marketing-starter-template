#!/usr/bin/env node
/**
 * Phase 4 gate: the preview plugin must not ship in browser chunks for the
 * default production build (dynamic `import()` + draft-only mount).
 *
 * Run after `NODE_ENV=production npm run build`. Scans `.next/static` only
 * (client assets); server-only references under `.next/server` are ignored.
 */
import fs from 'node:fs';
import path from 'node:path';

const staticDir = path.join(process.cwd(), '.next', 'static');

if (!fs.existsSync(staticDir)) {
  console.error('Missing .next/static — run NODE_ENV=production npm run build first.');
  process.exit(1);
}

const needle = /experience\.js-plugin-preview|@ninetailed\/experience\.js-plugin-preview/;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
    } else if (ent.isFile()) {
      const buf = fs.readFileSync(p);
      const sample = buf.length > 4_000_000 ? buf.subarray(0, 4_000_000) : buf;
      if (needle.test(sample.toString('utf8'))) {
        console.error(`Preview plugin reference found in client bundle:\n  ${p}`);
        process.exit(1);
      }
    }
  }
}

walk(staticDir);
console.log('check-preview-bundle: no preview-plugin references under .next/static');
