import apiClient from './apiClient';
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

// Login: use apiClient so interceptor can attach headers consistently
export const login = async (username, password) => {
  try {
    const response = await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      username,
      password,
    });

    // Some backends return 'token' or 'Token' - normalize both
    const token = response.data?.token ?? response.data?.Token ?? null;
    if (token) {
      localStorage.setItem('token', token);
    }

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
