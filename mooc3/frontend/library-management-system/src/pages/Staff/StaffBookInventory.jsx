import { Table, Button, Modal, Form, InputNumber, Input, message, Tag, Drawer, Descriptions, Space, Badge } from 'antd';'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { bookService } from "../../services/bookService";
import dayjs from 'dayjs';

function StaffBookInventory() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // State for borrow details drawer
  const [borrowsDrawerOpen, setBorrowsDrawerOpen] = useState(false);
  const [bookBorrows, setBookBorrows] = useState(null);
  const [borrowsLoading, setBorrowsLoading] = useState(false);

  // pagination state
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();

  // Load books when component mounts
  useEffect(() => {
    fetchBooks(1, pagination.pageSize, '');
  }, []);

  // Populate form when modal opens
  useEffect(() => {
    if (!modalOpen || !selectedBook) return;
    form.setFieldsValue({
      totalCopies: selectedBook.totalCopies,
      availableCopies: selectedBook.availableCopies
    });
  }, [modalOpen, selectedBook, form]);

  const fetchBooks = async (page = 1, pageSize = 10, query = '') => {
    setLoading(true);
    try {
      let data;
      if (query.trim()) {
        // Use search API if query exists
        setIsSearching(true);
        data = await bookService.searchBooks({ query: query.trim(), page, pageSize });
      } else {
        // Use regular getBooks API
        setIsSearching(false);
        data = await bookService.getBooks({ page, pageSize });
      }
      
      setBooks(data.items || []);
      setPagination({ 
        current: data.pageNumber || page, 
        pageSize: data.pageSize || pageSize, 
        total: data.total || 0 
      });
    } catch (err) {
      console.error('fetchBooks error:', err?.response || err);
      const text = err?.response?.data?.message || err?.response?.data || err.message || 'Lỗi khi lấy danh sách sách';
      message.error(text);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (values) => {
    try {
      await bookService.updateBookQuantity(selectedBook.id, {
        totalCopies: values.totalCopies,
        availableCopies: values.availableCopies
      });
      message.success("Đã cập nhật số lượng sách thành công!");
      setModalOpen(false);
      setSelectedBook(null);
      form.resetFields();
      fetchBooks(pagination.current, pagination.pageSize, searchQuery);
    } catch (error) {
      console.error('Update quantity error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi cập nhật số lượng!";
      message.error(errorMsg);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchBooks(1, pagination.pageSize, value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchBooks(1, pagination.pageSize, '');
  };

  const openQuantityModal = (book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const openBorrowsDrawer = async (book) => {
    setBorrowsDrawerOpen(true);
    setBorrowsLoading(true);
    try {
      const data = await bookService.getBookBorrows(book.id);
      setBookBorrows(data);
    } catch (error) {
      console.error('Get book borrows error:', error);
      message.error('Không thể tải thông tin phiếu mượn!');
    } finally {
      setBorrowsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
    form.resetFields();
  };

  const closeBorrowsDrawer = () => {
    setBorrowsDrawerOpen(false);
    setBookBorrows(null);
  };

  const getStatusTag = (book) => {
    const totalCopies = book.totalCopies || 0;
    const availableCopies = book.availableCopies || 0;
    
    // Sửa logic: đảm bảo availableCopies không vượt quá totalCopies
    const actualAvailable = Math.min(availableCopies, totalCopies);
    const borrowed = totalCopies - actualAvailable;
    
    if (actualAvailable === 0) {
      return <Tag color="red">Hết sách</Tag>;
    } else if (borrowed > 0) {
      return <Tag color="orange">Có người mượn</Tag>;
    } else {
      return <Tag color="green">Sẵn có</Tag>;
    }
  };

  const columns = [
    { 
      title: 'Tên sách', 
      dataIndex: 'title',
      width: '20%',
      ellipsis: true
    },
    { 
      title: 'Tác giả', 
      dataIndex: 'author',
      width: '15%',
      ellipsis: true
    },
    { 
      title: 'Thể loại', 
      dataIndex: ['category', 'name'],
      width: '12%'
    },
    { 
      title: 'Tổng số', 
      dataIndex: 'totalCopies',
      width: '10%',
      align: 'center'
    },
    { 
      title: 'Có sẵn', 
      dataIndex: 'availableCopies',
      width: '10%',
      align: 'center'
    },
    { 
      title: 'Đang mượn',
      width: '10%',
      align: 'center',
      render: (_, book) => {
        const borrowed = (book.totalCopies || 0) - (book.availableCopies || 0);
        return Math.max(0, borrowed); // Đảm bảo không âm
      }
    },
    {
      title: 'Trạng thái',
      width: '12%',
      align: 'center',
      render: (_, book) => getStatusTag(book)
    },
    {
      title: 'Hành động',
      width: '15%',
      align: 'center',
      render: (_, book) => (
        <Space direction="vertical" size="small">
          <Button 
            type="primary" 
            size="small"
            onClick={() => openQuantityModal(book)}
          >
            Sửa số lượng
          </Button>
          <Button 
            size="small"
            onClick={() => openBorrowsDrawer(book)}
          >
            Xem phiếu mượn
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 16 }}>Quản lý số lượng sách</h2>
        
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <Input.Search
              placeholder="Tìm kiếm sách (không phân biệt hoa/thường): tên sách, tác giả, ISBN, thể loại..."
              style={{ maxWidth: '500px', flex: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              enterButton="Tìm kiếm"
              loading={loading}
              allowClear
              size="large"
            />
            {isSearching && (
              <Button 
                icon={<ClearOutlined />} 
                onClick={handleClearSearch}
                title="Xóa bộ lọc tìm kiếm"
                size="large"
              >
                Hiển thị tất cả
              </Button>
            )}
          </div>
        </div>
        
        {isSearching && (
          <div style={{ marginBottom: 8, color: '#666' }}>
            <SearchOutlined /> Kết quả tìm kiếm cho: "<strong>{searchQuery}</strong>" 
            ({pagination.total} kết quả)
          </div>
        )}
      </div>

      <Table
        dataSource={books}
        loading={loading}
        rowKey="id"
        columns={columns}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sách`,
        }}
        onChange={(pag) => {
          setPagination(pag);
          fetchBooks(pag.current, pag.pageSize, searchQuery);
        }}
        scroll={{ y: 'calc(100vh - 300px)' }}
      />

      <Modal
        title={`Cập nhật số lượng: ${selectedBook?.title || ''}`}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={500}
        destroyOnClose
      >
        {selectedBook && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>Tác giả:</strong> {selectedBook.author}</p>
            <p><strong>Thể loại:</strong> {selectedBook.category?.name}</p>
            <p><strong>Hiện đang mượn:</strong> {(selectedBook.totalCopies || 0) - (selectedBook.availableCopies || 0)} cuốn</p>
          </div>
        )}

        <Form
          form={form}
          onFinish={handleUpdateQuantity}
          layout="vertical"
        >
          <Form.Item
            name="totalCopies"
            label="Tổng số sách"
            rules={[
              { required: true, message: 'Vui lòng nhập tổng số sách' },
              { type: 'number', min: 0, message: 'Tổng số sách phải >= 0' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const borrowed = (selectedBook?.totalCopies || 0) - (selectedBook?.availableCopies || 0);
                  if (value >= borrowed) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(`Tổng số sách phải >= ${borrowed} (số đang mượn)`));
                }
              })
            ]}
            extra="Lưu ý: Không thể giảm xuống dưới số sách đang được mượn"
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              placeholder="Nhập tổng số sách"
            />
          </Form.Item>

          <Form.Item
            name="availableCopies"
            label="Số sách có sẵn"
            rules={[
              { required: true, message: 'Vui lòng nhập số sách có sẵn' },
              { type: 'number', min: 0, message: 'Số sách có sẵn phải >= 0' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const totalCopies = getFieldValue('totalCopies');
                  const borrowed = (selectedBook?.totalCopies || 0) - (selectedBook?.availableCopies || 0);
                  const maxAvailable = (totalCopies || 0) - borrowed;
                  
                  if (value <= maxAvailable) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(`Số có sẵn không thể vượt quá ${maxAvailable}`));
                }
              })
            ]}
            extra="Số có sẵn = Tổng số - Đang mượn"
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }} 
              placeholder="Nhập số sách có sẵn"
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={closeModal}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer hiển thị phiếu mượn của sách */}
      <Drawer
        title={`Phiếu mượn: ${bookBorrows?.book?.title || ''}`}
        open={borrowsDrawerOpen}
        onClose={closeBorrowsDrawer}
        width={800}
      >
        {borrowsLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>
        ) : bookBorrows ? (
          <>
            {/* Thông tin tổng quan về sách */}
            <Descriptions 
              title="Thông tin sách" 
              bordered 
              size="small" 
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Tên sách" span={2}>
                {bookBorrows.book.title}
              </Descriptions.Item>
              <Descriptions.Item label="Tác giả">
                {bookBorrows.book.author}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số sách">
                {bookBorrows.book.totalCopies}
              </Descriptions.Item>
              <Descriptions.Item label="Còn lại">
                {bookBorrows.book.availableCopies}
              </Descriptions.Item>
              <Descriptions.Item label="Đang mượn">
                <Badge count={bookBorrows.book.currentlyBorrowed} color="orange" />
              </Descriptions.Item>
            </Descriptions>

            {/* Thống kê */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue">Tổng phiếu: {bookBorrows.summary.totalBorrows}</Tag>
                <Tag color="orange">Đang mượn: {bookBorrows.summary.currentlyBorrowed}</Tag>
                <Tag color="green">Đã trả: {bookBorrows.summary.returned}</Tag>
                <Tag color="red">Quá hạn: {bookBorrows.summary.overdue}</Tag>
              </Space>
            </div>

            {/* Danh sách phiếu mượn */}
            <Table
              dataSource={bookBorrows.borrows.data}
              rowKey="id"
              size="small"
              pagination={{
                current: bookBorrows.borrows.pageNumber,
                pageSize: bookBorrows.borrows.pageSize,
                total: bookBorrows.borrows.totalRecords,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu`,
              }}
              columns={[
                {
                  title: 'Người mượn',
                  dataIndex: ['user', 'fullname'],
                  render: (name, record) => (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.user.username} | {record.user.email}
                      </div>
                    </div>
                  )
                },
                {
                  title: 'Ngày mượn',
                  dataIndex: 'borrowDate',
                  render: (date) => dayjs(date).format('DD/MM/YYYY')
                },
                {
                  title: 'Hạn trả',
                  dataIndex: 'dueDate',
                  render: (date) => dayjs(date).format('DD/MM/YYYY')
                },
                {
                  title: 'Ngày trả',
                  dataIndex: 'returnDate',
                  render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  render: (status, record) => {
                    if (status === 'borrowed') {
                      if (record.daysOverdue && record.daysOverdue > 0) {
                        return <Tag color="red">Quá hạn {record.daysOverdue} ngày</Tag>;
                      }
                      return <Tag color="orange">Đang mượn</Tag>;
                    }
                    return <Tag color="green">Đã trả</Tag>;
                  }
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'notes',
                  ellipsis: true,
                  render: (notes) => notes || '-'
                }
              ]}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            Không có dữ liệu
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default StaffBookInventory;