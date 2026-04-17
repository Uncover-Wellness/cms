#!/usr/bin/env node
/**
 * Ports a single treatment/concern page from Netlify reference into the CMS
 * pageBlocks architecture.
 *
 * Usage: node scripts/port-pages/portOne.mjs <treatment|concern> <slug>
 *
 * Pipeline:
 *   1. Read manifest to get CMS id + reference URL
 *   2. Fetch Netlify HTML, extract hero + H2-section blocks + inline FAQs
 *   3. Transactionally:
 *        - Update hero fields (page_heading, heading_support_text, meta_*)
 *        - Wipe all narrative pageBlocks (keep doctors/testim/faqs/booking embeds)
 *        - Insert one textSection per H2 in order
 *        - Append inline FAQs to the preserved faqsEmbed
 *        - Renumber preserved embeds so they sit at the end
 *   4. Verify via CMS API and print a 1-line summary
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, wipeNarrativeBlocks, renumberPreservedEmbeds, insertTextSection, insertFaqsInline } from './lib.mjs';
import { extract } from './extract.mjs';
import { htmlToLexicalRoot } from './html-to-lexical.mjs';

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

  try {
    await client.query('BEGIN');

    // Update hero + SEO fields
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

    // Wipe narrative blocks
    await wipeNarrativeBlocks(client, collection, entry.cmsId);

    // Insert new textSections
    let order = 0;
    for (const section of ir.sections) {
      order += 1;
      const content = htmlToLexicalRoot(section.bodyHtml);
      await insertTextSection(client, collection, entry.cmsId, order, section.heading, content);
    }

    // Renumber preserved embeds to sit after narrative
    const preservedCount = await renumberPreservedEmbeds(client, collection, entry.cmsId, order + 1);

    // Push inline FAQs onto the faqsEmbed
    let faqCount = 0;
    if (ir.faqs.length > 0) {
      faqCount = await insertFaqsInline(client, collection, entry.cmsId, ir.faqs);
    }

    await client.query('COMMIT');

    entry.ported = true;
    entry.portedAt = new Date().toISOString();
    entry.sectionCount = ir.sections.length;
    entry.faqCount = faqCount;
    entry.preservedEmbedCount = preservedCount;
    entry.notes = `${ir.sections.length} textSections + ${preservedCount} embeds + ${faqCount} inline FAQs`;
    saveManifest(manifest);

    console.log(`[OK]  ${kind}/${slug}: ${ir.sections.length} sections, ${preservedCount} embeds, ${faqCount} faqs`);
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

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const [kind, slug] = process.argv.slice(2);
  if (!kind || !slug) {
    console.error('Usage: node portOne.mjs <treatment|concern> <slug>');
    process.exit(2);
  }
  portOne(kind, slug).catch(() => process.exit(1));
}
