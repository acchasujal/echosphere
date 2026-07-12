import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const routeLabels: Record<string, { section: string; page: string }> = {
  '/': { section: 'Dashboard', page: 'Overview' },
  '/carbon': { section: 'Environment', page: 'Carbon Tracking' },
  '/csr': { section: 'Social', page: 'CSR & Social' },
  '/policies': { section: 'Governance', page: 'Policies & Compliance' },
  '/rewards': { section: 'Gamification', page: 'Rewards & Leaderboard' },
};

export const Topbar: React.FC = () => {
  const { pathname } = useLocation();
  const label = routeLabels[pathname] ?? { section: 'EcoSphere', page: 'Page' };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label.section}</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium">{label.page}</span>
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
        <button className="relative p-2 rounded-md hover:bg-secondary transition-colors" title="Notifications">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
          ES
        </div>
      </div>
    </header>
  );
};
