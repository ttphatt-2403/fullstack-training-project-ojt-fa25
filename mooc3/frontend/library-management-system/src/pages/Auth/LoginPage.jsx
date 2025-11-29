import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Typography, 
  message, 
  Row, 
  Col,
  Space,
  Divider,
  Checkbox,
  Alert
} from 'antd';
import WeatherWidget from '../../components/WeatherWidget';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  BookOutlined,
  SafetyOutlined,
  RocketOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async ({ username, password }) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(username, password);
      // Debug: log response and stored token/user
      // Open browser console / terminal to see these logs when reproducing
      // eslint-disable-next-line no-console
      console.log('login response:', data, 'token:', localStorage.getItem('token'), 'user:', localStorage.getItem('user'));

      if (!authService.isAuthenticated()) {
        message.error('Đăng nhập thất bại: không nhận token từ server');
        return;
      }

      const user = authService.getCurrentUser();
      if (!user || !user.role) {
        message.error('Không thể xác định quyền user sau khi đăng nhập');
        return;
      }

      // role may be 'Admin' or 'admin' depending on backend; normalize to lowercase
      const role = user.role?.toString().toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/user');
    } catch (err) {
      // Show backend or network errors to the user
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
      
      let errorMessage = 'Đăng nhập thất bại';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Tài khoản hoặc mật khẩu không chính xác!';
      } else if (err?.response?.status === 404) {
        errorMessage = 'Tài khoản không tồn tại!';
      } else if (err?.response?.status === 400) {
        errorMessage = 'Thông tin đăng nhập không hợp lệ!';
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
      padding: "20px",
      position: "relative"
    }}>
      <Row gutter={[32, 0]} align="middle" style={{ width: "100%", maxWidth: "1200px" }}>
        <Col xs={24} lg={12} order={{ xs: 2, lg: 1 }}>
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
              <LoginOutlined style={{ fontSize: "50px", color: "#1e3c72", marginBottom: "15px" }} />
              <Title level={2} style={{ margin: 0, color: "#333" }}>
                Chào mừng trở lại!
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Đăng nhập để tiếp tục sử dụng hệ thống
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
              
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                <Input 
                  prefix={<UserOutlined style={{ color: '#1e3c72' }} />}
                  placeholder="Nhập username của bạn"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#1e3c72' }} />}
                  placeholder="Nhập mật khẩu"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Item>

              <div style={{ marginBottom: "20px" }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
                      <Checkbox style={{ fontSize: "14px" }}>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button type="link" style={{ padding: 0, fontSize: "14px" }}>
                      Quên mật khẩu?
                    </Button>
                  </Col>
                </Row>
              </div>

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
                  {loading ? 'Đang đăng nhập...' : '🚀 Đăng nhập'}
                </Button>

                <Divider plain style={{ fontSize: "14px", color: "#999" }}>
                  Hoặc
                </Divider>

                <div style={{ textAlign: "center" }}>
                  <Text type="secondary">Chưa có tài khoản? </Text>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/register')}
                    style={{ padding: 0, fontSize: "16px", fontWeight: "500" }}
                  >
                    Đăng ký ngay
                  </Button>
                </div>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* Right Side - Welcome Content */}
        <Col xs={24} lg={12} order={{ xs: 1, lg: 2 }} style={{ textAlign: "center", color: "white" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <BookOutlined style={{ fontSize: "80px", color: "#fff", marginBottom: "20px" }} />
              <Title level={1} style={{ color: "white", margin: 0 }}>
                Library Management System
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px" }}>
                Hệ thống quản lý thư viện thông minh
              </Text>
            </div>
            
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "30px", borderRadius: "15px", minHeight: 260 }}>
              <Title level={3} style={{ color: "white", marginBottom: "20px" }}>
                ⚡ Tại sao chọn chúng tôi?
              </Title>
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                  <RocketOutlined style={{ fontSize: "20px", marginRight: "10px" }} />
                  <Text style={{ color: "white", fontSize: "16px" }}>Hiệu suất cao và ổn định</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                  <SafetyOutlined style={{ fontSize: "20px", marginRight: "10px" }} />
                  <Text style={{ color: "white", fontSize: "16px" }}>Bảo mật thông tin tuyệt đối</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                  <StarOutlined style={{ fontSize: "20px", marginRight: "10px" }} />
                  <Text style={{ color: "white", fontSize: "16px" }}>Giao diện thân thiện</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "white" }}>
                  <BookOutlined style={{ fontSize: "20px", marginRight: "10px" }} />
                  <Text style={{ color: "white", fontSize: "16px" }}>Quản lý toàn diện</Text>
                </div>
              </Space>
            </div>
          </Space>
        </Col>
      </Row>
      {/* WeatherWidget */}
      <div style={{ position: 'fixed', right: 32, bottom: 32, zIndex: 100 }}>
        <WeatherWidget themeColor="#1e3c72" />
      </div>
    </div>
  );
}

export default LoginPage;
