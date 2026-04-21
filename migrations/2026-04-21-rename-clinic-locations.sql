-- Rename clinic display names to location-based labels, replace map links
-- with the correct cid=... URLs, and set rank_index so the ordering is
-- deterministic across the site (booking dropdown, /our-locations,
-- contact page, footer).
--
-- Slugs are intentionally NOT changed so existing /locations/<slug>
-- URLs remain live. Version table (_locations_v) mirrored so the
-- published draft matches the live record.

BEGIN;

-- 207 Greater Kailash 2
UPDATE cms.locations   SET name = 'Greater Kailash 2',         map_link = 'https://maps.google.com/maps?cid=5947412411060225970',  rank_index = 2, updated_at = now() WHERE id = 207;
UPDATE cms._locations_v SET version_name = 'Greater Kailash 2', version_map_link = 'https://maps.google.com/maps?cid=5947412411060225970', version_rank_index = 2, updated_at = now() WHERE parent_id = 207 AND latest = true;

-- 208 Preet Vihar
UPDATE cms.locations   SET name = 'Preet Vihar',               map_link = 'https://maps.google.com/maps?cid=6170828068373588269',  rank_index = 7, updated_at = now() WHERE id = 208;
UPDATE cms._locations_v SET version_name = 'Preet Vihar',       version_map_link = 'https://maps.google.com/maps?cid=6170828068373588269', version_rank_index = 7, updated_at = now() WHERE parent_id = 208 AND latest = true;

-- 209 Noida Sector 104
UPDATE cms.locations   SET name = 'Noida Sector 104',          map_link = 'https://maps.google.com/maps?cid=17847673064483764440', rank_index = 5, updated_at = now() WHERE id = 209;
UPDATE cms._locations_v SET version_name = 'Noida Sector 104',  version_map_link = 'https://maps.google.com/maps?cid=17847673064483764440', version_rank_index = 5, updated_at = now() WHERE parent_id = 209 AND latest = true;

-- 210 Lajpat Nagar
UPDATE cms.locations   SET name = 'Lajpat Nagar',              map_link = 'https://maps.google.com/maps?cid=1308031204415756887',  rank_index = 8, updated_at = now() WHERE id = 210;
UPDATE cms._locations_v SET version_name = 'Lajpat Nagar',      version_map_link = 'https://maps.google.com/maps?cid=1308031204415756887', version_rank_index = 8, updated_at = now() WHERE parent_id = 210 AND latest = true;

-- 211 Punjabi Bagh
UPDATE cms.locations   SET name = 'Punjabi Bagh',              map_link = 'https://maps.google.com/maps?cid=17216283740010271070', rank_index = 6, updated_at = now() WHERE id = 211;
UPDATE cms._locations_v SET version_name = 'Punjabi Bagh',      version_map_link = 'https://maps.google.com/maps?cid=17216283740010271070', version_rank_index = 6, updated_at = now() WHERE parent_id = 211 AND latest = true;

-- 212 Golf Course Road Gurgaon  (was Uncover GCR)
UPDATE cms.locations   SET name = 'Golf Course Road Gurgaon',  map_link = 'https://maps.google.com/maps?cid=5202888519009906969',  rank_index = 1, updated_at = now() WHERE id = 212;
UPDATE cms._locations_v SET version_name = 'Golf Course Road Gurgaon', version_map_link = 'https://maps.google.com/maps?cid=5202888519009906969', version_rank_index = 1, updated_at = now() WHERE parent_id = 212 AND latest = true;

-- 213 Gurgaon Sector 85  (was Uncover Iris Broadway)
UPDATE cms.locations   SET name = 'Gurgaon Sector 85',         map_link = 'https://maps.google.com/maps?cid=10441468069486663150', rank_index = 4, updated_at = now() WHERE id = 213;
UPDATE cms._locations_v SET version_name = 'Gurgaon Sector 85', version_map_link = 'https://maps.google.com/maps?cid=10441468069486663150', version_rank_index = 4, updated_at = now() WHERE parent_id = 213 AND latest = true;

-- 214 Gurgaon Sector 65
UPDATE cms.locations   SET name = 'Gurgaon Sector 65',         map_link = 'https://maps.google.com/maps?cid=2206283879156166691',  rank_index = 3, updated_at = now() WHERE id = 214;
UPDATE cms._locations_v SET version_name = 'Gurgaon Sector 65', version_map_link = 'https://maps.google.com/maps?cid=2206283879156166691', version_rank_index = 3, updated_at = now() WHERE parent_id = 214 AND latest = true;

-- Sanity: expect 8 rows with the new names in rank order
SELECT id, name, slug, rank_index, map_link FROM cms.locations ORDER BY rank_index;

COMMIT;
