import api from './api';

// -------------------------------------------------------------------
// Helper: Chuẩn hóa tên trường từ PascalCase / snake_case → camelCase
// -------------------------------------------------------------------
const normalizeUser = (user = {}) => ({
  id: user.Id || user.id,
  username: user.Username || user.username,
  email: user.Email || user.email,
  fullname: user.Fullname || user.fullName || user.fullname,
  phone: user.Phone || user.phone,
  avatarurl: user.avatarurl || user.Avatarurl || user.avatarUrl || user.avatar_url,
  dateofbirth: user.dateofbirth || user.Dateofbirth || user.dateOfBirth || user.date_of_birth,
  role: (user.Role || user.role) ? (user.Role || user.role).charAt(0).toUpperCase() + (user.Role || user.role).slice(1).toLowerCase() : user.Role || user.role,
  isactive: user.isactive || user.Isactive || user.isActive || user.is_active,
  createdat: user.createdat || user.Createdat || user.createdAt || user.created_at,
  updatedat: user.updatedat || user.Updatedat || user.updatedAt || user.updated_at,
});
// -------------------------------------------------------------------
// Helper: Extract mảng items từ rất nhiều format response có thể có
// -------------------------------------------------------------------
const extractItems = (data) => {
  if (!data) return [];

  return (
    data?.data?.items ??
    data?.data?.users ??
    (Array.isArray(data?.data) ? data.data : null) ??
    data?.items ??
    data?.users ??
    (Array.isArray(data) ? data : []) ??
    []
  );
};

// -------------------------------------------------------------------
// Helper: Extract total count (hỗ trợ nhiều key + header X-Total-Count)
// -------------------------------------------------------------------
const extractTotal = (data, headers, fallbackLength = 0) => {
  return (
    data?.totalUsers ??
    data?.total ??
    data?.totalCount ??
    data?.meta?.total ??
    data?.meta?.totalUsers ??
    (headers ? parseInt(headers['x-total-count'] || headers['X-Total-Count'], 10) : NaN) ??
    fallbackLength
  );
};

// -------------------------------------------------------------------
// User Service
// -------------------------------------------------------------------
export const userService = {
  // GET /api/Users - Danh sách users + pagination
  getAllUsers: async (params = {}) => {
    const query = {
      ...params,
      pageNumber: params.page || params.pageNumber || 1,
      pageSize: params.pageSize || 10,
    };
    delete query.page; // xóa key cũ nếu có

    const { data, headers } = await api.get('/Users', { params: query });

    const rawItems = extractItems(data);
    const items = rawItems.map(normalizeUser);
    const total = extractTotal(data, headers, rawItems.length);

    return {
      items,
      total,
      pageNumber: Number(query.pageNumber || data?.pageNumber || data?.page || 1),
      pageSize: Number(query.pageSize || data?.pageSize || data?.page_size || 10),
    };
  },

  // POST /api/Users - Tạo user mới (Register)
  createUser: async (userData) => {
    const { data } = await api.post('/Users', userData);
    return data;
  },

  // GET /api/Users/{id}
  getUserById: async (id) => {
    const { data } = await api.get(`/Users/${id}`);
    return normalizeUser(data) || data; // trả về đã chuẩn hóa nếu có
  },

  // PUT /api/Users/{id} - Cập nhật toàn bộ thông tin user
  updateUser: async (id, userData) => {
    const { data } = await api.put(`/Users/${id}`, userData);
    return data;
  },

  // Alias của updateUser (dùng cho profile)
  updateProfile: async (id, userData) => {
    const { data } = await api.put(`/Users/${id}`, userData);
    return data;
  },

  // PATCH /api/Users/{id} - Thường dùng để bật/tắt active
  patchUser: async (id, patchData) => {
    const { data } = await api.patch(`/Users/${id}`, patchData);
    return data;
  },

  // DELETE /api/Users/{id}
  deleteUser: async (id) => {
    const { data } = await api.delete(`/Users/${id}`);
    return data;
  },

  // GET /api/Users/search?keyword=...
  searchUsers: async (keyword) => {
    const { data } = await api.get('/Users/search', {
      params: { keyword },
    });

    const rawItems = extractItems(data);
    const items = rawItems.map(normalizeUser);

    // Nếu backend trả object có metadata → giữ nguyên cấu trúc, chỉ thay items
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        ...data,
        items,           // chuẩn nhất
        users: items,    // một số endpoint cũ dùng "users"
        total: extractTotal(data, null, rawItems.length),
      };
    }

    // Nếu chỉ trả mảng thuần → trả mảng đã chuẩn hóa
    return items;
  },

  // POST /api/Users/{id}/change-password
  changePassword: async (id, passwordData) => {
    const { data } = await api.post(`/Users/${id}/change-password`, passwordData);
    return data;
  },
};

export default userService;