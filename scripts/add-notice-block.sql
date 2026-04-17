-- Create the cms.{collection}_blocks_notice_block tables (+ version
-- mirrors) so Payload can persist the new `noticeBlock` page block.
-- Must run BEFORE the CMS deploy that registers NoticeBlock — otherwise
-- the admin 500s on any treatment/concern save.
--
-- Idempotent: IF NOT EXISTS on everything.

SET search_path TO cms, public;

BEGIN;

-- ── Live tables ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.treatments_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.treatments(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS treatments_blocks_notice_block_order_idx     ON cms.treatments_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS treatments_blocks_notice_block_parent_id_idx ON cms.treatments_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS treatments_blocks_notice_block_path_idx      ON cms.treatments_blocks_notice_block(_path);

CREATE TABLE IF NOT EXISTS cms.concerns_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.concerns(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS concerns_blocks_notice_block_order_idx     ON cms.concerns_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS concerns_blocks_notice_block_parent_id_idx ON cms.concerns_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS concerns_blocks_notice_block_path_idx      ON cms.concerns_blocks_notice_block(_path);

CREATE TABLE IF NOT EXISTS cms.service_categories_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.service_categories(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS service_categories_blocks_notice_block_order_idx     ON cms.service_categories_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS service_categories_blocks_notice_block_parent_id_idx ON cms.service_categories_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS service_categories_blocks_notice_block_path_idx      ON cms.service_categories_blocks_notice_block(_path);

-- ── Version mirrors ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms._treatments_v_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._treatments_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_notice_block_order_idx     ON cms._treatments_v_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_notice_block_parent_id_idx ON cms._treatments_v_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_notice_block_path_idx      ON cms._treatments_v_blocks_notice_block(_path);

CREATE TABLE IF NOT EXISTS cms._concerns_v_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._concerns_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_notice_block_order_idx     ON cms._concerns_v_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_notice_block_parent_id_idx ON cms._concerns_v_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_notice_block_path_idx      ON cms._concerns_v_blocks_notice_block(_path);

CREATE TABLE IF NOT EXISTS cms._service_categories_v_blocks_notice_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._service_categories_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  variant    varchar,
  icon       varchar,
  heading    varchar,
  body       varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_notice_block_order_idx     ON cms._service_categories_v_blocks_notice_block(_order);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_notice_block_parent_id_idx ON cms._service_categories_v_blocks_notice_block(_parent_id);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_notice_block_path_idx      ON cms._service_categories_v_blocks_notice_block(_path);

COMMIT;
