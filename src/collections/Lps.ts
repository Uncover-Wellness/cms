import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Lps: CollectionConfig = {
  slug: 'lps',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'LP',
    plural: 'LPs',
  },
  versions: {
    drafts: false,
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
      },
    },
    {
      name: 'pageTitleMetatag',
      type: 'text',
      required: true,
    },
    {
      name: 'pageTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'headerSupportingText',
      type: 'richText',
      required: true,
    },
    {
      name: 'heroImageUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'callLink',
      type: 'text',
      required: true,
    },
    {
      name: 'formHeading',
      type: 'text',
      required: true,
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
      name: 'benefits',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
        },
        {
          name: 'image1Url',
          type: 'text',
          required: true,
        },
        {
          name: 'text1',
          type: 'text',
        },
        {
          name: 'image2Url',
          type: 'text',
          required: true,
        },
        {
          name: 'text2',
          type: 'text',
        },
        {
          name: 'image3Url',
          type: 'text',
          required: true,
        },
        {
          name: 'text3',
          type: 'text',
        },
        {
          name: 'image4Url',
          type: 'text',
          required: true,
        },
        {
          name: 'text4',
          type: 'text',
        },
      ],
    },
    {
      name: 'costSectionHeading',
      type: 'text',
      required: true,
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
