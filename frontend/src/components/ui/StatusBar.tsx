import React from 'react';

interface StatusBarProps {
  items?: Array<{ label: string; status: 'operational' | 'degraded' | 'down' }>;
}

const defaultItems = [
  { label: 'SOC MONITORING', status: 'operational' as const },
  { label: 'THREAT INTEL', status: 'operational' as const },
  { label: 'API STATUS', status: 'operational' as const },
  { label: 'CLIENT PORTAL', status: 'operational' as const },
];

const statusColors = {
  operational: 'bg-brand-green',
  degraded: 'bg-brand-amber',
  down: 'bg-brand-red',
};

const StatusBar: React.FC<StatusBarProps> = ({ items = defaultItems }) => {
  return (
    <div className="w-full border-b border-border bg-bg-2/50 backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between py-2 overflow-x-auto">
          <div className="flex items-center gap-6">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors[item.status]} animate-pulse-slow`} />
                <span className="mono-label text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="mono-label text-[10px] text-brand-green">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
