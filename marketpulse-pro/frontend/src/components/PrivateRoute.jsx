import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const PrivateRoute = ({ children }) => {
  const { token } = useAuth(); // Use the custom hook

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;