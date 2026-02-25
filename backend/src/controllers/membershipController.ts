import { NextFunction, Request, Response } from "express";
import * as membershipService from '../services/membershipService.js'
import { AppError } from "../utils/appError.js";
import { CustomRequest } from "../types.js";


//  Create a new membership Plan
export const createPlan = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const newPlan = await membershipService.createPlan(req.body);

        res.status(201).json({
            status: 'success',
            data: { plan: newPlan }
        })

    } catch (error) {
        next(error)
    }
}

// Get All plans 
export const getAllPlans = async (req: Request, res: Response, next: NextFunction ) => {
    try {
        const plans = await membershipService.getAllPlans();

        res.status(200).json({
            status: 'success',
            results: plans.length,
            data: { plans }
        })

    } catch (error) {
        next(error)
    }
}

//  Subscribe a Member to a plan
export const subscribeMember = async (req: CustomRequest, res: Response, next: NextFunction ) => {
    try {
        const { memberId , planId } = req.body;
        const adminId = req.user?._id?.toString();

        if (!adminId) {
            return next(new AppError('Admin must logged in to perform this action', 401))
        }

        console.log(adminId);
        
        if (!memberId || !planId) {
            return next(new AppError('Please provide both memberId and planId', 400));    
        }

        const subscription = await membershipService.subscribeMember(memberId, planId, adminId);

        res.status(201).json({
            status : 'success',
            data: { subscription }
        })

    } catch (error) {
        next(error)
    }
}

//  Get payment history by member
export const getMemberPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = 12

        const results = await membershipService.getPaymentByMember(req.params.memberId as string, page, limit);
        
        res.status(200).json({
            status: 'success',
            data: { results }
        });

    } catch (error) {
        //console.log(error);
        next(error)
    }
}

export const getAllPayments = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search= (req.query.search as string) || '';

        const results = await membershipService.getAllPayments(page, 15, search);

        res.status(200).json({
            status: 'success',
            data: results
        })

    } catch (error) {
        next(error)
    }
}

export const runExpirationSweep = async( req: Request, res: Response, next: NextFunction) => {
    try {
        const report =  await membershipService.checkAndUpdateExpiredMembers();
        res.status(200).json({
            status: 'success',
            message:   `Sweep completed manually. ${ report.updatedCount} members updated.`,
            data: report
        })

    } catch (error) {
        next(error)
    }
}

export const getPendingPayments = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const results = await membershipService.getPendingPaymentMembers(page, 15);

        res.status(200).json({
            status: 'success',
            data: results
        })

    } catch (error) {
        
    }
}