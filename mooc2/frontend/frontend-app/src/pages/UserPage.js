import React from "react";
import "../styles/pages.css";

const UserPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="page-container">
      <div className="page-card" style={{maxWidth: '500px'}}>
        <h1 className="page-title">User Dashboard</h1>
        
        {/* User Profile Header */}
        <div className="profile-header">
          <div className="avatar">
            {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="user-name">{user.fullname || 'Người dùng'}</h2>
          <div className="role-badge user-role">
            {user.role === 'user' ? '👤 User' : user.role}
          </div>
        </div>

        {/* User Information Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <div className="info-label">Họ và tên</div>
              <div className="info-value">{user.fullname || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🔑</div>
            <div className="info-content">
              <div className="info-label">Tên đăng nhập</div>
              <div className="info-value">{user.username || 'Chưa có'}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <div className="info-label">Email</div>
              <div className="info-value">{user.email || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📱</div>
            <div className="info-content">
              <div className="info-label">Số điện thoại</div>
              <div className="info-value">{user.phone || 'Chưa cập nhật'}</div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🆔</div>
            <div className="info-content">
              <div className="info-label">ID người dùng</div>
              <div className="info-value">#{user.id || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="user-stats">
          <div className="stat-item">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Đã xác thực</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🔐</div>
            <div className="stat-label">Đăng nhập</div>
          </div>
        </div>

        <button className="btn-secondary" onClick={handleLogout}>
          🚪 Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default UserPage;
