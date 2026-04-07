import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Concerns: CollectionConfig = {
  slug: 'concerns',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Concern',
    plural: 'Concerns',
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
        description: 'Auto-generated from name. Used in the URL: /concern/{slug}',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'pageTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Browser tab title. Keep under 60 characters.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Google results summary. Keep under 160 characters.',
          },
        },
      ],
    },
    {
      name: 'iconImageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Cloudinary URL for the small icon shown in concern listing grids.',
      },
    },
    {
      name: 'headerImageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Cloudinary URL for the hero banner image on the concern page.',
      },
    },
    {
      name: 'headerImageAltText',
      type: 'text',
      admin: {
        description: 'Alt text for the hero image.',
      },
    },
    {
      name: 'pageHeading',
      type: 'text',
      admin: {
        description: 'Hero H1 heading. Example: "Clear Skin Starts with the Right Diagnosis"',
      },
    },
    {
      name: 'pageSubTitle',
      type: 'text',
      admin: {
        description: 'Uppercase tagline under the heading. Example: "DIAGNOSE . TREAT . PREVENT"',
      },
    },
    {
      name: 'headingSupportText',
      type: 'textarea',
      admin: {
        description: 'Intro paragraph below the heading. 2-3 sentences about the concern and how Uncover treats it.',
      },
    },
    {
      name: 'textSections',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Text Section', plural: 'Text Sections' },
      admin: {
        description: 'Body content sections with heading, rich text, and optional image.',
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
            description: 'Section heading (H2).',
          },
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for the section image.',
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
        },
      ],
    },
    {
      name: 'technology',
      type: 'group',
      label: 'Technology',
      admin: {
        description: 'Technology or device used for treating this concern.',
      },
      fields: [
        {
          name: 'headingText',
          type: 'text',
        },
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for the technology/device image.',
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
        },
        {
          name: 'supportingText',
          type: 'text',
        },
      ],
    },
    {
      name: 'display',
      type: 'group',
      label: 'Display Settings',
      admin: {
        description: 'Controls visibility in site navigation.',
      },
      fields: [
        {
          name: 'showInHeader',
          type: 'checkbox',
          admin: {
            description: 'Show in the header navigation dropdown.',
          },
        },
        {
          name: 'headerSortOrder',
          type: 'number',
          admin: {
            description: 'Position in the header dropdown. Lower = first.',
          },
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'highlightedTreatments',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          admin: {
            description: 'Treatments featured prominently on this concern page.',
          },
        },
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
          required: true,
          admin: {
            description: 'Service categories (Skin, Hair, Body) this concern belongs to.',
          },
        },
      ],
    },
    {
      name: 'zenotiLabel',
      type: 'text',
      admin: {
        description: 'Zenoti system label for this concern. Used for booking integration.',
      },
    },
  ],
};
