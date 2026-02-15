import api from "../api/axios";

export const attendanceService = {
    checkInMember: async ( userId: string) => {
        const response = await api.post('/attendance/check-in', { userId });
        return response.data;
    }
};