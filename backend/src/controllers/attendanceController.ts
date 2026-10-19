import { NextFunction, Response } from "express";
import { CustomRequest } from "../types.js";
import { AppError } from "../utils/appError.js";
import * as attendanceService from "../services/attendanceService.js";
import User from "../models/User.js";

export const markAttendance = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {

        // The Admin provides the Member's ID in the request body
        const { userId }  = req.body;

        if (!userId) {
            return next(new AppError('Please provide a user ID for attendance', 400));
        }

        const attendance = await attendanceService.createAttendanceRecord(userId);

        res.status(201).json({
            status:'success',
            data: { attendance }
        });


    } catch (error: any) {
        // Handle Duplicate Check-in
        if (error.code === 11000) {
            return next(new AppError('Warrior is already checked in for today!', 400))
        }
        next(error)
    }
}

// Member: Get own attendance history for the current year
export const getMyAttendance = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) return next(new AppError('Login required', 401));

        const history = await attendanceService.getMemberAttendanceHistory(userId);

        res.status(200).json({
            status: 'success',
            data: { history }
        });
    } catch (error) { next(error); }
};

// Member: Generate a fresh 5-minute QR token for their check-in QR code
export const getMyQRToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) return next(new AppError('Login required', 401));

        const token = attendanceService.generateQRToken(userId);

        // Return token + member info so the QR page can display name/photo
        const member = await User.findById(userId).select('name profileImage');

        res.status(200).json({
            status: 'success',
            data: { token, member, expiresIn: 300 } // 300 seconds = 5 min
        });
    } catch (error) { next(error); }
};

// Admin/Coach: Receive scanned QR token and record attendance
export const scanQRCheckIn = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        if (!token) return next(new AppError('QR token is required', 400));

        const { attendance, userId } = await attendanceService.verifyQRAndCheckIn(token);

        // Fetch member info to show in the success response
        const member = await User.findById(userId).select('name profileImage status');

        res.status(201).json({
            status: 'success',
            data: { attendance, member }
        });

    } catch (error: any) {
        // Duplicate check-in (already here today)
        if (error.code === 11000) {
            return next(new AppError('This warrior is already checked in for today!', 400));
        }
        // Token expired / invalid
        next(new AppError(error.message || 'QR scan failed', 400));
    }
};