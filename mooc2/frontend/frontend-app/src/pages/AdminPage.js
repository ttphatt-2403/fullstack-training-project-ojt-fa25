import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import userService from "../services/userService";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import "../styles/pages.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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
        // Update existing user
        await userService.updateUser(editingUser.id, userData);
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? { ...u, ...userData } : u
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

        {/* Header mới giống CategoryManagement */}
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
          />
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

export default AdminPage;
