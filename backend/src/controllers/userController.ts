import { Request, Response, NextFunction} from 'express';
import * as userServices from '../services/userServices.js'
import { CustomRequest } from '../types.js';
import { AppError } from '../utils/appError.js';
import { filterObj } from '../utils/filterObj.js';
import User from '../models/User.js';

export const getMe = ( req: CustomRequest, res: Response, next: NextFunction) => {

    //the 'protect' middleware already found the user and attached it to req.user
    const user = req.user;

    if (!user) {
        return next(new AppError('No user found', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
};

export const getAllMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const members =  await userServices.getAllUsers();

        res.status(200).json({
            status: 'success',
            results: members.length,
            data: { members }
        });

    } catch (error) {
        next(error)
    }
}

export const getUserbyId = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const user = await userServices.getUserbyId(req.params.id as string);

        if (!user) {
            return next(new AppError('No user found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });

    } catch (error) {
        next(error)
    }
}

export const updateMe = async( req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        // Create error if user POSTs password data ( we have a separate route for that)
        if (req.body.password || req.body.passwordConfirm) {
            return next(new AppError('This route is not for password updates.Please use /updatePassword', 400));
        }

        //  Filter out unwanted fileds(ex: role)
        const filteredBody = filterObj(req.body, 'name', 'email');

        //  Update user document in db
        const updatedUser = await User.findByIdAndUpdate(req.user?._id, filteredBody, { 
            new: true, // Return the new updated document
            runValidators: true //  Ensures the new data follows our Schema rues
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
            },
        });

    } catch(error) {
        next(error);
    }
}

