import { Response, NextFunction } from "express";
import { CustomRequest } from "../types.js";
import jwt from 'jsonwebtoken';
import { AppError } from "../utils/appError.js";
import User from "../models/User.js";

interface JwtPayload {
    id: string;
}

export const protect =  async ( req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;

        // Get token from cookies
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AppError('You are not logged in.Please log in!', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

        // Check user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError('User no longer exist.', 401));
        }

        // Grant access to protected route
        req.user = currentUser;
        next();

    } catch (error) {
        next(new AppError('Invalid token. Please log in again!', 401));
    }
};

export const restrictTo = (...roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !roles.includes(user.role)) {
            return next(new AppError('You do not have permission to perform this action', 400))
        }

        next();
    };
};
