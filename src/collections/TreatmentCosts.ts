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
      name: 'startingPrice',
      type: 'text',
      required: true,
      admin: {
        description: 'Starting price displayed on the card. Example: "₹2,500"',
      },
    },
    {
      name: 'packageImageUrl',
      type: 'text',
      admin: {
        description: 'Cloudinary URL for the treatment package image.',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'treatments',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          required: true,
          admin: {
            description: 'Treatments included in this cost package.',
          },
        },
        {
          name: 'contentCategories',
          type: 'relationship',
          relationTo: 'content-categories',
          hasMany: true,
          required: true,
          admin: {
            description: 'Content categories for page association.',
          },
        },
      ],
    },
  ],
};
