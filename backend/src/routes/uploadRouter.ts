import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { uploadAvatar, uploadMilestoneImage, uploadStoryImages } from '../middleware/uploadMiddleware.js';
import {
    uploadAvatarHandler,
    uploadMilestoneImageHandler,
    uploadStoryImagesHandler,
    deleteUploadedImage,
} from '../controllers/uploadController.js';

const uploadRouter = express.Router();

uploadRouter.use(protect);

uploadRouter.post('/avatar', uploadAvatar, uploadAvatarHandler);

// Admin only
uploadRouter.post('/milestone-image', restrictTo('admin'),  uploadMilestoneImage, uploadMilestoneImageHandler);
uploadRouter.post('/story-images',    restrictTo('admin'),  uploadStoryImages,    uploadStoryImagesHandler);
uploadRouter.delete('/delete',        restrictTo('admin'),  deleteUploadedImage);

export default uploadRouter;

