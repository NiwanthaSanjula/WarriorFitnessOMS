// FILE: src/controllers/planController.ts
// Replace your existing planController completely with this code

import { Request, Response, NextFunction } from "express";
import WorkoutPlan from "../models/WorkoutPlan.js";
import NutritionPlan from "../models/NutritionPlan.js";
import MemberPlan from "../models/MemberPlan.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { CustomRequest } from "../types.js";

// ════════════════════════════════════════════════════════════════════════════════
// WORKOUT PLANS - COACH ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════

// Get all workout plans created by this coach
export const getMyWorkoutPlans = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;

        if (!coachId) {
            return next(new AppError("Coach ID not found", 401));
        }

        // Find all workout plans where coach is the creator
        const plans = await WorkoutPlan.find({ coach: coachId }).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            results: plans.length,
            data: {
                plans: plans
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single workout plan by ID
export const getWorkoutPlanById = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Find plan and verify it belongs to this coach
        const plan = await WorkoutPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Workout plan not found or not authorized", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                plan: plan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create new workout plan
export const createWorkoutPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;

        if (!coachId) {
            return next(new AppError("Coach ID not found", 401));
        }

        // Get data from request body
        const {
            title,
            description,
            durationWeeks,
            difficulty,
            goal,
            daysPerWeek,
            schedule,
            isTemplate
        } = req.body;

        // Validate required fields
        if (!title || !durationWeeks || !difficulty || !goal || !daysPerWeek) {
            return next(new AppError("Please provide all required fields", 400));
        }

        if (!schedule || schedule.length === 0) {
            return next(new AppError("Please provide at least one workout day", 400));
        }

        // Create new workout plan
        const newPlan = await WorkoutPlan.create({
            title,
            description: description || "",
            coach: coachId,
            durationWeeks,
            difficulty,
            goal,
            daysPerWeek,
            schedule: schedule,
            isTemplate: isTemplate !== undefined ? isTemplate : true
        });

        res.status(201).json({
            status: "success",
            data: {
                plan: newPlan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update workout plan
export const updateWorkoutPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Check if plan exists and belongs to coach
        const plan = await WorkoutPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Workout plan not found or not authorized", 404));
        }

        // Update fields
        const {
            title,
            description,
            durationWeeks,
            difficulty,
            goal,
            daysPerWeek,
            schedule,
            isTemplate
        } = req.body;

        if (title) plan.title = title;
        if (description !== undefined) plan.description = description;
        if (durationWeeks) plan.durationWeeks = durationWeeks;
        if (difficulty) plan.difficulty = difficulty;
        if (goal) plan.goal = goal;
        if (daysPerWeek) plan.daysPerWeek = daysPerWeek;
        if (schedule) plan.schedule = schedule;
        if (isTemplate !== undefined) plan.isTemplate = isTemplate;

        const updatedPlan = await plan.save();

        res.status(200).json({
            status: "success",
            data: {
                plan: updatedPlan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete workout plan
export const deleteWorkoutPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Check if plan exists and belongs to coach
        const plan = await WorkoutPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Workout plan not found or not authorized", 404));
        }

        // Delete the plan
        await WorkoutPlan.deleteOne({ _id: planId });

        // Also delete any assignments of this plan
        await MemberPlan.deleteMany({
            plan: planId,
            planType: "workout"
        });

        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// ════════════════════════════════════════════════════════════════════════════════
// NUTRITION PLANS - COACH ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════

// Get all nutrition plans created by this coach
export const getMyNutritionPlans = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;

        if (!coachId) {
            return next(new AppError("Coach ID not found", 401));
        }

        // Find all nutrition plans where coach is the creator
        const plans = await NutritionPlan.find({ coach: coachId }).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            results: plans.length,
            data: {
                plans: plans
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single nutrition plan by ID
export const getNutritionPlanById = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Find plan and verify it belongs to this coach
        const plan = await NutritionPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Nutrition plan not found or not authorized", 404));
        }

        res.status(200).json({
            status: "success",
            data: {
                plan: plan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Create new nutrition plan
export const createNutritionPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;

        if (!coachId) {
            return next(new AppError("Coach ID not found", 401));
        }

        // Get data from request body
        const {
            title,
            description,
            goal,
            dailyCalorieTarget,
            dailyProteinTarget,
            dailyCarbTarget,
            dailyFatTarget,
            durationWeeks,
            schedule,
            restrictions,
            isTemplate
        } = req.body;

        // Validate required fields
        if (!title || !goal || !durationWeeks) {
            return next(new AppError("Please provide all required fields", 400));
        }

        if (!schedule || schedule.length === 0) {
            return next(new AppError("Please provide at least one day schedule", 400));
        }

        // Create new nutrition plan
        const newPlan = await NutritionPlan.create({
            title,
            description: description || "",
            coach: coachId,
            goal,
            dailyCalorieTarget: dailyCalorieTarget || null,
            dailyProteinTarget: dailyProteinTarget || null,
            dailyCarbTarget: dailyCarbTarget || null,
            dailyFatTarget: dailyFatTarget || null,
            durationWeeks,
            schedule: schedule,
            restrictions: restrictions || [],
            isTemplate: isTemplate !== undefined ? isTemplate : true
        });

        res.status(201).json({
            status: "success",
            data: {
                plan: newPlan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update nutrition plan
export const updateNutritionPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Check if plan exists and belongs to coach
        const plan = await NutritionPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Nutrition plan not found or not authorized", 404));
        }

        // Update fields
        const {
            title,
            description,
            goal,
            dailyCalorieTarget,
            dailyProteinTarget,
            dailyCarbTarget,
            dailyFatTarget,
            durationWeeks,
            schedule,
            restrictions,
            isTemplate
        } = req.body;

        if (title) plan.title = title;
        if (description !== undefined) plan.description = description;
        if (goal) plan.goal = goal;
        if (dailyCalorieTarget !== undefined) plan.dailyCalorieTarget = dailyCalorieTarget;
        if (dailyProteinTarget !== undefined) plan.dailyProteinTarget = dailyProteinTarget;
        if (dailyCarbTarget !== undefined) plan.dailyCarbTarget = dailyCarbTarget;
        if (dailyFatTarget !== undefined) plan.dailyFatTarget = dailyFatTarget;
        if (durationWeeks) plan.durationWeeks = durationWeeks;
        if (schedule) plan.schedule = schedule;
        if (restrictions) plan.restrictions = restrictions;
        if (isTemplate !== undefined) plan.isTemplate = isTemplate;

        const updatedPlan = await plan.save();

        res.status(200).json({
            status: "success",
            data: {
                plan: updatedPlan
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete nutrition plan
export const deleteNutritionPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { planId } = req.params;
        const coachId = req.user?._id;

        // Check if plan exists and belongs to coach
        const plan = await NutritionPlan.findOne({
            _id: planId,
            coach: coachId
        });

        if (!plan) {
            return next(new AppError("Nutrition plan not found or not authorized", 404));
        }

        // Delete the plan
        await NutritionPlan.deleteOne({ _id: planId });

        // Also delete any assignments of this plan
        await MemberPlan.deleteMany({
            plan: planId,
            planType: "nutrition"
        });

        res.status(204).json({
            status: "success",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// ════════════════════════════════════════════════════════════════════════════════
// PLAN ASSIGNMENTS - COACH & MEMBER
// ════════════════════════════════════════════════════════════════════════════════

export const assignPlan = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;
        const { memberId, planType, planId, startDate, coachNotes } = req.body;

        console.log("Assigning plan:", { memberId, planType, planId });

        if (!memberId || !planType || !planId) {
            return next(new AppError("Please provide memberId, planType, and planId", 400));
        }

        // Frontend sends "workout" or "nutrition" — convert to Mongoose model name
        if (!["workout", "nutrition"].includes(planType)) {
            return next(new AppError("planType must be 'workout' or 'nutrition'", 400));
        }

        const planModel = planType === "workout" ? "WorkoutPlan" : "NutritionPlan";

        const member = await User.findById(memberId);
        if (!member) return next(new AppError("Member not found", 404));

        let plan;
        if (planModel === "WorkoutPlan") {
            plan = await WorkoutPlan.findOne({ _id: planId, coach: coachId });
        } else {
            plan = await NutritionPlan.findOne({ _id: planId, coach: coachId });
        }
        if (!plan) return next(new AppError("Plan not found or not authorized", 404));

        await MemberPlan.updateMany(
            { member: memberId, planType: planModel, status: "active" },
            { $set: { status: "cancelled" } }
        );
        
        const assignment = await MemberPlan.create({
            member: memberId,
            coach: coachId,
            planType: planModel,
            plan: planId,
            status: "active",
            startDate: startDate ? new Date(startDate) : new Date(),
            coachNotes: coachNotes || ""
        });

        console.log("Assignment created:", assignment);

        res.status(201).json({
            status: "success",
            data: { assignment }
        });
    } catch (error) {
        console.error("assignPlan ERROR:", error);
        next(error);
    }
};

// Update assignment status
export const updateAssignmentStatus = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id;
        const { assignmentId } = req.params;
        const { status } = req.body;

        // Check if status is valid
        if (!["active", "completed", "cancelled"].includes(status)) {
            return next(new AppError("Invalid status", 400));
        }

        // Find assignment and verify coach owns it
        const assignment = await MemberPlan.findOne({
            _id: assignmentId,
            coach: coachId
        });

        if (!assignment) {
            return next(new AppError("Assignment not found or not authorized", 404));
        }

        assignment.status = status;
        await assignment.save();

        res.status(200).json({
            status: "success",
            data: {
                assignment: assignment
            }
        });
    } catch (error) {
        next(error);
    }
};

// getCoachMemberPlans — just use .populate('plan'), refPath does the rest
export const getCoachMemberPlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const coachId = req.user?._id;
        const { memberId } = req.params;

        const assignments = await MemberPlan.find({ member: memberId, coach: coachId })
            .populate('plan')   // refPath on schema auto-selects WorkoutPlan or NutritionPlan
            .sort({ createdAt: -1 });

        const workoutPlan   = assignments.find(a => a.planType === "WorkoutPlan"   && a.status === "active") || null;
        const nutritionPlan = assignments.find(a => a.planType === "NutritionPlan" && a.status === "active") || null;

        res.status(200).json({
            status: "success",
            data: { workoutPlan, nutritionPlan, allAssignments: assignments }
        });
    } catch (error) {
        next(error);
    }
};

// ════════════════════════════════════════════════════════════════════════════════
// MEMBER ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════

// getMyActivePlans — filter uses 'WorkoutPlan'/'NutritionPlan' not 'workout'/'nutrition'
export const getMyActivePlans = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?._id;

        const assignments = await MemberPlan.find({ member: memberId, status: "active" })
            .populate('plan')
            .sort({ startDate: -1 });

        const workoutPlans   = assignments.filter(a => a.planType === "WorkoutPlan");
        const nutritionPlans = assignments.filter(a => a.planType === "NutritionPlan");

        res.status(200).json({
            status: "success",
            data: { workoutPlans, nutritionPlans, total: assignments.length }
        });
    } catch (error) {
        next(error);
    }
};

// Get member's plan history
export const getMyPlanHistory = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const memberId = req.user?._id;

        // Find all plans (completed, cancelled, etc)
        const assignments = await MemberPlan.find({ member: memberId })
            .populate("plan")
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            data: {
                history: assignments
            }
        });
    } catch (error) {
        next(error);
    }
};