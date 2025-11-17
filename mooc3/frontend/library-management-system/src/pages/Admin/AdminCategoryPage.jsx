import { bookService } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';

function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form] = Form.useForm();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchCategories(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories({ page, pageSize });

      // support multiple response shapes: array, { data: [...] }, { items: [...] }
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      // Normalize simple category shape to { id, name, description }
      const normalized = arr.map(c => ({
        id: c?.id ?? c?.Id,
        name: c?.name ?? c?.Name,
        description: c?.description ?? c?.Description,
      }));

      // derive pagination info from response body when available
      const total = data?.totalRecords ?? data?.total ?? data?.totalCount ?? normalized.length;
      const pageNumber = data?.pageNumber ?? data?.page ?? page;
      const pageSizeResp = data?.pageSize ?? pageSize;

      // Debug log: show normalized categories and paging
      // eslint-disable-next-line no-console
      console.log('fetchCategories -> normalized', normalized, { total, pageNumber, pageSizeResp });

      setCategories(normalized);
      setPagination({ current: pageNumber, pageSize: pageSizeResp, total });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('fetchCategories error', err?.response || err);
      message.error('Lỗi khi lấy danh sách thể loại');
      setCategories([]);
      setPagination({ current: 1, pageSize: pageSize, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
  try {
    if (editCategory) {
      const payload = {
        id: editCategory.id, // thêm id vào payload
        name: values.name,
        description: values.description,
      };
      await categoryService.updateCategory(editCategory.id, payload);
      message.success("Đã cập nhật thể loại");
    } else {
      await categoryService.createCategory(values);
      message.success("Đã thêm mới thể loại");
    }

    setModalOpen(false);
    setEditCategory(null);
    form.resetFields();
    fetchCategories();
  } catch (err) {
    console.error('handleSubmit error', err?.response || err);
    message.error(err?.response?.data?.message || 'Thao tác thất bại');
  }
};


  const handleDelete = async (id) => {
    // Open our stateful confirm modal instead of using Modal.confirm (static)
    // so it can consume theme/context correctly in antd v5 + React 19.
    // eslint-disable-next-line no-console
    console.log('handleDelete -> ask confirm for id', id);
    setConfirmId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    const id = confirmId;
    setConfirmVisible(false);
    setConfirmId(null);
    try {
      // eslint-disable-next-line no-console
      console.log('handleConfirmDelete -> deleting id', id);
      await categoryService.deleteCategory(id);
      message.success("Đã xóa thể loại");
      fetchCategories();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('deleteCategory error', err?.response || err);
      message.error(err?.response?.data?.message || 'Xóa thất bại');
    }
  };

  // when editCategory changes, populate the form fields
  useEffect(() => {
    if (modalOpen && editCategory) {
      form.setFieldsValue({
        name: editCategory.name,
        description: editCategory.description,
      });
    }
    if (!modalOpen) {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editCategory]);

  return (
    // KHÔNG bọc RoleLayout ở đây
    <>
      <Button type="primary" onClick={() => setModalOpen(true)}>Thêm thể loại</Button>
      <Table
        dataSource={categories}
        loading={loading}
        rowKey="id"
        columns={[
          { title: 'Tên thể loại', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'description' },
          {
            title: 'Hành động',
            render: (_, cat) => (
              <>
                <Button onClick={() => { setEditCategory(cat); setModalOpen(true); }}>Sửa</Button>
                <Button danger onClick={() => handleDelete(cat.id)}>Xóa</Button>
              </>
            )
          }
        ]}
        pagination={pagination}
        onChange={(pag) => {
          // pag is an object { current, pageSize }
          setPagination(pag);
          fetchCategories(pag.current, pag.pageSize);
        }}
      />
      <Modal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditCategory(null); form.resetFields(); }}
        footer={null}
        title={editCategory ? "Sửa thể loại" : "Thêm mới thể loại"}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item name="name" label="Tên thể loại" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">Lưu</Button>
        </Form>
      </Modal>
      {/* Confirm delete modal (stateful) */}
      <Modal
        open={confirmVisible}
        title="Bạn chắc chắn muốn xóa?"
        onOk={handleConfirmDelete}
        onCancel={() => { setConfirmVisible(false); setConfirmId(null); }}
        okText="Xóa"
        cancelText="Huỷ"
      >
        <p>Bạn sẽ không thể khôi phục khi xóa thể loại này.</p>
      </Modal>
    </>
  );
}
export default AdminCategoryPage;
