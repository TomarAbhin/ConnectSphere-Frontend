import { describe, expect, it } from 'vitest';
import { BASE_URL, MEDIA_SERVICE_URL } from './constants';
import { resolveMediaUrl } from './mediaUrl';

describe('resolveMediaUrl', () => {
  it('keeps absolute urls unchanged', () => {
    expect(resolveMediaUrl('https://cdn.example.com/image.jpg')).toBe('https://cdn.example.com/image.jpg');
  });

  it('routes uploads paths through the media service', () => {
    expect(resolveMediaUrl('uploads/media/media/3/photo.jpg')).toBe(`${MEDIA_SERVICE_URL}/media/files/media/3/photo.jpg`);
  });

  it('routes gateway media paths through the api gateway root', () => {
    const gatewayRoot = BASE_URL.replace(/\/api\/v1\/?$/, '');
    expect(resolveMediaUrl('api/v1/media/files/media/3/photo.jpg')).toBe(`${gatewayRoot}/api/v1/media/files/media/3/photo.jpg`);
  });
});