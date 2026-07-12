import React from 'react';
import { Search, Bell } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium">Overview</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-9 pl-9 pr-3 text-sm bg-muted rounded-md border border-transparent focus:border-border focus:bg-card focus:outline-none transition-all"
          />
        </div>
        <button className="relative p-2 rounded-md hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">
          BR
        </div>
      </div>
    </header>
  );
};
