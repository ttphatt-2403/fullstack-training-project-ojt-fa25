import React from 'react';

const UserTable = ({ users, onEdit, onDelete, onAddUser, loading, searchTerm, onSearch, onSearchKeyDown }) => {

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🔄</div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="table-section">
      {/* Search Bar + Add Button */}
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm users..."
            value={searchTerm}
            onChange={onSearch}
            onKeyDown={onSearchKeyDown}
            className="search-input"
          />
          <button className="btn-add-user" onClick={onAddUser}>
            ➕ Thêm User
          </button>
        </div>
        <div className="user-stats-header">
          <span className="stat-badge">👥 {users.length} users</span>
          <span className="stat-badge admin">
            👑 {users.filter(u => u.role === 'admin').length} admins
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Không tìm thấy users</h3>
            <p>Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.fullname || 'N/A'}</div>
                          <div className="user-id">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="username">{user.username}</span>
                    </td>
                    <td>
                      <span className="email">{user.email}</span>
                    </td>
                    <td>
                      <span className="phone">{user.phone || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => onEdit(user)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => onDelete(user)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;