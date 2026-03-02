import { Request, Response, NextFunction } from "express";
import * as progressService from "../services/progressService.js";
import { AppError } from "../utils/appError.js";
import { CustomRequest } from "../types.js";
import MemberProfile from "../models/MemberProfile.js";

// Member: Add progress update
export const addProgress = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?._id?.toString();
        const { 
            weight, bodyFat, muscleMass, waterPercentage, 
            energyLevel, sleepHours, chest, waist, hips, biceps, thighs, notes 
        } = req.body; 

        if (!memberId) return next(new AppError("User must be logged in", 401));

        const progressData = {
            weight,
            bodyFat: bodyFat || null, // [cite: 62]
            muscleMass: muscleMass || null,
            waterPercentage: waterPercentage || null,
            energyLevel: energyLevel || null,
            sleepHours: sleepHours || null,
            chest: chest || null, // [cite: 63]
            waist: waist || null, // [cite: 64]
            hips: hips || null,   // [cite: 65]
            biceps: biceps || null, // [cite: 66]
            thighs: thighs || null, // [cite: 67]
            notes: notes || ""    // [cite: 68]
        };

        const newProgress = await progressService.addProgressUpdate(memberId, progressData); 
        res.status(201).json({ status: "success", data: { progress: newProgress } }); 
    } catch (error) { next(error); }
};

// Member: Get own progress history
export const getMyProgress = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const memberId = req.user?._id?.toString();
        const page = parseInt(req.query.page as string) || 1;
        const limit = 12;

        if (!memberId) {
            return next(new AppError("User must be logged in", 401));
        }

        const result = await progressService.getMemberProgress(
            memberId,
            limit,
            page
        );

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Member: Get progress comparison
export const getProgressComparison = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const memberId = req.user?._id?.toString();
        const days = parseInt(req.query.days as string) || 30;

        if (!memberId) {
            return next(new AppError("User must be logged in", 401));
        }

        const comparison = await progressService.getProgressComparison(
            memberId,
            days
        );

        res.status(200).json({
            status: "success",
            data: comparison
        });
    } catch (error) {
        next(error);
    }
};

// Coach: Get all assigned members with progress
export const getAssignedMembersProgress = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id?.toString();

        if (!coachId || req.user?.role !== "coach") {
            return next(new AppError("Only coaches can access this", 403));
        }

        const membersProgress = await progressService.getCoachMembersProgress(
            coachId
        );

        res.status(200).json({
            status: "success",
            data: { members: membersProgress }
        });
    } catch (error) {
        next(error);
    }
};

// Coach: Add notes to member's progress
export const addProgressNotes = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id?.toString();
        const { progressId, notes } = req.body;

        if (!coachId || req.user?.role !== "coach") {
            return next(new AppError("Only coaches can add notes", 403));
        }

        if (!progressId || !notes) {
            return next(new AppError("progressId and notes are required", 400));
        }

        const updatedProgress = await progressService.updateProgressNotes(
            progressId,
            notes,
            coachId
        );

        res.status(200).json({
            status: "success",
            data: { progress: updatedProgress }
        });
    } catch (error) {
        next(error);
    }
};

// Coach - Get members list
export const getCoachMembersList = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id?.toString();

        if (!coachId || req.user?.role !== "coach") {
            return next(new AppError("Only coaches can access this", 403));
        }

        const members = await progressService.getCoachMembersList(coachId);

        res.status(200).json({
            status: "success",
            results: members.length,
            data: { members }
        });
    } catch (error) {
        next(error);
    }
};

// Coach - Get member detail
export const getCoachMemberDetail = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id?.toString();
        const memberId = req.params.memberId as string;

        if (!coachId || req.user?.role !== "coach") {
            return next(new AppError("Only coaches can access this", 403));
        }

        const memberDetail = await progressService.getCoachMemberDetail(
            memberId,
            coachId
        );

        res.status(200).json({
            status: "success",
            data: memberDetail
        });
    } catch (error: any) {
        if (error.message === "Member not found") {
            return next(new AppError("Member not found", 404));
        }
        if (error.message === "This member is not assigned to you") {
            return next(new AppError("This member is not assigned to you", 403));
        }
        next(error);
    }
};

// Coach - Add feedback
export const addCoachFeedback = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const coachId = req.user?._id?.toString();
        const { memberId, progressId, notes } = req.body;

        if (!coachId || req.user?.role !== "coach") {
            return next(new AppError("Only coaches can add feedback", 403));
        }

        if (!progressId || !notes) {
            return next(new AppError("progressId and notes are required", 400));
        }

        const updatedProgress = await progressService.updateProgressNotesByCoach(
            progressId,
            notes,
            coachId
        );

        res.status(200).json({
            status: "success",
            message: "Feedback added successfully",
            data: { progress: updatedProgress }
        });
    } catch (error) {
        next(error);
    }
};

export const getProgressChartData = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?._id?.toString();
        const limit = parseInt(req.query.limit as string) || 20;
        if (!memberId) return next(new AppError("Login required", 401));

        const chartData = await progressService.getProgressChartData(memberId, limit);
        res.status(200).json({ status: "success", data: chartData });
    } catch (error) { next(error); }
};

export const getFitnessSummary = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const memberId = req.user?.role === 'coach'
            ? req.params.memberId
            : req.user?._id?.toString();

        const profile = await MemberProfile.findOne({ user: memberId });
        const summary = await progressService.getMemberFitnessSummary(
            memberId, profile?.height
        );
        res.status(200).json({ status: "success", data: summary });
    } catch (error) { next(error); }
};

export const getCoachMemberChartData = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const coachId = req.user?._id?.toString();
        const { memberId } = req.params;
        if (!coachId || req.user?.role !== 'coach')
            return next(new AppError("Coaches only", 403));

        const chartData = await progressService.getProgressChartData(memberId, 20);
        res.status(200).json({ status: "success", data: chartData });
    } catch (error) { next(error); }
};