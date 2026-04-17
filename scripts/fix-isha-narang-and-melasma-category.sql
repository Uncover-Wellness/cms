-- Fix two data issues surfaced while porting the melasma blog post:
--
--   1. Dr. Isha Narang's jobTitle had her credentials crammed into it
--      ("MBBS, MD - Dermatology - 14+ Years Exp") instead of an actual
--      job title. Move credentials into the structured `education` array
--      so the blog author card can render them as pills, and restore the
--      jobTitle to a proper role.
--
--   2. The melasma blog post had no blogPostCategory set, so the Related
--      Articles section rendered empty (fetchRelatedBlogPosts returns []
--      when category is null). Assign it to the Skincare category.
--
-- Idempotent:
--   - doctor update is UPDATE-SET (no-op if already correct).
--   - education INSERT wipes existing rows for this doctor first, then
--     re-inserts the 5 canonical entries.
--   - blog_posts category UPDATE runs every time but is idempotent.
--
-- Populates both the live `cms.doctors_education` table and the
-- `cms._doctors_v_version_education` version mirror so the Payload admin
-- shows the new values without draft-vs-live divergence.

SET search_path TO cms, public;

BEGIN;

-- ── Dr. Isha Narang (id=198): fix jobTitle ─────────────────────────────────
UPDATE cms.doctors
   SET job_title = 'Senior Consultant Dermatologist & Hair Transplant Surgeon'
 WHERE id = 198;

-- Mirror into the latest version row for this doctor.
UPDATE cms._doctors_v
   SET version_job_title = 'Senior Consultant Dermatologist & Hair Transplant Surgeon'
 WHERE parent_id = 198
   AND latest = true;

-- ── Populate education pills (live) ────────────────────────────────────────
DELETE FROM cms.doctors_education WHERE _parent_id = 198;

INSERT INTO cms.doctors_education (id, _parent_id, _order, degree, institution, year, location) VALUES
  (gen_random_uuid()::text, 198, 1, 'MBBS',                   NULL, NULL, NULL),
  (gen_random_uuid()::text, 198, 2, 'MD Dermatology',         NULL, NULL, NULL),
  (gen_random_uuid()::text, 198, 3, 'DNB',                    NULL, NULL, NULL),
  (gen_random_uuid()::text, 198, 4, 'SCE (UK)',               NULL, NULL, NULL),
  (gen_random_uuid()::text, 198, 5, 'Imperial College London', NULL, NULL, NULL);

-- ── Mirror education pills into the version table ─────────────────────────
-- The version table uses a serial id, so we INSERT without specifying id and
-- delete/reinsert against the latest version parent.
DELETE FROM cms._doctors_v_version_education
 WHERE _parent_id IN (SELECT id FROM cms._doctors_v WHERE parent_id = 198);

INSERT INTO cms._doctors_v_version_education (_parent_id, _order, degree, institution, year, location, _uuid)
SELECT v.id, 1, 'MBBS', NULL, NULL, NULL, gen_random_uuid()::text FROM cms._doctors_v v WHERE v.parent_id = 198 AND v.latest = true
UNION ALL
SELECT v.id, 2, 'MD Dermatology', NULL, NULL, NULL, gen_random_uuid()::text FROM cms._doctors_v v WHERE v.parent_id = 198 AND v.latest = true
UNION ALL
SELECT v.id, 3, 'DNB', NULL, NULL, NULL, gen_random_uuid()::text FROM cms._doctors_v v WHERE v.parent_id = 198 AND v.latest = true
UNION ALL
SELECT v.id, 4, 'SCE (UK)', NULL, NULL, NULL, gen_random_uuid()::text FROM cms._doctors_v v WHERE v.parent_id = 198 AND v.latest = true
UNION ALL
SELECT v.id, 5, 'Imperial College London', NULL, NULL, NULL, gen_random_uuid()::text FROM cms._doctors_v v WHERE v.parent_id = 198 AND v.latest = true;

-- ── Melasma blog post (id=220): assign Skincare category (id=216) ─────────
UPDATE cms.blog_posts
   SET relationships_blog_post_category_id = 216
 WHERE id = 220;

UPDATE cms._blog_posts_v
   SET version_relationships_blog_post_category_id = 216
 WHERE parent_id = 220
   AND latest = true;

COMMIT;
