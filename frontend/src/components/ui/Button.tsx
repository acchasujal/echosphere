import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' }
>(({ className = '', variant = 'primary', ...props }, ref) => {
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
