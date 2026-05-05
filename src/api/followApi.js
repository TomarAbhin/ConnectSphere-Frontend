import api from './axiosInstance';

export const followApi = {
  follow: (followeeId) => api.post(`/follows/${followeeId}`).then((res) => res.data),
  unfollow: (followeeId) => api.delete(`/follows/${followeeId}`).then((res) => res.data),
  followers: (userId) => api.get(`/follows/${userId}/followers`).then((res) => res.data),
  following: (userId) => api.get(`/follows/${userId}/following`).then((res) => res.data),
  isFollowing: (followedId) => api.get(`/follows/${followedId}/following-status`).then((res) => res.data),
  counts: (userId) => api.get(`/follows/${userId}/counts`).then((res) => res.data),
  suggested: () => api.get('/follows/suggestions').then((res) => res.data),
  mutual: (userId) => api.get(`/follows/${userId}/mutual`).then((res) => res.data),
};
