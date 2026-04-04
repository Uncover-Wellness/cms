import type { AdminViewProps } from 'payload';
import { DefaultTemplate, RenderServerComponent } from '@payloadcms/next/templates';
import { importMap } from '../importMap';
import configPromise from '../../../../payload.config';

export { generatePageMetadata as generateMetadata } from '@payloadcms/next/views';

const Page = async ({ params, searchParams }: AdminViewProps) => {
  return <DefaultTemplate config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />;
};

export default Page;
