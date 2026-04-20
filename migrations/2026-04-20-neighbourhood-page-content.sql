-- Migration: Populate the 8 neighbourhood landing pages with copy + geo.
-- Audit: Uncover-SEO-Content-Audit-Edits.docx §6 Phase 1.
--
-- Fills the fields the /locations/[slug] route renders:
--   latitude, longitude     — geo derived from the clinic address
--   neighbourhood_intro     — 100–150 word unique intro per page
--   nearest_metro           — "<station> Metro (X min walk/drive)"
--   catchment_areas array   — nearby neighbourhoods served from this clinic
--   meta_title / meta_description / seo.pageTitle / seo.metaDescription
--
-- aggregate_rating is NOT set here — those numbers need per-clinic
-- verification against Google Business Profile before we schema-ship them
-- (Google penalises inflated aggregate rating claims).
--
-- Safe to re-run: UPDATEs by slug + DELETE+INSERT on catchment_areas.

BEGIN;

-- =========================================================================
-- Helper: reset catchment areas for these clinics first so we can rebuild
-- =========================================================================
DELETE FROM cms.locations_catchment_areas
WHERE _parent_id IN (
  SELECT id FROM cms.locations
  WHERE slug IN ('greater-kailash','lajpat-nagar','preet-vihar','punjabi-bagh','gcr-gurgaon','iris-broadway','65','noida')
);

-- =========================================================================
-- /locations/greater-kailash
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.5494,
  longitude = 77.2432,
  neighbourhood_intro = 'Uncover Greater Kailash is our flagship South Delhi clinic, located in GK II with easy access from GK I, Defence Colony, Lajpat Nagar, Kailash Colony, East of Kailash, and Nehru Place. Every visit begins with an AI skin analysis so your dermatologist can map pigmentation, pores, texture, hydration, and pollution damage before building a plan. We treat acne and scars, tan and pigmentation, hair loss and thinning, fine lines and volume loss, and body contouring — all with US-FDA approved laser and injectable technology, performed only by board-certified dermatologists.',
  nearest_metro = 'Kailash Colony Metro Station (Violet Line, 8 min drive)',
  meta_title = 'Best Skin Clinic in Greater Kailash — Laser Hair Removal, HydraFacial, Botox | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in GK II, South Delhi. Laser hair removal, HydraFacial, botox, fillers, hair transplant. Free AI skin analysis. Serving GK, Defence Colony, Lajpat Nagar.'
WHERE slug = 'greater-kailash';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Defence Colony'),
  (2, 'Lajpat Nagar'),
  (3, 'South Extension'),
  (4, 'Kailash Colony'),
  (5, 'East of Kailash'),
  (6, 'Nehru Place')
) AS v(ord, nm)
WHERE l.slug = 'greater-kailash';

-- =========================================================================
-- /locations/lajpat-nagar
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.5683,
  longitude = 77.2439,
  neighbourhood_intro = 'Uncover Lajpat Nagar sits on Feroze Gandhi Marg, Block A, serving patients from Lajpat Nagar I-IV, Amar Colony, Kailash Colony, Defence Colony, South Extension, and Greater Kailash. Every visit starts with an AI skin analysis so your plan is built on real data, not guesswork. We treat skin concerns (acne, scars, tan, melasma, aging), hair loss and baldness, and non-surgical body contouring — every treatment is performed by a board-certified dermatologist with US-FDA approved technology.',
  nearest_metro = 'Lajpat Nagar Metro Station (Pink / Violet Lines, 5 min drive)',
  meta_title = 'Best Skin Clinic in Lajpat Nagar — Laser Hair Removal, HydraFacial | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in Lajpat Nagar, Delhi. Laser hair removal, HydraFacial, botox, fillers, hair restoration. Free AI skin analysis. Serving South Ex, Defence Colony, GK.'
WHERE slug = 'lajpat-nagar';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Amar Colony'),
  (2, 'Kailash Colony'),
  (3, 'Defence Colony'),
  (4, 'South Extension'),
  (5, 'Greater Kailash')
) AS v(ord, nm)
WHERE l.slug = 'lajpat-nagar';

-- =========================================================================
-- /locations/preet-vihar
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.6415,
  longitude = 77.2988,
  neighbourhood_intro = 'Uncover Preet Vihar is our East Delhi clinic, serving Preet Vihar, Patparganj, Mayur Vihar, IP Extension, Vikas Marg, Laxmi Nagar, Shakarpur, and Anand Vihar. Every visit begins with an AI skin analysis so your dermatologist maps pigmentation, pores, texture and pollution damage before building a plan. We treat acne, scars, tan removal, pigmentation, hair fall and thinning, anti-aging, and non-surgical body contouring — always dermatologist-led with US-FDA approved technology.',
  nearest_metro = 'Preet Vihar Metro Station (Blue Line, 3 min walk)',
  meta_title = 'Best Skin Clinic in Preet Vihar, East Delhi — Laser Hair Removal | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in Preet Vihar, East Delhi. Laser hair removal, HydraFacial, botox, fillers, hair transplant. Serving Mayur Vihar, Patparganj, IP Extension, Anand Vihar.'
WHERE slug = 'preet-vihar';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Mayur Vihar'),
  (2, 'Patparganj'),
  (3, 'IP Extension'),
  (4, 'Vikas Marg'),
  (5, 'Laxmi Nagar'),
  (6, 'Anand Vihar')
) AS v(ord, nm)
WHERE l.slug = 'preet-vihar';

-- =========================================================================
-- /locations/punjabi-bagh
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.6740,
  longitude = 77.1353,
  neighbourhood_intro = 'Uncover Punjabi Bagh is our West Delhi clinic, located on Club Road, serving West and East Punjabi Bagh, Rajouri Garden, Tagore Garden, Moti Nagar, Paschim Vihar, Pitampura, and Shalimar Bagh. Every visit begins with an AI skin analysis. We treat skin and hair concerns as well as non-surgical body contouring — every plan is dermatologist-led and uses US-FDA approved technology.',
  nearest_metro = 'Shivaji Park Metro Station (Green Line, 5 min drive)',
  meta_title = 'Best Skin Clinic in Punjabi Bagh, West Delhi — Laser Hair Removal | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in Punjabi Bagh, West Delhi. Laser hair removal, HydraFacial, botox, fillers, hair restoration. Serving Rajouri Garden, Paschim Vihar, Pitampura.'
WHERE slug = 'punjabi-bagh';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Rajouri Garden'),
  (2, 'Tagore Garden'),
  (3, 'Moti Nagar'),
  (4, 'Paschim Vihar'),
  (5, 'Pitampura'),
  (6, 'Shalimar Bagh')
) AS v(ord, nm)
WHERE l.slug = 'punjabi-bagh';

-- =========================================================================
-- /locations/gcr-gurgaon  (Golf Course Road, DLF Phase 1)
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.4735,
  longitude = 77.0895,
  neighbourhood_intro = 'Uncover Golf Course Road is our flagship Gurgaon clinic, on the 3rd floor of A-14/9, DLF Phase 1. We serve Golf Course Road, DLF Phase 1-5, Cyber City, MG Road, Sushant Lok, and the surrounding Gurgaon Central catchment. Every visit begins with an AI skin analysis so your dermatologist can build a plan on real data. We cover the full range of dermatologist-led treatments — laser hair removal, HydraFacial, anti-aging (botox, fillers, HIFU, threadlifts), hair restoration (GFC, PRP, FUE), and non-surgical body contouring.',
  nearest_metro = 'Sikanderpur / Rapid Metro Phase 1 (5 min drive)',
  meta_title = 'Best Skin Clinic on Golf Course Road, Gurgaon — Laser Hair Removal | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic on Golf Course Road, DLF Phase 1, Gurgaon. Laser hair removal, HydraFacial, botox, fillers, hair transplant. Serving DLF Phases, Cyber City, MG Road.'
WHERE slug = 'gcr-gurgaon';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'DLF Phase 1'),
  (2, 'DLF Phase 2'),
  (3, 'DLF Phase 3'),
  (4, 'Cyber City'),
  (5, 'MG Road'),
  (6, 'Sushant Lok')
) AS v(ord, nm)
WHERE l.slug = 'gcr-gurgaon';

-- =========================================================================
-- /locations/iris-broadway  (Sector 85, New Town Heights)
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.4089,
  longitude = 77.0257,
  neighbourhood_intro = 'Uncover Iris Broadway in Sector 85, New Town Heights, serves Gurgaon''s fast-growing New Gurgaon belt — Sectors 82-90, New Town Heights, Sohna Road, and the Dwarka Expressway catchment. Every visit begins with an AI skin analysis. We offer the full range of dermatologist-led treatments using US-FDA approved technology — laser hair removal, HydraFacial, anti-aging injectables, hair restoration, and non-surgical body contouring.',
  nearest_metro = 'HUDA City Centre Metro (15 min drive)',
  meta_title = 'Best Skin Clinic in Sector 85 Gurgaon — Iris Broadway | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic at Iris Broadway, Sector 85, New Town Heights, Gurgaon. Laser hair removal, HydraFacial, botox, fillers, hair transplant. Free AI skin analysis.'
WHERE slug = 'iris-broadway';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Sector 82'),
  (2, 'Sector 83'),
  (3, 'Sector 86'),
  (4, 'New Town Heights'),
  (5, 'Dwarka Expressway'),
  (6, 'Sohna Road')
) AS v(ord, nm)
WHERE l.slug = 'iris-broadway';

-- =========================================================================
-- /locations/65  (Sector 65, AIPL Joy Central, Sohna Road)
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.3967,
  longitude = 77.0708,
  neighbourhood_intro = 'Uncover Sector 65 is located in AIPL Joy Central, serving Sohna Road, Sectors 56-67, Nirvana Country, Golf Course Extension Road, and the surrounding Gurgaon catchment. Every visit begins with an AI skin analysis so your dermatologist can build a data-driven plan. We offer laser hair removal, HydraFacial, anti-aging injectables (botox, fillers, HIFU), hair restoration (GFC, PRP, FUE), and non-surgical body contouring — all performed by board-certified dermatologists.',
  nearest_metro = 'HUDA City Centre Metro (12 min drive)',
  meta_title = 'Best Skin Clinic in Sector 65 Gurgaon — AIPL Joy Central | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in Sector 65, Gurgaon (AIPL Joy Central). Laser hair removal, HydraFacial, botox, fillers, hair transplant. Serving Sohna Road, Golf Course Extension.'
WHERE slug = '65';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Sohna Road'),
  (2, 'Sector 56'),
  (3, 'Sector 57'),
  (4, 'Sector 66'),
  (5, 'Nirvana Country'),
  (6, 'Golf Course Extension')
) AS v(ord, nm)
WHERE l.slug = '65';

-- =========================================================================
-- /locations/noida  (Sector 104)
-- =========================================================================
UPDATE cms.locations SET
  latitude = 28.5479,
  longitude = 77.3644,
  neighbourhood_intro = 'Uncover Noida is our Sector 104 clinic, serving Sectors 18, 50, 62, 104, 128, and Noida Expressway. We also see patients from Greater Noida, Indirapuram, Vaishali, and Ghaziabad. Every visit begins with an AI skin analysis. We treat skin concerns (acne, scars, tan, pigmentation, aging), hair loss and baldness, and offer non-surgical body contouring — dermatologist-led care with US-FDA approved technology.',
  nearest_metro = 'Sector 76 Noida Metro (Aqua Line, 8 min drive)',
  meta_title = 'Best Skin Clinic in Noida Sector 104 — Laser Hair Removal | Uncover',
  meta_description = 'Dermatologist-led skin, hair and body clinic in Sector 104, Noida. Laser hair removal, HydraFacial, botox, fillers, hair transplant. Serving Sectors 18, 50, 62, Greater Noida, Indirapuram.'
WHERE slug = 'noida';

INSERT INTO cms.locations_catchment_areas (id, _parent_id, _order, name)
SELECT gen_random_uuid()::text, l.id, ord, nm
FROM cms.locations l
CROSS JOIN (VALUES
  (1, 'Sector 18 Noida'),
  (2, 'Sector 50 Noida'),
  (3, 'Sector 62 Noida'),
  (4, 'Greater Noida'),
  (5, 'Indirapuram'),
  (6, 'Ghaziabad')
) AS v(ord, nm)
WHERE l.slug = 'noida';

-- =========================================================================
-- Version-table sync — mirror scalar fields onto latest draft row
-- =========================================================================
UPDATE cms._locations_v v
SET
  version_latitude = l.latitude,
  version_longitude = l.longitude,
  version_neighbourhood_intro = l.neighbourhood_intro,
  version_nearest_metro = l.nearest_metro,
  version_meta_title = l.meta_title,
  version_meta_description = l.meta_description
FROM cms.locations l
WHERE v.parent_id = l.id
  AND v.latest = true
  AND l.slug IN (
    'greater-kailash','lajpat-nagar','preet-vihar','punjabi-bagh',
    'gcr-gurgaon','iris-broadway','65','noida'
  );

COMMIT;
