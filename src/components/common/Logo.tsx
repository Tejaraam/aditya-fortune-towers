import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', dark = false }) => {
  const dimensions = {
    sm: { h: 'h-10', text: 'text-lg', sub: 'text-[9px]' },
    md: { h: 'h-13', text: 'text-2xl', sub: 'text-[11px]' },
    lg: { h: 'h-16', text: 'text-3xl', sub: 'text-xs' },
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Insignia Icon */}
      <div className={`relative flex items-center justify-center shrink-0 aspect-square ${dimensions[size].h}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Background Shield/Hexagon */}
          <polygon
            points="50,5 90,25 90,75 50,95 10,75 10,25"
            className={dark ? 'fill-slate-800 stroke-amber-400' : 'fill-slate-900 stroke-amber-500'}
            strokeWidth="3"
          />

          {/* Center Royal Tower Grid Motif */}
          <path
            d="M32,70 L32,45 L42,45 L42,70 Z M46,70 L46,30 L54,30 L54,70 Z M58,70 L58,45 L68,45 L68,70 Z"
            fill="url(#goldGrad)"
          />

          {/* Tower spires & elegant arches */}
          <polygon points="50,15 46,30 54,30" fill="url(#goldGrad)" />
          <polygon points="37,35 32,45 42,45" fill="#FBCFE8" opacity="0.8" />
          <polygon points="63,35 58,45 68,45" fill="#FBCFE8" opacity="0.8" />

          {/* Tiny glowing windows */}
          <rect x="48" y="38" width="4" height="6" fill="#FFF" />
          <rect x="48" y="48" width="4" height="6" fill="#FFF" />
          <rect x="48" y="58" width="4" height="6" fill="#FFF" />
          
          <rect x="35" y="52" width="4" height="5" fill="#FFF" opacity="0.9" />
          <rect x="35" y="60" width="4" height="5" fill="#FFF" opacity="0.9" />

          <rect x="61" y="52" width="4" height="5" fill="#FFF" opacity="0.9" />
          <rect x="61" y="60" width="4" height="5" fill="#FFF" opacity="0.9" />

          {/* Golden base wreath / underline */}
          <path d="M25,78 Q50,88 75,78" fill="none" stroke="url(#goldGrad)" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <span className={`font-outfit font-extrabold tracking-wider leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
          ADITYA
        </span>
        <span className={`font-outfit font-semibold tracking-widest text-amber-500 uppercase ${dimensions[size].sub} mt-1`}>
          FORTUNE TOWERS
        </span>
        <span className={`tracking-widest text-slate-400 font-medium uppercase text-[9px] -mt-0.5`}>
          Visakhapatnam
        </span>
      </div>
    </div>
  );
};
