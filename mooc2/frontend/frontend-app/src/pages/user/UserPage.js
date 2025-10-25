import React from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages.css";

const UserPage = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (!user) {
    return <div className="page-container"><div className="page-card">Không tìm thấy thông tin người dùng.</div></div>;
  }
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
              <div className="info-label">ID</div>
              <div className="info-value">{user.id}</div>
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} style={{marginTop: '24px'}}>Đăng xuất</button>
      </div>
    </div>
  );
};

export default UserPage;
