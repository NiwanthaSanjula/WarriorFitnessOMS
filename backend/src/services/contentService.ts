import SuccessStory from '../models/SuccessStory.js';
import Milestone    from '../models/Milestone.js';

// ── SUCCESS STORIES ──────────────────────────────────────────────────────────

export const getAllStories = async (visibleOnly = false) => {
    const filter = visibleOnly ? { isVisible: true } : {};
    return await SuccessStory.find(filter).sort({ order: 1, createdAt: -1 }).lean();
};

export const getStoryById = async (id: string) => {
    const story = await SuccessStory.findById(id).lean();
    if (!story) throw new Error('Story not found');
    return story;
};

export const createStory = async (data: {
    memberName: string; quote: string; duration: string;
    beforeImage: string; afterImage: string;
    isVisible?: boolean; order?: number;
}) => {
    return await SuccessStory.create(data);
};

export const updateStory = async (id: string, data: Partial<{
    memberName: string; quote: string; duration: string;
    beforeImage: string; afterImage: string;
    isVisible: boolean; order: number;
}>) => {
    const story = await SuccessStory.findByIdAndUpdate(id, data, { new: true });
    if (!story) throw new Error('Story not found');
    return story;
};

export const deleteStory = async (id: string) => {
    const story = await SuccessStory.findByIdAndDelete(id);
    if (!story) throw new Error('Story not found');
};

// ── MILESTONES ────────────────────────────────────────────────────────────────

export const getAllMilestones = async (visibleOnly = false) => {
    const filter = visibleOnly ? { isVisible: true } : {};
    return await Milestone.find(filter).sort({ order: 1, year: -1 }).lean();
};

export const getMilestoneById = async (id: string) => {
    const milestone = await Milestone.findById(id).lean();
    if (!milestone) throw new Error('Milestone not found');
    return milestone;
};

export const createMilestone = async (data: {
    title: string; description: string; year: string;
    image: string; isVisible?: boolean; order?: number;
}) => {
    return await Milestone.create(data);
};

export const updateMilestone = async (id: string, data: Partial<{
    title: string; description: string; year: string;
    image: string; isVisible: boolean; order: number;
}>) => {
    const milestone = await Milestone.findByIdAndUpdate(id, data, { new: true });
    if (!milestone) throw new Error('Milestone not found');
    return milestone;
};

export const deleteMilestone = async (id: string) => {
    const milestone = await Milestone.findByIdAndDelete(id);
    if (!milestone) throw new Error('Milestone not found');
};