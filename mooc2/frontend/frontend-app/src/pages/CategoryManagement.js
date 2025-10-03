import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../services/categoryService';
import '../styles/CategoryManagement.css';

const CategoryManagement = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryForm);
                alert('Cập nhật thể loại thành công!');
            } else {
                await createCategory(categoryForm);
                alert('Thêm thể loại thành công!');
            }
            
            setShowAddForm(false);
            setEditingCategory(null);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.message || 'Có lỗi xảy ra!');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            description: category.description || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thể loại này? Lưu ý: Không thể xóa nếu còn có sách thuộc thể loại này.')) return;

        try {
            await deleteCategory(categoryId);
            alert('Xóa thể loại thành công!');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(error.message || 'Có lỗi xảy ra khi xóa thể loại!');
        }
    };

    const resetForm = () => {
        setCategoryForm({
            name: '',
            description: ''
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="category-management">
            <div className="page-header">
                <div className="header-content">
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Quay lại Dashboard
                    </button>
                    <h1>🗂️ Quản lý Thể loại</h1>
                    <button 
                        className="add-btn"
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingCategory(null);
                            resetForm();
                        }}
                    >
                        + Thêm thể loại mới
                    </button>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</h2>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingCategory(null);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="category-form">
                            <div className="form-group">
                                <label>Tên thể loại *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                    placeholder="Nhập tên thể loại..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    rows="4"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                    placeholder="Nhập mô tả cho thể loại này..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {editingCategory ? 'Cập nhật' : 'Thêm thể loại'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingCategory(null);
                                        resetForm();
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="categories-container">
                {categories.length > 0 ? (
                    <div className="categories-grid">
                        {categories.map((category) => (
                            <div key={category.id} className="category-card">
                                <div className="category-header">
                                    <h3>{category.name}</h3>
                                    <div className="category-actions">
                                        <button 
                                            onClick={() => handleEdit(category)}
                                            className="edit-btn"
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)}
                                            className="delete-btn"
                                            title="Xóa"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="category-content">
                                    {category.description && (
                                        <p className="category-description">{category.description}</p>
                                    )}
                                    
                                    <div className="category-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Số lượng sách:</span>
                                            <span className="stat-value">{category.books?.length || 0}</span>
                                        </div>
                                        
                                        {category.createdat && (
                                            <div className="stat-item">
                                                <span className="stat-label">Ngày tạo:</span>
                                                <span className="stat-value">{formatDate(category.createdat)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Books in this category */}
                                {category.books && category.books.length > 0 && (
                                    <div className="category-books">
                                        <h4>Sách trong thể loại này:</h4>
                                        <div className="books-list">
                                            {category.books.slice(0, 3).map((book) => (
                                                <div key={book.id} className="book-item">
                                                    <span className="book-title">{book.title}</span>
                                                    <span className="book-author">{book.author || 'Không có tác giả'}</span>
                                                </div>
                                            ))}
                                            {category.books.length > 3 && (
                                                <div className="more-books">
                                                    và {category.books.length - 3} sách khác...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-categories">
                        <div className="empty-state">
                            <div className="empty-icon">🗂️</div>
                            <h3>Chưa có thể loại nào</h3>
                            <p>Hãy thêm thể loại đầu tiên để bắt đầu quản lý sách.</p>
                            <button 
                                className="add-first-btn"
                                onClick={() => {
                                    setShowAddForm(true);
                                    setEditingCategory(null);
                                    resetForm();
                                }}
                            >
                                + Thêm thể loại đầu tiên
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;