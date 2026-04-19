#!/usr/bin/env node
/**
 * Ports a single treatment/concern page from Netlify reference into the CMS
 * using typed pageBlocks — no Lexical rich-text.
 *
 * Usage: node scripts/port-pages/portOne.mjs <treatment|concern> <slug>
 *
 * Pipeline:
 *   1. Read manifest to get CMS id + reference URL
 *   2. Fetch Netlify HTML, extract hero + per-H2 section HTML + inline FAQs
 *   3. For each section, map HTML → ordered typed blocks
 *      (overviewBlock, benefitsBlock, processBlock, dataTable, imageSlider)
 *   4. Transactionally:
 *        - Update hero fields + meta
 *        - Wipe all narrative pageBlocks (keep doctors/testim/faqs/booking embeds)
 *        - Insert blocks in order
 *        - Append inline FAQs to the faqsEmbed
 *        - Renumber preserved embeds so they sit at the end
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, wipeNarrativeBlocks, renumberPreservedEmbeds, insertBlock, insertFaqsInline } from './lib.mjs';
import { extract } from './extract.mjs';
import { sectionToBlocks } from './html-to-blocks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, 'manifest.json');

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}
function saveManifest(m) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2));
}

export async function portOne(kind, slug, { client, manifest } = {}) {
  const ownedClient = !client;
  if (ownedClient) client = await connect();
  if (!manifest) manifest = loadManifest();
  const entry = manifest.entries.find((e) => e.slug === slug && e.kind === kind);
  if (!entry) throw new Error(`manifest entry not found for ${kind}/${slug}`);
  if (!entry.cmsId) throw new Error(`no CMS id for ${kind}/${slug}`);
  const collection = entry.collection;

  const ir = await extract(entry.referenceUrl, { kind });
  if (ir.sections.length === 0) throw new Error(`no H2 sections found in ${entry.referenceUrl}`);

  // Build block plan for all sections.
  const plan = [];
  for (const section of ir.sections) {
    const blocks = sectionToBlocks(section.heading, section.bodyHtml);
    for (const b of blocks) plan.push(b);
  }

  try {
    await client.query('BEGIN');

    const heroHeading = ir.hero.heading || entry.cmsName;
    const headingSupport = ir.hero.subheading || '';
    const metaTitle = ir.hero.metaTitle || '';
    const metaDescription = ir.hero.metaDescription || headingSupport;
    if (kind === 'concern') {
      await client.query(
        `UPDATE cms.concerns
         SET page_heading = $1, heading_support_text = $2, meta_title = $3, meta_description = $4
         WHERE id = $5`,
        [heroHeading, headingSupport, metaTitle, metaDescription, entry.cmsId]
      );
    } else {
      await client.query(
        `UPDATE cms.treatments
         SET hero_headline = $1, hero_excerpt = $2, meta_title = $3, meta_description = $4
         WHERE id = $5`,
        [heroHeading, headingSupport, metaTitle, metaDescription, entry.cmsId]
      );
    }

    await wipeNarrativeBlocks(client, collection, entry.cmsId);

    let order = 0;
    const typeCounts = {};
    for (const block of plan) {
      order += 1;
      await insertBlock(client, collection, entry.cmsId, order, block);
      typeCounts[block.type] = (typeCounts[block.type] || 0) + 1;
    }

    const preservedCount = await renumberPreservedEmbeds(client, collection, entry.cmsId, order + 1);

    let faqCount = 0;
    if (ir.faqs.length > 0) faqCount = await insertFaqsInline(client, collection, entry.cmsId, ir.faqs);

    await client.query('COMMIT');

    entry.ported = true;
    entry.portedAt = new Date().toISOString();
    entry.sectionCount = ir.sections.length;
    entry.blockCount = plan.length;
    entry.blockTypes = typeCounts;
    entry.faqCount = faqCount;
    entry.preservedEmbedCount = preservedCount;
    entry.notes = `${plan.length} blocks (${Object.entries(typeCounts).map(([t,n])=>`${t}×${n}`).join(' ')}), ${preservedCount} embeds, ${faqCount} faqs`;
    saveManifest(manifest);

    console.log(`[OK]  ${kind}/${slug}: ${entry.notes}`);
    return entry;
  } catch (err) {
    await client.query('ROLLBACK');
    entry.ported = false;
    entry.notes = `ERROR: ${err.message}`;
    saveManifest(manifest);
    console.error(`[ERR] ${kind}/${slug}: ${err.message}`);
    throw err;
  } finally {
    if (ownedClient) await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [kind, slug] = process.argv.slice(2);
  if (!kind || !slug) {
    console.error('Usage: node portOne.mjs <treatment|concern> <slug>');
    process.exit(2);
  }
  portOne(kind, slug).catch(() => process.exit(1));
}
