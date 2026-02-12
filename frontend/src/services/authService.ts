import api from "../api/axios";
import type { loginData } from "../types/auth";

export const authService = {
    login: async (credentials: loginData) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('auth/me');
        return response.data;
    },

    logout: async () => {
        await api.post('auth/logout');
    }
}