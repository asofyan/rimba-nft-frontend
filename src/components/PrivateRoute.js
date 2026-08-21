import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../auth';

const PrivateRoute = ({ children }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
