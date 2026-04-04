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
    },
    {
      name: 'location',
      type: 'text',
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
    },
    {
      name: 'applicationEmailAddress',
      type: 'text',
      required: true,
    },
    {
      name: 'jobDescription',
      type: 'richText',
    },
  ],
};
