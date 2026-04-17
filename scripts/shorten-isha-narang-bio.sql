-- Shorten Dr. Isha Narang's bio for the doctor detail page.
--
-- The existing bio (779 chars) packed in multiple biographical beats
-- (training, hospitals, specialties, society memberships) and read as
-- overlong copy on the profile page. This replaces it with a tighter
-- 3-sentence version that keeps the highest-signal credibility points:
-- international training, aesthetic + medical dermatology breadth, and
-- the core procedural expertise.
--
-- Idempotent: UPDATE-SET on a single row, plus mirror into the latest
-- version row so the Payload admin shows the new value without a
-- draft-vs-live divergence.

SET search_path TO cms, public;

BEGIN;

UPDATE cms.doctors
   SET bio = 'Dr. Isha Narang is a Consultant Dermatologist trained across leading institutes in India and the UK, with experience at top hospitals in Delhi and London. She specialises in aesthetic and medical dermatology — Botox, fillers, lasers, dermoscopy, and expert care across all skin types.'
 WHERE id = 198;

UPDATE cms._doctors_v
   SET version_bio = 'Dr. Isha Narang is a Consultant Dermatologist trained across leading institutes in India and the UK, with experience at top hospitals in Delhi and London. She specialises in aesthetic and medical dermatology — Botox, fillers, lasers, dermoscopy, and expert care across all skin types.'
 WHERE parent_id = 198
   AND latest = true;

COMMIT;
