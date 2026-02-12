 import express, { Application, Request, Response } from 'express';
 import cors from 'cors';
 import cookieParser from 'cookie-parser';
 import dotenv from 'dotenv';
import { globalErrorHandler } from './middleware/errorMiddleware.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';


 dotenv.config();

 const app: Application = express();

 // Middleware
 app.use(express.json()); // Parse incomming json
 app.use(cookieParser()); // Allow to read JWT from cookies
 app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials : true // Allow cookies to be sent in cross-origin requests
 }));

 // Routes
 app.use('/api/v1/auth', authRouter);
 app.use('/api/v1/users', userRouter)

 // Health Check Endpoint
 app.get('/health', (req : Request, res : Response) => {
    res.status(200).json({ status: 'success', message : 'Warrior Fiteness API is healthy'});
 });

 // Global error handling
 app.use(globalErrorHandler)

 export default app;
 