BEGIN;

ALTER TABLE cms.treatments
  ADD COLUMN IF NOT EXISTS include_in_llms boolean DEFAULT true;
ALTER TABLE cms._treatments_v
  ADD COLUMN IF NOT EXISTS version_include_in_llms boolean DEFAULT true;

ALTER TABLE cms.concerns
  ADD COLUMN IF NOT EXISTS include_in_llms boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS llms_optional boolean DEFAULT false;
ALTER TABLE cms._concerns_v
  ADD COLUMN IF NOT EXISTS version_include_in_llms boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS version_llms_optional boolean DEFAULT false;

ALTER TABLE cms.costs
  ADD COLUMN IF NOT EXISTS include_in_llms boolean DEFAULT true;
ALTER TABLE cms._costs_v
  ADD COLUMN IF NOT EXISTS version_include_in_llms boolean DEFAULT true;

-- Utility and locality-generated pages remain published, but are not part of
-- the curated LLM index.
UPDATE cms.treatments
SET include_in_llms = false, updated_at = NOW()
WHERE slug IN (
  'all-treatments',
  'hyperpigmentation-delhi',
  'hyperpigmentation-gurgaon',
  'hyperpigmentation-noida',
  'hyperpigmentation-faridabad',
  'hyperpigmentation-greater-noida',
  'hyperpigmentation-ghaziabad',
  'hyperpigmentation-dwarka-expressway',
  'hyperpigmentation-golf-course-road',
  'hyperpigmentation-sohna-road',
  'hyperpigmentation-golf-course-extension'
);

-- Keep specific concern pages discoverable without presenting overlapping
-- parent/child concepts as separate primary entities.
UPDATE cms.concerns
SET llms_optional = true, updated_at = NOW()
WHERE slug IN (
  'acne', 'scars',
  'baldness', 'hair-loss', 'hair-thinning',
  'weight-loss',
  'fat-reduction', 'spot-fat-reduction', 'body-contouring',
  'skin-tags', 'warts', 'moles', 'corns', 'skin-lesions',
  'oily-flaky-scalp'
);

-- This page falls outside the site's skin, hair and body taxonomy.
UPDATE cms.costs
SET include_in_llms = false, updated_at = NOW()
WHERE slug = 'piles-laser-treatment';

-- Preserve the field's meaning (average cost) while standardizing display.
UPDATE cms.costs
SET pricing_average_cost = '₹' || REGEXP_REPLACE(
  pricing_average_cost,
  '^(Rs\.\s*|₹\s*)',
  '',
  'i'
),
updated_at = NOW()
WHERE pricing_average_cost IS NOT NULL
  AND pricing_average_cost <> '';

UPDATE cms._costs_v
SET version_pricing_average_cost = '₹' || REGEXP_REPLACE(
  version_pricing_average_cost,
  '^(Rs\.\s*|₹\s*)',
  '',
  'i'
)
WHERE version_pricing_average_cost IS NOT NULL
  AND version_pricing_average_cost <> '';

-- Carry curation state into existing versions so restoring an older version
-- does not silently reintroduce excluded records.
UPDATE cms._treatments_v AS version
SET version_include_in_llms = current.include_in_llms
FROM cms.treatments AS current
WHERE version.parent_id = current.id;

UPDATE cms._concerns_v AS version
SET version_include_in_llms = current.include_in_llms,
    version_llms_optional = current.llms_optional
FROM cms.concerns AS current
WHERE version.parent_id = current.id;

UPDATE cms._costs_v AS version
SET version_include_in_llms = current.include_in_llms
FROM cms.costs AS current
WHERE version.parent_id = current.id;

COMMIT;
