import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    getAllBooks, 
    searchBooks, 
    getBooksByCategory, 
    createBook, 
    updateBook, 
    deleteBook 
} from '../../services/bookService';
import { getAllCategories } from '../../services/categoryService';
import '../../styles/BookManagement.css';

const BookManagement = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publishedDate: '',
        description: '',
        totalCopies: 1,
        availableCopies: 1,
        imageUrl: '',
        categoryId: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBooks();
        fetchCategories();
    }, [user, navigate]);

    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching books:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await searchBooks(searchQuery);
            setBooks(data);
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    const handleCategoryFilter = async (categoryId) => {
        setSelectedCategory(categoryId);
        try {
            const data = await getBooksByCategory(categoryId);
            setBooks(data);
        } catch (error) {
            console.error('Error filtering books:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingBook) {
                await updateBook(editingBook.id, bookForm);
                alert('Cập nhật sách thành công!');
            } else {
                await createBook(bookForm);
                alert('Thêm sách thành công!');
            }
            
            setShowAddForm(false);
            setEditingBook(null);
            resetForm();
            fetchBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            alert(error.message || 'Có lỗi xảy ra khi lưu sách!');
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setBookForm({
            title: book.title,
            author: book.author || '',
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            publishedDate: book.publishedDate || '',
            description: book.description || '',
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            imageUrl: book.imageUrl || '',
            categoryId: book.categoryId
        });
        setShowAddForm(true);
    };

    const handleDelete = async (bookId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

        try {
            await deleteBook(bookId);
            alert('Xóa sách thành công!');
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert(error.message || 'Có lỗi xảy ra khi xóa sách!');
        }
    };

    const resetForm = () => {
        setBookForm({
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            publishedDate: '',
            description: '',
            totalCopies: 1,
            availableCopies: 1,
            imageUrl: '',
            categoryId: ''
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
        <div className="book-management">
            <div className="page-header">
                <div className="header-content">
                    <button 
                        className="back-btn"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Quay lại Dashboard
                    </button>
                    <h1>📚 Quản lý Sách</h1>
                    <button 
                        className="add-btn"
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingBook(null);
                            resetForm();
                        }}
                    >
                        + Thêm sách mới
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách (tên, tác giả, ISBN, thể loại)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="search-btn">Tìm kiếm</button>
                </div>
                
                <div className="filter-section">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => handleCategoryFilter(e.target.value)}
                        className="category-filter"
                    >
                        <option value="">Tất cả thể loại</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingBook(null);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="book-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên sách *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookForm.title}
                                        onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tác giả</label>
                                    <input
                                        type="text"
                                        value={bookForm.author}
                                        onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input
                                        type="text"
                                        value={bookForm.isbn}
                                        onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nhà xuất bản</label>
                                    <input
                                        type="text"
                                        value={bookForm.publisher}
                                        onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thể loại *</label>
                                    <select
                                        required
                                        value={bookForm.categoryId}
                                        onChange={(e) => setBookForm({...bookForm, categoryId: e.target.value})}
                                    >
                                        <option value="">Chọn thể loại</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ngày xuất bản</label>
                                    <input
                                        type="date"
                                        value={bookForm.publishedDate}
                                        onChange={(e) => setBookForm({...bookForm, publishedDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tổng số bản</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={bookForm.totalCopies}
                                        onChange={(e) => setBookForm({...bookForm, totalCopies: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số bản có sẵn</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bookForm.availableCopies}
                                        onChange={(e) => setBookForm({...bookForm, availableCopies: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    rows="3"
                                    value={bookForm.description}
                                    onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>URL ảnh bìa</label>
                                <input
                                    type="url"
                                    value={bookForm.imageUrl}
                                    onChange={(e) => setBookForm({...bookForm, imageUrl: e.target.value})}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {editingBook ? 'Cập nhật' : 'Thêm sách'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingBook(null);
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

            {/* Books List */}
            <div className="books-grid">
                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} className="book-card">
                            <div className="book-image">
                                {book.imageUrl ? (
                                    <img src={book.imageUrl} alt={book.title} />
                                ) : (
                                    <div className="no-image">📖</div>
                                )}
                            </div>
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p className="author">Tác giả: {book.author || 'Không có'}</p>
                                <p className="category">Thể loại: {book.category?.name}</p>
                                <p className="copies">Có sẵn: {book.availableCopies}/{book.totalCopies}</p>
                                {book.isbn && <p className="isbn">ISBN: {book.isbn}</p>}
                            </div>
                            <div className="book-actions">
                                <button 
                                    onClick={() => handleEdit(book)}
                                    className="edit-btn"
                                >
                                    ✏️ Sửa
                                </button>
                                <button 
                                    onClick={() => handleDelete(book.id)}
                                    className="delete-btn"
                                >
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-books">
                        <p>Không tìm thấy sách nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookManagement;