import { REACTIONS } from '../../utils/constants';

export default function ReactionPicker({ currentReaction, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-md animate-scale-in">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.key}
          type="button"
          onClick={() => onSelect?.(reaction.key)}
          className={`reaction-btn inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:py-2 sm:text-sm ${
            currentReaction === reaction.key
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="text-base leading-none">{reaction.emoji}</span>
          <span className="hidden sm:inline">{reaction.label}</span>
        </button>
      ))}
    </div>
  );
}
