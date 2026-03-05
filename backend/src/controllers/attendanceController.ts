import { NextFunction, Response } from "express";
import { CustomRequest } from "../types.js";
import { AppError } from "../utils/appError.js";
import * as attendanceService from "../services/attendanceService.js";

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