import { default as PublishButton } from '../../../components/admin/PublishButton/index.tsx'
import { default as RowLabel } from '../../../components/admin/RowLabel/index.tsx'
import { RscEntryLexicalCell } from '@payloadcms/richtext-lexical/rsc'
import { RscEntryLexicalField } from '@payloadcms/richtext-lexical/rsc'
import { OverviewComponent } from '@payloadcms/plugin-seo/client'
import { MetaTitleComponent } from '@payloadcms/plugin-seo/client'
import { MetaDescriptionComponent } from '@payloadcms/plugin-seo/client'
import { MetaImageComponent } from '@payloadcms/plugin-seo/client'
import { PreviewComponent } from '@payloadcms/plugin-seo/client'

export const importMap = {
  '/src/components/admin/PublishButton/index.tsx#default': PublishButton,
  '/src/components/admin/RowLabel/index.tsx#default': RowLabel,
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell': RscEntryLexicalCell,
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalField': RscEntryLexicalField,
  '@payloadcms/plugin-seo/client#OverviewComponent': OverviewComponent,
  '@payloadcms/plugin-seo/client#MetaTitleComponent': MetaTitleComponent,
  '@payloadcms/plugin-seo/client#MetaDescriptionComponent': MetaDescriptionComponent,
  '@payloadcms/plugin-seo/client#MetaImageComponent': MetaImageComponent,
  '@payloadcms/plugin-seo/client#PreviewComponent': PreviewComponent,
}
