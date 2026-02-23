import { Request, Response, NextFunction} from 'express';
import * as userServices from '../services/userServices.js'
import { CustomRequest } from '../types.js';
import { AppError } from '../utils/appError.js';
import { filterObj } from '../utils/filterObj.js';
import User from '../models/User.js';
import * as attendanceService from '../services/attendanceService.js';

export const createUser  = async ( req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user?._id?.toString();

        if (!adminId) {
            return next(new AppError('Admin must logged in to perform this action', 401))
        }

        const newUser = await userServices.createManualUser(req.body, adminId);

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                user: newUser
            }
        })

    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        // Prevent the admin from changing passwords through this route
        if (req.body.password || req.body.confirmPassword) {
            return next(new AppError('This route is not for password updates', 400))
        }

        const updatedUser = await userServices.updateUser(req.params.id as string, req.body )

        if (!updatedUser) {
            return next(new AppError('No user found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: {
                user: updatedUser
            }
        })

    } catch (error) {
        console.log(error);
        next(error)
        
    }
}

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
                nic: user.nic,
                phone: user.phone,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
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
        const details = await userServices.getUserbyId(req.params.id as string);

        if (!details.user) {
            return next(new AppError('No user found with that ID', 404))
        }

        // Get detailed attendance for the calendar
        const attendanceHistory = await attendanceService.getMemberAttendanceHistory(req.params.id as string);

        // Get list of all coaches for the "Assign Coach" dropdown
        const coaches = await User.find({ role: 'coach'}).select('name _id');

        res.status(200).json({
            status: 'success',
            data: {
                user: details.user,
                subscription: details.subscription,
                attendanceHistory,
                coaches
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

export const assignCoach = async ( req: CustomRequest, res: Response, next: NextFunction ) => {
    try {
        const { memberId, coachId } = req.body;

        if (!memberId || !coachId) {
            return next(new AppError("Member ID and Coach ID are required", 400));
        }
        
        const updatedMember = await userServices.assignCoach(memberId, coachId);

        if (!updatedMember) {
            return next(new AppError('No member found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                member: updatedMember
            }
        });

    } catch (error) {
        next(error)
    }
}

export const getMyStudents = async ( req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const coachId = req.user?._id

        if (!coachId) {
            return next(new AppError('No coach found', 404))
        }
        const clients = await userServices.getMembersByCoach(coachId.toString());

        res.status(200).json({
            status: 'success',
            results: clients.length,
            data: { clients }
        })

    } catch (error) {
        next(error)
    }
}


