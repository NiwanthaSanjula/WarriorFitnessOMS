 import express, { Application, Request, Response } from 'express';
 import cors from 'cors';
 import cookieParser from 'cookie-parser';
 import dotenv from 'dotenv';

 dotenv.config();

 const app: Application = express();

 // Middleware
 app.use(express.json()); // Parse incomming json
 app.use(cookieParser()); // Allow to read JWT from cookies
 app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials : true // Allow cookies to be sent in cross-origin requests
 }));

 // Health Check Endpoint
 app.get('/health', (req : Request, res : Response) => {
    res.status(200).json({ status: 'success', message : 'Warrior Fiteness API is healthy'});
 });

 // TODO: Global error handling here

 export default app;
 