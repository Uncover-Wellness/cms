/**
 * Convert a markdown string to a Lexical root tree in the shape our DB
 * already stores (see an existing post_body for reference).
 *
 * Supports: headings (h1-h6), paragraphs, bold, italic, inline code,
 * links, bullet + numbered lists (incl. mixed inline styles), blockquote,
 * images, fenced code blocks, thematic breaks. Everything else is
 * stringified into a plain paragraph so content isn't silently lost.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

// ── Lexical node helpers ─────────────────────────────────────────────────
function lxText(text, format = 0) {
  return { mode: 'normal', text, type: 'text', style: '', detail: 0, format, version: 1 };
}
function lxLink(url, children) {
  return {
    type: 'link',
    version: 2,
    format: '',
    indent: 0,
    direction: 'ltr',
    fields: { url: url || '#', newTab: false, linkType: 'custom' },
    children,
  };
}
function lxParagraph(children) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
    children: children.length > 0 ? children : [lxText('')],
  };
}
function lxHeading(tag, children) {
  return {
    type: 'heading',
    tag,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: children.length > 0 ? children : [lxText('')],
  };
}
function lxListItem(children) {
  return {
    type: 'listitem',
    value: 1,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: children.length > 0 ? children : [lxText('')],
  };
}
function lxList(listType, items) {
  return {
    tag: listType === 'bullet' ? 'ul' : 'ol',
    type: 'list',
    start: 1,
    format: '',
    indent: 0,
    version: 1,
    listType,
    direction: 'ltr',
    children: items.map((it, i) => ({ ...it, value: i + 1 })),
  };
}
function lxQuote(children) {
  return {
    type: 'quote',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: children.length > 0 ? children : [lxParagraph([lxText('')])],
  };
}
function lxHr() {
  return { type: 'horizontalrule', version: 1 };
}

// Format bitmask: 1 = bold, 2 = italic, 4 = underline (unused), 8 = strikethrough (unused), 16 = code
const FMT_BOLD = 1;
const FMT_ITALIC = 2;
const FMT_CODE = 16;

// Walk MDAST phrasing children (text / emphasis / strong / inlineCode / link)
// and flatten to a list of Lexical inline nodes (text or link).
function mdastInlineToLexical(nodes, formatMask = 0) {
  const out = [];
  for (const node of nodes || []) {
    if (node.type === 'text') {
      if (node.value) out.push(lxText(node.value, formatMask));
    } else if (node.type === 'strong') {
      out.push(...mdastInlineToLexical(node.children, formatMask | FMT_BOLD));
    } else if (node.type === 'emphasis') {
      out.push(...mdastInlineToLexical(node.children, formatMask | FMT_ITALIC));
    } else if (node.type === 'inlineCode') {
      out.push(lxText(node.value || '', formatMask | FMT_CODE));
    } else if (node.type === 'delete') {
      out.push(...mdastInlineToLexical(node.children, formatMask | 4 /* strikethrough */));
    } else if (node.type === 'link') {
      const inner = mdastInlineToLexical(node.children, formatMask);
      out.push(lxLink(node.url, inner.length > 0 ? inner : [lxText(node.url || '')]));
    } else if (node.type === 'image') {
      // Images inline inside a paragraph become plain text for the alt —
      // block-level images are handled separately below.
      if (node.alt) out.push(lxText(node.alt, formatMask));
    } else if (node.type === 'break') {
      out.push({ type: 'linebreak', version: 1 });
    } else if (node.children) {
      out.push(...mdastInlineToLexical(node.children, formatMask));
    }
  }
  return out;
}

// Walk MDAST block children → Lexical block nodes
function mdastBlocksToLexical(nodes) {
  const out = [];
  for (const node of nodes || []) {
    switch (node.type) {
      case 'heading': {
        const tag = `h${Math.min(6, node.depth || 2)}`;
        out.push(lxHeading(tag, mdastInlineToLexical(node.children)));
        break;
      }
      case 'paragraph': {
        // Paragraphs that are just a single image are intentionally dropped
        // here — Payload's Lexical UploadFeature requires `value` to be a
        // real media-collection ID. The port scripts promote these inline
        // images onto the block's `image` / `imageAltText` fields instead.
        const onlyImage = (node.children || []).length === 1 && (node.children || [])[0].type === 'image';
        if (onlyImage) break;
        out.push(lxParagraph(mdastInlineToLexical(node.children)));
        break;
      }
      case 'list': {
        const listType = node.ordered ? 'number' : 'bullet';
        const items = (node.children || []).map((li) => {
          // A list item's direct children are blocks (usually one paragraph).
          // Inline everything inside the `<li>` so Lexical renders flat.
          const inline = [];
          for (const child of li.children || []) {
            if (child.type === 'paragraph') {
              inline.push(...mdastInlineToLexical(child.children));
            } else if (child.type === 'list') {
              // Nested list — drop for now; rare in our content.
            } else if (child.children) {
              inline.push(...mdastInlineToLexical(child.children));
            }
          }
          return lxListItem(inline);
        });
        out.push(lxList(listType, items));
        break;
      }
      case 'blockquote': {
        out.push(lxQuote(mdastBlocksToLexical(node.children)));
        break;
      }
      case 'code': {
        // Fenced code block → single paragraph with monospace formatted text.
        out.push(lxParagraph([lxText(node.value || '', FMT_CODE)]));
        break;
      }
      case 'thematicBreak': {
        out.push(lxHr());
        break;
      }
      case 'html': {
        // Raw HTML nodes (e.g. <YouTubeEmbed />, <br/>): drop unless they
        // look like plain <br>. Record anything substantive so the
        // caller can flag posts that need manual review.
        if (/^<\s*br\s*\/?\s*>$/i.test((node.value || '').trim())) {
          out.push(lxParagraph([{ type: 'linebreak', version: 1 }]));
        }
        // Anything else gets silently dropped; we expose a count via the
        // exported htmlSkipCount helper below.
        htmlSkips.push(node.value);
        break;
      }
      default:
        // Unknown block type → fall back to stringified children as a
        // paragraph, so we never silently lose text.
        if (node.children) {
          out.push(lxParagraph(mdastInlineToLexical(node.children)));
        }
    }
  }
  return out;
}

const htmlSkips = [];

// MDX can contain ES-module imports and JSX blocks at the top of a file
// (e.g. `import DataTable from '@/components/…'` or `<DataTable ... />`).
// remark-parse treats those as text paragraphs, so they leak into Lexical.
// Strip them deterministically before parsing.
function stripMdxJs(md) {
  if (!md) return md;
  let s = md;
  // 1. Remove top-of-file imports (one per line)
  s = s.replace(/^\s*import[\s\S]+?from\s+['"][^'"\n]+['"]\s*;?\s*$/gm, '');
  // 2. Remove self-closing JSX tags: <Component .../>
  s = s.replace(/<\/?[A-Z][A-Za-z0-9_]*\b[^>]*?\/>/g, '');
  // 3. Remove paired JSX blocks: <Component>...</Component>
  s = s.replace(/<([A-Z][A-Za-z0-9_]*)\b[^>]*>[\s\S]*?<\/\1>/g, '');
  // 4. Collapse leading blank lines left behind
  s = s.replace(/^(\s*\n)+/, '');
  return s;
}

export function markdownToLexical(md) {
  htmlSkips.length = 0;
  const cleaned = stripMdxJs(md || '');
  const tree = unified().use(remarkParse).use(remarkGfm).parse(cleaned);
  const children = mdastBlocksToLexical(tree.children || []);
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: children.length > 0 ? children : [lxParagraph([lxText('')])],
    },
  };
}

export function lastHtmlSkips() {
  return [...htmlSkips];
}

// Exported for splitter / writer reuse
export const _internals = { lxText, lxParagraph, lxHeading, lxLink, lxListItem, lxList, lxQuote };
