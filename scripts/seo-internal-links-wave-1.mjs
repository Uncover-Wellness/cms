#!/usr/bin/env node
/**
 * Add the first GSC-led internal-linking wave to selected high-value blogs.
 *
 * Safe by default: run without --apply for a dry run. The script is
 * transactional, idempotent after a complete run, and stops when it finds a
 * partially applied article so duplicate link paragraphs are never appended.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seo-internal-links-wave-1.mjs
 *   node --env-file=.env.local scripts/seo-internal-links-wave-1.mjs --apply
 */

import pg from 'pg';
import { randomBytes } from 'node:crypto';

const { Client } = pg;
const apply = process.argv.includes('--apply');
const LEGACY_LASER_URLS = new Set([
  '/c/laser',
  '/c/laser/',
  'https://uncover.co.in/c/laser',
  'https://uncover.co.in/c/laser/',
]);
const CANONICAL_LASER_URL = 'https://uncover.co.in/c/laser-hair-removal';

const plans = [
  {
    slug: 'indian-diet-plan-to-lose-10-kg-in-1-month-your-complete-guide',
    parts: [
      'For structured support beyond a diet chart, explore our ',
      ['weight management programme', 'https://uncover.co.in/treatment/weight-management-program'],
      ', learn how we approach ',
      ['weight-loss concerns', 'https://uncover.co.in/concern/weight-loss'],
      ', browse related ',
      ['body treatments', 'https://uncover.co.in/c/body'],
      ', or read our guide to ',
      ['fat-burning drinks', 'https://uncover.co.in/post/7-indian-fat-burning-drinks-that-can-actually-help-you-lose-belly-fat'],
      '.',
    ],
  },
  {
    slug: 'top-sunscreens-in-india-recommended-by-dermatologists',
    parts: [
      'Daily sunscreen is also central to managing ',
      ['skin tanning', 'https://uncover.co.in/concern/skin-tanning'],
      ' and ',
      ['hyperpigmentation', 'https://uncover.co.in/concern/hyper-pigmentation'],
      '. Explore our dermatologist-led ',
      ['skin treatments', 'https://uncover.co.in/c/skin'],
      ' when pigmentation persists despite consistent sun protection.',
    ],
  },
  {
    slug: 'how-to-get-rid-of-your-nipple-breast-hair',
    parts: [
      'If temporary methods cause irritation or repeated regrowth, learn about treatment options for ',
      ['unwanted hair', 'https://uncover.co.in/concern/unwanted-hair'],
      ', including ',
      ['laser hair removal for women', 'https://uncover.co.in/treatment/laser-hair-removal-women'],
      ' and ',
      ['upper-body laser hair removal', 'https://uncover.co.in/treatment/laser-hair-body-upper-body'],
      '.',
    ],
  },
  {
    slug: '6-home-remedies-to-fade-burn-scars',
    parts: [
      'For scars that do not fade with home care, explore our ',
      ['scar treatment options', 'https://uncover.co.in/concern/scars'],
      ', including ',
      ['CO2 laser treatment', 'https://uncover.co.in/treatment/co2-laser-treatment'],
      ' and a dermatologist-assessed ',
      ['anti-scar peel', 'https://uncover.co.in/treatment/anti-scar-peel'],
      '.',
    ],
  },
  {
    slug: '13-proven-tips-to-regrow-thicker-hair-naturally',
    parts: [
      'If home care is not enough, explore our approach to ',
      ['hair loss and thinning', 'https://uncover.co.in/concern/hair-loss-thinning'],
      ', ',
      ['GFC hair restoration', 'https://uncover.co.in/treatment/gfc-hair-restoration'],
      ', and ',
      ['PRP hair treatment', 'https://uncover.co.in/treatment/prp-hair'],
      '.',
    ],
  },
  {
    slug: 'height-weight-chart-according-to-age-for-male-female-focussed-weight-reduction',
    parts: [
      'Use this chart as a screening reference rather than a diagnosis. For a personalised plan, explore ',
      ['weight-management support', 'https://uncover.co.in/concern/weight-management'],
      ', our ',
      ['weight management programme', 'https://uncover.co.in/treatment/weight-management-program'],
      ', and related ',
      ['body treatments', 'https://uncover.co.in/c/body'],
      '.',
    ],
  },
  {
    slug: '1000-calorie-diet-plan-your-complete-guide-to-safe-and-effective-weight-loss',
    parts: [
      'Very-low-calorie plans are not suitable for everyone. For supervised support, explore ',
      ['weight-loss care', 'https://uncover.co.in/concern/weight-loss'],
      ', our ',
      ['weight management programme', 'https://uncover.co.in/treatment/weight-management-program'],
      ', and the ',
      ['Indian diet-plan guide', 'https://uncover.co.in/post/indian-diet-plan-to-lose-10-kg-in-1-month-your-complete-guide'],
      '.',
    ],
  },
  {
    slug: 'what-areas-are-included-in-full-body-laser-hair-removal',
    parts: [
      'For next steps, review our ',
      ['laser hair removal overview', 'https://uncover.co.in/treatment/laser-hair-removal'],
      ', browse the ',
      ['laser hair removal service category', 'https://uncover.co.in/c/laser-hair-removal'],
      ', and compare ',
      ['laser hair removal costs by area and city', 'https://uncover.co.in/post/laser-hair-removal-cost-in-india-gurugram-noida-delhi'],
      '.',
    ],
  },
  {
    slug: 'simple-home-remedies-for-acne-scars',
    parts: [
      'For persistent acne marks, explore ',
      ['acne scar care', 'https://uncover.co.in/concern/acne-scars'],
      ', ',
      ['CO2 laser treatment', 'https://uncover.co.in/treatment/co2-laser-treatment'],
      ', and ',
      ['anti-scar peel', 'https://uncover.co.in/treatment/anti-scar-peel'],
      ' options that a dermatologist can match to your scar type.',
    ],
  },
  {
    slug: 'is-micropigmentation-safe-for-vitiligo',
    parts: [
      'For more context before choosing a procedure, read our guides to ',
      ['vitiligo symptoms, causes and treatment', 'https://uncover.co.in/post/vitiligo-symptoms-causes-and-treatment-vitiligo-skin-pigmentation'],
      ' and ',
      ['choosing a vitiligo treatment', 'https://uncover.co.in/post/i-have-vitiligo-which-treatment-is-the-best'],
      ', or ',
      ['find an Uncover dermatologist', 'https://uncover.co.in/uncover-dermatologists'],
      '.',
    ],
  },
  {
    slug: 'skin-whitening-cream-in-india',
    parts: [
      'Persistent pigmentation needs a diagnosis before treatment. Explore our ',
      ['hyperpigmentation care', 'https://uncover.co.in/concern/hyper-pigmentation'],
      ', ',
      ['laser toning', 'https://uncover.co.in/treatment/laser-toning'],
      ', and ',
      ['Q-switch laser', 'https://uncover.co.in/treatment/q-switch-laser'],
      ' pages for dermatologist-led options.',
    ],
  },
];

function textNode(text, format = 0) {
  return {
    mode: 'normal',
    text,
    type: 'text',
    style: '',
    detail: 0,
    format,
    version: 1,
  };
}

function linkNode(label, url) {
  return {
    id: randomBytes(12).toString('hex'),
    type: 'link',
    fields: { url, newTab: false, linkType: 'custom' },
    format: '',
    indent: 0,
    version: 3,
    children: [textNode(label, 8)],
    direction: null,
  };
}

function paragraphNode(parts) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: parts.map((part) =>
      Array.isArray(part) ? linkNode(part[0], part[1]) : textNode(part),
    ),
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
  };
}

function plannedUrls(plan) {
  return plan.parts.filter(Array.isArray).map((part) => part[1]);
}

function collectUrls(value, output = []) {
  if (Array.isArray(value)) {
    for (const child of value) collectUrls(child, output);
  } else if (value && typeof value === 'object') {
    if (value.type === 'link' && typeof value.fields?.url === 'string') {
      output.push(value.fields.url);
    }
    for (const child of Object.values(value)) collectUrls(child, output);
  }
  return output;
}

function normalizeLegacyLaserUrl(value) {
  let replacements = 0;
  function visit(node) {
    if (Array.isArray(node)) {
      for (let index = 0; index < node.length; index += 1) {
        if (typeof node[index] === 'string' && LEGACY_LASER_URLS.has(node[index])) {
          node[index] = CANONICAL_LASER_URL;
          replacements += 1;
        } else {
          visit(node[index]);
        }
      }
    } else if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        if (typeof child === 'string' && LEGACY_LASER_URLS.has(child)) {
          node[key] = CANONICAL_LASER_URL;
          replacements += 1;
        } else {
          visit(child);
        }
      }
    }
  }
  visit(value);
  return replacements;
}

async function normalizeJsonColumn(client, table, idColumn, jsonColumn) {
  const result = await client.query(
    `SELECT ${idColumn} AS id, ${jsonColumn} AS value
       FROM cms.${table}
      WHERE ${jsonColumn}::text LIKE '%/c/laser%'`,
  );
  let rowsChanged = 0;
  let linksChanged = 0;
  for (const row of result.rows) {
    const replacements = normalizeLegacyLaserUrl(row.value);
    if (!replacements) continue;
    rowsChanged += 1;
    linksChanged += replacements;
    if (apply) {
      await client.query(
        `UPDATE cms.${table} SET ${jsonColumn} = $1 WHERE ${idColumn} = $2`,
        [row.value, row.id],
      );
    }
  }
  return { rowsChanged, linksChanged };
}

const client = new Client({
  connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL,
});

await client.connect();
await client.query('BEGIN');

try {
  const canonicalResults = [];
  for (const args of [
    ['blog_posts', 'id', 'post_body'],
    ['blog_posts', 'id', 'rich_text2'],
    ['blog_posts_blocks_text_section', 'id', 'content'],
    ['_blog_posts_v', 'id', 'version_post_body'],
    ['_blog_posts_v', 'id', 'version_rich_text2'],
    ['_blog_posts_v_blocks_text_section', 'id', 'content'],
  ]) {
    const result = await normalizeJsonColumn(client, ...args);
    canonicalResults.push({ source: `${args[0]}.${args[2]}`, ...result });
  }

  let added = 0;
  let alreadyComplete = 0;
  for (const plan of plans) {
    const postResult = await client.query(
      `SELECT id, post_body, rich_text2
         FROM cms.blog_posts
        WHERE slug = $1`,
      [plan.slug],
    );
    if (postResult.rowCount !== 1) {
      throw new Error(`Expected one blog post for ${plan.slug}; found ${postResult.rowCount}`);
    }

    const post = postResult.rows[0];
    const blocksResult = await client.query(
      `SELECT id, heading, content
         FROM cms.blog_posts_blocks_text_section
        WHERE _parent_id = $1
        ORDER BY _order`,
      [post.id],
    );
    if (!blocksResult.rowCount) {
      throw new Error(`No text section blocks found for ${plan.slug}`);
    }

    const existingUrls = new Set([
      ...collectUrls(post.post_body),
      ...collectUrls(post.rich_text2),
      ...blocksResult.rows.flatMap((block) => collectUrls(block.content)),
    ]);
    const requiredUrls = plannedUrls(plan);
    const presentCount = requiredUrls.filter((url) => existingUrls.has(url)).length;
    if (presentCount === requiredUrls.length) {
      alreadyComplete += 1;
      console.log(`SKIP ${plan.slug}: all ${requiredUrls.length} links already present`);
      continue;
    }
    if (presentCount > 0) {
      throw new Error(
        `Partial state for ${plan.slug}: ${presentCount}/${requiredUrls.length} planned links already exist`,
      );
    }

    const targetBlock = blocksResult.rows.at(-1);
    const content = structuredClone(targetBlock.content);
    if (!Array.isArray(content?.root?.children)) {
      throw new Error(`Invalid Lexical root in final text block for ${plan.slug}`);
    }
    content.root.children.push(paragraphNode(plan.parts));

    if (apply) {
      await client.query(
        `UPDATE cms.blog_posts_blocks_text_section
            SET content = $1
          WHERE id = $2`,
        [content, targetBlock.id],
      );
      await client.query(
        `UPDATE cms.blog_posts SET updated_at = NOW() WHERE id = $1`,
        [post.id],
      );
    }
    added += 1;
    console.log(
      `${apply ? 'ADD' : 'PLAN'} ${plan.slug}: ${requiredUrls.length} links in “${targetBlock.heading || 'final section'}”`,
    );
  }

  if (apply) await client.query('COMMIT');
  else await client.query('ROLLBACK');

  console.log('\nCanonical cleanup:');
  for (const result of canonicalResults.filter((item) => item.linksChanged > 0)) {
    console.log(`  ${result.source}: ${result.linksChanged} links in ${result.rowsChanged} rows`);
  }
  console.log(`\nArticles ${apply ? 'updated' : 'planned'}: ${added}`);
  console.log(`Articles already complete: ${alreadyComplete}`);
  if (!apply) console.log('Dry run only; no database changes were made.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
