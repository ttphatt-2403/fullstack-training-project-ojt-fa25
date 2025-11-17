import { Table, Button, Modal, Form, Input, Select, message, InputNumber, Tooltip, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { bookService } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";

function AdminBookPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchBooks(1, pagination.pageSize, '');
    categoryService.getCategories().then((data) => {
      // accept either an array or wrapped { data: [...] } / { items: [...] }
      const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
      // normalize simple shape { id, name } or PascalCase { Id, Name }
      const normalized = arr.map(c => ({ id: c?.id ?? c?.Id, name: c?.name ?? c?.Name }));
      setCategories(normalized);
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.error('getCategories error:', err?.response || err);
      setCategories([]);
    });
  }, []);

  // pagination state
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();

  // When modal opens for edit, populate the form; when adding, reset defaults
  useEffect(() => {
    if (!modalOpen) return;
    if (editBook) {
      form.setFieldsValue({
        ...editBook,
        publishedDate: editBook.publishedDate ? dayjs(editBook.publishedDate) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ totalCopies: 1, availableCopies: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editBook]);

  const [search, setSearch] = useState('');

  const fetchBooks = async (page = 1, pageSize = 10, query = '') => {
    setLoading(true);
    try {
      let data;
      if (query && query.trim() !== '') {
        data = await bookService.searchBooks({ query, page, pageSize });
      } else {
        data = await bookService.getBooks({ page, pageSize });
      }
      // data: { items, total, pageNumber, pageSize, totalPages }
      setBooks(data.items || []);
      setPagination({ current: data.pageNumber || page, pageSize: data.pageSize || pageSize, total: data.total || 0 });
    } catch (err) {
      // Show backend error message if available
      // eslint-disable-next-line no-console
      console.error('fetchBooks error:', err?.response || err);
      const text = err?.response?.data?.message || err?.response?.data || err.message || 'Lỗi khi lấy danh sách sách';
      message.error(text);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Chuyển ngày nếu cần
      // Nếu dùng DatePicker thì thêm dòng này:
      // values.publishedDate = values.publishedDate?.format?.('YYYY-MM-DD') || values.publishedDate;
      if (editBook) {
        // Prepare payload to match backend expectations:
        // - include id in body
        // - send publishedDate as ISO (backend maps DateOnly from DateTime)
        // - ensure numeric fields are numbers
        const payload = { ...values, id: editBook.id };
        if (payload.publishedDate) {
          // Accept Dayjs, Date or string like 'YYYY-MM-DD'
          try {
            const d = payload.publishedDate?.toDate ? payload.publishedDate.toDate() : new Date(payload.publishedDate);
            // Send ISO string (backend will parse to DateTime -> DateOnly)
            payload.publishedDate = d.toISOString();
          } catch (e) {
            // fallback: leave as-is
          }
        }
        // numeric cleanup
        if (payload.totalCopies !== undefined) payload.totalCopies = Number(payload.totalCopies);
        if (payload.availableCopies !== undefined) payload.availableCopies = Number(payload.availableCopies);
        if (payload.categoryId !== undefined) payload.categoryId = Number(payload.categoryId);

        await bookService.updateBook(editBook.id, payload);
        message.success("Đã cập nhật sách");
      } else {
        const payload = { ...values };
        if (payload.publishedDate) {
          try {
            const d = payload.publishedDate?.toDate ? payload.publishedDate.toDate() : new Date(payload.publishedDate);
            payload.publishedDate = d.toISOString();
          } catch (e) {}
        }
        if (payload.totalCopies !== undefined) payload.totalCopies = Number(payload.totalCopies);
        if (payload.availableCopies !== undefined) payload.availableCopies = Number(payload.availableCopies);
        if (payload.categoryId !== undefined) payload.categoryId = Number(payload.categoryId);

        await bookService.createBook(payload);
        message.success("Đã thêm mới sách");
      }
      setModalOpen(false);
      setEditBook(null);
      fetchBooks();
    } catch (error) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id) => {
    // Log immediately when delete handler is invoked
    // eslint-disable-next-line no-console
    console.log('handleDelete invoked for id=', id);

    // Use a stateful Modal instead of Modal.confirm (static) because Modal.confirm
    // may not render correctly with dynamic theme/context in some antd setups.
    setConfirmId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    const id = confirmId;
    // eslint-disable-next-line no-console
    console.log('Confirm modal OK - deleting id=', id);
    setConfirmVisible(false);
    setConfirmId(null);
    try {
      await bookService.deleteBook(id);
      message.success("Đã xóa sách");
      fetchBooks();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('handleConfirmDelete error:', err?.response || err);
      const text = err?.response?.data?.message || err?.response?.data || err.message || 'Xóa thất bại';
      message.error(text);
    }
  };

  return (
    <>
      {/* Inline styles to mimic the compact rounded search from the design */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'inline-block' }} className="custom-search-wrapper">
          <Input.Search
            className="custom-search"
            placeholder="Tìm kiếm tên user..."
            allowClear
            enterButton="Tìm"
            size="small"
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(val) => {
              // when user presses enter or clicks search, fetch page 1 with query
              fetchBooks(1, pagination.pageSize, val);
              // update pagination state to reset to first page
              setPagination(p => ({ ...p, current: 1 }));
            }}
          />
        </div>

        <Button
          type="primary"
          onClick={() => { setEditBook(null); setModalOpen(true); }}
        >
          Thêm sách mới
        </Button>

        {/* small CSS injection to style the search input/button to match the provided image */}
        <style>{`
          .custom-search .ant-input {
            border-radius: 20px 0 0 20px !important;
            height: 32px;
            padding: 4px 10px;
          }
          .custom-search .ant-input-affix-wrapper {
            border-radius: 20px 0 0 20px !important;
            height: 32px;
          }
          .custom-search .ant-input-search-button {
            border-radius: 0 20px 20px 0 !important;
            height: 32px;
            padding: 0 14px;
          }
          .custom-search .ant-btn-primary {
            background: #1677ff;
            border-color: #1677ff;
          }
        `}</style>
      </div>
      <Table
        dataSource={books}
        loading={loading}
        rowKey="id"
        columns={[
          { title: 'Tên sách', dataIndex: 'title' },
          { title: 'Tác giả', dataIndex: 'author' },
          { title: 'Ngày xuất bản', dataIndex: 'publishedDate', render: (v) => v ? dayjs(v).format('YYYY-MM-DD') : '' },
          { title: 'Sẵn có', dataIndex: 'availableCopies' },
          { title: 'Tổng', dataIndex: 'totalCopies' },
          { title: 'Thể loại', dataIndex: ['category', 'name'] },
          {
            title: 'Hành động',
            render: (_, book) => {
              const isBorrowed = (book?.availableCopies != null && book?.totalCopies != null) && (book.availableCopies < book.totalCopies);
              return (
                <>
                  <Button onClick={() => { setEditBook(book); setModalOpen(true); }} style={{ marginRight: 8 }}>
                    Sửa
                  </Button>
                  <Tooltip title={isBorrowed ? 'Không thể xóa: sách đang có người mượn' : ''}>
                    <Button danger onClick={() => handleDelete(book.id)} disabled={isBorrowed}>Xóa</Button>
                  </Tooltip>
                </>
              )
            }
          }
        ]}
        pagination={pagination}
        onChange={(pag) => {
          setPagination(pag);
          fetchBooks(pag.current, pag.pageSize, search);
        }}
      />
      {/* Confirm delete modal (stateful) */}
      <Modal
        open={confirmVisible}
        title="Bạn chắc chắn muốn xóa?"
        onOk={handleConfirmDelete}
        onCancel={() => { setConfirmVisible(false); setConfirmId(null); }}
        okText="Xóa"
        cancelText="Huỷ"
      >
        <p>Bạn sẽ không thể khôi phục khi xóa sách này.</p>
      </Modal>
      <Modal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditBook(null); form.resetFields(); }}
        footer={null}
        title={editBook ? "Sửa sách" : "Thêm mới sách"}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ totalCopies: 1, availableCopies: 1 }}
        >
          <Form.Item name="title" label="Tên sách" rules={[{ required: true, message: 'Nhập tên sách' }]}>
            <Input placeholder="Tên sách" />
          </Form.Item>

          <Form.Item name="author" label="Tác giả" rules={[{ required: true, message: 'Nhập tên tác giả' }]}>
            <Input placeholder="Tác giả" />
          </Form.Item>

          <Form.Item name="isbn" label="Mã ISBN" rules={[{ required: true, message: 'Nhập mã ISBN' }, { pattern: /^[0-9A-Za-z\-]{5,20}$/, message: 'ISBN không hợp lệ' }]}>
            <Input placeholder="ISBN" />
          </Form.Item>

          <Form.Item name="publisher" label="Nhà xuất bản">
            <Input placeholder="Nhà xuất bản" />
          </Form.Item>

          <Form.Item name="publishedDate" label="Ngày xuất bản" rules={[{ required: true, message: 'Chọn ngày xuất bản' }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
          </Form.Item>

          <Form.Item
            name="totalCopies"
            label="Số lượng"
            rules={[{ required: true, type: "number", min: 1, message: 'Số lượng phải >= 1' }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="availableCopies"
            label="Sẵn có"
            rules={[{ required: true, type: "number", min: 0, message: 'Sẵn có phải >= 0' }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL ảnh">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="categoryId" label="Thể loại" rules={[{ required: true, message: 'Chọn thể loại' }]}>
            <Select placeholder="Chọn thể loại" options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>
            Lưu
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default AdminBookPage;
