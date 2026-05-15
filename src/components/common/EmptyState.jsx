import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div className="glass-card-static flex flex-col items-center justify-center gap-3 p-10 text-center animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description ? <p className="max-w-sm text-sm text-slate-400 leading-relaxed">{description}</p> : null}
    </div>
  );
}
