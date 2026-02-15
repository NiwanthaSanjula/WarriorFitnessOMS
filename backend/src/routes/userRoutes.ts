import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { getAllMembers, getMe, getUserbyId, updateMe } from '../controllers/userController.js';


const userRouter = express.Router()

// Protect all routes
userRouter.use(protect);

// Member routes
userRouter.get('/me', getMe);
userRouter.patch('/updateMe', updateMe);

//Admin only routes
userRouter.get('/all-users', restrictTo('admin'), getAllMembers);
userRouter.get('/:id', restrictTo('admin'), getUserbyId)

export default userRouter;