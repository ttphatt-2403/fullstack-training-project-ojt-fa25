import React, { useState } from 'react';
import { Modal, Form, DatePicker, Input, Button, message, Row, Col, Typography, Tag, Space } from 'antd';
import { CalendarOutlined, BookOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { borrowService } from '../../../services/borrowService';
import { authService } from '../../../services/authService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

function BorrowRequestModal({ visible, book, onCancel, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = authService.getCurrentUser();

  const handleSubmit = async (values) => {
    if (!book || !user) return;

    setLoading(true);
    try {
      const borrowData = {
        userId: user.id,
        bookId: book.id,
        borrowDate: values.borrowDate.format('YYYY-MM-DD'),
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        notes: values.notes || '',
        fee: 20000 // Default borrow fee
      };

      await borrowService.createBorrow(borrowData);
      message.success('Gửi yêu cầu mượn sách thành công! Vui lòng chờ staff duyệt.');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Error creating borrow request:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu mượn sách');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Disable past dates and dates more than 30 days in the future
  const disabledDate = (current) => {
    const today = dayjs();
    const maxDate = today.add(30, 'day');
    return current && (current < today.startOf('day') || current > maxDate);
  };

  // Auto calculate due date (14 days after borrow date)
  const handleBorrowDateChange = (date) => {
    if (date) {
      const dueDate = date.add(14, 'day');
      form.setFieldValue('dueDate', dueDate);
    }
  };

  return (
    <Modal
      title={
        <Space align="center">
          <BookOutlined style={{ color: '#1890ff' }} />
          <span>Yêu cầu mượn sách</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={null}
      destroyOnClose
    >
      {book && (
        <div>
          {/* Book Information */}
          <div style={{ 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px' 
          }}>
            <Row gutter={16} align="middle">
              <Col flex="80px">
                <div style={{
                  width: '60px',
                  height: '80px',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <BookOutlined style={{ fontSize: '24px', color: '#90caf9' }} />
                  )}
                </div>
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ margin: '0 0 8px 0' }}>
                  {book.title}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                  <strong>Tác giả:</strong> {book.author}
                </Text>
                <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                  <strong>ISBN:</strong> {book.isbn}
                </Text>
                {book.category && (
                  <Tag color="blue" size="small">
                    {book.category.name}
                  </Tag>
                )}
                <Tag color="green" size="small" style={{ marginLeft: '4px' }}>
                  Còn {book.AvailableCopies || book.availableCopies || 0} cuốn
                </Tag>
              </Col>
            </Row>
          </div>

          {/* User Information */}
          <div style={{ 
            background: '#f0f8ff', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '24px' 
          }}>
            <Text strong>
              <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Thông tin người mượn:
            </Text>
            <div style={{ marginTop: '8px' }}>
              <Text>{user?.fullname || user?.username}</Text>
              <Text type="secondary" style={{ marginLeft: '16px' }}>
                {user?.email}
              </Text>
            </div>
          </div>

          {/* Borrow Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              borrowDate: dayjs(),
              dueDate: dayjs().add(14, 'day')
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="borrowDate"
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      Ngày mượn
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày mượn' }
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                    onChange={handleBorrowDateChange}
                    placeholder="Chọn ngày mượn"
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      Ngày trả dự kiến
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày trả' }
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      const borrowDate = form.getFieldValue('borrowDate');
                      if (!borrowDate) return false;
                      const minDate = borrowDate.add(1, 'day');
                      const maxDate = borrowDate.add(30, 'day');
                      return current && (current < minDate || current > maxDate);
                    }}
                    placeholder="Chọn ngày trả"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label={
                <span>
                  <EditOutlined style={{ marginRight: '4px' }} />
                  Ghi chú (tùy chọn)
                </span>
              }
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú nếu có (mục đích sử dụng, yêu cầu đặc biệt...)"
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Fee Information */}
            <div style={{ 
              background: '#e6f7ff', 
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <Text strong style={{ color: '#1890ff' }}>
                💰 Phí mượn sách:
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4237a' }}>
                  20,000 VNĐ
                </Text>
                <Text style={{ marginLeft: '8px', color: '#666' }}>
                  (phí cố định cho mọi loại sách)
                </Text>
              </div>
              <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                * Phí sẽ được thu khi nhận sách tại thư viện
              </Text>
            </div>

            {/* Rules Notice */}
            <div style={{ 
              background: '#fffbe6', 
              border: '1px solid #ffe58f',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <Text strong style={{ color: '#d48806' }}>
                📋 Lưu ý về quy định mượn sách:
              </Text>
              <ul style={{ margin: '8px 0 0 16px', color: '#666' }}>
                <li>Thời gian mượn tối đa: 30 ngày</li>
                <li>Có thể gia hạn 1 lần nếu không có người đặt trước</li>
                <li>Phí trả muộn: 5,000 VND/ngày</li>
                <li>Bồi thường nếu làm hư hỏng hoặc mất sách</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>
                  Hủy bỏ
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<BookOutlined />}
                >
                  Gửi yêu cầu mượn
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
}

export default BorrowRequestModal;