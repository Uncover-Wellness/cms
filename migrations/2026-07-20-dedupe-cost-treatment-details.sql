BEGIN;

-- The Webflow importer was run repeatedly with random child-row IDs. Because
-- ON CONFLICT only saw the new IDs, each run appended another identical copy
-- of the four legacy treatment-detail rows. Retain one exact copy per parent.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        _parent_id,
        md5(COALESCE(heading::text, '')),
        md5(COALESCE(content::text, ''))
      ORDER BY id
    ) AS duplicate_number
  FROM cms.costs_treatment_details
)
DELETE FROM cms.costs_treatment_details AS detail
USING ranked
WHERE detail.id = ranked.id
  AND ranked.duplicate_number > 1;

-- Apply the same repair to stored versions so restoring a cost page cannot
-- reintroduce the duplicated sections.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        _parent_id,
        md5(COALESCE(heading::text, '')),
        md5(COALESCE(content::text, ''))
      ORDER BY id
    ) AS duplicate_number
  FROM cms._costs_v_version_treatment_details
)
DELETE FROM cms._costs_v_version_treatment_details AS detail
USING ranked
WHERE detail.id = ranked.id
  AND ranked.duplicate_number > 1;

COMMIT;
