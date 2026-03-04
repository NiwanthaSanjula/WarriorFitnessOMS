import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js'


const attendanceRouter = express.Router();

//  All attendance routes required being logged in
attendanceRouter.use(protect);
attendanceRouter.get('/my-history', attendanceController.getMyAttendance);

//  Only admins and Coaches can mark a member as present
attendanceRouter.post('/check-in', restrictTo('admin', 'coach'), attendanceController.markAttendance);

export default attendanceRouter;