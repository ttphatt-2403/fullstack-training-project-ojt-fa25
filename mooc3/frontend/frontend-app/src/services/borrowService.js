import apiClient from "./apiClient";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

// Get all borrows
export const getAllBorrows = async () => {
  try {
    const response = await apiClient.get(buildApiUrl(API_ENDPOINTS.BORROWS));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get borrow by ID
export const getBorrowById = async (id) => {
  try {
    const response = await apiClient.get(buildApiUrl(`${API_ENDPOINTS.BORROWS}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get borrows by user
export const getBorrowsByUser = async (userId) => {
  try {
    const response = await apiClient.get(buildApiUrl(`${API_ENDPOINTS.BORROWS}/user/${userId}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get overdue borrows
export const getOverdueBorrows = async () => {
  try {
    const response = await apiClient.get(buildApiUrl(`${API_ENDPOINTS.BORROWS}/overdue`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Create new borrow
export const createBorrow = async (borrowData) => {
  try {
    const formData = {
      ...borrowData,
      userId: parseInt(borrowData.userId),
      bookId: parseInt(borrowData.bookId),
      dueDate: borrowData.dueDate || new Date(Date.now() + 14*24*60*60*1000).toISOString() // 14 ngày từ hôm nay
    };
    const response = await apiClient.post(buildApiUrl(API_ENDPOINTS.BORROWS), formData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Return book
export const returnBook = async (borrowId, notes = null) => {
  try {
    const response = await apiClient.put(
      buildApiUrl(`${API_ENDPOINTS.BORROWS}/${borrowId}/return`),
      { notes: notes || 'Đã trả sách' }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Update borrow
export const updateBorrow = async (id, borrowData) => {
  try {
    const response = await apiClient.put(buildApiUrl(`${API_ENDPOINTS.BORROWS}/${id}`), {
      ...borrowData,
      id: parseInt(id)
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Delete borrow
export const deleteBorrow = async (id) => {
  try {
    const response = await apiClient.delete(buildApiUrl(`${API_ENDPOINTS.BORROWS}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};