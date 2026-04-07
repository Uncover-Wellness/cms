/**
 * Migrate ALL image URL fields to Cloudinary Media documents.
 * Uploads server-to-server (Cloudinary fetches from source URL).
 * Processes in batches of 50.
 *
 * Usage:
 *   DATABASE_URL=... CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... \
 *   node scripts/migrate-all-images.mjs [--dry-run] [--collection treatments]
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const dryRun = process.argv.includes('--dry-run');
const collectionFilter = process.argv.includes('--collection')
  ? process.argv[process.argv.indexOf('--collection') + 1]
  : null;
const BATCH_SIZE = 50;

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!CLOUD_NAME || !API_KEY || !API_SECRET) { console.error('CLOUDINARY env vars not set'); process.exit(1); }

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

let cloudinaryInstance = null;
async function getCloudinary() {
  if (!cloudinaryInstance) {
    const { v2 } = await import('cloudinary');
    v2.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });
    cloudinaryInstance = v2;
  }
  return cloudinaryInstance;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
}

/** Upload to Cloudinary from URL, returns { url, width, height, filesize, format } */
async function uploadFromUrl(sourceUrl, publicId) {
  const cloudinary = await getCloudinary();
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: 'uncover-cms',
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
  });
  return {
    url: result.secure_url,
    width: result.width,
    height: result.height,
    filesize: result.bytes,
    format: result.format,
  };
}

/** Create a Media document in the DB, returns the ID */
async function createMediaDoc(client, { url, filename, alt, mimeType, width, height, filesize }) {
  const { rows: [doc] } = await client.query(`
    INSERT INTO cms.media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y, _status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 50, 'published', now(), now())
    RETURNING id
  `, [alt, url, filename, mimeType, filesize, width, height]);
  return doc.id;
}

// Cache: URL → Media ID (avoid re-uploading duplicate URLs)
const urlCache = new Map();

async function migrateUrl(client, sourceUrl, publicId, altText) {
  if (!sourceUrl || sourceUrl.trim() === '') return null;

  // Check cache
  if (urlCache.has(sourceUrl)) return urlCache.get(sourceUrl);

  try {
    const result = await uploadFromUrl(sourceUrl, publicId);
    const mimeType = `image/${result.format === 'jpg' ? 'jpeg' : result.format}`;
    const filename = `${publicId}.${result.format}`;
    const mediaId = await createMediaDoc(client, {
      url: result.url, filename, alt: altText, mimeType,
      width: result.width, height: result.height, filesize: result.filesize,
    });
    urlCache.set(sourceUrl, mediaId);
    return mediaId;
  } catch (err) {
    console.error(`    ✗ Upload failed for ${sourceUrl}: ${err.message}`);
    return null;
  }
}

/**
 * Migrate a simple column: table.urlColumn → table.imageIdColumn
 */
async function migrateSimpleColumn(client, {
  table, versionTable, urlColumn, idColumn, nameColumn,
  label, slugPrefix,
}) {
  // Ensure ID column exists
  await client.query(`ALTER TABLE cms.${table} ADD COLUMN IF NOT EXISTS ${idColumn} integer`);
  if (versionTable) {
    await client.query(`ALTER TABLE cms.${versionTable} ADD COLUMN IF NOT EXISTS version_${idColumn} integer`);
  }

  const { rows } = await client.query(`
    SELECT id, ${nameColumn} as name, ${urlColumn} as url
    FROM cms.${table}
    WHERE ${urlColumn} IS NOT NULL AND ${urlColumn} != ''
      AND (${idColumn} IS NULL)
    ORDER BY id
  `);

  if (rows.length === 0) {
    console.log(`  ${label}: 0 to migrate (all done)`);
    return 0;
  }

  console.log(`  ${label}: ${rows.length} to migrate`);
  let migrated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    console.log(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} (${batch.length} items)`);

    if (dryRun) { migrated += batch.length; continue; }

    // Upload all items in batch in parallel
    const results = await Promise.allSettled(batch.map(async (row) => {
      const publicId = `${slugPrefix}-${slugify(row.name || String(row.id))}`;
      const mediaId = await migrateUrl(client, row.url, publicId, `${label}: ${row.name || row.id}`);
      if (mediaId) {
        await client.query(`UPDATE cms.${table} SET ${idColumn} = $1 WHERE id = $2`, [mediaId, row.id]);
        if (versionTable) {
          await client.query(`UPDATE cms.${versionTable} SET version_${idColumn} = $1 WHERE parent_id = $2 AND latest = true`, [mediaId, row.id]);
        }
        return true;
      }
      return false;
    }));

    migrated += results.filter(r => r.status === 'fulfilled' && r.value).length;
  }

  console.log(`    ${migrated} migrated`);
  return migrated;
}

/**
 * Migrate a sub-table column: subtable.urlColumn → subtable.imageIdColumn
 */
async function migrateSubTableColumn(client, {
  subTable, versionSubTable, urlColumn, idColumn,
  parentTable, parentNameColumn, label, slugPrefix,
}) {
  await client.query(`ALTER TABLE cms.${subTable} ADD COLUMN IF NOT EXISTS ${idColumn} integer`);
  if (versionSubTable) {
    await client.query(`ALTER TABLE cms.${versionSubTable} ADD COLUMN IF NOT EXISTS ${idColumn} integer`);
  }

  const { rows } = await client.query(`
    SELECT s.id, s._parent_id, s._order, s.${urlColumn} as url, p.${parentNameColumn} as parent_name
    FROM cms.${subTable} s
    JOIN cms.${parentTable} p ON p.id = s._parent_id
    WHERE s.${urlColumn} IS NOT NULL AND s.${urlColumn} != ''
      AND (s.${idColumn} IS NULL)
    ORDER BY s._parent_id, s._order
  `);

  if (rows.length === 0) {
    console.log(`  ${label}: 0 to migrate`);
    return 0;
  }

  console.log(`  ${label}: ${rows.length} to migrate`);
  let migrated = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    console.log(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} (${batch.length} items)`);

    if (dryRun) { migrated += batch.length; continue; }

    const results = await Promise.allSettled(batch.map(async (row) => {
      const publicId = `${slugPrefix}-${slugify(row.parent_name || String(row._parent_id))}-${row._order}`;
      const mediaId = await migrateUrl(client, row.url, publicId, `${label}: ${row.parent_name} #${row._order}`);
      if (mediaId) {
        await client.query(`UPDATE cms.${subTable} SET ${idColumn} = $1 WHERE id = $2`, [mediaId, row.id]);
        return true;
      }
      return false;
    }));

    migrated += results.filter(r => r.status === 'fulfilled' && r.value).length;
  }

  console.log(`    ${migrated} migrated`);
  return migrated;
}

// ── Main ──

async function main() {
  const client = await pool.connect();
  let total = 0;

  try {
    const collections = {
      treatments: async () => {
        console.log('\n=== TREATMENTS ===');
        total += await migrateSimpleColumn(client, {
          table: 'treatments', versionTable: '_treatments_v',
          urlColumn: 'hero_main_image', idColumn: 'hero_main_image_id',
          nameColumn: 'name', label: 'Hero image', slugPrefix: 'treatment-hero',
        });
        total += await migrateSimpleColumn(client, {
          table: 'treatments', versionTable: '_treatments_v',
          urlColumn: 'technology_image', idColumn: 'technology_image_id',
          nameColumn: 'name', label: 'Technology image', slugPrefix: 'treatment-tech',
        });
        total += await migrateSubTableColumn(client, {
          subTable: 'treatments_content_sections',
          versionSubTable: '_treatments_v_version_content_sections',
          urlColumn: 'image', idColumn: 'image_id',
          parentTable: 'treatments', parentNameColumn: 'name',
          label: 'Content section images', slugPrefix: 'treatment-section',
        });
      },

      concerns: async () => {
        console.log('\n=== CONCERNS ===');
        total += await migrateSimpleColumn(client, {
          table: 'concerns', versionTable: '_concerns_v',
          urlColumn: 'icon_image_url', idColumn: 'icon_image_id',
          nameColumn: 'name', label: 'Icon image', slugPrefix: 'concern-icon',
        });
        total += await migrateSimpleColumn(client, {
          table: 'concerns', versionTable: '_concerns_v',
          urlColumn: 'header_image_url', idColumn: 'header_image_id',
          nameColumn: 'name', label: 'Header image', slugPrefix: 'concern-header',
        });
        total += await migrateSimpleColumn(client, {
          table: 'concerns', versionTable: '_concerns_v',
          urlColumn: 'technology_image_url', idColumn: 'technology_image_id',
          nameColumn: 'name', label: 'Technology image', slugPrefix: 'concern-tech',
        });
        total += await migrateSubTableColumn(client, {
          subTable: 'concerns_text_sections',
          versionSubTable: '_concerns_v_version_text_sections',
          urlColumn: 'image_url', idColumn: 'image_id',
          parentTable: 'concerns', parentNameColumn: 'name',
          label: 'Text section images', slugPrefix: 'concern-section',
        });
      },

      'blog-posts': async () => {
        console.log('\n=== BLOG POSTS ===');
        total += await migrateSimpleColumn(client, {
          table: 'blog_posts', versionTable: '_blog_posts_v',
          urlColumn: 'featured_image_url', idColumn: 'featured_image_id',
          nameColumn: 'name', label: 'Featured image', slugPrefix: 'blog-featured',
        });
        total += await migrateSimpleColumn(client, {
          table: 'blog_posts', versionTable: '_blog_posts_v',
          urlColumn: 'thumbnail_image_v2_url', idColumn: 'thumbnail_image_v2_id',
          nameColumn: 'name', label: 'Thumbnail V2', slugPrefix: 'blog-thumb',
        });
      },

      locations: async () => {
        console.log('\n=== LOCATIONS ===');
        total += await migrateSimpleColumn(client, {
          table: 'locations', versionTable: '_locations_v',
          urlColumn: 'clinic_photo_url', idColumn: 'clinic_photo_id',
          nameColumn: 'name', label: 'Clinic photo', slugPrefix: 'location',
        });
      },

      testimonials: async () => {
        console.log('\n=== TESTIMONIALS ===');
        total += await migrateSimpleColumn(client, {
          table: 'testimonials', versionTable: '_testimonials_v',
          urlColumn: 'client_photo_url', idColumn: 'client_photo_id',
          nameColumn: 'name', label: 'Client photo', slugPrefix: 'testimonial',
        });
      },

      'video-testimonials': async () => {
        console.log('\n=== VIDEO TESTIMONIALS ===');
        total += await migrateSimpleColumn(client, {
          table: 'video_testimonials', versionTable: '_video_testimonials_v',
          urlColumn: 'video_thumbnail_url', idColumn: 'video_thumbnail_id',
          nameColumn: 'name', label: 'Video thumbnail', slugPrefix: 'video-testimonial',
        });
      },

      'treatment-costs': async () => {
        console.log('\n=== TREATMENT COSTS ===');
        total += await migrateSimpleColumn(client, {
          table: 'treatment_costs', versionTable: '_treatment_costs_v',
          urlColumn: 'package_image_url', idColumn: 'package_image_id',
          nameColumn: 'name', label: 'Package image', slugPrefix: 'cost-package',
        });
      },

      'landing-pages': async () => {
        console.log('\n=== LANDING PAGES ===');
        total += await migrateSimpleColumn(client, {
          table: 'landing_pages', versionTable: '_landing_pages_v',
          urlColumn: 'hero_image_url', idColumn: 'hero_image_id',
          nameColumn: 'name', label: 'Hero image', slugPrefix: 'landing-hero',
        });
      },

      lps: async () => {
        console.log('\n=== LPs ===');
        total += await migrateSimpleColumn(client, {
          table: 'lps', versionTable: '_lps_v',
          urlColumn: 'hero_image_url', idColumn: 'hero_image_id',
          nameColumn: 'name', label: 'Hero image', slugPrefix: 'lp-hero',
        });
      },

      'service-categories': async () => {
        console.log('\n=== SERVICE CATEGORIES ===');
        total += await migrateSimpleColumn(client, {
          table: 'service_categories', versionTable: '_service_categories_v',
          urlColumn: 'thumbnail_image_url', idColumn: 'thumbnail_image_id',
          nameColumn: 'name', label: 'Thumbnail', slugPrefix: 'servicecat-thumb',
        });
        total += await migrateSimpleColumn(client, {
          table: 'service_categories', versionTable: '_service_categories_v',
          urlColumn: 'featured_image_url', idColumn: 'featured_image_id',
          nameColumn: 'name', label: 'Featured', slugPrefix: 'servicecat-featured',
        });
      },
    };

    if (collectionFilter) {
      if (collections[collectionFilter]) {
        await collections[collectionFilter]();
      } else {
        console.error(`Unknown collection: ${collectionFilter}`);
        console.log('Available:', Object.keys(collections).join(', '));
        process.exit(1);
      }
    } else {
      for (const [name, fn] of Object.entries(collections)) {
        await fn();
      }
    }

    console.log(`\n=== TOTAL: ${total} images migrated ===${dryRun ? ' [DRY RUN]' : ''}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
