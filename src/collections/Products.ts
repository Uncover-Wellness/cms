import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'productPriceDisplay'],
  },
  labels: {
    singular: 'Product',
    plural: 'Products',
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'shippable',
      type: 'checkbox',
    },
    {
      name: 'taxCategory',
      type: 'text',
    },
    {
      name: 'productDescription',
      type: 'richText',
    },
    {
      name: 'productAdditionalInfo',
      type: 'richText',
    },
    {
      name: 'productShipping',
      type: 'richText',
    },
    {
      name: 'productPriceDisplay',
      type: 'text',
    },
    {
      name: 'productMostPopular',
      type: 'checkbox',
    },
    {
      name: 'mainImageUrl',
      type: 'text',
    },
    {
      name: 'galleryImageUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'product-categories',
          hasMany: true,
          required: true,
        },
        {
          name: 'defaultSku',
          type: 'relationship',
          relationTo: 'skus',
        },
      ],
    },
    {
      name: 'ecProductType',
      type: 'select',
      options: [
        { label: 'Physical', value: 'Physical' },
        { label: 'Digital', value: 'Digital' },
        { label: 'Service', value: 'Service' },
        { label: 'Membership', value: 'Membership' },
        { label: 'Advanced', value: 'Advanced' },
      ],
    },
  ],
};
