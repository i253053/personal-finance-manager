import { BRAND } from '../../brand';

// Geometric logo mark: rounded square with a rising sparkline.
export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="finora-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#finora-g)" />
      <path
        d="M9 26.5L15.5 20l4.5 4.5L31 13.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="13.5" r="3" fill="white" />
    </svg>
  );
}

export default function Logo({ size = 32, textClass = 'text-lg', className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className={`font-bold tracking-tight ${textClass}`}>{BRAND.name}</span>
    </div>
  );
}
