import { NextFunction, Request, Response } from "express";
import * as membershipService from '../services/membershipService.js'
import { AppError } from "../utils/appError.js";
import { stat } from "fs";

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
export const subscribeMember = async (req: Request, res: Response, next: NextFunction ) => {
    try {
        const { memberId , planId } = req.body;

        if (!memberId || !planId) {
            return next(new AppError('Please provide both memberId and planId', 400));    
        }

        const subscription = await membershipService.subscribeMember(memberId, planId);

        res.status(201).json({
            status : 'success',
            data: { subscription }
        })

    } catch (error) {
        next(error)
    }
}