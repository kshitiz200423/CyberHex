import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: string;
  features?: string[];
  href?: string;
  index?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  accentColor = 'accent',
  features = [],
  href = '#',
  index = 0,
}) => {
  return (
    <a
      href={href}
      className="group card card-hover relative overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Glow effect on hover */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
        style={{ background: `radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
          <span className="text-accent text-xl">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-text-2 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Features list */}
        {features.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-text-3">
                <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Arrow link */}
        <div className="flex items-center gap-1 text-accent text-xs font-mono uppercase tracking-wider mt-auto">
          <span>Learn more</span>
          <svg
            className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </a>
  );
};

export default ServiceCard;
