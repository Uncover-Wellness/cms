#!/usr/bin/env node
/**
 * Port the legacy `technology` group field on Treatments and Concerns into
 * pageBlocks as a `technology` block, placed right after the first content
 * block so it matches the old inline-tech rendering position.
 *
 * Idempotent: skips docs that already have a technology block at
 * _path='pageBlocks'. Safe to re-run.
 *
 * Run: node scripts/port-technology-group-to-block.mjs
 */

import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

/**
 * Cache of block table names per parent collection, fetched once at startup.
 * Avoids hitting information_schema inside the per-doc loop (which was
 * causing the script to hang).
 */
const BLOCK_TABLES_CACHE = new Map();

async function blockTablesFor(parentTable) {
  if (BLOCK_TABLES_CACHE.has(parentTable)) return BLOCK_TABLES_CACHE.get(parentTable);
  const r = await client.query(`
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = 'cms'
      AND table_name LIKE $1
      AND column_name = '_path'
    ORDER BY table_name
  `, [`${parentTable}_blocks_%`]);
  const names = r.rows.map(row => row.table_name);
  BLOCK_TABLES_CACHE.set(parentTable, names);
  return names;
}

async function hasTechBlock(blockTable, parentId) {
  const r = await client.query(
    `SELECT 1 FROM cms."${blockTable}" WHERE _parent_id = $1 AND _path = 'pageBlocks' LIMIT 1`,
    [parentId]
  );
  return r.rowCount > 0;
}

/**
 * Shift any existing blocks with _order >= 2 up by 1, and return slot 2
 * as the _order for the new tech block. This places tech right after the
 * first content block to match the previous inline rendering position.
 */
async function insertAfterFirstBlock(parentTable, parentId) {
  const tables = await blockTablesFor(parentTable);
  const slot = 2;
  for (const table_name of tables) {
    await client.query(
      `UPDATE cms."${table_name}" SET _order = _order + 1 WHERE _parent_id = $1 AND _path = 'pageBlocks' AND _order >= $2`,
      [parentId, slot]
    );
  }
  return slot;
}

async function portForTreatments() {
  const rows = await client.query(`
    SELECT id, name,
           technology_heading, technology_sub_heading,
           technology_image_upload_id, technology_image, technology_image_alt_text
    FROM cms.treatments
    WHERE technology_heading IS NOT NULL AND technology_heading <> ''
    ORDER BY id
  `);
  let added = 0;
  for (const r of rows.rows) {
    if (await hasTechBlock('treatments_blocks_technology', r.id)) continue;
    const order = await insertAfterFirstBlock('treatments', r.id);
    await client.query(`
      INSERT INTO cms.treatments_blocks_technology
        (id, _parent_id, _order, _path, heading, sub_heading, image_upload_id, image, image_alt_text, block_name)
      VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, $7, $8, NULL)
    `, [
      randomUUID(), r.id, order,
      r.technology_heading, r.technology_sub_heading,
      r.technology_image_upload_id, r.technology_image, r.technology_image_alt_text,
    ]);
    added++;
  }
  console.log(`Treatments: ported ${added} technology blocks (scanned ${rows.rows.length} with populated data)`);
}

async function portForConcerns() {
  const rows = await client.query(`
    SELECT id, name,
           technology_heading_text, technology_supporting_text,
           technology_image_upload_id, technology_image_url, technology_image_alt_text
    FROM cms.concerns
    WHERE technology_heading_text IS NOT NULL AND technology_heading_text <> ''
    ORDER BY id
  `);
  let added = 0;
  for (const r of rows.rows) {
    if (await hasTechBlock('concerns_blocks_technology', r.id)) continue;
    const order = await insertAfterFirstBlock('concerns', r.id);
    await client.query(`
      INSERT INTO cms.concerns_blocks_technology
        (id, _parent_id, _order, _path, heading, sub_heading, image_upload_id, image, image_alt_text, block_name)
      VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, $7, $8, NULL)
    `, [
      randomUUID(), r.id, order,
      r.technology_heading_text, r.technology_supporting_text,
      r.technology_image_upload_id, r.technology_image_url, r.technology_image_alt_text,
    ]);
    added++;
  }
  console.log(`Concerns:   ported ${added} technology blocks (scanned ${rows.rows.length} with populated data)`);
}

try {
  await client.query('BEGIN');
  await portForTreatments();
  await portForConcerns();
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.end();
}
