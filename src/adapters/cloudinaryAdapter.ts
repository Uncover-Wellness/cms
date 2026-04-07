import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types';
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryAdapterOptions {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  folder?: string;
}

export const cloudinaryAdapter =
  (opts: CloudinaryAdapterOptions): Adapter =>
  ({ collection, prefix }) => {
    cloudinary.config({
      cloud_name: opts.cloud_name,
      api_key: opts.api_key,
      api_secret: opts.api_secret,
    });

    const folder = opts.folder ?? prefix ?? collection.slug;

    const adapter: GeneratedAdapter = {
      name: 'cloudinary',

      handleUpload: async ({ file }) => {
        const b64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimeType};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder,
          public_id: file.filename.replace(/\.[^.]+$/, ''), // strip extension
          resource_type: 'image',
          overwrite: true,
        });

        return {
          filename: file.filename,
          filesize: file.filesize,
          mimeType: file.mimeType,
          width: result.width,
          height: result.height,
          url: result.secure_url,
        } as any;
      },

      handleDelete: async ({ filename }) => {
        const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      },

      generateURL: ({ filename }) => {
        const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
        return cloudinary.url(publicId, {
          secure: true,
          fetch_format: 'auto',
          quality: 'auto',
        });
      },

      staticHandler: async (req, { params }) => {
        const { filename } = params;
        const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
        const url = cloudinary.url(publicId, { secure: true });
        return Response.redirect(url, 302);
      },
    };

    return adapter;
  };
