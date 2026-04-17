/**
 * Shared helpers for the port-pages pipeline.
 *
 * Every script in this folder imports from here so the SQL conventions
 * (schema name, embed-preservation rules, Lexical wrappers) stay in one place.
 */
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadEnv() {
  const envPath = resolve(__dirname, '..', '..', '.env');
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

export async function connect() {
  loadEnv();
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query('SET search_path TO cms, public');
  return client;
}

// Blocks that are reused across pages and should be preserved when re-porting
// narrative content. These are re-ordered to sit at the end of pageBlocks.
export const PRESERVED_EMBEDS = [
  'doctors_embed',
  'testimonials_embed',
  'faqs_embed',
  'booking_form',
];

export async function listNarrativeBlockTables(client, collection) {
  const res = await client.query(
    `SELECT DISTINCT c.table_name
     FROM information_schema.columns c
     WHERE c.table_schema = 'cms'
       AND c.table_name LIKE $1
       AND c.column_name = '_path'`,
    [`${collection}_blocks_%`]
  );
  const all = res.rows.map((r) => r.table_name);
  const prefix = `${collection}_blocks_`;
  const preservedTables = PRESERVED_EMBEDS.map((t) => prefix + t);
  return {
    narrative: all.filter((t) => !preservedTables.includes(t)),
    preserved: all.filter((t) => preservedTables.includes(t)),
  };
}

export async function wipeNarrativeBlocks(client, collection, docId) {
  const { narrative } = await listNarrativeBlockTables(client, collection);
  let total = 0;
  for (const table of narrative) {
    const subTablesRes = await client.query(
      `SELECT c.table_name
       FROM information_schema.columns c
       WHERE c.table_schema = 'cms'
         AND c.table_name LIKE $1
         AND c.column_name = '_parent_id'`,
      [`${table}_%`]
    );
    for (const { table_name } of subTablesRes.rows) {
      await client.query(
        `DELETE FROM cms."${table_name}" WHERE _parent_id IN (SELECT id FROM cms."${table}" WHERE _parent_id = $1 AND _path = 'pageBlocks')`,
        [docId]
      );
    }
    const r = await client.query(
      `DELETE FROM cms."${table}" WHERE _parent_id = $1 AND _path = 'pageBlocks'`,
      [docId]
    );
    total += r.rowCount;
  }
  return total;
}

// Push preserved embeds (doctors / testimonials / faqs / booking_form) to
// contiguous _order values starting at startOrder, so narrative blocks at
// _order < startOrder render before them.
export async function renumberPreservedEmbeds(client, collection, docId, startOrder) {
  const { preserved } = await listNarrativeBlockTables(client, collection);
  const rows = [];
  for (const table of preserved) {
    const r = await client.query(
      `SELECT id, _order, '${table}' AS table_name FROM cms."${table}" WHERE _parent_id = $1 AND _path = 'pageBlocks'`,
      [docId]
    );
    for (const row of r.rows) rows.push(row);
  }
  rows.sort((a, b) => Number(a._order) - Number(b._order));
  let o = startOrder;
  for (const row of rows) {
    await client.query(
      `UPDATE cms."${row.table_name}" SET _order = $1 WHERE id = $2`,
      [o, row.id]
    );
    o += 1;
  }
  return rows.length;
}

// ── Block writers ────────────────────────────────────────────────────────
export async function insertTextSection(client, collection, parentId, order, heading, content, image = null, imageAlt = null) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_text_section"
      (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, $7, NULL)`,
    [id, parentId, order, heading, JSON.stringify(content), image, imageAlt]
  );
  return id;
}

export async function insertFaqsInline(client, collection, parentDocId, faqs) {
  const { rows: [embed] } = await client.query(
    `SELECT id FROM cms."${collection}_blocks_faqs_embed"
     WHERE _parent_id = $1 AND _path = 'pageBlocks' ORDER BY _order LIMIT 1`,
    [parentDocId]
  );
  if (!embed) return 0;
  await client.query(
    `DELETE FROM cms."${collection}_blocks_faqs_embed_inline_faqs" WHERE _parent_id = $1`,
    [embed.id]
  );
  for (let i = 0; i < faqs.length; i++) {
    await client.query(
      `INSERT INTO cms."${collection}_blocks_faqs_embed_inline_faqs"
        (id, _parent_id, _order, question, answer)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), embed.id, i + 1, faqs[i].question, faqs[i].answer]
    );
  }
  return faqs.length;
}
