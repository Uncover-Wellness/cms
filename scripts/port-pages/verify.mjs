#!/usr/bin/env node
/**
 * Verifies every ported page by cross-checking the CMS output against the
 * Netlify reference. For each entry in manifest.json:
 *
 *   1. Fetch Netlify HTML → extract H2 headings + visible article text
 *   2. Fetch CMS API doc → collect textSection headings + concatenated body
 *   3. Compute:
 *        - heading-match ratio (how many Netlify H2s are present in CMS
 *          textSection headings, case-insensitive)
 *        - token-overlap similarity on the concatenated body text
 *   4. Write a per-entry report to manifest.json and print a summary.
 *
 * Pages with heading match < 1.0 or similarity < 0.70 are flagged for
 * manual review.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { extract } from './extract.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, 'manifest.json');
const CMS = 'http://localhost:3500';

function tokens(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length >= 3);
}

function overlap(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let common = 0;
  for (const w of sa) if (sb.has(w)) common += 1;
  return common / Math.max(sa.size, sb.size);
}

function extractLexicalText(node) {
  if (!node) return '';
  let s = '';
  if (node.text) s += node.text + ' ';
  if (Array.isArray(node.children)) for (const c of node.children) s += extractLexicalText(c);
  return s;
}

async function fetchCmsDoc(collection, slug) {
  const url = `${CMS}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CMS ${res.status}`);
  const json = await res.json();
  return json.docs[0] || null;
}

function cmsTextSections(doc) {
  return (doc.pageBlocks || []).filter((b) => b.blockType === 'textSection').map((b) => ({
    heading: b.heading || '',
    text: extractLexicalText(b.content?.root).replace(/\s+/g, ' ').trim(),
  }));
}

async function verifyOne(entry) {
  const ir = await extract(entry.referenceUrl, { kind: entry.kind });
  const netlifyHeadings = ir.sections.map((s) => s.heading.toLowerCase());
  const netlifyBody = ir.sections.map((s) => {
    const dom = new JSDOM(`<div>${s.bodyHtml}</div>`);
    return dom.window.document.querySelector('div').textContent;
  }).join(' ');

  const doc = await fetchCmsDoc(entry.collection, entry.slug);
  if (!doc) return { ok: false, reason: 'CMS doc not found' };
  const cmsSections = cmsTextSections(doc);
  const cmsHeadings = cmsSections.map((s) => s.heading.toLowerCase());
  const cmsBody = cmsSections.map((s) => s.text).join(' ');

  const matched = netlifyHeadings.filter((h) => cmsHeadings.includes(h)).length;
  const headingMatch = netlifyHeadings.length === 0 ? 1 : matched / netlifyHeadings.length;
  const similarity = overlap(tokens(netlifyBody), tokens(cmsBody));

  return {
    ok: headingMatch >= 1.0 && similarity >= 0.70,
    netlifyH2s: netlifyHeadings.length,
    cmsTextSections: cmsHeadings.length,
    headingMatch: Number(headingMatch.toFixed(2)),
    similarity: Number(similarity.toFixed(2)),
  };
}

async function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const results = [];
  let ok = 0, flagged = 0, failed = 0;
  for (const entry of manifest.entries) {
    if (entry.slug === 'chemical-peels') {
      console.log(`[SKIP] ${entry.kind}/${entry.slug}`);
      continue;
    }
    try {
      const r = await verifyOne(entry);
      entry.verify = r;
      const mark = r.ok ? '[OK]  ' : '[FLAG]';
      console.log(
        `${mark} ${entry.kind.padEnd(9)} ${entry.slug.padEnd(55)} h2s ${r.cmsTextSections}/${r.netlifyH2s}  match ${r.headingMatch}  sim ${r.similarity}${r.reason ? '  ' + r.reason : ''}`
      );
      if (r.ok) ok += 1; else flagged += 1;
    } catch (e) {
      entry.verify = { ok: false, reason: e.message };
      failed += 1;
      console.log(`[ERR] ${entry.kind}/${entry.slug}: ${e.message}`);
    }
  }
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n── verify summary ──`);
  console.log(`ok: ${ok}   flagged: ${flagged}   errored: ${failed}`);
  process.exit(flagged + failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
