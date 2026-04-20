-- Migration: Delete the "test-faq / test answer" placeholder record
-- Audit: Uncover-SEO-Content-Audit-Edits.docx (Apr-2026) §2 Issue 1
--
-- Why: FAQ id=1439 (slug 'test-faq') had no relationships set, so the old
-- FaqsEmbedBlock fallback served it on every concern page that had no
-- scoped FAQs. The astro code-level fix stops the fallback going forward;
-- this migration removes the stray row so it cannot be re-exposed.
--
-- Safe to re-run: DELETEs by slug.

BEGIN;

-- Hard-delete the drafts/versions entries first (foreign-key friendly)
DELETE FROM cms._faqs_v WHERE version_slug = 'test-faq';
DELETE FROM cms.faqs WHERE slug = 'test-faq';

COMMIT;
