import api, { plainApi } from './axiosInstance';

export const likeApi = {
  like: (payload) => api.post('/likes', payload).then((res) => res.data),
  unlike: (targetId, targetType) => api.delete('/likes', { params: { targetId, targetType } }).then((res) => res.data),
  hasLiked: (targetId, targetType) => api.get('/likes/has-liked', { params: { targetId, targetType } }).then((res) => res.data),
  // summary is public; use the gateway path without Authorization headers.
  summary: (targetId, targetType) => plainApi.get(`/likes/summary/${targetType}/${targetId}`).then((res) => res.data),
  changeReaction: (likeId, payload) => api.put(`/likes/${likeId}/reaction`, payload).then((res) => res.data),
  getLikesByUser: (userId) => api.get(`/likes/user/${userId}`).then((res) => res.data),
};
