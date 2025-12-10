import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tabs, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  Button, 
  message
} from 'antd';
import { 
  MoneyCollectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  PayCircleOutlined
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import { feeService } from '../../services/feeService';

const { TabPane } = Tabs;

function UserFees() {
  // Separate loading flags to avoid a single shared loader blocking the UI
  const [unpaidLoading, setUnpaidLoading] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalFees: 0,
    unpaidFees: 0,
    paidFees: 0,
    unpaidCount: 0,
    paidCount: 0
  });
  const [unpaidFees, setUnpaidFees] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [unpaidPagination, setUnpaidPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [paidPagination, setPaidPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Get user from authService
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (user && user.id) {
      fetchStatistics();
      fetchUnpaidFees();
      fetchPaidFees();
    }
  }, []); // Remove user dependency to prevent infinite loop

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const data = await feeService.getUserFeeStatistics(user.id);
      setStatistics(data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Fetch unpaid fees
  const fetchUnpaidFees = async (page = 1, size = 10) => {
    try {
      setUnpaidLoading(true);
      const data = await feeService.getFeesByUser(user.id, {
        pageNumber: page,
        pageSize: size,
        status: 'unpaid'
      });
      setUnpaidFees(data.data || []);
      setUnpaidPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || size,
        total: data.totalRecords || 0
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách phí chưa thanh toán: ' + (error?.message || error));
    } finally {
      setUnpaidLoading(false);
    }
  };

  // Fetch paid fees
  const fetchPaidFees = async (page = 1, size = 10) => {
    try {
      setPaidLoading(true);
      const data = await feeService.getFeesByUser(user.id, {
        pageNumber: page,
        pageSize: size,
        status: 'paid'
      });
      setPaidFees(data.data || []);
      setPaidPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || size,
        total: data.totalRecords || 0
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách phí đã thanh toán: ' + (error?.message || error));
    } finally {
      setPaidLoading(false);
    }
  };

  // Handle payment
  const handlePay = async (fee) => {
    try {
      setPayLoading(true);
      const response = await feeService.createVNPayPayment(fee.id);
      if (response && response.paymentUrl) {
        window.location.href = response.paymentUrl; // Redirect to VNPay
      } else {
        message.error('Không nhận được URL thanh toán từ server');
      }
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Lỗi khi tạo thanh toán: ' + (error?.message || error));
    } finally {
      setPayLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Fee status tag
  const getFeeStatusTag = (status) => {
    switch (status) {
      case 'paid':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã thanh toán</Tag>;
      case 'unpaid':
        return <Tag color="red" icon={<ClockCircleOutlined />}>Chưa thanh toán</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Fee type tag
  const getFeeTypeTag = (type) => {
    switch (type) {
      case 'overdue':
        return <Tag color="orange">Phí trễ hạn</Tag>;
      case 'damage':
        return <Tag color="red">Phí hư hỏng</Tag>;
      case 'lost':
        return <Tag color="volcano">Phí mất sách</Tag>;
      default:
        return <Tag color="default">{type}</Tag>;
    }
  };

  // Common columns for both tables
  const getColumns = (showPayButton = false) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Loại phí',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getFeeTypeTag(type),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <strong style={{ color: '#f5222d' }}>{formatCurrency(amount)}</strong>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getFeeStatusTag(status),
    },
    {
      title: 'Phiếu mượn',
      dataIndex: 'borrow',
      key: 'borrow',
      render: (borrow) => (
        <div>
          <div>#{borrow?.id}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {borrow?.book?.title}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method || '-',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
      ellipsis: true,
    },
    ...(showPayButton ? [{
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PayCircleOutlined />}
          loading={payLoading}
          onClick={() => handlePay(record)}
        >
          Thanh toán VNPay
        </Button>
      ),
    }] : [])
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>💰 Phí của tôi</h2>

      {!user && (
        <Card>
          <p style={{ color: 'red', textAlign: 'center' }}>
            ⚠️ Không tìm thấy thông tin user. Vui lòng đăng nhập lại.
          </p>
        </Card>
      )}

      {user && (
        <>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chưa thanh toán"
                  value={statistics.unpaidFees}
                  formatter={value => formatCurrency(value)}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ClockCircleOutlined />}
                />
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {statistics.unpaidCount} phí
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Đã thanh toán"
                  value={statistics.paidFees}
                  formatter={value => formatCurrency(value)}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {statistics.paidCount} phí
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng cộng"
                  value={statistics.totalFees}
                  formatter={value => formatCurrency(value)}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<MoneyCollectOutlined />}
                />
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {statistics.unpaidCount + statistics.paidCount} phí
                </div>
              </Card>
            </Col>
          </Row>

          {/* Tabs for Unpaid and Paid Fees */}
          <Card>
            <Tabs defaultActiveKey="unpaid">
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined />
                    Chưa thanh toán ({statistics.unpaidCount})
                  </span>
                } 
                key="unpaid"
              >
                <Table
                  columns={getColumns(true)}
                  dataSource={unpaidFees}
                  rowKey="id"
                  loading={unpaidLoading}
                  pagination={{
                    current: unpaidPagination.current,
                    pageSize: unpaidPagination.pageSize,
                    total: unpaidPagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} phí`,
                    onChange: (page, size) => {
                      fetchUnpaidFees(page, size);
                    },
                    onShowSizeChange: (current, size) => {
                      fetchUnpaidFees(1, size);
                    }
                  }}
                  scroll={{ x: 1200 }}
                />
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Đã thanh toán ({statistics.paidCount})
                  </span>
                } 
                key="paid"
              >
                <Table
                  columns={getColumns(false)}
                  dataSource={paidFees}
                  rowKey="id"
                  loading={paidLoading}
                  pagination={{
                    current: paidPagination.current,
                    pageSize: paidPagination.pageSize,
                    total: paidPagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} phí`,
                    onChange: (page, size) => {
                      fetchPaidFees(page, size);
                    },
                    onShowSizeChange: (current, size) => {
                      fetchPaidFees(1, size);
                    }
                  }}
                  scroll={{ x: 1200 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
}

export default UserFees;