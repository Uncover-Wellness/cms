-- Migration: Add @payloadcms/plugin-seo columns (meta_title, meta_description)
-- Required by: SEO plugin added in payload.config.ts
-- Run BEFORE deploying the CMS to Render
--
-- The SEO plugin adds a `meta` group field with `title` and `description`,
-- which Payload maps to `meta_title` and `meta_description` DB columns.
-- Version tables need `version_meta_title` and `version_meta_description`.

BEGIN;

-- ===== Main tables =====

-- Collections that already had hand-rolled seo fields (seo_page_title, seo_meta_description)
ALTER TABLE cms.treatments ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.treatments ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.concerns ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.concerns ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.doctors ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.doctors ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.blog_posts ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.blog_posts ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.costs ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.costs ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.service_categories ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.service_categories ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.blog_post_categories ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.blog_post_categories ADD COLUMN IF NOT EXISTS meta_description varchar;

-- Collections that had NO SEO fields before
ALTER TABLE cms.locations ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.locations ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.landing_pages ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.landing_pages ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.lps ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.lps ADD COLUMN IF NOT EXISTS meta_description varchar;

ALTER TABLE cms.job_openings ADD COLUMN IF NOT EXISTS meta_title varchar;
ALTER TABLE cms.job_openings ADD COLUMN IF NOT EXISTS meta_description varchar;

-- ===== Version tables =====

ALTER TABLE cms._treatments_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._treatments_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._concerns_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._concerns_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._doctors_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._doctors_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._blog_posts_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._blog_posts_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._costs_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._costs_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._service_categories_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._service_categories_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._blog_post_categories_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._blog_post_categories_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._locations_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._locations_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._landing_pages_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._landing_pages_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._lps_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._lps_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

ALTER TABLE cms._job_openings_v ADD COLUMN IF NOT EXISTS version_meta_title varchar;
ALTER TABLE cms._job_openings_v ADD COLUMN IF NOT EXISTS version_meta_description varchar;

-- Also add seo columns to version tables that are missing them
-- (locations_v and service_categories_v didn't have seo version columns)
ALTER TABLE cms._locations_v ADD COLUMN IF NOT EXISTS version_seo_page_title varchar;
ALTER TABLE cms._locations_v ADD COLUMN IF NOT EXISTS version_seo_meta_description varchar;

ALTER TABLE cms._service_categories_v ADD COLUMN IF NOT EXISTS version_seo_page_title varchar;
ALTER TABLE cms._service_categories_v ADD COLUMN IF NOT EXISTS version_seo_meta_description varchar;

COMMIT;
