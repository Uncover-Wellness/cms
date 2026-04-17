-- Port legacy contentSections / textSections into the new pageBlocks field as
-- textSection blocks. Idempotent — clears pageBlocks first so it can be re-run.
--
-- After this runs, each Treatment / Concern exposes its legacy content both via
-- the old contentSections/textSections arrays AND via pageBlocks (as textSection
-- blocks). Editors can add richer block types (benefits, process, etc.) on top
-- of this imported baseline without losing existing content.
--
-- ServiceCategories are NOT auto-ported: the tabs structure (hero, whyChoose,
-- technologies, narrativeSections, results, closingPitch) is semantically
-- richer than a generic text block and merits editor-driven mapping to the
-- right block types (benefitsBlock, contentGridBlock, etc.). Editors can do
-- this per-category in the admin UI.

SET search_path TO cms, public;

BEGIN;

-- ──────────────────────────────────────────────────────────────────────────
-- TREATMENTS: contentSections → pageBlocks (as textSection blocks)
-- ──────────────────────────────────────────────────────────────────────────
-- Wipe any existing imported blocks so the port is idempotent.
TRUNCATE cms.treatments_blocks_text_section RESTART IDENTITY;

INSERT INTO cms.treatments_blocks_text_section
  (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
SELECT
  cs.id,
  cs._parent_id,
  cs._order,
  'pageBlocks' AS _path,
  cs.heading,
  cs.content,
  -- Prefer upload reference if set, else legacy URL string.
  CASE
    WHEN cs.image_upload_id IS NOT NULL THEN (SELECT url FROM cms.media WHERE id = cs.image_upload_id)
    ELSE cs.image
  END AS image,
  cs.image_alt_text,
  NULL AS block_name
FROM cms.treatments_content_sections cs
WHERE cs.content IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────
-- CONCERNS: textSections → pageBlocks (as textSection blocks)
-- ──────────────────────────────────────────────────────────────────────────
TRUNCATE cms.concerns_blocks_text_section RESTART IDENTITY;

INSERT INTO cms.concerns_blocks_text_section
  (id, _parent_id, _order, _path, heading, content, image, image_alt_text, block_name)
SELECT
  cs.id,
  cs._parent_id,
  cs._order,
  'pageBlocks' AS _path,
  cs.heading,
  cs.content,
  CASE
    WHEN cs.image_upload_id IS NOT NULL THEN (SELECT url FROM cms.media WHERE id = cs.image_upload_id)
    ELSE cs.image_url
  END AS image,
  cs.image_alt_text,
  NULL AS block_name
FROM cms.concerns_text_sections cs
WHERE cs.content IS NOT NULL;

COMMIT;
