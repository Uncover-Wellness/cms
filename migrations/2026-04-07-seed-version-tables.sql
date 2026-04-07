-- Migration: Seed version tables for all existing documents
-- Reason: versions.drafts was enabled on 17 collections but existing documents
--         have no version table entries, causing the admin panel to show "No Results".
-- Date: 2026-04-07

BEGIN;

-- 1. blog_post_categories
INSERT INTO cms._blog_post_categories_v (parent_id, version_name, version_slug, version_page_meta_title, version_page_meta_description, version_description, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, page_meta_title, page_meta_description, description, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.blog_post_categories;

-- 2. blog_posts
INSERT INTO cms._blog_posts_v (parent_id, version_name, version_slug, version_seo_page_title, version_seo_meta_description, version_featured_image_url, version_featured_image_alt_text, version_thumbnail_image_v1_url, version_thumbnail_image_v2_url, version_excerpt, version_post_body, version_rich_text2, version_code_embed_code, version_featured, version_relationships_blog_post_category_id, version_relationships_doctor_id, version_published_at, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, seo_page_title, seo_meta_description, featured_image_url, featured_image_alt_text, thumbnail_image_v1_url, thumbnail_image_v2_url, excerpt, post_body, rich_text2, code_embed_code, featured, relationships_blog_post_category_id, relationships_doctor_id, published_at, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.blog_posts;

-- 3. concerns
INSERT INTO cms._concerns_v (parent_id, version_name, version_slug, version_seo_page_title, version_seo_meta_description, version_icon_image_url, version_header_image_url, version_header_image_alt_text, version_page_heading, version_page_sub_title, version_heading_support_text, version_technology_heading_text, version_technology_image_url, version_technology_image_alt_text, version_technology_supporting_text, version_display_show_in_header, version_display_header_sort_order, version_zenoti_label, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, seo_page_title, seo_meta_description, icon_image_url, header_image_url, header_image_alt_text, page_heading, page_sub_title, heading_support_text, technology_heading_text, technology_image_url, technology_image_alt_text, technology_supporting_text, display_show_in_header, display_header_sort_order, zenoti_label, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.concerns;

-- 4. content_categories
INSERT INTO cms._content_categories_v (parent_id, version_name, version_slug, version_description, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, description, updated_at, created_at, _status, now(), now(), true
FROM cms.content_categories;

-- 5. costs
INSERT INTO cms._costs_v (parent_id, version_name, version_slug, version_seo_page_title, version_seo_meta_description, version_page_title, version_pricing_lowest_cost, version_pricing_average_cost, version_pricing_highest_cost, version_cost_inflation_graph_points, version_treatment_pointers, version_treatment_pointers2, version_treatment_content1, version_treatment_content2, version_custom_table_code, version_relationships_content_category_id, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, seo_page_title, seo_meta_description, page_title, pricing_lowest_cost, pricing_average_cost, pricing_highest_cost, cost_inflation_graph_points, treatment_pointers, treatment_pointers2, treatment_content1, treatment_content2, custom_table_code, relationships_content_category_id, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.costs;

-- 6. doctors
INSERT INTO cms._doctors_v (parent_id, version_name, version_slug, version_seo_page_title, version_seo_meta_description, version_portrait_image_url, version_excerpt, version_job_title, version_bio, version_medical_registration, version_highlight_text, version_detailed_qualifications, version_my_experience, version_memberships_affiliations, version_award_recognitions, version_metrics_reviews_metric, version_metrics_years_experience_metric, version_metrics_patients_served_metric, version_metrics_awards_metric, version_zenoti_reference_id, version_facebook_link, version_order_index, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, seo_page_title, seo_meta_description, portrait_image_url, excerpt, job_title, bio, medical_registration, highlight_text, detailed_qualifications, my_experience, memberships_affiliations, award_recognitions, metrics_reviews_metric, metrics_years_experience_metric, metrics_patients_served_metric, metrics_awards_metric, zenoti_reference_id, facebook_link, order_index, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.doctors;

-- 7. faqs
INSERT INTO cms._faqs_v (parent_id, version_name, version_slug, version_question, version_answer, version_relationships_content_category_id, version_relationships_cost_page_id, version_relationships_blog_post_id, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, question, answer, relationships_content_category_id, relationships_cost_page_id, relationships_blog_post_id, updated_at, created_at, _status, now(), now(), true
FROM cms.faqs;

-- 8. job_openings
INSERT INTO cms._job_openings_v (parent_id, version_name, version_slug, version_job_summary, version_location, version_job_type, version_location_bubble_colour, version_application_email_address, version_job_description, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, job_summary, location, job_type, location_bubble_colour, application_email_address, job_description, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.job_openings;

-- 9. landing_pages
INSERT INTO cms._landing_pages_v (parent_id, version_name, version_slug, version_page_title_metatag, version_page_title, version_header_supporting_text, version_hero_image_url, version_contact_phone, version_call_link, version_form_heading, version_experience_section_heading, version_experience_uncover_experience_text, version_experience_experience_video_link, version_text_section1_heading, version_text_section1_content, version_text_section1_description, version_text_section2_heading, version_text_section2_content, version_text_section2_description, version_treatment_text_headline, version_treatment_tech_text, version_treatment_technology_image_url, version_relationships_faq_category_id, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, page_title_metatag, page_title, header_supporting_text, hero_image_url, contact_phone, call_link, form_heading, experience_section_heading, experience_uncover_experience_text, experience_experience_video_link, text_section1_heading, text_section1_content, text_section1_description, text_section2_heading, text_section2_content, text_section2_description, treatment_text_headline, treatment_tech_text, treatment_technology_image_url, relationships_faq_category_id, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.landing_pages;

-- 10. locations
INSERT INTO cms._locations_v (parent_id, version_name, version_slug, version_address, version_short_address_display, version_phone_number, version_clinic_phone, version_timings, version_map_link, version_clinic_photo_url, version_zenoti_center_id, version_whatsapp_contact, version_whatsapp_link, version_rank_index, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, version_seo_page_title, version_seo_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, address, short_address_display, phone_number, clinic_phone, timings, map_link, clinic_photo_url, zenoti_center_id, whatsapp_contact, whatsapp_link, rank_index, updated_at, created_at, _status, meta_title, meta_description, seo_page_title, seo_meta_description, now(), now(), true
FROM cms.locations;

-- 11. lp2s
INSERT INTO cms._lp2s_v (parent_id, version_name, version_slug, version_landing_page_id, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, landing_page_id, updated_at, created_at, _status, now(), now(), true
FROM cms.lp2s;

-- 12. lps
INSERT INTO cms._lps_v (parent_id, version_name, version_slug, version_page_title_metatag, version_page_title, version_header_supporting_text, version_hero_image_url, version_contact_phone, version_call_link, version_form_heading, version_experience_section_heading, version_experience_uncover_experience_text, version_experience_experience_video_link, version_text_section1_heading, version_text_section1_content, version_text_section1_description, version_text_section2_heading, version_text_section2_content, version_text_section2_description, version_treatment_text_headline, version_treatment_tech_text, version_treatment_technology_image_url, version_benefits_heading, version_benefits_image1_url, version_benefits_text1, version_benefits_image2_url, version_benefits_text2, version_benefits_image3_url, version_benefits_text3, version_benefits_image4_url, version_benefits_text4, version_cost_section_heading, version_relationships_faq_category_id, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, page_title_metatag, page_title, header_supporting_text, hero_image_url, contact_phone, call_link, form_heading, experience_section_heading, experience_uncover_experience_text, experience_experience_video_link, text_section1_heading, text_section1_content, text_section1_description, text_section2_heading, text_section2_content, text_section2_description, treatment_text_headline, treatment_tech_text, treatment_technology_image_url, benefits_heading, benefits_image1_url, benefits_text1, benefits_image2_url, benefits_text2, benefits_image3_url, benefits_text3, benefits_image4_url, benefits_text4, cost_section_heading, relationships_faq_category_id, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.lps;

-- 13. service_categories
-- Note: main table has extra columns (hero_headline, hero_tagline, hero_body, hero_image, hero_image_alt,
--       why_choose_heading, why_choose_intro, technologies_heading, technologies_intro, technologies_kind,
--       results_heading, closing_pitch_heading, closing_pitch_intro, city) not present in version table.
--       Version table has version_seo_page_title/version_seo_meta_description which DO exist in main table.
INSERT INTO cms._service_categories_v (parent_id, version_name, version_slug, version_thumbnail_image_url, version_featured_image_url, version_excerpt, version_excerpt_featured_short, version_excerpt_featured_large, version_category_link, version_image_links, version_experience_text, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, version_seo_page_title, version_seo_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, thumbnail_image_url, featured_image_url, excerpt, excerpt_featured_short, excerpt_featured_large, category_link, image_links, experience_text, updated_at, created_at, _status, meta_title, meta_description, seo_page_title, seo_meta_description, now(), now(), true
FROM cms.service_categories;

-- 14. survey_questions
INSERT INTO cms._survey_questions_v (parent_id, version_name, version_slug, version_question_type, version_answer_options, version_rank_index, version_zenoti_question_label, version_question_category, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, question_type, answer_options, rank_index, zenoti_question_label, question_category, updated_at, created_at, _status, now(), now(), true
FROM cms.survey_questions;

-- 15. testimonials
INSERT INTO cms._testimonials_v (parent_id, version_name, version_slug, version_testimonial_text, version_service, version_client_photo_url, version_video_link, version_video_thumbnail_url, version_order_index, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, testimonial_text, service, client_photo_url, video_link, video_thumbnail_url, order_index, updated_at, created_at, _status, now(), now(), true
FROM cms.testimonials;

-- 16. treatment_costs
INSERT INTO cms._treatment_costs_v (parent_id, version_name, version_slug, version_starting_price, version_package_image_url, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, starting_price, package_image_url, updated_at, created_at, _status, now(), now(), true
FROM cms.treatment_costs;

-- 17. treatments
INSERT INTO cms._treatments_v (parent_id, version_name, version_slug, version_seo_page_title, version_seo_meta_description, version_hero_headline, version_hero_tagline, version_hero_main_image, version_hero_main_image_alt_text, version_hero_excerpt, version_details_target_areas, version_details_service_time, version_details_starting_price, version_details_price_range_per_session, version_details_price_range_total, version_technology_heading, version_technology_sub_heading, version_technology_image, version_technology_image_alt_text, version_custom_embeds_html1, version_custom_embeds_html2, version_relationships_content_category_id, version_display_show_in_header, version_display_header_sort_order, version_display_header_category, version_display_show_in_checkin_recommendations, version_display_rank, version_updated_at, version_created_at, version__status, version_meta_title, version_meta_description, created_at, updated_at, latest)
SELECT id, name, slug, seo_page_title, seo_meta_description, hero_headline, hero_tagline, hero_main_image, hero_main_image_alt_text, hero_excerpt, details_target_areas, details_service_time, details_starting_price, details_price_range_per_session, details_price_range_total, technology_heading, technology_sub_heading, technology_image, technology_image_alt_text, custom_embeds_html1, custom_embeds_html2, relationships_content_category_id, display_show_in_header, display_header_sort_order, display_header_category, display_show_in_checkin_recommendations, display_rank, updated_at, created_at, _status, meta_title, meta_description, now(), now(), true
FROM cms.treatments;

-- 18. video_testimonials
INSERT INTO cms._video_testimonials_v (parent_id, version_name, version_slug, version_testimonial_video_link, version_video_thumbnail_url, version_short_text_description, version_updated_at, version_created_at, version__status, created_at, updated_at, latest)
SELECT id, name, slug, testimonial_video_link, video_thumbnail_url, short_text_description, updated_at, created_at, _status, now(), now(), true
FROM cms.video_testimonials;

COMMIT;
