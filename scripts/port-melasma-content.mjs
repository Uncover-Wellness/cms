#!/usr/bin/env node
/**
 * One-off content port for the Melasma blog post — rebuilds it from the
 * uncover-gags reference using the new polymorphic pageBlocks pipeline.
 *
 * Source: https://uncover-web.netlify.app/post/melasma-how-to-remove-pigmentation-from-the-face-permanently/
 * Target: blog_posts.slug='melasma-how-to-remove-pigmentation-from-the-face-permanently'
 *
 * Inserts 14 blocks in order:
 *   1. textSection — intro (no heading)
 *   2. textSection — What Is Melasma?
 *   3. textSection — What Are the Symptoms of Melasma?
 *   4. textSection — What Causes Melasma? (bullet list)
 *   5. noticeBlock (note) — Also read: Glutathione…
 *   6. textSection — Melasma vs Hyperpigmentation
 *   7. textSection — How to Treat Melasma on the Face?
 *   8. textSection — Home Remedies for Melasma (bullet list)
 *   9. noticeBlock (note) — Also read: Top sunscreens…
 *  10. textSection — Best Products for Melasma & Pigmentation (numbered)
 *  11. noticeBlock (warning) — Important: no single product cures melasma
 *  12. textSection — Can Melasma Be Removed Permanently?
 *  13. textSection — Melasma Treatment at Uncover Clinics
 *  14. ctaBlock (dark) — Ready to treat your melasma?
 *
 * Idempotent: DELETEs the existing narrative blocks for this post on every
 * run and re-inserts. Legacy postBody/richText2/codeEmbedCode fields stay
 * untouched (they act as fallback for the /post/ route until we retire them).
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

// ── Lexical helpers ───────────────────────────────────────────────────────
const lxText = (text, format = 0) => ({
  mode: 'normal', text, type: 'text', style: '', detail: 0, format, version: 1,
});
const lxPara = (children) => ({
  type: 'paragraph', format: '', indent: 0, version: 1,
  children: children.map((c) => typeof c === 'string' ? lxText(c) : c),
  direction: 'ltr', textStyle: '', textFormat: 0,
});
const lxBullet = (items) => ({
  tag: 'ul', type: 'list', start: 1, format: '', indent: 0, version: 1, listType: 'bullet',
  children: items.map((item, i) => ({
    type: 'listitem', value: i + 1, format: '', indent: 0, version: 1,
    children: Array.isArray(item) ? item.map((x) => typeof x === 'string' ? lxText(x) : x) : [lxText(item)],
    direction: 'ltr',
  })),
  direction: 'ltr',
});
const lxNumbered = (items) => ({
  tag: 'ol', type: 'list', start: 1, format: '', indent: 0, version: 1, listType: 'number',
  children: items.map((item, i) => ({
    type: 'listitem', value: i + 1, format: '', indent: 0, version: 1,
    children: Array.isArray(item) ? item.map((x) => typeof x === 'string' ? lxText(x) : x) : [lxText(item)],
    direction: 'ltr',
  })),
  direction: 'ltr',
});
const lxRoot = (...children) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
});
const lxBold = (text) => lxText(text, 1);

// ── Target post ───────────────────────────────────────────────────────────
const postRow = (
  await c.query(
    "SELECT id FROM cms.blog_posts WHERE slug='melasma-how-to-remove-pigmentation-from-the-face-permanently' LIMIT 1",
  )
).rows[0];
if (!postRow) { console.error('melasma blog post not found'); process.exit(1); }
const POST_ID = postRow.id;
const PATH = 'pageBlocks';

// ── Block content ─────────────────────────────────────────────────────────
// textSection[0] is the intro (no heading); the rest are H2 sections.
const textSections = [
  {
    heading: null,
    content: lxRoot(
      lxPara([
        'Melasma is brown or grey-brown patches on the face caused by excess melanin production, most commonly triggered by sun exposure and hormonal changes. It is common and not dangerous, but it is persistent, and it rarely responds to basic skincare alone. Specific treatments can help as they can fade after months.',
      ]),
    ),
  },
  {
    heading: 'What Is Melasma?',
    content: lxRoot(
      lxPara([
        'Melasma is a chronic skin pigmentation condition where melanocytes, the cells responsible for skin colour, produce excess melanin in certain areas, creating dark, flat patches on the face. It is symmetrical, meaning it typically appears on both sides of the face. When it occurs during pregnancy, it is medically referred to as chloasma.',
      ]),
    ),
  },
  {
    heading: 'What Are the Symptoms of Melasma?',
    content: lxRoot(
      lxPara([
        'Melasma appears as flat, dark patches, brown to greyish-brown, most commonly on the cheeks, forehead, bridge of the nose, upper lip, and chin. The patches have irregular edges, do not cause pain or itching, and tend to darken with sun exposure. They are usually symmetrical and may worsen during summer or pregnancy.',
      ]),
    ),
  },
  {
    heading: 'What Causes Melasma?',
    content: lxRoot(
      lxPara([
        'Melasma is caused by overactive melanocytes producing excess melanin, triggered by three main factors: UV exposure, hormonal changes (pregnancy, birth control, thyroid), and genetics. Heat, stress, and harsh skincare products can also worsen it.',
      ]),
      lxBullet([
        [lxBold('Hormonal changes'), lxText(' are the primary trigger. Pregnancy, oral contraceptive pills, hormone replacement therapy, and thyroid imbalances all stimulate melanin overproduction. This is why melasma is far more common in women; nearly 90% of cases occur in women, particularly during reproductive years.')],
        [lxBold('Sun exposure'), lxText(' is the biggest aggravating factor. UV rays activate melanocytes directly. Even minimal daily exposure, sitting near a window, or a short commute, is enough to deepen existing patches and undo weeks of treatment.')],
        [lxBold('Genetics'), lxText(' increases susceptibility significantly. A family history of melasma means your skin is more predisposed to developing it.')],
        [lxBold('Harsh skincare and cosmetics'), lxText(' that irritate the skin trigger inflammation, which stimulates melanin production, particularly problematic for Indian skin tones that are already more melanin-reactive.')],
      ]),
    ),
  },
  {
    heading: 'Melasma vs Hyperpigmentation: What Is the Difference?',
    content: lxRoot(
      lxPara([
        'Hyperpigmentation is a broad term that covers any form of skin darkening, such as post-acne marks, sun spots, and injury-related darkening. Melasma is a specific hormonal and UV-triggered form of hyperpigmentation that appears symmetrically on the face. The key differences: melasma is deeper in the skin layers, more stubborn to treat, more likely to return, and specifically linked to hormonal and sun triggers rather than local skin injury.',
      ]),
    ),
  },
  {
    heading: 'How to Treat Melasma on the Face?',
    content: lxRoot(
      lxPara([
        lxBold('Prescription topical creams'),
        lxText(" are the first line of treatment. The most clinically recommended options include hydroquinone (2–4%), which reduces melanin production, tretinoin, which speeds up cell turnover, and azelaic acid or kojic acid for sensitive skin. Vitamin C and niacinamide help brighten and protect. These should always be used under a dermatologist's guidance; incorrect use can cause irritation and rebound darkening."),
      ]),
      lxPara([
        lxBold('Chemical peels'),
        lxText(' remove pigmented surface layers and accelerate skin renewal. Glycolic and lactic acid peels are most commonly used for melasma and work best as a course of sessions rather than one-off treatments.'),
      ]),
      lxPara([
        lxBold('Laser toning'),
        lxText(" targets melanin deposits in deeper skin layers with precision. A Q-switch laser is among the most effective treatments for stubborn melasma that hasn't responded to creams or peels. Choosing the right laser for Indian skin is critical — not all lasers are safe for darker tones."),
      ]),
      lxPara([
        lxBold('Microdermabrasion'),
        lxText(' exfoliates the surface and improves the absorption of topical treatments when combined with a clinical regimen.'),
      ]),
      lxPara([
        lxBold('Sunscreen'),
        lxText(' is non-negotiable. SPF 50+ broad-spectrum sunscreen, worn daily even indoors, is both a treatment step and the most important factor in preventing melasma from returning after treatment.'),
      ]),
    ),
  },
  {
    heading: 'Home Remedies for Melasma: What Helps',
    content: lxRoot(
      lxPara(['Home remedies will not cure melasma, but they support clinical treatment and prevent worsening.']),
      lxBullet([
        [lxBold('Aloe vera gel'), lxText(': applied directly to dark patches soothes skin and mildly lightens surface pigmentation over time.')],
        [lxBold('Turmeric and honey mask'), lxText(': a small amount of turmeric mixed with raw honey applied for 15–20 minutes has natural brightening properties and reduces surface-level discolouration with consistent use.')],
        [lxBold('Stay hydrated'), lxText(': well-hydrated skin recovers faster and responds better to clinical treatments.')],
        [lxBold('Avoid harsh physical scrubs'), lxText(' — they can inflame the skin and make pigmentation worse by triggering further melanin production.')],
        [lxBold('Daily SPF'), lxText(' is the most important home habit; no treatment holds without it.')],
      ]),
    ),
  },
  {
    heading: 'Best Products for Melasma & Pigmentation — Dermatologist-Recommended',
    content: lxRoot(
      lxPara([
        "Over-the-counter products won't replace clinical treatment for stubborn melasma, but the right ones significantly support results between sessions and prevent worsening.",
      ]),
      lxNumbered([
        [lxBold('Sunscreen — the most important product.'), lxText(' Daily SPF is non-negotiable. Popular options for melasma-prone Indian skin include Minimalist SPF 50 PA++++, La Roche-Posay Anthelios UVMune 400, Bioderma Photoderm MAX SPF 50+, and Dot & Key Waterlight Sunscreen SPF 50. Tinted sunscreens like Re\'equil Oxybenzone & OMC Free Sunscreen add protection against visible light, which also triggers melasma.')],
        [lxBold('Vitamin C serums'), lxText(' brighten existing patches and protect against further UV-induced melanin production. Look for Minimalist 10% Vitamin C Face Serum, Mamaearth Skin Illuminate Vitamin C Serum, or Pilgrim 20% Vitamin C Serum for daily use.')],
        [lxBold('Niacinamide serums'), lxText(' reduce melanin transfer to skin cells and visibly lighten dark patches over time. Minimalist 10% Niacinamide Serum, The Ordinary Niacinamide 10% + Zinc 1%, and Dot & Key Pore Cleansing Niacinamide Serum are trusted options.')],
        [lxBold('Anti-melasma & pigmentation creams.'), lxText(" Kaya Skin Clinic Brightening Cream, Lotus Herbals White Glow Gel, and Melacare Forte Cream (prescription-only — hydroquinone + tretinoin + mometasone) are commonly recommended. Melacare should only be used under a dermatologist's supervision.")],
        [lxBold('Kojic & azelaic acid products'), lxText(' are gentler alternatives for sensitive skin. Minimalist Azelaic Acid 10% Serum and Peach & Lily Glass Skin Serum reduce pigmentation without harsh irritation.')],
        [lxBold('Retinol / tretinoin creams.'), lxText(" Tretinoin accelerates cell turnover and fades melasma with consistent use. Obagi Tretinoin Cream 0.05% and Differin Adapalene Gel are widely used. Always start low and use only at night under a dermatologist's guidance.")],
      ]),
    ),
  },
  {
    heading: 'Can Melasma Be Removed Permanently?',
    content: lxRoot(
      lxPara([
        'Melasma can be significantly lightened and controlled, but it is a chronic condition that can return when triggers like sun exposure or hormonal changes are not managed. Consistent treatment, daily sun protection, and dermatologist-led maintenance are what keep it from coming back. Stopping treatment too early is the most common reason melasma reappears.',
      ]),
    ),
  },
  {
    heading: 'Melasma Treatment at Uncover Clinics',
    content: lxRoot(
      lxPara([
        'Over-the-counter creams rarely work for melasma that has been sitting on the skin for months. At Uncover Clinics, pigmentation is treated as a clinical condition — not a cosmetic one.',
      ]),
      lxNumbered([
        [lxBold('Skin & pigmentation analysis.'), lxText(' Assessment of pigmentation depth, skin type, and hormonal or lifestyle triggers before any treatment begins.')],
        [lxBold('Medical-grade chemical peels.'), lxText(' Glycolic, lactic, or TCA peels tailored to Indian skin sensitivities, removing pigmented layers and accelerating skin renewal.')],
        [lxBold('Q-switch laser / laser toning.'), lxText(' Precisely targets deep melanin deposits without damaging surrounding tissue — one of the most effective treatments for stubborn melasma.')],
        [lxBold('Prescription topical protocols.'), lxText(' Dermatologist-formulated combinations of hydroquinone, tretinoin, and azelaic acid prescribed based on your specific pigmentation type and skin tone.')],
        [lxBold('Sunscreen & maintenance regimen.'), lxText(' A clinically recommended SPF and skincare routine to sustain results and prevent recurrence.')],
      ]),
      lxPara([
        "Whether it's melasma on cheeks, dark patches on the forehead, pigmentation around the nose, or chloasma from pregnancy, Uncover's dermatologists assess the root cause and treat it with precision.",
      ]),
    ),
  },
];

// Notices (Also-read + Important). These slot into the sequence at specific
// positions defined by `orderedBlocks` below.
const notices = {
  glutathione: {
    variant: 'note', icon: 'sparkles',
    heading: 'Also read',
    body: 'Glutathione injections for skin brightening — complete guide to cost, benefits, and safety.',
  },
  sunscreens: {
    variant: 'note', icon: 'sun',
    heading: 'Also read',
    body: 'Top sunscreens in India — recommended by dermatologists for melasma-prone skin.',
  },
  important: {
    variant: 'warning', icon: 'zap',
    heading: 'Important',
    body: 'No single product cures melasma. The best results come from a combination of daily SPF, an active ingredient serum (vitamin C or niacinamide), and a dermatologist-prescribed treatment cream, used consistently over months.',
  },
};

const cta = {
  heading: 'Ready to treat your melasma?',
  description:
    'Book a consultation with our dermatologists at Uncover Clinics. Personalised pigmentation treatment tailored to Indian skin — with long-lasting results.',
  primaryCta:   { label: 'Book Appointment', href: '#booking' },
  secondaryCta: { label: 'Call +91 9752007200', href: 'tel:+919752007200' },
  variant: 'dark',
};

// The composed sequence, in order. Each entry is either a textSection
// (referenced by index into `textSections`) or a block kind directly.
// Index map for textSections above:
//   0 intro, 1 What Is, 2 Symptoms, 3 Causes, 4 vs Hyperpig,
//   5 How to Treat, 6 Home Remedies, 7 Best Products,
//   8 Can it be Removed, 9 Uncover Clinics
const sequence = [
  { kind: 'text',   idx: 0 },
  { kind: 'text',   idx: 1 },
  { kind: 'text',   idx: 2 },
  { kind: 'text',   idx: 3 },
  { kind: 'notice', data: notices.glutathione },
  { kind: 'text',   idx: 4 },
  { kind: 'text',   idx: 5 },
  { kind: 'text',   idx: 6 },
  { kind: 'notice', data: notices.sunscreens },
  { kind: 'text',   idx: 7 },
  { kind: 'notice', data: notices.important },
  { kind: 'text',   idx: 8 },
  { kind: 'text',   idx: 9 },
  { kind: 'cta',    data: cta },
];

// ── Apply within a transaction ────────────────────────────────────────────
try {
  await c.query('BEGIN');

  // Wipe every pageBlocks row across every block table for this post.
  // Only tables we're inserting into need clearing, but we're thorough —
  // the script is idempotent, so any previously-written blocks for other
  // block types get dropped too.
  const tablesToClear = [
    'text_section', 'notice_block', 'cta_block', 'content_grid', 'content_grid_items',
    'video_embed', 'html_embed', 'overview_block', 'overview_block_paragraphs',
    'benefits_block', 'benefits_block_items', 'process_block', 'process_block_steps',
    'before_after_block', 'before_after_block_items',
    'data_table', 'data_table_columns', 'data_table_rows', 'data_table_rows_cells',
    'pricing_block', 'pricing_block_plans', 'pricing_block_plans_features',
    'image_slider', 'image_slider_images', 'stats_block', 'stats_block_items',
    'technology', 'doctors_embed', 'testimonials_embed', 'faqs_embed', 'faqs_embed_inline_faqs',
    'booking_form',
  ];
  for (const t of tablesToClear) {
    await c.query(
      `DELETE FROM cms.blog_posts_blocks_${t} WHERE _parent_id=$1`,
      [POST_ID],
    );
  }

  let order = 0;
  const next = () => ++order;

  for (const step of sequence) {
    if (step.kind === 'text') {
      const section = textSections[step.idx];
      await c.query(
        `INSERT INTO cms.blog_posts_blocks_text_section
           (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)`,
        [randomUUID(), POST_ID, next(), PATH, section.heading, JSON.stringify(section.content)],
      );
    } else if (step.kind === 'notice') {
      const n = step.data;
      await c.query(
        `INSERT INTO cms.blog_posts_blocks_notice_block
           (id, _parent_id, _order, _path, variant, icon, heading, body, block_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)`,
        [randomUUID(), POST_ID, next(), PATH, n.variant, n.icon, n.heading, n.body],
      );
    } else if (step.kind === 'cta') {
      const d = step.data;
      await c.query(
        `INSERT INTO cms.blog_posts_blocks_cta_block
           (id, _parent_id, _order, _path, heading, description,
            primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href,
            variant, block_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)`,
        [
          randomUUID(), POST_ID, next(), PATH,
          d.heading, d.description,
          d.primaryCta.label, d.primaryCta.href,
          d.secondaryCta.label, d.secondaryCta.href,
          d.variant,
        ],
      );
    }
  }

  await c.query('COMMIT');
  console.log(`Melasma (blog_posts id=${POST_ID}): wrote ${order} blocks`);
} catch (err) {
  await c.query('ROLLBACK');
  console.error(err);
  process.exit(1);
} finally {
  await c.end();
}
