import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getAllBorrows,
    createBorrow,
    returnBook,
    deleteBorrow
} from '../services/borrowService';
import userService from '../services/userService';
import { getAllBooks } from '../services/bookService';
import '../styles/BorrowManagement.css';

const BorrowManagement = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [borrows, setBorrows] = useState([]);
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const [borrowForm, setBorrowForm] = useState({
        userId: '',
        bookId: '',
        dueDate: '',
        notes: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [borrowsData, usersData, booksData] = await Promise.all([
                getAllBorrows(),
                userService.getAllUsers(),
                getAllBooks()
            ]);

            setBorrows(borrowsData);
            setUsers(usersData);
            setBooks(booksData.filter(book => book.availableCopies > 0)); // Chỉ hiện sách còn có sẵn
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await createBorrow(borrowForm);
            alert('Tạo phiếu mượn thành công!');
            setShowAddForm(false);
            resetForm();
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error creating borrow:', error);
            alert(error.message || 'Có lỗi xảy ra!');
        }
    };

    const handleReturn = async (borrowId) => {
        if (!window.confirm('Xác nhận trả sách?')) return;

        try {
            await returnBook(borrowId, 'Đã trả sách');
            alert('Trả sách thành công!');
            fetchData();
        } catch (error) {
            console.error('Error returning book:', error);
            alert(error.message || 'Có lỗi xảy ra khi trả sách!');
        }
    };

    const handleDelete = async (borrowId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu mượn này?')) return;

        try {
            await deleteBorrow(borrowId);
            alert('Xóa phiếu mượn thành công!');
            fetchData();
        } catch (error) {
            console.error('Error deleting borrow:', error);
            alert(error.message || 'Có lỗi xảy ra khi xóa phiếu mượn!');
        }
    };

    const resetForm = () => {
        setBorrowForm({
            userId: '',
            bookId: '',
            dueDate: '',
            notes: ''
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status, dueDate) => {
        if (status === 'returned') return 'returned';
        if (status === 'borrowed' && new Date(dueDate) < new Date()) return 'overdue';
        return 'borrowed';
    };

    const getStatusText = (status, dueDate) => {
        if (status === 'returned') return 'Đã trả';
        if (status === 'borrowed' && new Date(dueDate) < new Date()) return 'Quá hạn';
        return 'Đang mượn';
    };

    const filteredBorrows = borrows.filter(borrow => {
        if (filterStatus && borrow.status !== filterStatus) return false;
        if (filterUser && borrow.userId !== parseInt(filterUser)) return false;
        return true;
    });

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="borrow-management">
            <div className="page-header">
                <div className="header-content">
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Quay lại Dashboard
                    </button>
                    <h1>📝 Quản lý Mượn trả</h1>
                    <button 
                        className="add-btn"
                        onClick={() => {
                            setShowAddForm(true);
                            resetForm();
                        }}
                    >
                        + Tạo phiếu mượn mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <div className="filter-group">
                    <label>Lọc theo trạng thái:</label>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="borrowed">Đang mượn</option>
                        <option value="returned">Đã trả</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <label>Lọc theo người dùng:</label>
                    <select 
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <option value="">Tất cả người dùng</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fullname || user.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Tạo phiếu mượn mới</h2>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="borrow-form">
                            <div className="form-group">
                                <label>Người mượn *</label>
                                <select
                                    required
                                    value={borrowForm.userId}
                                    onChange={(e) => setBorrowForm({...borrowForm, userId: e.target.value})}
                                >
                                    <option value="">Chọn người mượn</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullname || user.username} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Sách *</label>
                                <select
                                    required
                                    value={borrowForm.bookId}
                                    onChange={(e) => setBorrowForm({...borrowForm, bookId: e.target.value})}
                                >
                                    <option value="">Chọn sách</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} - {book.author} (Còn: {book.availableCopies})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ngày hết hạn</label>
                                <input
                                    type="date"
                                    value={borrowForm.dueDate}
                                    onChange={(e) => setBorrowForm({...borrowForm, dueDate: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <small>Để trống sẽ tự động đặt 14 ngày từ hôm nay</small>
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    rows="3"
                                    value={borrowForm.notes}
                                    onChange={(e) => setBorrowForm({...borrowForm, notes: e.target.value})}
                                    placeholder="Nhập ghi chú (tùy chọn)..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Tạo phiếu mượn
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowAddForm(false);
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

            {/* Borrows List */}
            <div className="borrows-container">
                {filteredBorrows.length > 0 ? (
                    <div className="borrows-table">
                        <div className="table-header">
                            <div className="col">Người mượn</div>
                            <div className="col">Sách</div>
                            <div className="col">Ngày mượn</div>
                            <div className="col">Ngày hết hạn</div>
                            <div className="col">Ngày trả</div>
                            <div className="col">Trạng thái</div>
                            <div className="col">Thao tác</div>
                        </div>
                        
                        {filteredBorrows.map((borrow) => (
                            <div key={borrow.id} className="table-row">
                                <div className="col">
                                    <div className="user-info">
                                        <div className="user-name">{borrow.user?.fullname || borrow.user?.username}</div>
                                        <div className="user-email">{borrow.user?.email}</div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="book-info">
                                        <div className="book-title">{borrow.book?.title}</div>
                                        <div className="book-author">{borrow.book?.author}</div>
                                    </div>
                                </div>
                                <div className="col">{formatDate(borrow.borrowDate)}</div>
                                <div className="col">{formatDate(borrow.dueDate)}</div>
                                <div className="col">
                                    {borrow.returnDate ? formatDate(borrow.returnDate) : '-'}
                                </div>
                                <div className="col">
                                    <span className={`status ${getStatusColor(borrow.status, borrow.dueDate)}`}>
                                        {getStatusText(borrow.status, borrow.dueDate)}
                                    </span>
                                </div>
                                <div className="col">
                                    <div className="actions">
                                        {borrow.status === 'borrowed' && (
                                            <button 
                                                onClick={() => handleReturn(borrow.id)}
                                                className="return-btn"
                                                title="Trả sách"
                                            >
                                                ↩️ Trả
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(borrow.id)}
                                            className="delete-btn"
                                            title="Xóa phiếu mượn"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-borrows">
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>Không có phiếu mượn nào</h3>
                            <p>Hãy tạo phiếu mượn đầu tiên để bắt đầu quản lý.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BorrowManagement;