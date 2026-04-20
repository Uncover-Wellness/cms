/**
 * Normalize every non-webp media row in cms.media to webp.
 *
 * For each row where mime_type is image/avif, image/png, or image/jpeg:
 *   1. Download current binary from R2 (key = uncover-cms/<filename>)
 *   2. Sharp -> webp q=82
 *   3. PUT new object at uncover-cms/<stem>.webp
 *   4. UPDATE cms.media SET filename='<stem>.webp', mime_type='image/webp',
 *                         filesize=<len>, width=<w>, height=<h>
 *   5. DELETE old object
 *
 * SVG rows are left alone.
 *
 * Usage:
 *   DATABASE_URL=... R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=... \
 *   node scripts/normalize-media-to-webp.mjs [--dry-run] [--limit N]
 */

import pg from 'pg';
import sharp from 'sharp';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const {
  DATABASE_URL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env;

const FOLDER = 'uncover-cms';
const dryRun = process.argv.includes('--dry-run');
const limitIdx = process.argv.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) : null;

for (const [k, v] of Object.entries({
  DATABASE_URL,
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

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function processOne(row) {
  const oldKey = `${FOLDER}/${row.filename}`;
  const stem = row.filename.replace(/\.[^.]+$/, '');
  const newFilename = `${stem}.webp`;
  const newKey = `${FOLDER}/${newFilename}`;

  if (oldKey === newKey) {
    return { status: 'already-webp-key' };
  }

  const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: oldKey }));
  const sourceBuf = await streamToBuffer(obj.Body);

  const webpBuf = await sharp(sourceBuf).webp({ quality: 82 }).toBuffer();
  const meta = await sharp(webpBuf).metadata();

  if (dryRun) {
    return {
      status: 'dry-run',
      oldKey,
      newKey,
      oldBytes: sourceBuf.length,
      newBytes: webpBuf.length,
      width: meta.width,
      height: meta.height,
    };
  }

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: newKey,
      Body: webpBuf,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  await pool.query(
    `UPDATE cms.media
        SET filename = $1,
            mime_type = 'image/webp',
            filesize = $2,
            width = $3,
            height = $4,
            updated_at = NOW()
      WHERE id = $5`,
    [newFilename, webpBuf.length, meta.width, meta.height, row.id],
  );

  if (oldKey !== newKey) {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldKey }));
  }

  return {
    status: 'normalized',
    oldKey,
    newKey,
    oldBytes: sourceBuf.length,
    newBytes: webpBuf.length,
  };
}

async function main() {
  console.log(`Normalize non-webp cms.media rows -> webp ${dryRun ? '[DRY RUN]' : ''}`);

  const rows = await pool.query(
    `SELECT id, filename, mime_type
       FROM cms.media
      WHERE mime_type IN ('image/avif', 'image/png', 'image/jpeg')
        AND filename IS NOT NULL
      ORDER BY id ASC
      ${limit ? `LIMIT ${limit}` : ''}`,
  );

  console.log(`Found ${rows.rows.length} rows to normalize`);

  let done = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const row of rows.rows) {
    try {
      const r = await processOne(row);
      if (r.status === 'normalized' || r.status === 'dry-run') {
        done++;
        savedBytes += r.oldBytes - r.newBytes;
        console.log(
          `[${row.id}] ${r.status}: ${row.mime_type} -> webp  ` +
            `${r.oldBytes} -> ${r.newBytes} bytes  ${r.oldKey} -> ${r.newKey}`,
        );
      } else {
        console.log(`[${row.id}] ${r.status}`);
      }
    } catch (err) {
      failed++;
      console.error(`[${row.id}] FAILED ${row.filename}: ${err.message}`);
    }
  }

  console.log(
    `\nDone. normalized=${done} failed=${failed} savedBytes=${savedBytes} (${(savedBytes / 1024 / 1024).toFixed(1)} MB)`,
  );
  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
