/**
 * Strip invalid Lexical `upload` nodes from pageBlocks textSection content.
 *
 * Background: scripts/lib/markdown-to-lexical.mjs emitted
 *   { type: 'upload', value: { url, alt } }
 * for standalone markdown images. Payload's Lexical UploadFeature requires
 * `value` to be a media-collection ID (string/number). These URLs were never
 * imported into cms.media, so the editor refuses to render them with:
 *   "Upload value should be a string or number. The Lexical Upload component
 *    should not receive the populated value object."
 *
 * For each affected row we:
 *   1. Walk the Lexical tree and remove every upload node with an object value.
 *   2. Collect the first such node's { url, alt } that was stripped.
 *   3. If the row's `image` column is empty, move url -> image and alt ->
 *      image_alt_text. Otherwise just drop the nodes (image already set).
 *
 * Usage:
 *   DATABASE_URL=... node scripts/strip-lexical-upload-nodes.mjs [--dry-run]
 */

import pg from 'pg';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');

const TABLES = [
  'treatments_blocks_text_section',
  'concerns_blocks_text_section',
];

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function isBadUploadNode(node) {
  return (
    node &&
    typeof node === 'object' &&
    node.type === 'upload' &&
    node.value &&
    typeof node.value === 'object'
  );
}

/**
 * Recursively walk the Lexical tree, removing bad upload nodes from every
 * `children` array. Returns { removed: Array<{url, alt}>, tree }.
 */
function stripUploads(root) {
  const removed = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node.children)) {
      const kept = [];
      for (const child of node.children) {
        if (isBadUploadNode(child)) {
          removed.push({
            url: child.value?.url ?? '',
            alt: child.value?.alt ?? '',
          });
        } else {
          kept.push(child);
          walk(child);
        }
      }
      node.children = kept;
    }
  }
  walk(root);
  return removed;
}

async function processTable(table) {
  const { rows } = await pool.query(
    `SELECT id, _parent_id, content, image, image_alt_text
       FROM cms."${table}"
      WHERE content::text ILIKE $1`,
    ['%"type": "upload"%'],
  );

  let rowsUpdated = 0;
  let nodesStripped = 0;
  let imagesPromoted = 0;

  for (const row of rows) {
    // content is already parsed by pg as an object for jsonb
    const content = row.content;
    if (!content || !content.root) continue;

    const removed = stripUploads(content.root);
    if (removed.length === 0) continue;

    nodesStripped += removed.length;
    rowsUpdated += 1;

    // Promote first stripped image into block.image if empty.
    const hasImage = typeof row.image === 'string' && row.image.trim() !== '';
    let newImage = row.image;
    let newAlt = row.image_alt_text;
    if (!hasImage && removed[0].url) {
      newImage = removed[0].url;
      newAlt = removed[0].alt || row.image_alt_text || '';
      imagesPromoted += 1;
    }

    if (!dryRun) {
      await pool.query(
        `UPDATE cms."${table}"
            SET content = $1::jsonb,
                image = $2,
                image_alt_text = $3
          WHERE id = $4`,
        [JSON.stringify(content), newImage, newAlt, row.id],
      );
    }
  }

  return { scanned: rows.length, rowsUpdated, nodesStripped, imagesPromoted };
}

(async () => {
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);
  let totals = { scanned: 0, rowsUpdated: 0, nodesStripped: 0, imagesPromoted: 0 };
  for (const table of TABLES) {
    const res = await processTable(table);
    console.log(
      `  ${table}: scanned=${res.scanned} rows_updated=${res.rowsUpdated} ` +
        `nodes_stripped=${res.nodesStripped} images_promoted=${res.imagesPromoted}`,
    );
    totals.scanned += res.scanned;
    totals.rowsUpdated += res.rowsUpdated;
    totals.nodesStripped += res.nodesStripped;
    totals.imagesPromoted += res.imagesPromoted;
  }
  console.log(
    `TOTAL: scanned=${totals.scanned} rows_updated=${totals.rowsUpdated} ` +
      `nodes_stripped=${totals.nodesStripped} images_promoted=${totals.imagesPromoted}`,
  );
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
