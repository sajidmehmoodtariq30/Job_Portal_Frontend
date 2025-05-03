// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default ProtectedRoute;
