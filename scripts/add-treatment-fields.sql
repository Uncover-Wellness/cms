-- Adds new Treatments fields introduced in April 2026 to bring the Astro
-- layout into parity with uncover-gags:
--   * details.sessions  — free-text, e.g. "6-8"
--   * details.downtime  — free-text, e.g. "None", "2-3 days"
--   * relationships.linkedDoctors — many-to-many Treatments → Doctors
--
-- Must run against prod Postgres BEFORE deploying the CMS (push: false means
-- Payload won't auto-create these columns at runtime).
--
-- Idempotent: safe to re-run.

SET search_path TO cms, public;

BEGIN;

-- ─── Scalar fields on treatments.details ───────────────────────────────────
-- Payload also mirrors every row into `_treatments_v` with version_ prefixed
-- column names for drafts/autosave. Both tables must carry the new columns,
-- otherwise the admin edit view and drafts API 500 with
-- "column _treatments_v.version_details_sessions does not exist".
ALTER TABLE cms.treatments
  ADD COLUMN IF NOT EXISTS details_sessions varchar,
  ADD COLUMN IF NOT EXISTS details_downtime varchar;

ALTER TABLE cms._treatments_v
  ADD COLUMN IF NOT EXISTS version_details_sessions varchar,
  ADD COLUMN IF NOT EXISTS version_details_downtime varchar;

-- ─── Many-to-many join for linkedDoctors ─────────────────────────────
-- Payload stores polymorphic relationships on the collection's `_rels`
-- table with one FK column per target collection + a `path` discriminator.
-- We need to add `doctors_id` so Payload can persist and query linkedDoctors.
-- Without this column the API returns 500 on every treatment request.
--
-- Payload also mirrors every rels row into the VERSIONS table. Admin list
-- views and draft previews query `_treatments_v_rels`, so the column has
-- to exist there too — otherwise the Payload admin "Treatments" list
-- page renders blank with "error fetching the list view data".
ALTER TABLE cms.treatments_rels
  ADD COLUMN IF NOT EXISTS doctors_id integer REFERENCES cms.doctors(id) ON DELETE CASCADE;

ALTER TABLE cms._treatments_v_rels
  ADD COLUMN IF NOT EXISTS doctors_id integer REFERENCES cms.doctors(id) ON DELETE CASCADE;

COMMIT;
