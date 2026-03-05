import api from '../api/axios';

export const contentService = {

    // ── PUBLIC ────────────────────────────────────────────────────────────────
    getPublicStories: async () => {
        const res = await api.get('/content/stories');
        return res.data.data.stories;
    },

    getPublicMilestones: async () => {
        const res = await api.get('/content/milestones');
        return res.data.data.milestones;
    },

    // ── ADMIN — STORIES ───────────────────────────────────────────────────────
    getAdminStories: async () => {
        const res = await api.get('/content/admin/stories');
        return res.data.data.stories;
    },

    createStory: async (data: {
        memberName: string; quote: string; duration: string;
        beforeImage: string; afterImage: string;
        isVisible?: boolean; order?: number;
    }) => {
        const res = await api.post('/content/admin/stories', data);
        return res.data.data.story;
    },

    updateStory: async (id: string, data: Partial<{
        memberName: string; quote: string; duration: string;
        beforeImage: string; afterImage: string;
        isVisible: boolean; order: number;
    }>) => {
        const res = await api.patch(`/content/admin/stories/${id}`, data);
        return res.data.data.story;
    },

    deleteStory: async (id: string) => {
        await api.delete(`/content/admin/stories/${id}`);
    },

    // ── ADMIN — MILESTONES ────────────────────────────────────────────────────
    getAdminMilestones: async () => {
        const res = await api.get('/content/admin/milestones');
        return res.data.data.milestones;
    },

    createMilestone: async (data: {
        title: string; description: string; year: string;
        image: string; isVisible?: boolean; order?: number;
    }) => {
        const res = await api.post('/content/admin/milestones', data);
        return res.data.data.milestone;
    },

    updateMilestone: async (id: string, data: Partial<{
        title: string; description: string; year: string;
        image: string; isVisible: boolean; order: number;
    }>) => {
        const res = await api.patch(`/content/admin/milestones/${id}`, data);
        return res.data.data.milestone;
    },

    deleteMilestone: async (id: string) => {
        await api.delete(`/content/admin/milestones/${id}`);
    },
};