import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
      name: 'startingPrice',
      type: 'text',
      required: true,
      admin: {
        description: 'Starting price displayed on the card. Example: "₹2,500"',
      },
    },
    {
      name: 'packageImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Treatment package image. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'packageImageUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
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
