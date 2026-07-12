import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Overview</h1>
      <p className="text-xs text-muted-foreground mt-0.5">Corporate sustainability and ESG performance metrics.</p>
      <div className="p-6 bg-card border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Dashboard content loading...</p>
      </div>
    </div>
  );
};
