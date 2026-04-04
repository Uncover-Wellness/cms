/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultTemplate } from '@payloadcms/next/templates';
import { importMap } from '../importMap';
import configPromise from '../../../../payload.config';

export { generatePageMetadata as generateMetadata } from '@payloadcms/next/views';

const Page = async (props: any) => {
  return <DefaultTemplate config={configPromise} importMap={importMap} {...props} />;
};

export default Page;
