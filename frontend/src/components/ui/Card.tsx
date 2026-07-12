import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-card border border-border rounded-lg shadow-xs p-5 transition-all duration-200 hover:shadow-sm ${className}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1 pb-4 ${className}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3 ref={ref} className={`text-sm font-medium text-muted-foreground tracking-wide ${className}`} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const StatCard: React.FC<{ title: string; value: string; delta?: string; positive?: boolean }> = ({ title, value, delta, positive }) => (
  <Card className="p-4 flex flex-col gap-2 transition-all duration-200 hover:translate-y-[-2px] hover:border-primary/20">
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-bold text-foreground tabular-nums font-mono">{value}</span>
      {delta && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {positive ? '↑' : '↓'} {delta}
        </span>
      )}
    </div>
  </Card>
);
