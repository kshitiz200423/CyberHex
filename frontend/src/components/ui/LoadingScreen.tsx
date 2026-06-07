import React from 'react';
import HexLogo from './HexLogo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center gap-6">
      {/* Hex spinner */}
      <div className="relative">
        <div className="animate-spin" style={{ animationDuration: '3s' }}>
          <HexLogo size={64} />
        </div>
        {/* Pulsing ring */}
        <div
          className="absolute inset-0 hex-clip border-2 border-accent/20 animate-ping"
          style={{
            width: 80,
            height: 80,
            top: -8,
            left: -8,
            animationDuration: '2s',
          }}
        />
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm text-accent uppercase tracking-[0.3em]">
          HEXASHIELD
        </p>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
