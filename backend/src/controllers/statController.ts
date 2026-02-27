import { NextFunction, Response } from "express";
import { CustomRequest } from "../types.js";
import * as statsService from '../services/statsService.js'

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