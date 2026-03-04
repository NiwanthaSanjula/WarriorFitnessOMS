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
membershipRouter.get('/pending-payments', restrictTo('admin'), membershipController.getPendingPayments );
membershipRouter.get('/payments/member/:memberId', restrictTo('admin'), membershipController.getMemberPayments );
membershipRouter.get('/run-sweep', restrictTo('admin'), membershipController.runExpirationSweep );

// Member routes (logged in, no admin required)
membershipRouter.get('/my-subscription', protect, membershipController.getMySubscription);
membershipRouter.get('/my-payments', protect, membershipController.getMyPayments);



export default membershipRouter;