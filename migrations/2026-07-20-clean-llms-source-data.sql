BEGIN;

UPDATE cms.service_categories
SET excerpt = CASE slug
  WHEN 'laser-hair-removal' THEN 'Dermatologist-led laser hair reduction for the face and body using advanced technology selected for Indian skin tones.'
  WHEN 'skin' THEN 'Dermatologist-led treatments for acne, pigmentation, ageing, texture and other skin concerns, tailored to individual skin needs.'
  WHEN 'hair' THEN 'Expert diagnosis and personalised treatment for hair loss, thinning and scalp concerns, including regenerative and transplant options.'
  WHEN 'body' THEN 'Non-surgical body treatments for contouring, fat reduction, skin tightening and medically supervised weight management.'
END,
updated_at = NOW()
WHERE slug IN ('laser-hair-removal', 'skin', 'hair', 'body');

UPDATE cms.concerns
SET name = BTRIM(name), updated_at = NOW()
WHERE id IN (97, 98, 99, 100, 101, 102, 103, 104, 105, 107, 108, 109, 111, 112, 113);

UPDATE cms.doctors
SET name = BTRIM(name), updated_at = NOW()
WHERE id IN (1, 198);

UPDATE cms.treatments
SET slug = CASE id
  WHEN 209 THEN 'hyperpigmentation-golf-course-extension'
  WHEN 208 THEN 'hyperpigmentation-sohna-road'
  WHEN 207 THEN 'hyperpigmentation-golf-course-road'
  WHEN 206 THEN 'hyperpigmentation-dwarka-expressway'
  WHEN 205 THEN 'hyperpigmentation-ghaziabad'
END,
updated_at = NOW()
WHERE id IN (205, 206, 207, 208, 209);

COMMIT;
