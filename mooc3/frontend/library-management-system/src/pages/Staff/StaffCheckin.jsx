import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Table,
  Tag
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { borrowService } from '../../services/borrowService';
import { userService } from '../../services/userService';
import { bookService } from '../../services/bookService';

const { Title, Text } = Typography;
const { Option } = Select;

const StaffCheckin = () => {
  // Form state
  const [checkinForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Data for dropdowns
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    availableBooks: 0,
    todayBorrows: 0,
    activeUsers: 0,
    totalActive: 0
  });

  // Recent borrows (for display)
  const [recentBorrows, setRecentBorrows] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadBooks(),
        loadStats(),
        loadRecentBorrows()
      ]);
    } catch (error) {
      console.error('Load initial data error:', error);
      message.error('Không thể tải dữ liệu ban đầu!');
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers({ pageSize: 1000 });
      setUsers(response.items || []);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  // Load available books
  const loadBooks = async () => {
    try {
      const response = await bookService.getBooks({ pageSize: 1000 });
      const availableBooks = (response.items || []).filter(book => (book.availableCopies || 0) > 0);
      setBooks(availableBooks);
    } catch (error) {
      console.error('Load books error:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const [activeData, booksResponse, usersResponse] = await Promise.all([
        borrowService.getActiveBorrows({ pageNumber: 1, pageSize: 1 }),
        bookService.getBooks({ pageSize: 1 }),
        userService.getAllUsers({ pageSize: 1 })
      ]);

      setStats({
        availableBooks: books.length,
        todayBorrows: 0, // TODO: Cần API riêng
        activeUsers: usersResponse.totalRecords || 0,
        totalActive: activeData.totalRecords || 0
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Load recent borrows
  const loadRecentBorrows = async () => {
    try {
      const response = await borrowService.getActiveBorrows({ pageNumber: 1, pageSize: 5 });
      setRecentBorrows(response.data || []);
    } catch (error) {
      console.error('Load recent borrows error:', error);
    }
  };

  // Handle check-in (cho mượn sách)  
  const handleCheckin = async (values) => {
    try {
      setLoading(true);
      const borrowData = {
        userId: parseInt(values.userId),
        bookId: parseInt(values.bookId),
        dueDate: values.dueDate?.format('YYYY-MM-DDTHH:mm:ss'), // Sử dụng local time thay vì UTC
        notes: values.notes
      };

      await borrowService.createBorrow(borrowData);
      message.success('Cho mượn sách thành công!');
      checkinForm.resetFields();

      // Set default due date again
      checkinForm.setFieldsValue({
        dueDate: dayjs().add(14, 'day')
      });

      // Refresh data
      await loadInitialData();
    } catch (error) {
      console.error('Checkin error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi cho mượn sách!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    checkinForm.resetFields();
    checkinForm.setFieldsValue({
      dueDate: dayjs().add(14, 'day')
    });
  };

  // Columns for recent borrows table
  const recentBorrowColumns = [
    {
      title: 'Người mượn',
      dataIndex: 'user',
      render: (user) => (
        <div>
          <Text strong>{user?.fullname || user?.username}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Text>
        </div>
      ),
      width: '30%'
    },
    {
      title: 'Sách',
      dataIndex: 'book',
      render: (book) => (
        <div>
          <Text strong>{book?.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{book?.author}</Text>
        </div>
      ),
      width: '35%'
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: '20%'
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      render: (date) => (
        <Tag color="blue">
          {dayjs(date).format('DD/MM/YYYY')}
        </Tag>
      ),
      width: '15%'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <BookOutlined style={{ marginRight: '8px' }} />
          Check-in - Cho mượn sách
        </Title>
        <Text type="secondary">Quầy thủ thư - Tạo phiếu mượn sách mới</Text>
      </div>

      {/* Statistics Dashboard */}
      <Row gutter={16} style={{ marginBottom: '32px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sách có sẵn"
              value={books.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phiếu mượn hôm nay"
              value={stats.todayBorrows}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang được mượn"
              value={stats.totalActive}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Check-in Form */}
        <Col span={14}>
          <Card 
            title="Tạo phiếu mượn mới" 
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadInitialData}
                loading={loading}
              >
                Làm mới
              </Button>
            }
          >
            <Form
              form={checkinForm}
              onFinish={handleCheckin}
              layout="vertical"
              initialValues={{
                dueDate: dayjs().add(14, 'day')
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="userId"
                    label="Chọn người dùng"
                    rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
                  >
                    <Select
                      placeholder="Tìm kiếm theo ID, tên hoặc email"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    >
                      {users.map(user => (
                        <Option key={user.id} value={user.id}>
                          <div>
                            <strong>#{user.id}</strong> - {user.fullname || user.username}
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {user.email}
                            </Text>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="bookId"
                    label="Chọn sách"
                    rules={[{ required: true, message: 'Vui lòng chọn sách!' }]}
                  >
                    <Select
                      placeholder="Tìm kiếm theo ID hoặc tên sách"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                    >
                      {books.map(book => (
                        <Option key={book.id} value={book.id}>
                          <div>
                            <strong>#{book.id}</strong> - {book.title}
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {book.author} - Còn: {book.availableCopies} cuốn
                            </Text>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="dueDate"
                    label="Ngày hết hạn"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày hết hạn"
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current < dayjs().endOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="notes"
                    label="Ghi chú"
                  >
                    <Input placeholder="Ghi chú thêm (tùy chọn)" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                <Space size="large">
                  <Button 
                    onClick={handleReset}
                    style={{ minWidth: '120px' }}
                  >
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={loading}
                    style={{ minWidth: '120px' }}
                    size="large"
                  >
                    <CheckCircleOutlined />
                    Xác nhận cho mượn
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Recent Borrows */}
        <Col span={10}>
          <Card title="Phiếu mượn gần đây" style={{ height: '100%' }}>
            <Table
              dataSource={recentBorrows}
              columns={recentBorrowColumns}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
              rowKey="id"
            />
            {recentBorrows.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <br />
                Chưa có phiếu mượn nào gần đây
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffCheckin;