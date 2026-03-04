import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as statsController from '../controllers/statController.js'

const statsRouter = express.Router();
statsRouter.get('/admin-dashboard', protect, restrictTo('admin'), statsController.getDashboardStats);
statsRouter.get('/member-dashboard', protect, statsController.getMemberDashboard);
statsRouter.get('/coach-dashboard', protect, restrictTo('coach'), statsController.getCoachDashboard);

export default statsRouter;