import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

export const JobOpenings: CollectionConfig = {
  slug: 'job-openings',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'location', 'jobType'],
  },
  labels: {
    singular: 'Job Opening',
    plural: 'Job Openings',
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
      name: 'jobSummary',
      type: 'textarea',
      admin: {
        description: 'One-line summary shown on the careers listing card.',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Job location. Example: "Gurgaon", "Remote", "Delhi NCR"',
      },
    },
    {
      name: 'jobType',
      type: 'select',
      options: [
        { label: 'Full Time', value: 'Full Time' },
        { label: 'Freelancer', value: 'Freelancer' },
        { label: 'Consultant', value: 'Consultant' },
      ],
    },
    {
      name: 'locationBubbleColour',
      type: 'text',
      admin: {
        description: 'CSS colour for the location badge. Example: "#f48f28"',
      },
    },
    {
      name: 'applicationEmailAddress',
      type: 'text',
      required: true,
      admin: {
        description: 'Email address for applications. Shown as "Apply" link.',
      },
    },
    {
      name: 'jobDescription',
      type: 'richText',
      admin: {
        description: 'Full job description with responsibilities and requirements.',
      },
    },
  ],
};
