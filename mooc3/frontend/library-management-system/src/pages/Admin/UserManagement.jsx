import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Space,
  DatePicker,
  message,
  Card,
  Empty,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import userService from "../../services/userService";

const { Option } = Select;
const defaultPageSize = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
  });
  const [keyword, setKeyword] = useState("");

  // Load list
  const loadUsers = async (current = 1, pageSize = defaultPageSize, searchKeyword = "") => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({
        page: current,
        pageSize,
        keyword: searchKeyword,
      });
      setUsers(res.items || []);
      setPagination({
        current: res.pageNumber || current,
        pageSize: res.pageSize || defaultPageSize,
        total: res.total || res.items?.length || 0,
      });
    } catch {
      message.error("Lấy danh sách user thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, defaultPageSize, "");
  }, []);

  // Search
  const onSearchUser = async (value) => {
    setKeyword(value);
    if (value.trim()) {
      try {
        const res = await userService.searchUsers(value);
        setUsers(Array.isArray(res) ? res : res.items || []);
        setPagination({
          current: 1,
          pageSize: defaultPageSize,
          total: res.total || res.length || res.items?.length || 0,
        });
      } catch {
        message.error("Tìm kiếm thất bại!");
      }
    } else {
      loadUsers(1, defaultPageSize, "");
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditUser(user);
    setModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  // Auto fill form when modal opens
  useEffect(() => {
    if (modalOpen) {
      if (editUser) {
        form.setFieldsValue({
          ...editUser,
          id: editUser.id, // quan trọng
          password: "", // không yêu cầu đổi mật khẩu
          dateofbirth: editUser.dateofbirth
            ? dayjs(editUser.dateofbirth)
            : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [modalOpen, editUser, form]);

  // Save / Update
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.dateofbirth) {
        values.dateofbirth = dayjs(values.dateofbirth).format("YYYY-MM-DD");
      }
      if (editUser) {
        const payload = {
          id: editUser.id,
          fullname: values.fullname,
          email: values.email,
          password: values.password || null,
          phone: values.phone,
          avatarurl: values.avatarurl,
          dateofbirth: values.dateofbirth || null,
          role: values.role ? values.role.toLowerCase() : null,
          isactive: values.isactive
        };
        await userService.updateUser(editUser.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await userService.createUser(values);
        message.success("Tạo user mới thành công!");
      }
      setModalOpen(false);
      setEditUser(null);
      form.resetFields();
      loadUsers(1, defaultPageSize, keyword);
    } catch {
      message.error("Thao tác thất bại!");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await userService.patchUser(user.id, { isactive: !user.isactive });
      message.success(user.isactive ? "Đã khoá tài khoản!" : "Đã mở khoá tài khoản!");
      loadUsers(1, defaultPageSize, keyword);
    } catch {
      message.error("Không thể thay đổi trạng thái tài khoản!");
    }
  };

  const handleTableChange = (pag) => {
    loadUsers(pag.current, defaultPageSize, keyword);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Full Name", dataIndex: "fullname", key: "fullname" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Avatar URL",
      dataIndex: "avatarurl",
      key: "avatarurl",
      render: (val) =>
        val ? (
          <img src={val} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        ) : (
          ""
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateofbirth",
      key: "dateofbirth",
      render: (val) =>
        val && dayjs(val).isValid() ? dayjs(val).format("YYYY-MM-DD") : "",
    },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Trạng thái",
      dataIndex: "isactive",
      key: "isactive",
      render: (val) => (
        <span style={{ color: val ? "#52c41a" : "#f5222d" }}>
          {val ? "Hoạt động" : "Bị khóa"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdat",
      key: "createdat",
      render: (val) =>
        val && dayjs(val).isValid() ? dayjs(val).format("YYYY-MM-DD HH:mm") : "",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedat",
      key: "updatedat",
      render: (val) =>
        val && dayjs(val).isValid() ? dayjs(val).format("YYYY-MM-DD HH:mm") : "",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, user) => (
        <Space>
          <Button icon={<EditOutlined />} type="link" onClick={() => openEditModal(user)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn chắc chắn xóa user này?"
            onConfirm={() => handleDelete(user.id)}
            okText="Xóa"
            cancelText="Huỷ"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            type={user.isactive ? "default" : "primary"}
            danger={user.isactive}
            onClick={() => handleToggleActive(user)}
          >
            {user.isactive ? "Khoá" : "Mở khoá"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý Người Dùng" bordered={false}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Button type="primary" onClick={openCreateModal}>
          Thêm User mới
        </Button>

        <Input.Search
          allowClear
          placeholder="Tìm kiếm tên user..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={onSearchUser}
          style={{ width: 240 }}
          enterButton="Tìm"
        />
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, showSizeChanger: false }}
        onChange={handleTableChange}
        locale={{ emptyText: <Empty description="Không có người dùng nào" /> }}
      />

      <Modal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
        onOk={handleOk}
        title={editUser ? "Chỉnh sửa User" : "Thêm User mới"}
        okText={editUser ? "Cập nhật" : "Tạo mới"}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input disabled={!!editUser} />
          </Form.Item>

          {!editUser && (
            <Form.Item label="Password" name="password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item label="Email" name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Full Name" name="fullname" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Avatar URL" name="avatarurl">
            <Input />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="dateofbirth">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="Staff">Staff</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="isactive" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Bị khóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;
