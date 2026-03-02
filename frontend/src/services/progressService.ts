/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api/axios";

export const progressService = {
    // Member: Add progress
    addProgress: async (progressData: any) => {
        const response = await api.post("/progress/add", progressData);
        return response.data.data.progress;
    },

    // Member: Get own progress history
    getMyProgress: async (page: number = 1) => {
        const response = await api.get(`/progress/my-progress?page=${page}`);
        return response.data.data;
    },

    // Member: Get progress comparison
    getProgressComparison: async (days: number = 30) => {
        const response = await api.get(`/progress/comparison?days=${days}`);
        return response.data.data;
    },

    // Coach: Get all members progress
    getCoachMembersProgress: async () => {
        const response = await api.get("/progress/coach/members-progress");
        return response.data.data.members;
    },

    // Coach: Add notes to progress
    addProgressNotes: async (progressId: string, notes: string) => {
        const response = await api.patch("/progress/coach/add-notes", {
            progressId,
            notes
        });
        return response.data.data.progress;
    },

    // Coach - Get members list
    getCoachMembers: async () => {
        const response = await api.get("/progress/coach/members");
        return response.data.data.members;
    },

    // Coach - Get member detail
    getCoachMemberDetail: async (memberId: string) => {
        const response = await api.get(`/progress/coach/members/${memberId}`);
        return response.data.data;
    },

    // Coach - Add feedback
    addCoachFeedback: async (
        memberId: string,
        progressId: string,
        notes: string
    ) => {
        const response = await api.patch("/progress/coach/members/feedback", {
            memberId,
            progressId,
            notes
        });
        return response.data.data.progress;
    },

    getProgressChartData: async (limit = 20) => {
        const res = await api.get(`/progress/chart-data?limit=${limit}`);
        return res.data.data;
    },
    
    getFitnessSummary: async () => {
        const res = await api.get(`/progress/summary`);
        return res.data.data;
    },
    
    getCoachMemberChartData: async (memberId: string) => {
        const res = await api.get(`/progress/coach/members/${memberId}/chart`);
        return res.data.data;
    },
};