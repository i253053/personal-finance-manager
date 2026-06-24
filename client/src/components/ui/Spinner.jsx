export default function Spinner({ className = 'h-8 w-8' }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 ${className}`}
    />
  );
}
