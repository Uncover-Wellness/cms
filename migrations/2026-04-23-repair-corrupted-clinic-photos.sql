-- Migration: Repair cms.media rows 897 (Lajpat Nagar) and 898 (Preet Vihar)
-- that were corrupted by the r2Adapter variant-overwrite bug (fixed in
-- src/adapters/r2Adapter.ts). Before the fix, the adapter returned metadata
-- from every handleUpload call and the cloud-storage plugin spread-merged
-- them last-write-wins, so main-doc fields (filename, url) ended up as a
-- size-variant's values, and Payload's pre-stored .jpg variant filenames
-- never got rewritten to the .webp names the adapter actually put on R2.
--
-- Probed R2 to derive the correct filenames and content-lengths:
--   Uncover Preet Vihar.webp              → 146268 bytes   (200)
--   Uncover Preet Vihar-400x300.webp      →  14244 bytes   (200)
--   Uncover Preet Vihar-768x480.webp      →  33034 bytes   (200)
--   Uncover Preet Vihar-1440x810.webp     →  77042 bytes   (200)
--   Lajpat-Nagar-Clinic.webp              →  44826 bytes   (200)
--   Lajpat-Nagar-Clinic-400x300.webp      →  13608 bytes   (200)
--   Lajpat-Nagar-Clinic-768x480.webp      →  28118 bytes   (200)
--   Lajpat-Nagar-Clinic-1440x810.webp     →  404           (never uploaded)
--
-- Lajpat Nagar's hero variant was never generated (sizes_hero_* already
-- NULL); leaving it NULL — frontend reads clinicPhoto.url, not sizes.hero.
--
-- Width/height on the main docs are left as-is (768x480 / 1440x810 — the
-- surviving variant values) because the frontend sets explicit width/height
-- in the <img> tag and never reads these. Fixing them would require running
-- sharp against the R2 objects, which is out of scope for a data-repair
-- migration.

BEGIN;

-- =====================================================================
-- Preet Vihar (id=898)  — PNG source, all 4 variants on R2
-- =====================================================================
UPDATE cms.media
SET
  filename = 'Uncover Preet Vihar.webp',
  url      = '/api/media/file/Uncover%20Preet%20Vihar.webp',
  filesize = 146268,
  mime_type = 'image/webp',

  sizes_thumbnail_filename  = 'Uncover Preet Vihar-400x300.webp',
  sizes_thumbnail_url       = '/api/media/file/Uncover%20Preet%20Vihar-400x300.webp',
  sizes_thumbnail_mime_type = 'image/webp',
  sizes_thumbnail_filesize  = 14244,

  sizes_card_filename  = 'Uncover Preet Vihar-768x480.webp',
  sizes_card_url       = '/api/media/file/Uncover%20Preet%20Vihar-768x480.webp',
  sizes_card_mime_type = 'image/webp',
  sizes_card_filesize  = 33034,

  sizes_hero_filename  = 'Uncover Preet Vihar-1440x810.webp',
  sizes_hero_url       = '/api/media/file/Uncover%20Preet%20Vihar-1440x810.webp',
  sizes_hero_mime_type = 'image/webp',
  sizes_hero_filesize  = 77042,

  updated_at = now()
WHERE id = 898;

-- =====================================================================
-- Lajpat Nagar (id=897)  — WebP source, no hero variant generated
-- =====================================================================
UPDATE cms.media
SET
  filename = 'Lajpat-Nagar-Clinic.webp',
  url      = '/api/media/file/Lajpat-Nagar-Clinic.webp',
  filesize = 44826,
  mime_type = 'image/webp',

  -- thumbnail + card are already correctly named; just refresh actual filesizes
  sizes_thumbnail_filesize = 13608,
  sizes_card_filesize      = 28118,

  updated_at = now()
WHERE id = 897;

COMMIT;
