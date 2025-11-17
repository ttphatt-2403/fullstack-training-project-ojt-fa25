import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  message, 
  Spin,
  Typography,
  Descriptions
} from 'antd';
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { borrowService } from '../../services/borrowService';
import { authService } from '../../services/authService';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

function UserBorrows() {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalBorrows: 0,
    currentBorrows: 0,
    onTimeReturns: 0,
    lateReturns: 0,
    overdueCount: 0,
    totalFees: 0,
    unpaidFees: 0
  });
  const [borrows, setBorrows] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.id) {
      setCurrentUser(user);
    } else {
      message.error('Không thể xác định thông tin người dùng');
    }
  }, []);

  // Load data when user changes or filter changes
  useEffect(() => {
    if (currentUser?.id) {
      loadStatistics();
      loadBorrows();
    }
  }, [currentUser, statusFilter, pagination.current, pagination.pageSize]);

  const loadStatistics = async () => {
    try {
      const statsData = await borrowService.getUserBorrowStatistics(currentUser.id);
      setStatistics(statsData);
    } catch (error) {
      console.error('Load statistics error:', error);
      message.error('Không thể tải thống kê');
    }
  };

  const loadBorrows = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const response = await borrowService.getBorrowsByUserWithFilter(currentUser.id, {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        status: statusFilter
      });
      
      setBorrows(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalRecords || 0
      }));
    } catch (error) {
      console.error('Load borrows error:', error);
      message.error('Không thể tải danh sách mượn sách');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const getStatusTag = (record) => {
    const { status, actualStatus, daysOverdue } = record;
    
    if (actualStatus === 'overdue' || (status === 'borrowed' && daysOverdue > 0)) {
      return <Tag color="red">Quá hạn ({daysOverdue} ngày)</Tag>;
    }
    
    switch (status) {
      case 'borrowed':
        return <Tag color="blue">Đang mượn</Tag>;
      case 'returned':
        return <Tag color="green">Đã trả</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const columns = [
    {
      title: 'Tên sách',
      dataIndex: ['book', 'title'],
      key: 'bookTitle',
      width: 200,
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.book?.category?.name}
          </div>
        </div>
      )
    },
    {
      title: 'Tác giả',
      dataIndex: ['book', 'author'],
      key: 'author',
      width: 150
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_, record) => getStatusTag(record)
    },
    {
      title: 'Phí',
      key: 'fees',
      width: 120,
      render: (_, record) => {
        const { totalFees, unpaidFees } = record;
        if (totalFees > 0) {
          return (
            <div>
              <div style={{ fontSize: '12px' }}>
                Tổng: {formatCurrency(totalFees)}
              </div>
              {unpaidFees > 0 && (
                <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  Chưa trả: {formatCurrency(unpaidFees)}
                </div>
              )}
            </div>
          );
        }
        return '-';
      }
    }
  ];

  if (!currentUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải thông tin người dùng...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Lịch sử mượn sách</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lượt mượn"
              value={statistics.totalBorrows}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trả đúng hạn"
              value={statistics.onTimeReturns}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trả trễ"
              value={statistics.lateReturns}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang quá hạn"
              value={statistics.overdueCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Fee Information */}
      {(statistics.totalFees > 0 || statistics.unpaidFees > 0) && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Tổng phí đã phát sinh"
                value={statistics.totalFees}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Phí chưa thanh toán"
                value={statistics.unpaidFees}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: statistics.unpaidFees > 0 ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Filter and Table */}
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <span>Lọc theo trạng thái:</span>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="borrowed">Đang mượn</Option>
              <Option value="returned">Đã trả</Option>
              <Option value="overdue">Quá hạn</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={borrows}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bản ghi`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}

export default UserBorrows;