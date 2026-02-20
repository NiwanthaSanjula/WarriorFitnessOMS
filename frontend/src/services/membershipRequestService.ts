import api from "../api/axios";

export interface MembershipRequest {
    _id: string,
    name: string,
    email: string,
    phone: string,
    interestedPlan: {
        _id: string,
        name: string,
        price: number;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const membershipRequestService = {

    //  Admin: fetch all pending inquiries
    getInbox: async (): Promise<MembershipRequest[]> => {
        const respose = await api.get('membership-requests/inbox');
        console.log(respose.data);
        
        return respose.data.data.requests;
    },

    //  Admin: Approve a request 
    approveRequest: async (requestId: string): Promise<void> => {
        await api.patch(`/membership-requests/approve/${requestId}`)
    },

    //  Admin: Reject a request
    rejectRequest : async (requestId: string):Promise<void> => {
        await api.patch(`/membership-requests/reject/${requestId}`);
    }
}