import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Leaf, Users, ShieldCheck, Award, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Carbon Tracking', path: '/carbon', icon: Leaf },
  { name: 'CSR & Social', path: '/csr', icon: Users },
  { name: 'Governance', path: '/policies', icon: ShieldCheck },
  { name: 'Gamification', path: '/rewards', icon: Award },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">EcoSphere</span>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-secondary/50 hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>
    </aside>
  );
};
