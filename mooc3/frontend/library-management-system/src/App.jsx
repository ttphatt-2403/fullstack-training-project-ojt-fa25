import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

import AdminPage from './pages/Admin/AdminPage';
import UserManagement from './pages/Admin/UserManagement';
import AdminBookPage from './pages/Admin/AdminBookPage';
import AdminCategoryPage from './pages/Admin/AdminCategoryPage';
import AdminBorrowManagement from './pages/Admin/AdminBorrowManagement';
import AdminFeeManagement from './pages/Admin/AdminFeeManagement';

import StaffPage from './pages/Staff/StaffPage';
import StaffBookInventory from './pages/Staff/StaffBookInventory';
import StaffBorrowManagement from './pages/Staff/StaffBorrowManagement';
import StaffFeeManagement from './pages/Staff/StaffFeeManagement';
import StaffCheckin from './pages/Staff/StaffCheckin';

import UserPage from './pages/User/UserPage';
import UserBooksPage from './pages/User/UserBooksPage';
import UserBorrows from './pages/User/UserBorrows';
import UserFees from './pages/User/UserFees';

import ProfilePage from './pages/Profile/ProfilePage';
import NotFound from './pages/NotFound';

import { authService } from './services/authService';

function PrivateRoute({ children, roles }) {
  const user = authService.getCurrentUser();
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (roles) {
    const userRole = user?.role?.toString().toLowerCase();
    const allowed = roles.map((r) => r.toString().toLowerCase());
    if (!userRole || !allowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}

function HomeRedirect() {
  const user = authService.getCurrentUser();
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  const role = user?.role?.toString().toLowerCase();
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "staff") return <Navigate to="/staff" replace />;
  if (role === "user") return <Navigate to="/user" replace />;
  return <Navigate to="/login" replace />;
}

// App component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin (layout+outlet) */}
        <Route path="/admin" element={
          <PrivateRoute roles={['Admin']}>
            <AdminPage />
          </PrivateRoute>
        }>
          <Route index element={<div>Trang Admin - Dashboard</div>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="books" element={<AdminBookPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="borrows" element={<AdminBorrowManagement />} />
          <Route path="fees" element={<AdminFeeManagement />} />
        </Route>

        {/* Staff (layout+outlet) */}
        <Route path="/staff" element={
          <PrivateRoute roles={['Staff']}>
            <StaffPage />
          </PrivateRoute>
        }>
          <Route index element={<div>Trang Staff - Dashboard</div>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="checkin" element={<StaffCheckin />} />
          <Route path="books" element={<StaffBookInventory />} />
          <Route path="borrows" element={<StaffBorrowManagement />} />
          <Route path="fees" element={<StaffFeeManagement />} />
        </Route>

        {/* User (layout+outlet) */}
        <Route path="/user" element={
          <PrivateRoute roles={['User']}>
            <UserPage />
          </PrivateRoute>
        }>
          <Route index element={<div>Trang User - Dashboard</div>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="books" element={<UserBooksPage />} />
          <Route path="borrows" element={<UserBorrows />} />
          <Route path="fees" element={<UserFees />} />
        </Route>

        {/* Home redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
