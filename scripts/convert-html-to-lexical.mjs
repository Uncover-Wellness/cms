/**
 * Convert HTML-in-Lexical-JSON to proper Lexical node trees.
 *
 * The Webflow migration stored HTML as raw text inside a single Lexical
 * paragraph node. This script parses the HTML and builds a proper Lexical
 * tree with paragraph, heading, list, listitem, link, and text nodes.
 *
 * Usage:
 *   node scripts/convert-html-to-lexical.mjs [--dry-run] [--id 119]
 */

import pg from 'pg';
import { JSDOM } from 'jsdom';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const idFlag = process.argv.indexOf('--id');
const targetId = idFlag !== -1 ? parseInt(process.argv[idFlag + 1]) : null;

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

/**
 * Convert an HTML string to Lexical node children array.
 */
function htmlToLexicalChildren(html) {
  const dom = new JSDOM(`<div>${html}</div>`);
  const container = dom.window.document.querySelector('div');
  return processNodes(container.childNodes);
}

function processNodes(nodeList) {
  const result = [];
  for (const node of nodeList) {
    const converted = processNode(node);
    if (converted) {
      if (Array.isArray(converted)) {
        result.push(...converted);
      } else {
        result.push(converted);
      }
    }
  }
  return result;
}

function processNode(node) {
  // Text node
  if (node.nodeType === 3) {
    const text = node.textContent;
    if (!text || text.trim() === '') return null;
    return { type: 'text', text, format: 0, style: '', detail: 0, mode: 'normal', version: 1 };
  }

  // Element node
  if (node.nodeType !== 1) return null;

  const tag = node.tagName.toLowerCase();

  switch (tag) {
    case 'p':
      return makeParagraph(node);
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return makeHeading(node, tag);
    case 'ul':
      return makeList(node, 'bullet');
    case 'ol':
      return makeList(node, 'number');
    case 'li':
      return makeListItem(node);
    case 'blockquote':
      return makeQuote(node);
    case 'br':
      return { type: 'linebreak', version: 1 };
    case 'hr':
      return { type: 'horizontalrule', version: 1 };
    case 'strong': case 'b':
      return makeFormattedInline(node, 1); // bold
    case 'em': case 'i':
      return makeFormattedInline(node, 2); // italic
    case 'u':
      return makeFormattedInline(node, 8); // underline
    case 's': case 'strike': case 'del':
      return makeFormattedInline(node, 4); // strikethrough
    case 'a':
      return makeLink(node);
    case 'span': case 'div':
      // Pass through — process children
      return processNodes(node.childNodes);
    case 'table':
      return makeTable(node);
    default:
      // Unknown tag — try to process children as inline content
      const children = processInlineChildren(node);
      if (children.length > 0) return children;
      return null;
  }
}

function makeParagraph(node) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
  };
}

function makeHeading(node, tag) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return {
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    children,
    direction: 'ltr',
  };
}

function makeList(node, listType) {
  const items = [];
  let index = 0;
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') {
      items.push(makeListItem(child, index));
      index++;
    }
  }
  if (items.length === 0) return null;
  return {
    type: 'list',
    listType,
    format: '',
    indent: 0,
    version: 1,
    children: items,
    direction: 'ltr',
    start: 1,
    tag: listType === 'bullet' ? 'ul' : 'ol',
  };
}

function makeListItem(node, index = 0) {
  const children = processInlineChildren(node);
  return {
    type: 'listitem',
    format: '',
    indent: 0,
    version: 1,
    children: children.length > 0 ? children : [{ type: 'text', text: '', format: 0, style: '', detail: 0, mode: 'normal', version: 1 }],
    direction: 'ltr',
    value: index + 1,
    checked: undefined,
  };
}

function makeQuote(node) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return {
    type: 'quote',
    format: '',
    indent: 0,
    version: 1,
    children,
    direction: 'ltr',
  };
}

function makeLink(node) {
  const href = node.getAttribute('href') || '';
  const children = processInlineChildren(node);
  if (children.length === 0) {
    children.push({ type: 'text', text: node.textContent || href, format: 0, style: '', detail: 0, mode: 'normal', version: 1 });
  }
  return {
    type: 'link',
    format: '',
    indent: 0,
    version: 3,
    children,
    direction: 'ltr',
    fields: {
      linkType: 'custom',
      newTab: false,
      url: href,
    },
  };
}

function makeFormattedInline(node, formatBit) {
  // Return children with format bit applied
  const results = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent;
      if (text) {
        results.push({ type: 'text', text, format: formatBit, style: '', detail: 0, mode: 'normal', version: 1 });
      }
    } else if (child.nodeType === 1) {
      const innerTag = child.tagName.toLowerCase();
      let innerFormat = formatBit;
      if (innerTag === 'strong' || innerTag === 'b') innerFormat |= 1;
      if (innerTag === 'em' || innerTag === 'i') innerFormat |= 2;
      if (innerTag === 'u') innerFormat |= 8;

      if (innerTag === 'a') {
        // Link inside bold/italic
        const link = makeLink(child);
        // Apply format to link children
        if (link && link.children) {
          link.children = link.children.map(c =>
            c.type === 'text' ? { ...c, format: c.format | formatBit } : c
          );
        }
        results.push(link);
      } else {
        for (const grandchild of child.childNodes) {
          if (grandchild.nodeType === 3) {
            results.push({ type: 'text', text: grandchild.textContent, format: innerFormat, style: '', detail: 0, mode: 'normal', version: 1 });
          } else {
            const processed = processNode(grandchild);
            if (processed) {
              if (Array.isArray(processed)) results.push(...processed);
              else results.push(processed);
            }
          }
        }
      }
    }
  }
  return results;
}

function makeTable(node) {
  const rows = [];
  const trNodes = node.querySelectorAll('tr');
  for (const tr of trNodes) {
    const cells = [];
    for (const td of tr.querySelectorAll('td, th')) {
      cells.push({
        type: 'tablecell',
        children: processInlineChildren(td),
        headerState: td.tagName.toLowerCase() === 'th' ? 1 : 0,
        width: null,
        colSpan: 1,
        rowSpan: 1,
      });
    }
    rows.push({ type: 'tablerow', children: cells, version: 1 });
  }
  return { type: 'table', children: rows, version: 1 };
}

function processInlineChildren(node) {
  const results = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = child.textContent;
      if (text) {
        results.push({ type: 'text', text, format: 0, style: '', detail: 0, mode: 'normal', version: 1 });
      }
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'br') {
        results.push({ type: 'linebreak', version: 1 });
      } else if (tag === 'strong' || tag === 'b') {
        results.push(...makeFormattedInline(child, 1));
      } else if (tag === 'em' || tag === 'i') {
        results.push(...makeFormattedInline(child, 2));
      } else if (tag === 'u') {
        results.push(...makeFormattedInline(child, 8));
      } else if (tag === 's' || tag === 'strike' || tag === 'del') {
        results.push(...makeFormattedInline(child, 4));
      } else if (tag === 'a') {
        results.push(makeLink(child));
      } else if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'ul' || tag === 'ol' || tag === 'blockquote') {
        // Block-level element inside inline context — this shouldn't happen
        // but the HTML data has it. Promote to block level.
        // Return a marker so the caller knows to split.
        // For simplicity, just process its inline children.
        results.push(...processInlineChildren(child));
      } else {
        // Unknown inline — process children
        results.push(...processInlineChildren(child));
      }
    }
  }
  return results;
}

/**
 * Check if a Lexical JSON field contains HTML-as-text (needs conversion).
 */
function needsConversion(content) {
  if (!content || typeof content !== 'object') return false;
  const root = content.root;
  if (!root || !root.children) return false;

  // Check if any text node contains HTML tags
  for (const child of root.children) {
    if (child.children) {
      for (const tc of child.children) {
        if (tc.type === 'text' && tc.text && /<[a-z][\s\S]*>/i.test(tc.text)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Convert a Lexical JSON field from HTML-as-text to proper nodes.
 */
function convertField(content) {
  if (!needsConversion(content)) return null;

  // Extract the raw HTML from text nodes
  let html = '';
  for (const child of content.root.children) {
    if (child.children) {
      for (const tc of child.children) {
        if (tc.type === 'text' && tc.text) {
          html += tc.text;
        }
      }
    }
  }

  if (!html.trim()) return null;

  // Convert HTML to Lexical nodes
  const children = htmlToLexicalChildren(html);
  if (children.length === 0) return null;

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  };
}

// --- Main ---

async function main() {
  const client = await pool.connect();

  try {
    // Treatment 119 content sections
    const whereClause = targetId ? `WHERE cs._parent_id = ${targetId}` : '';
    const rows = await client.query(
      `SELECT cs.id, cs._parent_id, cs._order, cs.heading, cs.content
       FROM cms.treatments_content_sections cs
       ${whereClause}
       ORDER BY cs._parent_id, cs._order`
    );

    console.log(`Found ${rows.rows.length} content sections to check`);

    let converted = 0;
    let skipped = 0;

    for (const row of rows.rows) {
      const newContent = convertField(row.content);
      if (!newContent) {
        skipped++;
        continue;
      }

      console.log(`  [${row._parent_id}] Section ${row._order} "${row.heading}" — converting (${newContent.root.children.length} nodes)`);

      if (!dryRun) {
        await client.query(
          'UPDATE cms.treatments_content_sections SET content = $1 WHERE id = $2',
          [JSON.stringify(newContent), row.id]
        );

        // Also update version table
        await client.query(
          `UPDATE cms._treatments_v_version_content_sections vcs
           SET content = $1
           FROM cms._treatments_v v
           WHERE vcs._parent_id = v.id
             AND v.parent_id = $2
             AND v.latest = true
             AND vcs._order = $3`,
          [JSON.stringify(newContent), row._parent_id, row._order]
        );
      }

      converted++;
    }

    console.log(`\nDone: ${converted} converted, ${skipped} skipped (already proper Lexical)${dryRun ? ' [DRY RUN]' : ''}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
