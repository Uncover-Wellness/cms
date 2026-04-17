#!/usr/bin/env node
/**
 * Port concern pages from uncover-gags MDX → pageBlocks.
 *
 *   node scripts/port-concerns-from-mdx.mjs [--dry-run] [--slug=<slug>] [--limit=<n>]
 *
 * Same shape as the treatments / blog-posts porters. Concerns MDX
 * contains React-like JSX components (<CTASection>, <Callout>,
 * <ContentGrid>, <FAQSection>). For v1 those are stripped by
 * markdown-to-lexical's stripMdxJs and we emit textSections only;
 * the helper reports a count so we can later promote select concerns
 * to richer block mappings.
 *
 * Acne-scars is skipped by default — that concern has a hand-authored
 * rich composition (contentGrid + noticeBlock + ctaBlock) from
 * port-acne-scars-content.mjs that the MDX text-only port would
 * flatten. Pass `--slug=acne-scars` to override.
 *
 * CMS-only concerns (no MDX source) are silently skipped.
 */

import pg from 'pg';
import matter from 'gray-matter';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownToLexical, lastHtmlSkips } from './lib/markdown-to-lexical.mjs';
import { splitByH2, convertTakeawaysSections } from './lib/split-by-h2.mjs';
import { writePageBlocks } from './lib/write-page-blocks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const argv = process.argv.slice(2);
const isDry = argv.includes('--dry-run');
const slugArg = argv.find((a) => a.startsWith('--slug='))?.split('=')[1] || null;
const limitArg = parseInt(argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);

const MDX_DIR = resolve(__dirname, '..', '..', 'uncover-gags', 'src', 'content', 'concerns');
if (!existsSync(MDX_DIR)) {
  console.error(`MDX dir missing: ${MDX_DIR}`);
  process.exit(1);
}

let files = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
if (slugArg) {
  files = files.filter((f) => basename(f, '.mdx').replace(/\.md$/, '') === slugArg);
  if (files.length === 0) { console.error(`no MDX for slug "${slugArg}"`); process.exit(1); }
} else {
  // Preserve the hand-authored acne-scars composition unless explicitly opted in.
  files = files.filter((f) => basename(f, '.mdx').replace(/\.md$/, '') !== 'acne-scars');
}
if (limitArg > 0) files = files.slice(0, limitArg);

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

async function lookupConcernId(slug) {
  const r = await client.query(`SELECT id FROM cms.concerns WHERE slug = $1 LIMIT 1`, [slug]);
  return r.rows[0]?.id ?? null;
}

async function updateConcernMeta(concernId, fm) {
  const set = {};
  if (fm.title) { set.name = fm.title; set.page_heading = fm.title; }
  if (fm.tagline) set.page_sub_title = fm.tagline;
  if (fm.description) set.heading_support_text = fm.description;
  if (fm.image) set.header_image_url = fm.image;
  if (fm.title) set.meta_title = fm.title;
  if (fm.description) set.meta_description = fm.description;
  // concerns has no header_category enum; category is informational only.

  const cols = Object.keys(set);
  if (cols.length === 0) return;

  const setClauses = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const vals = cols.map((c) => set[c]);
  vals.push(concernId);
  await client.query(`UPDATE cms.concerns SET ${setClauses} WHERE id = $${cols.length + 1}`, vals);

  const vCols = cols.map((c) => `version_${c}`);
  const vSet = vCols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const vVals = cols.map((c) => set[c]);
  vVals.push(concernId);
  await client.query(
    `UPDATE cms._concerns_v SET ${vSet} WHERE parent_id = $${cols.length + 1} AND latest = true`,
    vVals,
  );
}

let processed = 0;
let skipped = 0;
let failed = 0;
const htmlSkipsByPost = new Map();

for (const file of files) {
  const slug = file.replace(/\.mdx?$/, '');
  try {
    const raw = readFileSync(resolve(MDX_DIR, file), 'utf8');
    const { data: fm, content: body } = matter(raw);

    const concernId = await lookupConcernId(slug);
    if (!concernId) {
      console.warn(`skip ${slug} — no matching concern row`);
      skipped += 1;
      continue;
    }

    const lexical = markdownToLexical(body);
    const sections = convertTakeawaysSections(splitByH2(lexical));
    const htmlSkips = lastHtmlSkips();
    if (htmlSkips.length > 0) htmlSkipsByPost.set(slug, htmlSkips.length);

    if (isDry) {
      console.log(`\n--- ${slug} (id=${concernId}) ---`);
      console.log(`  sections: ${sections.length}`);
      sections.forEach((s, i) => {
        const tag = s.kind === 'takeaways' ? 'takeaways' : 'text';
        console.log(`   ${i + 1}. [${tag}] ${s.heading || '(intro)'}`);
      });
      console.log('  meta:', {
        name: fm.title?.slice(0, 60),
        tagline: fm.tagline?.slice(0, 60),
        category: fm.category,
      });
      if (htmlSkips.length > 0) console.log(`  ⚠ JSX nodes skipped: ${htmlSkips.length}`);
      processed += 1;
      continue;
    }

    await client.query('BEGIN');
    const blockCount = await writePageBlocks(client, { collection: 'concerns', parentId: concernId, sections });
    await updateConcernMeta(concernId, fm);
    await client.query('COMMIT');
    console.log(`${slug} (id=${concernId}): ${blockCount} blocks + meta${htmlSkips.length ? `  ⚠${htmlSkips.length} jsx skipped` : ''}`);
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
  console.log('\nposts with JSX nodes stripped (manual review candidates):');
  for (const [slug, count] of htmlSkipsByPost) console.log(`  ${slug}  (${count})`);
}
if (isDry) console.log('\n(dry-run — no DB writes)');

await client.end();
