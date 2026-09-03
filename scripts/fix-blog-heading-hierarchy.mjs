#!/usr/bin/env node
/**
 * Repair the known duplicate/invalid blog headings in live rows and revisions.
 * Dry-run by default; pass --apply to commit.
 */
import pg from 'pg';

const { Client } = pg;
const apply = process.argv.includes('--apply');

const rules = new Map([
  ['laser-hair-removal-cost-in-india-gurugram-noida-delhi', {
    remove: ['Laser Hair Removal Cost in Delhi NCR|'],
    clearBlockHeadings: ['How Much Does Laser Hair Removal Cost in Delhi NCR?'],
  }],
  ['10-wonderful-home-remedies-for-wrinkles', {
    h2: ['Home Remedies for Wrinkles', 'Types of Wrinkles'],
  }],
  ['how-to-protect-your-skin-this-summer', {
    h2: ['Sun Protection Goes Beyond Sunscreen', 'Professional Treatments for Sun Damage', 'Key Takeaways'],
  }],
  ['pcos-renamed-to-pmos-what-you-need-to-know-about-this-landmark-change-in-womens-hormonal-health', {
    h2: ['PMOS Symptoms: What to Look For'],
  }],
  ['ways-and-cost-to-remove-ear-hair-permanently', {
    h2: ['Why Choose Laser for Ear Hair Removal?', 'Why Do We Even Have Ear Hair?', 'Quick Fixes: Temporary Ways to Remove Ear Hair'],
  }],
  ['trimming-or-shaving-which-is-better-for-first-timers', {
    remove: ['Trimming or Shaving: Which One Should You Choose First?'],
    clearEmptyBlockHeadings: true,
  }],
  ['how-to-remove-underarm-hair-permanently', {
    remove: ['How to Remove Underarm Hair Permanently: The Complete Guide'],
  }],
  ['how-to-remove-chin-hair-permanently', {
    remove: ['How to Remove Chin Hair Permanently: What Really Works for Women'],
    clearEmptyBlockHeadings: true,
  }],
]);

const normalize = (value = '') => value
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\u00a0/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function nodeText(node) {
  if (!node || typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  return Array.isArray(node.children) ? node.children.map(nodeText).join('') : '';
}

function transformRichText(value, rule, stats) {
  if (!value || typeof value !== 'object') return value;

  const removedNode = Symbol('removedNode');

  function visit(node) {
    if (Array.isArray(node)) {
      return node.map(visit).filter((item) => item !== removedNode);
    }

    if (!node || typeof node !== 'object') return node;
    const text = normalize(nodeText(node));
    if (node.type === 'heading' && (rule.remove || []).includes(text)) {
      stats.removed += 1;
      return removedNode;
    }

    const copy = {};
    for (const [key, child] of Object.entries(node)) copy[key] = visit(child);
    if (copy.type === 'heading' && (rule.h2 || []).includes(text) && copy.tag !== 'h2') {
      copy.tag = 'h2';
      stats.changedToH2 += 1;
    }
    return copy;
  }

  return visit(value);
}

function shouldClearHeading(heading, rule) {
  const text = normalize(heading || '');
  return (rule.clearBlockHeadings || []).includes(text) || (rule.clearEmptyBlockHeadings && heading != null && !text);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('BEGIN');

const stats = {
  liveRichTextRows: 0,
  versionRichTextRows: 0,
  liveBlockHeadings: 0,
  versionBlockHeadings: 0,
  liveRemoved: 0,
  liveChangedToH2: 0,
  versionRemoved: 0,
  versionChangedToH2: 0,
};
const liveNodeStats = {
  get removed() { return stats.liveRemoved; },
  set removed(value) { stats.liveRemoved = value; },
  get changedToH2() { return stats.liveChangedToH2; },
  set changedToH2(value) { stats.liveChangedToH2 = value; },
};
const versionNodeStats = {
  get removed() { return stats.versionRemoved; },
  set removed(value) { stats.versionRemoved = value; },
  get changedToH2() { return stats.versionChangedToH2; },
  set changedToH2(value) { stats.versionChangedToH2 = value; },
};
const touchedPostIds = new Set();

try {
  const slugs = [...rules.keys()];

  const livePosts = await client.query(
    `SELECT id, slug, post_body FROM cms.blog_posts WHERE slug = ANY($1)`,
    [slugs],
  );
  if (livePosts.rowCount !== slugs.length) {
    const found = new Set(livePosts.rows.map((row) => row.slug));
    throw new Error(`Missing target posts: ${slugs.filter((slug) => !found.has(slug)).join(', ')}`);
  }

  for (const row of livePosts.rows) {
    const before = JSON.stringify(row.post_body);
    const afterValue = transformRichText(row.post_body, rules.get(row.slug), liveNodeStats);
    if (JSON.stringify(afterValue) !== before) {
      await client.query('UPDATE cms.blog_posts SET post_body = $1 WHERE id = $2', [afterValue, row.id]);
      stats.liveRichTextRows += 1;
      touchedPostIds.add(row.id);
    }
  }

  const liveBlocks = await client.query(
    `SELECT b.id, b._parent_id, b.heading, b.content, p.slug
       FROM cms.blog_posts_blocks_text_section b
       JOIN cms.blog_posts p ON p.id = b._parent_id
      WHERE p.slug = ANY($1)`,
    [slugs],
  );
  for (const row of liveBlocks.rows) {
    const rule = rules.get(row.slug);
    const before = JSON.stringify(row.content);
    const afterValue = transformRichText(row.content, rule, liveNodeStats);
    if (JSON.stringify(afterValue) !== before) {
      await client.query('UPDATE cms.blog_posts_blocks_text_section SET content = $1 WHERE id = $2', [afterValue, row.id]);
      stats.liveRichTextRows += 1;
      touchedPostIds.add(row._parent_id);
    }
    if (shouldClearHeading(row.heading, rule)) {
      await client.query('UPDATE cms.blog_posts_blocks_text_section SET heading = NULL WHERE id = $1', [row.id]);
      stats.liveBlockHeadings += 1;
      touchedPostIds.add(row._parent_id);
    }
  }

  const versions = await client.query(
    `SELECT v.id, v.parent_id, p.slug, v.version_post_body
       FROM cms._blog_posts_v v
       JOIN cms.blog_posts p ON p.id = v.parent_id
      WHERE p.slug = ANY($1)`,
    [slugs],
  );
  for (const row of versions.rows) {
    const before = JSON.stringify(row.version_post_body);
    const afterValue = transformRichText(row.version_post_body, rules.get(row.slug), versionNodeStats);
    if (JSON.stringify(afterValue) !== before) {
      await client.query('UPDATE cms._blog_posts_v SET version_post_body = $1 WHERE id = $2', [afterValue, row.id]);
      stats.versionRichTextRows += 1;
    }
  }

  const versionBlocks = await client.query(
    `SELECT b.id, b.heading, b.content, p.slug
       FROM cms._blog_posts_v_blocks_text_section b
       JOIN cms._blog_posts_v v ON v.id = b._parent_id
       JOIN cms.blog_posts p ON p.id = v.parent_id
      WHERE p.slug = ANY($1)`,
    [slugs],
  );
  for (const row of versionBlocks.rows) {
    const rule = rules.get(row.slug);
    const before = JSON.stringify(row.content);
    const afterValue = transformRichText(row.content, rule, versionNodeStats);
    if (JSON.stringify(afterValue) !== before) {
      await client.query('UPDATE cms._blog_posts_v_blocks_text_section SET content = $1 WHERE id = $2', [afterValue, row.id]);
      stats.versionRichTextRows += 1;
    }
    if (shouldClearHeading(row.heading, rule)) {
      await client.query('UPDATE cms._blog_posts_v_blocks_text_section SET heading = NULL WHERE id = $1', [row.id]);
      stats.versionBlockHeadings += 1;
    }
  }

  if (touchedPostIds.size) {
    await client.query('UPDATE cms.blog_posts SET updated_at = NOW() WHERE id = ANY($1)', [[...touchedPostIds]]);
  }

  const liveCounts = [stats.liveRemoved, stats.liveChangedToH2, stats.liveBlockHeadings];
  const expectedFirstRun = [8, 14, 3];
  const alreadyClean = liveCounts.every((count) => count === 0);
  if (!alreadyClean && liveCounts.some((count, index) => count !== expectedFirstRun[index])) {
    throw new Error(`Unexpected live change counts: ${liveCounts.join('/')} (expected ${expectedFirstRun.join('/')})`);
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', touchedPosts: touchedPostIds.size, ...stats }, null, 2));
  if (apply) await client.query('COMMIT');
  else await client.query('ROLLBACK');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
