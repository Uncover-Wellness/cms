#!/usr/bin/env node
/**
 * Batch 2 — port blog posts that don't have a matching MDX reference in
 * uncover-gags. We can't overwrite the content, so we just repackage the
 * existing post_body (Lexical JSON) into pageBlocks, splitting at H2
 * boundaries so the new BlogPostLayout renders each section as a proper
 * block-text with its own heading / ToC anchor.
 *
 * When code_embed_code is populated (28 posts), a trailing htmlEmbed
 * block captures that raw HTML so it continues to render.
 *
 * Meta fields (title, excerpt, publishedAt, category, doctor) are NOT
 * touched. Legacy post_body / rich_text2 / code_embed_code are NOT
 * touched either — the layout already prefers pageBlocks.
 *
 * Flags:
 *   --dry-run         parse + print planned blocks, do not write
 *   --slug=<slug>     process a single slug
 *   --limit=<n>       process the first N eligible posts
 */

import pg from 'pg';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
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

// ── Build the set of slugs that already have an MDX reference ───────────
const MDX_DIR = resolve(__dirname, '..', '..', 'uncover-gags', 'src', 'content', 'blog');
const mdxSlugs = new Set();
if (existsSync(MDX_DIR)) {
  for (const f of readdirSync(MDX_DIR)) {
    if (f.endsWith('.mdx') || f.endsWith('.md')) {
      mdxSlugs.add(f.replace(/\.mdx?$/, ''));
    }
  }
}

// ── Postgres ────────────────────────────────────────────────────────────
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

// Fetch eligible posts.
let query = `
  SELECT id, slug, post_body, code_embed_code
    FROM cms.blog_posts
   WHERE post_body IS NOT NULL
     AND slug IS NOT NULL
`;
const params = [];
if (slugArg) {
  query += ` AND slug = $1`;
  params.push(slugArg);
}
query += ` ORDER BY id`;
if (limitArg > 0) query += ` LIMIT ${limitArg}`;

const { rows } = await client.query(query, params);

// ── Process ─────────────────────────────────────────────────────────────
let processed = 0;
let skippedHasMdx = 0;
let skippedEmpty = 0;
let failed = 0;

for (const row of rows) {
  // Skip posts that have an MDX reference — batch 1 owns those.
  if (mdxSlugs.has(row.slug) && !slugArg) {
    skippedHasMdx += 1;
    continue;
  }

  try {
    const lexical = row.post_body; // jsonb — node driver hands back parsed object
    if (!lexical?.root || !Array.isArray(lexical.root.children) || lexical.root.children.length === 0) {
      skippedEmpty += 1;
      continue;
    }

    const sections = splitByH2(lexical);
    const rawHtml = row.code_embed_code ? String(row.code_embed_code).trim() : null;

    if (isDry) {
      console.log(`\n--- ${row.slug} (id=${row.id}) ---`);
      console.log(`  sections: ${sections.length}${rawHtml ? '  + htmlEmbed tail' : ''}`);
      sections.forEach((s, i) => {
        const preview = JSON.stringify(s.content).slice(0, 80);
        console.log(`   ${i + 1}. ${s.heading || '(intro)'}  [${preview}...]`);
      });
      if (rawHtml) console.log(`  htmlEmbed chars: ${rawHtml.length}`);
      processed += 1;
      continue;
    }

    await client.query('BEGIN');
    const blockCount = await writeBlogPageBlocks(client, {
      postId: row.id,
      sections,
      rawHtml,
    });
    await client.query('COMMIT');
    console.log(`${row.slug} (id=${row.id}): ${blockCount} blocks${rawHtml ? ' (+ htmlEmbed)' : ''}`);
    processed += 1;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`FAIL ${row.slug}:`, err.message);
    failed += 1;
  }
}

console.log('\n──────── summary ────────');
console.log(`processed:           ${processed}`);
console.log(`skipped (has mdx):   ${skippedHasMdx}`);
console.log(`skipped (empty body):${skippedEmpty}`);
console.log(`failed:              ${failed}`);
if (isDry) console.log('\n(dry-run — no DB writes)');

await client.end();
