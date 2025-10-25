import apiClient from "./apiClient";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

const userService = {
  // Search users by keyword
  searchUsers: async (keyword) => {
    try {
      const response = await apiClient.get(
        buildApiUrl(`${API_ENDPOINTS.USERS}/search?keyword=${encodeURIComponent(keyword)}`)
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  // Get all users with paging
  getAllUsers: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(
        buildApiUrl(`${API_ENDPOINTS.USERS}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
  const response = await apiClient.get(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`));
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
  const response = await apiClient.post(buildApiUrl(API_ENDPOINTS.USERS), userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
  const response = await apiClient.put(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`), userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
  const response = await apiClient.delete(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`));
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default userService;