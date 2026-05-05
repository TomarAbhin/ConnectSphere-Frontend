import { REACTIONS } from '../../utils/constants';

export default function ReactionPicker({ currentReaction, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-100 bg-white/80 p-2 backdrop-blur-sm shadow-sm animate-scale-in">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.key}
          type="button"
          onClick={() => onSelect?.(reaction.key)}
          className={`reaction-btn inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm ${
            currentReaction === reaction.key
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-sm'
              : 'border border-slate-100 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-brand-200'
          }`}
        >
          <span className="text-base leading-none">{reaction.emoji}</span>
          <span className="hidden sm:inline">{reaction.label}</span>
        </button>
      ))}
    </div>
  );
}
