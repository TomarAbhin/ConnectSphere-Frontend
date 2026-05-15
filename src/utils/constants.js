export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
export const MEDIA_SERVICE_URL = import.meta.env.VITE_MEDIA_SERVICE_URL || 'http://localhost:8087';

export const ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const REACTIONS = [
  { key: 'LIKE', label: 'Like', emoji: '👍' },
  { key: 'LOVE', label: 'Love', emoji: '❤️' },
  { key: 'HAHA', label: 'Haha', emoji: '😂' },
  { key: 'WOW', label: 'Wow', emoji: '😮' },
  { key: 'SAD', label: 'Sad', emoji: '😢' },
  { key: 'ANGRY', label: 'Angry', emoji: '😡' },
];

export const POST_VISIBILITY_LABELS = {
  PUBLIC: 'Public',
  FOLLOWERS_ONLY: 'Followers',
  PRIVATE: 'Private',
};
