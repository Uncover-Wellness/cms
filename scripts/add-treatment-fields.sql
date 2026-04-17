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
ALTER TABLE cms.treatments
  ADD COLUMN IF NOT EXISTS details_sessions varchar,
  ADD COLUMN IF NOT EXISTS details_downtime varchar;

-- ─── Many-to-many join table for linkedDoctors (goes into _rels) ─────────
-- Payload stores polymorphic relationships in collection_rels tables with a
-- `path` column naming the field. No new table needed — just make sure the
-- rels table has an index on parent_id,path for efficient lookups.
-- Payload's relationship resolver reads by path='relationships.linkedDoctors'.

COMMIT;
