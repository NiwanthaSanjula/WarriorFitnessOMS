import { NextFunction, Request, Response } from "express";
import * as membershipRequestService from '../services/membershipRequestService.js'

export const submitInquiry = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const request = await membershipRequestService.createRequest( req.body );
        res.status(201).json({ status: 'success', data: { request } });

    } catch (error) {
        next(error)
    }
}

export const getInbox = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const requests = await membershipRequestService.getPendingRequests();
        res.status(201).json({ status: 'success', data: { requests } });

    } catch (error) {
        next(error)
    }
}

export const approveInquiry = async (req: Request, res: Response, next: NextFunction ) => {
    try {
        const newUser = await membershipRequestService.approveAndCreateUser(req.params.id as string);
        res.status(200).json({
            status: 'success',
            message: 'Inquiry approved and User account created',
            data: { user: newUser }
        })

    } catch (error) {
        next(error)
    }
}

export const rejectInquiry = async (req: Request, res: Response, next:NextFunction ) => {
    try {
        await membershipRequestService.rejectTnquiry(req.params.id as string);
        res.status(200).json({
            status: 'success',
            message: 'Inquiry has been rejected'
        })

    } catch (error) {
        next(error)
    }
}