import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'question'],
  },
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
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
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
        },
        {
          name: 'costPage',
          type: 'relationship',
          relationTo: 'costs',
        },
        {
          name: 'blogPost',
          type: 'relationship',
          relationTo: 'blog-posts',
        },
      ],
    },
  ],
};
