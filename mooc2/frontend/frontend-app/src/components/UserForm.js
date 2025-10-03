import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullname: '',
    phone: '',
    role: 'user',
    password: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullname: user.fullname || '',
        phone: user.phone || '',
        role: user.role || 'user',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Họ tên là bắt buộc';
    }

    // Password required for new users only
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      
      // Đặt empty string cho password nếu không nhập khi update
      if (user && (!submitData.password || submitData.password.trim() === '')) {
        submitData.password = '';
      }
      
      onSubmit(submitData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {user ? '✏️ Chỉnh sửa User' : '➕ Thêm User mới'}
          </h2>
          <button className="modal-close" onClick={onCancel}>
            ✖️
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {/* Row 1: Username & Email */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                disabled={loading}
                placeholder="Nhập username"
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
                placeholder="Nhập email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Row 2: Full Name */}
          <div className="form-group">
            <label htmlFor="fullname">Họ và tên *</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={`form-input ${errors.fullname ? 'error' : ''}`}
              disabled={loading}
              placeholder="Nhập họ và tên"
            />
            {errors.fullname && <span className="error-text">{errors.fullname}</span>}
          </div>

          {/* Row 3: Phone & Role */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="user">👤 User</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>
          </div>

          {/* Row 4: Password */}
          <div className="form-group">
            <label htmlFor="password">
              {user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              disabled={loading}
              placeholder={user ? "Để trống nếu không thay đổi" : "Nhập mật khẩu"}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : (user ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;