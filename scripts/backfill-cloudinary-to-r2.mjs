/**
 * Backfill all existing Cloudinary-hosted media to Cloudflare R2.
 *
 * Reads every row from cms.media, fetches the binary from Cloudinary,
 * and uploads it to R2 at key `${folder}/${filename}` — using the same
 * folder name the live r2Adapter emits, so URLs flip automatically as
 * soon as the adapter swap deploys.
 *
 * No DB mutation: Payload calls generateURL() on every API response.
 *
 * Usage:
 *   DATABASE_URL=... \
 *   CLOUDINARY_CLOUD_NAME=... \
 *   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
 *   R2_BUCKET=uncover-media \
 *   node scripts/backfill-cloudinary-to-r2.mjs [--dry-run] [--limit N]
 */

import pg from 'pg';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const {
  DATABASE_URL,
  CLOUDINARY_CLOUD_NAME,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env;

const FOLDER = 'uncover-cms';
const dryRun = process.argv.includes('--dry-run');
const limitIdx = process.argv.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) : null;
const skipExisting = !process.argv.includes('--force');

for (const [k, v] of Object.entries({
  DATABASE_URL,
  CLOUDINARY_CLOUD_NAME,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
})) {
  if (!v) {
    console.error(`${k} is not set`);
    process.exit(1);
  }
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function cloudinaryUrl(filename) {
  const publicId = filename.replace(/\.[^.]+$/, '');
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${FOLDER}/${publicId}`;
}

async function keyExists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404 || err.name === 'NotFound') return false;
    throw err;
  }
}

async function fetchBinary(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType: res.headers.get('content-type') || 'application/octet-stream' };
}

async function uploadOne(row) {
  const key = `${FOLDER}/${row.filename}`;

  if (skipExisting && (await keyExists(key))) {
    return { status: 'skipped', key };
  }

  const url = cloudinaryUrl(row.filename);
  const { buf, contentType } = await fetchBinary(url);

  if (dryRun) {
    return { status: 'dry-run', key, bytes: buf.length, url };
  }

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: row.mime_type || contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return { status: 'uploaded', key, bytes: buf.length };
}

async function main() {
  console.log(`Backfill Cloudinary -> R2 (bucket: ${R2_BUCKET}, folder: ${FOLDER}) ${dryRun ? '[DRY RUN]' : ''}`);

  const rows = await pool.query(
    `SELECT id, filename, mime_type
       FROM cms.media
      WHERE filename IS NOT NULL
      ORDER BY id ASC
      ${limit ? `LIMIT ${limit}` : ''}`,
  );

  console.log(`Found ${rows.rows.length} media rows`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows.rows) {
    try {
      const result = await uploadOne(row);
      if (result.status === 'uploaded' || result.status === 'dry-run') {
        uploaded++;
        console.log(`[${row.id}] ${result.status}: ${result.key} (${result.bytes ?? '?'} bytes)`);
      } else if (result.status === 'skipped') {
        skipped++;
        console.log(`[${row.id}] skipped (already in R2): ${result.key}`);
      }
    } catch (err) {
      failed++;
      console.error(`[${row.id}] FAILED ${row.filename}: ${err.message}`);
    }
  }

  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
