import React from 'react';

export const ChartContainer: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {action}
    </div>
    <div className="h-72 w-full">
      {children}
    </div>
  </div>
);
