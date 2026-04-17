#!/usr/bin/env node
/**
 * Idempotent migration: append doctorsEmbed / testimonialsEmbed / faqsEmbed
 * to each Treatment's pageBlocks, and doctorsEmbed / faqsEmbed to each
 * Concern's pageBlocks. These sections used to be hardcoded at the tail of
 * TreatmentLayout.astro / ConcernLayout.astro; after this migration they
 * live inside pageBlocks so editors can re-rank them relative to content
 * blocks.
 *
 * Idempotency: if a treatment already has any block of a given type at
 * _path='pageBlocks', the corresponding INSERT is skipped so editors'
 * manual placements are never clobbered.
 *
 * Run: node scripts/append-default-embed-blocks.mjs
 */

import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Manual .env load (avoids dotenv dependency)
const envPath = resolve(__dirname, '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

async function maxOrderFor(parentTable, parentId) {
  // Union _order across every top-level block table for this parent.
  // Nested sub-tables (e.g. *_items, *_rows) don't have _path — filter them
  // out by checking for the column first.
  const blockTablesRes = await client.query(`
    SELECT DISTINCT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'cms'
      AND c.table_name LIKE $1
      AND c.column_name = '_path'
  `, [`${parentTable}_blocks_%`]);

  let max = 0;
  for (const { table_name } of blockTablesRes.rows) {
    const r = await client.query(
      `SELECT COALESCE(MAX(_order), 0) AS m FROM cms."${table_name}" WHERE _parent_id = $1 AND _path = 'pageBlocks'`,
      [parentId]
    );
    if (r.rows[0].m > max) max = Number(r.rows[0].m);
  }
  return max;
}

async function hasBlockOfType(blockTable, parentId) {
  const r = await client.query(
    `SELECT 1 FROM cms."${blockTable}" WHERE _parent_id = $1 AND _path = 'pageBlocks' LIMIT 1`,
    [parentId]
  );
  return r.rowCount > 0;
}

async function appendForTreatments() {
  const treatments = await client.query('SELECT id, name FROM cms.treatments ORDER BY id');
  let added = 0;
  for (const t of treatments.rows) {
    let order = await maxOrderFor('treatments', t.id);
    const name = t.name || 'this treatment';

    if (!(await hasBlockOfType('treatments_blocks_doctors_embed', t.id))) {
      order += 1;
      await client.query(`
        INSERT INTO cms.treatments_blocks_doctors_embed
          (id, _parent_id, _order, _path, eyebrow, heading, "limit", block_name)
        VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, NULL)
      `, [randomUUID(), t.id, order, 'Your Doctors', `Expert ${name} Specialists`, 6]);
      added++;
    }

    if (!(await hasBlockOfType('treatments_blocks_testimonials_embed', t.id))) {
      order += 1;
      await client.query(`
        INSERT INTO cms.treatments_blocks_testimonials_embed
          (id, _parent_id, _order, _path, eyebrow, heading, "limit", block_name)
        VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, NULL)
      `, [randomUUID(), t.id, order, 'Patient Stories', `What Our ${name} Clients Say`, 6]);
      added++;
    }

    if (!(await hasBlockOfType('treatments_blocks_faqs_embed', t.id))) {
      order += 1;
      await client.query(`
        INSERT INTO cms.treatments_blocks_faqs_embed
          (id, _parent_id, _order, _path, heading, block_name)
        VALUES ($1, $2, $3, 'pageBlocks', $4, NULL)
      `, [randomUUID(), t.id, order, 'Frequently Asked Questions']);
      added++;
    }
  }
  console.log(`Treatments: appended ${added} default embed blocks across ${treatments.rows.length} docs`);
}

async function appendForConcerns() {
  const concerns = await client.query('SELECT id, name FROM cms.concerns ORDER BY id');
  let added = 0;
  for (const c of concerns.rows) {
    let order = await maxOrderFor('concerns', c.id);
    const name = c.name || 'this concern';

    if (!(await hasBlockOfType('concerns_blocks_doctors_embed', c.id))) {
      order += 1;
      await client.query(`
        INSERT INTO cms.concerns_blocks_doctors_embed
          (id, _parent_id, _order, _path, eyebrow, heading, "limit", block_name)
        VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, NULL)
      `, [randomUUID(), c.id, order, 'Your Doctors', `Expert ${name} Specialists`, 6]);
      added++;
    }

    if (!(await hasBlockOfType('concerns_blocks_faqs_embed', c.id))) {
      order += 1;
      await client.query(`
        INSERT INTO cms.concerns_blocks_faqs_embed
          (id, _parent_id, _order, _path, heading, block_name)
        VALUES ($1, $2, $3, 'pageBlocks', $4, NULL)
      `, [randomUUID(), c.id, order, 'Frequently Asked Questions']);
      added++;
    }
  }
  console.log(`Concerns:   appended ${added} default embed blocks across ${concerns.rows.length} docs`);
}

try {
  await client.query('BEGIN');
  await appendForTreatments();
  await appendForConcerns();
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.end();
}
