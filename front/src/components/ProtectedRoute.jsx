import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;