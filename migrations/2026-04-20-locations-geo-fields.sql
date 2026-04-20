-- Migration: Add geo + neighbourhood fields to Locations
--
-- Unblocks: /api/locations is currently 500-ing because the Payload
-- collection config at src/collections/Locations.ts (commit 9253a4f)
-- references columns that don't exist in the DB yet. Payload selects
-- every declared column on every read — missing columns → 500.
--
-- Fields added (all optional):
--   latitude (numeric)          → LocalBusiness JSON-LD geo
--   longitude (numeric)         → LocalBusiness JSON-LD geo
--   price_range (varchar)       → LocalBusiness.priceRange
--   aggregate_rating group      → per-clinic Google rating
--     aggregate_rating_rating_value (numeric)
--     aggregate_rating_review_count (numeric)
--   neighbourhood_intro (varchar) → unique per-clinic intro paragraph
--   nearest_metro (varchar)       → "GK Metro Station (5 min walk)"
--   catchment_areas (array)       → nearby neighbourhoods; new sub-table
--
-- Array field catchment_areas creates companion tables:
--   cms.locations_catchment_areas         (published)
--   cms._locations_v_catchment_areas      (versions)
-- Each has: _order int, _parent_id int, id varchar/int, name varchar.
-- See cms.concerns_blocks_benefits_block_items for the standard pattern.
--
-- Safe to re-run: every ALTER uses IF NOT EXISTS; CREATE TABLE uses
-- IF NOT EXISTS. Indexes use IF NOT EXISTS.

BEGIN;

-- =========================================================================
-- Scalar fields on the main tables
-- =========================================================================

ALTER TABLE cms.locations
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS price_range varchar,
  ADD COLUMN IF NOT EXISTS aggregate_rating_rating_value numeric,
  ADD COLUMN IF NOT EXISTS aggregate_rating_review_count numeric,
  ADD COLUMN IF NOT EXISTS neighbourhood_intro varchar,
  ADD COLUMN IF NOT EXISTS nearest_metro varchar;

ALTER TABLE cms._locations_v
  ADD COLUMN IF NOT EXISTS version_latitude numeric,
  ADD COLUMN IF NOT EXISTS version_longitude numeric,
  ADD COLUMN IF NOT EXISTS version_price_range varchar,
  ADD COLUMN IF NOT EXISTS version_aggregate_rating_rating_value numeric,
  ADD COLUMN IF NOT EXISTS version_aggregate_rating_review_count numeric,
  ADD COLUMN IF NOT EXISTS version_neighbourhood_intro varchar,
  ADD COLUMN IF NOT EXISTS version_nearest_metro varchar;

-- priceRange has defaultValue: '₹₹' — backfill existing rows so the
-- column is never NULL (Payload treats NULL here as "no priceRange" which
-- is fine, but the default makes GMB-style LocalBusiness schema cleaner).
UPDATE cms.locations SET price_range = '₹₹' WHERE price_range IS NULL;

-- =========================================================================
-- Array sub-tables for catchmentAreas
-- =========================================================================

CREATE TABLE IF NOT EXISTS cms.locations_catchment_areas (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS locations_catchment_areas_order_idx
  ON cms.locations_catchment_areas (_order);
CREATE INDEX IF NOT EXISTS locations_catchment_areas_parent_id_idx
  ON cms.locations_catchment_areas (_parent_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='cms'
      AND table_name='locations_catchment_areas'
      AND constraint_name='locations_catchment_areas_parent_id_fk'
  ) THEN
    ALTER TABLE cms.locations_catchment_areas
      ADD CONSTRAINT locations_catchment_areas_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES cms.locations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Version variant — integer id with serial, and a _uuid column for
-- Payload's cross-version array-item tracking (mirrors the pattern on
-- cms._concerns_v_blocks_benefits_block_items).
CREATE SEQUENCE IF NOT EXISTS cms._locations_v_catchment_areas_id_seq
  AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE IF NOT EXISTS cms._locations_v_catchment_areas (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL DEFAULT nextval('cms._locations_v_catchment_areas_id_seq'),
    name character varying,
    _uuid character varying,
    PRIMARY KEY (id)
);

ALTER SEQUENCE cms._locations_v_catchment_areas_id_seq
  OWNED BY cms._locations_v_catchment_areas.id;

CREATE INDEX IF NOT EXISTS _locations_v_catchment_areas_order_idx
  ON cms._locations_v_catchment_areas (_order);
CREATE INDEX IF NOT EXISTS _locations_v_catchment_areas_parent_id_idx
  ON cms._locations_v_catchment_areas (_parent_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='cms'
      AND table_name='_locations_v_catchment_areas'
      AND constraint_name='_locations_v_catchment_areas_parent_id_fk'
  ) THEN
    ALTER TABLE cms._locations_v_catchment_areas
      ADD CONSTRAINT _locations_v_catchment_areas_parent_id_fk
      FOREIGN KEY (_parent_id) REFERENCES cms._locations_v(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
