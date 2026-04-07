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
      admin: {
        description: 'The full question as it appears on the page.',
      },
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Plain text answer. Keep concise for best SEO (FAQ schema).',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      admin: {
        description: 'Link this FAQ to the page(s) where it should appear.',
      },
      fields: [
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          admin: {
            description: 'Content category — FAQs show on treatment/concern pages matching this category.',
          },
        },
        {
          name: 'costPage',
          type: 'relationship',
          relationTo: 'costs',
          admin: {
            description: 'Cost page where this FAQ should appear.',
          },
        },
        {
          name: 'blogPost',
          type: 'relationship',
          relationTo: 'blog-posts',
          admin: {
            description: 'Blog post where this FAQ should appear.',
          },
        },
      ],
    },
  ],
};
