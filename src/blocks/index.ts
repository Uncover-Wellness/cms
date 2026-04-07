import { Block } from 'payload';

export const TextSection: Block = {
  slug: 'textSection',
  labels: { singular: 'Text Section', plural: 'Text Sections' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Section heading (H2).' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'image',
      type: 'text',
      admin: { description: 'Cloudinary URL for an optional section image.' },
    },
    {
      name: 'imageAltText',
      type: 'text',
      admin: { description: 'Alt text for the image.' },
    },
  ],
};

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional heading above the video.' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      admin: { description: 'YouTube or Vimeo URL.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption below the video.' },
    },
  ],
};

export const HtmlEmbed: Block = {
  slug: 'htmlEmbed',
  labels: { singular: 'HTML Embed', plural: 'HTML Embeds' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional heading above the embed.' },
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Raw HTML rendered as-is on the page.',
      },
    },
  ],
};
