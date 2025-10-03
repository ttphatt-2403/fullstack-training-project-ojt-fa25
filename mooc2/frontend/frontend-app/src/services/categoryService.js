import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await axios.get(buildApiUrl(API_ENDPOINTS.CATEGORIES));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(buildApiUrl(`${API_ENDPOINTS.CATEGORIES}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Create new category
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(buildApiUrl(API_ENDPOINTS.CATEGORIES), categoryData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(buildApiUrl(`${API_ENDPOINTS.CATEGORIES}/${id}`), {
      ...categoryData,
      id
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(buildApiUrl(`${API_ENDPOINTS.CATEGORIES}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};