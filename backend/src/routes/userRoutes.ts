import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { assignCoach, changePassword, createUser, getAllMembers, getCoachMembers, getMe, getMyProfile, getMyStudents, getUserbyId, updateMe, updateSpecialProfile, updateUser } from '../controllers/userController.js';



const userRouter = express.Router()

// Protect all routes
userRouter.use(protect);


// MEMBER & GENERAL ROUTES

userRouter.get('/me', getMe);
userRouter.patch('/updateMe', updateMe);
userRouter.patch('/change-password', changePassword);
userRouter.get('/my-profile', getMyProfile);

// COACH ROUTES

userRouter.get('/my-clients', restrictTo('coach'), getMyStudents);

// ADMIN ONLY ROUTES
userRouter.use(restrictTo('admin'));

userRouter.post('/create-user', createUser);
userRouter.get('/all-users', getAllMembers);
userRouter.patch('/assign-coach', assignCoach);

userRouter.patch('/:id/special-profile', updateSpecialProfile);
userRouter.get('/:id/assigned-members', getCoachMembers);


userRouter.route('/:id')
    .get(getUserbyId)
    .patch(updateUser);

export default userRouter;