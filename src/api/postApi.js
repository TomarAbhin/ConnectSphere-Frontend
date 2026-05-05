import api from './axiosInstance';

export const postApi = {
  createPost: (payload) => api.post('/posts', payload).then((res) => res.data),
  getPost: (id) => api.get(`/posts/${id}`).then((res) => res.data),
  getPostsByUser: (userId) => api.get('/posts/user/' + userId).then((res) => res.data),
  getFeed: () => api.get('/posts/feed').then((res) => res.data),
  updatePost: (id, payload) => api.put(`/posts/${id}`, payload).then((res) => res.data),
  deletePost: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
  adminDeletePost: (id) => api.delete(`/posts/admin/${id}`).then((res) => res.data),
  searchPosts: (query) => api.get('/posts/search', { params: { query } }).then((res) => res.data),
  changeVisibility: (id, visibility) => api.put(`/posts/${id}/visibility`, { visibility }).then((res) => res.data),
  likePost: (id) => api.post(`/posts/${id}/likes`).then((res) => res.data),
  unlikePost: (id) => api.delete(`/posts/${id}/likes`).then((res) => res.data),
  incrementComments: (id) => api.post(`/posts/${id}/comments`).then((res) => res.data),
  decrementComments: (id) => api.delete(`/posts/${id}/comments`).then((res) => res.data),
  getCount: () => api.get('/posts/count').then((res) => res.data),
};
