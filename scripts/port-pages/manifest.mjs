#!/usr/bin/env node
/**
 * Builds scripts/port-pages/manifest.json — the single source of truth for
 * which treatment/concern pages need porting from the uncover-gags reference
 * into the new pageBlocks CMS schema.
 *
 * For each slug present in uncover-gags/src/content/{treatments,concerns}:
 *   - Issues a HEAD to https://uncover-web.netlify.app/{kind}/{slug}/
 *   - Looks up the matching Payload row id in cms.{treatments|concerns}
 *   - Counts existing rows across every cms.{kind}_blocks_* table where
 *     _parent_id = id AND _path = 'pageBlocks', so we can see which pages
 *     have already been ported vs. only have the auto-migrated textSection
 *
 * Idempotent — re-run anytime to refresh the manifest.
 */
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const GAGS_ROOT = resolve(__dirname, '..', '..', '..', 'uncover-gags', 'src', 'content');
const MANIFEST_PATH = resolve(__dirname, 'manifest.json');
const NETLIFY = 'https://uncover-web.netlify.app';

function listSlugs(subdir) {
  return readdirSync(resolve(GAGS_ROOT, subdir))
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort();
}

async function netlifyStatus(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.status;
  } catch (e) {
    return 0;
  }
}

async function blockCounts(client, parentTable, parentId) {
  const tables = await client.query(`
    SELECT DISTINCT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'cms'
      AND c.table_name LIKE $1
      AND c.column_name = '_path'
    ORDER BY c.table_name
  `, [`${parentTable}_blocks_%`]);
  const counts = {};
  let total = 0;
  for (const { table_name } of tables.rows) {
    const r = await client.query(
      `SELECT COUNT(*)::int AS n FROM cms."${table_name}" WHERE _parent_id = $1 AND _path = 'pageBlocks'`,
      [parentId]
    );
    if (r.rows[0].n > 0) {
      counts[table_name.replace(`${parentTable}_blocks_`, '')] = r.rows[0].n;
      total += r.rows[0].n;
    }
  }
  return { total, counts };
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('SET search_path TO cms, public');

  const treatments = listSlugs('treatments');
  const concerns = listSlugs('concerns');
  console.log(`gags: ${treatments.length} treatments, ${concerns.length} concerns`);

  const manifest = { generatedAt: new Date().toISOString(), entries: [] };

  for (const kind of ['treatment', 'concern']) {
    const collection = kind === 'treatment' ? 'treatments' : 'concerns';
    const slugs = kind === 'treatment' ? treatments : concerns;
    for (const slug of slugs) {
      const ref = `${NETLIFY}/${kind}/${slug}/`;
      const status = await netlifyStatus(ref);
      const row = (await client.query(
        `SELECT id, name FROM cms.${collection} WHERE slug = $1 LIMIT 1`,
        [slug]
      )).rows[0];
      const cmsId = row ? row.id : null;
      const cmsName = row ? row.name : null;
      let blocks = { total: 0, counts: {} };
      if (cmsId) blocks = await blockCounts(client, collection, cmsId);
      manifest.entries.push({
        slug, kind, collection, referenceUrl: ref, referenceStatus: status,
        cmsId, cmsName, existingBlocks: blocks, ported: false, similarity: null, notes: '',
      });
      process.stdout.write(
        `${kind.padEnd(9)} ${slug.padEnd(55)} ref=${status} cms=${cmsId ? cmsId : 'MISSING'} blocks=${blocks.total}\n`
      );
    }
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nwrote ${manifest.entries.length} entries → ${MANIFEST_PATH}`);

  const missing = manifest.entries.filter((e) => !e.cmsId);
  const netlify404 = manifest.entries.filter((e) => e.referenceStatus !== 200);
  if (missing.length) console.log(`WARN: ${missing.length} slugs have no CMS row:`, missing.map((e) => `${e.kind}/${e.slug}`).join(', '));
  if (netlify404.length) console.log(`WARN: ${netlify404.length} slugs not reachable on Netlify:`, netlify404.map((e) => `${e.kind}/${e.slug}(${e.referenceStatus})`).join(', '));

  await client.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
