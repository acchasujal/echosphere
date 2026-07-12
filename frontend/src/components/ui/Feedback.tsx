import React from 'react';
import { FileQuestion } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-lg bg-card">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <FileQuestion className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
    <p className="text-xs text-muted-foreground max-w-sm mb-4">{description}</p>
    {action}
  </div>
);
