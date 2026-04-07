import { default as PublishButton } from '../../../components/admin/PublishButton/index.tsx'
import { default as RowLabel } from '../../../components/admin/RowLabel/index.tsx'

import { RscEntryLexicalCell } from '@payloadcms/richtext-lexical/rsc'
import { RscEntryLexicalField } from '@payloadcms/richtext-lexical/rsc'

import {
  AlignFeatureClient,
  BlockquoteFeatureClient,
  BoldFeatureClient,
  ChecklistFeatureClient,
  FixedToolbarFeatureClient,
  HeadingFeatureClient,
  HorizontalRuleFeatureClient,
  IndentFeatureClient,
  InlineCodeFeatureClient,
  InlineToolbarFeatureClient,
  ItalicFeatureClient,
  LinkFeatureClient,
  OrderedListFeatureClient,
  ParagraphFeatureClient,
  RelationshipFeatureClient,
  StrikethroughFeatureClient,
  SubscriptFeatureClient,
  SuperscriptFeatureClient,
  TableFeatureClient,
  UnderlineFeatureClient,
  UnorderedListFeatureClient,
  UploadFeatureClient,
} from '@payloadcms/richtext-lexical/client'

import {
  OverviewComponent,
  MetaTitleComponent,
  MetaDescriptionComponent,
  MetaImageComponent,
  PreviewComponent,
} from '@payloadcms/plugin-seo/client'

export const importMap = {
  '/src/components/admin/PublishButton/index.tsx#default': PublishButton,
  '/src/components/admin/RowLabel/index.tsx#default': RowLabel,

  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell': RscEntryLexicalCell,
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalField': RscEntryLexicalField,

  '@payloadcms/richtext-lexical/client#AlignFeatureClient': AlignFeatureClient,
  '@payloadcms/richtext-lexical/client#BlockquoteFeatureClient': BlockquoteFeatureClient,
  '@payloadcms/richtext-lexical/client#BoldFeatureClient': BoldFeatureClient,
  '@payloadcms/richtext-lexical/client#ChecklistFeatureClient': ChecklistFeatureClient,
  '@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient': FixedToolbarFeatureClient,
  '@payloadcms/richtext-lexical/client#HeadingFeatureClient': HeadingFeatureClient,
  '@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient': HorizontalRuleFeatureClient,
  '@payloadcms/richtext-lexical/client#IndentFeatureClient': IndentFeatureClient,
  '@payloadcms/richtext-lexical/client#InlineCodeFeatureClient': InlineCodeFeatureClient,
  '@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient': InlineToolbarFeatureClient,
  '@payloadcms/richtext-lexical/client#ItalicFeatureClient': ItalicFeatureClient,
  '@payloadcms/richtext-lexical/client#LinkFeatureClient': LinkFeatureClient,
  '@payloadcms/richtext-lexical/client#OrderedListFeatureClient': OrderedListFeatureClient,
  '@payloadcms/richtext-lexical/client#ParagraphFeatureClient': ParagraphFeatureClient,
  '@payloadcms/richtext-lexical/client#RelationshipFeatureClient': RelationshipFeatureClient,
  '@payloadcms/richtext-lexical/client#StrikethroughFeatureClient': StrikethroughFeatureClient,
  '@payloadcms/richtext-lexical/client#SubscriptFeatureClient': SubscriptFeatureClient,
  '@payloadcms/richtext-lexical/client#SuperscriptFeatureClient': SuperscriptFeatureClient,
  '@payloadcms/richtext-lexical/client#TableFeatureClient': TableFeatureClient,
  '@payloadcms/richtext-lexical/client#UnderlineFeatureClient': UnderlineFeatureClient,
  '@payloadcms/richtext-lexical/client#UnorderedListFeatureClient': UnorderedListFeatureClient,
  '@payloadcms/richtext-lexical/client#UploadFeatureClient': UploadFeatureClient,

  '@payloadcms/plugin-seo/client#OverviewComponent': OverviewComponent,
  '@payloadcms/plugin-seo/client#MetaTitleComponent': MetaTitleComponent,
  '@payloadcms/plugin-seo/client#MetaDescriptionComponent': MetaDescriptionComponent,
  '@payloadcms/plugin-seo/client#MetaImageComponent': MetaImageComponent,
  '@payloadcms/plugin-seo/client#PreviewComponent': PreviewComponent,
}
