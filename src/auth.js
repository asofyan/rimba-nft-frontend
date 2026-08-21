// Helper auth sisi client: baca & decode JWT dari localStorage

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // token kedaluwarsa
    }
    return payload; // { id, role, iat, exp }
  } catch {
    return null;
  }
};

export const isAdmin = () => getUser()?.role === 'Admin';

export const logout = () => {
  localStorage.removeItem('token');
};
