-- Migration: Drop the SurveyQuestions collection tables
--
-- The frontend never consumed survey-questions (fetchSurveyQuestions in
-- uncover-astro has no callers) and the collection is also the source
-- of a recurring 400 in the CI build because versions/drafts are
-- disabled but the snapshot loader sends where[_status]=published.
--
-- Both cms.survey_questions and cms._survey_questions_v are empty
-- (0 rows), so dropping is lossless. CASCADE sweeps any FK / sequence /
-- index dependencies the _rels companion tables carry.
--
-- Paired with deletion of src/collections/SurveyQuestions.ts and its
-- import in payload.config.ts; after this migration + the CMS redeploy,
-- nothing references these tables.

BEGIN;

DROP TABLE IF EXISTS cms._survey_questions_v_rels CASCADE;
DROP TABLE IF EXISTS cms._survey_questions_v      CASCADE;
DROP TABLE IF EXISTS cms.survey_questions_rels    CASCADE;
DROP TABLE IF EXISTS cms.survey_questions         CASCADE;

COMMIT;
