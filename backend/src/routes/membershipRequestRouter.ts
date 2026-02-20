import express from 'express'
import * as membershipRequestController from '../controllers/membershipRequestController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js';


const membershipRequestRouter = express.Router();

membershipRequestRouter.post('/submit', membershipRequestController.submitInquiry );

membershipRequestRouter.use(protect);
membershipRequestRouter.use(restrictTo('admin'));

membershipRequestRouter.get('/inbox', membershipRequestController.getInbox);
membershipRequestRouter.patch('/approve/:id', membershipRequestController.approveInquiry);
membershipRequestRouter.patch('/reject/:id', membershipRequestController.rejectInquiry);


export default membershipRequestRouter