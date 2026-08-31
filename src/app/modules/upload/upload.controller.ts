import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from './upload.service';
import { AppError } from '../../errors/AppError';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No image file provided');
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
