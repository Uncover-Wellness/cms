/**
 * Fetches a Netlify reference page and returns a structured IR:
 *
 *   { hero: { label, heading, subheading, meta: { duration, sessions, downtime } },
 *     sections: [{ heading, bodyHtml }],
 *     faqs: [{ question, answer }] }
 *
 * Treatment pages use `.treatment-article__body`; concern pages use
 * `.concern-article__body`. Everything inside that container up to the next
 * h2 is one section.
 */
import { JSDOM } from 'jsdom';

export async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function cleanText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function serializeChildren(doc, startNode, stopPredicate) {
  const collected = [];
  let node = startNode;
  while (node && !stopPredicate(node)) {
    collected.push(node);
    node = node.nextElementSibling;
  }
  return collected.map((n) => n.outerHTML).join('\n');
}

export function parsePage(html, { kind }) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const bodyClass = kind === 'concern' ? '.concern-article__body' : '.treatment-article__body';
  const hero = {
    label: cleanText(doc.querySelector('.section-label--accent')?.textContent || ''),
    heading: cleanText(doc.querySelector('.hero__heading')?.textContent || ''),
    subheading: cleanText(doc.querySelector('.hero__subheading')?.textContent || ''),
    metaTitle: cleanText(doc.querySelector('title')?.textContent || ''),
    metaDescription: cleanText(doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''),
  };

  const article = doc.querySelector(bodyClass);
  const sections = [];
  if (article) {
    const h2s = Array.from(article.children).filter((el) => el.tagName === 'H2');
    for (let i = 0; i < h2s.length; i++) {
      const h2 = h2s[i];
      const nextH2 = h2s[i + 1] || null;
      const first = h2.nextElementSibling;
      const bodyHtml = serializeChildren(doc, first, (n) => n === nextH2);
      sections.push({
        heading: cleanText(h2.textContent || ''),
        bodyHtml,
      });
    }
  }

  // FAQs — rendered server-side into .accordion-panel or similar patterns.
  // Uncover's templates put FAQs under `.faqs` / `.faq-section` with
  // summary/details elements. Grab whatever fits.
  const faqs = [];
  const faqItems = doc.querySelectorAll('.faq-item, details.faq, .accordion__item');
  for (const item of faqItems) {
    const q = item.querySelector('summary, .faq-item__question, .accordion__header, h3, h4');
    const a = item.querySelector('.faq-item__answer, .accordion__panel, .faq-item__body, p, div:not(summary)');
    if (!q) continue;
    const answerNode = a && a !== q ? a : null;
    faqs.push({
      question: cleanText(q.textContent || ''),
      answer: cleanText(answerNode?.textContent || ''),
    });
  }

  return { hero, sections, faqs };
}

export async function extract(url, { kind }) {
  const html = await fetchHtml(url);
  return parsePage(html, { kind });
}
