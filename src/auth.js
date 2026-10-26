// Helper auth sisi client: baca & decode JWT dari localStorage, plus cek role.
//
// Catatan: pengecekan role di sini hanya untuk UX. Otorisasi sebenarnya
// dilakukan backend (lihat docs/rbac.md) — user bisa mengubah localStorage,
// tapi tetap kena 403 dari API.

export const ROLES = {
  SUPERADMIN: 'SuperAdmin',
  SUBSCRIBER: 'Subscriber',
  CLIENT: 'Client',
};

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // token kedaluwarsa
    }
    return payload; // { id, role, username, iat, exp }
  } catch {
    return null;
  }
};

// Cek apakah user punya salah satu role yang diminta
export const hasRole = (...roles) => {
  const user = getUser();
  return Boolean(user && roles.includes(user.role));
};

// SuperAdmin: satu-satunya role yang boleh mengelola user & melihat status user lain
export const isSuperAdmin = () => hasRole(ROLES.SUPERADMIN);

// Kemampuan jual/mint: SuperAdmin dan Subscriber
export const canSell = () => hasRole(ROLES.SUPERADMIN, ROLES.SUBSCRIBER);

export const logout = () => {
  localStorage.removeItem('token');
};
