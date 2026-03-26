export default function StatusBadge({ label, bg, text, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
    lg: 'px-4 py-2 text-base font-medium',
  };

  return (
    <span className={`inline-block rounded-full ${bg} ${text} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
}
