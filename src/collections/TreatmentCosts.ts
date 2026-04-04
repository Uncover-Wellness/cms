import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const TreatmentCosts: CollectionConfig = {
  slug: 'treatment-costs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'startingPrice'],
  },
  labels: {
    singular: 'Treatment Cost',
    plural: 'Treatment Costs',
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
      name: 'startingPrice',
      type: 'text',
      required: true,
    },
    {
      name: 'packageImageUrl',
      type: 'text',
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'treatments',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          required: true,
        },
        {
          name: 'contentCategories',
          type: 'relationship',
          relationTo: 'content-categories',
          hasMany: true,
          required: true,
        },
      ],
    },
  ],
};
