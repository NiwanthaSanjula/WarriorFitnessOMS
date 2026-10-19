import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js'


const attendanceRouter = express.Router();

//  All attendance routes required being logged in
attendanceRouter.use(protect);
attendanceRouter.get('/my-history', attendanceController.getMyAttendance);

// Member: Get a fresh QR token (auto-expires in 5 min)
attendanceRouter.get('/my-qr', restrictTo('member'), attendanceController.getMyQRToken);

//  Only admins and Coaches can mark a member as present
attendanceRouter.post('/check-in', restrictTo('admin', 'coach'), attendanceController.markAttendance);

// Admin/Coach: Scan a QR code token and check in the member
attendanceRouter.post('/scan', restrictTo('admin', 'coach'), attendanceController.scanQRCheckIn);

export default attendanceRouter;