import api from './api';

export const categoryService = {
  getCategories: async ({ page = 1, pageSize = 10 } = {}) => {
    const response = await api.get('/Category', { params: { pageNumber: page, pageSize } });
    return response.data;
  },
  getCategory: async (id) => {
    const response = await api.get(`/Category/${id}`);
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/Category', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/Category/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/Category/${id}`);
    return response.data;
  }
};
