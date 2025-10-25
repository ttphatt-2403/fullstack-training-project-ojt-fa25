import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import '../../styles/pages.css';

const RegisterPageSimple = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username là bắt buộc';
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc';
    if (!formData.password) newErrors.password = 'Password là bắt buộc';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password không khớp';
    }
    if (!formData.fullname.trim()) newErrors.fullname = 'Họ tên là bắt buộc';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname,
        phone: formData.phone
      };

      await register(registerData);
      alert('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      setErrors({ submit: error.message || 'Đăng ký thất bại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Đăng Ký Tài Khoản</h2>
        
        {errors.submit && <div className="message error">{errors.submit}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="text"
              name="fullname"
              placeholder="Họ và tên"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
            {errors.fullname && <span className="error-text">{errors.fullname}</span>}
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            className="btn-primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="login-link">
          <p>Đã có tài khoản? <Link to="/">Đăng nhập ngay</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPageSimple;