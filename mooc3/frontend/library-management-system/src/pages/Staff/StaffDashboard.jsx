import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Typography, Spin, message } from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";
import api from "../../services/api";

const { Title } = Typography;

const columnsBooks = [
  { title: "Tên sách", dataIndex: "title", key: "title" },
  { title: "Số lượt mượn", dataIndex: "borrowCount", key: "borrowCount" },
];

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/staff-stats");
        setStats(response.data);
      } catch {
        message.error("Không thể tải dữ liệu dashboard!");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "120px auto" }} />;
  }

  return (
    <div style={{ padding: 30, background: "linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)", minHeight: "100vh" }}>
      <Title level={2} style={{ color: '#1e293b', marginBottom: 24, fontWeight: 700, letterSpacing: 1 }}>Dashboard Nhân viên</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Sách đang được mượn" value={stats.booksBorrowed} prefix={<BookOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Lượt mượn hôm nay" value={stats.borrowsToday} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Lượt mượn tuần này" value={stats.borrowsThisWeek} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Lượt mượn tháng này" value={stats.borrowsThisMonth} valueStyle={{ color: '#d4380d' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Số user đang mượn" value={stats.activeUsers} prefix={<UserOutlined style={{ color: '#08979c' }} />} valueStyle={{ color: '#08979c' }} />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title={<span style={{ fontWeight: 600 }}>Top sách được mượn nhiều nhất</span>} style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Table columns={columnsBooks} dataSource={stats.topBooks} rowKey="title" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;
