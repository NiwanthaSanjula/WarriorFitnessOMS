import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initCronjobs } from './utils/cronJobs.js'

import { globalErrorHandler } from './middleware/errorMiddleware.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import membershipRouter from './routes/mermbershipRoutes.js';
import statsRouter from './routes/statsRouter.js';
import progressRouter from './routes/progressRoutes.js';
import planRouter from './routes/planRouter.js';
import expenseRouter from './routes/ExpenseRouter.js';
import uploadRouter from './routes/uploadRouter.js';
import contentRouter from './routes/contentRouter.js';

const app: Application = express();

// Get client URL from environment
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase payload limit
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// CORS Configuration for Railway
app.use(cors({
   origin: function (origin, callback) {
      const allowedOrigins = [
         'http://localhost:5173',
         'http://localhost:3000',
         CLIENT_URL,
         process.env.FRONTEND_URL || '',
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize cron jobs
initCronjobs();

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/membership', membershipRouter);
app.use('/api/v1/dashboard', statsRouter);
app.use('/api/v1/progress', progressRouter);
app.use('/api/v1/plans', planRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/content', contentRouter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
   res.status(200).json({ 
      status: 'success', 
      message: 'Warrior Fitness API is healthy',
      timestamp: new Date().toISOString()
   });
});

// Global error handling
app.use(globalErrorHandler);

export default app;