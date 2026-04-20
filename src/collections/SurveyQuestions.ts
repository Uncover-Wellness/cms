import { CollectionConfig } from 'payload';
import { isEditor } from '../access';
import { slugFromName } from '../hooks/slugFromName';

export const SurveyQuestions: CollectionConfig = {
  slug: 'survey-questions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'questionType'],
  },
  labels: {
    singular: 'Survey Question',
    plural: 'Survey Questions',
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
      },
    },
    {
      name: 'questionType',
      type: 'select',
      options: [
        { label: 'Single Select', value: 'Single Select' },
        { label: 'Multi Select', value: 'Multi Select' },
      ],
    },
    {
      name: 'answerOptions',
      type: 'json',
      admin: {
        description: 'JSON array of answer options. Example: ["Option A", "Option B"]',
      },
    },
    {
      name: 'rankIndex',
      type: 'number',
      admin: {
        description: 'Display order. Lower = first.',
      },
    },
    {
      name: 'zenotiQuestionLabel',
      type: 'text',
      admin: {
        description: 'Zenoti system label for mapping to the booking questionnaire.',
      },
    },
    {
      name: 'questionCategory',
      type: 'text',
      admin: {
        description: 'Category grouping for the question. Example: "Skin", "Hair"',
      },
    },
    {
      name: 'relationships',
      type: 'group',
      fields: [
        {
          name: 'serviceCategories',
          type: 'relationship',
          relationTo: 'service-categories',
          hasMany: true,
        },
      ],
    },
  ],
};
