-- Cleanup: drop orphan tables and enums from collections that are no longer
-- registered in payload.config.ts. These are leftovers from earlier iterations:
--
--   - Products, Skus, ProductCategories: removed from config entirely
--   - Media: no longer has `versions: { drafts: true }`, so _status column + _media_v table are stale
--   - SurveyQuestions: now has `drafts: false`, so _status column + _survey_questions_v tables are stale
--
-- These orphans cause Drizzle's schema-push TUI to show ambiguity prompts
-- ("is this new enum a rename of an existing one?") that can't be answered
-- non-interactively. Dropping them unblocks future schema pushes permanently.
--
-- Safe because: none of these tables/enums are referenced by active collections.
-- The data they hold (retail product catalog, old media status) is not used by
-- the current site or CMS config.

SET search_path TO cms, public;

BEGIN;

-- Drop orphan Products/Skus/ProductCategories tables (with CASCADE to
-- remove FKs in sibling _rels/_v/_v_rels tables).
DROP TABLE IF EXISTS cms._product_categories_v                         CASCADE;
DROP TABLE IF EXISTS cms._products_v                                   CASCADE;
DROP TABLE IF EXISTS cms._products_v_rels                              CASCADE;
DROP TABLE IF EXISTS cms._products_v_version_gallery_image_urls        CASCADE;
DROP TABLE IF EXISTS cms._skus_v                                       CASCADE;
DROP TABLE IF EXISTS cms._skus_v_version_additional_image_urls         CASCADE;
DROP TABLE IF EXISTS cms._skus_v_version_download_file_urls            CASCADE;
DROP TABLE IF EXISTS cms.product_categories                            CASCADE;
DROP TABLE IF EXISTS cms.products                                      CASCADE;
DROP TABLE IF EXISTS cms.products_gallery_image_urls                   CASCADE;
DROP TABLE IF EXISTS cms.products_rels                                 CASCADE;
DROP TABLE IF EXISTS cms.skus                                          CASCADE;
DROP TABLE IF EXISTS cms.skus_additional_image_urls                    CASCADE;
DROP TABLE IF EXISTS cms.skus_download_file_urls                       CASCADE;

-- Drop orphan Media version table (Media no longer has versions: drafts: true).
DROP TABLE IF EXISTS cms._media_v                                      CASCADE;

-- Drop orphan SurveyQuestions version tables (now has drafts: false).
DROP TABLE IF EXISTS cms._survey_questions_v                           CASCADE;
DROP TABLE IF EXISTS cms._survey_questions_v_rels                      CASCADE;

-- Drop orphan _status columns on media + survey_questions (they reference
-- orphan enums and aren't in the current config).
ALTER TABLE cms.media              DROP COLUMN IF EXISTS _status;
ALTER TABLE cms.survey_questions   DROP COLUMN IF EXISTS _status;

-- Drop the 12 orphan enums that triggered Drizzle's ambiguity prompt.
DROP TYPE IF EXISTS cms.enum__media_v_version_status                   CASCADE;
DROP TYPE IF EXISTS cms.enum__product_categories_v_version_status      CASCADE;
DROP TYPE IF EXISTS cms.enum__products_v_version_ec_product_type       CASCADE;
DROP TYPE IF EXISTS cms.enum__products_v_version_status                CASCADE;
DROP TYPE IF EXISTS cms.enum__skus_v_version_status                    CASCADE;
DROP TYPE IF EXISTS cms.enum__survey_questions_v_version_status        CASCADE;
DROP TYPE IF EXISTS cms.enum_media_status                              CASCADE;
DROP TYPE IF EXISTS cms.enum_product_categories_status                 CASCADE;
DROP TYPE IF EXISTS cms.enum_products_ec_product_type                  CASCADE;
DROP TYPE IF EXISTS cms.enum_products_status                           CASCADE;
DROP TYPE IF EXISTS cms.enum_skus_status                               CASCADE;
DROP TYPE IF EXISTS cms.enum_survey_questions_status                   CASCADE;

COMMIT;
