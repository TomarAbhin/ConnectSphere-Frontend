import api from './axiosInstance';

export const commentApi = {
  addComment: (payload) => api.post('/comments', payload).then((res) => res.data),
  getCommentsByPost: (postId) => api.get(`/comments/post/${postId}`).then((res) => res.data),
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`).then((res) => res.data),
  updateComment: (id, payload) => api.put(`/comments/${id}`, payload).then((res) => res.data),
  deleteComment: (id) => api.delete(`/comments/${id}`).then((res) => res.data),
  likeComment: (id) => api.post(`/comments/${id}/likes`).then((res) => res.data),
  unlikeComment: (id) => api.delete(`/comments/${id}/likes`).then((res) => res.data),
};
