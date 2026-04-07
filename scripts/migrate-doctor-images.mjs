/**
 * Migrate doctor portrait images from URL text fields to Media uploads.
 *
 * Uses Cloudinary's server-to-server URL upload — no download needed.
 * Cloudinary fetches the image directly from the Webflow CDN.
 *
 * For each doctor:
 * 1. Tell Cloudinary to upload from the Webflow URL (server-to-server)
 * 2. Create a Media document in Payload with the Cloudinary URL
 * 3. Update the doctor record to reference the Media document ID
 *
 * Usage:
 *   DATABASE_URL=... \
 *   CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... \
 *   node scripts/migrate-doctor-images.mjs [--dry-run]
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const dryRun = process.argv.includes('--dry-run');

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!CLOUD_NAME || !API_KEY || !API_SECRET) { console.error('CLOUDINARY env vars not set'); process.exit(1); }

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

/** Upload an image to Cloudinary directly from a URL (server-to-server) */
async function uploadFromUrl(sourceUrl, publicId, folder) {
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder,
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

/** Create a slug from doctor name */
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
}

async function main() {
  const client = await pool.connect();

  try {
    // Ensure portrait_image_id column exists
    await client.query(`ALTER TABLE cms.doctors ADD COLUMN IF NOT EXISTS portrait_image_id integer`);
    await client.query(`ALTER TABLE cms._doctors_v ADD COLUMN IF NOT EXISTS version_portrait_image_id integer`);

    const { rows: doctors } = await client.query(`
      SELECT id, name, portrait_image_url
      FROM cms.doctors
      WHERE portrait_image_url IS NOT NULL AND portrait_image_url != ''
        AND (portrait_image_id IS NULL OR portrait_image_id = 0)
      ORDER BY order_index ASC NULLS LAST
    `);

    console.log(`Found ${doctors.length} doctors to migrate`);

    let migrated = 0, failed = 0;

    for (const doctor of doctors) {
      const slug = slugify(doctor.name);
      console.log(`\n[${doctor.id}] ${doctor.name}`);
      console.log(`  Source: ${doctor.portrait_image_url}`);

      if (dryRun) {
        console.log(`  [DRY RUN] Would upload to Cloudinary and create Media doc`);
        migrated++;
        continue;
      }

      try {
        // 1. Upload to Cloudinary directly from URL
        console.log(`  Uploading to Cloudinary (server-to-server)...`);
        const result = await uploadFromUrl(
          doctor.portrait_image_url,
          slug,
          'uncover-cms'
        );
        console.log(`  Cloudinary: ${result.url} (${result.width}x${result.height})`);

        // 2. Create Media document in DB
        const mimeType = `image/${result.format === 'jpg' ? 'jpeg' : result.format}`;
        const filename = `${slug}.${result.format}`;

        const { rows: [mediaDoc] } = await client.query(`
          INSERT INTO cms.media (alt, url, filename, mime_type, filesize, width, height, focal_x, focal_y, _status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 50, 'published', now(), now())
          RETURNING id
        `, [
          `Portrait of ${doctor.name}`,
          result.url,
          filename,
          mimeType,
          result.filesize,
          result.width,
          result.height,
        ]);

        console.log(`  Media doc created: ID ${mediaDoc.id}`);

        // 3. Update doctor record
        await client.query(
          `UPDATE cms.doctors SET portrait_image_id = $1 WHERE id = $2`,
          [mediaDoc.id, doctor.id]
        );
        await client.query(
          `UPDATE cms._doctors_v SET version_portrait_image_id = $1
           WHERE parent_id = $2 AND latest = true`,
          [mediaDoc.id, doctor.id]
        );

        console.log(`  ✓ Done`);
        migrated++;
      } catch (err) {
        console.error(`  ✗ Failed: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n=== ${migrated} migrated, ${failed} failed ===${dryRun ? ' [DRY RUN]' : ''}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
