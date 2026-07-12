import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; loading?: boolean }
>(({ className = '', variant = 'primary', loading = false, disabled, children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    ghost: "hover:bg-secondary hover:text-foreground text-muted-foreground"
  };

  return (
    <button 
      ref={ref} 
      disabled={disabled || loading} 
      className={`${base} ${variants[variant]} ${className}`} 
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
