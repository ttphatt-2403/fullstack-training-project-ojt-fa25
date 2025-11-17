import api from './api';

export const feeService = {
  // Lấy danh sách phí với phân trang
  getFees: async (params = {}) => {
    const { pageNumber = 1, pageSize = 10, status, type, userId } = params;
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    if (status) queryParams.append('status', status);
    if (type) queryParams.append('type', type);
    if (userId) queryParams.append('userId', userId.toString());
    
    const response = await api.get(`/Fee?${queryParams.toString()}`);
    return response.data;
  },

  // Lấy chi tiết một phí
  getFeeById: async (id) => {
    const response = await api.get(`/Fee/${id}`);
    return response.data;
  },

  // Tạo phí mới
  createFee: async (feeData) => {
    const response = await api.post('/Fee', feeData);
    return response.data;
  },

  // Cập nhật thông tin phí
  updateFee: async (id, feeData) => {
    const response = await api.put(`/Fee/${id}`, { ...feeData, id });
    return response.data;
  },

  // Thanh toán phí
  payFee: async (id, paymentData) => {
    const response = await api.patch(`/Fee/${id}/pay`, paymentData);
    return response.data;
  },

  // Xóa phí
  deleteFee: async (id) => {
    const response = await api.delete(`/Fee/${id}`);
    return response.data;
  },

  // Lấy phí chưa thanh toán
  getUnpaidFees: async (params = {}) => {
    return await feeService.getFees({ ...params, status: 'unpaid' });
  },

  // Lấy phí đã thanh toán
  getPaidFees: async (params = {}) => {
    return await feeService.getFees({ ...params, status: 'paid' });
  },

  // Lấy phí theo user
  getFeesByUser: async (userId, params = {}) => {
    return await feeService.getFees({ ...params, userId });
  },

  // Lấy thống kê phí của user
  getUserFeeStatistics: async (userId) => {
          const response = await api.get(`/Fee/user/${userId}/statistics`);
    return response.data;
  }
};