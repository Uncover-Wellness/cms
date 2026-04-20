-- Migration: Populate inline FAQs on every concern page's existing
-- `faqsEmbed` page-block. Copy comes verbatim from the SEO Content Audit
-- §4.1–§4.10 (where the audit supplied full Q/A copy) and from audit-
-- tone drafts for concerns where the audit only supplied prompts
-- (baldness, scalp-health, weight-management).
-- Audit: Uncover-SEO-Content-Audit-Edits.docx (Apr-2026)
--
-- Why: every concern page was serving the "test-faq / test answer"
-- placeholder the audit flagged as CRITICAL. The astro code fix stopped
-- the placeholder from being rendered, but this migration now populates
-- real, schema-ready FAQ copy so each concern page earns FAQPage JSON-LD
-- (which the ConcernLayout already emits once `faqs.length > 0`).
--
-- Approach: each concern has exactly one `faqsEmbed` block in its
-- `pageBlocks` array (verified 2026-04-20 via the public API). We delete
-- any existing `inlineFaqs` array rows on that block, then insert the
-- new ones in order.
--
-- *** IMPORTANT — VERIFY TABLE NAMES BEFORE RUNNING ***
-- Payload's Postgres adapter auto-generates table names from field paths.
-- Run these `\d` commands first and confirm the names match before
-- executing the migration body.
--
--   \d cms.concerns_blocks_faqs_embed
--     -- expected columns: _order, _parent_id, _path, id, eyebrow,
--     -- heading, filter_by_content_category_id, block_name
--
--   \d cms.concerns_blocks_faqs_embed_inline_faqs
--     -- expected columns: _order, _parent_id, id, question, answer
--
-- If Payload generated different names (e.g. `faqs_embed` without the
-- underscored `_` between words, or a `_parent_block_id` column name),
-- sed-replace them throughout this file before running.
--
-- Version draft tables: Payload stores draft versions in `_concerns_v`
-- with a companion `_concerns_v_blocks_faqs_embed` and
-- `_concerns_v_blocks_faqs_embed_inline_faqs`. The bottom of this
-- migration also refreshes the latest-draft block so the admin UI's
-- Versions tab shows the same FAQs. Confirm those exist with:
--   \d cms._concerns_v_blocks_faqs_embed_inline_faqs

BEGIN;


-- ===== /concern/acne-scars (8 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'acne-scars' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'acne-scars' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'How many sessions of acne scar treatment will I need?', 'Most patients need 4–6 sessions of fractional CO2 laser or RF microneedling spaced 4–6 weeks apart. Ice pick and deep boxcar scars often need the longer end of that range. Your dermatologist will map the mix of scar types on your skin and give you a session count at your AI skin analysis.'),
  ((SELECT block_id FROM block), 2, 'What is the best treatment for acne scars on Indian skin?', 'On Indian skin (Fitzpatrick III–V), we prefer treatments with a low risk of post-inflammatory hyperpigmentation: RF microneedling, subcision, TCA CROSS for ice pick scars, and fractional CO2 at conservative settings. Q-switch laser toning is commonly added to address PIH (dark marks) alongside the scar itself.'),
  ((SELECT block_id FROM block), 3, 'How much does acne scar removal cost in Delhi?', 'Acne scar treatments at Uncover start at ₹10,999 for microneedling and ₹15,999 for advanced protocols. Fractional CO2 and combination plans are quoted after the consultation because they depend on scar type and area. We share a full itemised plan before you commit.'),
  ((SELECT block_id FROM block), 4, 'Can acne scars be permanently removed?', 'Most acne scars can be reduced by 60–80% with a structured plan. Ice pick and severe atrophic scars rarely go to 100%, but they can be smoothed enough that they are no longer noticeable in everyday lighting. Hypertrophic and keloid scars can be flattened dramatically with intralesional steroids and pulsed-dye laser.'),
  ((SELECT block_id FROM block), 5, 'Is laser treatment for acne scars safe?', 'Yes, when performed by a dermatologist. Every laser at Uncover is US-FDA approved, and every treatment is planned based on your Fitzpatrick skin type and scar pattern. We do a test spot for patients with darker skin before the first full session.'),
  ((SELECT block_id FROM block), 6, 'What is the difference between acne scars and post-inflammatory hyperpigmentation?', 'Acne scars are changes in skin texture (pits, bumps, depressions). PIH is the flat brown or red mark left after an acne lesion heals — it''s pigment, not scarring. PIH usually fades with laser toning and medical peels; true scars need collagen-stimulating treatments like microneedling or fractional CO2.'),
  ((SELECT block_id FROM block), 7, 'Can I do an acne scar treatment while I still have active acne?', 'Active acne has to be controlled first — treating scars on skin with active inflammation can worsen both. Your dermatologist will get the active breakouts under control (usually 4–8 weeks) before starting the scar phase of your plan.'),
  ((SELECT block_id FROM block), 8, 'How soon will I see results?', 'Visible improvement begins around weeks 4–6 as collagen remodelling kicks in. Peak results appear 3–6 months after the last session. We book a review at 90 days to re-assess and fine-tune the plan.');

-- ===== /concern/anti-aging (8 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'anti-aging' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'anti-aging' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'At what age should I start anti-aging treatments?', 'Preventative care (sunscreen, retinoids, professional facials) starts in your 20s. Wrinkle relaxers (botox) are typically introduced from the late 20s for dynamic lines on the forehead. Collagen-stimulating treatments like GFC, skin boosters, and microneedling work well from the early 30s. The best age to start is the age at which you can commit to consistency.'),
  ((SELECT block_id FROM block), 2, 'How long does botox last?', 'Wrinkle relaxers typically last 3–4 months on forehead and crow''s feet, and up to 6 months for jawline slimming. Results last longer with consistent treatment — after 12–18 months of regular sessions, most patients find they need fewer units per visit.'),
  ((SELECT block_id FROM block), 3, 'Is botox safe?', 'Wrinkle relaxers have an exceptional safety record when administered by a dermatologist. Every injection at Uncover uses US-FDA approved products and is delivered by a board-certified dermatologist, not a technician.'),
  ((SELECT block_id FROM block), 4, 'What is the difference between botox and fillers?', 'Wrinkle relaxers (botox) relax muscles that cause dynamic lines — good for expression lines on the forehead, between the brows, and at the corners of the eyes. Dermal fillers restore lost volume and smooth static lines — good for cheeks, lips, under-eyes, and nasolabial folds. Many patients use both for a layered result.'),
  ((SELECT block_id FROM block), 5, 'How much does anti-aging treatment cost at Uncover?', 'Wrinkle relaxers start from ₹8,999 per area. Dermal fillers start from ₹14,999 for hydration fillers and ₹29,999 for volume/shape fillers. HIFU starts at ₹24,999. The full plan is itemised at consultation.'),
  ((SELECT block_id FROM block), 6, 'What is the best non-surgical facelift treatment?', 'HIFU (High-Intensity Focused Ultrasound) and thread lifts are the two leading non-surgical facelift options. HIFU uses ultrasound to stimulate collagen in the deep dermis; threads provide immediate mechanical lift. For many patients, a combination works best — your dermatologist will recommend based on your skin laxity pattern.'),
  ((SELECT block_id FROM block), 7, 'Can I combine multiple anti-aging treatments in one sitting?', 'Yes, with planning. We commonly combine wrinkle relaxers + skin boosters, or microneedling + GFC, in a single visit. Larger combinations (HIFU + fillers, for example) are staged 2–4 weeks apart to manage recovery.'),
  ((SELECT block_id FROM block), 8, 'Will I look "done" or unnatural?', 'Not if the plan is conservative. At Uncover, our philosophy is refresh, never alter. We tend to under-treat on the first visit and add more at review, rather than the other way around.');

-- ===== /concern/skin-tanning (8 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'skin-tanning' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'skin-tanning' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'What is the best tan removal treatment?', 'For most Indian skin types, laser toning is the fastest and safest medical option — it breaks up the pigment that tanning deposits in the skin and evens tone across the face and body. For a lighter, faster result, an Un-Tan Glow Peel or IV Glow Drip pairs well with laser toning.'),
  ((SELECT block_id FROM block), 2, 'Can laser remove tan permanently?', 'Laser removes the current tan permanently — but if you go back to unprotected sun exposure, you''ll tan again. The fix is a combined plan: laser toning to reverse existing tan, plus a daily SPF 50 protocol that your dermatologist will build with you.'),
  ((SELECT block_id FROM block), 3, 'How many sessions do I need for tan removal?', 'Most patients see visible results after 2 sessions and reach their goal in 4–6 sessions, spaced 2–3 weeks apart. Deeper and long-standing tans (frequent outdoor exposure, athletes, brides pre-wedding) may need 6–8.'),
  ((SELECT block_id FROM block), 4, 'How much does tan removal cost in Delhi?', 'Laser toning at Uncover starts from ₹7,999 per session. Un-Tan Glow Peel and IV Glow Drips are priced separately — your dermatologist will build a combined package during the AI skin analysis.'),
  ((SELECT block_id FROM block), 5, 'Is tan removal safe for dark / Indian skin?', 'Yes, when done by a dermatologist with the right settings. At Uncover we use Q-switched Nd:YAG for all Indian skin types, which is the safest wavelength for pigmented skin. We do a test spot first if you have Fitzpatrick V or VI.'),
  ((SELECT block_id FROM block), 6, 'What is the difference between tan and pigmentation?', 'Tan is your skin''s temporary, even-toned response to UV. Pigmentation (melasma, PIH, sun spots) is patchy, uneven, and often triggered by hormones alongside UV. They need different treatment protocols, which is why we diagnose with an AI skin analysis before deciding.'),
  ((SELECT block_id FROM block), 7, 'Can I do tan removal before my wedding?', 'Yes — we regularly build 8–12 week pre-wedding plans that combine laser toning, medical de-tan, and HydraFacial. Start 3 months before the wedding for the best result.'),
  ((SELECT block_id FROM block), 8, 'Are there side effects?', 'Temporary redness and mild warmth for 1–2 hours post-session. No downtime. Strict sunscreen use between sessions is required to protect the result.');

-- ===== /concern/hyper-pigmentation (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'What is the best treatment for pigmentation on Indian skin?', 'For most Indian skin types, Q-switch laser toning is the first-line treatment for melasma, PIH, and general uneven tone. We add medical peels and prescription topicals to accelerate the result. For deep, stubborn pigmentation, we add fractional lasers after a test spot.'),
  ((SELECT block_id FROM block), 2, 'How many sessions are needed for pigmentation treatment?', 'Melasma typically needs 6–10 laser toning sessions, spaced 2–3 weeks apart, plus a prescription maintenance plan. PIH and sun spots usually clear in 4–6 sessions. Your dermatologist maps the plan after the AI skin analysis.'),
  ((SELECT block_id FROM block), 3, 'Can pigmentation be removed permanently?', 'Sun spots, PIH, and freckles can be cleared to near-invisible and stay cleared with sunscreen. Melasma is chronic — we can reduce it by 70–90% and maintain with a prescription protocol, but it can flare with sun, hormones, and pregnancy.'),
  ((SELECT block_id FROM block), 4, 'How much does pigmentation treatment cost in Delhi?', 'Laser toning starts from ₹7,999 per session. Q-switch laser, medical peels, and topical prescription plans are quoted together at consultation. We share a full itemised plan before you commit.'),
  ((SELECT block_id FROM block), 5, 'What is the difference between melasma and hyperpigmentation?', 'Hyperpigmentation is the umbrella term for any dark patch. Melasma is a specific subtype — symmetrical, hormonal, and triggered by UV. PIH is post-inflammatory darkening (often after acne). Sun spots are UV-driven lesions. Each responds differently, which is why diagnosis matters.'),
  ((SELECT block_id FROM block), 6, 'Are pigmentation treatments safe for dark skin?', 'Yes, at the right settings. We use Q-switched Nd:YAG for Indian skin types III–VI, which is the safest pigment-specific wavelength. Every plan starts with a test spot if your Fitzpatrick is IV or higher.');

-- ===== /concern/feature-enhancement (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'feature-enhancement' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'feature-enhancement' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'How much does a lip filler cost in Delhi?', 'Lip fillers at Uncover start from ₹14,999 for a 1ml hydration-focused filler and ₹29,999 for a volume or shape filler. Price depends on the product, the volume needed, and whether it''s a first session or a top-up.'),
  ((SELECT block_id FROM block), 2, 'How long do fillers last?', 'Lip and tear trough fillers typically last 9–12 months. Cheek and jawline fillers last 12–18 months. Longevity depends on filler type, placement, and lifestyle (metabolism, exercise, sun exposure).'),
  ((SELECT block_id FROM block), 3, 'Is non-surgical rhinoplasty safe?', 'Yes, when performed by a dermatologist with advanced filler training. We use reversible hyaluronic acid fillers to correct bumps, improve tip projection, and refine asymmetry. If you ever want to reverse the result, we can dissolve it completely with hyaluronidase.'),
  ((SELECT block_id FROM block), 4, 'Will I look "done" after fillers?', 'Not with our protocol. We under-fill on the first visit and ask you back at 2 weeks to add more if needed. Most patients land in a place where friends notice you look refreshed but can''t place why.'),
  ((SELECT block_id FROM block), 5, 'Are fillers reversible?', 'Hyaluronic acid fillers — yes, with a small injection of hyaluronidase. Collagen-stimulating fillers (like Sculptra) are not reversible, which is why we plan them more conservatively.'),
  ((SELECT block_id FROM block), 6, 'What''s the difference between fillers and fat transfer?', 'Fillers are pre-manufactured, immediate, reversible, and dermatologist-administered in a 30-minute outpatient session. Fat transfer is surgical, uses your own tissue, takes longer to recover, and is done by plastic surgeons. Uncover offers fillers only.');

-- ===== /concern/hair-loss-thinning (8 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'How to stop hair fall immediately?', 'Short-term: address reversible triggers — iron and vitamin D deficiency, recent illness, crash diets, stress, tight hairstyles. Medium-term: start a dermatologist-supervised plan (GFC, PRP, topical minoxidil, or medical shampoos). There is no single overnight fix — but the right combined protocol can slow active fall within 4–8 weeks.'),
  ((SELECT block_id FROM block), 2, 'What is the difference between PRP and GFC for hair?', 'Both use your own blood. PRP is processed once and contains platelets plus growth factors. GFC (Growth Factor Concentrate) is processed twice — the second step isolates only the concentrated growth factors, without red blood cells or other components. GFC tends to be cleaner, more comfortable, and typically produces faster, more consistent results in our experience. Your dermatologist will choose based on your hair loss stage.'),
  ((SELECT block_id FROM block), 3, 'How much does hair fall treatment cost in Delhi?', 'GFC starts from ₹5,399 per session (4–6 sessions needed). PRP is similar. QR678 is ₹8,000–₹12,000 per session. FUE hair transplants start from ₹85,000 + GST. Pricing varies by graft count and scalp area — your dermatologist will give you an itemised plan.'),
  ((SELECT block_id FROM block), 4, 'Is female hair loss treatable?', 'Yes. Female pattern hair loss, postpartum hair fall, PCOS-driven thinning, and traction alopecia all respond to a dermatologist-supervised plan. The earlier we start, the better the result — so get evaluated the moment you notice more hair on the pillow or in the shower drain.'),
  ((SELECT block_id FROM block), 5, 'How do I know if I need a hair transplant?', 'Not every hair loss case needs a transplant. Transplants are indicated when follicles in the affected area have miniaturised beyond medical rescue — typically Norwood 3+ for men, or defined receding hairlines. We''ll do a medical evaluation and only recommend a transplant if non-surgical options (GFC, PRP, medical therapy) won''t deliver the density you want.'),
  ((SELECT block_id FROM block), 6, 'Can postpartum hair loss be reversed?', 'Yes — postpartum hair fall is self-limiting for most women and resolves 6–12 months after birth. We can accelerate the return to baseline with GFC, nutritional supplementation, and HydraFacial Keravive scalp therapy.'),
  ((SELECT block_id FROM block), 7, 'Is hair regrowth treatment permanent?', 'Results are maintained as long as you maintain the protocol. After the loading phase (4–6 sessions of GFC/PRP), we typically move to a maintenance schedule of one session every 3–4 months plus topical therapy. Transplanted hair from a FUE procedure is permanent by nature.'),
  ((SELECT block_id FROM block), 8, 'Why should I choose Uncover for hair loss treatment?', 'Every plan at Uncover is dermatologist-led, not technician-led. Every consultation starts with an AI scalp analysis — not a visual guess. And every protocol is structured, reviewed, and adjusted across follow-ups, backed by 15+ specialists across 8 clinics in Delhi NCR.');

-- ===== /concern/fat-loss (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'fat-loss' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'fat-loss' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'Is non-surgical fat loss as effective as liposuction?', 'For small-to-moderate fat deposits and stubborn areas, yes — modern non-surgical tech (HIFU, EMS with RF, fat freezing) delivers 20–30% fat reduction per series with no surgery, no anaesthesia, and no downtime. For larger volumes, liposuction is still faster. At Uncover we''ll tell you honestly which route fits your goal.'),
  ((SELECT block_id FROM block), 2, 'Does Uncover offer CoolSculpting or fat freezing?', 'We offer non-invasive fat reduction using HIFU, which uses focused ultrasound to target and break down fat cells, and EMS with RF, which combines muscle stimulation with radiofrequency. Both are US-FDA approved platforms that achieve outcomes comparable to cryolipolysis. Your dermatologist will recommend based on your body area and goal.'),
  ((SELECT block_id FROM block), 3, 'How many sessions for visible inch loss?', 'Most patients see measurable inch loss after 4 sessions. A full series is typically 6–8 sessions for the abdomen, flanks, thighs, or upper arms. EMS-based muscle toning sees quicker visible results (tone and definition) than fat freezing (which takes 6–12 weeks to fully show).'),
  ((SELECT block_id FROM block), 4, 'How much does non-surgical fat loss cost?', 'EMS with RF and HIFU-based body contouring are quoted per area and per session — plans typically range ₹8,000–₹25,000 per session depending on the device, area size, and number of applicators. We build a full package at consultation.'),
  ((SELECT block_id FROM block), 5, 'Is fat loss treatment safe?', 'Yes, when performed on a dermatologist-led plan with US-FDA approved devices. The most common side effects are temporary redness, tingling, and mild soreness. Serious adverse events are rare.'),
  ((SELECT block_id FROM block), 6, 'Can I lose weight with body contouring treatments?', 'Body contouring reduces fat in specific areas — it is not a weight-loss solution. For overall weight loss, we combine non-surgical body contouring with our medical weight management program (nutrition, prescription medication where indicated, and accountability).');

-- ===== /concern/baldness (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'baldness' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'baldness' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'What causes baldness?', 'Most male and female pattern baldness is driven by genetics and androgen sensitivity — follicles miniaturise over time and stop producing pigmented hair. Stress, nutritional deficiencies, thyroid issues, and autoimmune conditions can accelerate the process. Your dermatologist will trace the cause with a scalp exam and blood work before recommending treatment.'),
  ((SELECT block_id FROM block), 2, 'FUE vs DHI — which is better?', 'FUE (Follicular Unit Extraction) and DHI (Direct Hair Implantation) both transplant individual follicles; the difference is the implantation tool. FUE is more established with predictable results at any graft count. DHI uses a Choi pen implanter which can give denser packing in small sessions but is slower on large cases. At Uncover we perform FUE for its consistency and scar profile.'),
  ((SELECT block_id FROM block), 3, 'How much does a hair transplant cost in Delhi?', 'FUE hair transplants at Uncover start from ₹85,000 + GST, scaled by graft count and the scalp area being restored. Most cases fall in the ₹85,000–₹2,50,000 range. We share a detailed graft plan and itemised quote at consultation so there are no surprises.'),
  ((SELECT block_id FROM block), 4, 'What is the success rate of FUE hair transplants?', 'With correctly-selected candidates (sufficient donor density, stabilised hair loss, realistic goals), 90–95% of transplanted grafts survive and produce permanent hair. Success depends more on case selection and surgical technique than on the platform; that is why every case at Uncover is assessed by a board-certified dermatologist, not a technician.'),
  ((SELECT block_id FROM block), 5, 'How long is recovery after a hair transplant?', 'Patients leave the clinic the same day. Swelling typically resolves in 3–5 days, scabs clear in 7–10 days, and most return to office work after 2–3 days. Transplanted hairs shed at around week 3 and regrow from month 3; the final result is visible at 9–12 months.'),
  ((SELECT block_id FROM block), 6, 'Can women get a hair transplant?', 'Yes, in the right cases. Female pattern hair loss often responds well to medical therapy first (GFC, PRP, topical minoxidil, QR678). Transplants are reserved for women with defined recession, traction alopecia scars, or post-surgical density loss. We only recommend surgery after a full medical evaluation.');

-- ===== /concern/scalp-health (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'scalp-health' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'scalp-health' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'What causes dandruff?', 'Dandruff is driven by Malassezia, a yeast that lives on everyones scalp but overgrows in oily or sensitive skin. Stress, hormonal shifts, climate, and product build-up accelerate it. Most cases respond to a 4–6 week medical shampoo protocol alongside HydraFacial Keravive scalp therapy.'),
  ((SELECT block_id FROM block), 2, 'Why is my scalp so itchy?', 'Itchy scalp most commonly comes from seborrhoeic dermatitis (the same trigger as dandruff), product sensitivity, or scalp psoriasis. Fungal infections and allergic contact dermatitis are less common but treatable. A dermatologist can identify the cause with a scalp exam — dont keep buying shampoos until you know.'),
  ((SELECT block_id FROM block), 3, 'When should I see a dermatologist for scalp issues?', 'See a dermatologist if: flaking or itching persists past 4 weeks of over-the-counter anti-dandruff shampoo, you notice scalp pain or tenderness, patches of hair loss appear, or you see red, scaly, well-defined plaques (scalp psoriasis). Early diagnosis prevents long-term follicle damage.'),
  ((SELECT block_id FROM block), 4, 'How is scalp psoriasis treated?', 'Scalp psoriasis responds best to a staged plan: medicated shampoos to reduce scale, topical corticosteroids or vitamin D analogues for active plaques, and for moderate-to-severe cases, phototherapy or systemic medication. Our dermatologists build a plan that works around your hair routine.'),
  ((SELECT block_id FROM block), 5, 'What is HydraFacial Keravive and how does it work?', 'HydraFacial Keravive is a 3-step scalp treatment: deep cleanse + exfoliation, infusion of growth factors and peptides, and take-home daily scalp spray. It improves the scalp environment so existing hair grows healthier and fall reduces within 2–3 sessions.'),
  ((SELECT block_id FROM block), 6, 'What products should I use for a healthy scalp?', 'Match the product to the scalp, not the hair. We prescribe medicated shampoos for dandruff (ketoconazole, piroctone olamine, or salicylic acid depending on cause), gentle sulphate-free daily shampoos for dry scalps, and leave-on scalp serums for hair growth support. Avoid heavy oils if youre dandruff-prone.');

-- ===== /concern/weight-management (6 FAQs) =====

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'weight-management' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
DELETE FROM cms.concerns_blocks_faqs_embed_inline_faqs
WHERE _parent_id = (SELECT block_id FROM block);

WITH c AS (
  SELECT id FROM cms.concerns WHERE slug = 'weight-management' LIMIT 1
),
block AS (
  SELECT b.id AS block_id
  FROM cms.concerns_blocks_faqs_embed b
  JOIN c ON b._parent_id = c.id
  ORDER BY b._order ASC
  LIMIT 1
)
INSERT INTO cms.concerns_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT block_id FROM block), 1, 'How much weight can I lose on your program?', 'Most patients lose 5–12 kg over a 3–6 month medical weight management program, depending on starting weight, metabolic profile, and adherence. The programme combines dermatologist-led nutrition, prescription medication where clinically appropriate, and non-surgical body contouring to reduce stubborn fat pockets.'),
  ((SELECT block_id FROM block), 2, 'Is the weight loss sustainable?', 'When the program is built around sustainable nutrition and habits rather than crash dieting, yes. Our plans include a 3-month maintenance phase after the active weight-loss phase so you consolidate the new baseline. We track outcomes at 6 and 12 months.'),
  ((SELECT block_id FROM block), 3, 'Who qualifies for the medical weight loss program?', 'Adults with a BMI over 27 (or over 25 with metabolic risk factors like PCOS, insulin resistance, hypertension, or dyslipidemia) typically qualify. We exclude pregnant or breastfeeding patients and those with untreated eating disorders. A full medical evaluation is done before starting.'),
  ((SELECT block_id FROM block), 4, 'How much does the medical weight loss program cost?', 'Our medical weight management programs start at around ₹30,000 for a 3-month plan and scale up based on medication, IV infusions, and body contouring sessions included. You get a full itemised plan before you commit.'),
  ((SELECT block_id FROM block), 5, 'Whats the difference between medical weight loss and bariatric surgery?', 'Medical weight loss is non-surgical and dermatologist-led — nutrition, prescription support (including GLP-1 where indicated), and non-invasive body contouring. Bariatric surgery is a surgical intervention for BMI 35+ cases (or 30+ with severe comorbidities), performed by a different specialty. We refer to bariatrics when medical therapy isnt sufficient.'),
  ((SELECT block_id FROM block), 6, 'Do you prescribe GLP-1 medications like Ozempic?', 'Where clinically indicated and after a full medical evaluation, yes. GLP-1 therapy is one tool in the program, not the whole program — it works best when combined with nutrition, habit change, and follow-up. We are not a "fast prescription" clinic; we build a sustainable plan.');


-- =========================================================================
-- Version draft-table sync (_concerns_v_blocks_faqs_embed_inline_faqs)
-- Refresh the latest draft for every affected concern so the admin UI's
-- Versions tab matches the published row.
-- =========================================================================

WITH latest_versions AS (
  SELECT v.id AS version_id, v.parent_id AS concern_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug IN ('acne-scars', 'anti-aging', 'skin-tanning', 'hyper-pigmentation', 'feature-enhancement', 'hair-loss-thinning', 'fat-loss', 'baldness', 'scalp-health', 'weight-management') AND v.latest = true
),
latest_version_blocks AS (
  SELECT vb.id AS vblock_id, lv.concern_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN latest_versions lv ON vb._parent_id = lv.version_id
)
DELETE FROM cms._concerns_v_blocks_faqs_embed_inline_faqs
WHERE _parent_id IN (SELECT vblock_id FROM latest_version_blocks);

-- Re-insert from the just-written published rows so drafts == published.

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'acne-scars' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'How many sessions of acne scar treatment will I need?', 'Most patients need 4–6 sessions of fractional CO2 laser or RF microneedling spaced 4–6 weeks apart. Ice pick and deep boxcar scars often need the longer end of that range. Your dermatologist will map the mix of scar types on your skin and give you a session count at your AI skin analysis.'),
  ((SELECT vblock_id FROM vblock), 2, 'What is the best treatment for acne scars on Indian skin?', 'On Indian skin (Fitzpatrick III–V), we prefer treatments with a low risk of post-inflammatory hyperpigmentation: RF microneedling, subcision, TCA CROSS for ice pick scars, and fractional CO2 at conservative settings. Q-switch laser toning is commonly added to address PIH (dark marks) alongside the scar itself.'),
  ((SELECT vblock_id FROM vblock), 3, 'How much does acne scar removal cost in Delhi?', 'Acne scar treatments at Uncover start at ₹10,999 for microneedling and ₹15,999 for advanced protocols. Fractional CO2 and combination plans are quoted after the consultation because they depend on scar type and area. We share a full itemised plan before you commit.'),
  ((SELECT vblock_id FROM vblock), 4, 'Can acne scars be permanently removed?', 'Most acne scars can be reduced by 60–80% with a structured plan. Ice pick and severe atrophic scars rarely go to 100%, but they can be smoothed enough that they are no longer noticeable in everyday lighting. Hypertrophic and keloid scars can be flattened dramatically with intralesional steroids and pulsed-dye laser.'),
  ((SELECT vblock_id FROM vblock), 5, 'Is laser treatment for acne scars safe?', 'Yes, when performed by a dermatologist. Every laser at Uncover is US-FDA approved, and every treatment is planned based on your Fitzpatrick skin type and scar pattern. We do a test spot for patients with darker skin before the first full session.'),
  ((SELECT vblock_id FROM vblock), 6, 'What is the difference between acne scars and post-inflammatory hyperpigmentation?', 'Acne scars are changes in skin texture (pits, bumps, depressions). PIH is the flat brown or red mark left after an acne lesion heals — it''s pigment, not scarring. PIH usually fades with laser toning and medical peels; true scars need collagen-stimulating treatments like microneedling or fractional CO2.'),
  ((SELECT vblock_id FROM vblock), 7, 'Can I do an acne scar treatment while I still have active acne?', 'Active acne has to be controlled first — treating scars on skin with active inflammation can worsen both. Your dermatologist will get the active breakouts under control (usually 4–8 weeks) before starting the scar phase of your plan.'),
  ((SELECT vblock_id FROM vblock), 8, 'How soon will I see results?', 'Visible improvement begins around weeks 4–6 as collagen remodelling kicks in. Peak results appear 3–6 months after the last session. We book a review at 90 days to re-assess and fine-tune the plan.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'anti-aging' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'At what age should I start anti-aging treatments?', 'Preventative care (sunscreen, retinoids, professional facials) starts in your 20s. Wrinkle relaxers (botox) are typically introduced from the late 20s for dynamic lines on the forehead. Collagen-stimulating treatments like GFC, skin boosters, and microneedling work well from the early 30s. The best age to start is the age at which you can commit to consistency.'),
  ((SELECT vblock_id FROM vblock), 2, 'How long does botox last?', 'Wrinkle relaxers typically last 3–4 months on forehead and crow''s feet, and up to 6 months for jawline slimming. Results last longer with consistent treatment — after 12–18 months of regular sessions, most patients find they need fewer units per visit.'),
  ((SELECT vblock_id FROM vblock), 3, 'Is botox safe?', 'Wrinkle relaxers have an exceptional safety record when administered by a dermatologist. Every injection at Uncover uses US-FDA approved products and is delivered by a board-certified dermatologist, not a technician.'),
  ((SELECT vblock_id FROM vblock), 4, 'What is the difference between botox and fillers?', 'Wrinkle relaxers (botox) relax muscles that cause dynamic lines — good for expression lines on the forehead, between the brows, and at the corners of the eyes. Dermal fillers restore lost volume and smooth static lines — good for cheeks, lips, under-eyes, and nasolabial folds. Many patients use both for a layered result.'),
  ((SELECT vblock_id FROM vblock), 5, 'How much does anti-aging treatment cost at Uncover?', 'Wrinkle relaxers start from ₹8,999 per area. Dermal fillers start from ₹14,999 for hydration fillers and ₹29,999 for volume/shape fillers. HIFU starts at ₹24,999. The full plan is itemised at consultation.'),
  ((SELECT vblock_id FROM vblock), 6, 'What is the best non-surgical facelift treatment?', 'HIFU (High-Intensity Focused Ultrasound) and thread lifts are the two leading non-surgical facelift options. HIFU uses ultrasound to stimulate collagen in the deep dermis; threads provide immediate mechanical lift. For many patients, a combination works best — your dermatologist will recommend based on your skin laxity pattern.'),
  ((SELECT vblock_id FROM vblock), 7, 'Can I combine multiple anti-aging treatments in one sitting?', 'Yes, with planning. We commonly combine wrinkle relaxers + skin boosters, or microneedling + GFC, in a single visit. Larger combinations (HIFU + fillers, for example) are staged 2–4 weeks apart to manage recovery.'),
  ((SELECT vblock_id FROM vblock), 8, 'Will I look "done" or unnatural?', 'Not if the plan is conservative. At Uncover, our philosophy is refresh, never alter. We tend to under-treat on the first visit and add more at review, rather than the other way around.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'skin-tanning' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'What is the best tan removal treatment?', 'For most Indian skin types, laser toning is the fastest and safest medical option — it breaks up the pigment that tanning deposits in the skin and evens tone across the face and body. For a lighter, faster result, an Un-Tan Glow Peel or IV Glow Drip pairs well with laser toning.'),
  ((SELECT vblock_id FROM vblock), 2, 'Can laser remove tan permanently?', 'Laser removes the current tan permanently — but if you go back to unprotected sun exposure, you''ll tan again. The fix is a combined plan: laser toning to reverse existing tan, plus a daily SPF 50 protocol that your dermatologist will build with you.'),
  ((SELECT vblock_id FROM vblock), 3, 'How many sessions do I need for tan removal?', 'Most patients see visible results after 2 sessions and reach their goal in 4–6 sessions, spaced 2–3 weeks apart. Deeper and long-standing tans (frequent outdoor exposure, athletes, brides pre-wedding) may need 6–8.'),
  ((SELECT vblock_id FROM vblock), 4, 'How much does tan removal cost in Delhi?', 'Laser toning at Uncover starts from ₹7,999 per session. Un-Tan Glow Peel and IV Glow Drips are priced separately — your dermatologist will build a combined package during the AI skin analysis.'),
  ((SELECT vblock_id FROM vblock), 5, 'Is tan removal safe for dark / Indian skin?', 'Yes, when done by a dermatologist with the right settings. At Uncover we use Q-switched Nd:YAG for all Indian skin types, which is the safest wavelength for pigmented skin. We do a test spot first if you have Fitzpatrick V or VI.'),
  ((SELECT vblock_id FROM vblock), 6, 'What is the difference between tan and pigmentation?', 'Tan is your skin''s temporary, even-toned response to UV. Pigmentation (melasma, PIH, sun spots) is patchy, uneven, and often triggered by hormones alongside UV. They need different treatment protocols, which is why we diagnose with an AI skin analysis before deciding.'),
  ((SELECT vblock_id FROM vblock), 7, 'Can I do tan removal before my wedding?', 'Yes — we regularly build 8–12 week pre-wedding plans that combine laser toning, medical de-tan, and HydraFacial. Start 3 months before the wedding for the best result.'),
  ((SELECT vblock_id FROM vblock), 8, 'Are there side effects?', 'Temporary redness and mild warmth for 1–2 hours post-session. No downtime. Strict sunscreen use between sessions is required to protect the result.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'hyper-pigmentation' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'What is the best treatment for pigmentation on Indian skin?', 'For most Indian skin types, Q-switch laser toning is the first-line treatment for melasma, PIH, and general uneven tone. We add medical peels and prescription topicals to accelerate the result. For deep, stubborn pigmentation, we add fractional lasers after a test spot.'),
  ((SELECT vblock_id FROM vblock), 2, 'How many sessions are needed for pigmentation treatment?', 'Melasma typically needs 6–10 laser toning sessions, spaced 2–3 weeks apart, plus a prescription maintenance plan. PIH and sun spots usually clear in 4–6 sessions. Your dermatologist maps the plan after the AI skin analysis.'),
  ((SELECT vblock_id FROM vblock), 3, 'Can pigmentation be removed permanently?', 'Sun spots, PIH, and freckles can be cleared to near-invisible and stay cleared with sunscreen. Melasma is chronic — we can reduce it by 70–90% and maintain with a prescription protocol, but it can flare with sun, hormones, and pregnancy.'),
  ((SELECT vblock_id FROM vblock), 4, 'How much does pigmentation treatment cost in Delhi?', 'Laser toning starts from ₹7,999 per session. Q-switch laser, medical peels, and topical prescription plans are quoted together at consultation. We share a full itemised plan before you commit.'),
  ((SELECT vblock_id FROM vblock), 5, 'What is the difference between melasma and hyperpigmentation?', 'Hyperpigmentation is the umbrella term for any dark patch. Melasma is a specific subtype — symmetrical, hormonal, and triggered by UV. PIH is post-inflammatory darkening (often after acne). Sun spots are UV-driven lesions. Each responds differently, which is why diagnosis matters.'),
  ((SELECT vblock_id FROM vblock), 6, 'Are pigmentation treatments safe for dark skin?', 'Yes, at the right settings. We use Q-switched Nd:YAG for Indian skin types III–VI, which is the safest pigment-specific wavelength. Every plan starts with a test spot if your Fitzpatrick is IV or higher.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'feature-enhancement' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'How much does a lip filler cost in Delhi?', 'Lip fillers at Uncover start from ₹14,999 for a 1ml hydration-focused filler and ₹29,999 for a volume or shape filler. Price depends on the product, the volume needed, and whether it''s a first session or a top-up.'),
  ((SELECT vblock_id FROM vblock), 2, 'How long do fillers last?', 'Lip and tear trough fillers typically last 9–12 months. Cheek and jawline fillers last 12–18 months. Longevity depends on filler type, placement, and lifestyle (metabolism, exercise, sun exposure).'),
  ((SELECT vblock_id FROM vblock), 3, 'Is non-surgical rhinoplasty safe?', 'Yes, when performed by a dermatologist with advanced filler training. We use reversible hyaluronic acid fillers to correct bumps, improve tip projection, and refine asymmetry. If you ever want to reverse the result, we can dissolve it completely with hyaluronidase.'),
  ((SELECT vblock_id FROM vblock), 4, 'Will I look "done" after fillers?', 'Not with our protocol. We under-fill on the first visit and ask you back at 2 weeks to add more if needed. Most patients land in a place where friends notice you look refreshed but can''t place why.'),
  ((SELECT vblock_id FROM vblock), 5, 'Are fillers reversible?', 'Hyaluronic acid fillers — yes, with a small injection of hyaluronidase. Collagen-stimulating fillers (like Sculptra) are not reversible, which is why we plan them more conservatively.'),
  ((SELECT vblock_id FROM vblock), 6, 'What''s the difference between fillers and fat transfer?', 'Fillers are pre-manufactured, immediate, reversible, and dermatologist-administered in a 30-minute outpatient session. Fat transfer is surgical, uses your own tissue, takes longer to recover, and is done by plastic surgeons. Uncover offers fillers only.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'hair-loss-thinning' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'How to stop hair fall immediately?', 'Short-term: address reversible triggers — iron and vitamin D deficiency, recent illness, crash diets, stress, tight hairstyles. Medium-term: start a dermatologist-supervised plan (GFC, PRP, topical minoxidil, or medical shampoos). There is no single overnight fix — but the right combined protocol can slow active fall within 4–8 weeks.'),
  ((SELECT vblock_id FROM vblock), 2, 'What is the difference between PRP and GFC for hair?', 'Both use your own blood. PRP is processed once and contains platelets plus growth factors. GFC (Growth Factor Concentrate) is processed twice — the second step isolates only the concentrated growth factors, without red blood cells or other components. GFC tends to be cleaner, more comfortable, and typically produces faster, more consistent results in our experience. Your dermatologist will choose based on your hair loss stage.'),
  ((SELECT vblock_id FROM vblock), 3, 'How much does hair fall treatment cost in Delhi?', 'GFC starts from ₹5,399 per session (4–6 sessions needed). PRP is similar. QR678 is ₹8,000–₹12,000 per session. FUE hair transplants start from ₹85,000 + GST. Pricing varies by graft count and scalp area — your dermatologist will give you an itemised plan.'),
  ((SELECT vblock_id FROM vblock), 4, 'Is female hair loss treatable?', 'Yes. Female pattern hair loss, postpartum hair fall, PCOS-driven thinning, and traction alopecia all respond to a dermatologist-supervised plan. The earlier we start, the better the result — so get evaluated the moment you notice more hair on the pillow or in the shower drain.'),
  ((SELECT vblock_id FROM vblock), 5, 'How do I know if I need a hair transplant?', 'Not every hair loss case needs a transplant. Transplants are indicated when follicles in the affected area have miniaturised beyond medical rescue — typically Norwood 3+ for men, or defined receding hairlines. We''ll do a medical evaluation and only recommend a transplant if non-surgical options (GFC, PRP, medical therapy) won''t deliver the density you want.'),
  ((SELECT vblock_id FROM vblock), 6, 'Can postpartum hair loss be reversed?', 'Yes — postpartum hair fall is self-limiting for most women and resolves 6–12 months after birth. We can accelerate the return to baseline with GFC, nutritional supplementation, and HydraFacial Keravive scalp therapy.'),
  ((SELECT vblock_id FROM vblock), 7, 'Is hair regrowth treatment permanent?', 'Results are maintained as long as you maintain the protocol. After the loading phase (4–6 sessions of GFC/PRP), we typically move to a maintenance schedule of one session every 3–4 months plus topical therapy. Transplanted hair from a FUE procedure is permanent by nature.'),
  ((SELECT vblock_id FROM vblock), 8, 'Why should I choose Uncover for hair loss treatment?', 'Every plan at Uncover is dermatologist-led, not technician-led. Every consultation starts with an AI scalp analysis — not a visual guess. And every protocol is structured, reviewed, and adjusted across follow-ups, backed by 15+ specialists across 8 clinics in Delhi NCR.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'fat-loss' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'Is non-surgical fat loss as effective as liposuction?', 'For small-to-moderate fat deposits and stubborn areas, yes — modern non-surgical tech (HIFU, EMS with RF, fat freezing) delivers 20–30% fat reduction per series with no surgery, no anaesthesia, and no downtime. For larger volumes, liposuction is still faster. At Uncover we''ll tell you honestly which route fits your goal.'),
  ((SELECT vblock_id FROM vblock), 2, 'Does Uncover offer CoolSculpting or fat freezing?', 'We offer non-invasive fat reduction using HIFU, which uses focused ultrasound to target and break down fat cells, and EMS with RF, which combines muscle stimulation with radiofrequency. Both are US-FDA approved platforms that achieve outcomes comparable to cryolipolysis. Your dermatologist will recommend based on your body area and goal.'),
  ((SELECT vblock_id FROM vblock), 3, 'How many sessions for visible inch loss?', 'Most patients see measurable inch loss after 4 sessions. A full series is typically 6–8 sessions for the abdomen, flanks, thighs, or upper arms. EMS-based muscle toning sees quicker visible results (tone and definition) than fat freezing (which takes 6–12 weeks to fully show).'),
  ((SELECT vblock_id FROM vblock), 4, 'How much does non-surgical fat loss cost?', 'EMS with RF and HIFU-based body contouring are quoted per area and per session — plans typically range ₹8,000–₹25,000 per session depending on the device, area size, and number of applicators. We build a full package at consultation.'),
  ((SELECT vblock_id FROM vblock), 5, 'Is fat loss treatment safe?', 'Yes, when performed on a dermatologist-led plan with US-FDA approved devices. The most common side effects are temporary redness, tingling, and mild soreness. Serious adverse events are rare.'),
  ((SELECT vblock_id FROM vblock), 6, 'Can I lose weight with body contouring treatments?', 'Body contouring reduces fat in specific areas — it is not a weight-loss solution. For overall weight loss, we combine non-surgical body contouring with our medical weight management program (nutrition, prescription medication where indicated, and accountability).');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'baldness' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'What causes baldness?', 'Most male and female pattern baldness is driven by genetics and androgen sensitivity — follicles miniaturise over time and stop producing pigmented hair. Stress, nutritional deficiencies, thyroid issues, and autoimmune conditions can accelerate the process. Your dermatologist will trace the cause with a scalp exam and blood work before recommending treatment.'),
  ((SELECT vblock_id FROM vblock), 2, 'FUE vs DHI — which is better?', 'FUE (Follicular Unit Extraction) and DHI (Direct Hair Implantation) both transplant individual follicles; the difference is the implantation tool. FUE is more established with predictable results at any graft count. DHI uses a Choi pen implanter which can give denser packing in small sessions but is slower on large cases. At Uncover we perform FUE for its consistency and scar profile.'),
  ((SELECT vblock_id FROM vblock), 3, 'How much does a hair transplant cost in Delhi?', 'FUE hair transplants at Uncover start from ₹85,000 + GST, scaled by graft count and the scalp area being restored. Most cases fall in the ₹85,000–₹2,50,000 range. We share a detailed graft plan and itemised quote at consultation so there are no surprises.'),
  ((SELECT vblock_id FROM vblock), 4, 'What is the success rate of FUE hair transplants?', 'With correctly-selected candidates (sufficient donor density, stabilised hair loss, realistic goals), 90–95% of transplanted grafts survive and produce permanent hair. Success depends more on case selection and surgical technique than on the platform; that is why every case at Uncover is assessed by a board-certified dermatologist, not a technician.'),
  ((SELECT vblock_id FROM vblock), 5, 'How long is recovery after a hair transplant?', 'Patients leave the clinic the same day. Swelling typically resolves in 3–5 days, scabs clear in 7–10 days, and most return to office work after 2–3 days. Transplanted hairs shed at around week 3 and regrow from month 3; the final result is visible at 9–12 months.'),
  ((SELECT vblock_id FROM vblock), 6, 'Can women get a hair transplant?', 'Yes, in the right cases. Female pattern hair loss often responds well to medical therapy first (GFC, PRP, topical minoxidil, QR678). Transplants are reserved for women with defined recession, traction alopecia scars, or post-surgical density loss. We only recommend surgery after a full medical evaluation.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'scalp-health' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'What causes dandruff?', 'Dandruff is driven by Malassezia, a yeast that lives on everyones scalp but overgrows in oily or sensitive skin. Stress, hormonal shifts, climate, and product build-up accelerate it. Most cases respond to a 4–6 week medical shampoo protocol alongside HydraFacial Keravive scalp therapy.'),
  ((SELECT vblock_id FROM vblock), 2, 'Why is my scalp so itchy?', 'Itchy scalp most commonly comes from seborrhoeic dermatitis (the same trigger as dandruff), product sensitivity, or scalp psoriasis. Fungal infections and allergic contact dermatitis are less common but treatable. A dermatologist can identify the cause with a scalp exam — dont keep buying shampoos until you know.'),
  ((SELECT vblock_id FROM vblock), 3, 'When should I see a dermatologist for scalp issues?', 'See a dermatologist if: flaking or itching persists past 4 weeks of over-the-counter anti-dandruff shampoo, you notice scalp pain or tenderness, patches of hair loss appear, or you see red, scaly, well-defined plaques (scalp psoriasis). Early diagnosis prevents long-term follicle damage.'),
  ((SELECT vblock_id FROM vblock), 4, 'How is scalp psoriasis treated?', 'Scalp psoriasis responds best to a staged plan: medicated shampoos to reduce scale, topical corticosteroids or vitamin D analogues for active plaques, and for moderate-to-severe cases, phototherapy or systemic medication. Our dermatologists build a plan that works around your hair routine.'),
  ((SELECT vblock_id FROM vblock), 5, 'What is HydraFacial Keravive and how does it work?', 'HydraFacial Keravive is a 3-step scalp treatment: deep cleanse + exfoliation, infusion of growth factors and peptides, and take-home daily scalp spray. It improves the scalp environment so existing hair grows healthier and fall reduces within 2–3 sessions.'),
  ((SELECT vblock_id FROM vblock), 6, 'What products should I use for a healthy scalp?', 'Match the product to the scalp, not the hair. We prescribe medicated shampoos for dandruff (ketoconazole, piroctone olamine, or salicylic acid depending on cause), gentle sulphate-free daily shampoos for dry scalps, and leave-on scalp serums for hair growth support. Avoid heavy oils if youre dandruff-prone.');

WITH v AS (
  SELECT v.id AS version_id
  FROM cms._concerns_v v
  JOIN cms.concerns c ON v.parent_id = c.id
  WHERE c.slug = 'weight-management' AND v.latest = true
  LIMIT 1
),
vblock AS (
  SELECT vb.id AS vblock_id
  FROM cms._concerns_v_blocks_faqs_embed vb
  JOIN v ON vb._parent_id = v.version_id
  ORDER BY vb._order ASC
  LIMIT 1
)
INSERT INTO cms._concerns_v_blocks_faqs_embed_inline_faqs (_parent_id, _order, question, answer)
VALUES
  ((SELECT vblock_id FROM vblock), 1, 'How much weight can I lose on your program?', 'Most patients lose 5–12 kg over a 3–6 month medical weight management program, depending on starting weight, metabolic profile, and adherence. The programme combines dermatologist-led nutrition, prescription medication where clinically appropriate, and non-surgical body contouring to reduce stubborn fat pockets.'),
  ((SELECT vblock_id FROM vblock), 2, 'Is the weight loss sustainable?', 'When the program is built around sustainable nutrition and habits rather than crash dieting, yes. Our plans include a 3-month maintenance phase after the active weight-loss phase so you consolidate the new baseline. We track outcomes at 6 and 12 months.'),
  ((SELECT vblock_id FROM vblock), 3, 'Who qualifies for the medical weight loss program?', 'Adults with a BMI over 27 (or over 25 with metabolic risk factors like PCOS, insulin resistance, hypertension, or dyslipidemia) typically qualify. We exclude pregnant or breastfeeding patients and those with untreated eating disorders. A full medical evaluation is done before starting.'),
  ((SELECT vblock_id FROM vblock), 4, 'How much does the medical weight loss program cost?', 'Our medical weight management programs start at around ₹30,000 for a 3-month plan and scale up based on medication, IV infusions, and body contouring sessions included. You get a full itemised plan before you commit.'),
  ((SELECT vblock_id FROM vblock), 5, 'Whats the difference between medical weight loss and bariatric surgery?', 'Medical weight loss is non-surgical and dermatologist-led — nutrition, prescription support (including GLP-1 where indicated), and non-invasive body contouring. Bariatric surgery is a surgical intervention for BMI 35+ cases (or 30+ with severe comorbidities), performed by a different specialty. We refer to bariatrics when medical therapy isnt sufficient.'),
  ((SELECT vblock_id FROM vblock), 6, 'Do you prescribe GLP-1 medications like Ozempic?', 'Where clinically indicated and after a full medical evaluation, yes. GLP-1 therapy is one tool in the program, not the whole program — it works best when combined with nutrition, habit change, and follow-up. We are not a "fast prescription" clinic; we build a sustainable plan.');

COMMIT;
