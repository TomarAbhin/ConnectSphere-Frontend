export const BASE_URL = 'http://localhost:8080/api/v1';

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
