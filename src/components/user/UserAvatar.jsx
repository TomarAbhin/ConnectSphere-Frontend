import { resolveMediaUrl } from '../../utils/mediaUrl';

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
};

const FALLBACK_COLORS = [
  ['#6366f1', '#818cf8'],
  ['#3b82f6', '#60a5fa'],
  ['#14b8a6', '#2dd4bf'],
  ['#f59e0b', '#fbbf24'],
  ['#ec4899', '#f472b6'],
  ['#ef4444', '#f87171'],
];

function getFallbackAvatar(name) {
  const code = (name || 'U').charCodeAt(0);
  const [start, end] = FALLBACK_COLORS[code % FALLBACK_COLORS.length];
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#bg)" />
      <text x="60" y="66" text-anchor="middle" fill="white" font-family="Inter,system-ui,sans-serif" font-size="42" font-weight="600">${initials}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function UserAvatar({ name, src, size = 'md', ring = false, storyRing = false }) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const avatarSrc = resolveMediaUrl(src);
  const fallbackSrc = getFallbackAvatar(name);

  const wrapperClass = storyRing ? 'avatar-ring-story story-ring-glow' : ring ? 'avatar-ring' : '';

  const imgEl = (
    <img
      src={avatarSrc || fallbackSrc}
      alt={name || 'User avatar'}
      className={`${sizeClass} rounded-full object-cover ring-2 ring-white bg-slate-100`}
    />
  );

  if (wrapperClass) {
    return <div className={wrapperClass}>{imgEl}</div>;
  }
  return imgEl;
}
