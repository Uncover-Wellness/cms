/**
 * Generate cover images for blog posts that have none, upload them to R2,
 * and attach them to the `cms.blog_posts.featured_image_id` column via a
 * fresh `cms.media` row.
 *
 * Image generation: Gemini 2.5 Flash Image (REST) — returns base64 PNG,
 *   we re-encode to WebP 1600x900 q82 with sharp, then PUT to R2 under
 *   the existing `uncover-cms/` folder used by all other media.
 *
 * Usage:
 *   DATABASE_URL=... GEMINI_API_KEY=... \
 *   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
 *   R2_BUCKET=... R2_PUBLIC_BASE=https://media.uncover.co.in \
 *   node scripts/generate-blog-covers.mjs [--dry-run] [--limit N] [--slug slug1,slug2]
 */

import pg from 'pg';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const {
  DATABASE_URL,
  GEMINI_API_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = 'uncover-media',
  R2_PUBLIC_BASE = 'https://media.uncover.co.in',
} = process.env;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf(limitArg) + 1], 10) : null;
const slugArg = args.find((a) => a.startsWith('--slug'));
const slugFilter = slugArg
  ? (slugArg.includes('=') ? slugArg.split('=')[1] : args[args.indexOf(slugArg) + 1])
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!GEMINI_API_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
if (!dryRun && (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)) {
  console.error('R2 credentials not set'); process.exit(1);
}

const FOLDER = 'uncover-cms';
const PUBLIC_BASE = R2_PUBLIC_BASE.replace(/\/+$/, '');

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const s3 = dryRun
  ? null
  : new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

/**
 * Editorial, brand-aligned prompt. Cream + brown palette per the Uncover
 * brand guidelines — no navy, no gold, no off-brand beige. No text in
 * the image (we render the title in HTML alongside).
 */
function buildPrompt({ name, excerpt }) {
  const summary = excerpt ? ` The article is about: ${excerpt.slice(0, 280)}.` : '';
  return [
    `Create a warm editorial hero illustration for a dermatology blog post titled "${name}".`,
    summary,
    'Aesthetic: soft, modern, calm, evocative of Indian clinical-luxury dermatology practice.',
    'Palette: cream (#FAF6EF), warm beige (#E8DCC4), brown (#936950), deep brown (#412D22), with occasional warm orange accent (#D97742).',
    'Absolutely no navy, no gold, no cool blues, no neon colors.',
    'Composition: uncluttered, soft lighting, subtle botanical or skincare elements if contextually relevant.',
    'Do NOT include any text, words, letters, numbers, watermarks, or logos in the image.',
    'Landscape 16:9 orientation, magazine-editorial feel, print quality.',
  ].join(' ');
}

async function generateImage(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    throw new Error(`No image in response: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function toWebp(pngBuffer) {
  return sharp(pngBuffer)
    .resize(1600, 900, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toBuffer();
}

async function putR2(key, buffer, contentType = 'image/webp') {
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

async function main() {
  const client = await pool.connect();
  try {
    const whereParts = [
      `(featured_image_id IS NULL OR featured_image_id = 0)`,
      `(featured_image_url IS NULL OR featured_image_url = '')`,
      `_status = 'published'`,
    ];
    const params = [];
    if (slugFilter && slugFilter.length) {
      params.push(slugFilter);
      whereParts.push(`slug = ANY($${params.length})`);
    }
    const limitSql = limit ? ` LIMIT ${parseInt(limit, 10)}` : '';

    const { rows: posts } = await client.query(
      `SELECT id, name, slug, excerpt
         FROM cms.blog_posts
        WHERE ${whereParts.join(' AND ')}
        ORDER BY published_at DESC NULLS LAST, id DESC${limitSql}`,
      params,
    );

    console.log(`Found ${posts.length} post(s) needing a cover${dryRun ? ' [DRY RUN]' : ''}`);

    let done = 0, failed = 0;

    for (const post of posts) {
      const prompt = buildPrompt({ name: post.name, excerpt: post.excerpt });
      const filename = `blog-cover-${post.slug}.webp`;
      const key = `${FOLDER}/${filename}`;
      const publicUrl = `${PUBLIC_BASE}/${key}`;

      console.log(`\n[${post.id}] ${post.name}`);
      console.log(`  slug: ${post.slug}`);
      console.log(`  key:  ${key}`);
      if (dryRun) {
        console.log(`  prompt: ${prompt.slice(0, 140)}...`);
        done++;
        continue;
      }

      try {
        console.log(`  generating via Gemini...`);
        const png = await generateImage(prompt);
        const webp = await toWebp(png);
        console.log(`  webp: ${(webp.length / 1024).toFixed(1)} KB`);

        console.log(`  uploading to R2...`);
        await putR2(key, webp);

        const meta = await sharp(webp).metadata();

        const alt = `Illustration for "${post.name}"`;
        const { rows: [mediaDoc] } = await client.query(
          `INSERT INTO cms.media
             (alt, url, filename, mime_type, filesize, width, height,
              focal_x, focal_y, _status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 50, 'published', now(), now())
           RETURNING id`,
          [alt, publicUrl, filename, 'image/webp', webp.length, meta.width, meta.height],
        );

        await client.query(
          `UPDATE cms.blog_posts
              SET featured_image_id = $1,
                  featured_image_alt_text = COALESCE(NULLIF(featured_image_alt_text, ''), $2),
                  updated_at = now()
            WHERE id = $3`,
          [mediaDoc.id, alt, post.id],
        );

        await client.query(
          `UPDATE cms._blog_posts_v
              SET version_featured_image_id = $1,
                  version_featured_image_alt_text = COALESCE(NULLIF(version_featured_image_alt_text, ''), $2),
                  updated_at = now()
            WHERE parent_id = $3 AND latest = true`,
          [mediaDoc.id, alt, post.id],
        );

        console.log(`  ✓ media ${mediaDoc.id} linked to post ${post.id}`);
        done++;
      } catch (err) {
        console.error(`  ✗ ${err.message}`);
        failed++;
      }
    }

    console.log(`\n=== ${done} done, ${failed} failed${dryRun ? ' [DRY RUN]' : ''} ===`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
