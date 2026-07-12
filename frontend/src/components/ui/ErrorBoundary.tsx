import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-destructive">Something went wrong</h2>
          <p className="text-xs text-muted-foreground font-mono">
            {this.state.error?.message || "An unexpected error occurred in this view."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="self-start text-xs font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
