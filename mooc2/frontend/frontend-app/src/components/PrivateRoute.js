import React, { useContext } from "react";  
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, roles, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />; // chưa login → quay về Login
    }

    // Ưu tiên kiểm tra roles (mảng), fallback về role (chuỗi)
    if (roles && Array.isArray(roles)) {
        if (!roles.includes(user.role)) {
            return <Navigate to="/unauthorized" replace />; // không đủ quyền
        }
    } else if (role) {
        if (user.role !== role) {
            return <Navigate to="/unauthorized" replace />;
        }
    }
    return children; // đã login và đủ quyền → render component con
};
export default PrivateRoute;