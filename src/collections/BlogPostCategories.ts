import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
  hooks: { beforeChange: [slugFromName] },
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
      admin: {
        description: 'Short category description shown at the top of the listing page.',
      },
    },
  ],
};
