/**
 * Convert HTML-in-Lexical-JSON to proper Lexical nodes for ALL rich text fields.
 * Reuses the conversion logic from convert-html-to-lexical.mjs.
 *
 * Usage: DATABASE_URL=... node scripts/convert-all-richtext.mjs [--dry-run]
 */

import pg from 'pg';
import { JSDOM } from 'jsdom';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const dryRun = process.argv.includes('--dry-run');
const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ── HTML → Lexical conversion (same as convert-html-to-lexical.mjs) ──

function htmlToLexicalChildren(html) {
  const dom = new JSDOM(`<div>${html}</div>`);
  return processNodes(dom.window.document.querySelector('div').childNodes);
}

function processNodes(nodeList) {
  const result = [];
  for (const node of nodeList) {
    const c = processNode(node);
    if (c) { if (Array.isArray(c)) result.push(...c); else result.push(c); }
  }
  return result;
}

function processNode(node) {
  if (node.nodeType === 3) {
    const text = node.textContent;
    if (!text || text.trim() === '') return null;
    return { type: 'text', text, format: 0, style: '', detail: 0, mode: 'normal', version: 1 };
  }
  if (node.nodeType !== 1) return null;
  const tag = node.tagName.toLowerCase();
  switch (tag) {
    case 'p': return makeParagraph(node);
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return makeHeading(node, tag);
    case 'ul': return makeList(node, 'bullet');
    case 'ol': return makeList(node, 'number');
    case 'li': return makeListItem(node, 0);
    case 'blockquote': return makeQuote(node);
    case 'br': return { type: 'linebreak', version: 1 };
    case 'hr': return { type: 'horizontalrule', version: 1 };
    case 'strong': case 'b': return makeFormattedInline(node, 1);
    case 'em': case 'i': return makeFormattedInline(node, 2);
    case 'u': return makeFormattedInline(node, 8);
    case 's': case 'strike': case 'del': return makeFormattedInline(node, 4);
    case 'a': return makeLink(node);
    case 'span': case 'div': return processNodes(node.childNodes);
    case 'table': return makeTable(node);
    default: { const ch = processInlineChildren(node); return ch.length > 0 ? ch : null; }
  }
}

function makeParagraph(node) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return { type: 'paragraph', format: '', indent: 0, version: 1, children, direction: 'ltr', textFormat: 0, textStyle: '' };
}

function makeHeading(node, tag) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return { type: 'heading', tag, format: '', indent: 0, version: 1, children, direction: 'ltr' };
}

function makeList(node, listType) {
  const items = []; let index = 0;
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') { items.push(makeListItem(child, index)); index++; }
  }
  if (items.length === 0) return null;
  return { type: 'list', listType, format: '', indent: 0, version: 1, children: items, direction: 'ltr', start: 1, tag: listType === 'bullet' ? 'ul' : 'ol' };
}

function makeListItem(node, index) {
  const children = processInlineChildren(node);
  return { type: 'listitem', format: '', indent: 0, version: 1, children: children.length > 0 ? children : [{ type: 'text', text: '', format: 0, style: '', detail: 0, mode: 'normal', version: 1 }], direction: 'ltr', value: index + 1, checked: undefined };
}

function makeQuote(node) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return { type: 'quote', format: '', indent: 0, version: 1, children, direction: 'ltr' };
}

function makeLink(node) {
  const href = node.getAttribute('href') || '';
  const children = processInlineChildren(node);
  if (children.length === 0) children.push({ type: 'text', text: node.textContent || href, format: 0, style: '', detail: 0, mode: 'normal', version: 1 });
  return { type: 'link', format: '', indent: 0, version: 3, children, direction: 'ltr', fields: { linkType: 'custom', newTab: false, url: href } };
}

function makeFormattedInline(node, formatBit) {
  const results = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      if (child.textContent) results.push({ type: 'text', text: child.textContent, format: formatBit, style: '', detail: 0, mode: 'normal', version: 1 });
    } else if (child.nodeType === 1) {
      const t = child.tagName.toLowerCase();
      if (t === 'a') {
        const link = makeLink(child);
        if (link && link.children) link.children = link.children.map(c => c.type === 'text' ? { ...c, format: c.format | formatBit } : c);
        results.push(link);
      } else {
        let f = formatBit;
        if (t === 'strong' || t === 'b') f |= 1;
        if (t === 'em' || t === 'i') f |= 2;
        if (t === 'u') f |= 8;
        for (const gc of child.childNodes) {
          if (gc.nodeType === 3) results.push({ type: 'text', text: gc.textContent, format: f, style: '', detail: 0, mode: 'normal', version: 1 });
          else { const p = processNode(gc); if (p) { if (Array.isArray(p)) results.push(...p); else results.push(p); } }
        }
      }
    }
  }
  return results;
}

function makeTable(node) {
  const rows = [];
  for (const tr of node.querySelectorAll('tr')) {
    const cells = [];
    for (const td of tr.querySelectorAll('td, th')) {
      cells.push({ type: 'tablecell', children: processInlineChildren(td), headerState: td.tagName.toLowerCase() === 'th' ? 1 : 0, width: null, colSpan: 1, rowSpan: 1 });
    }
    rows.push({ type: 'tablerow', children: cells, version: 1 });
  }
  return { type: 'table', children: rows, version: 1 };
}

function processInlineChildren(node) {
  const results = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      if (child.textContent) results.push({ type: 'text', text: child.textContent, format: 0, style: '', detail: 0, mode: 'normal', version: 1 });
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'br') results.push({ type: 'linebreak', version: 1 });
      else if (tag === 'strong' || tag === 'b') results.push(...makeFormattedInline(child, 1));
      else if (tag === 'em' || tag === 'i') results.push(...makeFormattedInline(child, 2));
      else if (tag === 'u') results.push(...makeFormattedInline(child, 8));
      else if (tag === 's' || tag === 'strike' || tag === 'del') results.push(...makeFormattedInline(child, 4));
      else if (tag === 'a') results.push(makeLink(child));
      else results.push(...processInlineChildren(child));
    }
  }
  return results;
}

function needsConversion(content) {
  if (!content || typeof content !== 'object') return false;
  const root = content.root;
  if (!root || !root.children) return false;
  for (const child of root.children) {
    if (child.children) {
      for (const tc of child.children) {
        if (tc.type === 'text' && tc.text && /<[a-z][\s\S]*>/i.test(tc.text)) return true;
      }
    }
  }
  return false;
}

function convertField(content) {
  if (!needsConversion(content)) return null;
  let html = '';
  for (const child of content.root.children) {
    if (child.children) {
      for (const tc of child.children) {
        if (tc.type === 'text' && tc.text) html += tc.text;
      }
    }
  }
  if (!html.trim()) return null;
  const children = htmlToLexicalChildren(html);
  if (children.length === 0) return null;
  return { root: { type: 'root', format: '', indent: 0, version: 1, children, direction: 'ltr' } };
}

// ── Generic converter for any table + column ──

async function convertColumn(client, table, column, versionTable, versionColumn, idColumn = 'id') {
  const rows = await client.query(`SELECT ${idColumn}, ${column} FROM cms.${table} WHERE ${column} IS NOT NULL`);
  let converted = 0, skipped = 0;

  for (const row of rows.rows) {
    const newContent = convertField(row[column]);
    if (!newContent) { skipped++; continue; }

    console.log(`  [${table}.${column}] id=${row[idColumn]} — converting (${newContent.root.children.length} nodes)`);

    if (!dryRun) {
      await client.query(`UPDATE cms.${table} SET ${column} = $1 WHERE ${idColumn} = $2`, [JSON.stringify(newContent), row[idColumn]]);

      // Update version table if it exists
      if (versionTable && versionColumn) {
        await client.query(
          `UPDATE cms.${versionTable} SET ${versionColumn} = $1 WHERE parent_id = $2 AND latest = true`,
          [JSON.stringify(newContent), row[idColumn]]
        );
      }
    }
    converted++;
  }

  console.log(`  ${table}.${column}: ${converted} converted, ${skipped} skipped`);
  return converted;
}

// ── Main ──

async function main() {
  const client = await pool.connect();
  let total = 0;

  try {
    console.log('=== Blog Posts ===');
    total += await convertColumn(client, 'blog_posts', 'post_body', '_blog_posts_v', 'version_post_body');
    total += await convertColumn(client, 'blog_posts', 'rich_text2', '_blog_posts_v', 'version_rich_text2');

    console.log('\n=== Doctors ===');
    total += await convertColumn(client, 'doctors', 'detailed_qualifications', '_doctors_v', 'version_detailed_qualifications');
    total += await convertColumn(client, 'doctors', 'my_experience', '_doctors_v', 'version_my_experience');
    total += await convertColumn(client, 'doctors', 'memberships_affiliations', '_doctors_v', 'version_memberships_affiliations');
    total += await convertColumn(client, 'doctors', 'award_recognitions', '_doctors_v', 'version_award_recognitions');

    console.log('\n=== Costs ===');
    total += await convertColumn(client, 'costs', 'treatment_pointers', '_costs_v', 'version_treatment_pointers');
    total += await convertColumn(client, 'costs', 'treatment_pointers2', '_costs_v', 'version_treatment_pointers2');
    total += await convertColumn(client, 'costs', 'treatment_content1', '_costs_v', 'version_treatment_content1');
    total += await convertColumn(client, 'costs', 'treatment_content2', '_costs_v', 'version_treatment_content2');
    total += await convertColumn(client, 'costs', 'page_title', '_costs_v', 'version_page_title');

    console.log(`\n=== TOTAL: ${total} fields converted ===${dryRun ? ' [DRY RUN]' : ''}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
