import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types';

interface CloudinaryAdapterOptions {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  folder?: string;
}

export const cloudinaryAdapter = (opts: CloudinaryAdapterOptions): Adapter => {
  return ({ collection, prefix }) => {
    const folder = opts.folder ?? prefix ?? collection.slug;

    const adapter: GeneratedAdapter = {
      name: 'cloudinary',

      handleUpload: async ({ file }) => {
        // Lazy import to avoid breaking when cloudinary isn't configured
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: opts.cloud_name,
          api_key: opts.api_key,
          api_secret: opts.api_secret,
        });

        const b64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimeType};base64,${b64}`;
        const publicId = file.filename.replace(/\.[^.]+$/, '');

        const result = await cloudinary.uploader.upload(dataUri, {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        });

        // Return metadata to be saved on the document
        return {
          filename: file.filename,
          filesize: file.filesize,
          mimeType: file.mimeType,
          width: result.width,
          height: result.height,
        };
      },

      handleDelete: async ({ filename }) => {
        try {
          const { v2: cloudinary } = await import('cloudinary');
          cloudinary.config({
            cloud_name: opts.cloud_name,
            api_key: opts.api_key,
            api_secret: opts.api_secret,
          });
          const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch {
          // Ignore delete errors
        }
      },

      generateURL: ({ filename }) => {
        const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
        return `https://res.cloudinary.com/${opts.cloud_name}/image/upload/f_auto,q_auto/${publicId}`;
      },

      staticHandler: (req, { params }) => {
        const { filename } = params;
        const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`;
        const url = `https://res.cloudinary.com/${opts.cloud_name}/image/upload/f_auto,q_auto/${publicId}`;
        return Response.redirect(url, 302);
      },
    };

    return adapter;
  };
};
