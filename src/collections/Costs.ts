import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Costs: CollectionConfig = {
  slug: 'costs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Cost',
    plural: 'Costs',
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
      name: 'pageTitle',
      type: 'richText',
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'lowestCost',
          type: 'text',
        },
        {
          name: 'averageCost',
          type: 'text',
        },
        {
          name: 'highestCost',
          type: 'text',
        },
      ],
    },
    {
      name: 'costInflationGraphPoints',
      type: 'text',
    },
    {
      name: 'treatmentPointers',
      type: 'richText',
    },
    {
      name: 'treatmentPointers2',
      type: 'richText',
    },
    {
      name: 'treatmentContent1',
      type: 'richText',
    },
    {
      name: 'treatmentContent2',
      type: 'richText',
    },
    {
      name: 'customTableCode',
      type: 'code',
      admin: {
        language: 'html',
      },
    },
    {
      name: 'treatmentDetails',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: 'heading',
          type: 'richText',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          required: true,
        },
        {
          name: 'treatmentsSection1',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
        },
        {
          name: 'treatmentsSection2',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
        },
      ],
    },
  ],
};
