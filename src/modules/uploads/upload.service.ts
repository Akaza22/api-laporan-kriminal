import cloudinary from '../../config/cloudinary';
import { AppError } from '../../utils/appError';

export const uploadImage = async (
  file: Express.Multer.File
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'crime-reports',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(new AppError('Failed to upload image', 500));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      )
      .end(file.buffer);
  });
};

export const uploadMultipleImages = async (
  files: Express.Multer.File[]
): Promise<{ url: string; publicId: string }[]> => {
  return Promise.all(files.map(file => uploadImage(file)));
};

export const deleteImageFromCloud = async (publicId: string) => {
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== 'ok') {
    throw new AppError('Failed to delete image from cloud', 500);
  }
};
