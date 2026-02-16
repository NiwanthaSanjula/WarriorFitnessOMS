import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { assignCoach, getAllMembers, getMe, getMyStudents, getUserbyId, updateMe } from '../controllers/userController.js';


const userRouter = express.Router()

// Protect all routes
userRouter.use(protect);

// Member routes
userRouter.get('/me', getMe);
userRouter.patch('/updateMe', updateMe);

//Admin only routes
userRouter.get('/my-clients', restrictTo('coach'), getMyStudents);
userRouter.patch('/assign-coach', restrictTo('admin'), assignCoach);
userRouter.get('/all-users', restrictTo('admin'), getAllMembers);

userRouter.get('/:id', restrictTo('admin'), getUserbyId);

export default userRouter;