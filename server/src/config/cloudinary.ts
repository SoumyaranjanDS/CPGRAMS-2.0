import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer directly to Cloudinary using upload_stream
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  fileName: string,
  folder = 'cpgrams_attachments'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}_${cleanFileName}`,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export { cloudinary };
