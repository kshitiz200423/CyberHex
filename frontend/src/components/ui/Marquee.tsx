import React from 'react';

interface MarqueeProps {
  items: string[];
  speed?: number;
  separator?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  speed = 28,
  separator = '⬡',
}) => {
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border bg-bg-2/30 py-3">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg to-transparent z-10" />

      <div
        className="marquee-track"
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicated.map((item, i) => (
          <React.Fragment key={i}>
            <span className="mono-label text-[11px] whitespace-nowrap px-4 text-text-2">
              {item}
            </span>
            <span className="text-accent/40 text-xs px-2">{separator}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
