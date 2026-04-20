import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
      required: true,
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
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
      fields: [
        {
          name: 'sectionHeading',
          type: 'text',
        },
        {
          name: 'uncoverExperienceText',
          type: 'text',
          required: true,
        },
        {
          name: 'experienceVideoLink',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'textSection1',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'textSection2',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'treatment',
      type: 'group',
      fields: [
        {
          name: 'textHeadline',
          type: 'text',
          required: true,
        },
        {
          name: 'techText',
          type: 'richText',
          required: true,
        },
        {
          name: 'technologyImageUrl',
          type: 'text',
          required: true,
        },
      ],
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
