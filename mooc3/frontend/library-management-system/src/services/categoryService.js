import api from './api';

export const categoryService = {
  getCategories: async ({ page = 1, pageSize = 10 } = {}) => {
    const response = await api.get('/Category', { params: { pageNumber: page, pageSize } });
    // eslint-disable-next-line no-console
    console.log('categoryService.getCategories response:', response);
    return response.data;
  },
  getCategory: async (id) => {
    const response = await api.get(`/Category/${id}`);
    // eslint-disable-next-line no-console
    console.log('categoryService.getCategory response:', response);
    return response.data;
  },
  createCategory: async (data) => {
    // eslint-disable-next-line no-console
    console.log('categoryService.createCategory payload:', data);
    const response = await api.post('/Category', data);
    // eslint-disable-next-line no-console
    console.log('categoryService.createCategory response:', response);
    return response.data;
  },
  updateCategory: async (id, data) => {
    // eslint-disable-next-line no-console
    console.log('categoryService.updateCategory id=', id, 'payload=', data);
    const response = await api.put(`/Category/${id}`, data);
    // eslint-disable-next-line no-console
    console.log('categoryService.updateCategory response:', response);
    return response.data;
  },
  deleteCategory: async (id) => {
    // eslint-disable-next-line no-console
    console.log('categoryService.deleteCategory id=', id);
    const response = await api.delete(`/Category/${id}`);
    // eslint-disable-next-line no-console
    console.log('categoryService.deleteCategory response:', response);
    return response.data;
  }
};
