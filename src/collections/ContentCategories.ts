import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

export const ContentCategories: CollectionConfig = {
  slug: 'content-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Content Category',
    plural: 'Content Categories',
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
        description: 'Internal description of this content category.',
      },
    },
  ],
};
