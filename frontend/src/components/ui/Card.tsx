import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-card border border-border rounded-lg shadow-xs p-5 ${className}`}
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
  <Card className="p-4 flex flex-col gap-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-foreground tabular-nums font-mono">{value}</span>
      {delta && (
        <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {positive ? '↑' : '↓'} {delta}
        </span>
      )}
    </div>
  </Card>
);
