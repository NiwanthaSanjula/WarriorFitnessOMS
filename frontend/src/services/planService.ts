/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "../api/axios";


export const planService = {
    // ── Workout Plans ──────────────────────────────────────────────
    getWorkoutPlans: async () => {
        const res = await api.get("/plans/workout");
        return res.data.data.plans;
    },
    getWorkoutPlanById: async (id: string) => {
        const res = await api.get(`/plans/workout/${id}`);
        return res.data.data.plan;
    },
    createWorkoutPlan: async (data: any) => {
        const res = await api.post("/plans/workout", data);
        return res.data.data.plan;
    },
    updateWorkoutPlan: async (id: string, data: any) => {
        const res = await api.patch(`/plans/workout/${id}`, data);
        return res.data.data.plan;
    },
    deleteWorkoutPlan: async (id: string) => {
        await api.delete(`/plans/workout/${id}`);
    },

    // ── Nutrition Plans ────────────────────────────────────────────
    getNutritionPlans: async () => {
        const res = await api.get("/plans/nutrition");
        return res.data.data.plans;
    },
    getNutritionPlanById: async (id: string) => {
        const res = await api.get(`/plans/nutrition/${id}`);
        return res.data.data.plan;
    },
    createNutritionPlan: async (data: any) => {
        const res = await api.post("/plans/nutrition", data);
        return res.data.data.plan;
    },
    updateNutritionPlan: async (id: string, data: any) => {
        const res = await api.patch(`/plans/nutrition/${id}`, data);
        return res.data.data.plan;
    },
    deleteNutritionPlan: async (id: string) => {
        await api.delete(`/plans/nutrition/${id}`);
    },

    // ── Assignments ────────────────────────────────────────────────
    assignPlan: async (data: {
        memberId: string;
        planType: "workout" | "nutrition";
        planId: string;
        startDate?: string;
        coachNotes?: string;
    }) => {
        const res = await api.post("/plans/assign", data);
        return res.data.data.assignment;
    },
    updateAssignmentStatus: async (
        assignmentId: string,
        status: "completed" | "paused" | "cancelled"
    ) => {
        const res = await api.patch(`/plans/assign/${assignmentId}`, { status });
        return res.data.data.assignment;
    },
    getCoachMemberPlans: async (memberId: string) => {
        const res = await api.get(`/plans/coach/members/${memberId}/plans`);
        return res.data.data;
    },

    // ── Member ─────────────────────────────────────────────────────
    getMyActivePlans: async () => {
        const res = await api.get("/plans/my-plans");
        return res.data.data;
    },
    getMyPlanHistory: async () => {
        const res = await api.get("/plans/my-plans/history");
        return res.data.data.history;
    },
};