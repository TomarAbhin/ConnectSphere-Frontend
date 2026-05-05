import { BASE_URL } from './constants';

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized.startsWith('/api/v1/media/')) {
    return `${BASE_URL.replace(/\/api\/v1\/?$/, '')}${normalized}`;
  }

  if (normalized.startsWith('/media/')) {
    return `${BASE_URL}${trimmed}`;
  }

  if (normalized.includes('/media/files/')) {
    return `${BASE_URL}${normalized.startsWith('/api/v1/') ? normalized.replace(/^\/api\/v1/, '') : normalized}`;
  }

  return trimmed;
}