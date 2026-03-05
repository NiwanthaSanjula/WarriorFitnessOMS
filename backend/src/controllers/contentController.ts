import { Response, NextFunction } from 'express';
import * as contentService from '../services/contentService.js';
import { AppError }         from '../utils/appError.js';
import { CustomRequest }    from '../types.js';

// ── SUCCESS STORIES ──────────────────────────────────────────────────────────

export const getPublicStories = async (_req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const stories = await contentService.getAllStories(true);
        res.status(200).json({ status: 'success', data: { stories } });
    } catch (error) { next(error); }
};


export const getAdminStories = async (_req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const stories = await contentService.getAllStories(false);
        res.status(200).json({ status: 'success', data: { stories } });
    } catch (error) { next(error); }
};

export const createStory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { memberName, quote, duration, beforeImage, afterImage, isVisible, order } = req.body;
        if (!memberName || !quote || !duration || !beforeImage || !afterImage)
            return next(new AppError('Please provide all required fields', 400));
        const story = await contentService.createStory({ memberName, quote, duration, beforeImage, afterImage, isVisible, order });
        res.status(201).json({ status: 'success', data: { story } });
    } catch (error) { next(error); }
};

export const updateStory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const story = await contentService.updateStory(req.params.id as string, req.body);
        res.status(200).json({ status: 'success', data: { story } });
    } catch (error: any) {
        if (error.message === 'Story not found') return next(new AppError('Story not found', 404));
        next(error);
    }
};

export const deleteStory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await contentService.deleteStory(req.params.id as string);
        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        if (error.message === 'Story not found') return next(new AppError('Story not found', 404));
        next(error);
    }
};

// ── MILESTONES ────────────────────────────────────────────────────────────────

export const getPublicMilestones = async (_req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const milestones = await contentService.getAllMilestones(true);
        res.status(200).json({ status: 'success', data: { milestones } });
    } catch (error) { next(error); }
};

export const getAdminMilestones = async (_req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const milestones = await contentService.getAllMilestones(false);
        res.status(200).json({ status: 'success', data: { milestones } });
    } catch (error) { next(error); }
};

export const createMilestone = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, year, image, isVisible, order } = req.body;
        if (!title || !description || !year || !image)
            return next(new AppError('Please provide all required fields', 400));
        const milestone = await contentService.createMilestone({ title, description, year, image, isVisible, order });
        res.status(201).json({ status: 'success', data: { milestone } });
    } catch (error) { next(error); }
};

export const updateMilestone = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const milestone = await contentService.updateMilestone(req.params.id as string, req.body);
        res.status(200).json({ status: 'success', data: { milestone } });
    } catch (error: any) {
        if (error.message === 'Milestone not found') return next(new AppError('Milestone not found', 404));
        next(error);
    }
};

export const deleteMilestone = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        await contentService.deleteMilestone(req.params.id as string);
        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        if (error.message === 'Milestone not found') return next(new AppError('Milestone not found', 404));
        next(error);
    }
};