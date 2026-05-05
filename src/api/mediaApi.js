import api from './axiosInstance';

export function inferMediaType(file) {
  if (!file?.type) return 'IMAGE';
  return file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

export const mediaApi = {
  uploadMedia: (file, request) => {
    const formData = new FormData();
    formData.append('file', file);
    // backend expects a multipart part named 'request' containing JSON
    formData.append('request', JSON.stringify(request || {}));
    // media-service exposes POST /media (not /media/upload)
    return api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },
  getActiveStories: (userId) => api.get('/stories/active', { params: { userId } }).then((res) => res.data),
  createStory: (payload) => api.post('/stories', payload).then((res) => res.data),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`).then((res) => res.data),
};
