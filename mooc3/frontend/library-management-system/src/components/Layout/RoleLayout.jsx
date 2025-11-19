import { Layout, Menu, Avatar, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const { Header, Sider, Content } = Layout;

function RoleLayout({ role, children }) {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu cho từng role
  const menus = {
    Admin: [
      { key: 'dashboard', label: 'Dashboard', onClick: () => navigate('/admin') },
      { key: 'profile', label: '👤 Thông tin cá nhân', onClick: () => navigate('/admin/profile') },
      { key: 'users', label: '👤 Quản lý User', onClick: () => navigate('/admin/users') },
      { key: 'books', label: '📚 Quản lý Sách', onClick: () => navigate('/admin/books') },       
      { key: 'categories', label: '📖 Quản lý Thể loại', onClick: () => navigate('/admin/categories') },
      { key: 'borrows', label: '📋 Quản lý mượn sách', onClick: () => navigate('/admin/borrows') },
      { key: 'fees', label: '💰 Quản lý phí', onClick: () => navigate('/admin/fees') },
    ],
    Staff: [
      { key: 'dashboard', label: 'Dashboard', onClick: () => navigate('/staff') },
      { key: 'profile', label: '👤 Thông tin cá nhân', onClick: () => navigate('/staff/profile') },
      { key: 'checkin', label: '📖 Check-in ', onClick: () => navigate('/staff/checkin') },
      { key: 'borrows', label: '📚 Check-out ', onClick: () => navigate('/staff/borrows') },
      { key: 'books', label: '📚 Quản lý Sách', onClick: () => navigate('/staff/books') },
      { key: 'fees', label: '💰 Quản lý phí', onClick: () => navigate('/staff/fees') },
    ],
    User: [
      { key: 'dashboard', label: '🏠 Dashboard', onClick: () => navigate('/user') },
      { key: 'profile', label: '👤 Thông tin cá nhân', onClick: () => navigate('/user/profile') },
      { key: 'books', label: '📚 Khám phá sách', onClick: () => navigate('/user/books') },
      { key: 'borrows', label: '📖 Sách đã mượn', onClick: () => navigate('/user/borrows') },
      { key: 'fees', label: '💰 Phí của tôi', onClick: () => navigate('/user/fees') },
    ],
  };

  // Chọn menu đang được truy cập
  let selectedKey = 'dashboard';
  if (role === 'Admin') {
    if (location.pathname === '/admin') selectedKey = 'dashboard';
    else if (location.pathname.startsWith('/admin/profile')) selectedKey = 'profile';
    else if (location.pathname.startsWith('/admin/users')) selectedKey = 'users';
    else if (location.pathname.startsWith('/admin/books')) selectedKey = 'books';
    else if (location.pathname.startsWith('/admin/categories')) selectedKey = 'categories';
    else if (location.pathname.startsWith('/admin/borrows')) selectedKey = 'borrows';
    else if (location.pathname.startsWith('/admin/fees')) selectedKey = 'fees';
  } else if (role === 'Staff') {
    if (location.pathname === '/staff') selectedKey = 'dashboard';
    else if (location.pathname.startsWith('/staff/profile')) selectedKey = 'profile';
    else if (location.pathname.startsWith('/staff/checkin')) selectedKey = 'checkin';
    else if (location.pathname.startsWith('/staff/borrows')) selectedKey = 'borrows';
    else if (location.pathname.startsWith('/staff/books')) selectedKey = 'books';
    else if (location.pathname.startsWith('/staff/fees')) selectedKey = 'fees';
  } else if (role === 'User') {
    if (location.pathname === '/user') selectedKey = 'dashboard';
    else if (location.pathname.startsWith('/user/profile')) selectedKey = 'profile';
    else if (location.pathname.startsWith('/user/books')) selectedKey = 'books';
    else if (location.pathname.startsWith('/user/borrows')) selectedKey = 'borrows';
    else if (location.pathname.startsWith('/user/fees')) selectedKey = 'fees';
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo" style={{ color: '#fff', textAlign: 'center', padding: '16px' }}>
          LMS {role}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menus[role] || []}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Space>
            <Avatar>{user?.fullName?.charAt(0) || 'U'}</Avatar>
            <span>Xin chào, {user?.fullName || user?.username}</span>
          </Space>
          <Button onClick={() => authService.logout()}>Đăng xuất</Button>
        </Header>
        <Content style={{ margin: '16px', background: "#fff", borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
export default RoleLayout;
