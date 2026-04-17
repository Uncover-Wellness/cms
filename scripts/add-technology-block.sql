-- Create the cms.{collection}_blocks_technology tables (+ version mirrors)
-- so Payload can persist the new `technology` block. Must run BEFORE the
-- CMS deploys that registers TechnologyBlock, otherwise the admin 500s on
-- first save of a page that contains the block.
--
-- Idempotent: IF NOT EXISTS on everything.

SET search_path TO cms, public;

BEGIN;

-- ── treatments_blocks_technology ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.treatments_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms.treatments(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  id             varchar       PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS treatments_blocks_technology_order_idx     ON cms.treatments_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS treatments_blocks_technology_parent_id_idx ON cms.treatments_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS treatments_blocks_technology_path_idx      ON cms.treatments_blocks_technology(_path);
CREATE INDEX IF NOT EXISTS treatments_blocks_technology_image_upload_idx ON cms.treatments_blocks_technology(image_upload_id);

-- ── concerns_blocks_technology ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.concerns_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms.concerns(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  id             varchar       PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS concerns_blocks_technology_order_idx     ON cms.concerns_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS concerns_blocks_technology_parent_id_idx ON cms.concerns_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS concerns_blocks_technology_path_idx      ON cms.concerns_blocks_technology(_path);
CREATE INDEX IF NOT EXISTS concerns_blocks_technology_image_upload_idx ON cms.concerns_blocks_technology(image_upload_id);

-- ── service_categories_blocks_technology ─────────────────────────────────
-- (ServiceCategories also use the shared ALL_PAGE_BLOCKS, so mirror the
-- schema here too to keep Payload happy when the block is ever dropped
-- into a service-category.)
CREATE TABLE IF NOT EXISTS cms.service_categories_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms.service_categories(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  id             varchar       PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS service_categories_blocks_technology_order_idx     ON cms.service_categories_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS service_categories_blocks_technology_parent_id_idx ON cms.service_categories_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS service_categories_blocks_technology_path_idx      ON cms.service_categories_blocks_technology(_path);

-- ── Version mirrors (drafts) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms._treatments_v_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms._treatments_v(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  _uuid          varchar,
  id             serial        PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_technology_order_idx     ON cms._treatments_v_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_technology_parent_id_idx ON cms._treatments_v_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_technology_path_idx      ON cms._treatments_v_blocks_technology(_path);

CREATE TABLE IF NOT EXISTS cms._concerns_v_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms._concerns_v(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  _uuid          varchar,
  id             serial        PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_technology_order_idx     ON cms._concerns_v_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_technology_parent_id_idx ON cms._concerns_v_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_technology_path_idx      ON cms._concerns_v_blocks_technology(_path);

CREATE TABLE IF NOT EXISTS cms._service_categories_v_blocks_technology (
  _order         integer       NOT NULL,
  _parent_id     integer       NOT NULL REFERENCES cms._service_categories_v(id) ON DELETE CASCADE,
  _path          text          NOT NULL,
  _uuid          varchar,
  id             serial        PRIMARY KEY,
  eyebrow        varchar,
  heading        varchar,
  sub_heading    varchar,
  image_upload_id integer      REFERENCES cms.media(id) ON DELETE SET NULL,
  image          varchar,
  image_alt_text varchar,
  block_name     varchar
);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_technology_order_idx     ON cms._service_categories_v_blocks_technology(_order);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_technology_parent_id_idx ON cms._service_categories_v_blocks_technology(_parent_id);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_technology_path_idx      ON cms._service_categories_v_blocks_technology(_path);

COMMIT;
