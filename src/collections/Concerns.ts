import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

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
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /concern/{slug}',
      },
    },
    {
      name: 'iconImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Small icon shown in concern listing grids. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'iconImageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
      },
    },
    {
      name: 'headerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Hero banner image for the concern page. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'headerImageUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
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
      minRows: 0,
      labels: { singular: 'Text Section', plural: 'Text Sections' },
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        initCollapsed: true,
        hidden: true,
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
          name: 'imageUpload',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Section image. Drag and drop or browse to upload.',
          },
        },
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'Legacy: Old URL. Use the upload field above for new images.',
            readOnly: true,
            hidden: true,
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
        },
      ],
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible page content. Compose the concern page from any block type: text, video, HTML, benefits grid, process steps, before/after, data table, pricing, CTA, content grid, image slider, stats, and embed-style blocks (doctors/testimonials/FAQs/booking form). Add blocks in the order they should render.',
        initCollapsed: true,
      },
    },
    {
      name: 'technology',
      type: 'group',
      label: 'Technology',
      admin: {
        description: 'Legacy: superseded by the Technology page block. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
      fields: [
        {
          name: 'headingText',
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
          name: 'imageUrl',
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
        description: 'Legacy: unused. Scheduled for removal.',
        hidden: true,
      },
    },
  ],
};
