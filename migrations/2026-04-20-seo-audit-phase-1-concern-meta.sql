-- Migration: Populate meta_title / meta_description / pageHeading on all
-- 10 concern pages. Copy taken verbatim from the SEO Content Audit §4.x.
-- Audit: Uncover-SEO-Content-Audit-Edits.docx (Apr-2026)
--
-- Why: every concern page was missing a meta description and had a title
-- that was just its raw name. The audit drafted per-page title + meta
-- copy to target the India-specific keywords the site wasn't ranking for
-- (hair fall, tan removal, pigmentation treatment, medical weight loss).
--
-- Column provenance:
--   meta_title / meta_description ← @payloadcms/plugin-seo (`meta` group)
--   page_heading                  ← concerns.pageHeading (H1)
--
-- Version draft tables (_concerns_v) are kept in sync at the end so the
-- Payload admin's "Versions" tab shows consistent state with published.
--
-- VERIFY before running:
--   \d cms.concerns      -- confirm columns: meta_title, meta_description, page_heading
--   \d cms._concerns_v   -- confirm columns: version_meta_title, version_meta_description, version_page_heading
--
-- Safe to re-run: every statement is a plain UPDATE matched by slug.

BEGIN;

-- =========================================================================
-- /concern/acne-scars  (§4.1)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Acne & Acne Scar Treatment in Delhi NCR | Dermatologist-Led | Uncover',
  meta_description = 'Dermatologist-led acne and acne scar treatment across Delhi, Gurgaon, and Noida. Fractional CO2, microneedling, and medical peels — personalised plans from 15+ specialists. Book a free consultation.',
  page_heading = 'Acne & Acne Scar Treatment — Dermatologist-Led Care, Delhi NCR'
WHERE slug = 'acne-scars';

-- =========================================================================
-- /concern/anti-aging  (§4.2)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Anti-Aging Treatment in Delhi NCR — Botox, Fillers, HIFU, Threadlifts | Uncover',
  meta_description = 'Dermatologist-led anti-aging treatments at Uncover — botox, dermal fillers, HIFU, threadlifts, GFC, skin boosters. Aging gracefully, backed by 15+ specialists. Free consultation in Delhi, Gurgaon, Noida.',
  page_heading = 'Anti-Aging Treatment — Fine Lines, Wrinkles & Volume Loss'
WHERE slug = 'anti-aging';

-- =========================================================================
-- /concern/skin-tanning  (§4.3)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Tan Removal & Skin Brightening Treatment in Delhi NCR | Uncover',
  meta_description = 'Dermatologist-led tan removal and de-tan treatments in Delhi, Gurgaon, Noida. Laser toning, Un-Tan glow peel, IV glow drips, HydraFacial. Safe for Indian skin types — book a free consultation.',
  page_heading = 'Tan Removal & Skin Brightening Treatment — Dermatologist-Led, Delhi NCR'
WHERE slug = 'skin-tanning';

-- =========================================================================
-- /concern/hyper-pigmentation  (§4.4)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Pigmentation Treatment for Melasma, Dark Spots & PIH | Uncover Delhi NCR',
  meta_description = 'Dermatologist-led pigmentation treatment for melasma, hyperpigmentation, dark spots, and PIH. Q-switch laser toning and medical peels safe for Indian skin. Book a free AI skin analysis.',
  page_heading = 'Pigmentation Treatment — Melasma, Dark Spots & Hyperpigmentation'
WHERE slug = 'hyper-pigmentation';

-- =========================================================================
-- /concern/feature-enhancement  (§4.5)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Facial Feature Enhancement — Lips, Cheeks, Jawline | Uncover Delhi NCR',
  meta_description = 'Non-surgical feature enhancement with dermal fillers, thread lifts, and injectables. Lip fillers, cheek fillers, jawline definition, non-surgical rhinoplasty. Dermatologist-led at 8 Uncover clinics in Delhi NCR.',
  page_heading = 'Feature Enhancement — Lips, Cheeks, Jawline & Non-Surgical Rhinoplasty'
WHERE slug = 'feature-enhancement';

-- =========================================================================
-- /concern/hair-loss-thinning  (§4.6)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Hair Fall & Hair Loss Treatment in Delhi NCR — GFC, PRP, FUE | Uncover',
  meta_description = 'Dermatologist-led hair fall and hair loss treatment at Uncover. GFC, PRP, QR678, mesotherapy, and FUE hair transplant. 15+ specialists, 8 clinics across Delhi, Gurgaon, Noida.',
  page_heading = 'Hair Fall & Hair Loss Treatment — Dermatologist-Led Care'
WHERE slug = 'hair-loss-thinning';

-- =========================================================================
-- /concern/baldness  (§4.7)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Baldness & Hair Transplant in Delhi NCR — FUE, GFC, QR678 | Uncover',
  meta_description = 'Dermatologist-led baldness treatment and FUE hair transplant at Uncover. GFC, QR678, and surgical restoration across 8 clinics in Delhi, Gurgaon, Noida. Honest evaluation, transparent pricing.',
  page_heading = 'Baldness & Hair Restoration — FUE Transplant, GFC, QR678'
WHERE slug = 'baldness';

-- =========================================================================
-- /concern/scalp-health  (§4.8)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Scalp Health & Dandruff Treatment in Delhi NCR | Uncover',
  meta_description = 'Dermatologist-led scalp health treatment at Uncover — dandruff, itchy scalp, oily scalp, scalp psoriasis. HydraFacial Keravive and prescription protocols across 8 clinics in Delhi NCR.',
  page_heading = 'Scalp Health & Dandruff Treatment — Dermatologist-Led'
WHERE slug = 'scalp-health';

-- =========================================================================
-- /concern/weight-management  (§4.9)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Medical Weight Loss Treatment in Delhi NCR — Non-Surgical & Doctor-Led | Uncover',
  meta_description = 'Dermatologist-led medical weight loss treatment at Uncover. Non-surgical body contouring with HIFU, EMS, RF, plus nutrition and prescription plans. 8 clinics Delhi, Gurgaon, Noida.',
  page_heading = 'Medical Weight Loss — Doctor-Led, Non-Surgical Program'
WHERE slug = 'weight-management';

-- =========================================================================
-- /concern/fat-loss  (§4.10)
-- =========================================================================
UPDATE cms.concerns
SET
  meta_title = 'Non-Surgical Fat Loss & Body Contouring in Delhi NCR | Uncover',
  meta_description = 'Non-invasive fat loss and body sculpting at Uncover — HIFU, EMS with RF, fat freezing and body contouring. Dermatologist-led across 8 clinics in Delhi, Gurgaon, Noida.',
  page_heading = 'Non-Surgical Fat Loss & Body Contouring'
WHERE slug = 'fat-loss';

-- =========================================================================
-- Version draft-tables sync — keep the "latest" published version row
-- matching the main row so Payload admin shows consistent state.
-- =========================================================================
UPDATE cms._concerns_v v
SET
  version_meta_title       = c.meta_title,
  version_meta_description = c.meta_description,
  version_page_heading     = c.page_heading
FROM cms.concerns c
WHERE v.parent_id = c.id
  AND v.latest = true
  AND c.slug IN (
    'acne-scars', 'anti-aging', 'skin-tanning', 'hyper-pigmentation',
    'feature-enhancement', 'hair-loss-thinning', 'baldness',
    'scalp-health', 'weight-management', 'fat-loss'
  );

COMMIT;
