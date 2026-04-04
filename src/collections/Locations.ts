import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'address'],
  },
  labels: {
    singular: 'Location',
    plural: 'Locations',
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
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'shortAddressDisplay',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
    },
    {
      name: 'clinicPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'timings',
      type: 'text',
      required: true,
    },
    {
      name: 'mapLink',
      type: 'text',
      required: true,
    },
    {
      name: 'clinicPhotoUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'clinicImagesUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'zenotiCenterId',
      type: 'text',
    },
    {
      name: 'whatsappContact',
      type: 'text',
    },
    {
      name: 'whatsappLink',
      type: 'text',
    },
    {
      name: 'rankIndex',
      type: 'number',
    },
  ],
};
