import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, DatePicker } from "antd";
import { userService } from "../../services/userService";
import dayjs from "dayjs";
const { Option } = Select;

const defaultPageSize = 10;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form] = Form.useForm();

  // Pagination state & tìm kiếm (luôn pageSize=10)
  const [pagination, setPagination] = useState({ current: 1, pageSize: defaultPageSize, total: 0 });
  const [keyword, setKeyword] = useState("");

  // Load Users - luôn truyền và set pageSize là 10
  const loadUsers = async (
    current = pagination.current,
    pageSize = defaultPageSize,
    searchKeyword = keyword
  ) => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({ page: current, pageSize, keyword: searchKeyword });
      setUsers(res.items || []);
      setPagination({
        current: res.pageNumber || current,
        pageSize: defaultPageSize,
        total: res.total,
      });
    } catch (err) {
      message.error("Lấy danh sách user thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, defaultPageSize, keyword);
    // eslint-disable-next-line
  }, []);

  // Chuyển trang Table
  const handleTableChange = (pag) => {
    setPagination({ ...pagination, current: pag.current, pageSize: defaultPageSize });
    loadUsers(pag.current, defaultPageSize, keyword);
  };

  // Search tên user /Users/search
  const onSearchUser = async (value) => {
    setLoading(true);
    try {
      if (!value) {
        setKeyword("");
        setPagination({ ...pagination, current: 1, pageSize: defaultPageSize });
        await loadUsers(1, defaultPageSize, "");
        return;
      }
      setKeyword(value);
      const res = await userService.searchUsers(value);
      setUsers(Array.isArray(res) ? res : (res.items || []));
      setPagination({
        ...pagination,
        current: 1,
        pageSize: defaultPageSize,
        total: Array.isArray(res) ? res.length : (res.total || (res.items ? res.items.length : 0)),
      });
    } catch (err) {
      message.error("Tìm kiếm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Tạo/sửa user
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.dateofbirth) {
        values.dateofbirth = dayjs(values.dateofbirth).format("YYYY-MM-DD");
      }
      if (editUser) {
        values.id = editUser.id;
        await userService.updateUser(editUser.id, values);
        message.success("Cập nhật thành công!");
      } else {
        await userService.createUser(values);
        message.success("Tạo user mới thành công!");
      }
      setModalOpen(false);
      form.resetFields();
      setEditUser(null);
      loadUsers(1, defaultPageSize, keyword);
    } catch (err) {
      message.error("Thao tác thất bại!");
    }
  };

  // Xóa user
  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success("Xóa thành công!");
      loadUsers(1, defaultPageSize, keyword);
    } catch (err) {
      message.error("Xóa thất bại!");
    }
  };

  // Khoá/mở khoá tài khoản user
  const handleToggleActive = async (user) => {
    try {
      await userService.patchUser(user.id, { isactive: !user.isactive });
      message.success(user.isactive ? "Đã khoá tài khoản!" : "Đã mở khoá tài khoản!");
      loadUsers(1, defaultPageSize, keyword);
    } catch (err) {
      message.error("Không thể thay đổi trạng thái tài khoản!");
    }
  };

  // Mở modal chỉnh sửa: chuyển date về kiểu dayjs cho DatePicker
  const openEditModal = (user) => {
    setEditUser(user);
    form.setFieldsValue({
      ...user,
      dateofbirth: user.dateofbirth ? dayjs(user.dateofbirth) : null
    });
    setModalOpen(true);
  };

  // Mở modal tạo mới
  const openCreateModal = () => {
    setEditUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Username", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "Full Name", dataIndex: "fullname" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Trạng thái", dataIndex: "isactive", render: val => val ? "Hoạt động" : "Bị khóa" },
    {
      title: "Hành động",
      render: (_, user) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(user)}>Sửa</Button>
          <Popconfirm
            title="Bạn chắc chắn xóa user này?"
            onConfirm={() => handleDelete(user.id)}
            okText="Xóa"
            cancelText="Huỷ"
          >
            <Button type="link" danger>Xóa</Button>
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
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          Thêm User mới
        </Button>
        <Input.Search
          allowClear
          placeholder="Tìm kiếm tên user..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
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
        pagination={{
          ...pagination,
          showSizeChanger: false, // KHÔNG cho đổi pageSize
        }}
        onChange={handleTableChange}
      />

      {/* Modal CRUD */}
      <Modal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditUser(null); }}
        onOk={handleOk}
        title={editUser ? "Chỉnh sửa User" : "Thêm User mới"}
        okText={editUser ? "Cập nhật" : "Tạo mới"}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Username" name="username" rules={[{ required: true }]} >
            <Input disabled={!!editUser} />
          </Form.Item>
          {!editUser && (
            <Form.Item label="Password" name="password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item label="Email" name="email" rules={[
            { required: true }, { type: "email" }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item label="Full Name" name="fullname" rules={[{ required: true }]} >
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
    </div>
  );
}

export default UserManagement;
