#!/usr/bin/env node
/**
 * Ports every entry in manifest.json (minus a skiplist) through portOne.
 * Re-runs safely — each page is wiped + rebuilt inside its own transaction,
 * so one failure doesn't break the others. Uses a single pg connection for
 * the whole run to avoid reconnect overhead.
 *
 * Usage: node scripts/port-pages/portAll.mjs [--only <slug>] [--skip <slug,slug>]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from './lib.mjs';
import { portOne } from './portOne.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, 'manifest.json');

const DEFAULT_SKIP = new Set(['chemical-peels']); // per user: leave as-is

function parseArgs(argv) {
  const out = { only: null, skipExtras: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--only') out.only = argv[++i];
    else if (argv[i] === '--skip') out.skipExtras = argv[++i].split(',');
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const skip = new Set([...DEFAULT_SKIP, ...args.skipExtras]);

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const client = await connect();

  let ok = 0, err = 0, skipped = 0;
  const results = [];
  const t0 = Date.now();

  for (const entry of manifest.entries) {
    if (args.only && entry.slug !== args.only) continue;
    if (skip.has(entry.slug)) {
      console.log(`[SKIP] ${entry.kind}/${entry.slug}`);
      skipped += 1;
      continue;
    }
    if (entry.referenceStatus !== 200) {
      console.log(`[SKIP] ${entry.kind}/${entry.slug} (ref ${entry.referenceStatus})`);
      skipped += 1;
      continue;
    }
    if (!entry.cmsId) {
      console.log(`[SKIP] ${entry.kind}/${entry.slug} (no CMS id)`);
      skipped += 1;
      continue;
    }

    try {
      await portOne(entry.kind, entry.slug, { client, manifest });
      ok += 1;
      results.push({ slug: entry.slug, kind: entry.kind, ok: true });
    } catch (e) {
      err += 1;
      results.push({ slug: entry.slug, kind: entry.kind, ok: false, error: e.message });
    }
  }

  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n── summary ──`);
  console.log(`ok: ${ok}   err: ${err}   skipped: ${skipped}   elapsed: ${seconds}s`);
  if (err > 0) {
    console.log('\nfailures:');
    for (const r of results.filter((r) => !r.ok)) console.log(`  ${r.kind}/${r.slug}: ${r.error}`);
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await client.end();
  process.exit(err > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
