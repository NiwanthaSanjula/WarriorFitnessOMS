import express from 'express';
import { login, logout, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getMe } from '../controllers/userController.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// Only logged user can access
authRouter.get('/me', protect,getMe);



export default authRouter;