import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Typography, Spin, message, List } from "antd";
import { BookOutlined } from "@ant-design/icons";
import api from "../../services/api";

const { Title } = Typography;

const columnsHistory = [
  { title: "Tên sách", dataIndex: "title", key: "title" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
  { title: "Ngày mượn", dataIndex: "borrowDate", key: "borrowDate" },
  { title: "Ngày trả", dataIndex: "returnDate", key: "returnDate" },
];

const columnsBooks = [
  { title: "Tên sách", dataIndex: "title", key: "title" },
  { title: "Số lượt mượn", dataIndex: "borrowCount", key: "borrowCount" },
];

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/user-stats");
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
      <Title level={2} style={{ color: '#1e293b', marginBottom: 24, fontWeight: 700, letterSpacing: 1 }}>Dashboard Người dùng</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Tổng lượt mượn" value={stats.totalBorrowed} prefix={<BookOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Đang mượn" value={stats.currentlyBorrowing} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Statistic title="Đã trả" value={stats.returnedBooks} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={14}>
          <Card title={<span style={{ fontWeight: 600 }}>Lịch sử mượn gần nhất</span>} style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <Table columns={columnsHistory} dataSource={stats.borrowHistory} rowKey={(r) => r.title + r.borrowDate} pagination={false} />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title={<span style={{ fontWeight: 600 }}>Sách gợi ý</span>} style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", background: "#fff" }}>
            <List
              dataSource={stats.suggestedBooks}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={<span style={{ fontWeight: 500 }}>{item.title}</span>} description={<span style={{ color: '#1677ff' }}>Số lượt mượn: {item.borrowCount}</span>} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboard;
