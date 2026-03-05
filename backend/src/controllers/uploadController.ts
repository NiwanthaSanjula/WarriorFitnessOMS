import { Response, NextFunction } from 'express';
import { AppError }               from '../utils/appError.js';
import { CustomRequest }          from '../types.js';
import cloudinary                 from '../config/cloudinary.js';


// Middleware: protect, uploadAvatar
export const uploadAvatarHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return next(new AppError('No file uploaded', 400));

        const url = (req.file as any).path;
        res.status(200).json({ status: 'success', data: { url } });
    } catch (error) { next(error); }
};

// Middleware: protect, restrictTo('admin'), uploadMilestoneImage
export const uploadMilestoneImageHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return next(new AppError('No file uploaded', 400));
        const url = (req.file as any).path;
        res.status(200).json({ status: 'success', data: { url } });
    } catch (error) { next(error); }
};


// Middleware: protect, restrictTo('admin'), uploadStoryImages
export const uploadStoryImagesHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files?.beforeImage?.[0] || !files?.afterImage?.[0])
            return next(new AppError('Both beforeImage and afterImage are required', 400));

        const beforeUrl = (files.beforeImage[0] as any).path;
        const afterUrl  = (files.afterImage[0]  as any).path;

        res.status(200).json({ status: 'success', data: { beforeUrl, afterUrl } });
    } catch (error) { next(error); }
};


// Middleware: protect, restrictTo('admin')
export const deleteUploadedImage = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { publicId } = req.body;
        if (!publicId) return next(new AppError('publicId is required', 400));
        await cloudinary.uploader.destroy(publicId);
        res.status(200).json({ status: 'success', message: 'Image deleted' });
    } catch (error) { next(error); }
};