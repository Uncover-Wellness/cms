#!/usr/bin/env node
/**
 * Creates the missing cms.treatments row for slug='chemical-peels'.
 *
 * All other 64 treatment slugs from uncover-gags have CMS rows; only this one
 * was never created. Fields follow the conventions of peer peel treatments
 * (acne-buster-peel id=126, black-peel id=152, anti-aging-peel id=154):
 *   - name + slug + _status='published'
 *   - hero_headline (long hook) + hero_tagline (short all-caps line)
 *   - hero_excerpt (MDX description)
 *   - details_service_time / details_sessions / details_downtime
 *   - meta_title / meta_description
 *
 * Source: uncover-gags/src/content/treatments/chemical-peels.mdx
 * Reference: https://uncover-web.netlify.app/treatment/chemical-peels/
 *
 * After the row is created the script also appends the three default
 * embed blocks (doctorsEmbed, testimonialsEmbed, faqsEmbed) that every
 * other treatment already has, so the page renders a skeleton end
 * immediately. Narrative pageBlocks are added by the per-page port scripts.
 *
 * Idempotent: no-op if the row already exists.
 */
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('SET search_path TO cms, public');

const SLUG = 'chemical-peels';
const FIELDS = {
  name: 'Chemical Peels',
  slug: SLUG,
  hero_headline: 'Reveal Brighter, Smoother Skin with Medical-Grade Chemical Peels',
  hero_tagline: 'EXFOLIATE . RESURFACE . RENEW',
  hero_excerpt:
    'Professional-grade chemical peels for acne scars, pigmentation, dull skin, and anti-aging — customised for Indian skin tones by board-certified dermatologists at Uncover Clinics.',
  details_service_time: '30-45 Mins',
  details_sessions: '4-6 Sessions',
  details_downtime: '1-5 Days',
  meta_title: 'Chemical Peels in Delhi & Gurgaon | UNCOVER Clinics',
  meta_description:
    'Professional-grade chemical peels at UNCOVER Clinics — glycolic, TCA, and Jessner\u2019s peels customised for Indian skin. Board-certified dermatologists, safe protocols for Fitzpatrick III-V skin.',
  _status: 'published',
};

try {
  const existing = await client.query('SELECT id FROM cms.treatments WHERE slug = $1', [SLUG]);
  if (existing.rowCount > 0) {
    console.log(`chemical-peels row already exists (id=${existing.rows[0].id}) \u2014 no-op`);
    process.exit(0);
  }

  await client.query('BEGIN');

  const cols = Object.keys(FIELDS);
  const vals = cols.map((_, i) => `$${i + 1}`);
  const ins = await client.query(
    `INSERT INTO cms.treatments (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING id`,
    cols.map((k) => FIELDS[k])
  );
  const id = ins.rows[0].id;

  // Mirror auto-migration: append doctorsEmbed + testimonialsEmbed + faqsEmbed
  // with the same defaults used in append-default-embed-blocks.mjs.
  await client.query(`
    INSERT INTO cms.treatments_blocks_doctors_embed
      (id, _parent_id, _order, _path, eyebrow, heading, "limit", block_name)
    VALUES ($1, $2, 1, 'pageBlocks', 'Your Doctors', 'Expert Chemical Peels Specialists', 6, NULL)
  `, [randomUUID(), id]);

  await client.query(`
    INSERT INTO cms.treatments_blocks_testimonials_embed
      (id, _parent_id, _order, _path, eyebrow, heading, "limit", block_name)
    VALUES ($1, $2, 2, 'pageBlocks', 'Patient Stories', 'What Our Chemical Peels Clients Say', 6, NULL)
  `, [randomUUID(), id]);

  await client.query(`
    INSERT INTO cms.treatments_blocks_faqs_embed
      (id, _parent_id, _order, _path, heading, block_name)
    VALUES ($1, $2, 3, 'pageBlocks', 'Frequently Asked Questions', NULL)
  `, [randomUUID(), id]);

  await client.query('COMMIT');
  console.log(`created chemical-peels treatment id=${id} + 3 default embed blocks`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error(err);
  process.exit(1);
} finally {
  await client.end();
}
