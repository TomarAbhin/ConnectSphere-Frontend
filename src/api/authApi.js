import api from './axiosInstance';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) =>
    api.post('/auth/login', {
      emailOrUsername: payload.emailOrUsername || payload.email,
      password: payload.password,
    }).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }, { headers: { Authorization: `Bearer ${refreshToken}` } }).then((res) => res.data),
  profile: () => api.get('/auth/profile').then((res) => res.data),
  getUserById: (userId) => api.get(`/auth/user/${userId}`).then((res) => res.data),
  updateProfile: (payload) => api.put('/auth/profile', payload).then((res) => res.data),
  changePassword: (payload) => api.put('/auth/password', payload).then((res) => res.data),
  deactivate: () => api.delete('/auth/deactivate').then((res) => res.data),
  adminUsers: (query, role) => api.get('/auth/admin/users', { params: { query, role } }).then((res) => res.data),
  suspendUserById: (userId) => api.put(`/auth/admin/users/${userId}/suspend`).then((res) => res.data),
  reactivateUserById: (userId) => api.put(`/auth/admin/users/${userId}/reactivate`).then((res) => res.data),
  deactivateUserById: (userId) => api.put(`/auth/admin/users/${userId}/deactivate`).then((res) => res.data),
  deleteUserById: (userId) => api.delete(`/auth/admin/users/${userId}`).then((res) => res.data),
  adminAnalytics: () => api.get('/auth/admin/analytics').then((res) => res.data),
  searchUsers: (query, role) => api.get('/auth/search', { params: { query, role } }).then((res) => res.data),
};
