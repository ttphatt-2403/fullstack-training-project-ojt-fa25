import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Popconfirm,
  DatePicker,
  InputNumber
} from 'antd';
import {
  DollarOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { feeService } from '../../services/feeService';
import { userService } from '../../services/userService';
import { borrowService } from '../../services/borrowService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const StaffFeeManagement = () => {
  // States for data
  const [unpaidFees, setUnpaidFees] = useState([]);
  const [paidFees, setPaidFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unpaid');

  // Stats
  const [stats, setStats] = useState({
    totalUnpaid: 0,
    totalPaid: 0,
    totalAll: 0
  });

  // Pagination
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

  // Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // Forms
  const [paymentForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // Data for create modal
  const [users, setUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadStats();
    const fetchFunctions = {
      'unpaid': fetchUnpaidFees,
      'paid': fetchPaidFees
    };
    if (fetchFunctions[activeTab]) {
      fetchFunctions[activeTab]();
    }
  }, [activeTab]);

  // Load statistics
  const loadStats = async () => {
    try {
      const [unpaidData, paidData] = await Promise.all([
        feeService.getUnpaidFees({ pageNumber: 1, pageSize: 1 }),
        feeService.getPaidFees({ pageNumber: 1, pageSize: 1 })
      ]);
      
      setStats({
        totalUnpaid: unpaidData.totalRecords || 0,
        totalPaid: paidData.totalRecords || 0,
        totalAll: (unpaidData.totalRecords || 0) + (paidData.totalRecords || 0)
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Fetch unpaid fees
  const fetchUnpaidFees = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const data = await feeService.getUnpaidFees({
        pageNumber: page,
        pageSize: size
      });
      setUnpaidFees(data.data || []);
      setUnpaidPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || size,
        total: data.totalRecords || 0
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách phí chưa thanh toán: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch paid fees
  const fetchPaidFees = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const data = await feeService.getPaidFees({
        pageNumber: page,
        pageSize: size
      });
      setPaidFees(data.data || []);
      setPaidPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || size,
        total: data.totalRecords || 0
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách phí đã thanh toán: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open payment modal
  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentModalOpen(true);
    paymentForm.setFieldsValue({
      paymentMethod: 'cash'
    });
  };

  // Handle payment
  const handlePayment = async (values) => {
    try {
      await feeService.payFee(selectedFee.id, values);
      message.success('Thanh toán thành công!');
      setPaymentModalOpen(false);
      setSelectedFee(null);
      paymentForm.resetFields();
      
      // Refresh data
      loadStats();
      if (activeTab === 'unpaid') {
        fetchUnpaidFees(unpaidPagination.current, unpaidPagination.pageSize);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi thanh toán!';
      message.error(errorMsg);
    }
  };

  // Load users and borrows for create modal
  const loadUsersAndBorrows = async () => {
    try {
      const [usersResponse, borrowsResponse] = await Promise.all([
        userService.getAllUsers({ pageSize: 1000 }),
        borrowService.getBorrows({ pageSize: 1000 })
      ]);
      
      setUsers(usersResponse.items || []);
      setBorrows(borrowsResponse.data || []);
    } catch (error) {
      console.error('Load users and borrows error:', error);
      message.error('Không thể tải danh sách người dùng và phiếu mượn!');
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setCreateModalOpen(true);
    loadUsersAndBorrows();
  };

  // Handle create fee
  const handleCreateFee = async (values) => {
    try {
      const feeData = {
        borrowId: values.borrowId,
        userId: values.userId,
        amount: values.amount,
        type: values.type,
        paymentMethod: values.paymentMethod,
        notes: values.notes
      };
      
      await feeService.createFee(feeData);
      message.success('Tạo phí thành công!');
      setCreateModalOpen(false);
      createForm.resetFields();
      
      // Refresh data
      loadStats();
      if (activeTab === 'unpaid') {
        fetchUnpaidFees(unpaidPagination.current, unpaidPagination.pageSize);
      }
    } catch (error) {
      console.error('Create fee error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo phí!';
      message.error(errorMsg);
    }
  };

  // Handle delete fee
  const handleDeleteFee = async (feeId) => {
    try {
      await feeService.deleteFee(feeId);
      message.success('Xóa phí thành công!');
      
      // Refresh data
      loadStats();
      if (activeTab === 'unpaid') {
        fetchUnpaidFees(unpaidPagination.current, unpaidPagination.pageSize);
      } else if (activeTab === 'paid') {
        fetchPaidFees(paidPagination.current, paidPagination.pageSize);
      }
    } catch (error) {
      console.error('Delete fee error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa phí!';
      message.error(errorMsg);
    }
  };

  // Unpaid fees columns
  const unpaidFeeColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      render: (user) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{user?.fullname || user?.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {user?.email}
          </div>
        </div>
      ),
      width: '20%'
    },
    {
      title: 'Loại phí',
      dataIndex: 'type',
      render: (type) => {
        const typeMap = {
          'late_fee': { label: 'Phí trễ hạn', color: 'red' },
          'damage_fee': { label: 'Phí hư hỏng', color: 'orange' },
          'other': { label: 'Khác', color: 'blue' }
        };
        const typeInfo = typeMap[type] || { label: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
      width: '15%'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
          {amount?.toLocaleString('vi-VN')}đ
        </span>
      ),
      width: '15%'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: '15%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color="red">Chưa thanh toán</Tag>
      ),
      width: '15%'
    },
    {
      title: 'Hành động',
      render: (_, fee) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<DollarOutlined />}
            onClick={() => openPaymentModal(fee)}
          >
            Thanh toán
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phí này?"
            onConfirm={() => handleDeleteFee(fee.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: '20%'
    }
  ];

  // Paid fees columns
  const paidFeeColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      render: (user) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{user?.fullname || user?.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {user?.email}
          </div>
        </div>
      ),
      width: '20%'
    },
    {
      title: 'Loại phí',
      dataIndex: 'type',
      render: (type) => {
        const typeMap = {
          'late_fee': { label: 'Phí trễ hạn', color: 'red' },
          'damage_fee': { label: 'Phí hư hỏng', color: 'orange' },
          'other': { label: 'Khác', color: 'blue' }
        };
        const typeInfo = typeMap[type] || { label: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
      width: '15%'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {amount?.toLocaleString('vi-VN')}đ
        </span>
      ),
      width: '15%'
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      render: (method) => {
        const methodMap = {
          'cash': { label: 'Tiền mặt', color: 'green' },
          'bank_transfer': { label: 'Chuyển khoản', color: 'blue' },
          'credit_card': { label: 'Thẻ tín dụng', color: 'purple' }
        };
        const methodInfo = methodMap[method] || { label: method, color: 'default' };
        return <Tag color={methodInfo.color}>{methodInfo.label}</Tag>;
      },
      width: '15%'
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paidAt',
      render: (date) => (
        <span style={{ color: '#52c41a' }}>
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
      width: '15%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color="green">Đã thanh toán</Tag>
      ),
      width: '15%'
    },
    {
      title: 'Hành động',
      render: (_, fee) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa phí này?"
          onConfirm={() => handleDeleteFee(fee.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      ),
      width: '5%'
    }
  ];

  const refreshData = () => {
    loadStats();
    if (activeTab === 'unpaid') {
      fetchUnpaidFees(unpaidPagination.current, unpaidPagination.pageSize);
    } else if (activeTab === 'paid') {
      fetchPaidFees(paidPagination.current, paidPagination.pageSize);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Dashboard Overview */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Quản lý phí phạt</h2>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Phí chưa thanh toán"
                value={stats.totalUnpaid}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Phí đã thanh toán"
                value={stats.totalPaid}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số phí"
                value={stats.totalAll}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tỷ lệ đã thu"
                value={stats.totalAll > 0 ? Math.round((stats.totalPaid / stats.totalAll) * 100) : 0}
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Action buttons */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Tạo phí mới
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={refreshData}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={`Chưa thanh toán (${stats.totalUnpaid})`} key="unpaid">
          <Table
            dataSource={unpaidFees}
            loading={loading}
            rowKey="id"
            columns={unpaidFeeColumns}
            pagination={{
              ...unpaidPagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phí chưa thanh toán`,
            }}
            onChange={(pag) => {
              setUnpaidPagination(pag);
              fetchUnpaidFees(pag.current, pag.pageSize);
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </TabPane>

        <TabPane tab={`Đã thanh toán (${stats.totalPaid})`} key="paid">
          <Table
            dataSource={paidFees}
            loading={loading}
            rowKey="id"
            columns={paidFeeColumns}
            pagination={{
              ...paidPagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phí đã thanh toán`,
            }}
            onChange={(pag) => {
              setPaidPagination(pag);
              fetchPaidFees(pag.current, pag.pageSize);
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </TabPane>
      </Tabs>

      {/* Payment Modal */}
      <Modal
        title="Thanh toán phí"
        open={paymentModalOpen}
        onCancel={() => {
          setPaymentModalOpen(false);
          setSelectedFee(null);
          paymentForm.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        {selectedFee && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>Người dùng:</strong> {selectedFee.user?.fullname || selectedFee.user?.username}</p>
            <p><strong>Loại phí:</strong> {selectedFee.type}</p>
            <p><strong>Số tiền:</strong> <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{selectedFee.amount?.toLocaleString('vi-VN')}đ</span></p>
            <p><strong>Ghi chú:</strong> {selectedFee.notes || 'Không có'}</p>
          </div>
        )}
        
        <Form
          form={paymentForm}
          onFinish={handlePayment}
          layout="vertical"
        >
          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
          >
            <Select placeholder="Chọn phương thức thanh toán">
              <Option value="cash">Tiền mặt</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
              <Option value="credit_card">Thẻ tín dụng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Ghi chú về việc thanh toán..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setPaymentModalOpen(false);
                setSelectedFee(null);
                paymentForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Fee Modal */}
      <Modal
        title="Tạo phí mới"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={createForm}
          onFinish={handleCreateFee}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Người dùng"
                rules={[{ required: true, message: 'Vui lòng chọn người dùng!' }]}
              >
                <Select
                  placeholder="Chọn người dùng"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.fullname || user.username} - {user.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="borrowId"
                label="Phiếu mượn"
                rules={[{ required: true, message: 'Vui lòng chọn phiếu mượn!' }]}
              >
                <Select
                  placeholder="Chọn phiếu mượn"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {borrows.map(borrow => (
                    <Option key={borrow.id} value={borrow.id}>
                      {borrow.book?.title} - {borrow.user?.fullname || borrow.user?.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại phí"
                rules={[{ required: true, message: 'Vui lòng chọn loại phí!' }]}
              >
                <Select placeholder="Chọn loại phí">
                  <Option value="late_fee">Phí trễ hạn</Option>
                  <Option value="damage_fee">Phí hư hỏng</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Số tiền"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền!' },
                  { type: 'number', min: 0, message: 'Số tiền phải lớn hơn 0!' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết về phí..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalOpen(false);
                createForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo phí
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffFeeManagement;