import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../services/bookService';
import { getAllCategories } from '../services/categoryService';
import { getAllBorrows } from '../services/borrowService';
import '../styles/LibraryDashboard.css';

const LibraryDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalCategories: 0,
        activeBorrows: 0,
        overdueBooks: 0
    });
    const [recentBorrows, setRecentBorrows] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            // Fetch statistics using services
            const [books, categories, borrows] = await Promise.all([
                getAllBooks(),
                getAllCategories(),
                getAllBorrows()
            ]);

            const activeBorrows = borrows.filter(b => b.status === 'borrowed');
            const currentDate = new Date();
            const overdueBooks = activeBorrows.filter(b => new Date(b.dueDate) < currentDate);

            setStats({
                totalBooks: books.length,
                totalCategories: categories.length,
                activeBorrows: activeBorrows.length,
                overdueBooks: overdueBooks.length
            });

            // Recent borrows (last 5)
            setRecentBorrows(borrows.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="library-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>📚 Hệ thống Quản lý Thư viện</h1>
                    <div className="user-info">
                        <span>Xin chào, {user?.fullname || user?.username}!</span>
                        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-content">
                    {/* Statistics Cards */}
                    <section className="stats-section">
                        <h2>Thống kê tổng quan</h2>
                        <div className="stats-grid">
                            <div className="stat-card books">
                                <div className="stat-icon">📖</div>
                                <div className="stat-info">
                                    <h3>{stats.totalBooks}</h3>
                                    <p>Tổng số sách</p>
                                </div>
                            </div>
                            <div className="stat-card categories">
                                <div className="stat-icon">📁</div>
                                <div className="stat-info">
                                    <h3>{stats.totalCategories}</h3>
                                    <p>Thể loại</p>
                                </div>
                            </div>
                            <div className="stat-card borrows">
                                <div className="stat-icon">📋</div>
                                <div className="stat-info">
                                    <h3>{stats.activeBorrows}</h3>
                                    <p>Đang mượn</p>
                                </div>
                            </div>
                            <div className="stat-card overdue">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-info">
                                    <h3>{stats.overdueBooks}</h3>
                                    <p>Quá hạn</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="actions-section">
                        <h2>Thao tác nhanh</h2>
                        <div className="actions-grid">
                            <button 
                                className="action-btn books-btn"
                                onClick={() => navigate('/books')}
                            >
                                <span className="action-icon">📚</span>
                                <span>Quản lý Sách</span>
                            </button>
                            <button 
                                className="action-btn categories-btn"
                                onClick={() => navigate('/categories')}
                            >
                                <span className="action-icon">🗂️</span>
                                <span>Quản lý Thể loại</span>
                            </button>
                            <button 
                                className="action-btn borrows-btn"
                                onClick={() => navigate('/borrows')}
                            >
                                <span className="action-icon">📝</span>
                                <span>Quản lý Mượn trả</span>
                            </button>
                            <button 
                                className="action-btn users-btn"
                                onClick={() => navigate('/users')}
                            >
                                <span className="action-icon">👥</span>
                                <span>Quản lý Người dùng</span>
                            </button>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="recent-section">
                        <h2>Hoạt động gần đây</h2>
                        <div className="recent-borrows">
                            {recentBorrows.length > 0 ? (
                                <div className="borrows-list">
                                    {recentBorrows.map((borrow) => (
                                        <div key={borrow.id} className="borrow-item">
                                            <div className="borrow-info">
                                                <h4>{borrow.book?.title}</h4>
                                                <p>Người mượn: {borrow.user?.fullname || borrow.user?.username}</p>
                                                <p>Ngày mượn: {formatDate(borrow.borrowDate)}</p>
                                            </div>
                                            <div className={`borrow-status ${borrow.status}`}>
                                                {borrow.status === 'borrowed' ? 'Đang mượn' : 'Đã trả'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">Chưa có hoạt động mượn sách nào.</p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LibraryDashboard;