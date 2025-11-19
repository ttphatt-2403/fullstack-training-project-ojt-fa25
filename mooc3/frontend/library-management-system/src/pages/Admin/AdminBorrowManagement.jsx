import { Card, Statistic, Row, Col, Tabs, Table, Button, Modal, Form, Select, DatePicker, Input, InputNumber, message, Tag, Space, Descriptions, Popconfirm, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { borrowService } from "../../services/borrowService";
import { userService } from "../../services/userService";
import { bookService } from "../../services/bookService";
import { feeService } from "../../services/feeService";
import dayjs from 'dayjs';
import { PlusOutlined, ReloadOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

function AdminBorrowManagement() {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalPending: 0,
    totalActive: 0,
    totalOverdue: 0,
    totalReturned: 0,
    todayReturns: 0,
    todayBorrows: 0
  });

  // Active borrows
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [activePagination, setActivePagination] = useState({ current: 1, pageSize: 20, total: 0 }); // Tăng pageSize

  // Overdue borrows
  const [overdueBorrows, setOverdueBorrows] = useState([]);
  const [overduePagination, setOverduePagination] = useState({ current: 1, pageSize: 20, total: 0 }); // Tăng pageSize

  // Returned borrows
  const [returnedBorrows, setReturnedBorrows] = useState([]);
  const [returnedPagination, setReturnedPagination] = useState({ current: 1, pageSize: 20, total: 0 }); // Tăng pageSize

  // Pending requests (chờ duyệt)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingPagination, setPendingPagination] = useState({ current: 1, pageSize: 20, total: 0 }); // Tăng pageSize

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [createForm] = Form.useForm();

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [returnForm] = Form.useForm();

  // Detail drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [borrowDetail, setBorrowDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create fee modal
  const [createFeeModalOpen, setCreateFeeModalOpen] = useState(false);
  const [createFeeForm] = Form.useForm();
  
  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingBorrow, setRejectingBorrow] = useState(null);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests(1, 20);
    } else if (activeTab === 'active') {
      fetchActiveBorrows(1, 20);
    } else if (activeTab === 'overdue') {
      fetchOverdueBorrows(1, 20);
    } else if (activeTab === 'returned') {
      fetchReturnedBorrows(1, 20);
    }
    loadStats();
  }, [activeTab]);

  // Load users and books on component mount
  useEffect(() => {
    loadUsersAndBooks();
  }, []);

  // Load statistics  
  const loadStats = async () => {
    try {
      const [pendingData, activeData, returnedData] = await Promise.all([
        borrowService.getBorrows({ pageNumber: 1, pageSize: 1, status: 'request' }),
        borrowService.getBorrows({ pageNumber: 1, pageSize: 1, status: 'borrowed' }),
        borrowService.getBorrows({ pageNumber: 1, pageSize: 1, status: 'returned' })
      ]);
      
      // Để tính overdue, cần lấy tất cả borrowed và lọc
      const allBorrowedData = await borrowService.getBorrows({ 
        pageNumber: 1, 
        pageSize: 1000, // Lấy nhiều để đếm overdue
        status: 'borrowed' 
      });
      
      const today = new Date();
      const overdueCount = (allBorrowedData.data || []).filter(record => {
        if (record.dueDate) {
          const dueDate = new Date(record.dueDate);
          return dueDate < today;
        }
        return false;
      }).length;
      
      setStats({
        totalPending: pendingData.totalRecords || 0,
        totalActive: activeData.totalRecords || 0,
        totalOverdue: overdueCount,
        totalReturned: returnedData.totalRecords || 0,
        todayReturns: 0, // TODO: Cần logic riêng
        todayBorrows: 0  // TODO: Cần logic riêng
      });
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Fetch pending requests (status = 'request')
  const fetchPendingRequests = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const data = await borrowService.getBorrows({ 
        pageNumber: page, 
        pageSize,
        status: 'request' // Sử dụng đúng status từ database
      });
      console.log('Pending requests data:', data);
      setPendingRequests(data.data || []);
      setPendingPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || pageSize,
        total: data.totalRecords || 0
      });
    } catch (error) {
      console.error('Fetch pending requests error:', error);
      message.error('Không thể tải danh sách yêu cầu chờ duyệt!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active borrows (status = 'borrowed')
  const fetchActiveBorrows = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const data = await borrowService.getBorrows({ 
        pageNumber: page, 
        pageSize,
        status: 'borrowed' // Sử dụng đúng status từ database
      });
      console.log('Active borrows data:', data); // Debug log
      setActiveBorrows(data.data || []);
      setActivePagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || pageSize,
        total: data.totalRecords || 0
      });
    } catch (error) {
      console.error('Fetch active borrows error:', error);
      message.error(`Không thể tải danh sách phiếu mượn: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch overdue borrows (status = 'borrowed' và dueDate < hiện tại)
  const fetchOverdueBorrows = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      // Lấy tất cả borrowed records
      const data = await borrowService.getBorrows({ 
        pageNumber: page, 
        pageSize: 50, // Lấy nhiều hơn để lọc
        status: 'borrowed'
      });
      
      // Lọc những record quá hạn và tính daysOverdue
      const today = new Date();
      const overdueRecords = (data.data || []).filter(record => {
        if (record.dueDate) {
          const dueDate = new Date(record.dueDate);
          if (dueDate < today) {
            // Tính số ngày quá hạn
            const diffTime = today.getTime() - dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            record.daysOverdue = diffDays;
            return true;
          }
        }
        return false;
      });
      
      // Pagination cho overdue records
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedRecords = overdueRecords.slice(startIndex, endIndex);
      
      console.log(`🔍 Overdue records found: ${overdueRecords.length}, showing: ${paginatedRecords.length}`);
      console.log('📊 Sample overdue record:', paginatedRecords[0]); // Debug log
      
      setOverdueBorrows(paginatedRecords);
      setOverduePagination({
        current: page,
        pageSize: pageSize,
        total: overdueRecords.length
      });
    } catch (error) {
      console.error('Fetch overdue borrows error:', error);
      message.error('Không thể tải danh sách sách quá hạn!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch returned borrows (status = 'returned')
  const fetchReturnedBorrows = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const data = await borrowService.getBorrows({ 
        pageNumber: page, 
        pageSize,
        status: 'returned' // Sử dụng đúng status từ database
      });
      console.log('Returned borrows data:', data);
      setReturnedBorrows(data.data || []);
      setReturnedPagination({
        current: data.pageNumber || page,
        pageSize: data.pageSize || pageSize,
        total: data.totalRecords || 0
      });
    } catch (error) {
      console.error('Fetch returned borrows error:', error);
      message.error('Không thể tải danh sách phiếu mượn đã trả!');
    } finally {
      setLoading(false);
    }
  };

  // Load users and books for create modal
  const loadUsersAndBooks = async () => {
    try {
      const [usersResponse, booksResponse] = await Promise.all([
        userService.getAllUsers({ pageSize: 1000 }), // Sử dụng getAllUsers như StaffCheckin
        bookService.getBooks({ pageSize: 1000 })
      ]);
      
      console.log('Users response:', usersResponse);
      console.log('Books response:', booksResponse);
      
      setUsers(usersResponse.items || []);
      // Chỉ lấy sách còn available
      const availableBooks = (booksResponse.items || []).filter(book => (book.availableCopies || 0) > 0);
      setBooks(availableBooks);
      
      console.log('Loaded users count:', usersResponse.items?.length || 0);
      console.log('Loaded available books count:', availableBooks.length);
    } catch (error) {
      console.error('Load users and books error:', error);
      message.error('Không thể tải danh sách người dùng và sách!');
    }
  };

  // Handle approve borrow request
  const handleApproveBorrow = async (borrowId) => {
    try {
      await borrowService.approveBorrowRequest(borrowId);
      message.success('Đã duyệt yêu cầu mượn sách thành công!');
      
      // Refresh data
      await loadStats();
      if (activeTab === 'pending') {
        fetchPendingRequests(pendingPagination.current, pendingPagination.pageSize);
      }
    } catch (error) {
      console.error('Approve borrow error:', error);
      message.error(error.response?.data?.message || 'Không thể duyệt yêu cầu mượn sách!');
    }
  };

  // Handle reject borrow request
  const handleRejectBorrow = async (values) => {
    try {
      const borrowId = rejectingBorrow.Id || rejectingBorrow.id;
      console.log('🔄 Rejecting borrow:', borrowId, values);
      const response = await borrowService.rejectBorrowRequest(borrowId, { Notes: values.notes });
      
      // Enhanced success message with fees info
      let successMessage = 'Đã từ chối yêu cầu mượn sách!';
      if (response?.feesInfo?.deletedCount > 0) {
        successMessage += ` Đã xóa ${response.feesInfo.deletedCount} phí mượn sách (${response.feesInfo.deletedAmount?.toLocaleString('vi-VN')} VND).`;
      }
      
      message.success(successMessage);
      
      // Reset modal
      setRejectModalOpen(false);
      setRejectingBorrow(null);
      rejectForm.resetFields();
      
      // Refresh data
      await loadStats();
      if (activeTab === 'pending') {
        fetchPendingRequests(pendingPagination.current, pendingPagination.pageSize);
      }
    } catch (error) {
      console.error('Reject borrow error:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu mượn sách!');
    }
  };

  // Mở modal từ chối
  const openRejectModal = (record) => {
    console.log('🔍 Opening reject modal with record:', record);
    setRejectingBorrow(record);
    setRejectModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setCreateModalOpen(true);
    // Reset form và set giá trị mặc định
    createForm.resetFields();
    createForm.setFieldsValue({
      dueDate: dayjs().add(14, 'day')
    });
    
    // Dữ liệu đã được load từ đầu, không cần gọi lại
    // Chỉ gọi lại nếu chưa có dữ liệu
    if (users.length === 0 || books.length === 0) {
      loadUsersAndBooks();
    }
  };

  // Handle create borrow
  const handleCreateBorrow = async (values) => {
    try {
      const borrowData = {
        userId: values.userId,
        bookId: values.bookId,
        dueDate: values.dueDate?.toISOString(),
        notes: values.notes
      };
      
      await borrowService.staffCreateBorrow(borrowData);
      message.success('Tạo phiếu mượn thành công!');
      setCreateModalOpen(false);
      createForm.resetFields();
      
      // Refresh data
      loadStats();
      if (activeTab === 'active') {
        fetchActiveBorrows(activePagination.current, activePagination.pageSize);
      }
    } catch (error) {
      console.error('Create borrow error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu mượn!';
      message.error(errorMsg);
    }
  };

  // Open return modal
  const openReturnModal = (borrow) => {
    setSelectedBorrow(borrow);
    setReturnModalOpen(true);
  };

  // Handle return book
  const handleReturnBook = async (values) => {
    try {
      await borrowService.returnBook(selectedBorrow.id, values.notes);
      message.success('Trả sách thành công!');
      setReturnModalOpen(false);
      setSelectedBorrow(null);
      returnForm.resetFields();
      
      // Refresh data
      loadStats();
      if (activeTab === 'active') {
        fetchActiveBorrows(activePagination.current, activePagination.pageSize);
      } else if (activeTab === 'overdue') {
        fetchOverdueBorrows(overduePagination.current, overduePagination.pageSize);
      } else if (activeTab === 'returned') {
        fetchReturnedBorrows(returnedPagination.current, returnedPagination.pageSize);
      }
    } catch (error) {
      console.error('Return book error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi trả sách!';
      message.error(errorMsg);
    }
  };

  // Handle delete borrow
  const handleDeleteBorrow = async (borrowId) => {
    try {
      await borrowService.deleteBorrow(borrowId);
      message.success('Xóa phiếu mượn thành công!');
      
      // Refresh data
      loadStats();
      if (activeTab === 'active') {
        fetchActiveBorrows(activePagination.current, activePagination.pageSize);
      } else if (activeTab === 'overdue') {
        fetchOverdueBorrows(overduePagination.current, overduePagination.pageSize);
      } else if (activeTab === 'returned') {
        fetchReturnedBorrows(returnedPagination.current, returnedPagination.pageSize);
      }
    } catch (error) {
      console.error('Create borrow error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu mượn!';
      message.error(errorMsg);
    }
  };

  // Open detail drawer
  const openDetailDrawer = async (borrow) => {
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    try {
      const data = await borrowService.getBorrowDetails(borrow.id);
      
      // Preserve daysOverdue nếu đã tính từ bảng overdue
      if (borrow.daysOverdue && !data.daysOverdue) {
        data.daysOverdue = borrow.daysOverdue;
      }
      // Hoặc tính lại nếu chưa có
      else if (!data.daysOverdue && data.dueDate && data.status === 'borrowed') {
        const today = new Date();
        const dueDate = new Date(data.dueDate);
        if (dueDate < today) {
          const diffTime = today.getTime() - dueDate.getTime();
          data.daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      
      console.log('📝 Borrow detail loaded:', data); // Debug log
      setBorrowDetail(data);
    } catch (error) {
      console.error('Get borrow details error:', error);
      message.error('Không thể tải chi tiết phiếu mượn!');
    } finally {
      setDetailLoading(false);
    }
  };

  // Open create fee modal
  const openCreateFeeModal = () => {
    if (!borrowDetail) return;
    
    // Auto calculate late fee if overdue
    let suggestedAmount = 0;
    let suggestedType = 'late_fee';
    
    if (borrowDetail.status === 'borrowed' && borrowDetail.daysOverdue > 0) {
      const validDays = borrowDetail.daysOverdue && !isNaN(borrowDetail.daysOverdue) ? borrowDetail.daysOverdue : 0;
      suggestedAmount = validDays * 5000; // 5000 VND per day
      suggestedType = 'late_fee';
    }
    
    setCreateFeeModalOpen(true);
    createFeeForm.setFieldsValue({
      borrowId: borrowDetail.id,
      userId: borrowDetail.userId,
      type: suggestedType,
      amount: suggestedAmount || null
    });
  };

  // Handle create fee
  const handleCreateFee = async (values) => {
    try {
      const feeData = {
        borrowId: borrowDetail.id,
        userId: borrowDetail.userId,
        amount: values.amount, // InputNumber already returns number
        type: values.type,
        paymentMethod: values.paymentMethod,
        notes: values.notes
      };

      await feeService.createFee(feeData);
      message.success('Tạo phí thành công!');
      setCreateFeeModalOpen(false);
      createFeeForm.resetFields();
      
      // Refresh borrow detail to show new fee
      const updatedData = await borrowService.getBorrowDetails(borrowDetail.id);
      setBorrowDetail(updatedData);
    } catch (error) {
      console.error('Create fee error:', error);
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo phí!';
      message.error(errorMsg);
    }
  };

  // Get status tag
  const getStatusTag = (borrow) => {
    if (borrow.status === 'borrowed') {
      // Kiểm tra quá hạn
      const isOverdue = dayjs().isAfter(dayjs(borrow.dueDate));
      if (isOverdue) {
        const daysOverdue = dayjs().diff(dayjs(borrow.dueDate), 'day');
        return <Tag color="red">Quá hạn {daysOverdue} ngày</Tag>;
      }
      
      // Kiểm tra sắp hết hạn (3 ngày)
      const daysLeft = dayjs(borrow.dueDate).diff(dayjs(), 'day');
      if (daysLeft <= 3 && daysLeft >= 0) {
        return <Tag color="orange">Sắp hết hạn ({daysLeft} ngày)</Tag>;
      }
      
      return <Tag color="blue">Đang mượn</Tag>;
    }
    return <Tag color="green">Đã trả</Tag>;
  };

  // Pending requests columns  
  const pendingRequestColumns = [
    {
      title: 'Người yêu cầu',
      dataIndex: 'userName',
      width: '15%',
      render: (text) => text || 'Unknown User'
    },
    {
      title: 'Sách', 
      dataIndex: 'bookTitle',
      width: '20%',
      render: (text) => text || 'Unknown Book'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdat',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
      width: '20%'
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      width: '15%'
    },
    {
      title: 'Ngày trả dự kiến',
      dataIndex: 'dueDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      width: '15%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: () => <Tag color="orange">Chờ duyệt</Tag>,
      width: '15%'
    },
    {
      title: 'Thao tác',
      fixed: 'right',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleApproveBorrow(record.id)}
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            onClick={() => openRejectModal(record)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  // Active borrows columns
  const activeBorrowColumns = [
    {
      title: 'Người mượn',
      dataIndex: 'userName',
      width: '15%',
      render: (text) => text || 'Unknown User'
    },
    {
      title: 'Sách',
      dataIndex: 'bookTitle', 
      width: '20%',
      render: (text) => text || 'Unknown Book'
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      width: '15%'
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      width: '15%'
    },
    {
      title: 'Trạng thái',
      render: (_, borrow) => getStatusTag(borrow),
      width: '15%'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      render: (notes) => notes || 'N/A',
      width: '20%'
    },
    {
      title: 'Hành động',
      render: (_, borrow) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(borrow)}
          >
            Chi tiết
          </Button>
          {borrow.status === 'borrowed' && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => openReturnModal(borrow)}
            >
              Trả sách
            </Button>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phiếu mượn này?"
            onConfirm={() => handleDeleteBorrow(borrow.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: '16%'
    }
  ];

  // Overdue borrows columns
  const overdueBorrowColumns = [
    {
      title: 'Người mượn',
      dataIndex: 'userName',
      render: (text) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || 'Unknown User'}</div>
        </div>
      ),
      width: '25%'
    },
    {
      title: 'Sách',
      dataIndex: 'bookTitle',
      render: (text) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || 'Unknown Book'}</div>
        </div>
      ),
      width: '25%'
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      render: (date) => (
        <span style={{ color: 'red' }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
      width: '15%'
    },
    {
      title: 'Quá hạn',
      dataIndex: 'daysOverdue',
      render: (days) => {
        const validDays = days && !isNaN(days) ? days : 0;
        return (
          <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {validDays} ngày
          </Tag>
        );
      },
      width: '12%'
    },
    {
      title: 'Phí phạt',
      dataIndex: 'daysOverdue',
      render: (days) => {
        const validDays = days && !isNaN(days) ? days : 0;
        const fee = validDays * 5000;
        return (
          <span style={{ color: 'red', fontWeight: 'bold' }}>
            {fee.toLocaleString('vi-VN')}đ
          </span>
        );
      },
      width: '12%'
    },
    {
      title: 'Hành động',
      render: (_, borrow) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(borrow)}
          >
            Chi tiết
          </Button>
          <Button 
            type="primary" 
            size="small"
            onClick={() => openReturnModal(borrow)}
          >
            Trả sách
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phiếu mượn này?"
            onConfirm={() => handleDeleteBorrow(borrow.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: '11%'
    }
  ];

  // Returned borrows columns
  const returnedBorrowColumns = [
    {
      title: 'Người mượn',
      dataIndex: 'userName',
      render: (text) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || 'Unknown User'}</div>
        </div>
      ),
      width: '25%'
    },
    {
      title: 'Sách',
      dataIndex: 'bookTitle',
      render: (text) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || 'Unknown Book'}</div>
        </div>
      ),
      width: '25%'
    },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrowDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: '15%'
    },
    {
      title: 'Ngày trả',
      dataIndex: 'returnDate',
      render: (date) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
      width: '15%'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      render: (notes) => notes || '-',
      width: '15%'
    },
    {
      title: 'Hành động',
      render: (_, borrow) => (
        <Button 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => openDetailDrawer(borrow)}
        >
          Chi tiết
        </Button>
      ),
      width: '5%'
    }
  ];

  const refreshData = () => {
    loadStats();
    if (activeTab === 'active') {
      fetchActiveBorrows(activePagination.current, activePagination.pageSize);
    } else if (activeTab === 'overdue') {
      fetchOverdueBorrows(overduePagination.current, overduePagination.pageSize);
    } else if (activeTab === 'returned') {
      fetchReturnedBorrows(returnedPagination.current, returnedPagination.pageSize);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Dashboard Overview */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Quản lý mượn sách</h2>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Yêu cầu chờ duyệt"
                value={stats.totalPending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Phiếu mượn đang hoạt động"
                value={stats.totalActive}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sách quá hạn"
                value={stats.totalOverdue}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Phiếu mượn đã trả"
                value={stats.totalReturned}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Action buttons */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Tạo phiếu mượn mới
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={refreshData}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Main content tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={`Yêu cầu chờ duyệt (${stats.totalPending})`} key="pending">
          <Table
            dataSource={pendingRequests}
            loading={loading}
            rowKey="id"
            columns={pendingRequestColumns}
            pagination={{
              current: pendingPagination.current,
              pageSize: pendingPagination.pageSize,
              total: pendingPagination.total,
              onChange: fetchPendingRequests,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
            }}
          />
        </TabPane>
        
        <TabPane tab={`Phiếu mượn hoạt động (${stats.totalActive})`} key="active">
          <Table
            dataSource={activeBorrows}
            loading={loading}
            rowKey="id"
            columns={activeBorrowColumns}
            pagination={{
              ...activePagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu mượn`,
            }}
            onChange={(pag) => {
              setActivePagination(pag);
              fetchActiveBorrows(pag.current, pag.pageSize);
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </TabPane>

        <TabPane tab={`Sách quá hạn (${stats.totalOverdue})`} key="overdue">
          <Table
            dataSource={overdueBorrows}
            loading={loading}
            rowKey="id"
            columns={overdueBorrowColumns}
            pagination={{
              ...overduePagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sách quá hạn`,
            }}
            onChange={(pag) => {
              setOverduePagination(pag);
              fetchOverdueBorrows(pag.current, pag.pageSize);
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </TabPane>

        <TabPane tab={`Phiếu mượn đã trả (${stats.totalReturned})`} key="returned">
          <Table
            dataSource={returnedBorrows}
            loading={loading}
            rowKey="id"
            columns={returnedBorrowColumns}
            pagination={{
              ...returnedPagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu mượn đã trả`,
            }}
            onChange={(pag) => {
              setReturnedPagination(pag);
              fetchReturnedBorrows(pag.current, pag.pageSize);
            }}
            scroll={{ y: 'calc(100vh - 450px)' }}
          />
        </TabPane>
      </Tabs>

      {/* Modal Tạo phiếu mượn mới */}
      <Modal
        title="Tạo phiếu mượn mới"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={createForm}
          onFinish={handleCreateBorrow}
          layout="vertical"
          initialValues={{
            dueDate: dayjs().add(14, 'day')
          }}
        >
          <Form.Item
            name="userId"
            label="Người mượn"
            rules={[{ required: true, message: 'Vui lòng chọn người mượn!' }]}
          >
            <Select
              placeholder="Chọn người mượn"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users.map(user => (
                <Select.Option key={user.id || user.Id} value={user.id || user.Id}>
                  <strong>#{user.id || user.Id}</strong> - {user.fullName || user.Fullname || user.username || user.Username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bookId"
            label="Sách"
            rules={[{ required: true, message: 'Vui lòng chọn sách!' }]}
          >
            <Select
              placeholder="Chọn sách"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {books.map(book => (
                <Select.Option key={book.id} value={book.id}>
                  {book.title} - {book.author} (Còn: {book.availableCopies})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn trả"
            rules={[{ required: true, message: 'Vui lòng chọn hạn trả!' }]}
            extra="Mặc định là 14 ngày từ hôm nay"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="Chọn ngày hết hạn"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú (tùy chọn)"
              maxLength={500}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => {
              setCreateModalOpen(false);
              createForm.resetFields();
            }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo phiếu mượn
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Trả sách */}
      <Modal
        title="Trả sách"
        open={returnModalOpen}
        onCancel={() => {
          setReturnModalOpen(false);
          setSelectedBorrow(null);
          returnForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedBorrow && (
          <>
            <Descriptions bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Người mượn" span={2}>
                <strong>{selectedBorrow.user?.fullname || selectedBorrow.user?.username}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedBorrow.user?.email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Sách" span={2}>
                <strong>{selectedBorrow.book?.title}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tác giả">
                {selectedBorrow.book?.author}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày mượn">
                {dayjs(selectedBorrow.borrowDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn trả">
                <span style={{ 
                  color: dayjs().isAfter(dayjs(selectedBorrow.dueDate)) ? 'red' : 'inherit' 
                }}>
                  {dayjs(selectedBorrow.dueDate).format('DD/MM/YYYY')}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số ngày mượn">
                {dayjs().diff(dayjs(selectedBorrow.borrowDate), 'day')} ngày
              </Descriptions.Item>
              
              {/* Hiển thị phí phạt nếu quá hạn */}
              {dayjs().isAfter(dayjs(selectedBorrow.dueDate)) && (
                <>
                  <Descriptions.Item label="Số ngày quá hạn" span={2}>
                    <Tag color="red" style={{ fontSize: '14px' }}>
                      {dayjs().diff(dayjs(selectedBorrow.dueDate), 'day')} ngày
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí phạt">
                    <span style={{ color: 'red', fontWeight: 'bold', fontSize: '16px' }}>
                      {(dayjs().diff(dayjs(selectedBorrow.dueDate), 'day') * 5000).toLocaleString('vi-VN')}đ
                    </span>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Form
              form={returnForm}
              onFinish={handleReturnBook}
              layout="vertical"
            >
              <Form.Item
                name="notes"
                label="Ghi chú khi trả sách"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Ghi chú về tình trạng sách, phí phạt đã thu... (tùy chọn)"
                  maxLength={500}
                />
              </Form.Item>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
                <Button onClick={() => {
                  setReturnModalOpen(false);
                  setSelectedBorrow(null);
                  returnForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Xác nhận trả sách
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal>

      {/* Drawer Chi tiết phiếu mượn */}
      <Drawer
        title="Chi tiết phiếu mượn"
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setBorrowDetail(null);
        }}
        width={700}
        extra={
          borrowDetail && (
            <Space>
              <Button 
                type="primary"
                icon={<DollarOutlined />}
                onClick={openCreateFeeModal}
              >
                Tạo phí
              </Button>
            </Space>
          )
        }
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <span>Đang tải chi tiết...</span>
          </div>
        ) : borrowDetail ? (
          <>
            <Descriptions title="Thông tin phiếu mượn" bordered column={2}>
              <Descriptions.Item label="Mã phiếu" span={2}>
                <strong>#{borrowDetail.id}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái" span={2}>
                {borrowDetail.status === 'borrowed' ? (
                  borrowDetail.daysOverdue > 0 ? (
                    <Tag color="red">Quá hạn {borrowDetail.daysOverdue} ngày</Tag>
                  ) : (
                    <Tag color="blue">Đang mượn</Tag>
                  )
                ) : (
                  <Tag color="green">Đã trả</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Người mượn" span={2}>
                <div>
                  <strong>{borrowDetail.user?.fullname || borrowDetail.user?.username}</strong><br/>
                  <span style={{ color: '#666' }}>
                    {borrowDetail.user?.email} | {borrowDetail.user?.phone}<br/>
                    Role: {borrowDetail.user?.role} | Active: {borrowDetail.user?.isactive ? 'Có' : 'Không'}
                  </span>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Sách" span={2}>
                <div>
                  <strong>{borrowDetail.book?.title}</strong><br/>
                  <span style={{ color: '#666' }}>
                    Tác giả: {borrowDetail.book?.author}<br/>
                    ISBN: {borrowDetail.book?.isbn}<br/>
                    NXB: {borrowDetail.book?.publisher}<br/>
                    Thể loại: {borrowDetail.book?.category?.name}<br/>
                    Tổng số: {borrowDetail.book?.totalCopies} | Còn lại: {borrowDetail.book?.availableCopies}
                  </span>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày mượn">
                {dayjs(borrowDetail.borrowDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn trả">
                <span style={{ 
                  color: borrowDetail.daysOverdue > 0 ? 'red' : 'inherit',
                  fontWeight: borrowDetail.daysOverdue > 0 ? 'bold' : 'normal'
                }}>
                  {dayjs(borrowDetail.dueDate).format('DD/MM/YYYY HH:mm')}
                </span>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày trả">
                {borrowDetail.returnDate 
                  ? dayjs(borrowDetail.returnDate).format('DD/MM/YYYY HH:mm')
                  : 'Chưa trả'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Số ngày mượn">
                {borrowDetail.daysBorrowed} ngày
              </Descriptions.Item>

              {borrowDetail.daysOverdue !== null && borrowDetail.daysOverdue > 0 && (
                <Descriptions.Item label="Số ngày trễ" span={2}>
                  <Tag color="red" style={{ fontSize: '14px' }}>
                    {borrowDetail.daysOverdue} ngày
                  </Tag>
                  <span style={{ marginLeft: 8, color: 'red', fontWeight: 'bold' }}>
                    (Phí phạt: {((borrowDetail.daysOverdue || 0) * 5000).toLocaleString('vi-VN')}đ)
                  </span>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Ghi chú" span={2}>
                {borrowDetail.notes || 'Không có ghi chú'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {dayjs(borrowDetail.createdat).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật cuối">
                {dayjs(borrowDetail.updatedat).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {/* Hiển thị phí nếu có */}
            {borrowDetail.fees && borrowDetail.fees.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>Danh sách phí liên quan</h4>
                <Table
                  dataSource={borrowDetail.fees}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Loại phí',
                      dataIndex: 'type',
                      render: (type) => {
                        const typeMap = {
                          'late_fee': 'Phí trễ hạn',
                          'damage_fee': 'Phí hư hỏng',
                          'lost_fee': 'Phí mất sách'
                        };
                        return typeMap[type] || type;
                      }
                    },
                    {
                      title: 'Số tiền',
                      dataIndex: 'amount',
                      render: (amount) => (
                        <span style={{ fontWeight: 'bold', color: 'red' }}>
                          {amount?.toLocaleString('vi-VN')}đ
                        </span>
                      )
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      render: (status) => (
                        <Tag color={status === 'paid' ? 'green' : 'red'}>
                          {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Tag>
                      )
                    },
                    {
                      title: 'Phương thức',
                      dataIndex: 'paymentMethod',
                      render: (method) => method || '-'
                    },
                    {
                      title: 'Ngày tạo',
                      dataIndex: 'createdAt',
                      render: (date) => dayjs(date).format('DD/MM/YYYY')
                    },
                    {
                      title: 'Ngày thanh toán',
                      dataIndex: 'paidAt',
                      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
                    },
                    {
                      title: 'Ghi chú',
                      dataIndex: 'notes',
                      ellipsis: true
                    }
                  ]}
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <span>Không có dữ liệu</span>
          </div>
        )}
      </Drawer>

      {/* Modal Tạo phí */}
      <Modal
        title="Tạo phí mới"
        open={createFeeModalOpen}
        onCancel={() => {
          setCreateFeeModalOpen(false);
          createFeeForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {borrowDetail && (
          <>
            {/* Thông tin phiếu mượn */}
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '20px' 
            }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div><strong>Phiếu mượn:</strong> #{borrowDetail.id}</div>
                  <div><strong>Người mượn:</strong> {borrowDetail.user?.fullname || borrowDetail.user?.username}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Sách:</strong> {borrowDetail.book?.title}</div>
                  {borrowDetail.daysOverdue > 0 && (
                    <div style={{ color: 'red', fontWeight: 'bold' }}>
                      <strong>Quá hạn:</strong> {borrowDetail.daysOverdue} ngày
                    </div>
                  )}
                </Col>
              </Row>
            </div>

            <Form
              form={createFeeForm}
              onFinish={handleCreateFee}
              layout="vertical"
            >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại phí"
                rules={[{ required: true, message: 'Vui lòng chọn loại phí!' }]}
              >
                <Select placeholder="Chọn loại phí">
                  <Option value="late_fee">Phí trễ hạn</Option>
                  <Option value="damage_fee">Phí hư hỏng</Option>
                  <Option value="lost_fee">Phí mất sách</Option>
                  <Option value="other_fee">Phí khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Số tiền (VNĐ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền!' },
                  { 
                    validator: (_, value) => {
                      if (value && value > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Số tiền phải lớn hơn 0!'));
                    }
                  }
                ]}
              >
                <InputNumber 
                  placeholder="Nhập số tiền"
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="paymentMethod"
            label="Phương thức thanh toán (tùy chọn)"
          >
            <Select placeholder="Chọn phương thức thanh toán" allowClear>
              <Option value="cash">Tiền mặt</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
              <Option value="credit_card">Thẻ tín dụng</Option>
              <Option value="e_wallet">Ví điện tử</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea 
              rows={3} 
              placeholder="Ghi chú về lý do thu phí, chi tiết..."
              maxLength={500}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => {
              setCreateFeeModalOpen(false);
              createFeeForm.resetFields();
            }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo phí
            </Button>
          </div>
        </Form>
        </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu mượn sách"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectingBorrow(null);
          rejectForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {rejectingBorrow && (
          <>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <p><strong>Người mượn:</strong> {rejectingBorrow.UserName || rejectingBorrow.userName || 'N/A'}</p>
              <p><strong>Sách:</strong> {rejectingBorrow.BookTitle || rejectingBorrow.bookTitle || 'N/A'}</p>
              <p><strong>Ngày yêu cầu:</strong> {rejectingBorrow.BorrowDate || rejectingBorrow.borrowDate ? dayjs(rejectingBorrow.BorrowDate || rejectingBorrow.borrowDate).format('DD/MM/YYYY') : 'N/A'}</p>
              {(rejectingBorrow.DueDate || rejectingBorrow.dueDate) && (
                <p><strong>Hạn trả:</strong> {dayjs(rejectingBorrow.DueDate || rejectingBorrow.dueDate).format('DD/MM/YYYY')}</p>
              )}
            </div>

            <Form
              form={rejectForm}
              layout="vertical"
              onFinish={handleRejectBorrow}
            >
              <Form.Item
                name="notes"
                label="Lý do từ chối"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do từ chối!' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối yêu cầu mượn sách..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setRejectModalOpen(false);
                  setRejectingBorrow(null);
                  rejectForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" danger htmlType="submit">
                  Xác nhận từ chối
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}

export default AdminBorrowManagement;