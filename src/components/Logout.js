import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login after clearing token
  }, [navigate]);

  return null;
};

export default Logout;
