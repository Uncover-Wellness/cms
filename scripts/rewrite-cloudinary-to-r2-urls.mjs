/**
 * Rewrite every legacy Cloudinary URL in the DB to its R2 equivalent.
 *
 * Targets (from scan):
 *   - cms.media.url                         (824 rows)
 *   - cms.service_categories.image_links    (4 rows, rich-text HTML blob)
 *   - cms._service_categories_v.version_image_links  (4 rows, versioned copy)
 *
 * For media, the stored `url` is stale: we already normalized filenames, so
 * we rebuild from the filename column rather than parsing the old URL.
 *
 * For service_categories.image_links we do a textual regex swap:
 *   res.cloudinary.com/dfshgfllv/image/upload/<optional prefix>/uncover-cms/<name>
 *   -> media.uncover.co.in/uncover-cms/<name>
 *
 * Usage:
 *   DATABASE_URL=... R2_PUBLIC_BASE=https://media.uncover.co.in \
 *   node scripts/rewrite-cloudinary-to-r2-urls.mjs [--dry-run]
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const R2_PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || 'https://media.uncover.co.in').replace(/\/+$/, '');
const FOLDER = 'uncover-cms';
const dryRun = process.argv.includes('--dry-run');

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Regex for any Cloudinary URL in the dfshgfllv account that points at the
 * uncover-cms folder. Captures the filename for rewrite.
 */
const cloudinaryUrlRegex =
  /https:\/\/res\.cloudinary\.com\/dfshgfllv\/image\/upload\/(?:[^\s/"'<>]+\/)*uncover-cms\/([^\s/"'<>]+)/g;

/**
 * If a raster extension slipped through, normalize to .webp (to match the
 * R2 keys post-normalize). SVGs stay SVG.
 */
function toR2Key(filename) {
  return filename.replace(/\.(avif|png|jpe?g|gif)$/i, '.webp');
}

function rewriteText(text) {
  if (!text) return { text, count: 0 };
  let count = 0;
  const out = text.replace(cloudinaryUrlRegex, (_, filename) => {
    count += 1;
    return `${R2_PUBLIC_BASE}/${FOLDER}/${toR2Key(filename)}`;
  });
  return { text: out, count };
}

async function rewriteMediaUrls() {
  const rows = await pool.query(
    `SELECT id, filename, url
       FROM cms.media
      WHERE url LIKE 'https://res.cloudinary.com/dfshgfllv/%'`,
  );
  console.log(`cms.media: ${rows.rowCount} rows to rewrite`);

  let done = 0;
  for (const r of rows.rows) {
    if (!r.filename) {
      console.warn(`  [${r.id}] no filename, skipping`);
      continue;
    }
    const newUrl = `${R2_PUBLIC_BASE}/${FOLDER}/${r.filename}`;
    if (dryRun) {
      if (done < 5) console.log(`  [${r.id}] ${r.url} -> ${newUrl}`);
      done += 1;
      continue;
    }
    await pool.query('UPDATE cms.media SET url = $1 WHERE id = $2', [newUrl, r.id]);
    done += 1;
  }
  console.log(`cms.media: rewrote ${done}`);
  return done;
}

async function rewriteCategoryBlobs(table, column) {
  const idCol = table.startsWith('_') ? 'id' : 'id'; // both have id
  const rows = await pool.query(
    `SELECT ${idCol} AS id, ${JSON.stringify(column).replaceAll('"', '"')} AS val
       FROM cms.${JSON.stringify(table).replaceAll('"', '"')}
      WHERE ${JSON.stringify(column).replaceAll('"', '"')}::text LIKE '%res.cloudinary.com/dfshgfllv/%'`
      .replaceAll('"', '"'),
  );
  console.log(`${table}.${column}: ${rows.rowCount} rows`);

  let total = 0;
  for (const r of rows.rows) {
    const { text, count } = rewriteText(r.val);
    total += count;
    if (dryRun) {
      console.log(`  [${r.id}] ${count} URLs swapped (first 120 chars: ${String(text).slice(0, 120)}...)`);
      continue;
    }
    await pool.query(
      `UPDATE cms.${table} SET "${column}" = $1 WHERE id = $2`,
      [text, r.id],
    );
  }
  console.log(`${table}.${column}: rewrote ${total} URLs across ${rows.rowCount} rows`);
  return total;
}

async function rewriteCategorySimple(table, column) {
  const rows = await pool.query(
    `SELECT id, "${column}" AS val FROM cms."${table}"
      WHERE "${column}"::text LIKE '%res.cloudinary.com/dfshgfllv/%'`,
  );
  let total = 0;
  for (const r of rows.rows) {
    const { text, count } = rewriteText(r.val);
    total += count;
    if (dryRun) {
      console.log(`  [${r.id}] ${count} URLs swapped`);
      continue;
    }
    await pool.query(
      `UPDATE cms."${table}" SET "${column}" = $1 WHERE id = $2`,
      [text, r.id],
    );
  }
  console.log(`${table}.${column}: ${total} URLs across ${rows.rowCount} rows`);
  return total;
}

async function main() {
  console.log(`Rewrite Cloudinary -> R2 ${dryRun ? '[DRY RUN]' : ''}`);
  console.log(`R2 base: ${R2_PUBLIC_BASE}`);
  console.log();

  await rewriteMediaUrls();
  console.log();
  await rewriteCategorySimple('service_categories', 'image_links');
  console.log();
  await rewriteCategorySimple('_service_categories_v', 'version_image_links');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
