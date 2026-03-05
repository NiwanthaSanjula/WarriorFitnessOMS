import multer               from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ── Helper to create storage for a specific folder ────────────────────────────
const makeStorage = (folder: string) =>
    new CloudinaryStorage({
        cloudinary,
        params: async (_req, file) => ({
            folder:         `warrior-gym/${folder}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            public_id:      `${Date.now()}-${file.originalname.split('.')[0]}`,
        }),
    });

// ── File filter — images only ─────────────────────────────────────────────────
const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB max

// Single profile picture upload
export const uploadAvatar = multer({
    storage:    makeStorage('avatars'),
    fileFilter: imageFilter,
    limits,
}).single('avatar');

// Single milestone / honor image
export const uploadMilestoneImage = multer({
    storage:    makeStorage('milestones'),
    fileFilter: imageFilter,
    limits,
}).single('image');

// Two images for success story
export const uploadStoryImages = multer({
    storage:    makeStorage('stories'),
    fileFilter: imageFilter,
    limits,
}).fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage',  maxCount: 1 },
]);