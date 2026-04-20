import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

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
      admin: {
        description: 'Clinic display name. Example: "Uncover Noida"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /locations/{slug}',
      },
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      admin: {
        description: 'Full street address without the clinic name prefix.',
      },
    },
    {
      name: 'shortAddressDisplay',
      type: 'text',
      required: true,
      admin: {
        description: 'Short version shown on listing cards. Example: "Sector 104, Noida"',
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Primary phone number displayed on the website.',
      },
    },
    {
      name: 'clinicPhone',
      type: 'text',
      required: true,
      admin: {
        description: 'Direct clinic phone number (may differ from display number).',
      },
    },
    {
      name: 'timings',
      type: 'text',
      required: true,
      admin: {
        description: 'Operating hours. Use format: "Monday - Sunday 10 AM to 8 PM"',
      },
    },
    {
      name: 'mapLink',
      type: 'text',
      required: true,
      admin: {
        description: 'Google Maps URL for this clinic location.',
      },
    },
    {
      name: 'clinicPhoto',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main clinic photo. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'clinicPhotoUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'clinicImagesUrls',
      type: 'array',
      labels: { singular: 'Clinic Image', plural: 'Clinic Images' },
      admin: {
        description: 'Additional clinic photos shown in the gallery.',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Cloudinary URL for this gallery image.',
          },
        },
      ],
    },
    {
      name: 'zenotiCenterId',
      type: 'text',
      admin: {
        description: 'Legacy: unused on site. Scheduled for removal.',
        hidden: true,
      },
    },
    {
      name: 'whatsappContact',
      type: 'text',
      admin: {
        description: 'Legacy: unused. Use whatsappLink instead. Scheduled for removal.',
        hidden: true,
      },
    },
    {
      name: 'whatsappLink',
      type: 'text',
      admin: {
        description: 'Full WhatsApp click-to-chat URL.',
      },
    },
    {
      name: 'rankIndex',
      type: 'number',
      admin: {
        description: 'Display order on the locations page. Lower = first.',
      },
    },
  ],
};
