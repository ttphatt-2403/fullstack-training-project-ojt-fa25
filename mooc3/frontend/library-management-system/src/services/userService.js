import api from './api';

export const userService = {
  // GET /api/Users - Lấy danh sách users (hỗ trợ pagination)
  // params: { page, pageSize, ...filters }
getAllUsers: async (params = {}) => {
  const q = { ...params, pageNumber: params.page || params.pageNumber };
  delete q.page;

  const { data, headers } = await api.get('/Users', { params: q });

  // Chuẩn hóa items
  const items =
    (data?.data?.items) ||
    (data?.data?.users) ||
    (Array.isArray(data?.data) ? data.data : null) ||
    data?.items ||
    data?.users ||
    (Array.isArray(data) ? data : []) ||
    [];

  // Chuẩn hóa total
  const total =
    data?.total ||
    data?.totalUsers ||
    data?.totalCount ||
    data?.meta?.total ||
    data?.meta?.totalUsers ||
    parseInt(headers['x-total-count']) ||
    items.length;

  return {
    items,
    total,
    pageNumber: q.pageNumber || data?.pageNumber || data?.page || 1,
    pageSize: q.pageSize || data?.pageSize || data?.page_size || 10,
  };
},


  // POST /api/Users - Tạo user mới (Register)
  createUser: async (userData) => {
    const response = await api.post('/Users', userData);
    return response.data;
  },

  // GET /api/Users/{id} - Lấy user theo ID
  getUserById: async (id) => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  },

  // PUT /api/Users/{id} - Cập nhật user
  updateUser: async (id, userData) => {
    const response = await api.put(`/Users/${id}`, userData);
    return response.data;
  },

  // PUT /api/Users/{id} - Cập nhật profile (alias for updateUser)
  updateProfile: async (id, userData) => {
    const response = await api.put(`/Users/${id}`, userData);
    return response.data;
  },

  // PATCH /api/Users/{id} - Sửa trạng thái Active của user
  patchUser: async (id, userData) => {
    const response = await api.patch(`/Users/${id}`, userData);
    return response.data;
  },

  // DELETE /api/Users/{id} - Xóa user
  deleteUser: async (id) => {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
  },

  // GET /api/Users/search - Tìm kiếm user
  searchUsers: async (keyword) => {
    const response = await api.get('/Users/search', {
      params: { keyword }
    });
    return response.data;
  },

  // POST /api/Users/{id}/change-password - Đổi mật khẩu
  changePassword: async (id, passwordData) => {
    const response = await api.post(`/Users/${id}/change-password`, passwordData);
    return response.data;
  }
};
