import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'featured', 'publishedAt'],
  },
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
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
      admin: {
        description: 'Blog post title displayed as the H1 heading.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /post/{slug}',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main blog post hero image. Drag and drop or browse to upload.',
      },
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
      admin: {
        description: 'Legacy: Old URL. Use the upload field above for new images.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'featuredImageAltText',
      type: 'text',
      admin: {
        description: 'Alt text for the featured image.',
      },
    },
    {
      name: 'thumbnailImageV1Url',
      type: 'text',
      admin: {
        description: 'Legacy: unused. Scheduled for removal.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'thumbnailImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Legacy: unused. Scheduled for removal.',
        hidden: true,
      },
    },
    {
      name: 'thumbnailImageV2Url',
      type: 'text',
      admin: {
        description: 'Legacy: unused. Scheduled for removal.',
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on blog listing cards and used as SEO fallback.',
      },
    },
    {
      name: 'postBody',
      type: 'richText',
      admin: {
        description: 'Main blog post content. Use headings, lists, and links for best readability.',
      },
    },
    {
      name: 'richText2',
      type: 'richText',
      admin: {
        description: 'Additional rich text content appended after the main body.',
      },
    },
    {
      name: 'codeEmbedCode',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Raw HTML embed (e.g. YouTube video, comparison table). Rendered as-is on the page.',
      },
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible post body. Compose the article from any block type: text sections, notices/callouts, CTA bands, video embeds, content grids, before/after, pricing, FAQs, doctor carousels, etc. When populated, this replaces the legacy postBody/richText2 fields on render.',
        initCollapsed: true,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        description: 'Featured posts appear in the highlighted section on the blog listing page.',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'blogPostCategory',
          type: 'relationship',
          relationTo: 'blog-post-categories',
          admin: {
            description: 'Category for this post (e.g. Skin Care, Hair Care, Wellness).',
          },
        },
        {
          name: 'doctor',
          type: 'relationship',
          relationTo: 'doctors',
          admin: {
            description: 'Author doctor. Shown as byline on the blog post.',
          },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publication date shown on the blog post. Used for sorting.',
      },
    },
    {
      name: 'howToSteps',
      type: 'array',
      admin: {
        description: 'Optional structured steps for how-to posts — populates HowTo JSON-LD for Google rich results. Each step has a short name and a longer text.',
        initCollapsed: true,
      },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    {
      name: 'structuredFaqs',
      type: 'array',
      admin: {
        description: 'Optional inline FAQs for this post — populates FAQPage JSON-LD. Separate from the site-wide Faqs collection; use these when an FAQ belongs only to this post.',
        initCollapsed: true,
      },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
};
