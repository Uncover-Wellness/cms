#!/usr/bin/env node
/**
 * Port treatment pages from uncover-gags MDX → pageBlocks.
 *
 *   node scripts/port-treatments-from-mdx.mjs [--dry-run] [--slug=<slug>] [--limit=<n>]
 *
 * For every .mdx file under uncover-gags/src/content/treatments/:
 *   1. Parse frontmatter + body.
 *   2. markdown → Lexical → split at H2 → convert "Key Takeaways"
 *      sections to takeawaysBlock.
 *   3. Wipe & rewrite pageBlocks for the matching treatment row.
 *   4. Update hero + meta + details fields from frontmatter.
 *   5. Upsert linked-doctors relationships.
 *
 * The 7 CMS-only treatments (no MDX source) are silently skipped —
 * they keep their current content.
 */

import pg from 'pg';
import matter from 'gray-matter';
import { randomUUID } from 'node:crypto';
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

const MDX_DIR = resolve(__dirname, '..', '..', 'uncover-gags', 'src', 'content', 'treatments');
if (!existsSync(MDX_DIR)) {
  console.error(`MDX dir missing: ${MDX_DIR}`);
  process.exit(1);
}

let files = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
if (slugArg) {
  files = files.filter((f) => basename(f, '.mdx').replace(/\.md$/, '') === slugArg);
  if (files.length === 0) { console.error(`no MDX for slug "${slugArg}"`); process.exit(1); }
}
if (limitArg > 0) files = files.slice(0, limitArg);

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

function normaliseDoctorSlug(s) {
  return s ? String(s).trim().toLowerCase().replace(/^dr-/, '') : null;
}

async function lookupTreatmentId(slug) {
  const r = await client.query(`SELECT id FROM cms.treatments WHERE slug = $1 LIMIT 1`, [slug]);
  return r.rows[0]?.id ?? null;
}

async function lookupDoctorIds(authorSlugs) {
  const ids = [];
  for (const raw of authorSlugs || []) {
    const s = normaliseDoctorSlug(raw);
    if (!s) continue;
    const r = await client.query(`SELECT id FROM cms.doctors WHERE slug = $1 LIMIT 1`, [s]);
    if (r.rows[0]?.id) ids.push(r.rows[0].id);
  }
  return ids;
}

async function latestVersionId(treatmentId) {
  const r = await client.query(
    `SELECT id FROM cms._treatments_v WHERE parent_id = $1 AND latest = true LIMIT 1`,
    [treatmentId],
  );
  return r.rows[0]?.id ?? null;
}

async function updateTreatmentMeta(treatmentId, fm) {
  const set = {};
  if (fm.title) { set.name = fm.title; set.hero_headline = fm.title; }
  if (fm.tagline) set.hero_tagline = fm.tagline;
  if (fm.description) set.hero_excerpt = fm.description;
  if (fm.image) set.hero_main_image = fm.image;
  if (fm.title) set.meta_title = fm.title;
  if (fm.description) set.meta_description = fm.description;
  if (fm.duration) set.details_service_time = fm.duration;
  if (fm.sessions) set.details_sessions = fm.sessions;
  if (fm.downtime) set.details_downtime = fm.downtime;

  const cols = Object.keys(set);
  if (cols.length === 0) return;

  // Live row — overwrite from MDX (MDX is source of truth here).
  const setClauses = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const vals = cols.map((c) => set[c]);
  vals.push(treatmentId);
  await client.query(`UPDATE cms.treatments SET ${setClauses} WHERE id = $${cols.length + 1}`, vals);

  // Version mirror (latest = true) — columns prefixed with version_.
  const vCols = cols.map((c) => `version_${c}`);
  const vSet = vCols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const vVals = cols.map((c) => set[c]);
  vVals.push(treatmentId);
  await client.query(
    `UPDATE cms._treatments_v SET ${vSet} WHERE parent_id = $${cols.length + 1} AND latest = true`,
    vVals,
  );
}

async function upsertLinkedDoctors(treatmentId, doctorIds) {
  const path = 'relationships.linkedDoctors';
  await client.query(
    `DELETE FROM cms.treatments_rels WHERE parent_id = $1 AND path = $2 AND doctors_id IS NOT NULL`,
    [treatmentId, path],
  );
  for (let i = 0; i < doctorIds.length; i += 1) {
    await client.query(
      `INSERT INTO cms.treatments_rels ("order", parent_id, path, doctors_id)
       VALUES ($1, $2, $3, $4)`,
      [i + 1, treatmentId, path, doctorIds[i]],
    );
  }

  const versionId = await latestVersionId(treatmentId);
  if (!versionId) return;
  await client.query(
    `DELETE FROM cms._treatments_v_rels WHERE parent_id = $1 AND path = $2 AND doctors_id IS NOT NULL`,
    [versionId, path],
  );
  for (let i = 0; i < doctorIds.length; i += 1) {
    await client.query(
      `INSERT INTO cms._treatments_v_rels ("order", parent_id, path, doctors_id)
       VALUES ($1, $2, $3, $4)`,
      [i + 1, versionId, path, doctorIds[i]],
    );
  }
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

    const treatmentId = await lookupTreatmentId(slug);
    if (!treatmentId) {
      console.warn(`skip ${slug} — no matching treatment row`);
      skipped += 1;
      continue;
    }

    const lexical = markdownToLexical(body);
    const sections = convertTakeawaysSections(splitByH2(lexical));
    const htmlSkips = lastHtmlSkips();
    if (htmlSkips.length > 0) htmlSkipsByPost.set(slug, htmlSkips.length);

    const doctorIds = await lookupDoctorIds(fm.doctors || []);

    if (isDry) {
      console.log(`\n--- ${slug} (id=${treatmentId}) ---`);
      console.log(`  sections: ${sections.length}`);
      sections.forEach((s, i) => {
        const tag = s.kind === 'takeaways' ? 'takeaways' : 'text';
        console.log(`   ${i + 1}. [${tag}] ${s.heading || '(intro)'}`);
      });
      console.log('  meta:', {
        name: fm.title?.slice(0, 60),
        tagline: fm.tagline?.slice(0, 60),
        duration: fm.duration, sessions: fm.sessions, downtime: fm.downtime,
        doctors: doctorIds.length,
      });
      if (htmlSkips.length > 0) console.log(`  ⚠ JSX nodes skipped: ${htmlSkips.length}`);
      processed += 1;
      continue;
    }

    await client.query('BEGIN');
    const blockCount = await writePageBlocks(client, { collection: 'treatments', parentId: treatmentId, sections });
    await updateTreatmentMeta(treatmentId, fm);
    await upsertLinkedDoctors(treatmentId, doctorIds);
    await client.query('COMMIT');
    console.log(`${slug} (id=${treatmentId}): ${blockCount} blocks + meta + ${doctorIds.length} doctors${htmlSkips.length ? `  ⚠${htmlSkips.length} jsx skipped` : ''}`);
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
