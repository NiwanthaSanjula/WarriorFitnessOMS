import { Request, Response, NextFunction } from "express";
import * as authService from '../services/authService.js';
import { signToken } from "../utils/jwt.js";

export const register = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await authService.registerUser(req.body);
         res.status(201).json({
            status: 'success',
            message: 'Member registered successfully',
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                },
            },
        });

    } catch (error) {
        next(error);  // Send error to the global handler

    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.loginUser(req.body);
        const token = signToken(user._id.toString());

        // Set cookie options
        const cookieOptions = {
            expires : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly : true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const
        };
        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            status: 'success',
            message: 'Logged in successfully',
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role}
            }
        });

    } catch (error) {
        next(error);
    }
}

export const logout = (req: Request, res: Response) => {
    // We send a new cookie with the same name but set is to 'loggedout'
    // and make it expire immediatly (10 sec)
    res.cookie('jwt','loggedout', {
        expires : new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ status: 'success', message: 'Logged out successfully'});
}

