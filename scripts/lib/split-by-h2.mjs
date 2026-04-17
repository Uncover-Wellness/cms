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
