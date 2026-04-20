/**
 * Rewrite every `/images/<path>.<ext>` reference in the DB to an absolute R2
 * URL under the `static/` prefix on media.uncover.co.in. Any raster extension
 * (avif/png/jpg/jpeg/gif) is remapped to .webp to match the keys produced by
 * scripts/migrate-static-images-to-r2.mjs. SVG stays SVG.
 *
 * Targets identified by scripts/scan-relative-image-refs.mjs:
 *   concerns.header_image_url                     (12)
 *   _concerns_v.version_header_image_url          (12)
 *   service_categories.thumbnail_image_url        (4)
 *   _service_categories_v.version_thumbnail_image_url (4)
 *   treatments.hero_main_image                    (64)
 *   _treatments_v.version_hero_main_image         (64)
 *   concerns_blocks_text_section.content          (20)  -- Lexical JSON
 *   treatments_blocks_text_section.content        (249) -- Lexical JSON
 *
 * For the simple URL columns a whole-value rewrite is done (the value IS
 * the path). For the Lexical blobs a textual regex swap is done on the
 * JSON string. URLs inside Lexical appear as plain JSON strings, never
 * contain quotes, so a regex swap is safe.
 *
 * Usage:
 *   DATABASE_URL=... R2_PUBLIC_BASE=https://media.uncover.co.in \
 *   node scripts/rewrite-relative-images-to-r2.mjs [--dry-run]
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const R2_PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || 'https://media.uncover.co.in').replace(/\/+$/, '');
const PREFIX = 'static';
const dryRun = process.argv.includes('--dry-run');

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/** Map a relative /images/<path>.<ext> to the R2 static URL, webp-ifying rasters. */
function toR2Url(relPath) {
  const clean = relPath.replace(/^\/images\//, '');
  const webpified = clean.replace(/\.(avif|png|jpe?g|gif)$/i, '.webp');
  return `${R2_PUBLIC_BASE}/${PREFIX}/${webpified}`;
}

/** Rewrite every occurrence inside a text/JSON blob. */
function rewriteAllInBlob(text) {
  if (!text) return { out: text, count: 0 };
  let count = 0;
  // /images/... up to the first whitespace, quote, closing bracket, or end
  const out = text.replace(/\/images\/[A-Za-z0-9._\/-]+\.(?:avif|png|jpe?g|gif|webp|svg)/gi, (m) => {
    count += 1;
    return toR2Url(m);
  });
  return { out, count };
}

async function rewriteSimple(table, column) {
  const rows = await pool.query(
    `SELECT id, "${column}" AS val FROM cms."${table}"
      WHERE "${column}"::text LIKE '/images/%'`,
  );
  let updated = 0;
  for (const r of rows.rows) {
    const newUrl = toR2Url(r.val);
    if (r.val === newUrl) continue;
    if (dryRun) {
      if (updated < 3) console.log(`  [${r.id}] ${r.val} -> ${newUrl}`);
    } else {
      await pool.query(`UPDATE cms."${table}" SET "${column}" = $1 WHERE id = $2`, [newUrl, r.id]);
    }
    updated += 1;
  }
  console.log(`${table}.${column}: ${updated}/${rows.rowCount} rewritten`);
  return updated;
}

async function rewriteBlob(table, column) {
  const rows = await pool.query(
    `SELECT id, "${column}"::text AS val FROM cms."${table}"
      WHERE "${column}"::text ~ '/images/'`,
  );
  let totalUrls = 0;
  let updated = 0;
  for (const r of rows.rows) {
    const { out, count } = rewriteAllInBlob(r.val);
    if (count === 0) continue;
    totalUrls += count;
    if (dryRun) {
      if (updated < 2) console.log(`  [${r.id}] ${count} URLs swapped`);
    } else {
      await pool.query(`UPDATE cms."${table}" SET "${column}" = $1::jsonb WHERE id = $2`, [out, r.id]);
    }
    updated += 1;
  }
  console.log(`${table}.${column}: ${updated}/${rows.rowCount} rows, ${totalUrls} URL swaps`);
  return totalUrls;
}

async function main() {
  console.log(`Rewrite /images/ -> R2 static URL ${dryRun ? '[DRY RUN]' : ''}`);
  console.log(`R2 base: ${R2_PUBLIC_BASE}/${PREFIX}`);
  console.log();

  // Simple URL columns
  for (const [t, c] of [
    ['service_categories', 'thumbnail_image_url'],
    ['_service_categories_v', 'version_thumbnail_image_url'],
    ['concerns', 'header_image_url'],
    ['_concerns_v', 'version_header_image_url'],
    ['treatments', 'hero_main_image'],
    ['_treatments_v', 'version_hero_main_image'],
  ]) {
    await rewriteSimple(t, c);
  }
  console.log();

  // Lexical blobs (stored as jsonb)
  for (const [t, c] of [
    ['concerns_blocks_text_section', 'content'],
    ['treatments_blocks_text_section', 'content'],
  ]) {
    await rewriteBlob(t, c);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
