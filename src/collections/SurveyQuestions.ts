import { CollectionConfig } from 'payload';
import { isEditor } from '../access';

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
    },
    {
      name: 'rankIndex',
      type: 'number',
    },
    {
      name: 'zenotiQuestionLabel',
      type: 'text',
    },
    {
      name: 'questionCategory',
      type: 'text',
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
