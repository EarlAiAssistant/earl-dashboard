// ============================================================
// Error boundary — catches React render errors gracefully
// ============================================================

'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback when error is caught */
  fallback?: ReactNode;
  /** Section name for better error messages */
  section?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.section ? `: ${this.props.section}` : ''}]`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center" role="alert">
          <AlertCircle className="h-10 w-10 text-destructive/50 mb-3" />
          <h3 className="text-base font-semibold mb-1">
            {this.props.section ? `${this.props.section} failed to load` : 'Something went wrong'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred. Try refreshing.'}
          </p>
          <Button variant="outline" size="sm" onClick={this.handleRetry}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
