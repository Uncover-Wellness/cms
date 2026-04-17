import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

/**
 * Service Categories drive the `/c/:slug` pages (Skin, Hair, Body,
 * Laser Hair Removal). The original Webflow collection held only lorem-ipsum
 * placeholder copy — the actual copy shown on uncover.co.in/c/:slug was
 * hand-typed into 4 separate static pages in the Webflow Designer and was
 * never exposed via the Data API. These fields give editors proper control
 * over that copy in Payload admin.
 *
 * The existing `excerpt*` + `experienceText` fields are kept for backwards
 * compatibility with already-imported data.
 *
 * Admin UI is split into tabs (Overview / Hero / Why Choose / Technologies /
 * Results / Closing Pitch) so the long form isn't overwhelming.
 */
export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Service Category',
    plural: 'Service Categories',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: { beforeChange: [slugFromName] },
  fields: [
    // Always-visible header fields
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      type: 'tabs',
      tabs: [
        // ─── OVERVIEW (legacy fields kept for compat) ───
        {
          label: 'Overview',
          fields: [
            {
              name: 'thumbnailImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Square thumbnail for homepage category grid. Drag and drop or browse to upload.',
              },
            },
            {
              name: 'thumbnailImageUrl',
              type: 'text',
              admin: {
                description: 'Legacy: Old URL. Use the upload field above for new images.',
                readOnly: true,
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Featured image. Drag and drop or browse to upload.',
              },
            },
            {
              name: 'featuredImageUrl',
              type: 'text',
              admin: {
                description: 'Legacy: Old URL. Use the upload field above for new images.',
                readOnly: true,
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description: 'Short category summary used in meta description fallbacks.',
              },
            },
            {
              name: 'excerptFeaturedShort',
              type: 'textarea',
            },
            {
              name: 'excerptFeaturedLarge',
              type: 'textarea',
            },
            {
              name: 'categoryLink',
              type: 'text',
            },
            {
              name: 'imageLinks',
              type: 'text',
            },
            {
              name: 'experienceText',
              type: 'richText',
              admin: {
                description:
                  'Legacy rich-text field. The structured Why Choose / Technologies tabs should be used instead.',
              },
            },
          ],
        },
        // ─── HERO ───
        {
          label: 'Hero',
          description: 'The top-of-page headline, tagline, body copy, and lifestyle image.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: 'Hero content',
              fields: [
                {
                  name: 'headline',
                  label: 'H1 headline',
                  type: 'text',
                  admin: {
                    description:
                      'Full hero H1. Example: "Custom Skin Care Treatments for Men & Women at UNCOVER Clinics"',
                  },
                },
                {
                  name: 'tagline',
                  label: 'Uppercase tagline',
                  type: 'text',
                  admin: {
                    description: 'Short uppercase line under the H1. Example: "Treatments for all tones and textures"',
                  },
                },
                {
                  name: 'body',
                  label: 'Intro paragraph',
                  type: 'textarea',
                  admin: {
                    description: 'One or two sentences below the tagline.',
                  },
                },
                {
                  name: 'image',
                  label: 'Hero image URL',
                  type: 'text',
                  admin: {
                    description: 'Full-width lifestyle photo shown at the top of the page.',
                  },
                },
                {
                  name: 'imageAlt',
                  label: 'Hero image alt text',
                  type: 'text',
                },
              ],
            },
          ],
        },
        // ─── WHY CHOOSE ───
        {
          label: 'Why Choose',
          description: 'Bullet list of benefits shown just below the hero.',
          fields: [
            {
              name: 'whyChoose',
              type: 'group',
              label: 'Why Choose section',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  admin: {
                    description: 'Example: "Why Choose UNCOVER Clinics for Hair Treatments?"',
                  },
                },
                {
                  name: 'intro',
                  type: 'textarea',
                  admin: { description: 'Optional intro paragraph above the bullet list.' },
                },
                {
                  name: 'bullets',
                  type: 'array',
                  minRows: 0,
                  labels: { singular: 'Bullet', plural: 'Bullets' },
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'body', type: 'textarea', required: true },
                  ],
                },
              ],
            },
          ],
        },
        // ─── ADVANCED TECHNOLOGY / TREATMENTS ───
        {
          label: 'Technologies',
          description:
            'Either a tile grid (like "Our Advanced Treatment Technologies" on /c/skin) or a bullet list (hair/body/laser style). Pick one via "kind".',
          fields: [
            {
              name: 'technologies',
              type: 'group',
              label: 'Technologies / Treatments section',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  admin: { description: 'Example: "Our Advanced Treatment Technologies"' },
                },
                {
                  name: 'intro',
                  type: 'textarea',
                  admin: {
                    description: 'Optional intro paragraph. Shown above the tiles or bullets.',
                  },
                },
                {
                  name: 'kind',
                  type: 'select',
                  defaultValue: 'bullets',
                  required: true,
                  options: [
                    { label: 'Tile grid (image + name + description)', value: 'tiles' },
                    { label: 'Bullet list (title + body)', value: 'bullets' },
                  ],
                },
                {
                  name: 'tiles',
                  type: 'array',
                  labels: { singular: 'Tile', plural: 'Tiles' },
                  admin: {
                    condition: (_data, siblingData) => siblingData?.kind === 'tiles',
                    description: 'Only used when kind = "Tile grid".',
                  },
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'description', type: 'textarea', required: true },
                    { name: 'image', type: 'text', required: true },
                    { name: 'imageAlt', type: 'text' },
                  ],
                },
                {
                  name: 'bullets',
                  type: 'array',
                  labels: { singular: 'Bullet', plural: 'Bullets' },
                  admin: {
                    condition: (_data, siblingData) => siblingData?.kind === 'bullets',
                    description: 'Only used when kind = "Bullet list".',
                  },
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'body', type: 'textarea', required: true },
                  ],
                },
              ],
            },
          ],
        },
        // ─── NARRATIVE SECTIONS ───
        {
          label: 'Narrative sections',
          description:
            'Long-form body content like "Our Skin Treatments" → "Acne & Scar Treatment" → bullets. Each section has a heading, optional intro, and a list of subsections with their own titled bullet lists.',
          fields: [
            {
              name: 'narrativeSections',
              type: 'array',
              labels: { singular: 'Narrative section', plural: 'Narrative sections' },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  admin: { description: 'Example: "Our Skin Treatments"' },
                },
                {
                  name: 'intro',
                  type: 'textarea',
                  admin: { description: 'Optional intro paragraph for this section.' },
                },
                {
                  name: 'subsections',
                  type: 'array',
                  // Shortened relation-table name to keep the auto-generated
                  // Payload version table (_service_categories_v_version_*)
                  // under Postgres' 63-char identifier limit. Matches the
                  // hand-written migration at
                  // uncover-astro/scripts/migrations/2026-04-05-service-categories-content-fields.sql
                  dbName: 'narrative_subsections',
                  labels: { singular: 'Subsection', plural: 'Subsections' },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: { description: 'Example: "Acne & Scar Treatment"' },
                    },
                    {
                      name: 'bullets',
                      type: 'array',
                      // Same reason as subsections above — without dbName,
                      // the default version table name is 68 chars and
                      // Payload init fails on Render with "Exceeded max
                      // identifier length for table or enum name of 63".
                      dbName: 'narrative_subsection_bullets',
                      labels: { singular: 'Item', plural: 'Items' },
                      fields: [
                        { name: 'title', type: 'text' },
                        { name: 'body', type: 'textarea', required: true },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ─── RESULTS ───
        {
          label: 'Results',
          description: 'Before/after carousel ("Our Results Speak For Themselves").',
          fields: [
            {
              name: 'results',
              type: 'group',
              label: 'Results section',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'Our Results Speak For Themselves',
                },
                {
                  name: 'images',
                  type: 'array',
                  labels: { singular: 'Image', plural: 'Images' },
                  fields: [
                    { name: 'src', type: 'text', required: true },
                    { name: 'alt', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        // ─── CLOSING PITCH ───
        {
          label: 'Closing pitch',
          description:
            'Optional final section before the booking CTA. Example: "Unlock Your Skin\'s Potential with UNCOVER Clinics".',
          fields: [
            {
              name: 'closingPitch',
              type: 'group',
              label: 'Closing pitch section',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'intro', type: 'textarea' },
                {
                  name: 'bullets',
                  type: 'array',
                  labels: { singular: 'Bullet', plural: 'Bullets' },
                  fields: [
                    { name: 'title', type: 'text' },
                    { name: 'body', type: 'textarea', required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible page blocks rendered between the existing tabbed sections (hero/whyChoose/technologies/narrative/results) and the closing pitch. Use this to add any block type — text, video, HTML, benefits grid, process steps, before/after, data table, pricing, CTA, content grid, image slider, stats, or embed-style blocks.',
        initCollapsed: true,
      },
    },
  ],
};
