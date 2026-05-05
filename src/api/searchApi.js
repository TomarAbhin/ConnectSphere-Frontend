import api from './axiosInstance';

export const searchApi = {
  searchPosts: (query) => api.get('/search/posts', { params: { query } }).then((res) => res.data),
  adminPosts: (query) => api.get('/search/admin/posts', { params: { query } }).then((res) => res.data),
  adminUpsertHashtag: (tag) => api.post('/search/admin/hashtags', { tag }).then((res) => res.data),
  searchUsers: (query) => api.get('/search/users', { params: { query } }).then((res) => res.data),
  trendingHashtags: () => api.get('/search/hashtags/trending').then((res) => res.data),
  hashtagPosts: (tag) => api.get(`/search/hashtags/${encodeURIComponent(tag)}/posts`).then((res) => res.data),
  getPostsByHashtag: (tag) => api.get(`/search/hashtags/${encodeURIComponent(tag)}/posts`).then((res) => res.data),
  adminIndexPost: (payload) => api.post('/search/admin/index', payload).then((res) => res.data),
};
