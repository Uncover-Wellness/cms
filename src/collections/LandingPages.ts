import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Landing Page',
    plural: 'Landing Pages',
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
      },
    },
    {
      name: 'pageTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Visible H1 heading on the landing page.',
      },
    },
    {
      name: 'headerSupportingText',
      type: 'richText',
      required: true,
      admin: {
        description: 'Rich text shown below the heading in the hero section.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Hero banner image. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'heroImageUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
      admin: {
        description: 'Phone number displayed on the landing page.',
      },
    },
    {
      name: 'callLink',
      type: 'text',
      required: true,
      admin: {
        description: 'tel: link for click-to-call. Example: "tel:+919876543210"',
      },
    },
    {
      name: 'formHeading',
      type: 'text',
      required: true,
      admin: {
        description: 'Heading above the booking form. Example: "Book Your Free Consultation"',
      },
    },
    {
      name: 'experience',
      type: 'group',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
      fields: [
        { name: 'sectionHeading', type: 'text' },
        { name: 'uncoverExperienceText', type: 'text' },
        { name: 'experienceVideoLink', type: 'text' },
      ],
    },
    {
      name: 'textSection1',
      type: 'group',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'content', type: 'richText' },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'textSection2',
      type: 'group',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'content', type: 'richText' },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'treatment',
      type: 'group',
      admin: {
        description: 'Legacy: superseded by the Technology page block. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
      fields: [
        { name: 'textHeadline', type: 'text' },
        { name: 'techText', type: 'richText' },
        { name: 'technologyImageUrl', type: 'text' },
      ],
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible page content. When populated, supersedes the legacy structured sections above (experience, textSection1/2, treatment). Compose the landing page from any block type.',
        initCollapsed: true,
      },
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'faqCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          required: true,
        },
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
          required: true,
        },
      ],
    },
  ],
};
