import { resolveMediaUrl } from '../../utils/mediaUrl';

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
};

const FALLBACK_COLORS = [
  ['#6d5efc', '#8b5cf6'],
  ['#22d3ee', '#3b82f6'],
  ['#34d399', '#14b8a6'],
  ['#f59e0b', '#f97316'],
  ['#f472b6', '#ec4899'],
  ['#fb7185', '#e11d48'],
];

function getFallbackAvatar(name) {
  const code = (name || 'U').charCodeAt(0);
  const [start, end] = FALLBACK_COLORS[code % FALLBACK_COLORS.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Default avatar">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#bg)" />
      <circle cx="60" cy="47" r="20" fill="rgba(255,255,255,0.92)" />
      <path d="M24 102c7-19 23-28 36-28s29 9 36 28" fill="rgba(255,255,255,0.92)" />
      <path d="M36 94c5-11 14-16 24-16s19 5 24 16" fill="rgba(17,24,39,0.14)" />
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
      className={`${sizeClass} rounded-full object-cover ring-2 ring-white bg-slate-200`}
    />
  );

  if (wrapperClass) {
    return <div className={wrapperClass}>{imgEl}</div>;
  }

  return imgEl;
}
