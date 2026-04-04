import { DefaultTemplate } from '@payloadcms/next/templates';
import { importMap } from '../importMap';
import configPromise from '../../../../payload.config';

export { generatePageMetadata as generateMetadata } from '@payloadcms/next/views';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

const Page = async ({ params, searchParams }: Args) => {
  return <DefaultTemplate config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />;
};

export default Page;
