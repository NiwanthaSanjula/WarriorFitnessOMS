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
    
    updatePlan: async (id: string, planData: Partial<MembershipPlan>): Promise<MembershipPlan> => {
        const response = await api.patch(`/membership/plans/${id}`, planData);
        return response.data.data.plan;
    },
    
    deletePlan: async (id: string): Promise<void> => {
        await api.delete(`/membership/plans/${id}`);
    },

    //  Subscribe a member to a plan
    subscribeMember: async( memberId: string, planId: string ): Promise<any> => {
        const response = await api.post('/membership/subscribe', { memberId, planId });
        return response.data.data.subscription
    },

    //  Fetch all payments history
    getAllpayments : async (page: number = 1, search: string = ''): Promise<any>=> {
        const response = await api.get(`membership/payments/all?page=${page}&seatch=${search}`);
        return response.data.data
    },

    //  Fetch payment history of a member
    getMemberPayment : async (memberId: string, page: number = 1): Promise<any> => {
        const response = await api.get(`membership/payments/member/${memberId}?page=${page}`);
        return response.data.data.results;
    },

    //  Get pending payments
    getPendingPayments : async (page: number = 1) : Promise<any> => {
        const response = await api.get(`membership/pending-payments?page=${page}`);
        return response.data.data;
    },

    //  Optional: Add the manual sweep trigger
    runManualSweep: async (): Promise<any> => {
        const response = await api.get('/membership/run-sweep');
        return response.data.data;
    },

    // Member: Get own subscription
    getMySubscription: async (): Promise<any> => {
        const response = await api.get('/membership/my-subscription');
        return response.data.data.subscription;
    },

    // Member: Get own payment history
    getMyPayments: async (page: number = 1): Promise<any> => {
        const response = await api.get(`/membership/my-payments?page=${page}`);
        return response.data.data;
    },

    // Monthly revenue breakdown for last 12 months (for Finance report chart)
    getRevenueHistory: async (): Promise<any> => {
        const response = await api.get('/membership/payments/revenue-history');
        return response.data.data; // { monthlyRevenue: [{_id: {month, year}, total}] }
    },

    // 30-day revenue total (used in Finance summary cards)
    getRecentRevenue: async (): Promise<any> => {
        const response = await api.get('/membership/payments/recent-revenue');
        return response.data.data; // { recent: number }
    },
}