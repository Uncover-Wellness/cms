/**
 * Wipe + re-insert pageBlocks for a page row in any collection that
 * carries the shared `pageBlocks` field. Called inside a transaction
 * owned by the caller script.
 *
 *   collection:  'blog_posts' | 'treatments' | 'concerns' | 'service_categories'
 *   parentId:    the row id in that collection
 *   sections:    [{ heading, content } | { kind: 'takeaways', heading, items }]
 *   rawHtml:     optional — appended as a trailing htmlEmbed block
 */

import { randomUUID } from 'node:crypto';

// Every block slug registered in uncover-cms/src/blocks/index.ts that
// stores a parent row + (sometimes) child array rows. We DELETE parent
// rows per-post here; FK cascades handle the children.
const PARENT_BLOCK_TABLES = [
  'text_section',
  'notice_block',
  'cta_block',
  'takeaways_block',
  'video_embed',
  'html_embed',
  'overview_block',
  'benefits_block',
  'process_block',
  'before_after_block',
  'data_table',
  'pricing_block',
  'content_grid',
  'image_slider',
  'stats_block',
  'technology',
  'doctors_embed',
  'testimonials_embed',
  'faqs_embed',
  'booking_form',
];

export async function writePageBlocks(client, { collection, parentId, sections, rawHtml = null, path = 'pageBlocks' }) {
  if (!collection) throw new Error('writePageBlocks: `collection` is required');

  // 1. Wipe every pageBlocks row for this parent.
  for (const t of PARENT_BLOCK_TABLES) {
    await client.query(
      `DELETE FROM cms.${collection}_blocks_${t} WHERE _parent_id = $1`,
      [parentId],
    );
  }

  // 2. Insert each section. Two shapes are supported:
  //    - { kind: 'takeaways', heading, items: [{text}] }  → takeawaysBlock
  //    - { heading, content }                              → textSection (default)
  let order = 0;
  for (const section of sections) {
    order += 1;
    if (section.kind === 'takeaways') {
      const blockId = randomUUID();
      await client.query(
        `INSERT INTO cms.${collection}_blocks_takeaways_block
           (id, _parent_id, _order, _path, heading, block_name)
         VALUES ($1, $2, $3, $4, $5, NULL)`,
        [blockId, parentId, order, path, section.heading || 'Key Takeaways'],
      );
      for (let i = 0; i < (section.items || []).length; i += 1) {
        const item = section.items[i];
        if (!item?.text) continue;
        await client.query(
          `INSERT INTO cms.${collection}_blocks_takeaways_block_items
             (id, _parent_id, _order, text)
           VALUES ($1, $2, $3, $4)`,
          [randomUUID(), blockId, i + 1, item.text],
        );
      }
    } else {
      await client.query(
        `INSERT INTO cms.${collection}_blocks_text_section
           (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)`,
        [
          randomUUID(),
          parentId,
          order,
          path,
          section.heading,
          JSON.stringify(section.content),
        ],
      );
    }
  }

  // 3. Optional trailing htmlEmbed block for raw legacy HTML.
  if (rawHtml && rawHtml.trim()) {
    order += 1;
    await client.query(
      `INSERT INTO cms.${collection}_blocks_html_embed
         (id, _parent_id, _order, _path, heading, code, block_name)
       VALUES ($1, $2, $3, $4, NULL, $5, NULL)`,
      [randomUUID(), parentId, order, path, rawHtml],
    );
  }

  return order;
}

export const _blockTables = PARENT_BLOCK_TABLES;
