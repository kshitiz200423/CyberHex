import React from 'react';

interface HexLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const HexLogo: React.FC<HexLogoProps> = ({ size = 40, className = '', animated = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer hex */}
      <div
        className={`absolute inset-0 hex-clip bg-accent ${animated ? 'animate-pulse-slow' : ''}`}
        style={{ width: size, height: size }}
      />
      {/* Inner hex cutout */}
      <div
        className="absolute hex-clip bg-bg"
        style={{
          width: size * 0.55,
          height: size * 0.55,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Inner glow dot */}
      <div
        className="absolute rounded-full bg-accent"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
        }}
      />
    </div>
  );
};

export default HexLogo;
