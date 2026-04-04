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
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'pageTitle',
          type: 'text',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
      ],
    },
    {
      name: 'iconImageUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'headerImageUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'headerImageAltText',
      type: 'text',
    },
    {
      name: 'pageHeading',
      type: 'text',
    },
    {
      name: 'pageSubTitle',
      type: 'text',
    },
    {
      name: 'headingSupportText',
      type: 'textarea',
    },
    {
      name: 'textSections',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: 'heading',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'imageUrl',
          type: 'text',
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
      fields: [
        {
          name: 'headingText',
          type: 'text',
        },
        {
          name: 'imageUrl',
          type: 'text',
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
      fields: [
        {
          name: 'showInHeader',
          type: 'checkbox',
        },
        {
          name: 'headerSortOrder',
          type: 'number',
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'highlightedTreatments',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
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
    {
      name: 'zenotiLabel',
      type: 'text',
    },
  ],
};
