import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, message } from 'antd';

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async ({ username, password }) => {
    setLoading(true);
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
      const text = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại';
      message.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f8fa" }}>
      <Card style={{ width: 350 }}>
        <Typography.Title level={3}>Đăng nhập</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Đăng nhập</Button>
          <Button type="link" onClick={() => navigate('/register')}>Đăng ký</Button>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
