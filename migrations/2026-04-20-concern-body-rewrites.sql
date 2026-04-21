-- Migration: Body-copy rewrites for 4 priority concern pages.
-- Audit: Uncover-SEO-Content-Audit-Edits.docx §4.3, §4.4, §4.6, §4.10.
--
-- Humanized voice. Adds 3 new text_section pageBlocks per concern with
-- audit-prescribed keyword-rich content (hair fall vocabulary, cryolipolysis,
-- tan removal, melasma/skin brightening). Shifts the existing faqsEmbed
-- block 3 _order slots later to keep FAQs at the end.
--
-- Safe to re-run: each text_section id is deterministic per slug so a
-- second run DELETEs the prior inserts cleanly before inserting fresh.

BEGIN;

-- ===== /concern/hair-loss-thinning =====
-- Bump FAQ block to _order = 8 to make space
UPDATE cms.concerns_blocks_faqs_embed
SET _order = 8
WHERE _parent_id = (SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning')
  AND _order = 5;

-- Remove any previously-inserted rewrite text_sections (deterministic IDs)
DELETE FROM cms.concerns_blocks_text_section
WHERE id IN ('seo-phase2-hair-loss-thinning-rewrite-1', 'seo-phase2-hair-loss-thinning-rewrite-2', 'seo-phase2-hair-loss-thinning-rewrite-3');

-- Insert 3 new text_sections
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hair-loss-thinning-rewrite-1',
  (SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning'),
  5,
  'pageBlocks',
  'Hair Loss Treatment for Women — PCOS, Postpartum, Female Pattern',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Most women who walk into our clinic for hair fall are dealing with one of three things: postpartum telogen effluvium, PCOS-driven thinning, or female pattern hair loss. They look similar in the shower drain but they need different plans.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Postpartum hair fall", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The big shed 3–6 months after delivery is hormonal and self-limiting — hair returns to baseline over 6–12 months on its own. What we add is acceleration: GFC or PRP to kickstart the anagen phase, nutritional support for iron and ferritin, and HydraFacial Keravive scalp therapy. Most postpartum patients get back to pre-pregnancy density 3–6 months faster with treatment than without.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "PCOS hair loss", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Elevated androgens miniaturise scalp follicles on the crown and temples. Plan: endocrinologist evaluation first, then spironolactone or combined oral contraceptive if prescribed, plus GFC or PRP for the scalp, plus topical minoxidil. Maintenance is lifetime because the hormonal driver doesn''t go away.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Female pattern hair loss", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Widening part line, visible scalp through the crown, thinning without bald patches. Responds well to GFC or PRP every 3–4 weeks for the loading phase, followed by maintenance every 3–4 months. Minoxidil topical daily. Spironolactone if indicated.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hair-loss-thinning-rewrite-2',
  (SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning'),
  6,
  'pageBlocks',
  'Hair Loss Treatment for Men — Norwood Scale, Regrowth, Transplant',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Male pattern hair loss follows the Norwood scale. Different stages need different interventions — and the earlier you start, the more options you have.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Norwood 1–2 (early)", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Receding hairline or diffuse thinning. Best addressed with topical minoxidil, GFC or PRP loading, and finasteride if prescribed. At this stage medical therapy often delays the progression by decades.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Norwood 3–4 (moderate)", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Frontal recession plus some crown thinning. Medical therapy still works but you may also be a candidate for FUE transplant depending on donor density. Your dermatologist will assess both options.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Norwood 5+ (advanced)", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Established baldness. Medical therapy alone won''t give cosmetic density. FUE hair transplant is the main option, combined with medical therapy on remaining hair to prevent further loss.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hair-loss-thinning-rewrite-3',
  (SELECT id FROM cms.concerns WHERE slug = 'hair-loss-thinning'),
  7,
  'pageBlocks',
  'PRP vs GFC for Hair — Which Is Right for You?',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Both use your own blood. PRP is platelet-rich plasma — one centrifuge spin, contains platelets plus growth factors plus some residual cells. GFC is Growth Factor Concentrate — double-processed to isolate a pure, clear concentrate of growth factors.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "In practice: GFC tends to be more comfortable, clearer in appearance, and produces faster visible regrowth — most patients see results by session 3 versus session 4–5 on PRP. GFC is typically 20–40% more expensive per session.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Which to pick: early-stage thinning often does well on either. Established thinning or less-responsive cases — we lean GFC. Post-partum — either works, the key is starting before the bald patches entrench.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "GFC at Uncover starts from ₹5,399 per session. Most plans are 4–6 sessions in the loading phase, then maintenance every 3–4 months.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);

-- ===== /concern/fat-loss =====
-- Bump FAQ block to _order = 9 to make space
UPDATE cms.concerns_blocks_faqs_embed
SET _order = 9
WHERE _parent_id = (SELECT id FROM cms.concerns WHERE slug = 'fat-loss')
  AND _order = 6;

-- Remove any previously-inserted rewrite text_sections (deterministic IDs)
DELETE FROM cms.concerns_blocks_text_section
WHERE id IN ('seo-phase2-fat-loss-rewrite-1', 'seo-phase2-fat-loss-rewrite-2', 'seo-phase2-fat-loss-rewrite-3');

-- Insert 3 new text_sections
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-fat-loss-rewrite-1',
  (SELECT id FROM cms.concerns WHERE slug = 'fat-loss'),
  6,
  'pageBlocks',
  'Fat Freezing & Cryolipolysis — What Works at Uncover',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Cryolipolysis (widely known as fat freezing or CoolSculpting) works by chilling fat cells to the point of apoptosis. The body then clears the dead cells over 6–12 weeks. It''s effective for small, stubborn fat deposits in specific areas — flanks, abdomen, thighs, upper arms.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "At Uncover we offer non-invasive fat reduction using HIFU (focused ultrasound) and EMS with RF (muscle stimulation + radiofrequency). Both are US-FDA approved platforms that deliver outcomes in the same ballpark as cryolipolysis for small-to-moderate fat pockets, without the freeze stage.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "For larger volumes or body contouring goals beyond what non-invasive treatment can produce, we refer to plastic surgery. Honesty on what each approach can deliver is part of the plan.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-fat-loss-rewrite-2',
  (SELECT id FROM cms.concerns WHERE slug = 'fat-loss'),
  7,
  'pageBlocks',
  'EMSculpt-Style Muscle Toning + Inch Loss',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "EMSculpt is the branded name for the HIFEM muscle-stimulation technology you''ve probably seen online. The generic category is EMS (electromagnetic muscle stimulation). At Uncover we combine EMS with RF (radiofrequency) — the muscle stimulation builds tone, the RF heats subcutaneous fat for an inch-loss effect.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Typical plan: 6–8 sessions spaced 2–3 days apart, 30 minutes per session. Most patients report measurable inch loss by session 4, peak results at week 8–10 post-final session.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Works best on abdomen, flanks, buttocks, and upper arms. For stubborn fat pockets, often combined with HIFU or manual lymphatic drainage. Your dermatologist will recommend based on your body area and goal.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-fat-loss-rewrite-3',
  (SELECT id FROM cms.concerns WHERE slug = 'fat-loss'),
  8,
  'pageBlocks',
  'Fat Loss Treatment Cost in Delhi, Gurgaon & Noida',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "EMS with RF and HIFU-based body contouring are quoted per area and per session. Typical range: ₹8,000–₹25,000 per session depending on the device, area size, and number of applicators used in one session.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Full packages for body contouring usually cost ₹60,000–₹1,50,000 over 6–8 sessions. The full itemised plan is built at your AI skin analysis and body assessment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Body contouring is not a weight-loss solution — it reduces fat in specific areas. For overall weight loss, our medical weight management program combines non-surgical contouring with dermatologist-led nutrition, prescription support (including GLP-1 where indicated), and accountability.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);

-- ===== /concern/skin-tanning =====
-- Bump FAQ block to _order = 11 to make space
UPDATE cms.concerns_blocks_faqs_embed
SET _order = 11
WHERE _parent_id = (SELECT id FROM cms.concerns WHERE slug = 'skin-tanning')
  AND _order = 8;

-- Remove any previously-inserted rewrite text_sections (deterministic IDs)
DELETE FROM cms.concerns_blocks_text_section
WHERE id IN ('seo-phase2-skin-tanning-rewrite-1', 'seo-phase2-skin-tanning-rewrite-2', 'seo-phase2-skin-tanning-rewrite-3');

-- Insert 3 new text_sections
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-skin-tanning-rewrite-1',
  (SELECT id FROM cms.concerns WHERE slug = 'skin-tanning'),
  8,
  'pageBlocks',
  'How to Remove Tan Permanently — Treatment Options',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "For most Indian skin types, Q-switched Nd:YAG laser toning is the fastest and safest medical route to reverse tanning. The 1064 nm wavelength targets melanin in the deep layers while sparing surface skin — exactly what pigmented skin needs.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Laser toning", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Primary medical option. 4–6 sessions 2–3 weeks apart clears most tans. Deeper tans (athletes, brides, frequent outdoor exposure) may need 6–8 sessions.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Un-Tan Glow Peel", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "A combination chemical peel formulated for pigmented skin. Works well alongside laser toning — visibly brightens the skin between laser sessions and speeds the overall result.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Medical De-tan Facial", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Surface-level treatment that removes the outermost tanned layer and delivers active ingredients (tranexamic acid, niacinamide, vitamin C). Best as a monthly maintenance session after the laser series.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "heading", "tag": "h3", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "IV Glow Drip", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Intravenous vitamin C + glutathione + B-complex. Systemic antioxidant support that reduces melanin production over time. Usually a 4–6 session course for cumulative effect.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-skin-tanning-rewrite-2',
  (SELECT id FROM cms.concerns WHERE slug = 'skin-tanning'),
  9,
  'pageBlocks',
  'Tan Removal Cost in Delhi NCR',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Laser toning at Uncover starts from ₹7,999 per session. A complete tan-removal plan typically runs ₹35,000–₹60,000 over 4–6 laser sessions.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Un-Tan Glow Peel and IV Glow Drips are priced separately. Most patients combine 4–6 laser sessions with 2–3 glow peels or a 4-session IV drip for faster results.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Full itemised pricing — laser toning, peels, IV drips, home skincare — comes together at your AI skin analysis. We don''t quote blind over the phone because the right plan depends on your tan depth and Fitzpatrick type.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-skin-tanning-rewrite-3',
  (SELECT id FROM cms.concerns WHERE slug = 'skin-tanning'),
  10,
  'pageBlocks',
  'Tan vs Pigmentation — How to Tell the Difference',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is where a lot of at-home treatment goes wrong. Tan is your skin''s temporary, even-toned response to UV. Pigmentation — melasma, PIH, sun spots — is patchy, uneven, and often triggered by hormones alongside UV.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "They need different protocols. Laser toning is perfect for tan and evens PIH. Melasma needs a more careful plan that sometimes includes topical prescriptions and peels alongside laser, because aggressive laser alone can flare melasma in reactive patients.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "This is why we diagnose with an AI skin analysis before recommending a plan. Treating the wrong condition for 6 months is how patients end up darker than when they started.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);

-- ===== /concern/hyper-pigmentation =====
-- Bump FAQ block to _order = 11 to make space
UPDATE cms.concerns_blocks_faqs_embed
SET _order = 11
WHERE _parent_id = (SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation')
  AND _order = 8;

-- Remove any previously-inserted rewrite text_sections (deterministic IDs)
DELETE FROM cms.concerns_blocks_text_section
WHERE id IN ('seo-phase2-hyper-pigmentation-rewrite-1', 'seo-phase2-hyper-pigmentation-rewrite-2', 'seo-phase2-hyper-pigmentation-rewrite-3');

-- Insert 3 new text_sections
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hyper-pigmentation-rewrite-1',
  (SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation'),
  8,
  'pageBlocks',
  'Melasma Treatment — The Most Common Pigmentation Concern in India',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Melasma is the highest-volume pigmentation concern in India — symmetric patches on the cheeks, forehead, and upper lip, often worsened by sun exposure and hormonal shifts. It''s chronic, which means we manage it, not ''cure'' it.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The plan that works for most Indian patients: Q-switch laser toning for the existing pigment, topical prescriptions (hydroquinone, tranexamic acid, or azelaic acid depending on your response), strict SPF 50 daily, and avoiding the triggers we can identify (heat, certain birth control pills, unmanaged UV).", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Most patients reduce melasma 70–90% with a structured plan and hold that result with maintenance. Flare-ups happen — pregnancy, unprotected summer, a high-stress period — and we respond with a short laser-plus-topical tune-up rather than restarting from zero.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hyper-pigmentation-rewrite-2',
  (SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation'),
  9,
  'pageBlocks',
  'Pigmentation Treatments at Uncover',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "The named treatments we use for pigmentation — each chosen based on what you actually have:", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "list", "tag": "ul", "start": 1, "listType": "bullet", "format": "", "indent": 0, "version": 1, "direction": "ltr", "children": [{"type": "listitem", "value": 1, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Q-switch laser toning (Nd:YAG 1064 nm) — first line for melasma, PIH, even-tone hyperpigmentation", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 2, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Medical peels (glycolic, mandelic, or tranexamic acid-based) — accelerate result and brighten skin texture", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 3, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Topical prescriptions — hydroquinone, tranexamic acid, kojic acid, azelaic acid, retinoids", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 4, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Fractional lasers for stubborn pigmentation — only after test spot on darker skin", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}, {"type": "listitem", "value": 5, "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Underarm whitening treatment — specific Q-switch protocol for intimate areas", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr"}]}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Dark-spot removal for sun spots and freckles usually clears in 4–6 laser sessions. Melasma is chronic and needs ongoing management rather than one-shot treatment.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);
INSERT INTO cms.concerns_blocks_text_section (id, _parent_id, _order, _path, heading, content)
VALUES (
  'seo-phase2-hyper-pigmentation-rewrite-3',
  (SELECT id FROM cms.concerns WHERE slug = 'hyper-pigmentation'),
  10,
  'pageBlocks',
  'Skin Brightening vs Pigmentation Treatment — the difference',
  '{"root": {"type": "root", "format": "", "indent": 0, "version": 1, "children": [{"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Patients often ask for ''skin brightening'' when what they actually need is pigmentation treatment. Here''s the distinction.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Skin brightening is cosmetic — it makes skin look more luminous and even-toned through exfoliation, glutathione, vitamin C, and hydration. Works on skin that''s already generally clear.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "Pigmentation treatment is medical — it targets specific pigmented lesions (melasma, PIH, sun spots) and removes them. Required before brightening protocols will show results on pigmented skin.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}, {"type": "paragraph", "format": "", "indent": 0, "version": 1, "children": [{"mode": "normal", "text": "On Indian skin, most patients who ask for brightening actually need pigmentation treatment first. Trying to brighten over active melasma doesn''t work — the brightening fades in weeks. Fix the pigmentation, then brighten, and the result holds.", "type": "text", "style": "", "detail": 0, "format": 0, "version": 1}], "direction": "ltr", "textFormat": 0, "textStyle": ""}], "direction": "ltr"}}'::jsonb
);

COMMIT;
