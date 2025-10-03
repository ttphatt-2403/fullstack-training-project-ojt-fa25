import React, { useContext } from "react";  
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();

    if (!user) {    
        return <Navigate to="/" replace />; // chưa login → quay về Login
    }

    if (role && !user.role.includes(role)) {    
        return <Navigate to="/unauthorized" replace />; // không đủ quyền → quay về Unauthorized
    }       
    return children; // đã login và đủ quyền → render component con
};  
export default PrivateRoute;