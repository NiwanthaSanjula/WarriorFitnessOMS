// FILE: src/services/planService.ts
// Replace your existing planService completely with this code

/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "../api/axios";

export const planService = {
    
    // ════════════════════════════════════════════════════════════════════
    // WORKOUT PLANS - COACH OPERATIONS
    // ════════════════════════════════════════════════════════════════════

    // Get all my workout plans
    getWorkoutPlans: async () => {
        try {
            const response = await api.get("/plans/workout");
            return response.data.data.plans || [];
        } catch (error) {
            console.error("Error fetching workout plans:", error);
            throw error;
        }
    },

    // Get single workout plan by ID
    getWorkoutPlanById: async (id: string) => {
        try {
            const response = await api.get(`/plans/workout/${id}`);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error fetching workout plan:", error);
            throw error;
        }
    },

    // Create new workout plan
    createWorkoutPlan: async (data: any) => {
        try {
            const response = await api.post("/plans/workout", data);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error creating workout plan:", error);
            throw error;
        }
    },

    // Update workout plan
    updateWorkoutPlan: async (id: string, data: any) => {
        try {
            const response = await api.patch(`/plans/workout/${id}`, data);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error updating workout plan:", error);
            throw error;
        }
    },

    // Delete workout plan
    deleteWorkoutPlan: async (id: string) => {
        try {
            await api.delete(`/plans/workout/${id}`);
            return true;
        } catch (error) {
            console.error("Error deleting workout plan:", error);
            throw error;
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // NUTRITION PLANS - COACH OPERATIONS
    // ════════════════════════════════════════════════════════════════════

    // Get all my nutrition plans
    getNutritionPlans: async () => {
        try {
            const response = await api.get("/plans/nutrition");
            return response.data.data.plans || [];
        } catch (error) {
            console.error("Error fetching nutrition plans:", error);
            throw error;
        }
    },

    // Get single nutrition plan by ID
    getNutritionPlanById: async (id: string) => {
        try {
            const response = await api.get(`/plans/nutrition/${id}`);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error fetching nutrition plan:", error);
            throw error;
        }
    },

    // Create new nutrition plan
    createNutritionPlan: async (data: any) => {
        try {
            const response = await api.post("/plans/nutrition", data);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error creating nutrition plan:", error);
            throw error;
        }
    },

    // Update nutrition plan
    updateNutritionPlan: async (id: string, data: any) => {
        try {
            const response = await api.patch(`/plans/nutrition/${id}`, data);
            return response.data.data.plan;
        } catch (error) {
            console.error("Error updating nutrition plan:", error);
            throw error;
        }
    },

    // Delete nutrition plan
    deleteNutritionPlan: async (id: string) => {
        try {
            await api.delete(`/plans/nutrition/${id}`);
            return true;
        } catch (error) {
            console.error("Error deleting nutrition plan:", error);
            throw error;
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // PLAN ASSIGNMENTS
    // ════════════════════════════════════════════════════════════════════

    // Assign plan to member
    assignPlan: async (data: {
        memberId: string;
        planType: "workout" | "nutrition";
        planId: string;
        startDate?: string;
        coachNotes?: string;
    }) => {
        try {
            const response = await api.post("/plans/assign", data);
            return response.data.data.assignment;
        } catch (error) {
            console.error("Error assigning plan:", error);
            throw error;
        }
    },

    // Update assignment status
    updateAssignmentStatus: async (
        assignmentId: string,
        status: "active" | "completed" | "cancelled"
    ) => {
        try {
            const response = await api.patch(`/plans/assign/${assignmentId}`, {
                status: status
            });
            return response.data.data.assignment;
        } catch (error) {
            console.error("Error updating assignment status:", error);
            throw error;
        }
    },

    // Get member's plans (coach view)
    getCoachMemberPlans: async (memberId: string) => {
        try {
            const response = await api.get(`/plans/coach/members/${memberId}/plans`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching member plans:", error);
            throw error;
        }
    },

    // ════════════════════════════════════════════════════════════════════
    // MEMBER OPERATIONS
    // ════════════════════════════════════════════════════════════════════

    // Get my active plans (member view)
    getMyActivePlans: async () => {
        try {
            const response = await api.get("/plans/my-plans");
            return response.data.data;
        } catch (error) {
            console.error("Error fetching my active plans:", error);
            throw error;
        }
    },

    // Get my plan history (member view)
    getMyPlanHistory: async () => {
        try {
            const response = await api.get("/plans/my-plans/history");
            return response.data.data.history || [];
        } catch (error) {
            console.error("Error fetching my plan history:", error);
            throw error;
        }
    }
};