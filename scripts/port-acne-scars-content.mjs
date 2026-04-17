#!/usr/bin/env node
/**
 * One-off content port for the Acne Scars concern, to prove the pageBlocks
 * architecture can match the uncover-gags reference page visually.
 *
 * Source: https://uncover-web.netlify.app/concern/acne-scars/
 * Target: concerns.slug='acne-scars' in cms db
 *
 * The script DELETES the existing narrative pageBlocks (textSection,
 * technology) for this concern, then inserts a new composition:
 *   1. textSection — Understanding Acne and Acne Scars
 *   2. textSection — Types of Acne Scars (bulleted list)
 *   3. textSection — Common Causes of Acne (bulleted list)
 *   4. textSection — Advanced Treatment Solutions at UNCOVER (lead para)
 *   5. contentGrid — 4 cards: Microneedling, CO2 Laser, Medical Peel, Vampire Facial
 *   6. textSection — Our Treatment Philosophy
 *   7. noticeBlock — Consistency Over Intensity
 *   8. textSection — What to Expect
 *   9. ctaBlock — Reclaim Clear, Smooth Skin (dark variant)
 *  10..11. Existing doctorsEmbed + faqsEmbed blocks are left in place and
 *     shifted up so they still appear at the end.
 *
 * Idempotent: drops + recreates narrative blocks on every run. Existing
 * doctorsEmbed / faqsEmbed rows are preserved and re-ordered.
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
    children: Array.isArray(item) ? item.map(x => typeof x === 'string' ? lxText(x) : x) : [lxText(item)],
    direction: 'ltr',
  })),
  direction: 'ltr',
});
const lxRoot = (...children) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
});
const lxBold = (text) => lxText(text, 1);

// ── Target concern ────────────────────────────────────────────────────────
const concernRow = (await c.query("SELECT id FROM cms.concerns WHERE slug='acne-scars' LIMIT 1")).rows[0];
if (!concernRow) { console.error('acne-scars concern not found'); process.exit(1); }
const CONCERN_ID = concernRow.id;
const PATH = 'pageBlocks';

// ── Block content definitions ─────────────────────────────────────────────
const textSections = [
  {
    heading: 'Understanding Acne and Acne Scars',
    content: lxRoot(
      lxPara(['Acne is one of the most common skin conditions worldwide, affecting teenagers and adults alike. It occurs when hair follicles become blocked with sebum (oil) and dead skin cells, creating an environment where Cutibacterium acnes bacteria flourish and trigger inflammation. The result can range from comedones (blackheads and whiteheads) to painful cysts and nodules.']),
      lxPara(["When acne lesions heal \u2014 particularly inflammatory ones \u2014 they often leave behind scars and pigmentation that can persist for years. Scarring occurs because the skin\u2019s collagen repair process is disrupted during deep inflammation, leading to either loss of tissue (atrophic scars) or excess tissue (hypertrophic scars)."]),
    ),
  },
  {
    heading: 'Types of Acne Scars',
    content: lxRoot(
      lxPara(['Not all acne scars are the same \u2014 and identifying the type is key to choosing the right treatment.']),
      lxBullet([
        [lxBold('Ice pick scars'), lxText(' \u2014 Deep, narrow, V-shaped scars that look like the skin has been pierced with a sharp tool. These are the most challenging to treat and often require fractional CO2 laser or TCA CROSS.')],
        [lxBold('Rolling scars'), lxText(' \u2014 Shallow, wave-like depressions with sloping edges caused by fibrous tethering beneath the skin. Subcision combined with microneedling or fillers works well.')],
        [lxBold('Boxcar scars'), lxText(' \u2014 Broad, rectangular depressions with sharp vertical edges, similar in appearance to chickenpox scars. Fractional laser and microneedling with RF are highly effective.')],
        [lxBold('Hypertrophic/keloid scars'), lxText(' \u2014 Raised, thickened scars more common on the chest, back, and jawline. Treated with intralesional steroids and laser.')],
        [lxBold('Post-inflammatory hyperpigmentation (PIH)'), lxText(' \u2014 Flat, dark marks left after an acne lesion heals. Not a true scar, but often mistaken for one.')],
      ]),
    ),
  },
  {
    heading: 'Common Causes of Acne',
    content: lxRoot(
      lxBullet([
        [lxBold('Excess sebum'), lxText(' \u2014 Overactive sebaceous glands produce more oil than the skin needs.')],
        [lxBold('Clogged follicles'), lxText(' \u2014 Dead skin cells mix with oil to block pores.')],
        [lxBold('Bacterial overgrowth'), lxText(' \u2014 P. acnes bacteria trigger immune response and inflammation.')],
        [lxBold('Hormones'), lxText(' \u2014 Androgens, PCOS, and menstrual cycles strongly influence breakouts.')],
        [lxBold('Picking and squeezing'), lxText(' \u2014 Damages the follicle wall and drives deeper inflammation.')],
        [lxBold('Comedogenic skincare'), lxText(' \u2014 Heavy oils, silicones, and occlusive ingredients.')],
        [lxBold('Diet and lifestyle'), lxText(' \u2014 High-glycaemic foods, dairy, stress, and poor sleep.')],
      ]),
    ),
  },
  {
    heading: 'Advanced Treatment Solutions at UNCOVER',
    content: lxRoot(
      lxPara(['At UNCOVER Clinic, we take a multi-layered approach \u2014 first controlling active acne, then systematically addressing scars, pigmentation, and texture.']),
    ),
  },
];

const contentGridItems = [
  { title: 'Advanced Microneedling', description: 'Controlled micro-injuries stimulate collagen remodelling and dramatically reduce rolling and boxcar scars over 4-6 sessions.', icon: 'zap' },
  { title: 'Fractional CO2 Laser',    description: 'Gold-standard resurfacing that vaporises scar tissue and triggers deep collagen rebuilding \u2014 especially effective for ice pick and boxcar scars.', icon: 'sparkles' },
  { title: 'Anti-Scar Medical Peel',  description: 'Dermatologist-grade chemical peels exfoliate damaged layers, fade post-inflammatory pigmentation, and refine skin texture.', icon: 'leaf' },
  { title: 'Vampire Facial (PRP)',    description: 'Platelet-Rich Plasma from your own blood accelerates healing, boosts collagen, and enhances results when combined with microneedling.', icon: 'heart' },
];

const philosophy = {
  heading: 'Our Treatment Philosophy',
  content: lxRoot(
    lxPara(['Clearing acne is step one \u2014 repairing the skin is step two. We always begin with a thorough dermatological consultation to identify hormonal, dietary, or topical triggers, then stabilise active breakouts with medical-grade skincare before commencing scar revision procedures. Treating scars while acne is still active can worsen inflammation and post-inflammatory pigmentation.']),
  ),
};

const notice = {
  variant: 'tip',
  icon: 'leaf',
  heading: 'Consistency Over Intensity',
  body: 'Acne scar revision is a marathon, not a sprint. Consistent sessions spaced 4-6 weeks apart deliver far better results than aggressive one-off treatments, with less downtime and fewer side effects.',
};

const whatToExpect = {
  heading: 'What to Expect',
  content: lxRoot(
    lxPara(['Most patients need a combination of treatments over 3-6 months for visible improvement, with full collagen remodelling continuing for up to a year after your final session. Daily sunscreen use (SPF 50+) is non-negotiable during and after treatment \u2014 UV exposure darkens PIH and slows collagen repair.']),
  ),
};

const cta = {
  heading: 'Reclaim Clear, Smooth Skin',
  description: 'Book a consultation with our expert dermatologists and start your personalised acne and scar treatment plan today.',
  primaryCta:   { label: 'Book Appointment', href: '#booking' },
  secondaryCta: { label: 'Call us Now',      href: 'tel:+919752007200' },
  variant: 'dark',
};

// ── Apply within a transaction ────────────────────────────────────────────
try {
  await c.query('BEGIN');

  // 1. Wipe existing narrative blocks for this concern (but keep embeds).
  await c.query("DELETE FROM cms.concerns_blocks_text_section    WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);
  await c.query("DELETE FROM cms.concerns_blocks_technology      WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);
  await c.query("DELETE FROM cms.concerns_blocks_content_grid       WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);
  await c.query("DELETE FROM cms.concerns_blocks_content_grid_items WHERE _parent_id IN (SELECT id FROM cms.concerns_blocks_content_grid WHERE _parent_id=$1)", [CONCERN_ID]);
  await c.query("DELETE FROM cms.concerns_blocks_notice_block    WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);
  await c.query("DELETE FROM cms.concerns_blocks_cta_block       WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);

  // 2. Re-order the surviving embeds (doctors + faqs) to start at _order 100
  //    so our new blocks (1..99) sit cleanly before them.
  await c.query("UPDATE cms.concerns_blocks_doctors_embed SET _order = 100 WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);
  await c.query("UPDATE cms.concerns_blocks_faqs_embed    SET _order = 101 WHERE _parent_id=$1 AND _path=$2", [CONCERN_ID, PATH]);

  let order = 0;
  const next = () => ++order;

  // 3. Insert narrative text sections (1..4)
  for (const section of textSections) {
    await c.query(`
      INSERT INTO cms.concerns_blocks_text_section
        (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
      VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)
    `, [randomUUID(), CONCERN_ID, next(), PATH, section.heading, JSON.stringify(section.content)]);
  }

  // 4. Insert contentGrid (5) with its 4 items.
  const gridId = randomUUID();
  await c.query(`
    INSERT INTO cms.concerns_blocks_content_grid
      (id, _parent_id, _order, _path, eyebrow, heading, columns, block_name)
    VALUES ($1, $2, $3, $4, NULL, NULL, '2', NULL)
  `, [gridId, CONCERN_ID, next(), PATH]);
  for (let i = 0; i < contentGridItems.length; i++) {
    const item = contentGridItems[i];
    await c.query(`
      INSERT INTO cms.concerns_blocks_content_grid_items
        (id, _parent_id, _order, title, description, image_url, image_alt_text, href, icon)
      VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, $6)
    `, [randomUUID(), gridId, i + 1, item.title, item.description, item.icon]);
  }

  // 5. Insert philosophy text (6)
  await c.query(`
    INSERT INTO cms.concerns_blocks_text_section
      (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
    VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)
  `, [randomUUID(), CONCERN_ID, next(), PATH, philosophy.heading, JSON.stringify(philosophy.content)]);

  // 6. Insert notice (7)
  await c.query(`
    INSERT INTO cms.concerns_blocks_notice_block
      (id, _parent_id, _order, _path, variant, icon, heading, body, block_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)
  `, [randomUUID(), CONCERN_ID, next(), PATH, notice.variant, notice.icon, notice.heading, notice.body]);

  // 7. Insert "What to Expect" (8)
  await c.query(`
    INSERT INTO cms.concerns_blocks_text_section
      (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
    VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)
  `, [randomUUID(), CONCERN_ID, next(), PATH, whatToExpect.heading, JSON.stringify(whatToExpect.content)]);

  // 8. Insert CTA (9)
  await c.query(`
    INSERT INTO cms.concerns_blocks_cta_block
      (id, _parent_id, _order, _path, heading, description,
       primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href,
       variant, block_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)
  `, [
    randomUUID(), CONCERN_ID, next(), PATH,
    cta.heading, cta.description,
    cta.primaryCta.label, cta.primaryCta.href,
    cta.secondaryCta.label, cta.secondaryCta.href,
    cta.variant,
  ]);

  await c.query('COMMIT');
  console.log(`Acne Scars (concern id=${CONCERN_ID}): wrote ${order} narrative blocks + kept doctorsEmbed + faqsEmbed`);
} catch (err) {
  await c.query('ROLLBACK');
  console.error(err);
  process.exit(1);
} finally {
  await c.end();
}
