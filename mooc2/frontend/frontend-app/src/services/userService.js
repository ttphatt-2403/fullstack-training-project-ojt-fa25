import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.USERS));
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`));
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await axios.post(buildApiUrl(API_ENDPOINTS.USERS), userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`), userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(buildApiUrl(`${API_ENDPOINTS.USERS}/${id}`));
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default userService;