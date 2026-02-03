import cloudinary from '../../config/cloudinary';

export const uploadImage = async (file: Express.Multer.File) => {
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'crime-reports',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(file.buffer);
  });
};
