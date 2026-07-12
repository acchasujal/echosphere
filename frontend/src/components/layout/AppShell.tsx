import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Fixed Sidebar: 240px width, 1px right border, zero shadow (flat enterprise look) */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Topbar: 56px height for maximum density */}
        <Topbar />
        
        {/* Main Content Area: Scrollable, padded */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30 animate-fade-in">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
