import { NextFunction, Response } from "express";
import { CustomRequest } from "../types.js";
import * as statsService from '../services/statsService.js'
import { AppError } from "../utils/appError.js";

export const getDashboardStats = async (req: CustomRequest, res: Response, next:NextFunction) => {
    try {
        const stats = await statsService.getAdminStats();
        res.status(200).json({
            status: 'success',
            data: stats
        })

    } catch (error) {
        next(error)
    }
}

export const getMemberDashboard = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) return next(new AppError('Login required', 401));

        const stats = await statsService.getMemberStats(userId);

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) { next(error); }
};