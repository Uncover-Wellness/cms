-- Create cms.{collection}_blocks_takeaways_block + child items tables
-- (+ version mirrors) so Payload can persist the new `takeawaysBlock`
-- page block. Must run BEFORE the CMS deploy that registers the block
-- — otherwise the admin 500s on any save.
--
-- Idempotent: IF NOT EXISTS on every statement.

SET search_path TO cms, public;

BEGIN;

-- ── Live: blog_posts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.blog_posts(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS blog_posts_blocks_takeaways_block_order_idx     ON cms.blog_posts_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS blog_posts_blocks_takeaways_block_parent_id_idx ON cms.blog_posts_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS blog_posts_blocks_takeaways_block_path_idx      ON cms.blog_posts_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id varchar NOT NULL REFERENCES cms.blog_posts_blocks_takeaways_block(id) ON DELETE CASCADE,
  id         varchar PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS blog_posts_blocks_takeaways_block_items_order_idx     ON cms.blog_posts_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS blog_posts_blocks_takeaways_block_items_parent_id_idx ON cms.blog_posts_blocks_takeaways_block_items(_parent_id);

-- ── Live: treatments ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.treatments_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.treatments(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS treatments_blocks_takeaways_block_order_idx     ON cms.treatments_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS treatments_blocks_takeaways_block_parent_id_idx ON cms.treatments_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS treatments_blocks_takeaways_block_path_idx      ON cms.treatments_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms.treatments_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id varchar NOT NULL REFERENCES cms.treatments_blocks_takeaways_block(id) ON DELETE CASCADE,
  id         varchar PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS treatments_blocks_takeaways_block_items_order_idx     ON cms.treatments_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS treatments_blocks_takeaways_block_items_parent_id_idx ON cms.treatments_blocks_takeaways_block_items(_parent_id);

-- ── Live: concerns ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.concerns_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.concerns(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS concerns_blocks_takeaways_block_order_idx     ON cms.concerns_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS concerns_blocks_takeaways_block_parent_id_idx ON cms.concerns_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS concerns_blocks_takeaways_block_path_idx      ON cms.concerns_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms.concerns_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id varchar NOT NULL REFERENCES cms.concerns_blocks_takeaways_block(id) ON DELETE CASCADE,
  id         varchar PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS concerns_blocks_takeaways_block_items_order_idx     ON cms.concerns_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS concerns_blocks_takeaways_block_items_parent_id_idx ON cms.concerns_blocks_takeaways_block_items(_parent_id);

-- ── Live: service_categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms.service_categories_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms.service_categories(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  id         varchar PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS service_categories_blocks_takeaways_block_order_idx     ON cms.service_categories_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS service_categories_blocks_takeaways_block_parent_id_idx ON cms.service_categories_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS service_categories_blocks_takeaways_block_path_idx      ON cms.service_categories_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms.service_categories_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id varchar NOT NULL REFERENCES cms.service_categories_blocks_takeaways_block(id) ON DELETE CASCADE,
  id         varchar PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS service_categories_blocks_takeaways_block_items_order_idx     ON cms.service_categories_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS service_categories_blocks_takeaways_block_items_parent_id_idx ON cms.service_categories_blocks_takeaways_block_items(_parent_id);

-- ── Version mirrors ─────────────────────────────────────────────────────
-- (serial PK for these — Payload convention)
CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_takeaways_block_order_idx     ON cms._blog_posts_v_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_takeaways_block_parent_id_idx ON cms._blog_posts_v_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_takeaways_block_path_idx      ON cms._blog_posts_v_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._blog_posts_v_blocks_takeaways_block(id) ON DELETE CASCADE,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_takeaways_block_items_order_idx     ON cms._blog_posts_v_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_takeaways_block_items_parent_id_idx ON cms._blog_posts_v_blocks_takeaways_block_items(_parent_id);

CREATE TABLE IF NOT EXISTS cms._treatments_v_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._treatments_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_takeaways_block_order_idx     ON cms._treatments_v_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_takeaways_block_parent_id_idx ON cms._treatments_v_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_takeaways_block_path_idx      ON cms._treatments_v_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms._treatments_v_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._treatments_v_blocks_takeaways_block(id) ON DELETE CASCADE,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_takeaways_block_items_order_idx     ON cms._treatments_v_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS _treatments_v_blocks_takeaways_block_items_parent_id_idx ON cms._treatments_v_blocks_takeaways_block_items(_parent_id);

CREATE TABLE IF NOT EXISTS cms._concerns_v_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._concerns_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_takeaways_block_order_idx     ON cms._concerns_v_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_takeaways_block_parent_id_idx ON cms._concerns_v_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_takeaways_block_path_idx      ON cms._concerns_v_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms._concerns_v_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._concerns_v_blocks_takeaways_block(id) ON DELETE CASCADE,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_takeaways_block_items_order_idx     ON cms._concerns_v_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS _concerns_v_blocks_takeaways_block_items_parent_id_idx ON cms._concerns_v_blocks_takeaways_block_items(_parent_id);

CREATE TABLE IF NOT EXISTS cms._service_categories_v_blocks_takeaways_block (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._service_categories_v(id) ON DELETE CASCADE,
  _path      text    NOT NULL,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  heading    varchar,
  block_name varchar
);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_takeaways_block_order_idx     ON cms._service_categories_v_blocks_takeaways_block(_order);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_takeaways_block_parent_id_idx ON cms._service_categories_v_blocks_takeaways_block(_parent_id);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_takeaways_block_path_idx      ON cms._service_categories_v_blocks_takeaways_block(_path);

CREATE TABLE IF NOT EXISTS cms._service_categories_v_blocks_takeaways_block_items (
  _order     integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES cms._service_categories_v_blocks_takeaways_block(id) ON DELETE CASCADE,
  _uuid      varchar,
  id         serial  PRIMARY KEY,
  text       varchar
);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_takeaways_block_items_order_idx     ON cms._service_categories_v_blocks_takeaways_block_items(_order);
CREATE INDEX IF NOT EXISTS _service_categories_v_blocks_takeaways_block_items_parent_id_idx ON cms._service_categories_v_blocks_takeaways_block_items(_parent_id);

COMMIT;
