import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as exerciseController from '../controllers/exerciseController.js';

const exerciseRouter = express.Router();

// Everyone must be logged in to see exercises
exerciseRouter.use(protect);

exerciseRouter.get('/', exerciseController.getExercises);

// ONLY admins and coaches can add new exercises to the library
exerciseRouter.post('/create-exercise', restrictTo('admin', 'coach'), exerciseController.createNewExercise);

export default exerciseRouter;