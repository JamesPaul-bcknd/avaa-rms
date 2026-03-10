import api from './axios';

export interface HrUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image?: string;
  profile_image_url?: string;
  skills?: string[];
  position?: string;
  created_at: string;
  updated_at: string;
}

export const hrProfilesApi = {
  // Get all users HR can view
  getUsers: async (): Promise<{ success: boolean; data: HrUser[] }> => {
    const response = await api.get('/hr/hr-users'); // matches your Laravel route /api/hr/hr-users
    return response.data;
  },

  // Get a specific user profile
  getUserProfile: async (userId: number): Promise<{ success: boolean; data: HrUser }> => {
    const response = await api.get(`/hr/users/${userId}`);
    return response.data;
  },

  // Get users HR can message with
  getConversableUsers: async (): Promise<{ success: boolean; data: HrUser[] }> => {
    const response = await api.get('/hr/conversable-users');
    return response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<{ success: boolean; data: HrUser[] }> => {
    // Use ?search= instead of ?query= to match your Laravel route
    const response = await api.get(`/hr/search`, { params: { search: query } });
    return response.data;
  },

  // Block / End contract for a user
  blockUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/hr/users/${userId}/block`);
    return response.data;
  },
};