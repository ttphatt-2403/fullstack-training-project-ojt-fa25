import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import userService from "../../services/userService";
import UserTable from "../../components/UserTable";
import UserForm from "../../components/UserForm";
import "../../styles/pages.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users from API with paging
  const fetchUsers = async (page = pageNumber) => {
    try {
      setLoading(true);
      const result = await userService.getAllUsers(page, pageSize);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search chỉ gọi API khi nhấn Enter
  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
  };

  const handleSearchKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (searchTerm.trim() === "") {
        fetchUsers(1);
        setPageNumber(1);
        return;
      }
      setLoading(true);
      try {
        const result = await userService.searchUsers(searchTerm);
        setUsers(result);
        setTotalPages(1);
        setPageNumber(1);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load users on component mount & khi pageNumber/pageSize thay đổi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      fetchUsers(pageNumber);
    }
  }, [pageNumber, pageSize, searchTerm]);

  // Không gọi API search khi searchTerm thay đổi nữa, chỉ gọi khi nhấn Enter
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  // Handle Add New User
  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  // Handle Edit User
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Handle Delete User
  const handleDeleteUser = (user) => {
    setDeleteConfirm(user);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(deleteConfirm.id);
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (userData) => {
    try {
      setLoading(true);

      if (editingUser) {
        // Update existing user - send only changed/non-empty fields to backend
        const minimalPayload = { id: editingUser.id };
        // compare fields and include only if different and not empty (except role)
        Object.keys(userData).forEach((key) => {
          const val = userData[key];
          const original = editingUser[key];
          // skip password when empty string
          if (key === 'password') {
            if (val && val.trim() !== '') minimalPayload.password = val;
            return;
          }
          // always include role even if same (optional), but we include only when changed
          if (val === undefined || val === null) return;
          if (typeof val === 'string' && val.trim() === '') return; // skip empty strings
          if (original === undefined || original === null) {
            minimalPayload[key] = val;
          } else if (String(val) !== String(original)) {
            minimalPayload[key] = val;
          }
        });

        await userService.updateUser(editingUser.id, minimalPayload);
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? { ...u, ...minimalPayload } : u
          )
        );
      } else {
        // Create new user
        const newUser = await userService.createUser(userData);
        setUsers([...users, newUser]);
      }

      setShowForm(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="page-container">
      <div className="user-management" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="page-header">
          <div className="header-content">
            <button 
              className="back-btn"
              onClick={() => window.location.href = '/dashboard'}
            >
              ← Quay lại Dashboard
            </button>
            <h1>👤 Quản lý Người dùng</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message error">
            ❌ {error}
          </div>
        )}

        {/* Main Content */}
        <div className="admin-content">
          <UserTable 
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAddUser={handleAddUser}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onSearchKeyDown={handleSearchKeyDown}
          />
          {/* Pagination */}
          <div className="pagination" style={{ marginTop: '16px', textAlign: 'center' }}>
            <button onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>
              ← Trang trước
            </button>
            <span style={{ margin: '0 12px' }}>
              Trang {pageNumber} / {totalPages}
            </span>
            <button onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber === totalPages}>
              Trang sau →
            </button>
          </div>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
            loading={loading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>🗑️ Xác nhận xóa</h3>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc muốn xóa user:</p>
                <div className="delete-user-info">
                  <strong>{deleteConfirm.fullname}</strong>
                  <br />
                  <small>
                    ({deleteConfirm.username} - {deleteConfirm.email})
                  </small>
                </div>
                <p className="warning-text">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  className="btn-delete"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "⏳ Đang xóa..." : "🗑️ Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
