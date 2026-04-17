-- Create the full pageBlocks schema for blog_posts (live + version mirror).
-- Mirrors the existing treatments_blocks_* / _treatments_v_blocks_* tables.
-- Must run BEFORE the CMS deploy that adds `pageBlocks` to the BlogPosts
-- collection — otherwise the admin 500s on any post save.
--
-- Generated from: pg_dump ... -t cms.treatments_blocks_* -t cms._treatments_v_blocks_*
-- (see uncover-cms/scripts/gen-blog-posts-migration.sh for the recipe).
--
-- Re-runnable: tables/indexes/sequences use IF NOT EXISTS. FK constraints
-- do NOT — first run creates them; subsequent runs will error on
-- duplicates (acceptable since migrations typically run once per env).

SET search_path TO cms, public;

BEGIN;

-- ── Shared icon enums (per-collection pattern, mirrors existing conventions) ──
DO $$ BEGIN
  CREATE TYPE cms.enum_blog_posts_blocks_benefits_block_items_icon AS ENUM
    ('shield', 'stethoscope', 'sun', 'heart', 'zap', 'sparkles', 'tech', 'doctors', 'results', 'experience', 'award', 'check', 'clock', 'leaf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cms.enum_blog_posts_blocks_content_grid_items_icon AS ENUM
    ('shield', 'stethoscope', 'sun', 'heart', 'zap', 'sparkles', 'tech', 'doctors', 'results', 'experience', 'award', 'check', 'clock', 'leaf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cms.enum__blog_posts_v_blocks_benefits_block_items_icon AS ENUM
    ('shield', 'stethoscope', 'sun', 'heart', 'zap', 'sparkles', 'tech', 'doctors', 'results', 'experience', 'award', 'check', 'clock', 'leaf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cms.enum__blog_posts_v_blocks_content_grid_items_icon AS ENUM
    ('shield', 'stethoscope', 'sun', 'heart', 'zap', 'sparkles', 'tech', 'doctors', 'results', 'experience', 'award', 'check', 'clock', 'leaf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Block tables (live + version mirror) ──────────────────────────────────────

--
-- Name: _blog_posts_v_blocks_before_after_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_before_after_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_before_after_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_before_after_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_before_after_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_before_after_block_id_seq OWNED BY cms._blog_posts_v_blocks_before_after_block.id;


--
-- Name: _blog_posts_v_blocks_before_after_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_before_after_block_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    title character varying,
    before_image_url character varying,
    after_image_url character varying,
    caption character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_before_after_block_items_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_before_after_block_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_before_after_block_items_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_before_after_block_items_id_seq OWNED BY cms._blog_posts_v_blocks_before_after_block_items.id;


--
-- Name: _blog_posts_v_blocks_benefits_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_benefits_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_benefits_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_benefits_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_benefits_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_benefits_block_id_seq OWNED BY cms._blog_posts_v_blocks_benefits_block.id;


--
-- Name: _blog_posts_v_blocks_benefits_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_benefits_block_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    title character varying,
    description character varying,
    icon cms.enum__blog_posts_v_blocks_benefits_block_items_icon DEFAULT 'shield'::cms.enum__blog_posts_v_blocks_benefits_block_items_icon,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_benefits_block_items_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_benefits_block_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_benefits_block_items_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_benefits_block_items_id_seq OWNED BY cms._blog_posts_v_blocks_benefits_block_items.id;


--
-- Name: _blog_posts_v_blocks_booking_form; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_booking_form (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying DEFAULT 'Book Your Consultation'::character varying,
    cta_label character varying DEFAULT 'Book FREE Consultation'::character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_booking_form_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_booking_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_booking_form_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_booking_form_id_seq OWNED BY cms._blog_posts_v_blocks_booking_form.id;


--
-- Name: _blog_posts_v_blocks_content_grid; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_content_grid (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    columns cms."gridCols" DEFAULT '2'::cms."gridCols",
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_content_grid_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_content_grid_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_content_grid_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_content_grid_id_seq OWNED BY cms._blog_posts_v_blocks_content_grid.id;


--
-- Name: _blog_posts_v_blocks_content_grid_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_content_grid_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    title character varying,
    description character varying,
    image_url character varying,
    image_alt_text character varying,
    href character varying,
    icon cms.enum__blog_posts_v_blocks_content_grid_items_icon,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_content_grid_items_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_content_grid_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_content_grid_items_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_content_grid_items_id_seq OWNED BY cms._blog_posts_v_blocks_content_grid_items.id;


--
-- Name: _blog_posts_v_blocks_cta_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_cta_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    heading character varying,
    description character varying,
    primary_cta_label character varying,
    primary_cta_href character varying,
    secondary_cta_label character varying,
    secondary_cta_href character varying,
    variant cms."ctaVariant" DEFAULT 'dark'::cms."ctaVariant",
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_cta_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_cta_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_cta_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_cta_block_id_seq OWNED BY cms._blog_posts_v_blocks_cta_block.id;


--
-- Name: _blog_posts_v_blocks_data_table; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_data_table (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    caption character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_data_table_columns; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_columns (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    key character varying,
    label character varying,
    align cms.align DEFAULT 'left'::cms.align,
    highlight boolean,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_data_table_columns_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_columns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_data_table_columns_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_data_table_columns_id_seq OWNED BY cms._blog_posts_v_blocks_data_table_columns.id;


--
-- Name: _blog_posts_v_blocks_data_table_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_data_table_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_data_table_id_seq OWNED BY cms._blog_posts_v_blocks_data_table.id;


--
-- Name: _blog_posts_v_blocks_data_table_rows; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_rows (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_rows_cells (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    key character varying,
    value character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_rows_cells_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_data_table_rows_cells_id_seq OWNED BY cms._blog_posts_v_blocks_data_table_rows_cells.id;


--
-- Name: _blog_posts_v_blocks_data_table_rows_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_data_table_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_data_table_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_data_table_rows_id_seq OWNED BY cms._blog_posts_v_blocks_data_table_rows.id;


--
-- Name: _blog_posts_v_blocks_doctors_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_doctors_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    "limit" numeric DEFAULT 6,
    filter_by_content_category_id integer,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_doctors_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_doctors_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_doctors_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_doctors_embed_id_seq OWNED BY cms._blog_posts_v_blocks_doctors_embed.id;


--
-- Name: _blog_posts_v_blocks_faqs_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_faqs_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    filter_by_content_category_id integer,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_faqs_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_faqs_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_faqs_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_faqs_embed_id_seq OWNED BY cms._blog_posts_v_blocks_faqs_embed.id;


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_faqs_embed_inline_faqs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    question character varying,
    answer character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_faqs_embed_inline_faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_faqs_embed_inline_faqs_id_seq OWNED BY cms._blog_posts_v_blocks_faqs_embed_inline_faqs.id;


--
-- Name: _blog_posts_v_blocks_html_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_html_embed (
    id integer NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    code character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_html_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_html_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_html_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_html_embed_id_seq OWNED BY cms._blog_posts_v_blocks_html_embed.id;


--
-- Name: _blog_posts_v_blocks_image_slider; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_image_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    aspect_ratio cms."aspectRatio" DEFAULT '16/9'::cms."aspectRatio",
    autoplay_ms numeric DEFAULT 0,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_image_slider_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_image_slider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_image_slider_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_image_slider_id_seq OWNED BY cms._blog_posts_v_blocks_image_slider.id;


--
-- Name: _blog_posts_v_blocks_image_slider_images; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_image_slider_images (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    image_url character varying,
    image_alt_text character varying,
    caption character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_image_slider_images_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_image_slider_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_image_slider_images_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_image_slider_images_id_seq OWNED BY cms._blog_posts_v_blocks_image_slider_images.id;


--
-- Name: _blog_posts_v_blocks_notice_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_notice_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    _uuid character varying,
    id integer NOT NULL,
    variant character varying,
    icon character varying,
    heading character varying,
    body character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_notice_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_notice_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_notice_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_notice_block_id_seq OWNED BY cms._blog_posts_v_blocks_notice_block.id;


--
-- Name: _blog_posts_v_blocks_overview_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_overview_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_overview_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_overview_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_overview_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_overview_block_id_seq OWNED BY cms._blog_posts_v_blocks_overview_block.id;


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_overview_block_paragraphs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    text character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_overview_block_paragraphs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_overview_block_paragraphs_id_seq OWNED BY cms._blog_posts_v_blocks_overview_block_paragraphs.id;


--
-- Name: _blog_posts_v_blocks_pricing_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_pricing_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_pricing_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_pricing_block_id_seq OWNED BY cms._blog_posts_v_blocks_pricing_block.id;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block_plans (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    name character varying,
    price character varying,
    currency character varying DEFAULT '₹'::character varying,
    description character varying,
    highlighted boolean,
    badge character varying,
    cta_label character varying DEFAULT 'Book Now'::character varying,
    cta_href character varying DEFAULT '#booking'::character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block_plans_features (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    value character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block_plans_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_pricing_block_plans_features_id_seq OWNED BY cms._blog_posts_v_blocks_pricing_block_plans_features.id;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_pricing_block_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_pricing_block_plans_id_seq OWNED BY cms._blog_posts_v_blocks_pricing_block_plans.id;


--
-- Name: _blog_posts_v_blocks_process_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_process_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_process_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_process_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_process_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_process_block_id_seq OWNED BY cms._blog_posts_v_blocks_process_block.id;


--
-- Name: _blog_posts_v_blocks_process_block_steps; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_process_block_steps (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    title character varying,
    description character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_process_block_steps_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_process_block_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_process_block_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_process_block_steps_id_seq OWNED BY cms._blog_posts_v_blocks_process_block_steps.id;


--
-- Name: _blog_posts_v_blocks_stats_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_stats_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    variant cms."statsVariant" DEFAULT 'dark'::cms."statsVariant",
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_stats_block_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_stats_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_stats_block_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_stats_block_id_seq OWNED BY cms._blog_posts_v_blocks_stats_block.id;


--
-- Name: _blog_posts_v_blocks_stats_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_stats_block_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    value character varying,
    label character varying,
    suffix character varying,
    _uuid character varying
);


--
-- Name: _blog_posts_v_blocks_stats_block_items_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_stats_block_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_stats_block_items_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_stats_block_items_id_seq OWNED BY cms._blog_posts_v_blocks_stats_block_items.id;


--
-- Name: _blog_posts_v_blocks_technology; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_technology (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    _uuid character varying,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    sub_heading character varying,
    image_upload_id integer,
    image character varying,
    image_alt_text character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_technology_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_technology_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_technology_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_technology_id_seq OWNED BY cms._blog_posts_v_blocks_technology.id;


--
-- Name: _blog_posts_v_blocks_testimonials_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_testimonials_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id integer NOT NULL,
    eyebrow character varying,
    heading character varying,
    "limit" numeric DEFAULT 6,
    filter_by_treatment_id integer,
    filter_by_content_category_id integer,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_testimonials_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_testimonials_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_testimonials_embed_id_seq OWNED BY cms._blog_posts_v_blocks_testimonials_embed.id;


--
-- Name: _blog_posts_v_blocks_text_section; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_text_section (
    id integer NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    content jsonb,
    image character varying,
    image_alt_text character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_text_section_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_text_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_text_section_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_text_section_id_seq OWNED BY cms._blog_posts_v_blocks_text_section.id;


--
-- Name: _blog_posts_v_blocks_video_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms._blog_posts_v_blocks_video_embed (
    id integer NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    video_url character varying,
    caption character varying,
    _uuid character varying,
    block_name character varying
);


--
-- Name: _blog_posts_v_blocks_video_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms._blog_posts_v_blocks_video_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _blog_posts_v_blocks_video_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms._blog_posts_v_blocks_video_embed_id_seq OWNED BY cms._blog_posts_v_blocks_video_embed.id;


--
-- Name: blog_posts_blocks_before_after_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_before_after_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_before_after_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_before_after_block_items (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    title character varying,
    before_image_url character varying,
    after_image_url character varying,
    caption character varying
);


--
-- Name: blog_posts_blocks_benefits_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_benefits_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_benefits_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_benefits_block_items (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    title character varying,
    description character varying,
    icon cms.enum_treatments_blocks_benefits_block_items_icon DEFAULT 'shield'::cms.enum_treatments_blocks_benefits_block_items_icon
);


--
-- Name: blog_posts_blocks_booking_form; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_booking_form (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying DEFAULT 'Book Your Consultation'::character varying,
    cta_label character varying DEFAULT 'Book FREE Consultation'::character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_content_grid; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_content_grid (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    columns cms."gridCols" DEFAULT '2'::cms."gridCols",
    block_name character varying
);


--
-- Name: blog_posts_blocks_content_grid_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_content_grid_items (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    title character varying,
    description character varying,
    image_url character varying,
    image_alt_text character varying,
    href character varying,
    icon cms.enum_treatments_blocks_content_grid_items_icon
);


--
-- Name: blog_posts_blocks_cta_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_cta_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    heading character varying,
    description character varying,
    primary_cta_label character varying,
    primary_cta_href character varying,
    secondary_cta_label character varying,
    secondary_cta_href character varying,
    variant cms."ctaVariant" DEFAULT 'dark'::cms."ctaVariant",
    block_name character varying
);


--
-- Name: blog_posts_blocks_data_table; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_data_table (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    caption character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_data_table_columns; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_data_table_columns (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    key character varying,
    label character varying,
    align cms.align DEFAULT 'left'::cms.align,
    highlight boolean
);


--
-- Name: blog_posts_blocks_data_table_rows; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_data_table_rows (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL
);


--
-- Name: blog_posts_blocks_data_table_rows_cells; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_data_table_rows_cells (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    key character varying,
    value character varying
);


--
-- Name: blog_posts_blocks_doctors_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_doctors_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    "limit" numeric DEFAULT 6,
    filter_by_content_category_id integer,
    block_name character varying
);


--
-- Name: blog_posts_blocks_faqs_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_faqs_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    filter_by_content_category_id integer,
    block_name character varying
);


--
-- Name: blog_posts_blocks_faqs_embed_inline_faqs; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_faqs_embed_inline_faqs (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    question character varying,
    answer character varying
);


--
-- Name: blog_posts_blocks_html_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_html_embed (
    id character varying NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    code character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_html_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms.blog_posts_blocks_html_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_blocks_html_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms.blog_posts_blocks_html_embed_id_seq OWNED BY cms.blog_posts_blocks_html_embed.id;


--
-- Name: blog_posts_blocks_image_slider; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_image_slider (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    aspect_ratio cms."aspectRatio" DEFAULT '16/9'::cms."aspectRatio",
    autoplay_ms numeric DEFAULT 0,
    block_name character varying
);


--
-- Name: blog_posts_blocks_image_slider_images; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_image_slider_images (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    image_url character varying,
    image_alt_text character varying,
    caption character varying
);


--
-- Name: blog_posts_blocks_notice_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_notice_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    variant character varying,
    icon character varying,
    heading character varying,
    body character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_overview_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_overview_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_overview_block_paragraphs; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_overview_block_paragraphs (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    text character varying
);


--
-- Name: blog_posts_blocks_pricing_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_pricing_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_pricing_block_plans; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_pricing_block_plans (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    name character varying,
    price character varying,
    currency character varying DEFAULT '₹'::character varying,
    description character varying,
    highlighted boolean,
    badge character varying,
    cta_label character varying DEFAULT 'Book Now'::character varying,
    cta_href character varying DEFAULT '#booking'::character varying
);


--
-- Name: blog_posts_blocks_pricing_block_plans_features; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_pricing_block_plans_features (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    value character varying
);


--
-- Name: blog_posts_blocks_process_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_process_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_process_block_steps; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_process_block_steps (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    title character varying,
    description character varying
);


--
-- Name: blog_posts_blocks_stats_block; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_stats_block (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    variant cms."statsVariant" DEFAULT 'dark'::cms."statsVariant",
    block_name character varying
);


--
-- Name: blog_posts_blocks_stats_block_items; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_stats_block_items (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    value character varying,
    label character varying,
    suffix character varying
);


--
-- Name: blog_posts_blocks_technology; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_technology (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    sub_heading character varying,
    image_upload_id integer,
    image character varying,
    image_alt_text character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_testimonials_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_testimonials_embed (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    _path text NOT NULL,
    id character varying NOT NULL,
    eyebrow character varying,
    heading character varying,
    "limit" numeric DEFAULT 6,
    filter_by_treatment_id integer,
    filter_by_content_category_id integer,
    block_name character varying
);


--
-- Name: blog_posts_blocks_text_section; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_text_section (
    id character varying NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    content jsonb,
    image character varying,
    image_alt_text character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_text_section_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms.blog_posts_blocks_text_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_blocks_text_section_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms.blog_posts_blocks_text_section_id_seq OWNED BY cms.blog_posts_blocks_text_section.id;


--
-- Name: blog_posts_blocks_video_embed; Type: TABLE; Schema: cms; Owner: -
--

CREATE TABLE IF NOT EXISTS cms.blog_posts_blocks_video_embed (
    id character varying NOT NULL,
    _parent_id integer NOT NULL,
    _order integer NOT NULL,
    _path text NOT NULL,
    heading character varying,
    video_url character varying,
    caption character varying,
    block_name character varying
);


--
-- Name: blog_posts_blocks_video_embed_id_seq; Type: SEQUENCE; Schema: cms; Owner: -
--

CREATE SEQUENCE IF NOT EXISTS cms.blog_posts_blocks_video_embed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_blocks_video_embed_id_seq; Type: SEQUENCE OWNED BY; Schema: cms; Owner: -
--

ALTER SEQUENCE cms.blog_posts_blocks_video_embed_id_seq OWNED BY cms.blog_posts_blocks_video_embed.id;


--
-- Name: _blog_posts_v_blocks_before_after_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_before_after_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_before_after_block_items id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block_items ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_before_after_block_items_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_benefits_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_benefits_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_benefits_block_items id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block_items ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_benefits_block_items_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_booking_form id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_booking_form ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_booking_form_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_content_grid id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_content_grid_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_content_grid_items id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid_items ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_content_grid_items_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_cta_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_cta_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_cta_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_data_table id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_data_table_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_data_table_columns id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_columns ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_data_table_columns_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_data_table_rows id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_data_table_rows_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows_cells ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_data_table_rows_cells_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_doctors_embed id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_doctors_embed ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_doctors_embed_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_faqs_embed id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_faqs_embed_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed_inline_faqs ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_faqs_embed_inline_faqs_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_html_embed id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_html_embed ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_html_embed_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_image_slider id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_image_slider_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_image_slider_images id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider_images ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_image_slider_images_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_notice_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_notice_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_notice_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_overview_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_overview_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block_paragraphs ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_overview_block_paragraphs_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_pricing_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_pricing_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_pricing_block_plans_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans_features ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_pricing_block_plans_features_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_process_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_process_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_process_block_steps id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block_steps ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_process_block_steps_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_stats_block id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_stats_block_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_stats_block_items id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block_items ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_stats_block_items_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_technology id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_technology ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_technology_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_testimonials_embed id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_testimonials_embed ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_testimonials_embed_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_text_section id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_text_section ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_text_section_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_video_embed id; Type: DEFAULT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_video_embed ALTER COLUMN id SET DEFAULT nextval('cms._blog_posts_v_blocks_video_embed_id_seq'::regclass);


--
-- Name: _blog_posts_v_blocks_before_after_block_items _blog_posts_v_blocks_before_after_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_before_after_block_items_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_before_after_block _blog_posts_v_blocks_before_after_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block
    ADD CONSTRAINT _blog_posts_v_blocks_before_after_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_benefits_block_items _blog_posts_v_blocks_benefits_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_benefits_block_items_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_benefits_block _blog_posts_v_blocks_benefits_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block
    ADD CONSTRAINT _blog_posts_v_blocks_benefits_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_booking_form _blog_posts_v_blocks_booking_form_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_booking_form
    ADD CONSTRAINT _blog_posts_v_blocks_booking_form_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_content_grid_items _blog_posts_v_blocks_content_grid_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid_items
    ADD CONSTRAINT _blog_posts_v_blocks_content_grid_items_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_content_grid _blog_posts_v_blocks_content_grid_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid
    ADD CONSTRAINT _blog_posts_v_blocks_content_grid_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_cta_block _blog_posts_v_blocks_cta_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_cta_block
    ADD CONSTRAINT _blog_posts_v_blocks_cta_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_data_table_columns _blog_posts_v_blocks_data_table_columns_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_columns
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_columns_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_data_table _blog_posts_v_blocks_data_table_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells _blog_posts_v_blocks_data_table_rows_cells_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows_cells
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_rows_cells_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_data_table_rows _blog_posts_v_blocks_data_table_rows_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_rows_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_doctors_embed _blog_posts_v_blocks_doctors_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_doctors_embed
    ADD CONSTRAINT _blog_posts_v_blocks_doctors_embed_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs _blog_posts_v_blocks_faqs_embed_inline_faqs_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed_inline_faqs
    ADD CONSTRAINT _blog_posts_v_blocks_faqs_embed_inline_faqs_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_faqs_embed _blog_posts_v_blocks_faqs_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed
    ADD CONSTRAINT _blog_posts_v_blocks_faqs_embed_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_html_embed _blog_posts_v_blocks_html_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_html_embed
    ADD CONSTRAINT _blog_posts_v_blocks_html_embed_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_image_slider_images _blog_posts_v_blocks_image_slider_images_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider_images
    ADD CONSTRAINT _blog_posts_v_blocks_image_slider_images_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_image_slider _blog_posts_v_blocks_image_slider_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider
    ADD CONSTRAINT _blog_posts_v_blocks_image_slider_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_notice_block _blog_posts_v_blocks_notice_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_notice_block
    ADD CONSTRAINT _blog_posts_v_blocks_notice_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs _blog_posts_v_blocks_overview_block_paragraphs_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block_paragraphs
    ADD CONSTRAINT _blog_posts_v_blocks_overview_block_paragraphs_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_overview_block _blog_posts_v_blocks_overview_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block
    ADD CONSTRAINT _blog_posts_v_blocks_overview_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_pricing_block _blog_posts_v_blocks_pricing_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features _blog_posts_v_blocks_pricing_block_plans_features_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans_features
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_plans_features_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans _blog_posts_v_blocks_pricing_block_plans_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_plans_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_process_block _blog_posts_v_blocks_process_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block
    ADD CONSTRAINT _blog_posts_v_blocks_process_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_process_block_steps _blog_posts_v_blocks_process_block_steps_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block_steps
    ADD CONSTRAINT _blog_posts_v_blocks_process_block_steps_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_stats_block_items _blog_posts_v_blocks_stats_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_stats_block_items_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_stats_block _blog_posts_v_blocks_stats_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block
    ADD CONSTRAINT _blog_posts_v_blocks_stats_block_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_technology _blog_posts_v_blocks_technology_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_technology
    ADD CONSTRAINT _blog_posts_v_blocks_technology_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_testimonials_embed _blog_posts_v_blocks_testimonials_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_testimonials_embed
    ADD CONSTRAINT _blog_posts_v_blocks_testimonials_embed_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_text_section _blog_posts_v_blocks_text_section_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_text_section
    ADD CONSTRAINT _blog_posts_v_blocks_text_section_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_video_embed _blog_posts_v_blocks_video_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_video_embed
    ADD CONSTRAINT _blog_posts_v_blocks_video_embed_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_before_after_block_items blog_posts_blocks_before_after_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_before_after_block_items
    ADD CONSTRAINT blog_posts_blocks_before_after_block_items_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_before_after_block blog_posts_blocks_before_after_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_before_after_block
    ADD CONSTRAINT blog_posts_blocks_before_after_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_benefits_block_items blog_posts_blocks_benefits_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_benefits_block_items
    ADD CONSTRAINT blog_posts_blocks_benefits_block_items_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_benefits_block blog_posts_blocks_benefits_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_benefits_block
    ADD CONSTRAINT blog_posts_blocks_benefits_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_booking_form blog_posts_blocks_booking_form_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_booking_form
    ADD CONSTRAINT blog_posts_blocks_booking_form_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_content_grid_items blog_posts_blocks_content_grid_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_content_grid_items
    ADD CONSTRAINT blog_posts_blocks_content_grid_items_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_content_grid blog_posts_blocks_content_grid_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_content_grid
    ADD CONSTRAINT blog_posts_blocks_content_grid_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_cta_block blog_posts_blocks_cta_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_cta_block
    ADD CONSTRAINT blog_posts_blocks_cta_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_data_table_columns blog_posts_blocks_data_table_columns_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_columns
    ADD CONSTRAINT blog_posts_blocks_data_table_columns_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_data_table blog_posts_blocks_data_table_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table
    ADD CONSTRAINT blog_posts_blocks_data_table_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_data_table_rows_cells blog_posts_blocks_data_table_rows_cells_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_rows_cells
    ADD CONSTRAINT blog_posts_blocks_data_table_rows_cells_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_data_table_rows blog_posts_blocks_data_table_rows_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_rows
    ADD CONSTRAINT blog_posts_blocks_data_table_rows_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_doctors_embed blog_posts_blocks_doctors_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_doctors_embed
    ADD CONSTRAINT blog_posts_blocks_doctors_embed_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_faqs_embed_inline_faqs blog_posts_blocks_faqs_embed_inline_faqs_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_faqs_embed_inline_faqs
    ADD CONSTRAINT blog_posts_blocks_faqs_embed_inline_faqs_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_faqs_embed blog_posts_blocks_faqs_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_faqs_embed
    ADD CONSTRAINT blog_posts_blocks_faqs_embed_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_html_embed blog_posts_blocks_html_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_html_embed
    ADD CONSTRAINT blog_posts_blocks_html_embed_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_image_slider_images blog_posts_blocks_image_slider_images_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_image_slider_images
    ADD CONSTRAINT blog_posts_blocks_image_slider_images_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_image_slider blog_posts_blocks_image_slider_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_image_slider
    ADD CONSTRAINT blog_posts_blocks_image_slider_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_notice_block blog_posts_blocks_notice_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_notice_block
    ADD CONSTRAINT blog_posts_blocks_notice_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_overview_block_paragraphs blog_posts_blocks_overview_block_paragraphs_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_overview_block_paragraphs
    ADD CONSTRAINT blog_posts_blocks_overview_block_paragraphs_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_overview_block blog_posts_blocks_overview_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_overview_block
    ADD CONSTRAINT blog_posts_blocks_overview_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_pricing_block blog_posts_blocks_pricing_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block
    ADD CONSTRAINT blog_posts_blocks_pricing_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_pricing_block_plans_features blog_posts_blocks_pricing_block_plans_features_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block_plans_features
    ADD CONSTRAINT blog_posts_blocks_pricing_block_plans_features_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_pricing_block_plans blog_posts_blocks_pricing_block_plans_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block_plans
    ADD CONSTRAINT blog_posts_blocks_pricing_block_plans_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_process_block blog_posts_blocks_process_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_process_block
    ADD CONSTRAINT blog_posts_blocks_process_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_process_block_steps blog_posts_blocks_process_block_steps_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_process_block_steps
    ADD CONSTRAINT blog_posts_blocks_process_block_steps_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_stats_block_items blog_posts_blocks_stats_block_items_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_stats_block_items
    ADD CONSTRAINT blog_posts_blocks_stats_block_items_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_stats_block blog_posts_blocks_stats_block_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_stats_block
    ADD CONSTRAINT blog_posts_blocks_stats_block_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_technology blog_posts_blocks_technology_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_technology
    ADD CONSTRAINT blog_posts_blocks_technology_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_testimonials_embed blog_posts_blocks_testimonials_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_testimonials_embed
    ADD CONSTRAINT blog_posts_blocks_testimonials_embed_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_text_section blog_posts_blocks_text_section_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_text_section
    ADD CONSTRAINT blog_posts_blocks_text_section_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_blocks_video_embed blog_posts_blocks_video_embed_pkey; Type: CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_video_embed
    ADD CONSTRAINT blog_posts_blocks_video_embed_pkey PRIMARY KEY (id);


--
-- Name: _blog_posts_v_blocks_before_after_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_before_after_block_items_order_idx ON cms._blog_posts_v_blocks_before_after_block_items USING btree (_order);


--
-- Name: _blog_posts_v_blocks_before_after_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_before_after_block_items_parent_id_idx ON cms._blog_posts_v_blocks_before_after_block_items USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_before_after_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_before_after_block_order_idx ON cms._blog_posts_v_blocks_before_after_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_before_after_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_before_after_block_parent_id_idx ON cms._blog_posts_v_blocks_before_after_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_before_after_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_before_after_block_path_idx ON cms._blog_posts_v_blocks_before_after_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_benefits_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_benefits_block_items_order_idx ON cms._blog_posts_v_blocks_benefits_block_items USING btree (_order);


--
-- Name: _blog_posts_v_blocks_benefits_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_benefits_block_items_parent_id_idx ON cms._blog_posts_v_blocks_benefits_block_items USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_benefits_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_benefits_block_order_idx ON cms._blog_posts_v_blocks_benefits_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_benefits_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_benefits_block_parent_id_idx ON cms._blog_posts_v_blocks_benefits_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_benefits_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_benefits_block_path_idx ON cms._blog_posts_v_blocks_benefits_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_booking_form_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_booking_form_order_idx ON cms._blog_posts_v_blocks_booking_form USING btree (_order);


--
-- Name: _blog_posts_v_blocks_booking_form_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_booking_form_parent_id_idx ON cms._blog_posts_v_blocks_booking_form USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_booking_form_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_booking_form_path_idx ON cms._blog_posts_v_blocks_booking_form USING btree (_path);


--
-- Name: _blog_posts_v_blocks_content_grid_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_content_grid_items_order_idx ON cms._blog_posts_v_blocks_content_grid_items USING btree (_order);


--
-- Name: _blog_posts_v_blocks_content_grid_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_content_grid_items_parent_id_idx ON cms._blog_posts_v_blocks_content_grid_items USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_content_grid_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_content_grid_order_idx ON cms._blog_posts_v_blocks_content_grid USING btree (_order);


--
-- Name: _blog_posts_v_blocks_content_grid_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_content_grid_parent_id_idx ON cms._blog_posts_v_blocks_content_grid USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_content_grid_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_content_grid_path_idx ON cms._blog_posts_v_blocks_content_grid USING btree (_path);


--
-- Name: _blog_posts_v_blocks_cta_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_cta_block_order_idx ON cms._blog_posts_v_blocks_cta_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_cta_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_cta_block_parent_id_idx ON cms._blog_posts_v_blocks_cta_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_cta_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_cta_block_path_idx ON cms._blog_posts_v_blocks_cta_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_data_table_columns_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_columns_order_idx ON cms._blog_posts_v_blocks_data_table_columns USING btree (_order);


--
-- Name: _blog_posts_v_blocks_data_table_columns_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_columns_parent_id_idx ON cms._blog_posts_v_blocks_data_table_columns USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_data_table_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_order_idx ON cms._blog_posts_v_blocks_data_table USING btree (_order);


--
-- Name: _blog_posts_v_blocks_data_table_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_parent_id_idx ON cms._blog_posts_v_blocks_data_table USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_data_table_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_path_idx ON cms._blog_posts_v_blocks_data_table USING btree (_path);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_rows_cells_order_idx ON cms._blog_posts_v_blocks_data_table_rows_cells USING btree (_order);


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_rows_cells_parent_id_idx ON cms._blog_posts_v_blocks_data_table_rows_cells USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_data_table_rows_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_rows_order_idx ON cms._blog_posts_v_blocks_data_table_rows USING btree (_order);


--
-- Name: _blog_posts_v_blocks_data_table_rows_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_data_table_rows_parent_id_idx ON cms._blog_posts_v_blocks_data_table_rows USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_doctors_embed_filter_by_content_cat_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_doctors_embed_filter_by_content_cat_idx ON cms._blog_posts_v_blocks_doctors_embed USING btree (filter_by_content_category_id);


--
-- Name: _blog_posts_v_blocks_doctors_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_doctors_embed_order_idx ON cms._blog_posts_v_blocks_doctors_embed USING btree (_order);


--
-- Name: _blog_posts_v_blocks_doctors_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_doctors_embed_parent_id_idx ON cms._blog_posts_v_blocks_doctors_embed USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_doctors_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_doctors_embed_path_idx ON cms._blog_posts_v_blocks_doctors_embed USING btree (_path);


--
-- Name: _blog_posts_v_blocks_faqs_embed_filter_by_content_catego_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_filter_by_content_catego_idx ON cms._blog_posts_v_blocks_faqs_embed USING btree (filter_by_content_category_id);


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_inline_faqs_order_idx ON cms._blog_posts_v_blocks_faqs_embed_inline_faqs USING btree (_order);


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_inline_faqs_parent_id_idx ON cms._blog_posts_v_blocks_faqs_embed_inline_faqs USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_faqs_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_order_idx ON cms._blog_posts_v_blocks_faqs_embed USING btree (_order);


--
-- Name: _blog_posts_v_blocks_faqs_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_parent_id_idx ON cms._blog_posts_v_blocks_faqs_embed USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_faqs_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_faqs_embed_path_idx ON cms._blog_posts_v_blocks_faqs_embed USING btree (_path);


--
-- Name: _blog_posts_v_blocks_html_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_html_embed_order_idx ON cms._blog_posts_v_blocks_html_embed USING btree (_order);


--
-- Name: _blog_posts_v_blocks_html_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_html_embed_parent_id_idx ON cms._blog_posts_v_blocks_html_embed USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_html_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_html_embed_path_idx ON cms._blog_posts_v_blocks_html_embed USING btree (_path);


--
-- Name: _blog_posts_v_blocks_image_slider_images_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_image_slider_images_order_idx ON cms._blog_posts_v_blocks_image_slider_images USING btree (_order);


--
-- Name: _blog_posts_v_blocks_image_slider_images_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_image_slider_images_parent_id_idx ON cms._blog_posts_v_blocks_image_slider_images USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_image_slider_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_image_slider_order_idx ON cms._blog_posts_v_blocks_image_slider USING btree (_order);


--
-- Name: _blog_posts_v_blocks_image_slider_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_image_slider_parent_id_idx ON cms._blog_posts_v_blocks_image_slider USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_image_slider_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_image_slider_path_idx ON cms._blog_posts_v_blocks_image_slider USING btree (_path);


--
-- Name: _blog_posts_v_blocks_notice_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_notice_block_order_idx ON cms._blog_posts_v_blocks_notice_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_notice_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_notice_block_parent_id_idx ON cms._blog_posts_v_blocks_notice_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_notice_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_notice_block_path_idx ON cms._blog_posts_v_blocks_notice_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_overview_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_overview_block_order_idx ON cms._blog_posts_v_blocks_overview_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_overview_block_paragraphs_order_idx ON cms._blog_posts_v_blocks_overview_block_paragraphs USING btree (_order);


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_overview_block_paragraphs_parent_id_idx ON cms._blog_posts_v_blocks_overview_block_paragraphs USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_overview_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_overview_block_parent_id_idx ON cms._blog_posts_v_blocks_overview_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_overview_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_overview_block_path_idx ON cms._blog_posts_v_blocks_overview_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_pricing_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_order_idx ON cms._blog_posts_v_blocks_pricing_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_pricing_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_parent_id_idx ON cms._blog_posts_v_blocks_pricing_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_pricing_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_path_idx ON cms._blog_posts_v_blocks_pricing_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_plans_features_order_idx ON cms._blog_posts_v_blocks_pricing_block_plans_features USING btree (_order);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_plans_features_parent_id_idx ON cms._blog_posts_v_blocks_pricing_block_plans_features USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_plans_order_idx ON cms._blog_posts_v_blocks_pricing_block_plans USING btree (_order);


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_pricing_block_plans_parent_id_idx ON cms._blog_posts_v_blocks_pricing_block_plans USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_process_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_process_block_order_idx ON cms._blog_posts_v_blocks_process_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_process_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_process_block_parent_id_idx ON cms._blog_posts_v_blocks_process_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_process_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_process_block_path_idx ON cms._blog_posts_v_blocks_process_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_process_block_steps_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_process_block_steps_order_idx ON cms._blog_posts_v_blocks_process_block_steps USING btree (_order);


--
-- Name: _blog_posts_v_blocks_process_block_steps_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_process_block_steps_parent_id_idx ON cms._blog_posts_v_blocks_process_block_steps USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_stats_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_stats_block_items_order_idx ON cms._blog_posts_v_blocks_stats_block_items USING btree (_order);


--
-- Name: _blog_posts_v_blocks_stats_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_stats_block_items_parent_id_idx ON cms._blog_posts_v_blocks_stats_block_items USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_stats_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_stats_block_order_idx ON cms._blog_posts_v_blocks_stats_block USING btree (_order);


--
-- Name: _blog_posts_v_blocks_stats_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_stats_block_parent_id_idx ON cms._blog_posts_v_blocks_stats_block USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_stats_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_stats_block_path_idx ON cms._blog_posts_v_blocks_stats_block USING btree (_path);


--
-- Name: _blog_posts_v_blocks_technology_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_technology_order_idx ON cms._blog_posts_v_blocks_technology USING btree (_order);


--
-- Name: _blog_posts_v_blocks_technology_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_technology_parent_id_idx ON cms._blog_posts_v_blocks_technology USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_technology_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_technology_path_idx ON cms._blog_posts_v_blocks_technology USING btree (_path);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_filter_by_conten_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_testimonials_embed_filter_by_conten_idx ON cms._blog_posts_v_blocks_testimonials_embed USING btree (filter_by_content_category_id);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_filter_by_treatm_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_testimonials_embed_filter_by_treatm_idx ON cms._blog_posts_v_blocks_testimonials_embed USING btree (filter_by_treatment_id);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_testimonials_embed_order_idx ON cms._blog_posts_v_blocks_testimonials_embed USING btree (_order);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_testimonials_embed_parent_id_idx ON cms._blog_posts_v_blocks_testimonials_embed USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_testimonials_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_testimonials_embed_path_idx ON cms._blog_posts_v_blocks_testimonials_embed USING btree (_path);


--
-- Name: _blog_posts_v_blocks_text_section_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_text_section_order_idx ON cms._blog_posts_v_blocks_text_section USING btree (_order);


--
-- Name: _blog_posts_v_blocks_text_section_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_text_section_parent_id_idx ON cms._blog_posts_v_blocks_text_section USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_text_section_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_text_section_path_idx ON cms._blog_posts_v_blocks_text_section USING btree (_path);


--
-- Name: _blog_posts_v_blocks_video_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_video_embed_order_idx ON cms._blog_posts_v_blocks_video_embed USING btree (_order);


--
-- Name: _blog_posts_v_blocks_video_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_video_embed_parent_id_idx ON cms._blog_posts_v_blocks_video_embed USING btree (_parent_id);


--
-- Name: _blog_posts_v_blocks_video_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS _blog_posts_v_blocks_video_embed_path_idx ON cms._blog_posts_v_blocks_video_embed USING btree (_path);


--
-- Name: blog_posts_blocks_before_after_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_before_after_block_items_order_idx ON cms.blog_posts_blocks_before_after_block_items USING btree (_order);


--
-- Name: blog_posts_blocks_before_after_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_before_after_block_items_parent_id_idx ON cms.blog_posts_blocks_before_after_block_items USING btree (_parent_id);


--
-- Name: blog_posts_blocks_before_after_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_before_after_block_order_idx ON cms.blog_posts_blocks_before_after_block USING btree (_order);


--
-- Name: blog_posts_blocks_before_after_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_before_after_block_parent_id_idx ON cms.blog_posts_blocks_before_after_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_before_after_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_before_after_block_path_idx ON cms.blog_posts_blocks_before_after_block USING btree (_path);


--
-- Name: blog_posts_blocks_benefits_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_benefits_block_items_order_idx ON cms.blog_posts_blocks_benefits_block_items USING btree (_order);


--
-- Name: blog_posts_blocks_benefits_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_benefits_block_items_parent_id_idx ON cms.blog_posts_blocks_benefits_block_items USING btree (_parent_id);


--
-- Name: blog_posts_blocks_benefits_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_benefits_block_order_idx ON cms.blog_posts_blocks_benefits_block USING btree (_order);


--
-- Name: blog_posts_blocks_benefits_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_benefits_block_parent_id_idx ON cms.blog_posts_blocks_benefits_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_benefits_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_benefits_block_path_idx ON cms.blog_posts_blocks_benefits_block USING btree (_path);


--
-- Name: blog_posts_blocks_booking_form_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_booking_form_order_idx ON cms.blog_posts_blocks_booking_form USING btree (_order);


--
-- Name: blog_posts_blocks_booking_form_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_booking_form_parent_id_idx ON cms.blog_posts_blocks_booking_form USING btree (_parent_id);


--
-- Name: blog_posts_blocks_booking_form_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_booking_form_path_idx ON cms.blog_posts_blocks_booking_form USING btree (_path);


--
-- Name: blog_posts_blocks_content_grid_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_content_grid_items_order_idx ON cms.blog_posts_blocks_content_grid_items USING btree (_order);


--
-- Name: blog_posts_blocks_content_grid_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_content_grid_items_parent_id_idx ON cms.blog_posts_blocks_content_grid_items USING btree (_parent_id);


--
-- Name: blog_posts_blocks_content_grid_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_content_grid_order_idx ON cms.blog_posts_blocks_content_grid USING btree (_order);


--
-- Name: blog_posts_blocks_content_grid_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_content_grid_parent_id_idx ON cms.blog_posts_blocks_content_grid USING btree (_parent_id);


--
-- Name: blog_posts_blocks_content_grid_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_content_grid_path_idx ON cms.blog_posts_blocks_content_grid USING btree (_path);


--
-- Name: blog_posts_blocks_cta_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_cta_block_order_idx ON cms.blog_posts_blocks_cta_block USING btree (_order);


--
-- Name: blog_posts_blocks_cta_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_cta_block_parent_id_idx ON cms.blog_posts_blocks_cta_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_cta_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_cta_block_path_idx ON cms.blog_posts_blocks_cta_block USING btree (_path);


--
-- Name: blog_posts_blocks_data_table_columns_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_columns_order_idx ON cms.blog_posts_blocks_data_table_columns USING btree (_order);


--
-- Name: blog_posts_blocks_data_table_columns_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_columns_parent_id_idx ON cms.blog_posts_blocks_data_table_columns USING btree (_parent_id);


--
-- Name: blog_posts_blocks_data_table_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_order_idx ON cms.blog_posts_blocks_data_table USING btree (_order);


--
-- Name: blog_posts_blocks_data_table_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_parent_id_idx ON cms.blog_posts_blocks_data_table USING btree (_parent_id);


--
-- Name: blog_posts_blocks_data_table_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_path_idx ON cms.blog_posts_blocks_data_table USING btree (_path);


--
-- Name: blog_posts_blocks_data_table_rows_cells_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_rows_cells_order_idx ON cms.blog_posts_blocks_data_table_rows_cells USING btree (_order);


--
-- Name: blog_posts_blocks_data_table_rows_cells_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_rows_cells_parent_id_idx ON cms.blog_posts_blocks_data_table_rows_cells USING btree (_parent_id);


--
-- Name: blog_posts_blocks_data_table_rows_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_rows_order_idx ON cms.blog_posts_blocks_data_table_rows USING btree (_order);


--
-- Name: blog_posts_blocks_data_table_rows_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_data_table_rows_parent_id_idx ON cms.blog_posts_blocks_data_table_rows USING btree (_parent_id);


--
-- Name: blog_posts_blocks_doctors_embed_filter_by_content_catego_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_doctors_embed_filter_by_content_catego_idx ON cms.blog_posts_blocks_doctors_embed USING btree (filter_by_content_category_id);


--
-- Name: blog_posts_blocks_doctors_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_doctors_embed_order_idx ON cms.blog_posts_blocks_doctors_embed USING btree (_order);


--
-- Name: blog_posts_blocks_doctors_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_doctors_embed_parent_id_idx ON cms.blog_posts_blocks_doctors_embed USING btree (_parent_id);


--
-- Name: blog_posts_blocks_doctors_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_doctors_embed_path_idx ON cms.blog_posts_blocks_doctors_embed USING btree (_path);


--
-- Name: blog_posts_blocks_faqs_embed_filter_by_content_category_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_filter_by_content_category_idx ON cms.blog_posts_blocks_faqs_embed USING btree (filter_by_content_category_id);


--
-- Name: blog_posts_blocks_faqs_embed_inline_faqs_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_inline_faqs_order_idx ON cms.blog_posts_blocks_faqs_embed_inline_faqs USING btree (_order);


--
-- Name: blog_posts_blocks_faqs_embed_inline_faqs_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_inline_faqs_parent_id_idx ON cms.blog_posts_blocks_faqs_embed_inline_faqs USING btree (_parent_id);


--
-- Name: blog_posts_blocks_faqs_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_order_idx ON cms.blog_posts_blocks_faqs_embed USING btree (_order);


--
-- Name: blog_posts_blocks_faqs_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_parent_id_idx ON cms.blog_posts_blocks_faqs_embed USING btree (_parent_id);


--
-- Name: blog_posts_blocks_faqs_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_faqs_embed_path_idx ON cms.blog_posts_blocks_faqs_embed USING btree (_path);


--
-- Name: blog_posts_blocks_html_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_html_embed_order_idx ON cms.blog_posts_blocks_html_embed USING btree (_order);


--
-- Name: blog_posts_blocks_html_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_html_embed_parent_id_idx ON cms.blog_posts_blocks_html_embed USING btree (_parent_id);


--
-- Name: blog_posts_blocks_html_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_html_embed_path_idx ON cms.blog_posts_blocks_html_embed USING btree (_path);


--
-- Name: blog_posts_blocks_image_slider_images_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_image_slider_images_order_idx ON cms.blog_posts_blocks_image_slider_images USING btree (_order);


--
-- Name: blog_posts_blocks_image_slider_images_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_image_slider_images_parent_id_idx ON cms.blog_posts_blocks_image_slider_images USING btree (_parent_id);


--
-- Name: blog_posts_blocks_image_slider_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_image_slider_order_idx ON cms.blog_posts_blocks_image_slider USING btree (_order);


--
-- Name: blog_posts_blocks_image_slider_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_image_slider_parent_id_idx ON cms.blog_posts_blocks_image_slider USING btree (_parent_id);


--
-- Name: blog_posts_blocks_image_slider_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_image_slider_path_idx ON cms.blog_posts_blocks_image_slider USING btree (_path);


--
-- Name: blog_posts_blocks_notice_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_notice_block_order_idx ON cms.blog_posts_blocks_notice_block USING btree (_order);


--
-- Name: blog_posts_blocks_notice_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_notice_block_parent_id_idx ON cms.blog_posts_blocks_notice_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_notice_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_notice_block_path_idx ON cms.blog_posts_blocks_notice_block USING btree (_path);


--
-- Name: blog_posts_blocks_overview_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_overview_block_order_idx ON cms.blog_posts_blocks_overview_block USING btree (_order);


--
-- Name: blog_posts_blocks_overview_block_paragraphs_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_overview_block_paragraphs_order_idx ON cms.blog_posts_blocks_overview_block_paragraphs USING btree (_order);


--
-- Name: blog_posts_blocks_overview_block_paragraphs_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_overview_block_paragraphs_parent_id_idx ON cms.blog_posts_blocks_overview_block_paragraphs USING btree (_parent_id);


--
-- Name: blog_posts_blocks_overview_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_overview_block_parent_id_idx ON cms.blog_posts_blocks_overview_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_overview_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_overview_block_path_idx ON cms.blog_posts_blocks_overview_block USING btree (_path);


--
-- Name: blog_posts_blocks_pricing_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_order_idx ON cms.blog_posts_blocks_pricing_block USING btree (_order);


--
-- Name: blog_posts_blocks_pricing_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_parent_id_idx ON cms.blog_posts_blocks_pricing_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_pricing_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_path_idx ON cms.blog_posts_blocks_pricing_block USING btree (_path);


--
-- Name: blog_posts_blocks_pricing_block_plans_features_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_plans_features_order_idx ON cms.blog_posts_blocks_pricing_block_plans_features USING btree (_order);


--
-- Name: blog_posts_blocks_pricing_block_plans_features_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_plans_features_parent_id_idx ON cms.blog_posts_blocks_pricing_block_plans_features USING btree (_parent_id);


--
-- Name: blog_posts_blocks_pricing_block_plans_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_plans_order_idx ON cms.blog_posts_blocks_pricing_block_plans USING btree (_order);


--
-- Name: blog_posts_blocks_pricing_block_plans_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_pricing_block_plans_parent_id_idx ON cms.blog_posts_blocks_pricing_block_plans USING btree (_parent_id);


--
-- Name: blog_posts_blocks_process_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_process_block_order_idx ON cms.blog_posts_blocks_process_block USING btree (_order);


--
-- Name: blog_posts_blocks_process_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_process_block_parent_id_idx ON cms.blog_posts_blocks_process_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_process_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_process_block_path_idx ON cms.blog_posts_blocks_process_block USING btree (_path);


--
-- Name: blog_posts_blocks_process_block_steps_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_process_block_steps_order_idx ON cms.blog_posts_blocks_process_block_steps USING btree (_order);


--
-- Name: blog_posts_blocks_process_block_steps_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_process_block_steps_parent_id_idx ON cms.blog_posts_blocks_process_block_steps USING btree (_parent_id);


--
-- Name: blog_posts_blocks_stats_block_items_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_stats_block_items_order_idx ON cms.blog_posts_blocks_stats_block_items USING btree (_order);


--
-- Name: blog_posts_blocks_stats_block_items_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_stats_block_items_parent_id_idx ON cms.blog_posts_blocks_stats_block_items USING btree (_parent_id);


--
-- Name: blog_posts_blocks_stats_block_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_stats_block_order_idx ON cms.blog_posts_blocks_stats_block USING btree (_order);


--
-- Name: blog_posts_blocks_stats_block_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_stats_block_parent_id_idx ON cms.blog_posts_blocks_stats_block USING btree (_parent_id);


--
-- Name: blog_posts_blocks_stats_block_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_stats_block_path_idx ON cms.blog_posts_blocks_stats_block USING btree (_path);


--
-- Name: blog_posts_blocks_technology_image_upload_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_technology_image_upload_idx ON cms.blog_posts_blocks_technology USING btree (image_upload_id);


--
-- Name: blog_posts_blocks_technology_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_technology_order_idx ON cms.blog_posts_blocks_technology USING btree (_order);


--
-- Name: blog_posts_blocks_technology_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_technology_parent_id_idx ON cms.blog_posts_blocks_technology USING btree (_parent_id);


--
-- Name: blog_posts_blocks_technology_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_technology_path_idx ON cms.blog_posts_blocks_technology USING btree (_path);


--
-- Name: blog_posts_blocks_testimonials_embed_filter_by_content_c_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_testimonials_embed_filter_by_content_c_idx ON cms.blog_posts_blocks_testimonials_embed USING btree (filter_by_content_category_id);


--
-- Name: blog_posts_blocks_testimonials_embed_filter_by_treatment_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_testimonials_embed_filter_by_treatment_idx ON cms.blog_posts_blocks_testimonials_embed USING btree (filter_by_treatment_id);


--
-- Name: blog_posts_blocks_testimonials_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_testimonials_embed_order_idx ON cms.blog_posts_blocks_testimonials_embed USING btree (_order);


--
-- Name: blog_posts_blocks_testimonials_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_testimonials_embed_parent_id_idx ON cms.blog_posts_blocks_testimonials_embed USING btree (_parent_id);


--
-- Name: blog_posts_blocks_testimonials_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_testimonials_embed_path_idx ON cms.blog_posts_blocks_testimonials_embed USING btree (_path);


--
-- Name: blog_posts_blocks_text_section_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_text_section_order_idx ON cms.blog_posts_blocks_text_section USING btree (_order);


--
-- Name: blog_posts_blocks_text_section_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_text_section_parent_id_idx ON cms.blog_posts_blocks_text_section USING btree (_parent_id);


--
-- Name: blog_posts_blocks_text_section_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_text_section_path_idx ON cms.blog_posts_blocks_text_section USING btree (_path);


--
-- Name: blog_posts_blocks_video_embed_order_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_video_embed_order_idx ON cms.blog_posts_blocks_video_embed USING btree (_order);


--
-- Name: blog_posts_blocks_video_embed_parent_id_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_video_embed_parent_id_idx ON cms.blog_posts_blocks_video_embed USING btree (_parent_id);


--
-- Name: blog_posts_blocks_video_embed_path_idx; Type: INDEX; Schema: cms; Owner: -
--

CREATE INDEX IF NOT EXISTS blog_posts_blocks_video_embed_path_idx ON cms.blog_posts_blocks_video_embed USING btree (_path);


--
-- Name: _blog_posts_v_blocks_before_after_block_items _blog_posts_v_blocks_before_after_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_before_after_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_before_after_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_before_after_block _blog_posts_v_blocks_before_after_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_before_after_block
    ADD CONSTRAINT _blog_posts_v_blocks_before_after_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_benefits_block_items _blog_posts_v_blocks_benefits_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_benefits_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_benefits_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_benefits_block _blog_posts_v_blocks_benefits_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_benefits_block
    ADD CONSTRAINT _blog_posts_v_blocks_benefits_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_booking_form _blog_posts_v_blocks_booking_form_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_booking_form
    ADD CONSTRAINT _blog_posts_v_blocks_booking_form_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_content_grid_items _blog_posts_v_blocks_content_grid_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid_items
    ADD CONSTRAINT _blog_posts_v_blocks_content_grid_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_content_grid(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_content_grid _blog_posts_v_blocks_content_grid_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_content_grid
    ADD CONSTRAINT _blog_posts_v_blocks_content_grid_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_cta_block _blog_posts_v_blocks_cta_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_cta_block
    ADD CONSTRAINT _blog_posts_v_blocks_cta_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_data_table_columns _blog_posts_v_blocks_data_table_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_columns
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_data_table(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_data_table _blog_posts_v_blocks_data_table_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_data_table_rows_cells _blog_posts_v_blocks_data_table_rows_cells_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows_cells
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_rows_cells_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_data_table_rows(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_data_table_rows _blog_posts_v_blocks_data_table_rows_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_data_table_rows
    ADD CONSTRAINT _blog_posts_v_blocks_data_table_rows_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_data_table(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_doctors_embed _blog_posts_v_blocks_doctors_embed_filter_by_content_category_i; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_doctors_embed
    ADD CONSTRAINT _blog_posts_v_blocks_doctors_embed_filter_by_content_category_i FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: _blog_posts_v_blocks_doctors_embed _blog_posts_v_blocks_doctors_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_doctors_embed
    ADD CONSTRAINT _blog_posts_v_blocks_doctors_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_faqs_embed _blog_posts_v_blocks_faqs_embed_filter_by_content_category_id_c; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed
    ADD CONSTRAINT _blog_posts_v_blocks_faqs_embed_filter_by_content_category_id_c FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: _blog_posts_v_blocks_faqs_embed_inline_faqs _blog_posts_v_blocks_faqs_embed_inline_faqs_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed_inline_faqs
    ADD CONSTRAINT _blog_posts_v_blocks_faqs_embed_inline_faqs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_faqs_embed(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_faqs_embed _blog_posts_v_blocks_faqs_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_faqs_embed
    ADD CONSTRAINT _blog_posts_v_blocks_faqs_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_html_embed _blog_posts_v_blocks_html_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_html_embed
    ADD CONSTRAINT _blog_posts_v_blocks_html_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_image_slider_images _blog_posts_v_blocks_image_slider_images_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider_images
    ADD CONSTRAINT _blog_posts_v_blocks_image_slider_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_image_slider(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_image_slider _blog_posts_v_blocks_image_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_image_slider
    ADD CONSTRAINT _blog_posts_v_blocks_image_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_notice_block _blog_posts_v_blocks_notice_block__parent_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_notice_block
    ADD CONSTRAINT _blog_posts_v_blocks_notice_block__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_overview_block_paragraphs _blog_posts_v_blocks_overview_block_paragraphs_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block_paragraphs
    ADD CONSTRAINT _blog_posts_v_blocks_overview_block_paragraphs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_overview_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_overview_block _blog_posts_v_blocks_overview_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_overview_block
    ADD CONSTRAINT _blog_posts_v_blocks_overview_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_pricing_block _blog_posts_v_blocks_pricing_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans_features _blog_posts_v_blocks_pricing_block_plans_features_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans_features
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_plans_features_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_pricing_block_plans(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_pricing_block_plans _blog_posts_v_blocks_pricing_block_plans_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_pricing_block_plans
    ADD CONSTRAINT _blog_posts_v_blocks_pricing_block_plans_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_pricing_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_process_block _blog_posts_v_blocks_process_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block
    ADD CONSTRAINT _blog_posts_v_blocks_process_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_process_block_steps _blog_posts_v_blocks_process_block_steps_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_process_block_steps
    ADD CONSTRAINT _blog_posts_v_blocks_process_block_steps_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_process_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_stats_block_items _blog_posts_v_blocks_stats_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block_items
    ADD CONSTRAINT _blog_posts_v_blocks_stats_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v_blocks_stats_block(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_stats_block _blog_posts_v_blocks_stats_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_stats_block
    ADD CONSTRAINT _blog_posts_v_blocks_stats_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_technology _blog_posts_v_blocks_technology__parent_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_technology
    ADD CONSTRAINT _blog_posts_v_blocks_technology__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_technology _blog_posts_v_blocks_technology_image_upload_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_technology
    ADD CONSTRAINT _blog_posts_v_blocks_technology_image_upload_id_fkey FOREIGN KEY (image_upload_id) REFERENCES cms.media(id) ON DELETE SET NULL;


--
-- Name: _blog_posts_v_blocks_testimonials_embed _blog_posts_v_blocks_testimonials_embed_filter_by_content_categ; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_testimonials_embed
    ADD CONSTRAINT _blog_posts_v_blocks_testimonials_embed_filter_by_content_categ FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: _blog_posts_v_blocks_testimonials_embed _blog_posts_v_blocks_testimonials_embed_filter_by_treatment_id_; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_testimonials_embed
    ADD CONSTRAINT _blog_posts_v_blocks_testimonials_embed_filter_by_treatment_id_ FOREIGN KEY (filter_by_treatment_id) REFERENCES cms.blog_posts(id) ON DELETE SET NULL;


--
-- Name: _blog_posts_v_blocks_testimonials_embed _blog_posts_v_blocks_testimonials_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_testimonials_embed
    ADD CONSTRAINT _blog_posts_v_blocks_testimonials_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_text_section _blog_posts_v_blocks_text_section_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_text_section
    ADD CONSTRAINT _blog_posts_v_blocks_text_section_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: _blog_posts_v_blocks_video_embed _blog_posts_v_blocks_video_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms._blog_posts_v_blocks_video_embed
    ADD CONSTRAINT _blog_posts_v_blocks_video_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms._blog_posts_v(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_before_after_block_items blog_posts_blocks_before_after_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_before_after_block_items
    ADD CONSTRAINT blog_posts_blocks_before_after_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_before_after_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_before_after_block blog_posts_blocks_before_after_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_before_after_block
    ADD CONSTRAINT blog_posts_blocks_before_after_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_benefits_block_items blog_posts_blocks_benefits_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_benefits_block_items
    ADD CONSTRAINT blog_posts_blocks_benefits_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_benefits_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_benefits_block blog_posts_blocks_benefits_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_benefits_block
    ADD CONSTRAINT blog_posts_blocks_benefits_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_booking_form blog_posts_blocks_booking_form_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_booking_form
    ADD CONSTRAINT blog_posts_blocks_booking_form_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_content_grid_items blog_posts_blocks_content_grid_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_content_grid_items
    ADD CONSTRAINT blog_posts_blocks_content_grid_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_content_grid(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_content_grid blog_posts_blocks_content_grid_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_content_grid
    ADD CONSTRAINT blog_posts_blocks_content_grid_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_cta_block blog_posts_blocks_cta_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_cta_block
    ADD CONSTRAINT blog_posts_blocks_cta_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_data_table_columns blog_posts_blocks_data_table_columns_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_columns
    ADD CONSTRAINT blog_posts_blocks_data_table_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_data_table(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_data_table blog_posts_blocks_data_table_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table
    ADD CONSTRAINT blog_posts_blocks_data_table_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_data_table_rows_cells blog_posts_blocks_data_table_rows_cells_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_rows_cells
    ADD CONSTRAINT blog_posts_blocks_data_table_rows_cells_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_data_table_rows(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_data_table_rows blog_posts_blocks_data_table_rows_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_data_table_rows
    ADD CONSTRAINT blog_posts_blocks_data_table_rows_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_data_table(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_doctors_embed blog_posts_blocks_doctors_embed_filter_by_content_category_id_c; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_doctors_embed
    ADD CONSTRAINT blog_posts_blocks_doctors_embed_filter_by_content_category_id_c FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: blog_posts_blocks_doctors_embed blog_posts_blocks_doctors_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_doctors_embed
    ADD CONSTRAINT blog_posts_blocks_doctors_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_faqs_embed blog_posts_blocks_faqs_embed_filter_by_content_category_id_cont; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_faqs_embed
    ADD CONSTRAINT blog_posts_blocks_faqs_embed_filter_by_content_category_id_cont FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: blog_posts_blocks_faqs_embed_inline_faqs blog_posts_blocks_faqs_embed_inline_faqs_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_faqs_embed_inline_faqs
    ADD CONSTRAINT blog_posts_blocks_faqs_embed_inline_faqs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_faqs_embed(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_faqs_embed blog_posts_blocks_faqs_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_faqs_embed
    ADD CONSTRAINT blog_posts_blocks_faqs_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_html_embed blog_posts_blocks_html_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_html_embed
    ADD CONSTRAINT blog_posts_blocks_html_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_image_slider_images blog_posts_blocks_image_slider_images_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_image_slider_images
    ADD CONSTRAINT blog_posts_blocks_image_slider_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_image_slider(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_image_slider blog_posts_blocks_image_slider_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_image_slider
    ADD CONSTRAINT blog_posts_blocks_image_slider_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_notice_block blog_posts_blocks_notice_block__parent_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_notice_block
    ADD CONSTRAINT blog_posts_blocks_notice_block__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_overview_block_paragraphs blog_posts_blocks_overview_block_paragraphs_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_overview_block_paragraphs
    ADD CONSTRAINT blog_posts_blocks_overview_block_paragraphs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_overview_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_overview_block blog_posts_blocks_overview_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_overview_block
    ADD CONSTRAINT blog_posts_blocks_overview_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_pricing_block blog_posts_blocks_pricing_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block
    ADD CONSTRAINT blog_posts_blocks_pricing_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_pricing_block_plans_features blog_posts_blocks_pricing_block_plans_features_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block_plans_features
    ADD CONSTRAINT blog_posts_blocks_pricing_block_plans_features_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_pricing_block_plans(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_pricing_block_plans blog_posts_blocks_pricing_block_plans_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_pricing_block_plans
    ADD CONSTRAINT blog_posts_blocks_pricing_block_plans_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_pricing_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_process_block blog_posts_blocks_process_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_process_block
    ADD CONSTRAINT blog_posts_blocks_process_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_process_block_steps blog_posts_blocks_process_block_steps_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_process_block_steps
    ADD CONSTRAINT blog_posts_blocks_process_block_steps_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_process_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_stats_block_items blog_posts_blocks_stats_block_items_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_stats_block_items
    ADD CONSTRAINT blog_posts_blocks_stats_block_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts_blocks_stats_block(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_stats_block blog_posts_blocks_stats_block_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_stats_block
    ADD CONSTRAINT blog_posts_blocks_stats_block_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_technology blog_posts_blocks_technology__parent_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_technology
    ADD CONSTRAINT blog_posts_blocks_technology__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_technology blog_posts_blocks_technology_image_upload_id_fkey; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_technology
    ADD CONSTRAINT blog_posts_blocks_technology_image_upload_id_fkey FOREIGN KEY (image_upload_id) REFERENCES cms.media(id) ON DELETE SET NULL;


--
-- Name: blog_posts_blocks_testimonials_embed blog_posts_blocks_testimonials_embed_filter_by_content_category; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_testimonials_embed
    ADD CONSTRAINT blog_posts_blocks_testimonials_embed_filter_by_content_category FOREIGN KEY (filter_by_content_category_id) REFERENCES cms.content_categories(id) ON DELETE SET NULL;


--
-- Name: blog_posts_blocks_testimonials_embed blog_posts_blocks_testimonials_embed_filter_by_treatment_id_tre; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_testimonials_embed
    ADD CONSTRAINT blog_posts_blocks_testimonials_embed_filter_by_treatment_id_tre FOREIGN KEY (filter_by_treatment_id) REFERENCES cms.blog_posts(id) ON DELETE SET NULL;


--
-- Name: blog_posts_blocks_testimonials_embed blog_posts_blocks_testimonials_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_testimonials_embed
    ADD CONSTRAINT blog_posts_blocks_testimonials_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_text_section blog_posts_blocks_text_section_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_text_section
    ADD CONSTRAINT blog_posts_blocks_text_section_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_blocks_video_embed blog_posts_blocks_video_embed_parent_id_fk; Type: FK CONSTRAINT; Schema: cms; Owner: -
--

ALTER TABLE ONLY cms.blog_posts_blocks_video_embed
    ADD CONSTRAINT blog_posts_blocks_video_embed_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES cms.blog_posts(id) ON DELETE CASCADE;


--

COMMIT;
