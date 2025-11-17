import api from './api';

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

  // Lấy user từ localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
