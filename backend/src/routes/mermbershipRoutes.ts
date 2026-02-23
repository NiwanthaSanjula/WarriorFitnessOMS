import express from 'express'
import * as membershipController from '../controllers/membershipController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const membershipRouter = express.Router();

// Publicly accessible
membershipRouter.get('/plans', membershipController.getAllPlans )

//  All membership routes required being logged in
membershipRouter.use(protect)

//  Admin can CRUD plans
membershipRouter.post('/create-plan', restrictTo('admin'), membershipController.createPlan );
membershipRouter.post('/subscribe', restrictTo('admin'), membershipController.subscribeMember );
membershipRouter.get('/payments/all', restrictTo('admin'), membershipController.getAllPayments );
membershipRouter.get('/payments/member/:memberId', restrictTo('admin'), membershipController.getMemberPayments );

export default membershipRouter;