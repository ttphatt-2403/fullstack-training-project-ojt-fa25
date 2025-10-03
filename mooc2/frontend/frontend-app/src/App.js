import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPageSimple";
import RegisterPage from "./pages/RegisterPageSimple";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import Unauthorized from "./pages/Unauthorized";
import LibraryDashboard from "./pages/LibraryDashboard";
import BookManagement from "./pages/BookManagement";
import CategoryManagement from "./pages/CategoryManagement";
import BorrowManagement from "./pages/BorrowManagement";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Library Management Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["admin", "user"]}>
                  <LibraryDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/books"
              element={
                <PrivateRoute roles={["admin", "user"]}>
                  <BookManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute roles={["admin", "user"]}>
                  <CategoryManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/borrows"
              element={
                <PrivateRoute roles={["admin", "user"]}>
                  <BorrowManagement />
                </PrivateRoute>
              }
            />
            
            {/* Original MOOC2 Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user"
              element={
                <PrivateRoute roles={["user"]}>
                  <UserPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;