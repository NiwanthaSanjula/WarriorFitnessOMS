/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api/axios";
import type { User } from "../types/auth"

export const userService = {

    //  Create new user (Admin)
    createNewUser : async (userData: any): Promise<User> => {
        const response = await api.post('/users/create-user', userData);
        return response.data.data.user
    },

    //  Update User
    updateUser : async (userId: string, updateData: any ): Promise<User> => {
        const response = await api.patch(`/users/${userId}`, updateData);
        return response.data.data.user
    },

    //  Update each profile
    updateSpecialProfile: async (userId: string, role: string, profileData: any): Promise<any> => {
        const response = await api.patch(`/users/${userId}/special-profile`, {
            role,
            profileData
        });
        return response.data.data.profile
    },

    //  Fetch all users (Admin Only)
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get('/users/all-users');
        return response.data.data.members
    },

    // Standard REST: GET request to the ID
    getUserById: async (userId: string): Promise<any> => {
        const response = await api.get(`/users/${userId}`);
        return response.data.data
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

    //  Get assigend members to coach portal
    getMyClients: async (): Promise<User[]> => {
        const response = await api.get('/users/my-clients');
        return response.data.data.clients
    },

    //  Get coach's assigend members to admin portal
    getCoachClients: async (coachId: string) : Promise<any> => {
        const response = await api.get(`users/${coachId}/assigned-members`)
        return response.data.data
    }

}