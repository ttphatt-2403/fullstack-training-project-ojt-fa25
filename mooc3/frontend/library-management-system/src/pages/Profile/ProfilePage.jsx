import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Row,
  Col,
  DatePicker,
  message,
  Upload,
  Typography,
  Tag,
  Space,
  Statistic
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CrownOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await authService.getMe();
      setUserInfo(response);
      
      // Set form values
      form.setFieldsValue({
        username: response.username,
        email: response.email,
        fullname: response.fullname,
        phone: response.phone,
        dateofbirth: response.dateofbirth ? dayjs(response.dateofbirth) : null,
      });
    } catch (error) {
      message.error('Lỗi khi tải thông tin: ' + (error?.response?.data?.message || error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      
      // Prepare data for API call
      const updateData = {
        id: userInfo.id,
        email: values.email,
        fullname: values.fullname,
        phone: values.phone || '',
        dateofbirth: values.dateofbirth ? values.dateofbirth.format('YYYY-MM-DD') : null,
      };

      // Call API with ID and data
      const response = await userService.updateProfile(userInfo.id, updateData);
      
      // Update local user info
      const updatedUser = { ...userInfo, ...response };
      setUserInfo(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      message.success('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (error) {
      message.error('Lỗi khi cập nhật: ' + (error?.response?.data?.message || error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original values
    if (userInfo) {
      form.setFieldsValue({
        username: userInfo.username,
        email: userInfo.email,
        fullname: userInfo.fullname,
        phone: userInfo.phone,
        dateofbirth: userInfo.dateofbirth ? dayjs(userInfo.dateofbirth) : null,
      });
    }
  };

  const handleAvatarUpload = async (file) => {
    message.info('Tính năng upload avatar sẽ được phát triển sau');
    return false;
  };

  if (!userInfo) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Card loading={loading}>
          <p>Đang tải thông tin...</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        <UserOutlined style={{ marginRight: '8px' }} />
        Thông tin cá nhân
      </Title>

      <Row gutter={24}>
        {/* Left Column - Avatar & System Info */}
        <Col span={8}>
          <Card title="Ảnh đại diện" loading={loading && !userInfo} style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={userInfo?.avatarurl}
                icon={<UserOutlined />}
                style={{ 
                  marginBottom: '16px',
                  backgroundColor: !userInfo?.avatarurl ? '#1890ff' : undefined,
                  border: '3px solid #f0f0f0'
                }}
              />
              {userInfo && (
                <>
                  <br />
                  <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                    {userInfo.fullname || userInfo.username}
                  </Text>
                  <Upload
                    beforeUpload={handleAvatarUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />} loading={uploading} size="small">
                      Thay đổi ảnh
                    </Button>
                  </Upload>
                </>
              )}
            </div>
          </Card>

          <Card title="Thông tin hệ thống" loading={loading && !userInfo} style={{ marginBottom: '24px' }}>
            {userInfo && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>
                    <CrownOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    Vai trò:
                  </Text>
                  <Tag 
                    color={
                      userInfo.role === 'admin' ? 'red' :
                      userInfo.role === 'staff' ? 'blue' : 'green'
                    }
                    style={{ marginLeft: '8px' }}
                  >
                    {userInfo.role?.toUpperCase()}
                  </Tag>
                </div>
                
                <div>
                  <Text strong>
                  <CheckCircleOutlined style={{ marginRight: '8px', color: userInfo.isactive ? '#52c41a' : '#f5222d' }} />
                  Trạng thái:
                </Text>
                <Tag color={userInfo.isactive ? 'success' : 'error'} style={{ marginLeft: '8px' }}>
                  {userInfo.isactive ? 'Hoạt động' : 'Bị khóa'}
                </Tag>
              </div>

              <div>
                <Text strong>
                  <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Ngày tham gia:
                </Text>
                <br />
                <Text type="secondary" style={{ marginLeft: '24px' }}>
                  {userInfo.createdat ? dayjs(userInfo.createdat).format('DD/MM/YYYY HH:mm') : 'N/A'}
                </Text>
              </div>
            </Space>
            )}
          </Card>
        </Col>

        {/* Right Column - Main Profile Form */}
        <Col span={16}>
          <Card
            loading={loading && !userInfo}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  Thông tin chi tiết
                </Title>
                {userInfo && (
                  !editing ? (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEditing(true)}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <Space>
                      <Button onClick={handleCancel}>
                        Hủy
                      </Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={loading}
                        onClick={() => form.submit()}
                      >
                        Lưu thay đổi
                      </Button>
                    </Space>
                  )
                )}
              </div>
            }
            style={{ marginBottom: '24px' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                username: userInfo.username,
                email: userInfo.email,
                fullname: userInfo.fullname,
                phone: userInfo.phone,
                dateofbirth: userInfo.dateofbirth ? dayjs(userInfo.dateofbirth) : null,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        Tên đăng nhập
                      </span>
                    }
                    name="username"
                  >
                    <Input 
                      disabled 
                      placeholder="Không thể thay đổi"
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={
                      <span>
                        <MailOutlined style={{ marginRight: '8px' }} />
                        Email
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input 
                      disabled={!editing}
                      placeholder="Nhập email của bạn" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: '8px' }} />
                    Họ và tên
                  </span>
                }
                name="fullname"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ tên!' },
                  { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                ]}
              >
                <Input 
                  disabled={!editing}
                  placeholder="Nhập họ và tên đầy đủ" 
                  size="large"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span>
                        <PhoneOutlined style={{ marginRight: '8px' }} />
                        Số điện thoại
                      </span>
                    }
                    name="phone"
                    rules={[
                      { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                    ]}
                  >
                    <Input 
                      disabled={!editing}
                      placeholder="0901234567"
                      maxLength={11}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={
                      <span>
                        <CalendarOutlined style={{ marginRight: '8px' }} />
                        Ngày sinh
                      </span>
                    }
                    name="dateofbirth"
                  >
                    <DatePicker
                      disabled={!editing}
                      style={{ width: '100%' }}
                      placeholder="Chọn ngày sinh"
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current > dayjs()}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={handleCancel} size="large">
                      Hủy bỏ
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </Card>

          {/* Quick Actions Card */}
          <Card title="Hành động nhanh">
            <Row gutter={16}>
              <Col span={8}>
                <Button 
                  block 
                  size="large"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  disabled={editing}
                >
                  Chỉnh sửa thông tin
                </Button>
              </Col>
              <Col span={8}>
                <Button 
                  block 
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => message.info('Tính năng sẽ được phát triển sau')}
                >
                  Đổi ảnh đại diện
                </Button>
              </Col>
              <Col span={8}>
                <Button 
                  block 
                  size="large"
                  icon={<SaveOutlined />}
                  type="dashed"
                  onClick={fetchUserInfo}
                >
                  Làm mới trang
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProfilePage;