import React from "react";
import "../styles/pages.css";

const Unauthorized = () => {
  return (
    <div className="page-container">
      <div className="page-card">
        <h1 className="page-title">🚫 Truy Cập Bị Từ Chối</h1>
        <div className="welcome-card">
          <div className="welcome-text">Bạn không có quyền truy cập trang này</div>
          <div className="user-info">Vui lòng liên hệ quản trị viên</div>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => window.history.back()}
        >
          Quay Lại
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => window.location.href = "/"}
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
