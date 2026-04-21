-- Migration: Fix naming of the versioned catchment_areas sub-table
--
-- The Apr 20 migration (2026-04-20-locations-geo-fields.sql) created
-- cms._locations_v_catchment_areas, but Payload's convention for a
-- versioned array sub-table is _{collection}_v_version_{arrayFieldSnake},
-- i.e. cms._locations_v_version_catchment_areas (compare the sibling
-- cms._locations_v_version_clinic_images_urls, which works).
--
-- As a result, every GET /admin/collections/locations 500s with:
--   relation "cms._locations_v_version_catchment_areas" does not exist
-- and the admin list view for Locations won't open.
--
-- The wrongly-named table is empty (0 rows) and has the correct column
-- structure, so a plain rename of the table + sequence + indexes + FK
-- constraint is a lossless fix.
--
-- Safe to re-run: each rename is wrapped in a pg_class / pg_constraint
-- existence guard so applying this twice is a no-op.

BEGIN;

-- Table
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_catchment_areas'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_version_catchment_areas'
  ) THEN
    ALTER TABLE cms._locations_v_catchment_areas
      RENAME TO _locations_v_version_catchment_areas;
  END IF;
END $$;

-- Sequence
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relname = '_locations_v_catchment_areas_id_seq'
      AND c.relkind = 'S'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relname = '_locations_v_version_catchment_areas_id_seq'
      AND c.relkind = 'S'
  ) THEN
    ALTER SEQUENCE cms._locations_v_catchment_areas_id_seq
      RENAME TO _locations_v_version_catchment_areas_id_seq;
  END IF;
END $$;

-- Primary key index
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_catchment_areas_pkey'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_version_catchment_areas_pkey'
  ) THEN
    ALTER INDEX cms._locations_v_catchment_areas_pkey
      RENAME TO _locations_v_version_catchment_areas_pkey;
  END IF;
END $$;

-- Order index
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_catchment_areas_order_idx'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_version_catchment_areas_order_idx'
  ) THEN
    ALTER INDEX cms._locations_v_catchment_areas_order_idx
      RENAME TO _locations_v_version_catchment_areas_order_idx;
  END IF;
END $$;

-- Parent_id index
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_catchment_areas_parent_id_idx'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms' AND c.relname = '_locations_v_version_catchment_areas_parent_id_idx'
  ) THEN
    ALTER INDEX cms._locations_v_catchment_areas_parent_id_idx
      RENAME TO _locations_v_version_catchment_areas_parent_id_idx;
  END IF;
END $$;

-- FK constraint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint co
    JOIN pg_class c ON c.oid = co.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relname = '_locations_v_version_catchment_areas'
      AND co.conname = '_locations_v_catchment_areas_parent_id_fk'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint co
    JOIN pg_class c ON c.oid = co.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'cms'
      AND c.relname = '_locations_v_version_catchment_areas'
      AND co.conname = '_locations_v_version_catchment_areas_parent_id_fk'
  ) THEN
    ALTER TABLE cms._locations_v_version_catchment_areas
      RENAME CONSTRAINT _locations_v_catchment_areas_parent_id_fk
      TO _locations_v_version_catchment_areas_parent_id_fk;
  END IF;
END $$;

COMMIT;
