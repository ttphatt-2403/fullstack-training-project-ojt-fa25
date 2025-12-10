import api from './api';

export const borrowService = {
  // Lấy danh sách tất cả Borrow với pagination
  getBorrows: async (params = {}) => {
    const { pageNumber = 1, pageSize = 20, status } = params;
    const queryParams = { pageNumber, pageSize };
    if (status) {
      queryParams.status = status;
    }
    const response = await api.get('/Borrow', {
      params: queryParams
    });
    return response.data;
  },

  // Lấy danh sách Borrow đang hoạt động (borrowed)
  getActiveBorrows: async (params = {}) => {
    const { pageNumber = 1, pageSize = 20 } = params;
    const response = await api.get('/Borrow', {
      params: { pageNumber, pageSize, status: 'borrowed' }
    });
    return response.data;
  },

  // Lấy danh sách Borrow đã trả (returned)
  getReturnedBorrows: async (params = {}) => {
    const { pageNumber = 1, pageSize = 20 } = params;
    const response = await api.get('/Borrow', {
      params: { pageNumber, pageSize, status: 'returned' }
    });
    return response.data;
  },

  // Lấy danh sách yêu cầu mượn chờ duyệt (request)
  getPendingRequests: async (params = {}) => {
    const { pageNumber = 1, pageSize = 20 } = params;
    const response = await api.get('/Borrow', {
      params: { pageNumber, pageSize, status: 'request' }
    });
    return response.data;
  },

  // Lấy Borrow theo id
  getBorrow: async (id) => {
    const response = await api.get(`/Borrow/${id}`);
    return response.data;
  },

  // Lấy danh sách Borrow của một user với pagination
  getBorrowsByUser: async (userId, params = {}) => {
    const { pageNumber = 1, pageSize = 10 } = params;
    const response = await api.get(`/Borrow/user/${userId}`, {
      params: { pageNumber, pageSize }
    });
    return response.data;
  },

  // Lấy danh sách Borrow đang overdue với pagination
  getOverdueBorrows: async (params = {}) => {
    const { pageNumber = 1, pageSize = 20 } = params;
    console.log(`🔍 Fetching overdue borrows: page=${pageNumber}, pageSize=${pageSize}`);
    const response = await api.get('/Borrow/overdue', {
      params: { pageNumber, pageSize }
    });
    console.log(`✅ Overdue borrows response:`, response.data);
    return response.data;
  },

  // Tạo mới Borrow (mượn sách) - User request
  createBorrow: async (borrowData) => {
    const response = await api.post('/Borrow/request', borrowData); // Update endpoint
    return response.data;
  },

  // 🔥 API mới cho Staff tạo phiếu mượn trực tiếp (borrowed status)
  staffCreateBorrow: async (borrowData) => {
    console.log('🔄 Staff creating borrow:', borrowData);
    
    // Debug JWT token
    const token = localStorage.getItem('token');
    console.log('🔑 JWT Token exists:', !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👤 Token payload:', payload);
        console.log('🎭 User role:', payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
        console.log('⏰ Token expires:', new Date(payload.exp * 1000));
      } catch (e) {
        console.error('❌ Invalid token format:', e);
      }
    }
    
    const response = await api.post('/Borrow/staff-checkin', borrowData);
    console.log('✅ Staff borrow created:', response.data);
    return response.data;
  },

  // Trả sách (update borrow status)
  returnBook: async (id, notes) => {
    // notes có thể null
    const response = await api.patch(`/Borrow/${id}/return`, { notes });
    return response.data;
  },

  // Update Borrow (chỉnh hạn trả, note)
  updateBorrow: async (id, borrowData) => {
    const response = await api.patch(`/Borrow/${id}`, borrowData);
    return response.data;
  },

  // Approve borrow request (staff only)
  approveBorrowRequest: async (id, notes) => {
    const response = await api.patch(`/Borrow/${id}/approve`, { notes });
    return response.data;
  },

  // Reject borrow request (staff only)
  rejectBorrowRequest: async (id, notes) => {
    const response = await api.patch(`/Borrow/${id}/reject`, { notes });
    return response.data;
  },

  // Xóa một Borrow
  deleteBorrow: async (id) => {
    const response = await api.delete(`/Borrow/${id}`);
    return response.data;
  },

  // GET /api/Borrow/{id}/details - Chi tiết phiếu mượn với đầy đủ thông tin
  getBorrowDetails: async (id) => {
    const response = await api.get(`/Borrow/${id}/details`);
    return response.data;
  },

  // GET /api/Borrow/user/{userId}/statistics - Thống kê mượn sách của user
  getUserBorrowStatistics: async (userId) => {
    const response = await api.get(`/Borrow/user/${userId}/statistics`);
    return response.data;
  },

  // Lấy danh sách Borrow với filter status - Lịch sử mượn sách với filter
  getBorrowsByUserWithFilter: async (userId, params = {}) => {
    const { pageNumber = 1, pageSize = 10, status } = params;
    const queryParams = { pageNumber, pageSize };
    if (status && status !== 'all') {
      queryParams.status = status;
    }
    const response = await api.get(`/Borrow/user/${userId}`, {
      params: queryParams
    });
    return response.data;
  },

  // Lấy danh sách yêu cầu mượn đang pending (status = request)
  getPendingRequests: async (params = {}) => {
    const { pageNumber = 1, pageSize = 10 } = params;
    const response = await api.get('/Borrow', {
      params: { pageNumber, pageSize, status: 'request' }
    });
    return response.data;
  },

  // PATCH /api/Borrow/{id}/approve - Duyệt yêu cầu mượn sách
  approveBorrowRequest: async (id, notes = null) => {
    const response = await api.patch(`/Borrow/${id}/approve`, { notes });
    return response.data;
  },

  // PATCH /api/Borrow/{id}/reject - Từ chối yêu cầu mượn sách
  rejectBorrowRequest: async (id, requestData = {}) => {
    console.log('🔄 Reject borrow request:', id, requestData);
    const response = await api.patch(`/Borrow/${id}/reject`, requestData);
    console.log('✅ Reject response:', response.data);
    return response.data;
  }
};
