import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const BlogPostCategories: CollectionConfig = {
  slug: 'blog-post-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Blog Post Category',
    plural: 'Blog Post Categories',
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
      name: 'pageMetaTitle',
      type: 'text',
    },
    {
      name: 'pageMetaDescription',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
};
