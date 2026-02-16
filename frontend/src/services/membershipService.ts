/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api/axios";

export interface MembershipPlan {
    _id: string;
    name: string;
    price: number;
    durationDays: number;
    description?: string;
    isActive: boolean
}

export const membershipService = {

    //  Fetch all plans
    getPlans: async (): Promise<MembershipPlan[]> => {
        const response = await api.get('/membership/plans');
        return response.data.data.plans
    },

    //  Create a new plan
    createPlan: async (planData: Partial<MembershipPlan>): Promise<MembershipPlan> => {
        const response = await api.post('/membership/create-plan', planData);
        return response.data.data.plan        
    },

    //  Subscribe a member to a plan
    subscribeMember: async( memberId: string, planId: string ): Promise<any> => {
        const response = await api.post('/membership/subscribe', { memberId, planId });
        return response.data.data.subscription
    }


}