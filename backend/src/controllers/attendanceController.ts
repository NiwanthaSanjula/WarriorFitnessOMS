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
        // Handle Duplicate Check-in ( mongoDB error 11000)
        if (error.code === 11000) {
            return next(new AppError('Warrior is already checked in for today!', 400))
        }
        next(error)
    }
}