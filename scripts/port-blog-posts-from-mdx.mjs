#!/usr/bin/env node
/**
 * Batch 1 — port every blog post that has a matching MDX file in
 * uncover-gags/src/content/blog/. MDX frontmatter + body is the source
 * of truth: we rewrite the DB row's pageBlocks AND meta (title, excerpt,
 * publishedAt, category, doctor, structured FAQs, how-to steps).
 *
 * Legacy post_body / rich_text2 / code_embed_code are left untouched —
 * the layout gate already prefers pageBlocks over them.
 *
 * Flags:
 *   --dry-run         parse + print planned blocks/meta, do not write
 *   --slug=<slug>     process a single slug
 *   --limit=<n>       process the first N eligible files
 */

import pg from 'pg';
import matter from 'gray-matter';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToLexical, lastHtmlSkips } from './lib/markdown-to-lexical.mjs';
import { splitByH2 } from './lib/split-by-h2.mjs';
import { writeBlogPageBlocks } from './lib/write-blog-page-blocks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

// ── CLI flags ────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const isDry = argv.includes('--dry-run');
const slugArg = argv.find((a) => a.startsWith('--slug='))?.split('=')[1] || null;
const limitArg = parseInt(argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

// ── MDX source dir ───────────────────────────────────────────────────────
const MDX_DIR = resolve(__dirname, '..', '..', 'uncover-gags', 'src', 'content', 'blog');
if (!existsSync(MDX_DIR)) {
  console.error(`MDX source directory not found: ${MDX_DIR}`);
  process.exit(1);
}

let files = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
if (slugArg) {
  files = files.filter((f) => basename(f, '.mdx').replace(/\.md$/, '') === slugArg);
  if (files.length === 0) {
    console.error(`No MDX file for slug "${slugArg}"`);
    process.exit(1);
  }
}
if (limitArg > 0) files = files.slice(0, limitArg);

// ── Postgres client ──────────────────────────────────────────────────────
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

// ── Helpers ──────────────────────────────────────────────────────────────
function normaliseDoctorSlug(s) {
  if (!s) return null;
  return String(s).trim().toLowerCase().replace(/^dr-/, '');
}

async function lookupCategoryId(name) {
  if (!name) return null;
  const r = await client.query(
    `SELECT id FROM cms.blog_post_categories WHERE lower(btrim(name)) = lower(btrim($1)) LIMIT 1`,
    [name],
  );
  return r.rows[0]?.id ?? null;
}

async function lookupDoctorId(authorSlug) {
  const s = normaliseDoctorSlug(authorSlug);
  if (!s) return null;
  const r = await client.query(`SELECT id FROM cms.doctors WHERE slug = $1 LIMIT 1`, [s]);
  return r.rows[0]?.id ?? null;
}

async function lookupPostId(slug) {
  const r = await client.query(`SELECT id FROM cms.blog_posts WHERE slug = $1 LIMIT 1`, [slug]);
  return r.rows[0]?.id ?? null;
}

async function updateMeta(postId, data) {
  // Live blog_posts row.
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [col, val] of Object.entries(data)) {
    if (val === undefined) continue;
    sets.push(`${col} = $${i}`);
    vals.push(val);
    i += 1;
  }
  if (sets.length === 0) return;
  vals.push(postId);
  await client.query(`UPDATE cms.blog_posts SET ${sets.join(', ')} WHERE id = $${i}`, vals);

  // Version mirror (latest = true).
  const vSets = [];
  const vVals = [];
  let j = 1;
  const vMap = {
    name: 'version_name',
    excerpt: 'version_excerpt',
    published_at: 'version_published_at',
    featured_image_alt_text: 'version_featured_image_alt_text',
    relationships_blog_post_category_id: 'version_relationships_blog_post_category_id',
    relationships_doctor_id: 'version_relationships_doctor_id',
  };
  for (const [col, val] of Object.entries(data)) {
    const vCol = vMap[col];
    if (!vCol || val === undefined) continue;
    vSets.push(`${vCol} = $${j}`);
    vVals.push(val);
    j += 1;
  }
  if (vSets.length === 0) return;
  vVals.push(postId);
  await client.query(
    `UPDATE cms._blog_posts_v SET ${vSets.join(', ')} WHERE parent_id = $${j} AND latest = true`,
    vVals,
  );
}

async function upsertStructuredFaqs(postId, faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return;
  await client.query(`DELETE FROM cms.blog_posts_structured_faqs WHERE _parent_id = $1`, [postId]);
  for (let i = 0; i < faqs.length; i += 1) {
    const f = faqs[i];
    if (!f?.question || !f?.answer) continue;
    await client.query(
      `INSERT INTO cms.blog_posts_structured_faqs (id, _parent_id, _order, question, answer)
       VALUES ($1, $2, $3, $4, $5)`,
      [cryptoRandomId(), postId, i + 1, f.question, f.answer],
    );
  }
}

async function upsertHowToSteps(postId, steps) {
  if (!Array.isArray(steps) || steps.length === 0) return;
  await client.query(`DELETE FROM cms.blog_posts_how_to_steps WHERE _parent_id = $1`, [postId]);
  for (let i = 0; i < steps.length; i += 1) {
    const s = steps[i];
    if (!s?.name || !s?.text) continue;
    await client.query(
      `INSERT INTO cms.blog_posts_how_to_steps (id, _parent_id, _order, name, text)
       VALUES ($1, $2, $3, $4, $5)`,
      [cryptoRandomId(), postId, i + 1, s.name, s.text],
    );
  }
}

function cryptoRandomId() {
  return (globalThis.crypto || require('node:crypto')).randomUUID();
}

// ── Main ────────────────────────────────────────────────────────────────
let processed = 0;
let skipped = 0;
let failed = 0;
const htmlSkipsByPost = new Map();

for (const file of files) {
  const slug = file.replace(/\.mdx?$/, '');
  try {
    const raw = readFileSync(resolve(MDX_DIR, file), 'utf8');
    const { data: fm, content: body } = matter(raw);

    const postId = await lookupPostId(slug);
    if (!postId) {
      console.warn(`skip ${slug} — no matching DB post`);
      skipped += 1;
      continue;
    }

    const lexical = markdownToLexical(body);
    const sections = splitByH2(lexical);
    const htmlSkips = lastHtmlSkips();
    if (htmlSkips.length > 0) htmlSkipsByPost.set(slug, htmlSkips.length);

    const categoryId = fm.category ? await lookupCategoryId(fm.category) : null;
    const doctorId = fm.author ? await lookupDoctorId(fm.author) : null;

    const meta = {
      name: fm.title || undefined,
      excerpt: fm.description || undefined,
      published_at: fm.date ? new Date(fm.date).toISOString() : undefined,
      featured_image_alt_text: fm.title || undefined, // always overwrite — title is canonical alt
      relationships_blog_post_category_id: categoryId ?? undefined,
      relationships_doctor_id: doctorId ?? undefined,
    };

    if (isDry) {
      console.log(`\n--- ${slug} (id=${postId}) ---`);
      console.log(`  sections: ${sections.length}`);
      sections.forEach((s, i) => {
        const preview = JSON.stringify(s.content).slice(0, 80);
        console.log(`   ${i + 1}. ${s.heading || '(intro)'}  [${preview}...]`);
      });
      console.log('  meta:', {
        name: meta.name?.slice(0, 60),
        excerpt: meta.excerpt?.slice(0, 80),
        published_at: meta.published_at,
        categoryId: meta.relationships_blog_post_category_id,
        doctorId: meta.relationships_doctor_id,
      });
      if (Array.isArray(fm.faqs)) console.log(`  structured_faqs: ${fm.faqs.length}`);
      if (Array.isArray(fm.howToSteps)) console.log(`  how_to_steps: ${fm.howToSteps.length}`);
      if (htmlSkips.length > 0) console.log(`  ⚠ html nodes skipped: ${htmlSkips.length}`);
      processed += 1;
      continue;
    }

    await client.query('BEGIN');
    const blockCount = await writeBlogPageBlocks(client, { postId, sections });
    await updateMeta(postId, meta);
    await upsertStructuredFaqs(postId, fm.faqs);
    await upsertHowToSteps(postId, fm.howToSteps);
    await client.query('COMMIT');
    console.log(`${slug} (id=${postId}): ${blockCount} blocks${htmlSkips.length ? `  ⚠${htmlSkips.length} html skipped` : ''}`);
    processed += 1;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`FAIL ${slug}:`, err.message);
    failed += 1;
  }
}

console.log('\n──────── summary ────────');
console.log(`processed: ${processed}`);
console.log(`skipped:   ${skipped}`);
console.log(`failed:    ${failed}`);
if (htmlSkipsByPost.size > 0) {
  console.log('\nposts with skipped raw-HTML nodes (manual review candidates):');
  for (const [slug, count] of htmlSkipsByPost.entries()) {
    console.log(`  ${slug}  (${count})`);
  }
}
if (isDry) console.log('\n(dry-run — no DB writes)');

await client.end();
