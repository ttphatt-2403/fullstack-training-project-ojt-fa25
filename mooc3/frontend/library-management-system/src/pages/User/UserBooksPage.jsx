import React, { useState, useEffect, useRef } from 'react';
import { Layout, Row, Col, Typography, Input, Select, Button, Card, Rate, Tag, message, Spin } from 'antd';
import { SearchOutlined, BookOutlined, HeartOutlined, EyeOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import BorrowRequestModal from './components/BorrowRequestModal';
import './UserBooksPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function UserBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryName, setSelectedCategoryName] = useState('Tất cả thể loại');
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  
  // Refs for scroll functionality
  const categoryScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Load initial data
  useEffect(() => {
    loadBooksAndCategories();
  }, []);

  // Filter books when search or category changes
  useEffect(() => {
    filterBooks();
  }, [books, searchText, selectedCategory]);

  // Check scroll arrows visibility
  useEffect(() => {
    checkScrollArrows();
  }, [categories]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = categoryScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollArrows);
      return () => scrollContainer.removeEventListener('scroll', checkScrollArrows);
    }
  }, [categories]);

  const loadBooksAndCategories = async () => {
    setLoading(true);
    try {
      console.log('Loading books and categories...'); // Debug log
      
      const [booksResponse, categoriesResponse] = await Promise.all([
        bookService.getBooks({ page: 1, pageSize: 50 }),
        categoryService.getCategories({ page: 1, pageSize: 50 })
      ]);
      
      console.log('Books response:', booksResponse); // Debug log
      console.log('Categories response:', categoriesResponse); // Debug log
      
      const booksData = booksResponse?.items || booksResponse?.data || [];
      const categoriesData = categoriesResponse?.items || categoriesResponse?.data || [];
      
      console.log('Books response:', booksResponse); // Debug log
      console.log('Categories response:', categoriesResponse); // Debug log
      console.log('Books data:', booksData); // Debug log
      console.log('Categories data:', categoriesData); // Debug log
      
      // Ensure data is array
      const booksArray = Array.isArray(booksData) ? booksData : [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
      
      setBooks(booksArray);
      setCategories(categoriesArray);
      
      // Set featured books (first 4 books for now)
      setFeaturedBooks(booksArray.slice(0, 4));
      
      // Force initial filter to show all books
      setFilteredBooks(booksArray);
      
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Không thể tải dữ liệu từ server');
      
      // Set empty arrays if API fails
      setBooks([]);
      setCategories([]);
      setFeaturedBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    console.log('Filtering books:', books.length, 'searchText:', searchText, 'selectedCategory:', selectedCategory);
    let filtered = [...books];

    // Filter by search text - Enhanced with more fields
    if (searchText) {
      filtered = filtered.filter(book => 
        book.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchText.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchText.toLowerCase()) ||
        book.publisher?.toLowerCase().includes(searchText.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        book.category?.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => {
        const categoryId = book.categoryId || book.category?.id;
        return categoryId === parseInt(selectedCategory);
      });
    }

    console.log('Filtered result:', filtered.length);
    setFilteredBooks(filtered);
  };

  const handleCategoryChange = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName);
  };

  const handleBorrowRequest = (book) => {
    setSelectedBook(book);
    setBorrowModalVisible(true);
  };

  const handleBorrowModalSuccess = () => {
    setBorrowModalVisible(false);
    setSelectedBook(null);
    message.success('Gửi yêu cầu mượn sách thành công!');
    
    // Reload books data to get updated information
    loadBooksAndCategories();
  };

  const getBookStatus = (book) => {
    const available = book.availableQuantity || (book.totalCopies - book.borrowedCopies) || 0;
    if (available > 0) {
      return { status: 'available', text: `Còn ${available}`, color: 'green' };
    } else {
      return { status: 'unavailable', text: 'Đã hết', color: 'red' };
    }
  };

  const getCategoryCounts = () => {
    const counts = {};
    categories.forEach(cat => {
      counts[cat.id] = books.filter(book => {
        const categoryId = book.categoryId || book.category?.id;
        return categoryId === cat.id;
      }).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Scroll functions
  const checkScrollArrows = () => {
    const container = categoryScrollRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scrollLeft = () => {
    const container = categoryScrollRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = categoryScrollRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="user-books-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1} style={{ color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
            Thư viện số hiện đại
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: '16px', marginBottom: '32px' }}>
            Khám phá hàng ngàn đầu sách chất lượng cao
          </Paragraph>
          
          {/* Search Tips */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
              💡 Mẹo tìm kiếm: Gõ tên sách, tác giả, ISBN, nhà xuất bản, thể loại hoặc mô tả để tìm sách phù hợp
            </Text>
          </div>
          
          <div className="search-section">
            <Row gutter={16} justify="center">
              <Col xs={24} sm={16} md={12} lg={10}>
                <Input
                  size="large"
                  placeholder="Tìm theo tên sách, tác giả, ISBN, NXB, mô tả, thể loại..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} sm={8} md={6} lg={4}>
                <Select
                  size="large"
                  value={selectedCategory}
                  onChange={(value) => {
                    const category = categories.find(cat => cat.id === parseInt(value)) || { name: 'Tất cả thể loại' };
                    handleCategoryChange(value, category.name);
                  }}
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="Tất cả thể loại"
                >
                  <Option value="all">Tất cả thể loại</Option>
                  {categories.map(category => (
                    <Option key={category.id} value={category.id.toString()}>
                      {category.name} ({categoryCounts[category.id] || 0})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={6} lg={4}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<SearchOutlined />}
                  style={{ width: '100%', borderRadius: '8px' }}
                  onClick={filterBooks}
                >
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Featured Books Section */}
        <div style={{ marginBottom: '48px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '24px' }}>
            <BookOutlined style={{ marginRight: '8px' }} />
            Sách nổi bật
          </Title>
          
          <Row gutter={[16, 16]}>
            {featuredBooks.map(book => (
              <Col xs={12} sm={12} md={6} lg={6} key={book.id}>
                <BookCard 
                  book={book} 
                  onBorrowRequest={handleBorrowRequest}
                  featured={true}
                />
              </Col>
            ))}
          </Row>
        </div>

        {/* Category Tabs with Scroll Buttons */}
        <div className="category-section" style={{ marginBottom: '24px' }}>
          <div className="category-tabs-wrapper">
            {showLeftArrow && (
              <Button
                type="text"
                icon={<LeftOutlined />}
                className="scroll-button scroll-left"
                onClick={scrollLeft}
                size="small"
              />
            )}
            
            <div 
              className="category-tabs" 
              ref={categoryScrollRef}
              onScroll={checkScrollArrows}
            >
              <div className="category-tabs-container">
                <div 
                  className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all', 'Tất cả thể loại')}
                >
                  Tất cả thể loại
                </div>
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className={`category-tab ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id.toString(), category.name)}
                  >
                    {category.name}
                    <span className="category-count">({categoryCounts[category.id] || 0})</span>
                  </div>
                ))}
              </div>
            </div>

            {showRightArrow && (
              <Button
                type="text"
                icon={<RightOutlined />}
                className="scroll-button scroll-right"
                onClick={scrollRight}
                size="small"
              />
            )}
          </div>
        </div>

        {/* All Books Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ margin: 0 }}>
              {selectedCategoryName}
            </Title>
            
            {/* Search Results Info */}
            {searchText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="blue" style={{ margin: 0 }}>
                  <SearchOutlined style={{ marginRight: '4px' }} />
                  Từ khóa: "{searchText}"
                </Tag>
                <Text type="secondary">
                  {filteredBooks.length} kết quả
                </Text>
              </div>
            )}
          </div>
          
          <Spin spinning={loading}>
            <Row gutter={[16, 16]}>
              {filteredBooks.map(book => (
                <Col xs={12} sm={12} md={6} lg={6} key={book.id}>
                  <BookCard 
                    book={book} 
                    onBorrowRequest={handleBorrowRequest}
                  />
                </Col>
              ))}
            </Row>
          </Spin>
          
          {!loading && filteredBooks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
              <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={4} style={{ color: '#999' }}>
                Không tìm thấy sách phù hợp
              </Title>
              <Text>Hãy thử tìm kiếm với từ khóa khác hoặc chọn thể loại khác</Text>
            </div>
          )}
        </div>
      </Content>

      {/* Borrow Request Modal */}
      <BorrowRequestModal
        visible={borrowModalVisible}
        book={selectedBook}
        onCancel={() => setBorrowModalVisible(false)}
        onSuccess={handleBorrowModalSuccess}
      />
    </div>
  );
}

// BookCard Component - Move outside to fix hoisting issue
function BookCard({ book, onBorrowRequest, featured = false }) {
  // Define getBookStatus inside BookCard component
  const getBookStatus = (book) => {
    // Check available copies - API returns AvailableCopies (capital A)
    const available = book.AvailableCopies || book.availableCopies || 0;
    
    if (available > 0) {
      return { status: 'available', text: `Còn ${available}`, color: 'green' };
    } else {
      return { status: 'unavailable', text: 'Đã hết', color: 'red' };
    }
  };
  
  const bookStatus = getBookStatus(book);

  return (
    <Card
      className={`book-card ${featured ? 'featured' : ''}`}
      cover={
        <div className="book-cover">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <div className="book-cover-placeholder">
              <BookOutlined style={{ fontSize: '48px', color: '#bbb' }} />
            </div>
          )}
        </div>
      }
      actions={[
        <Button 
          key="status"
          size="small"
          type={bookStatus.status === 'available' ? 'default' : 'ghost'}
          style={{ 
            color: bookStatus.color,
            borderColor: bookStatus.color 
          }}
        >
          {bookStatus.text}
        </Button>,
        <Button 
          key="detail"
          size="small"
          icon={<EyeOutlined />}
        >
          Chi tiết
        </Button>
      ]}
      hoverable
    >
      <Card.Meta
        title={
          <div>
            <Text strong style={{ fontSize: '14px', display: 'block' }} ellipsis>
              {book.title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
              {book.author}
            </Text>
          </div>
        }
        description={
          <div>
            <div style={{ marginBottom: '8px' }}>
              <Rate disabled value={4} style={{ fontSize: '12px' }} />
              <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                4.0
              </Text>
            </div>
            {book.category && (
              <Tag size="small" color="blue">
                {book.category.name}
              </Tag>
            )}
          </div>
        }
      />
      
      {bookStatus.status === 'available' && (
        <Button 
          type="primary" 
          size="small" 
          style={{ marginTop: '8px', width: '100%' }}
          onClick={() => onBorrowRequest(book)}
        >
          Yêu cầu mượn
        </Button>
      )}
    </Card>
  );
}

export default UserBooksPage;