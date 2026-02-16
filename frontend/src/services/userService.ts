import api from "../api/axios";
import type { User } from "../types/auth"

export const userService = {
    //  Fetch all users (Admin Only)
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/users/all-users');
        return response.data.data.members
    },

    // Standard REST: GET request to the ID
    getUserById: async (userId: string): Promise<User> => {
        const response = await api.get(`/users/${userId}`);
        return response.data
    },

    // Standard REST: PATCH request to the ID (Recommended over /role)
    updateUserRole: async ( userId: string, role: string) : Promise<User> => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data.data.user
    },

    // Standard REST: DELETE request to the ID
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/users/${userId}`)
    },

    assignCoach: async (memberId: string, coachId: string): Promise<User> => {
        const response = await api.patch('/users/assign-coach', { memberId, coachId});
        return response.data;
    },

    getMyClients: async (): Promise<User[]> => {
        const response = await api.get('/users/my-clients');
        return response.data.data.clients
    }
   

}