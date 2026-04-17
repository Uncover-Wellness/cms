/**
 * Thin wrapper around the existing convert-html-to-lexical conversion logic,
 * factored out so port-pages scripts can import it. The original script is
 * kept intact for the webflow→lexical migration it was built for.
 */
import { JSDOM } from 'jsdom';

const txt = (text, format = 0) => ({
  type: 'text', text, format, style: '', detail: 0, mode: 'normal', version: 1,
});

function processInlineChildren(node) {
  const out = [];
  for (const child of node.childNodes) {
    const converted = processNode(child);
    if (!converted) continue;
    if (Array.isArray(converted)) out.push(...converted);
    else out.push(converted);
  }
  return out;
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
  const items = [];
  let i = 0;
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') {
      items.push(makeListItem(child, i));
      i += 1;
    }
  }
  if (items.length === 0) return null;
  return {
    type: 'list', listType, format: '', indent: 0, version: 1, children: items,
    direction: 'ltr', start: 1, tag: listType === 'bullet' ? 'ul' : 'ol',
  };
}

function makeListItem(node, idx = 0) {
  const children = processInlineChildren(node);
  return {
    type: 'listitem', format: '', indent: 0, version: 1,
    children: children.length > 0 ? children : [txt('')],
    direction: 'ltr', value: idx + 1,
  };
}

function makeQuote(node) {
  const children = processInlineChildren(node);
  if (children.length === 0) return null;
  return { type: 'quote', format: '', indent: 0, version: 1, children, direction: 'ltr' };
}

function makeLink(node) {
  const href = node.getAttribute('href') || '';
  const children = processInlineChildren(node);
  if (children.length === 0) children.push(txt(node.textContent || href));
  return {
    type: 'link', format: '', indent: 0, version: 3, children, direction: 'ltr',
    fields: { linkType: 'custom', newTab: /^https?:/.test(href), url: href },
  };
}

function makeFormattedInline(node, format) {
  const children = processInlineChildren(node);
  return children.map((c) => (c.type === 'text' ? { ...c, format: (c.format || 0) | format } : c));
}

function makeTable(node) {
  const rows = [];
  const trs = node.querySelectorAll('tr');
  for (const tr of trs) {
    const cells = [];
    for (const cell of tr.querySelectorAll('td, th')) {
      cells.push({
        type: 'tablecell', format: '', indent: 0, version: 1,
        children: processInlineChildren(cell),
        direction: 'ltr',
        headerState: cell.tagName.toLowerCase() === 'th' ? 1 : 0,
      });
    }
    if (cells.length === 0) continue;
    rows.push({ type: 'tablerow', format: '', indent: 0, version: 1, children: cells, direction: 'ltr' });
  }
  if (rows.length === 0) return null;
  return { type: 'table', format: '', indent: 0, version: 1, children: rows, direction: 'ltr' };
}

function processNode(node) {
  if (node.nodeType === 3) {
    const text = node.textContent;
    if (!text || text.trim() === '') return null;
    return txt(text);
  }
  if (node.nodeType !== 1) return null;
  const tag = node.tagName.toLowerCase();
  switch (tag) {
    case 'p': return makeParagraph(node);
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return makeHeading(node, tag);
    case 'ul': return makeList(node, 'bullet');
    case 'ol': return makeList(node, 'number');
    case 'li': return makeListItem(node);
    case 'blockquote': return makeQuote(node);
    case 'br': return { type: 'linebreak', version: 1 };
    case 'hr': return { type: 'horizontalrule', version: 1 };
    case 'strong': case 'b': return makeFormattedInline(node, 1);
    case 'em': case 'i': return makeFormattedInline(node, 2);
    case 'u': return makeFormattedInline(node, 8);
    case 's': case 'strike': case 'del': return makeFormattedInline(node, 4);
    case 'a': return makeLink(node);
    case 'span': case 'div': case 'figure': case 'section': return processInlineChildren(node);
    case 'table': return makeTable(node);
    case 'img': {
      const src = node.getAttribute('src') || '';
      const alt = node.getAttribute('alt') || '';
      if (!src) return null;
      return {
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0,
        children: [txt(alt || src)],
      };
    }
    default:
      return processInlineChildren(node);
  }
}

export function htmlToLexicalRoot(html) {
  const dom = new JSDOM(`<div>${html}</div>`);
  const root = dom.window.document.querySelector('div');
  const children = [];
  for (const child of root.childNodes) {
    const converted = processNode(child);
    if (!converted) continue;
    if (Array.isArray(converted)) {
      if (converted.length > 0 && converted.every((c) => c.type === 'text' || c.type === 'link' || c.type === 'linebreak')) {
        children.push({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: converted });
      } else {
        children.push(...converted);
      }
    } else {
      children.push(converted);
    }
  }
  const finalChildren = children.filter((c) => !(c.type === 'text' || c.type === 'linebreak'))
    .length > 0 ? children : [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: children.length ? children : [txt('')] }];
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: finalChildren } };
}
