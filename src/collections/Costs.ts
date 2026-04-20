import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';
import { ALL_PAGE_BLOCKS } from '../blocks';

export const Costs: CollectionConfig = {
  slug: 'costs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  labels: {
    singular: 'Cost',
    plural: 'Costs',
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
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from name. Used in the URL: /cost/{slug}',
      },
    },
    {
      name: 'pageTitle',
      type: 'richText',
      admin: {
        description: 'Rich-text page title displayed at the top of the cost page.',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Pricing Range',
      admin: {
        description: 'Price range displayed in the pricing overview card.',
      },
      fields: [
        {
          name: 'lowestCost',
          type: 'text',
          admin: { description: 'Example: "₹2,500"' },
        },
        {
          name: 'averageCost',
          type: 'text',
          admin: { description: 'Example: "₹5,000"' },
        },
        {
          name: 'highestCost',
          type: 'text',
          admin: { description: 'Example: "₹15,000"' },
        },
      ],
    },
    {
      name: 'costInflationGraphPoints',
      type: 'text',
      admin: {
        description: 'Legacy: unused. Scheduled for removal.',
        hidden: true,
      },
    },
    {
      name: 'treatmentPointers',
      type: 'richText',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
    },
    {
      name: 'treatmentPointers2',
      type: 'richText',
      admin: {
        description: 'Legacy: unused duplicate. Scheduled for removal.',
        hidden: true,
      },
    },
    {
      name: 'treatmentContent1',
      type: 'richText',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
    },
    {
      name: 'treatmentContent2',
      type: 'richText',
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
    },
    {
      name: 'customTableCode',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Legacy: superseded by the HTML Embed page block. Fallback-rendered only when Page Blocks is empty.',
        hidden: true,
      },
    },
    {
      name: 'treatmentDetails',
      type: 'array',
      minRows: 0,
      maxRows: 4,
      labels: { singular: 'Treatment Detail', plural: 'Treatment Details' },
      admin: {
        description: 'Legacy: superseded by Page Blocks. Fallback-rendered only when Page Blocks is empty.',
        initCollapsed: true,
        hidden: true,
        components: {
          RowLabel: {
            path: '/src/components/admin/RowLabel/index.tsx#default',
            clientProps: { fieldName: 'heading' },
          },
        },
      },
      fields: [
        {
          name: 'heading',
          type: 'richText',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      name: 'pageBlocks',
      type: 'blocks',
      blocks: ALL_PAGE_BLOCKS,
      admin: {
        description: 'Flexible page content. When populated, supersedes the legacy structured sections above (treatmentPointers, treatmentContent1/2, customTableCode, treatmentDetails). Compose the cost page from any block type.',
        initCollapsed: true,
      },
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'contentCategory',
          type: 'relationship',
          relationTo: 'content-categories',
          required: true,
          admin: {
            description: 'Content category for FAQ grouping.',
          },
        },
        {
          name: 'treatmentsSection1',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          admin: {
            description: 'Treatments shown in the first pricing section.',
          },
        },
        {
          name: 'treatmentsSection2',
          type: 'relationship',
          relationTo: 'treatments',
          hasMany: true,
          admin: {
            description: 'Treatments shown in the second pricing section.',
          },
        },
      ],
    },
  ],
};
