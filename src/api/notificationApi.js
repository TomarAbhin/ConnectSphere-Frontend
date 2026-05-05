import api from './axiosInstance';

export const notificationApi = {
  getAll: () => api.get('/notifications').then((res) => res.data),
  getByRecipient: (recipientId) => api.get(`/notifications/recipient/${recipientId}`).then((res) => res.data),
  unreadCount: (recipientId) => api.get(`/notifications/recipient/${recipientId}/unread-count`).then((res) => res.data),
  markRead: (notificationId) => api.put(`/notifications/${notificationId}/read`).then((res) => res.data),
  markAllRead: (recipientId) => api.put(`/notifications/recipient/${recipientId}/read-all`).then((res) => res.data),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`).then((res) => res.data),
  sendBulkNotification: (payload) => api.post('/notifications/bulk', payload).then((res) => res.data),
  sendEmailAlert: (payload) => api.post('/notifications/email', payload).then((res) => res.data),
};
