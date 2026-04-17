/**
 * Wipe + re-insert pageBlocks for a blog post. Intended to be called
 * from inside a transaction owned by the caller script.
 *
 *   sections: [{ heading: string | null, content: lexicalRoot }]
 *   rawHtml:  optional — appended as a trailing htmlEmbed block
 */

import { randomUUID } from 'node:crypto';

// Tables to clear when re-porting a post. Covers every block slug we
// currently register + their child array tables (content_grid_items
// etc.) that cascade through the parent.
const BLOG_BLOCK_TABLES = [
  'text_section',
  'notice_block',
  'cta_block',
  'video_embed',
  'html_embed',
  'overview_block',
  'overview_block_paragraphs',
  'benefits_block',
  'benefits_block_items',
  'process_block',
  'process_block_steps',
  'before_after_block',
  'before_after_block_items',
  'data_table',
  'data_table_columns',
  'data_table_rows',
  'data_table_rows_cells',
  'pricing_block',
  'pricing_block_plans',
  'pricing_block_plans_features',
  'content_grid',
  'content_grid_items',
  'image_slider',
  'image_slider_images',
  'stats_block',
  'stats_block_items',
  'technology',
  'doctors_embed',
  'testimonials_embed',
  'faqs_embed',
  'faqs_embed_inline_faqs',
  'booking_form',
];

export async function writeBlogPageBlocks(client, { postId, sections, rawHtml = null, path = 'pageBlocks' }) {
  // 1. Wipe every pageBlocks row for this post.
  for (const t of BLOG_BLOCK_TABLES) {
    await client.query(`DELETE FROM cms.blog_posts_blocks_${t} WHERE _parent_id = $1`, [postId]);
  }

  // 2. Insert each section as a textSection block.
  let order = 0;
  for (const section of sections) {
    order += 1;
    await client.query(
      `INSERT INTO cms.blog_posts_blocks_text_section
         (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
       VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, NULL)`,
      [
        randomUUID(),
        postId,
        order,
        path,
        section.heading,
        JSON.stringify(section.content),
      ],
    );
  }

  // 3. Optional trailing htmlEmbed block for legacy codeEmbedCode
  //    content (Batch 2 only).
  if (rawHtml && rawHtml.trim()) {
    order += 1;
    await client.query(
      `INSERT INTO cms.blog_posts_blocks_html_embed
         (id, _parent_id, _order, _path, heading, code, block_name)
       VALUES ($1, $2, $3, $4, NULL, $5, NULL)`,
      [randomUUID(), postId, order, path, rawHtml],
    );
  }

  return order;
}

export const _blockTables = BLOG_BLOCK_TABLES;
