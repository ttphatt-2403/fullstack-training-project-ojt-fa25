import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

export const login = async (username, password) => {
  try {
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
