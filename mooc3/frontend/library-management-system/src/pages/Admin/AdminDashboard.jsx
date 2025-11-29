import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Spin,
  message,
  Space,
  Divider,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BarChartOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getDashboardStats } from "../../services/dashboardService";

const { Title, Text } = Typography;

const cardStyle = {
  borderRadius: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  background: "#fff",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        message.error("Không thể tải dữ liệu dashboard!");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const columnsCategories = [
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Số lượng sách", dataIndex: "count", key: "count" },
  ];

  const columnsBooks = [
    { title: "Tên sách", dataIndex: "title", key: "title" },
    { title: "Số lượt mượn", dataIndex: "borrowCount", key: "borrowCount" },
  ];

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "120px auto" }} />;
  }

  return (
    <div style={{ padding: 30, background: "#f5f7fa", minHeight: "100vh" }}>
      <Space direction="vertical" size={8} style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard Quản trị
        </Title>
        <Text type="secondary">Tổng quan hệ thống thư viện của bạn</Text>
      </Space>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Tổng số sách"
              value={stats.totalBooks}
              prefix={<BookOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Sách đang cho mượn"
              value={stats.booksBorrowed}
              prefix={<ReadOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Sách còn lại"
              value={stats.booksAvailable}
              prefix={<BarChartOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic
              title="Admin"
              value={stats.adminCount}
              prefix={<UserOutlined style={{ color: "#d4380d" }} />}
              valueStyle={{ color: "#d4380d" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic
              title="Staff"
              value={stats.staffCount}
              prefix={<UserOutlined style={{ color: "#08979c" }} />}
              valueStyle={{ color: "#08979c" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic
              title="User"
              value={stats.userCount}
              prefix={<UserOutlined style={{ color: "#b37feb" }} />}
              valueStyle={{ color: "#b37feb" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic title="Lượt mượn hôm nay" value={stats.borrowsToday} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic title="Lượt mượn tuần này" value={stats.borrowsThisWeek} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={cardStyle}>
            <Statistic title="Lượt mượn tháng này" value={stats.borrowsThisMonth} />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top danh mục sách" style={cardStyle}>
            <Table
              dataSource={stats.topCategories.map((item, idx) => ({
                ...item,
                key: idx,
              }))}
              columns={columnsCategories}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Top sách mượn nhiều nhất" style={cardStyle}>
            <Table
              dataSource={stats.topBooks.map((item, idx) => ({
                ...item,
                key: idx,
              }))}
              columns={columnsBooks}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;