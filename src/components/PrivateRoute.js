import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../auth';

// Guard route: wajib login. Bila `roles` diberikan, role user juga harus cocok —
// kalau tidak, user dikembalikan ke dashboard (bukan halaman error).
const PrivateRoute = ({ children, roles }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default PrivateRoute;
