As Lead Product Designer and Senior Frontend Engineer, I have reviewed the existing architecture (`AGENTS.md`, `API_SPEC.md`, `TASKS.md`). Note that `TASKS.md` mentions a "Glassmorphic Sidebar"—we are explicitly rejecting that. We are building an enterprise-grade, dense, professional SaaS interface inspired by Linear, Stripe, and Vercel. 

To achieve this, we will configure Tailwind CSS and shadcn/ui with a strict design token system. 

Here is the production-ready design system and layout shell.

### 1. Design Language & Tokens (`index.css`)

We use CSS variables mapped to HSL values for absolute control and seamless dark mode capability. This eliminates "random colors" and ensures a consistent, dense, enterprise feel.

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Core Neutral Palette (Cool Slate) */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 155 65% 25%;

    /* Brand: Deep Forest Green (Professional, Sustainable, Trustworthy) */
    --primary: 155 64% 20%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 155 64% 16%;

    /* Accents & States */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    
    /* Enterprise Surface Elevations */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1, "ss01" 1;
    -webkit-font-smoothing: antialiased;
  }
}
```

### 2. Tailwind Configuration (`tailwind.config.ts`)

This configuration enforces our typography scale, tight spacing, and strict radius rules. We use small radii (`6px`) for a sharp, professional look rather than bubbly Material UI curves.

```typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], /* For data/scores */
      },
      borderRadius: {
        lg: 'var(--radius)', /* 8px */
        md: 'calc(var(--radius) - 2px)', /* 6px */
        sm: 'calc(var(--radius) - 4px)', /* 4px */
      },
      /* Enterprise density: tighter spacing options */
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
      },
      /* Minimal, layered shadows */
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.02)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

### 3. Reusable Layout Shell (`AppShell.tsx`)

A dense, fixed sidebar and sticky topbar. This layout guarantees zero layout shift and maximizes screen real estate for data tables and charts.

```tsx
// frontend/src/components/layout/AppShell.tsx
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
```

### 4. Sidebar Component (`Sidebar.tsx`)

Clean, monochrome navigation with subtle hover states. Icons are `lucide-react`.

```tsx
// frontend/src/components/layout/Sidebar.tsx
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
```

### 5. Topbar Component (`Topbar.tsx`)

Includes breadcrumbs and a global command/search input (UI only for now).

```tsx
// frontend/src/components/layout/Topbar.tsx
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
```

### 6. Core Reusable Components

These are the building blocks for all pages. They enforce dense, data-driven layouts.

#### A. Card & StatCard (`Card.tsx`)
No shadows, just 1px borders. Clean and flat.

```tsx
// frontend/src/components/ui/Card.tsx
import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className="bg-card border border-border rounded-lg shadow-xs p-5"
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className="flex flex-col space-y-1 pb-4" {...props} />
  )
);

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className="text-sm font-medium text-muted-foreground tracking-wide" {...props} />
  )
);

export const StatCard: React.FC<{ title: string; value: string; delta?: string; positive?: boolean }> = ({ title, value, delta, positive }) => (
  <Card className="p-4 flex flex-col gap-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-foreground tabular-nums">{value}</span>
      {delta && (
        <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {positive ? '↑' : '↓'} {delta}
        </span>
      )}
    </div>
  </Card>
);
```

#### B. Dense Data Table (`DataTable.tsx`)
Enterprise tables require tight padding, precise alignment, and monospaced numbers.

```tsx
// frontend/src/components/ui/DataTable.tsx
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const DataTable: React.FC<{ columns: Column<any>[]; data: any[] }> = ({ columns, data }) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-2.5 text-foreground 
                      ${col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'}
                      ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

#### C. Button & Input (`Button.tsx`, `Input.tsx`)
Forms need to be compact and perfectly aligned.

```tsx
// frontend/src/components/ui/Button.tsx
import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const base = "inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    ghost: "hover:bg-secondary hover:text-foreground text-muted-foreground"
  };

  return <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />;
});
Button.displayName = 'Button';

// frontend/src/components/ui/Input.tsx
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors
        file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:text-muted-foreground
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';
```

#### D. Skeletons & Empty States (`Feedback.tsx`)
For resilience (as per `AGENTS.md`), we need graceful loading and fallback UI.

```tsx
// frontend/src/components/ui/Feedback.tsx
import React from 'react';
import { FileQuestion } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
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
```

#### E. Chart Wrapper (`ChartContainer.tsx`)
Recharts requires strict container dimensions to prevent overflow.

```tsx
// frontend/src/components/ui/ChartContainer.tsx
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
```

### Next Steps for Execution
With this design system in place, the frontend team can now build feature pages. Every page will simply import `Card`, `DataTable`, `Button`, and `Input` from the `ui` directory. 

If an API fails, wrap the data container in an error boundary or conditional that falls back to `<EmptyState title="Data unavailable" description="..." />`. This guarantees the application never crashes during the Odoo demo.