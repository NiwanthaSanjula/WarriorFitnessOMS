
import { Response, NextFunction } from "express";
import * as planService from "../services/planService.js";
import { AppError } from "../utils/appError.js";
import { CustomRequest } from "../types.js";

const coachOnly = (req: CustomRequest, next: NextFunction) => {
    if (!req.user?._id || req.user.role !== 'coach') {
        next(new AppError("Coaches only", 403));
        return false;
    }
    return true;
};

// ── WORKOUT PLANS ─────────────────────────────────────────────────

export const createWorkoutPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.createWorkoutPlan(req.user!._id!.toString(), req.body);
        res.status(201).json({ status: "success", data: { plan } });
    } catch (e) { next(e); }
};

export const getMyWorkoutPlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plans = await planService.getCoachWorkoutPlans(req.user!._id!.toString());
        res.status(200).json({ status: "success", results: plans.length, data: { plans } });
    } catch (e) { next(e); }
};

export const getWorkoutPlanById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.getWorkoutPlanById(
            req.params.planId as string, req.user!._id!.toString()
        );
        res.status(200).json({ status: "success", data: { plan } });
    } catch (e: any) {
        if (e.message === "Plan not found") return next(new AppError("Plan not found", 404));
        if (e.message === "Unauthorized") return next(new AppError("Unauthorized", 403));
        next(e);
    }
};

export const updateWorkoutPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.updateWorkoutPlan(
            req.params.planId as string, req.user!._id!.toString(), req.body
        );
        res.status(200).json({ status: "success", data: { plan } });
    } catch (e: any) {
        if (e.message === "Plan not found") return next(new AppError("Plan not found", 404));
        if (e.message === "Unauthorized") return next(new AppError("Unauthorized", 403));
        next(e);
    }
};

export const deleteWorkoutPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        await planService.deleteWorkoutPlan(req.params.planId as string, req.user!._id!.toString());
        res.status(204).json({ status: "success", data: null });
    } catch (e: any) {
        if (e.message === "Plan not found") return next(new AppError("Plan not found", 404));
        if (e.message.includes("Cannot delete")) return next(new AppError(e.message, 400));
        next(e);
    }
};

// ── NUTRITION PLANS ───────────────────────────────────────────────

export const createNutritionPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.createNutritionPlan(req.user!._id!.toString(), req.body);
        res.status(201).json({ status: "success", data: { plan } });
    } catch (e) { next(e); }
};

export const getMyNutritionPlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plans = await planService.getCoachNutritionPlans(req.user!._id!.toString());
        res.status(200).json({ status: "success", results: plans.length, data: { plans } });
    } catch (e) { next(e); }
};

export const getNutritionPlanById = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.getNutritionPlanById(
            req.params.planId as string, req.user!._id!.toString()
        );
        res.status(200).json({ status: "success", data: { plan } });
    } catch (e: any) {
        if (e.message === "Plan not found") return next(new AppError("Plan not found", 404));
        next(e);
    }
};

export const updateNutritionPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plan = await planService.updateNutritionPlan(
            req.params.planId as string, req.user!._id!.toString(), req.body
        );
        res.status(200).json({ status: "success", data: { plan } });
    } catch (e: any) {
        if (e.message === "Plan not found") return next(new AppError("Plan not found", 404));
        next(e);
    }
};

export const deleteNutritionPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        await planService.deleteNutritionPlan(req.params.planId as string, req.user!._id!.toString());
        res.status(204).json({ status: "success", data: null });
    } catch (e: any) {
        if (e.message.includes("Cannot delete")) return next(new AppError(e.message, 400));
        next(e);
    }
};

// ── ASSIGNMENTS ───────────────────────────────────────────────────

export const assignPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const { memberId, planType, planId, startDate, coachNotes } = req.body;
        if (!memberId || !planType || !planId)
            return next(new AppError("memberId, planType, and planId are required", 400));

        const assignment = await planService.assignPlanToMember(
            req.user!._id!.toString(),
            memberId, planType, planId,
            startDate ? new Date(startDate) : undefined,
            coachNotes
        );
        res.status(201).json({ status: "success", data: { assignment } });
    } catch (e: any) {
        if (e.message.includes("not found") || e.message.includes("not assigned"))
            return next(new AppError(e.message, 404));
        next(e);
    }
};

export const updateAssignmentStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const { status } = req.body;
        const assignment = await planService.updatePlanAssignmentStatus(
            req.params.assignmentId as string,
            req.user!._id!.toString(),
            status
        );
        res.status(200).json({ status: "success", data: { assignment } });
    } catch (e) { next(e); }
};

// ── MEMBER-FACING ─────────────────────────────────────────────────

export const getMyActivePlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?._id?.toString();
        if (!memberId) return next(new AppError("Login required", 401));
        const plans = await planService.getMemberActivePlans(memberId);
        res.status(200).json({ status: "success", data: plans });
    } catch (e) { next(e); }
};

export const getMyPlanHistory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?._id?.toString();
        if (!memberId) return next(new AppError("Login required", 401));
        const history = await planService.getMemberPlanHistory(memberId);
        res.status(200).json({ status: "success", data: { history } });
    } catch (e) { next(e); }
};

// Used inside CoachMemberProfile
export const getCoachMemberPlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!coachOnly(req, next)) return;
        const plans = await planService.getCoachMemberPlans(
            req.params.memberId as string,
            req.user!._id!.toString()
        );
        res.status(200).json({ status: "success", data: plans });
    } catch (e: any) {
        if (e.message.includes("not assigned")) return next(new AppError(e.message, 403));
        next(e);
    }
};