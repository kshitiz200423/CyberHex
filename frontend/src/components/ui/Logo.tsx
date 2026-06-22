import React from 'react';

interface LogoProps {
  /** Height in pixels (width scales automatically) */
  size?: number;
  /** Show company name text next to logo */
  showText?: boolean;
  /** Custom className */
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, showText = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img
      src="/assets/logo.png"
      alt="Auronix Technologies"
      height={size}
      style={{ height: size, width: 'auto' }}
      className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
    />
    {showText && (
      <div className="flex flex-col">
        <span className="font-display text-lg font-bold text-text leading-tight">
          AURONIX
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-text-3 -mt-0.5">
          TECHNOLOGIES
        </span>
      </div>
    )}
  </div>
);

export default Logo;
