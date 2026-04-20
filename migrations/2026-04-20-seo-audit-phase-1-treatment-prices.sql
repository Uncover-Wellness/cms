-- Migration: Populate missing "Starting at" prices on 3 treatment pages
-- Audit: Uncover-SEO-Content-Audit-Edits.docx (Apr-2026) §2 Issue 3, §5.1, §5.8, §5.9
--
-- Why: /treatment/wrinkle-relaxer, /treatment/skin-boosters and
-- /treatment/ems-with-rf were rendering "Starting Rs." with an empty
-- value — broke the homepage promise of "transparent pricing" and cost
-- ranking on "botox cost Delhi", "skin boosters cost", "EMSculpt cost".
--
-- Audit recommendations (§5.1, §5.8):
--   wrinkle-relaxer  → ₹8,999 per area
--   skin-boosters    → ₹14,999
--   ems-with-rf      → (not specified in audit — leave NULL; the astro
--                      layout now hides the chip when digits are missing)
--
-- The frontend renders `{details.startingPrice}` and strips any leading
-- "Starting" / "at" prefix, so the stored value should be the bare
-- "₹8,999" string (the "Starting at" label is added by the layout).
--
-- Column name: Payload maps `details.startingPrice` → `details_starting_price`.
--
-- VERIFY before running:
--   \d cms.treatments   -- confirm column `details_starting_price` exists
--   SELECT slug, details_starting_price FROM cms.treatments
--     WHERE slug IN ('wrinkle-relaxer', 'skin-boosters', 'ems-with-rf');

BEGIN;

UPDATE cms.treatments
SET details_starting_price = '₹8,999'
WHERE slug = 'wrinkle-relaxer';

UPDATE cms.treatments
SET details_starting_price = '₹14,999'
WHERE slug = 'skin-boosters';

-- ems-with-rf intentionally left NULL/blank — the layout hides the chip.
-- If you have an approved starting price, uncomment below and set:
-- UPDATE cms.treatments SET details_starting_price = '₹X,XXX' WHERE slug = 'ems-with-rf';

-- Version tables — keep the latest published version in sync
UPDATE cms._treatments_v v
SET version_details_starting_price = t.details_starting_price
FROM cms.treatments t
WHERE v.parent_id = t.id
  AND t.slug IN ('wrinkle-relaxer', 'skin-boosters')
  AND v.latest = true;

COMMIT;
