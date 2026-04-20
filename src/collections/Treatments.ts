import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

export const Treatments: CollectionConfig = {
  slug: 'treatments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Treatment',
    plural: 'Treatments',
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
  hooks: { beforeValidate: [slugFromName] },
  fields: [
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
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /treatment/{slug}',
      },
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      admin: {
        description: 'The top-of-page banner shown on the treatment detail page.',
      },
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
          admin: {
            description: 'Main H1 heading displayed in the hero banner.',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          required: true,
          admin: {
            description: 'Short uppercase tagline shown under the headline.',
          },
        },
        {
          name: 'mainImageUpload',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Hero banner image. Drag and drop or browse to upload.',
          },
        },
        {
          name: 'mainImage',
          type: 'text',
          admin: {
            description: 'Legacy: Old URL. Use the upload field above for new images.',
            readOnly: true,
          },
        },
        {
          name: 'mainImageAltText',
          type: 'text',
          admin: {
            description: 'Descriptive alt text for the hero image (accessibility + SEO).',
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Short summary paragraph shown in the hero section.',
          },
        },
      ],
    },
    {
      name: 'details',
      type: 'group',
      label: 'Treatment Details',
      admin: {
        description: 'Quick-reference details shown in the treatment info card.',
      },
      fields: [
        {
          name: 'targetAreas',
          type: 'text',
          required: true,
          admin: {
            description: 'Body areas this treatment targets. Example: "Face, Neck, Arms"',
          },
        },
        {
          name: 'serviceTime',
          type: 'text',
          admin: {
            description: 'Approximate session duration. Example: "30-45 minutes"',
          },
        },
        {
          name: 'sessions',
          type: 'text',
          admin: {
            description: 'Typical number of sessions. Example: "6-8"',
          },
        },
        {
          name: 'downtime',
          type: 'text',
          admin: {
            description: 'Expected downtime after the procedure. Example: "None" or "2-3 days"',
          },
        },
        {
          name: 'startingPrice',
          type: 'text',
          admin: {
            description: 'Starting price displayed on the page. Example: "₹2,500"',
          },
        },
        {
          name: 'priceRangePerSession',
          type: 'text',
          admin: {
            description: 'Price range per session. Example: "₹2,500 - ₹5,000"',
          },
        },
        {
          name: 'priceRangeTotal',
          type: 'text',
          admin: {
            description: 'Total cost across all sessions. Example: "₹15,000 - ₹30,000"',
          },
        },
      ],
    },
    {
      name: 'contentSections',
      type: 'array',
      minRows: 0,
      labels: { singular: 'Content Section', plural: 'Content Sections' },
      admin: {
        description: 'Rich-text body sections shown below the hero. Each section has a heading, content, and optional image.',
        initCollapsed: true,
        components: {
          RowLabel: {
            path: '/src/components/admin/RowLabel/index.tsx#default',
            clientProps: { fieldName: 'heading' },
          },
        },
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Section heading (H2). Example: "How Does Laser Hair Removal Work?"',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'imageUpload',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Section image. Drag and drop or browse to upload.',
          },
        },
        {
          name: 'image',
          type: 'text',
          admin: {
            description: 'Legacy: Old URL. Use the upload field above for new images.',
            readOnly: true,
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
          admin: {
            description: 'Alt text for the section image.',
          },
        },
      ],
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible page content. Compose the treatment page from any block type: text, video, HTML, benefits grid, process steps, before/after, data table, pricing, CTA, content grid, image slider, stats, and embed-style blocks (doctors/testimonials/FAQs/booking form). Add blocks in the order they should render.',
        initCollapsed: true,
      },
    },
    {
      name: 'technology',
      type: 'group',
      label: 'Technology',
      admin: {
        description: 'Technology or device information shown on the treatment page.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Example: "Powered by Soprano Titanium Laser"',
          },
        },
        {
          name: 'subHeading',
          type: 'text',
        },
        {
          name: 'imageUpload',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Technology/device image. Drag and drop or browse to upload.',
          },
        },
        {
          name: 'image',
          type: 'text',
          admin: {
            description: 'Legacy: Old URL. Use the upload field above for new images.',
            readOnly: true,
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
        },
      ],
    },
    {
      name: 'customEmbeds',
      type: 'group',
      label: 'Custom Embeds',
      admin: {
        description: 'Raw HTML embeds (e.g. comparison tables, interactive widgets). Use sparingly.',
      },
      fields: [
        {
          name: 'html1',
          type: 'code',
          admin: {
            language: 'html',
            description: 'First HTML embed block. Rendered as-is on the treatment page.',
          },
        },
        {
          name: 'html2',
          type: 'code',
          admin: {
            language: 'html',
            description: 'Second HTML embed block.',
          },
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      admin: {
        description: 'Link this treatment to concerns, content categories, and service categories.',
      },
      fields: [
        {
          name: 'concerns',
          type: 'relationship',
          relationTo: 'concerns',
          hasMany: true,
          required: true,
          admin: {
            description: 'Skin/hair concerns this treatment addresses. Shown as clickable pills on the page.',
          },
        },
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          required: true,
          admin: {
            description: 'Primary content category (used for FAQ grouping and internal linking).',
          },
        },
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
          required: true,
          admin: {
            description: 'Service categories (Skin, Hair, Body) this treatment belongs to.',
          },
        },
        {
          name: 'linkedDoctors',
          type: 'relationship',
          relationTo: 'doctors',
          hasMany: true,
          admin: {
            description: 'Doctors who specialise in this treatment. Shown in the "Expert Specialists" carousel on the treatment page. When empty, the site falls back to top doctors.',
          },
        },
      ],
    },
    {
      name: 'display',
      type: 'group',
      label: 'Display Settings',
      admin: {
        description: 'Controls where and how this treatment appears in navigation and listings.',
      },
      fields: [
        {
          name: 'showInHeader',
          type: 'checkbox',
          admin: {
            description: 'Show this treatment in the site header navigation dropdown.',
          },
        },
        {
          name: 'headerSortOrder',
          type: 'number',
          admin: {
            description: 'Position in the header dropdown. Lower numbers appear first.',
          },
        },
        {
          name: 'headerCategory',
          type: 'select',
          options: [
            { label: 'Skin', value: 'skin' },
            { label: 'Hair', value: 'hair' },
            { label: 'Body', value: 'body' },
            { label: 'Wellness', value: 'wellness' },
          ],
          admin: {
            description: 'Which header tab this treatment appears under.',
          },
        },
        {
          name: 'showInCheckinRecommendations',
          type: 'checkbox',
          admin: {
            description: 'Show in the check-in recommendations flow.',
          },
        },
        {
          name: 'rank',
          type: 'number',
          admin: {
            description: 'Global display rank. Lower numbers appear first in treatment listings.',
          },
        },
      ],
    },
  ],
};
