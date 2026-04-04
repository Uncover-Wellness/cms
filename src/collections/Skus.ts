import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Skus: CollectionConfig = {
  slug: 'skus',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'skuValue'],
  },
  labels: {
    singular: 'SKU',
    plural: 'SKUs',
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
      name: 'skuValue',
      type: 'text',
      unique: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'priceCents',
          type: 'number',
          required: true,
        },
        {
          name: 'compareAtPriceCents',
          type: 'number',
        },
      ],
    },
    {
      name: 'mainImageUrl',
      type: 'text',
    },
    {
      name: 'additionalImageUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'downloadFileUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'widthCm',
          type: 'number',
        },
        {
          name: 'lengthCm',
          type: 'number',
        },
        {
          name: 'heightCm',
          type: 'number',
        },
        {
          name: 'weightKg',
          type: 'number',
        },
      ],
    },
    {
      name: 'ecSkuSubscriptionPlan',
      type: 'text',
    },
    {
      name: 'ecSkuBillingMethod',
      type: 'text',
    },
  ],
};
