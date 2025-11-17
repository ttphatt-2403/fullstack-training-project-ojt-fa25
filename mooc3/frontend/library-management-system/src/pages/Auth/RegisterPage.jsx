import { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Typography, DatePicker, message } from 'antd';
import dayjs from 'dayjs';

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Chuyển dateofbirth về dạng yyyy-MM-dd hoặc đúng format backend cần
      if (values.dateofbirth) {
        // Chuyển DatePicker value sang string ISO
        values.dateofbirth = dayjs(values.dateofbirth).format("YYYY-MM-DD");
      }
      await authService.register(values);
      message.success("Đăng ký thành công!");
      navigate('/login');
    } catch (err) {
      message.error("Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f8fa" }}>
      <Card style={{ width: 370 }}>
        <Typography.Title level={3}>Đăng ký</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true, min: 4 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[
            { required: true },
            { pattern: /^0\d{9,10}$/, message: 'Nhập số điện thoại hợp lệ!' }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateofbirth" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Đăng ký</Button>
          <Button type="link" onClick={() => navigate('/login')}>Đăng nhập</Button>
        </Form>
      </Card>
    </div>
  );
}

export default RegisterPage;
