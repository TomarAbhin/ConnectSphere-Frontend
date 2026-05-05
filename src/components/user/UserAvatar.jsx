import { resolveMediaUrl } from '../../utils/mediaUrl';

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-xl',
};

const GRADIENT_PAIRS = [
  'from-brand-400 to-purple-500',
  'from-violet-400 to-pink-500',
  'from-cyan-400 to-brand-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
];

function getGradient(name) {
  const code = (name || 'U').charCodeAt(0);
  return GRADIENT_PAIRS[code % GRADIENT_PAIRS.length];
}

export default function UserAvatar({ name, src, size = 'md', ring = false, storyRing = false }) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = (name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const gradient = getGradient(name);
  const avatarSrc = resolveMediaUrl(src);

  const wrapperClass = storyRing ? 'avatar-ring-story story-ring-glow' : ring ? 'avatar-ring' : '';

  const imgEl = avatarSrc ? (
    <img
      src={avatarSrc}
      alt={name || 'User avatar'}
      className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
    />
  ) : (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-semibold text-white ring-2 ring-white shadow-sm`}
    >
      {initials}
    </div>
  );

  if (wrapperClass) {
    return <div className={wrapperClass}>{imgEl}</div>;
  }

  return imgEl;
}
