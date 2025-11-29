import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Typography, 
  DatePicker, 
  message, 
  Row, 
  Col,
  Space,
  Divider,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  CalendarOutlined,
  BookOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      // Convert date từ DD/MM/YYYY sang YYYY-MM-DD cho backend
      if (values.dateofbirth) {
        values.dateofbirth = dayjs(values.dateofbirth).format("YYYY-MM-DD");
      }

      delete values.confirmPassword;   // ❗ Không gửi confirmPassword lên backend

      await authService.register(values);
      message.success("Đăng ký thành công!");
      navigate('/login');
    } catch (err) {
      let errorMessage = 'Đăng ký thất bại';
      
      if (err?.response?.status === 400) {
        errorMessage = 'Thông tin đăng ký không hợp lệ!';
      } else if (err?.response?.status === 409) {
        errorMessage = 'Tài khoản đã tồn tại!';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (!navigator.onLine) {
        errorMessage = 'Không có kết nối internet. Vui lòng kiểm tra lại!';
      }
      
      message.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px"
    }}>
      <Row gutter={[32, 0]} align="middle" style={{ width: "100%", maxWidth: "1200px" }}>
        
        {/* Left Side - Welcome Content */}
        <Col xs={24} lg={12} style={{ textAlign: "center", color: "white" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <BookOutlined style={{ fontSize: "80px", color: "#fff", marginBottom: "20px" }} />
              <Title level={1} style={{ color: "white", margin: 0 }}>
                Library Management System
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px" }}>
                Quản lý thư viện hiện đại và hiệu quả
              </Text>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "30px", borderRadius: "15px" }}>
              <Title level={3} style={{ color: "white", marginBottom: "20px" }}>
                🌟 Tính năng nổi bật
              </Title>
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Text style={{ color: "white", fontSize: "16px" }}>📚 Quản lý sách thông minh</Text>
                <Text style={{ color: "white", fontSize: "16px" }}>👥 Hệ thống phân quyền người dùng</Text>
                <Text style={{ color: "white", fontSize: "16px" }}>📊 Thống kê và báo cáo chi tiết</Text>
                <Text style={{ color: "white", fontSize: "16px" }}>🔔 Thông báo và nhắc nhở tự động</Text>
              </Space>
            </div>
          </Space>
        </Col>

        {/* Right Side - Register Form */}
        <Col xs={24} lg={12}>
          <Card 
            style={{ 
              width: "100%", 
              maxWidth: "450px",
              margin: "0 auto",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: "none"
            }}
            bodyStyle={{ padding: "40px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <SafetyOutlined style={{ fontSize: "50px", color: "#1e3c72", marginBottom: "15px" }} />
              <Title level={2} style={{ margin: 0, color: "#333" }}>
                Tạo tài khoản mới
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Điền thông tin để tham gia hệ thống
              </Text>
            </div>

            <Form layout="vertical" onFinish={onFinish} size="large">
              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError('')}
                  style={{ marginBottom: '20px', borderRadius: '8px' }}
                />
              )}
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, min: 4 }]}>
                    <Input 
                      prefix={<UserOutlined style={{ color: '#1e3c72' }} />}
                      placeholder="Nhập username"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                    <Input 
                      prefix={<MailOutlined style={{ color: '#1e3c72' }} />}
                      placeholder="your@email.com"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true }]}>
                <Input 
                  prefix={<UserOutlined style={{ color: '#1e3c72' }} />}
                  placeholder="Nhập họ và tên đầy đủ"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#1e3c72' }} />}
                      placeholder="Tối thiểu 6 ký tự"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject('Mật khẩu không khớp!');
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#1e3c72' }} />}
                      placeholder="Nhập lại mật khẩu"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại" rules={[
                    { required: true },
                    { pattern: /^0\d{9,10}$/, message: 'Nhập số điện thoại hợp lệ!' }
                  ]}>
                    <Input 
                      prefix={<PhoneOutlined style={{ color: '#1e3c72' }} />}
                      placeholder="0xxxxxxxxx"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dateofbirth" label="Ngày sinh" rules={[
                    { required: true, message: 'Vui lòng chọn ngày sinh!' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        
                        const today = dayjs();
                        const birthDate = dayjs(value);
                        const age = today.diff(birthDate, 'year');
                        
                        if (age < 6) {
                          return Promise.reject('Tuổi phải từ 6 tuổi trở lên!');
                        }
                        
                        if (birthDate.isAfter(today)) {
                          return Promise.reject('Ngày sinh không thể ở tương lai!');
                        }
                        
                        return Promise.resolve();
                      }
                    }
                  ]}>
                    <DatePicker 
                      format="DD/MM/YYYY" 
                      style={{ width: '100%', borderRadius: "8px" }} 
                      placeholder="Chọn ngày sinh"
                      suffixIcon={<CalendarOutlined style={{ color: '#1e3c72' }} />}
                      disabledDate={(current) => {
                        const today = dayjs();
                        if (current && current.isAfter(today, 'day')) {
                          return true;
                        }
                        
                        const minDate = today.subtract(6, 'year');
                        if (current && current.isAfter(minDate, 'day')) {
                          return true;
                        }
                        
                        return false;
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block
                  size="large"
                  style={{ 
                    borderRadius: "10px", 
                    height: "50px",
                    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600"
                  }}
                >
                  🚀 Tạo tài khoản
                </Button>

                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">Đã có tài khoản? </Text>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/login')}
                    style={{ padding: 0, fontSize: "16px", fontWeight: "500" }}
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default RegisterPage;
