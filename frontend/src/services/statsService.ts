import api from "../api/axios";

export const statsService= {
    getAdminDashboardStats : async () => {
        const response = await api.get('/dashboard/admin-dashboard');
        return response.data.data
    }
}