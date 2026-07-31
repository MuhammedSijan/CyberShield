import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
