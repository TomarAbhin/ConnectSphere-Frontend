import { BASE_URL, MEDIA_SERVICE_URL } from './constants';

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, '');
  const gatewayRoot = BASE_URL.replace(/\/api\/v1\/?$/, '');
  const gatewayMediaFilesRoot = `${gatewayRoot}/api/v1/media/files`;

  if (normalized.startsWith('api/v1/media/')) {
    return `${gatewayRoot}/${normalized}`;
  }

  if (normalized.startsWith('media/files/')) {
    return `${gatewayRoot}/api/v1/${normalized}`;
  }

  if (normalized.startsWith('media/')) {
    return `${gatewayMediaFilesRoot}/${normalized}`;
  }

  if (normalized.startsWith('uploads/media/')) {
    return `${gatewayMediaFilesRoot}/${normalized.replace(/^uploads\/media\//, '')}`;
  }

  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg|mp4|webm|mov|m4v)(\?|#|$)/i.test(normalized) || /^[a-f0-9-]{16,}\.[a-z0-9]{2,5}$/i.test(normalized)) {
    return `${gatewayMediaFilesRoot}/${normalized}`;
  }

  return trimmed;
}
