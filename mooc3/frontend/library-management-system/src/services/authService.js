import api from './api';

// Helper function để decode JWT token
const decodeJwtToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Chuẩn hóa các claim thành format dễ sử dụng
    const normalized = {
      userId: payload.nameid || payload.sub || payload.userId,
      username: payload.unique_name || payload.name || payload.username,
      email: payload.email,
      role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      exp: payload.exp,
      iat: payload.iat
    };
    
    console.log('🔍 Decoded JWT:', {
      raw: payload,
      normalized
    });
    
    return normalized;
  } catch (error) {
    console.error('❌ Failed to decode JWT token:', error);
    return null;
  }
};

export const authService = {
  // POST /api/auth/login - Đăng nhập
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    // Hỗ trợ nhiều hình dạng response từ backend
    // Một số backend trả { token, user }, một số trả { accessToken, data: { token, user } }, v.v.
    const d = response.data || {};

    // Helper: recursively search an object for a key that contains one of the provided substrings
    const findValueByKeySubstr = (obj, substrings) => {
      if (!obj || typeof obj !== 'object') return null;
      const queue = [obj];
      while (queue.length) {
        const cur = queue.shift();
        for (const k of Object.keys(cur)) {
          try {
            const v = cur[k];
            const kl = k.toString().toLowerCase();
            for (const sub of substrings) {
              if (kl.includes(sub)) return v;
            }
            if (v && typeof v === 'object') queue.push(v);
          } catch (e) {
            // ignore
          }
        }
      }
      return null;
    };

    // Tìm token trong nhiều trường khả dĩ (token, accessToken, access_token, etc.)
    const token =
      findValueByKeySubstr(d, ['token', 'access']) ||
      d.token || d.accessToken || d.access_token || (d.data && (d.data.token || d.data.accessToken));

    // Tìm user trong nhiều trường (user object)
    let user = findValueByKeySubstr(d, ['user', 'account', 'profile']) || d.user || d.data?.user || d.data || null;

    // Debug log (bị bỏ nếu build production) — giúp xác định vì sao token không lưu
    // eslint-disable-next-line no-console
    console.log('authService.login response.data:', d, 'resolved token:', token, 'resolved user:', user);

    if (token) {
      localStorage.setItem('token', token);
    }

    // If backend didn't include a user object in login response, try /auth/me
    if (!user && token) {
      try {
        // api interceptor will attach Authorization header from localStorage token
        const me = await api.get('/auth/me');
        if (me && me.data) user = me.data;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('authService.login: failed to fetch /auth/me after login', e?.response || e?.message || e);
      }
    }

    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to stringify user for localStorage', e);
      }
    }

    return response.data;
  },

  // POST /api/auth/register - Đăng ký
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // GET /api/auth/me - Lấy thông tin user đang login
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout - Xóa token
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Kiểm tra đã login chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Lấy user từ localStorage hoặc decode từ JWT
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) return null;
    
    // Nếu có user trong localStorage, dùng đó trước
    if (userStr) {
      try {
        const stored = JSON.parse(userStr);
        console.log('👤 User from localStorage:', stored);
        return stored;
      } catch (e) {
        console.warn('⚠️ Invalid user JSON in localStorage');
      }
    }
    
    // Nếu không có, decode từ JWT token
    const decoded = decodeJwtToken(token);
    if (decoded) {
      console.log('🔓 User from JWT token:', decoded);
      return {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
    }
    
    return null;
  },

  // Kiểm tra user có role cụ thể không (case-insensitive)
  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    return user?.role?.toLowerCase() === requiredRole?.toLowerCase();
  },

  // Kiểm tra user có một trong các role không (case-insensitive)
  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    const userRole = user?.role?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  },

  // Export helper function
  decodeJwtToken
};
