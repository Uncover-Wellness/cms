import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types';
import sharp from 'sharp';

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
        // Convert raster images to optimised WebP; pass SVGs through unchanged
        const isSvg = file.mimeType === 'image/svg+xml';
        let buffer: Buffer;
        let mimeType: string;
        let filename: string;

        if (isSvg) {
          buffer = file.buffer;
          mimeType = file.mimeType;
          filename = file.filename;
        } else {
          buffer = await sharp(file.buffer).webp({ quality: 82 }).toBuffer();
          mimeType = 'image/webp';
          filename = file.filename.replace(/\.[^.]+$/, '.webp');
        }

        // Lazy import to avoid breaking when cloudinary isn't configured
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: opts.cloud_name,
          api_key: opts.api_key,
          api_secret: opts.api_secret,
        });

        const b64 = buffer.toString('base64');
        const dataUri = `data:${mimeType};base64,${b64}`;
        const publicId = filename.replace(/\.[^.]+$/, '');

        const result = await cloudinary.uploader.upload(dataUri, {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        });

        return {
          filename,
          filesize: buffer.length,
          mimeType,
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
