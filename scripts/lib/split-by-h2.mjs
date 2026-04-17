/**
 * Split a Lexical root tree at H2 boundaries.
 *
 * Returns an array of { heading: string | null, content: { root: {...} } }.
 *
 * Children that appear before the first H2 go into the intro section
 * with heading = null (mirrors our melasma port). Each subsequent H2
 * starts a new section whose content is every block until the next H2
 * (h3/h4 stay inside the current section as nested subheadings).
 */

function headingTextFromNode(node) {
  if (!node || !Array.isArray(node.children)) return '';
  const parts = [];
  const walk = (ns) => {
    for (const n of ns) {
      if (n.type === 'text' && typeof n.text === 'string') parts.push(n.text);
      else if (n.children) walk(n.children);
    }
  };
  walk(node.children);
  return parts.join('').trim();
}

function lxRoot(children) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  };
}

/**
 * Post-process sections: any section whose heading matches
 * "Key Takeaways" / "Takeaways" / "TL;DR" / "Summary" / "At a Glance"
 * AND whose body is primarily a bulleted list becomes a takeawaysBlock
 * section instead of a textSection.
 *
 * Accepts the output of splitByH2 and returns a new array where
 * qualifying sections have shape { kind: 'takeaways', heading, items }.
 */
const TAKEAWAY_PATTERN = /^(key\s*takeaways?|takeaways?|tl;?\s*dr\b|summary|at\s*a\s*glance)\b/i;

function flattenTextNodes(nodes) {
  const parts = [];
  const walk = (ns) => {
    for (const n of ns) {
      if (!n) continue;
      if (n.type === 'text') {
        // Bold text → **text**
        const t = n.text || '';
        if ((n.format & 1) === 1) parts.push(`**${t}**`);
        else parts.push(t);
      } else if (n.type === 'link' && Array.isArray(n.children)) {
        walk(n.children);
      } else if (Array.isArray(n.children)) {
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return parts.join('').trim();
}

export function convertTakeawaysSections(sections) {
  return sections.map((section) => {
    if (!TAKEAWAY_PATTERN.test((section.heading || '').trim())) return section;
    const children = section.content?.root?.children || [];
    // Find the first list in the content; use its items.
    const list = children.find((c) => c?.type === 'list');
    if (!list || !Array.isArray(list.children) || list.children.length === 0) {
      return section;
    }
    const items = list.children
      .map((li) => ({ text: flattenTextNodes(li.children || []) }))
      .filter((it) => it.text);
    if (items.length === 0) return section;
    return { kind: 'takeaways', heading: section.heading || 'Key Takeaways', items };
  });
}

export function splitByH2(lexical) {
  const root = lexical?.root;
  if (!root || !Array.isArray(root.children)) {
    return [{ heading: null, content: lxRoot([]) }];
  }

  const sections = [];
  let current = { heading: null, children: [] };

  for (const node of root.children) {
    const isH2 = node?.type === 'heading' && node?.tag === 'h2';
    if (isH2) {
      // Flush the current section (even if empty) only if it has content
      // or was already opened by a previous heading.
      if (current.children.length > 0 || current.heading !== null) {
        sections.push(current);
      }
      current = { heading: headingTextFromNode(node), children: [] };
    } else {
      current.children.push(node);
    }
  }
  // Flush the final section.
  if (current.children.length > 0 || current.heading !== null) {
    sections.push(current);
  }

  // If the entire document had no H2s, return a single section covering
  // everything under heading=null.
  if (sections.length === 0) {
    return [{ heading: null, content: lxRoot(root.children) }];
  }

  return sections.map((s) => ({
    heading: s.heading,
    content: lxRoot(s.children),
  }));
}
