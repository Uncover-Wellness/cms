import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const VideoTestimonials: CollectionConfig = {
  slug: 'video-testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Video Testimonial',
    plural: 'Video Testimonials',
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
      name: 'testimonialVideoLink',
      type: 'text',
      required: true,
      admin: {
        description: 'YouTube or video URL for the testimonial video.',
      },
    },
    {
      name: 'videoThumbnailUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Cloudinary URL for the video thumbnail image.',
      },
    },
    {
      name: 'shortTextDescription',
      type: 'textarea',
      admin: {
        description: 'Brief text summary shown alongside the video.',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      admin: {
        description: 'Controls which pages this video testimonial appears on.',
      },
      fields: [
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
          required: true,
        },
        {
          name: 'contentCategories',
          type: 'relationship',
          relationTo: 'content-categories',
          hasMany: true,
        },
      ],
    },
  ],
};
