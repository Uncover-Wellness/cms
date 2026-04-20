# SEO Audit Phase 1 — April 2026

Four SQL migrations implement the "Quick Wins" slice from
`Uncover-SEO-Content-Audit-Edits.docx` (Apr-2026). Run **in this order**:

| Order | File | What it does | Risk |
|---|---|---|---|
| 1 | `2026-04-20-seo-audit-phase-1-delete-placeholder-faq.sql` | Removes the `test-faq / test answer` row (id 1439) and its version-history entries | Low — deletes one stray row |
| 2 | `2026-04-20-seo-audit-phase-1-treatment-prices.sql` | Sets `details_starting_price` on `wrinkle-relaxer` and `skin-boosters`; syncs latest `_treatments_v` draft | Low — two UPDATEs |
| 3 | `2026-04-20-seo-audit-phase-1-concern-meta.sql` | Sets `meta_title` / `meta_description` / `page_heading` on all 10 concern pages; syncs `_concerns_v` | Low — 10 UPDATEs + a version-table sync |
| 4 | `2026-04-20-seo-audit-phase-1-concern-faqs.sql` | Inserts 68 real Q&As across the 10 concerns' `faqsEmbed` blocks; syncs `_concerns_v` drafts | **Medium — verify table names first** |

## Before running migration #4

Payload's Postgres adapter generates block sub-table names from the field
path. These are the names the migration assumes:

```
cms.concerns_blocks_faqs_embed
cms.concerns_blocks_faqs_embed_inline_faqs
cms._concerns_v_blocks_faqs_embed
cms._concerns_v_blocks_faqs_embed_inline_faqs
```

Verify with `\d` before running:

```bash
psql "$DATABASE_URL" -c '\d cms.concerns_blocks_faqs_embed_inline_faqs'
psql "$DATABASE_URL" -c '\d cms._concerns_v_blocks_faqs_embed_inline_faqs'
```

Expected columns: `_order`, `_parent_id`, `id`, `question`, `answer`.

If Payload generated different names (e.g. without the underscore between
`faqs` and `embed`, or `parent_block_id` instead of `_parent_id`), do a
find-and-replace in the SQL file before running.

## Companion frontend changes

These migrations are meant to land **after** the CMS is redeployed with
these two commits and **before** the frontend is redeployed:

* `feat(seo): phase 1 — Apr-2026 content audit surface fixes` (uncover-astro)
* `feat(locations): add geo + neighbourhood fields for LocalBusiness schema` (uncover-cms)

Per the deployment-order convention: **DB migrations → Render CMS deploy
→ Cloudflare Pages frontend**. If you flip the order, pages will still
work but will render with the old data until the frontend picks up the
new fetch normaliser.

## What this does NOT cover (Phase 2)

The audit prescribes much more content work that is intentionally not in
this slice:

* Concern body-copy rewrites (Section 4 intro paragraphs, new H2 sections,
  pricing blocks) — author in Payload admin per audit copy.
* Treatment keyword expansion (fillers lip/cheek/tear-trough sections,
  GFC vs PRP split, wrinkle-relaxer "botox cost Delhi" section).
* Per-neighbourhood landing page **content** — the `/locations/[slug]`
  route scaffold shipped in Phase 1 but each clinic's unique
  `neighbourhoodIntro`, `nearestMetro`, `catchmentAreas`,
  `latitude`/`longitude`, `aggregateRating` still need to be entered
  per clinic in `/admin/collections/locations/:id`.
* City hub pages `/delhi/`, `/gurgaon/`, `/noida/`.
* AI Skin Analysis hero module + rollout.
* New service pages `/treatment/prp-hair`, `/treatment/chemical-peel`,
  `/treatment/melasma-treatment`, etc.
* 30+ blog articles (audit Section 7).
* GMB optimisation (not in-site).
