import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Lp2s: CollectionConfig = {
  slug: 'lp2s',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'LP2',
    plural: 'LP2s',
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
      name: 'landingPage',
      type: 'relationship',
      relationTo: 'landing-pages',
      required: true,
    },
  ],
};
