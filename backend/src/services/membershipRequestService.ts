
import MembershipRequest, { IMembershipRequest } from "../models/MembershipRequest.js";
import User from "../models/User.js";

//  Create a new inquiry from the public from
export const createRequest = async ( requestData: Partial<IMembershipRequest> ) => {
    return await MembershipRequest.create(requestData);
}

// Get all pending requests
export const getPendingRequests = async () => {
    return await MembershipRequest.find({ status: 'pending'})
        .populate('interestedPlan', 'name price durationDays')
        .sort({ createdAt: -1 })
}

//  Approve req.
export const approveAndCreateUser = async ( requestId: string) => {
    const request = await MembershipRequest.findById(requestId);
    if ( !request ) throw new Error('Request not found');

    //  Update Reques Status
    request.status = 'approved';
    await request.save();

    //  Create the official User
    return await User.create({
        name: request.name,
        email: request.email,
        status: 'pending-payment',
        passwordHash: request.email + "@WARRIORFITNESS"
    })
}

//  Reject request
export const rejectTnquiry = async (requestId: string ) => {
    const request = await MembershipRequest.findById(requestId);
    if (!request) throw new Error('Request not found!');

    request.status = 'rejected';
    return await request.save();
}