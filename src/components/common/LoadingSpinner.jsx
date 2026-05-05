export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      <div className="cs-spinner" />
      <p className="text-sm font-medium text-slate-400 tracking-wide">{label}…</p>
    </div>
  );
}
