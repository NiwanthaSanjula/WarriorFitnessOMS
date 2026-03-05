import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    getPublicStories,   getAdminStories,   createStory,   updateStory,   deleteStory,
    getPublicMilestones, getAdminMilestones, createMilestone, updateMilestone, deleteMilestone,
} from '../controllers/contentController.js';

const contentRouter = express.Router();

// ── PUBLIC (no auth needed) ───────────────────────────────────────────────────
contentRouter.get('/stories',    getPublicStories);
contentRouter.get('/milestones', getPublicMilestones);

// ── ADMIN ─────────────────────────────────────────────────────────────────────
contentRouter.use(protect, restrictTo('admin'));

contentRouter.get('/admin/stories',       getAdminStories);
contentRouter.post('/admin/stories',      createStory);
contentRouter.patch('/admin/stories/:id', updateStory);
contentRouter.delete('/admin/stories/:id',deleteStory);

contentRouter.get('/admin/milestones',        getAdminMilestones);
contentRouter.post('/admin/milestones',       createMilestone);
contentRouter.patch('/admin/milestones/:id',  updateMilestone);
contentRouter.delete('/admin/milestones/:id', deleteMilestone);

export default contentRouter;
