import React from 'react';
import Logo from './Logo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center gap-6">
      {/* Logo spinner */}
      <div className="relative">
        <div className="animate-pulse" style={{ animationDuration: '2s' }}>
          <Logo size={72} />
        </div>
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm text-accent uppercase tracking-[0.3em]">
          AURONIX
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
