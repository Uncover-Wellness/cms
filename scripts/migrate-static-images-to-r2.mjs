/**
 * One-shot: copy uncover-astro/public/images/** into R2 under prefix `static/`.
 * Raster non-webp inputs are converted to WebP (q=82) before upload so the
 * final R2 object is always webp or svg, matching the CMS pipeline.
 *
 * Usage (from uncover-cms dir):
 *   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=uncover-media \
 *   node scripts/migrate-static-images-to-r2.mjs [--dry-run] [--src ../uncover-astro/public/images] [--prefix static]
 *
 * After a successful run, delete public/images in uncover-astro and commit.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname, sep as pathSep } from 'node:path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env;

const dryRun = process.argv.includes('--dry-run');
const srcIdx = process.argv.indexOf('--src');
const SRC = srcIdx >= 0 ? process.argv[srcIdx + 1] : '../uncover-astro/public/images';
const prefIdx = process.argv.indexOf('--prefix');
const PREFIX = prefIdx >= 0 ? process.argv[prefIdx + 1] : 'static';
const skipExisting = !process.argv.includes('--force');

for (const [k, v] of Object.entries({
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

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const mimeByExt = {
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
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

async function main() {
  const srcStat = await stat(SRC).catch(() => null);
  if (!srcStat?.isDirectory()) {
    console.error(`Source dir not found: ${SRC}`);
    process.exit(1);
  }

  const files = await walk(SRC);
  console.log(`Found ${files.length} files under ${SRC} ${dryRun ? '[DRY RUN]' : ''}`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const rel = relative(SRC, file);
      let ext = extname(file).toLowerCase();
      const needsWebp = ['.png', '.jpg', '.jpeg', '.gif', '.avif'].includes(ext);

      let buffer = await readFile(file);
      let contentType = mimeByExt[ext] || 'application/octet-stream';
      let outRel = rel;

      if (needsWebp) {
        buffer = await sharp(buffer).webp({ quality: 82 }).toBuffer();
        contentType = 'image/webp';
        outRel = rel.replace(/\.[^.]+$/, '.webp');
      }

      const key = `${PREFIX}/${outRel.split(pathSep).join('/')}`;

      if (skipExisting && (await keyExists(key))) {
        skipped++;
        console.log(`skip  ${key}`);
        continue;
      }

      if (dryRun) {
        uploaded++;
        console.log(`would ${key} (${buffer.length} bytes, ${contentType})`);
        continue;
      }

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      uploaded++;
      console.log(`put   ${key} (${buffer.length} bytes)`);
    } catch (err) {
      failed++;
      console.error(`FAIL ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
