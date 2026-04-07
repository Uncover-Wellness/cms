import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { TextSection, VideoEmbed, HtmlEmbed } from '../blocks';

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
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Search engine optimisation fields for the treatment page.',
      },
      fields: [
        {
          name: 'pageTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Browser tab title shown in Google results. Keep under 60 characters.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Short summary shown below the title in Google results. Keep under 160 characters.',
          },
        },
      ],
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
          name: 'mainImage',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for the hero banner image.',
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
          name: 'image',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for the section image.',
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
      blocks: [TextSection, VideoEmbed, HtmlEmbed],
      admin: {
        description: 'Flexible page content. Add text sections, video embeds, or HTML embeds in any order.',
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
          name: 'image',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for the technology/device image.',
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
