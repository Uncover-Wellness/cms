/**
 * Shared helpers for the port-pages pipeline.
 *
 * Every script in this folder imports from here so the SQL conventions
 * (schema name, embed-preservation rules, block insert shape) stay in
 * one place.
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

export const PRESERVED_EMBEDS = [
  'doctors_embed',
  'testimonials_embed',
  'faqs_embed',
  'booking_form',
];

export async function listBlockTables(client, collection) {
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
    all,
    narrative: all.filter((t) => !preservedTables.includes(t)),
    preserved: all.filter((t) => preservedTables.includes(t)),
  };
}

export async function wipeNarrativeBlocks(client, collection, docId) {
  const { narrative } = await listBlockTables(client, collection);
  let total = 0;
  for (const table of narrative) {
    // Cascade sub-array tables first — they FK to individual block ids.
    const subRes = await client.query(
      `SELECT c.table_name
       FROM information_schema.columns c
       WHERE c.table_schema = 'cms'
         AND c.table_name LIKE $1
         AND c.column_name = '_parent_id'`,
      [`${table}_%`]
    );
    for (const { table_name } of subRes.rows) {
      // Some sub-array tables nest further (e.g. data_table_rows_cells).
      const grandRes = await client.query(
        `SELECT c.table_name
         FROM information_schema.columns c
         WHERE c.table_schema = 'cms'
           AND c.table_name LIKE $1
           AND c.column_name = '_parent_id'`,
        [`${table_name}_%`]
      );
      for (const { table_name: gt } of grandRes.rows) {
        await client.query(
          `DELETE FROM cms."${gt}" WHERE _parent_id IN (
             SELECT id FROM cms."${table_name}" WHERE _parent_id IN (
               SELECT id FROM cms."${table}" WHERE _parent_id = $1 AND _path = 'pageBlocks'
             )
           )`, [docId]);
      }
      await client.query(
        `DELETE FROM cms."${table_name}" WHERE _parent_id IN (
           SELECT id FROM cms."${table}" WHERE _parent_id = $1 AND _path = 'pageBlocks'
         )`,
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

export async function renumberPreservedEmbeds(client, collection, docId, startOrder) {
  const { preserved } = await listBlockTables(client, collection);
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

// ── Block inserters ──────────────────────────────────────────────────────
// Every inserter accepts: (client, collection, docId, order, blockIR)
// and returns the created block's UUID.

async function insertOverviewBlock(client, collection, docId, order, b) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_overview_block"
       (id, _parent_id, _order, _path, eyebrow, heading, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, NULL)`,
    [id, docId, order, b.eyebrow || null, b.heading || null]
  );
  for (let i = 0; i < b.paragraphs.length; i++) {
    await client.query(
      `INSERT INTO cms."${collection}_blocks_overview_block_paragraphs"
         (id, _parent_id, _order, text)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), id, i + 1, b.paragraphs[i]]
    );
  }
  return id;
}

async function insertBenefitsBlock(client, collection, docId, order, b) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_benefits_block"
       (id, _parent_id, _order, _path, eyebrow, heading, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, NULL)`,
    [id, docId, order, b.eyebrow || null, b.heading || null]
  );
  for (let i = 0; i < b.items.length; i++) {
    const item = b.items[i];
    await client.query(
      `INSERT INTO cms."${collection}_blocks_benefits_block_items"
         (id, _parent_id, _order, title, description, icon)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), id, i + 1, item.title, item.description || null, item.icon || 'heart']
    );
  }
  return id;
}

async function insertProcessBlock(client, collection, docId, order, b) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_process_block"
       (id, _parent_id, _order, _path, eyebrow, heading, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, NULL)`,
    [id, docId, order, b.eyebrow || null, b.heading || null]
  );
  for (let i = 0; i < b.steps.length; i++) {
    const step = b.steps[i];
    await client.query(
      `INSERT INTO cms."${collection}_blocks_process_block_steps"
         (id, _parent_id, _order, title, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [randomUUID(), id, i + 1, step.title, step.description || '']
    );
  }
  return id;
}

async function insertImageSlider(client, collection, docId, order, b) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_image_slider"
       (id, _parent_id, _order, _path, eyebrow, heading, aspect_ratio, autoplay_ms, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, $7, NULL)`,
    [id, docId, order, b.eyebrow || null, b.heading || null, b.aspectRatio || '16/9', b.autoplayMs ?? 0]
  );
  for (let i = 0; i < b.images.length; i++) {
    const img = b.images[i];
    await client.query(
      `INSERT INTO cms."${collection}_blocks_image_slider_images"
         (id, _parent_id, _order, image_url, image_alt_text, caption)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), id, i + 1, img.imageUrl, img.imageAltText || null, img.caption || null]
    );
  }
  return id;
}

async function insertDataTable(client, collection, docId, order, b) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO cms."${collection}_blocks_data_table"
       (id, _parent_id, _order, _path, eyebrow, heading, caption, block_name)
     VALUES ($1, $2, $3, 'pageBlocks', $4, $5, $6, NULL)`,
    [id, docId, order, b.eyebrow || null, b.heading || null, b.caption || null]
  );
  for (let i = 0; i < b.columns.length; i++) {
    const col = b.columns[i];
    await client.query(
      `INSERT INTO cms."${collection}_blocks_data_table_columns"
         (id, _parent_id, _order, key, label, align, highlight)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), id, i + 1, col.key, col.label, col.align || 'left', !!col.highlight]
    );
  }
  for (let i = 0; i < b.rows.length; i++) {
    const row = b.rows[i];
    const rowId = randomUUID();
    await client.query(
      `INSERT INTO cms."${collection}_blocks_data_table_rows"
         (id, _parent_id, _order) VALUES ($1, $2, $3)`,
      [rowId, id, i + 1]
    );
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      await client.query(
        `INSERT INTO cms."${collection}_blocks_data_table_rows_cells"
           (id, _parent_id, _order, key, value) VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), rowId, j + 1, cell.key, cell.value]
      );
    }
  }
  return id;
}

const INSERTERS = {
  overviewBlock: insertOverviewBlock,
  benefitsBlock: insertBenefitsBlock,
  processBlock: insertProcessBlock,
  imageSlider: insertImageSlider,
  dataTable: insertDataTable,
};

export async function insertBlock(client, collection, docId, order, block) {
  const fn = INSERTERS[block.type];
  if (!fn) throw new Error(`unknown block type: ${block.type}`);
  return fn(client, collection, docId, order, block);
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
