-- Migration: add display_order to service_categories + backfill
-- Run BEFORE deploying the CMS collection change that adds `displayOrder`.
--
-- Context: home page category tiles need a CMS-driven rank (laser, skin,
-- hair, body). Also useful for any future rank-aware listing of categories.
-- Lower numbers sort first; NULLs sort last.

BEGIN;

SET search_path = cms, public;

-- Main table
ALTER TABLE cms.service_categories
  ADD COLUMN IF NOT EXISTS display_order integer;

-- Version table (drafts are enabled on this collection)
ALTER TABLE cms._service_categories_v
  ADD COLUMN IF NOT EXISTS version_display_order integer;

-- Backfill current categories (idempotent — only sets when NULL)
UPDATE cms.service_categories SET display_order = 1 WHERE slug = 'laser-hair-removal' AND display_order IS NULL;
UPDATE cms.service_categories SET display_order = 2 WHERE slug = 'skin'               AND display_order IS NULL;
UPDATE cms.service_categories SET display_order = 3 WHERE slug = 'hair'               AND display_order IS NULL;
UPDATE cms.service_categories SET display_order = 4 WHERE slug = 'body'               AND display_order IS NULL;

COMMIT;
