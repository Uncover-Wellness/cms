/**
 * Convert an H2 section's HTML into an ordered list of typed pageBlocks.
 *
 * Rules (per the user: use page blocks, no Lexical rich-text):
 *   <p> containing ONLY <img>      → coalesced into one imageSlider block
 *   <p> with text                  → accumulated into an overviewBlock paragraph
 *   <ul>                           → benefitsBlock (li → item)
 *   <ol>                           → processBlock (li → step)
 *   <table>                        → dataTable
 *   <h3>/<h4>/<h5>                 → flush prose, start a new overviewBlock
 *                                    using the subheading as its heading
 *                                    (the outer H2 already carries the section).
 *
 * The first block emitted for each section carries the H2 text as `heading`;
 * subsequent blocks within the same section carry no heading (or the H3/H4
 * subheading if one preceded them) so the page reads as a single section.
 *
 * Each returned block is a plain IR object; see writeBlock() in lib.mjs for
 * how each IR shape gets inserted.
 */
import { JSDOM } from 'jsdom';

const ICON_DEFAULT = 'shield';
const ICON_BENEFIT = 'heart';
const ICON_PROCESS = 'zap';

function textOf(node) {
  return (node.textContent || '').replace(/\s+/g, ' ').trim();
}

function splitTitleAndDescription(text) {
  // "Benefit A — description" / "Benefit A - description" / "Benefit A: description"
  const m = /^([^—\-:]{3,80}?)\s*[—\-:]\s*(.+)$/.exec(text);
  if (m) return { title: m[1].trim(), description: m[2].trim() };
  // Try bolded prefix via Title Case — take first sentence up to period.
  const sentMatch = /^([A-Z][^.!?]{2,80}[.!?])\s+(.+)$/.exec(text);
  if (sentMatch) return { title: sentMatch[1].trim(), description: sentMatch[2].trim() };
  // Fallback: everything is description; title = first 8 words.
  const words = text.split(/\s+/);
  if (words.length <= 12) return { title: text, description: '' };
  return { title: words.slice(0, 10).join(' '), description: text };
}

function liToItem(li) {
  // Prefer leading <strong>/<b> as the item title.
  const strong = li.querySelector(':scope > strong, :scope > b');
  if (strong) {
    const title = textOf(strong);
    const clone = li.cloneNode(true);
    clone.removeChild(clone.querySelector(':scope > strong, :scope > b'));
    const description = textOf(clone).replace(/^[\s—\-:]+/, '').trim();
    if (title) return { title, description };
  }
  return splitTitleAndDescription(textOf(li));
}

function paragraphsFromNode(node) {
  return textOf(node);
}

function paraIsOnlyImage(p) {
  // <p><img></p> — strip whitespace-only children
  const kids = Array.from(p.childNodes).filter((n) => !(n.nodeType === 3 && !n.textContent.trim()));
  return kids.length === 1 && kids[0].nodeType === 1 && kids[0].tagName === 'IMG';
}

function collectImages(p) {
  const imgs = p.querySelectorAll('img');
  const out = [];
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    if (!src) continue;
    out.push({ imageUrl: src, imageAltText: img.getAttribute('alt') || '', caption: '' });
  }
  return out;
}

function parseTable(tableEl) {
  const headCells = Array.from(tableEl.querySelectorAll('thead th, thead td'));
  let columns = [];
  if (headCells.length) {
    columns = headCells.map((th, i) => {
      const label = textOf(th);
      return { key: `col${i + 1}`, label, align: 'left', highlight: false };
    });
  } else {
    // No thead — use the first row as headers.
    const firstRow = tableEl.querySelector('tr');
    if (firstRow) {
      columns = Array.from(firstRow.children).map((th, i) => ({
        key: `col${i + 1}`, label: textOf(th), align: 'left', highlight: false,
      }));
    }
  }
  const rows = [];
  const bodyRows = tableEl.querySelectorAll('tbody tr');
  const src = bodyRows.length ? Array.from(bodyRows) : Array.from(tableEl.querySelectorAll('tr')).slice(headCells.length ? 0 : 1);
  for (const tr of src) {
    const cells = Array.from(tr.children).map((td, i) => ({
      key: columns[i]?.key || `col${i + 1}`,
      value: textOf(td),
    }));
    if (cells.length) rows.push({ cells });
  }
  return { columns, rows };
}

export function sectionToBlocks(sectionHeading, bodyHtml) {
  const dom = new JSDOM(`<div>${bodyHtml}</div>`);
  const root = dom.window.document.querySelector('div');
  const els = Array.from(root.children);

  const blocks = [];
  let prose = [];      // paragraph strings
  let imgQueue = [];   // pending images to coalesce
  let subHeading = null; // from last H3/H4/H5
  let headingUsed = false;

  const nextHeading = () => {
    if (!headingUsed) { headingUsed = true; return sectionHeading; }
    if (subHeading) { const s = subHeading; subHeading = null; return s; }
    return null;
  };

  const flushProse = () => {
    if (prose.length === 0) return;
    blocks.push({ type: 'overviewBlock', heading: nextHeading() || '', paragraphs: prose });
    prose = [];
  };

  const flushImages = () => {
    if (imgQueue.length === 0) return;
    blocks.push({
      type: 'imageSlider',
      heading: nextHeading() || '',
      aspectRatio: '16/9',
      autoplayMs: 0,
      images: imgQueue,
    });
    imgQueue = [];
  };

  for (const el of els) {
    const tag = el.tagName;

    if (tag === 'P') {
      const imgs = el.querySelectorAll('img');
      if (imgs.length && paraIsOnlyImage(el)) {
        flushProse();
        imgQueue.push(...collectImages(el));
        continue;
      }
      if (imgs.length) {
        // Mixed text + image — still push images and the text separately.
        const imgsInP = collectImages(el);
        const clone = el.cloneNode(true);
        clone.querySelectorAll('img').forEach((i) => i.remove());
        const leftover = textOf(clone);
        if (leftover) { flushImages(); prose.push(leftover); }
        if (imgsInP.length) { flushProse(); imgQueue.push(...imgsInP); }
        continue;
      }
      flushImages();
      const t = paragraphsFromNode(el);
      if (t) prose.push(t);
      continue;
    }

    if (tag === 'UL') {
      flushImages();
      flushProse();
      const items = Array.from(el.querySelectorAll(':scope > li')).map(liToItem).filter((i) => i.title);
      if (items.length) {
        blocks.push({
          type: 'benefitsBlock',
          heading: nextHeading() || 'Key Benefits',
          items: items.map((it) => ({ ...it, icon: ICON_BENEFIT })),
        });
      }
      continue;
    }

    if (tag === 'OL') {
      flushImages();
      flushProse();
      const steps = Array.from(el.querySelectorAll(':scope > li')).map(liToItem).filter((s) => s.title);
      if (steps.length) {
        blocks.push({
          type: 'processBlock',
          heading: nextHeading() || 'How It Works',
          steps: steps.map((s) => ({ title: s.title, description: s.description || s.title })),
        });
      }
      continue;
    }

    if (tag === 'TABLE') {
      flushImages();
      flushProse();
      const parsed = parseTable(el);
      if (parsed.columns.length && parsed.rows.length) {
        blocks.push({ type: 'dataTable', heading: nextHeading() || '', caption: '', ...parsed });
      }
      continue;
    }

    if (tag === 'H3' || tag === 'H4' || tag === 'H5') {
      flushImages();
      flushProse();
      subHeading = textOf(el);
      continue;
    }

    if (tag === 'BLOCKQUOTE') {
      flushImages();
      const t = textOf(el);
      if (t) prose.push(t);
      continue;
    }

    // Fallback: text content as a paragraph.
    const t = textOf(el);
    if (t) prose.push(t);
  }

  flushImages();
  flushProse();

  // Edge case: if the section had ZERO direct children (empty body),
  // emit a heading-only overviewBlock so the section isn't lost.
  if (blocks.length === 0) {
    blocks.push({ type: 'overviewBlock', heading: sectionHeading, paragraphs: [''] });
  } else if (!headingUsed) {
    // Ensure the section heading appears somewhere — set it on the first block.
    const first = blocks[0];
    if (!first.heading) first.heading = sectionHeading;
  }

  return blocks;
}
