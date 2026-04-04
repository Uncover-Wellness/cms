import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

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
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
        },
        {
          name: 'tagline',
          type: 'text',
          required: true,
        },
        {
          name: 'mainImage',
          type: 'text',
          
        },
        {
          name: 'mainImageAltText',
          type: 'text',
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'details',
      type: 'group',
      fields: [
        {
          name: 'targetAreas',
          type: 'text',
          required: true,
        },
        {
          name: 'serviceTime',
          type: 'text',
        },
        {
          name: 'startingPrice',
          type: 'text',
        },
        {
          name: 'priceRangePerSession',
          type: 'text',
        },
        {
          name: 'priceRangeTotal',
          type: 'text',
        },
      ],
    },
    {
      name: 'contentSections',
      type: 'array',
      minRows: 0,
      maxRows: 4,
      fields: [
        {
          name: 'heading',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
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
          name: 'heading',
          type: 'text',
        },
        {
          name: 'subHeading',
          type: 'text',
        },
        {
          name: 'image',
          type: 'text',
          
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
      fields: [
        {
          name: 'html1',
          type: 'code',
          admin: {
            language: 'html',
          },
        },
        {
          name: 'html2',
          type: 'code',
          admin: {
            language: 'html',
          },
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'concerns',
          type: 'relationship',
          relationTo: 'concerns',
          hasMany: true,
          required: true,
        },
        {
          name: 'contentCategory',
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
        {
          name: 'headerCategory',
          type: 'select',
          options: [
            { label: 'Skin', value: 'skin' },
            { label: 'Hair', value: 'hair' },
            { label: 'Body', value: 'body' },
            { label: 'Wellness', value: 'wellness' },
          ],
        },
        {
          name: 'showInCheckinRecommendations',
          type: 'checkbox',
        },
        {
          name: 'rank',
          type: 'number',
        },
      ],
    },
  ],
};
