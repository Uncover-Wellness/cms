#!/usr/bin/env node
/**
 * Second-pass content port for Acne Scars — updates hero fields, the
 * SEO meta.description, and attaches inline FAQs to the existing
 * faqsEmbed pageBlock. Safe to re-run.
 */

import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
await c.query('SET search_path TO cms, public');

const { rows: [concern] } = await c.query("SELECT id FROM cms.concerns WHERE slug='acne-scars' LIMIT 1");
if (!concern) { console.error('acne-scars concern not found'); process.exit(1); }
const CONCERN_ID = concern.id;

// ── Hero + SEO copy (matches uncover-gags reference) ──────────────────────
const PAGE_HEADING = 'Revive Your Skin: Advanced Solutions for Acne and Scars';
const HEADING_SUPPORT = 'Advanced dermatological treatments for active acne and acne scars at UNCOVER Clinics. From microneedling and CO2 laser resurfacing to medical peels for smoother, clearer skin.';
const META_DESCRIPTION = HEADING_SUPPORT;
const META_TITLE = 'Acne & Scar Treatment in Delhi & Gurgaon | UNCOVER Clinics';

// ── Inline FAQs (5 from prod) ─────────────────────────────────────────────
const INLINE_FAQS = [
  { question: 'Can acne scars be completely removed?',
    answer:   'Most acne scars can be significantly improved — often by 60-80% — with the right combination of treatments. Complete removal is rare, but modern fractional lasers, microneedling with RF, and subcision can deliver dramatic, natural-looking results.' },
  { question: 'Should I treat active acne or scars first?',
    answer:   'Always control active acne first. Treating scars while breakouts are active can worsen inflammation and cause new pigmentation. Our dermatologists typically stabilise acne for 2-3 months before starting scar revision.' },
  { question: 'How many sessions will I need?',
    answer:   'Most patients need 4-6 sessions spaced 4-6 weeks apart for microneedling or peels, and 2-4 sessions for fractional CO2 laser. Your plan is tailored based on scar type, depth, and skin response.' },
  { question: 'Is there downtime after treatment?',
    answer:   'Microneedling and peels have 2-3 days of redness. Fractional CO2 laser requires 5-7 days of visible healing. We provide detailed aftercare protocols to minimise downtime and optimise results.' },
  { question: 'Can these treatments be done on darker skin tones?',
    answer:   'Yes. Our dermatologists are experienced with Indian and South Asian skin tones. We select parameters carefully to avoid post-inflammatory hyperpigmentation, and often favour microneedling, RF, and medical peels over aggressive ablative lasers for melanin-rich skin.' },
];

try {
  await c.query('BEGIN');

  // 1. Update hero + SEO fields on the concern row.
  await c.query(`
    UPDATE cms.concerns
    SET page_heading = $1,
        heading_support_text = $2,
        meta_title = $3,
        meta_description = $4
    WHERE id = $5
  `, [PAGE_HEADING, HEADING_SUPPORT, META_TITLE, META_DESCRIPTION, CONCERN_ID]);

  // 2. Attach inline FAQs to the existing faqsEmbed block for this concern.
  //    First find the faqsEmbed parent row, then delete its existing inlines,
  //    then insert the new ones.
  const { rows: [faqsEmbed] } = await c.query(
    "SELECT id FROM cms.concerns_blocks_faqs_embed WHERE _parent_id = $1 AND _path = 'pageBlocks' ORDER BY _order LIMIT 1",
    [CONCERN_ID]
  );
  if (!faqsEmbed) {
    throw new Error('No faqsEmbed pageBlock found for acne-scars — run port-acne-scars-content.mjs first.');
  }

  await c.query("DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs WHERE _parent_id = $1", [faqsEmbed.id]);
  for (let i = 0; i < INLINE_FAQS.length; i++) {
    const faq = INLINE_FAQS[i];
    await c.query(`
      INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs
        (id, _parent_id, _order, question, answer)
      VALUES ($1, $2, $3, $4, $5)
    `, [randomUUID(), faqsEmbed.id, i + 1, faq.question, faq.answer]);
  }

  await c.query('COMMIT');
  console.log(`Acne Scars (id=${CONCERN_ID}): updated hero + SEO; wrote ${INLINE_FAQS.length} inline FAQs on faqsEmbed=${faqsEmbed.id}`);
} catch (err) {
  await c.query('ROLLBACK');
  console.error(err);
  process.exit(1);
} finally {
  await c.end();
}
