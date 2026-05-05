import { Eye, EyeOff, Users, Globe } from 'lucide-react';
import { POST_VISIBILITY_LABELS } from '../../utils/constants';

const CONFIG = {
  PUBLIC: { icon: Globe, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  FOLLOWERS_ONLY: { icon: Users, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  PRIVATE: { icon: EyeOff, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function PostVisibilityBadge({ visibility }) {
  const cfg = CONFIG[visibility] || CONFIG.PUBLIC;
  const Icon = cfg.icon;
  return (
    <span className={`cs-badge ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <Icon className="h-3 w-3" />
      {POST_VISIBILITY_LABELS[visibility] || visibility || 'Public'}
    </span>
  );
}
