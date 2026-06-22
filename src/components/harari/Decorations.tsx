'use client'

// Harari decorative SVG components — inspired by the famous Harar Jugol walls and
// Islamic geometric patterns used in traditional Harari art.

export function HarariStar({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="harari-star-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A537" />
          <stop offset="50%" stopColor="#FBF3E2" />
          <stop offset="100%" stopColor="#D4A537" />
        </linearGradient>
      </defs>
      {/* 8-pointed star formed by two overlapping squares */}
      <g transform="translate(50,50)">
        <rect x="-35" y="-35" width="70" height="70" fill="url(#harari-star-grad)" transform="rotate(0)" opacity="0.9" />
        <rect x="-35" y="-35" width="70" height="70" fill="url(#harari-star-grad)" transform="rotate(45)" opacity="0.7" />
        <circle r="10" fill="#5B2A86" />
        <circle r="6" fill="#D4A537" />
      </g>
    </svg>
  )
}

export function HarariBorder({ className = '' }: { className?: string }) {
  // Horizontal decorative divider with central star motif
  return (
    <div className={`flex items-center justify-center gap-3 my-4 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4A537] to-[#D4A537]" />
      <div className="h-2 w-2 rotate-45 bg-[#5B2A86]" />
      <HarariStar size={20} />
      <div className="h-2 w-2 rotate-45 bg-[#B5471A]" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent via-[#D4A537] to-[#D4A537]" />
    </div>
  )
}

export function HarariGeoPattern({ className = '', opacity = 1 }: { className?: string; opacity?: number }) {
  // SVG-based Islamic geometric pattern (8-fold) for backgrounds
  return (
    <svg
      className={className}
      style={{ opacity }}
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="harari-pat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z"
            fill="none"
            stroke="#D4A537"
            strokeWidth="1"
          />
          <circle cx="20" cy="20" r="3" fill="#D4A537" />
          <path d="M0,0 L40,40 M40,0 L0,40" stroke="#D4A537" strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#harari-pat)" />
    </svg>
  )
}

export function HarariCorner({ className = '', size = 80 }: { className?: string; size?: number }) {
  // Corner ornament used on hero cards
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} aria-hidden="true">
      <g fill="none" stroke="#D4A537" strokeWidth="1.5">
        <path d="M0,0 L80,0 L80,80" />
        <path d="M10,10 L70,10 L70,70" opacity="0.6" />
        <path d="M20,20 L60,20 L60,60" opacity="0.4" />
        <path d="M0,0 Q40,0 40,40 Q40,80 0,80" />
        <circle cx="40" cy="40" r="3" fill="#D4A537" stroke="none" />
      </g>
    </svg>
  )
}

export function HarariArch({ className = '' }: { className?: string }) {
  // Pointed-arch shape used in Harari architecture
  return (
    <svg viewBox="0 0 200 100" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,100 L0,40 Q0,0 100,0 Q200,0 200,40 L200,100 Z"
        fill="currentColor"
      />
    </svg>
  )
}
