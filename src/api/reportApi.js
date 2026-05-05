import api from './axiosInstance';

export const reportApi = {
  createReport: (payload) => api.post('/reports', payload).then((res) => res.data),
  getAllReports: () => api.get('/reports').then((res) => res.data),
  getReportsByStatus: (status) => api.get(`/reports/status/${status}`).then((res) => res.data),
  updateReportStatus: (reportId, payload) => api.put(`/reports/${reportId}/status`, payload).then((res) => res.data),
};