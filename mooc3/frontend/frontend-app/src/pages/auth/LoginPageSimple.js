import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập, tự động redirect sang trang phù hợp
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (user.role === "user") {
        navigate("/user", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginService(formData.username, formData.password);
      login(data.user);
      
      // Redirect theo role
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "user") {
        navigate("/user");
      } else {
        navigate("/dashboard"); // fallback nếu có role lạ
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Đăng Nhập</h2>
        
        {error && <div className="message error">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <button 
            className="btn-primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        
        <div className="register-link">
          <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;