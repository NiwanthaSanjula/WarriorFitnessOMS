import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // If the error doesn't have status code, default to 500 (Internal Server Error)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,

        // Only show the stack trace if we are in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};