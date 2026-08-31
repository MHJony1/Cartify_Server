import cloudinary from '../../lib/cloudinary';
import { AppError } from '../../errors/AppError';

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string = 'cartify/users'): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // If cloudinary is not configured, we simulate success for local dev or throw an error.
      // But the prompt states: "If Cloudinary is NOT configured... report exactly what remains configuration-only."
      // We will reject if not configured so the API behaves predictably.
      console.warn("Cloudinary is not configured. Missing ENV variables.");
      return reject(new AppError(500, 'Image upload service is not configured.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(new AppError(500, 'Failed to upload image to Cloudinary'));
        if (!result) return reject(new AppError(500, 'No result returned from Cloudinary'));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
